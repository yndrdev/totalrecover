-- =============================================
-- Chat and Messaging Tables
-- =============================================

-- =============================================
-- CHAT_CONVERSATIONS TABLE - Chat threads between patients and providers
-- =============================================
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('patient_support', 'medical_consultation', 'recovery_coaching')) DEFAULT 'patient_support',
    status conversation_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}', -- Additional conversation metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CHAT_MESSAGES TABLE - Individual chat messages
-- =============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('patient', 'provider', 'ai_assistant', 'system')) NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'form', 'video', 'task_completion', 'system_notification')) DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB, -- Message-specific metadata (form data, video info, etc.)
    attachments JSONB[] DEFAULT '{}', -- Array of attachment objects
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to chat_messages
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Chat/Messaging Tables
-- =============================================

-- Chat_conversations indexes
CREATE INDEX idx_chat_conversations_patient_id ON chat_conversations(patient_id);
CREATE INDEX idx_chat_conversations_provider_id ON chat_conversations(provider_id);
CREATE INDEX idx_chat_conversations_tenant_id ON chat_conversations(tenant_id);
CREATE INDEX idx_chat_conversations_type ON chat_conversations(type);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX idx_chat_conversations_created_at ON chat_conversations(created_at);

-- Chat_messages indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_sender_type ON chat_messages(sender_type);
CREATE INDEX idx_chat_messages_message_type ON chat_messages(message_type);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_read_at ON chat_messages(read_at);

-- Compound indexes for common queries
CREATE INDEX idx_chat_messages_conversation_created ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_conversations_patient_status ON chat_conversations(patient_id, status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on chat tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat_conversations RLS Policies
CREATE POLICY "Patients can view their own conversations" ON chat_conversations
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view conversations in their tenant" ON chat_conversations
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Providers can create conversations in their tenant" ON chat_conversations
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Providers can update conversations in their tenant" ON chat_conversations
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    );

-- Chat_messages RLS Policies
CREATE POLICY "Patients can view messages in their conversations" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Providers can view messages in their tenant conversations" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON chat_messages
    FOR INSERT WITH CHECK (
        -- Patient can insert in their own conversations
        (conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE patient_id IN (
                SELECT id FROM patients 
                WHERE user_id = auth.uid()
            )
        ) AND sender_id = auth.uid())
        OR
        -- Provider can insert in tenant conversations
        (conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        ) AND sender_id = auth.uid())
    );

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (sender_id = auth.uid());

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to create conversation between patient and provider
CREATE OR REPLACE FUNCTION create_conversation(
    p_patient_id UUID,
    p_provider_id UUID DEFAULT NULL,
    p_type TEXT DEFAULT 'patient_support',
    p_initial_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    tenant_id UUID;
BEGIN
    -- Get tenant_id from patient
    SELECT p.tenant_id INTO tenant_id
    FROM patients p
    WHERE p.id = p_patient_id;
    
    -- Create conversation
    INSERT INTO chat_conversations (patient_id, provider_id, tenant_id, type)
    VALUES (p_patient_id, p_provider_id, tenant_id, p_type)
    RETURNING id INTO conversation_id;
    
    -- Add initial message if provided
    IF p_initial_message IS NOT NULL THEN
        INSERT INTO chat_messages (
            conversation_id, 
            sender_id, 
            sender_type, 
            content
        ) VALUES (
            conversation_id,
            COALESCE(p_provider_id, (SELECT user_id FROM patients WHERE id = p_patient_id)),
            CASE WHEN p_provider_id IS NOT NULL THEN 'provider' ELSE 'patient' END,
            p_initial_message
        );
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send message
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type TEXT DEFAULT 'text',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    sender_type_val TEXT;
BEGIN
    -- Determine sender type based on user role
    SELECT 
        CASE 
            WHEN u.role = 'patient' THEN 'patient'
            WHEN u.role IN ('provider', 'nurse') THEN 'provider'
            ELSE 'system'
        END INTO sender_type_val
    FROM users u
    WHERE u.id = p_sender_id;
    
    -- Insert message
    INSERT INTO chat_messages (
        conversation_id,
        sender_id,
        sender_type,
        message_type,
        content,
        metadata
    ) VALUES (
        p_conversation_id,
        p_sender_id,
        sender_type_val,
        p_message_type,
        p_content,
        p_metadata
    ) RETURNING id INTO message_id;
    
    -- Update conversation updated_at
    UPDATE chat_conversations 
    SET updated_at = NOW() 
    WHERE id = p_conversation_id;
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE chat_messages 
    SET read_at = NOW() 
    WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND read_at IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation with latest message
CREATE OR REPLACE FUNCTION get_conversations_with_latest_message(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    conversation_id UUID,
    patient_name TEXT,
    provider_name TEXT,
    conversation_type TEXT,
    conversation_status TEXT,
    latest_message TEXT,
    latest_message_at TIMESTAMPTZ,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
        prov_user.full_name as provider_name,
        c.type,
        c.status::TEXT,
        latest_msg.content,
        latest_msg.created_at,
        COALESCE(unread_counts.count, 0) as unread_count
    FROM chat_conversations c
    JOIN patients pat ON pat.id = c.patient_id
    LEFT JOIN providers prov ON prov.id = c.provider_id
    LEFT JOIN users prov_user ON prov_user.id = prov.user_id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM chat_messages cm
        WHERE cm.conversation_id = c.id
        ORDER BY cm.created_at DESC
        LIMIT 1
    ) latest_msg ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as count
        FROM chat_messages cm
        WHERE cm.conversation_id = c.id
        AND cm.sender_id != p_user_id
        AND cm.read_at IS NULL
    ) unread_counts ON true
    WHERE (
        -- User is the patient
        pat.user_id = p_user_id
        OR
        -- User is the assigned provider
        prov.user_id = p_user_id
        OR
        -- User is provider/admin in same tenant
        c.tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE id = p_user_id 
            AND role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    )
    ORDER BY latest_msg.created_at DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE chat_conversations IS 'Chat threads between patients and providers';
COMMENT ON COLUMN chat_conversations.type IS 'Type of conversation: patient_support, medical_consultation, recovery_coaching';
COMMENT ON COLUMN chat_conversations.metadata IS 'Additional conversation metadata (protocol context, etc.)';

COMMENT ON TABLE chat_messages IS 'Individual chat messages within conversations';
COMMENT ON COLUMN chat_messages.sender_type IS 'Type of sender: patient, provider, ai_assistant, system';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, form, video, task_completion, system_notification';
COMMENT ON COLUMN chat_messages.metadata IS 'Message-specific metadata (form data, video info, etc.)';
COMMENT ON COLUMN chat_messages.attachments IS 'Array of attachment objects';