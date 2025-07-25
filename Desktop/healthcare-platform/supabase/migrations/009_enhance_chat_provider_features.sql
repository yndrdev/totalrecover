-- =============================================
-- Enhanced Chat Provider Features Migration
-- =============================================
-- This migration adds provider tracking, message status, typing indicators,
-- and other features needed for comprehensive patient-provider communication

-- Add new columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('ai', 'provider', 'patient', 'system')) DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Create provider_patient_assignments table
CREATE TABLE IF NOT EXISTS provider_patient_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assignment_type TEXT CHECK (assignment_type IN ('primary', 'secondary', 'on_call', 'temporary')) DEFAULT 'primary',
    status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    unassigned_at TIMESTAMPTZ,
    unassigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, patient_id, assignment_type)
);

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create message_read_receipts table for tracking individual message reads
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_chat_messages_source ON chat_messages(source);
CREATE INDEX IF NOT EXISTS idx_chat_messages_provider_id ON chat_messages(provider_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_priority ON chat_messages(priority);
CREATE INDEX IF NOT EXISTS idx_chat_messages_delivered_at ON chat_messages(delivered_at);

-- Add indexes for provider_patient_assignments
CREATE INDEX IF NOT EXISTS idx_provider_patient_assignments_provider_id ON provider_patient_assignments(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_patient_assignments_patient_id ON provider_patient_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_provider_patient_assignments_tenant_id ON provider_patient_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_provider_patient_assignments_status ON provider_patient_assignments(status);
CREATE INDEX IF NOT EXISTS idx_provider_patient_assignments_assignment_type ON provider_patient_assignments(assignment_type);

-- Add indexes for typing_indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_updated_at ON typing_indicators(updated_at);

-- Add indexes for message_read_receipts
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_provider_patient_assignments_updated_at BEFORE UPDATE ON provider_patient_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_typing_indicators_updated_at BEFORE UPDATE ON typing_indicators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE provider_patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_patient_assignments
CREATE POLICY "Providers can view their assignments" ON provider_patient_assignments
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM providers 
            WHERE user_id = auth.uid()
        )
        OR
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage assignments in their tenant" ON provider_patient_assignments
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their conversations" ON typing_indicators
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations 
            WHERE patient_id IN (
                SELECT id FROM patients WHERE user_id = auth.uid()
            )
            OR
            id IN (
                SELECT conversation_id FROM chat_messages 
                WHERE sender_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts for their messages" ON message_read_receipts
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM chat_messages WHERE sender_id = auth.uid()
        )
        OR
        user_id = auth.uid()
    );

CREATE POLICY "Users can create their own read receipts" ON message_read_receipts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Helper function to assign provider to patient
CREATE OR REPLACE FUNCTION assign_provider_to_patient(
    p_provider_id UUID,
    p_patient_id UUID,
    p_assignment_type TEXT DEFAULT 'primary',
    p_assigned_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get tenant_id from patient
    SELECT tenant_id INTO v_tenant_id
    FROM patients
    WHERE id = p_patient_id;
    
    -- Deactivate existing assignments of the same type
    UPDATE provider_patient_assignments
    SET status = 'inactive',
        unassigned_at = NOW(),
        unassigned_by = COALESCE(p_assigned_by, auth.uid())
    WHERE patient_id = p_patient_id
    AND assignment_type = p_assignment_type
    AND status = 'active';
    
    -- Create new assignment
    INSERT INTO provider_patient_assignments (
        provider_id,
        patient_id,
        tenant_id,
        assignment_type,
        assigned_by,
        notes
    ) VALUES (
        p_provider_id,
        p_patient_id,
        v_tenant_id,
        p_assignment_type,
        COALESCE(p_assigned_by, auth.uid()),
        p_notes
    ) RETURNING id INTO assignment_id;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced send_message function with provider tracking
CREATE OR REPLACE FUNCTION send_provider_message(
    p_conversation_id UUID,
    p_provider_id UUID,
    p_content TEXT,
    p_message_type TEXT DEFAULT 'text',
    p_priority TEXT DEFAULT 'normal',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
    v_user_id UUID;
BEGIN
    -- Get user_id from provider
    SELECT user_id INTO v_user_id
    FROM providers
    WHERE id = p_provider_id;
    
    -- Insert message
    INSERT INTO chat_messages (
        conversation_id,
        sender_id,
        sender_type,
        source,
        provider_id,
        message_type,
        priority,
        content,
        metadata,
        delivered_at
    ) VALUES (
        p_conversation_id,
        v_user_id,
        'provider',
        'provider',
        p_provider_id,
        p_message_type,
        p_priority,
        p_content,
        p_metadata,
        NOW()
    ) RETURNING id INTO message_id;
    
    -- Update conversation
    UPDATE chat_conversations 
    SET updated_at = NOW(),
        provider_id = p_provider_id
    WHERE id = p_conversation_id;
    
    -- Log audit event for provider message
    PERFORM log_audit_event(
        'provider_message_sent',
        'chat_messages',
        message_id,
        jsonb_build_object(
            'conversation_id', p_conversation_id,
            'provider_id', p_provider_id,
            'priority', p_priority
        )
    );
    
    RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update typing indicator
CREATE OR REPLACE FUNCTION update_typing_indicator(
    p_conversation_id UUID,
    p_is_typing BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO typing_indicators (conversation_id, user_id, is_typing)
    VALUES (p_conversation_id, auth.uid(), p_is_typing)
    ON CONFLICT (conversation_id, user_id)
    DO UPDATE SET 
        is_typing = EXCLUDED.is_typing,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assigned providers for a patient
CREATE OR REPLACE FUNCTION get_patient_providers(
    p_patient_id UUID
)
RETURNS TABLE (
    provider_id UUID,
    provider_name TEXT,
    provider_role TEXT,
    assignment_type TEXT,
    assigned_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        u.full_name,
        p.role,
        ppa.assignment_type,
        ppa.assigned_at
    FROM provider_patient_assignments ppa
    JOIN providers p ON p.id = ppa.provider_id
    JOIN users u ON u.id = p.user_id
    WHERE ppa.patient_id = p_patient_id
    AND ppa.status = 'active'
    ORDER BY 
        CASE ppa.assignment_type 
            WHEN 'primary' THEN 1
            WHEN 'secondary' THEN 2
            WHEN 'on_call' THEN 3
            WHEN 'temporary' THEN 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM typing_indicators
    WHERE updated_at < NOW() - INTERVAL '30 seconds';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced conversation list with provider info and urgency
CREATE OR REPLACE FUNCTION get_provider_conversation_list(
    p_provider_id UUID,
    p_include_urgent_only BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    conversation_id UUID,
    patient_id UUID,
    patient_name TEXT,
    patient_mrn TEXT,
    conversation_type TEXT,
    conversation_status TEXT,
    latest_message TEXT,
    latest_message_at TIMESTAMPTZ,
    latest_message_priority TEXT,
    unread_count BIGINT,
    urgent_count BIGINT,
    is_assigned BOOLEAN,
    is_typing BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.patient_id,
        CONCAT(pat.first_name, ' ', pat.last_name) as patient_name,
        pat.mrn,
        c.type,
        c.status::TEXT,
        latest_msg.content,
        latest_msg.created_at,
        latest_msg.priority,
        COALESCE(unread_counts.count, 0) as unread_count,
        COALESCE(urgent_counts.count, 0) as urgent_count,
        EXISTS(
            SELECT 1 FROM provider_patient_assignments ppa
            WHERE ppa.provider_id = p_provider_id
            AND ppa.patient_id = c.patient_id
            AND ppa.status = 'active'
        ) as is_assigned,
        EXISTS(
            SELECT 1 FROM typing_indicators ti
            WHERE ti.conversation_id = c.id
            AND ti.is_typing = true
            AND ti.updated_at > NOW() - INTERVAL '30 seconds'
        ) as is_typing
    FROM chat_conversations c
    JOIN patients pat ON pat.id = c.patient_id
    LEFT JOIN LATERAL (
        SELECT content, created_at, priority
        FROM chat_messages cm
        WHERE cm.conversation_id = c.id
        ORDER BY cm.created_at DESC
        LIMIT 1
    ) latest_msg ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as count
        FROM chat_messages cm
        WHERE cm.conversation_id = c.id
        AND cm.sender_type = 'patient'
        AND cm.read_at IS NULL
    ) unread_counts ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as count
        FROM chat_messages cm
        WHERE cm.conversation_id = c.id
        AND cm.priority IN ('urgent', 'emergency')
        AND cm.read_at IS NULL
    ) urgent_counts ON true
    WHERE c.tenant_id IN (
        SELECT tenant_id FROM providers 
        WHERE id = p_provider_id
    )
    AND (NOT p_include_urgent_only OR urgent_counts.count > 0)
    ORDER BY 
        urgent_counts.count DESC NULLS LAST,
        latest_msg.created_at DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for new columns and tables
COMMENT ON COLUMN chat_messages.source IS 'Source of the message: ai, provider, patient, system';
COMMENT ON COLUMN chat_messages.provider_id IS 'ID of the provider who sent the message (if applicable)';
COMMENT ON COLUMN chat_messages.priority IS 'Message priority level: normal, urgent, emergency';
COMMENT ON COLUMN chat_messages.delivered_at IS 'Timestamp when message was delivered to recipient';
COMMENT ON COLUMN chat_messages.is_edited IS 'Whether the message has been edited';
COMMENT ON COLUMN chat_messages.edited_at IS 'Timestamp of last edit';

COMMENT ON TABLE provider_patient_assignments IS 'Tracks which providers are assigned to which patients';
COMMENT ON TABLE typing_indicators IS 'Real-time typing status for conversations';
COMMENT ON TABLE message_read_receipts IS 'Individual message read tracking';

-- Seed some test assignments if in development
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM tenants WHERE name = 'TJV Healthcare') THEN
        -- This is a development environment, add test assignments
        -- The actual seeding will depend on existing provider and patient IDs
        NULL; -- Placeholder for development seeding
    END IF;
END $$;