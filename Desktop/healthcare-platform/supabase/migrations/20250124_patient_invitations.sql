-- =============================================
-- Patient Invitations System
-- =============================================

-- =============================================
-- PATIENT_INVITATIONS TABLE - Track invitations sent to patients
-- =============================================
CREATE TABLE patient_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Invitation details
    invitation_token TEXT NOT NULL UNIQUE, -- Secure token for magic link
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Patient information (pre-registration)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    surgery_type TEXT,
    surgery_date DATE,
    custom_message TEXT, -- Optional personalized message from provider
    
    -- Status tracking
    status TEXT CHECK (status IN ('pending', 'sent', 'opened', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
    sent_via TEXT[] DEFAULT '{}', -- Array of delivery methods used: ['email', 'sms']
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Tracking info
    email_delivery_status JSONB DEFAULT '{}', -- Email provider response data
    sms_delivery_status JSONB DEFAULT '{}', -- SMS provider response data
    metadata JSONB DEFAULT '{}', -- Additional metadata
    
    -- User creation tracking
    created_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    created_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Add updated_at trigger
CREATE TRIGGER update_patient_invitations_updated_at BEFORE UPDATE ON patient_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX idx_patient_invitations_tenant_id ON patient_invitations(tenant_id);
CREATE INDEX idx_patient_invitations_provider_id ON patient_invitations(provider_id);
CREATE INDEX idx_patient_invitations_email ON patient_invitations(email);
CREATE INDEX idx_patient_invitations_token ON patient_invitations(invitation_token);
CREATE INDEX idx_patient_invitations_status ON patient_invitations(status);
CREATE INDEX idx_patient_invitations_expires_at ON patient_invitations(expires_at);
CREATE INDEX idx_patient_invitations_created_at ON patient_invitations(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================
ALTER TABLE patient_invitations ENABLE ROW LEVEL SECURITY;

-- Providers can view invitations they created
CREATE POLICY "Providers can view own invitations" ON patient_invitations
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM providers 
            WHERE user_id = auth.uid()
        )
    );

-- Admins can view all invitations in their tenant
CREATE POLICY "Admins can view tenant invitations" ON patient_invitations
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Providers can create invitations
CREATE POLICY "Providers can create invitations" ON patient_invitations
    FOR INSERT WITH CHECK (
        provider_id IN (
            SELECT id FROM providers 
            WHERE user_id = auth.uid()
        )
        AND
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

-- Providers can update their own invitations
CREATE POLICY "Providers can update own invitations" ON patient_invitations
    FOR UPDATE USING (
        provider_id IN (
            SELECT id FROM providers 
            WHERE user_id = auth.uid()
        )
    );

-- Anyone with a valid token can view the invitation (for acceptance flow)
CREATE POLICY "Public can view invitation by token" ON patient_invitations
    FOR SELECT USING (true); -- Will be filtered by token in application logic

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
BEGIN
    -- Generate a secure random token
    token := encode(gen_random_bytes(32), 'hex');
    RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if invitation is valid
CREATE OR REPLACE FUNCTION is_invitation_valid(token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record patient_invitations%ROWTYPE;
BEGIN
    SELECT * INTO invitation_record
    FROM patient_invitations
    WHERE invitation_token = token
    AND status IN ('pending', 'sent', 'opened')
    AND expires_at > NOW();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation and create patient user
CREATE OR REPLACE FUNCTION accept_patient_invitation(
    p_token TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    patient_id UUID
) AS $$
DECLARE
    v_invitation patient_invitations%ROWTYPE;
    v_user_id UUID;
    v_patient_id UUID;
    v_email TEXT;
BEGIN
    -- Get invitation details
    SELECT * INTO v_invitation
    FROM patient_invitations
    WHERE invitation_token = p_token
    AND status IN ('pending', 'sent', 'opened')
    AND expires_at > NOW()
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            FALSE, 
            'Invalid or expired invitation'::TEXT, 
            NULL::UUID, 
            NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_invitation.email;
    
    IF FOUND THEN
        -- User exists, check if patient record exists
        SELECT id INTO v_patient_id
        FROM patients
        WHERE user_id = v_user_id;
        
        IF FOUND THEN
            -- Update invitation status
            UPDATE patient_invitations
            SET status = 'accepted',
                accepted_at = NOW(),
                created_user_id = v_user_id,
                created_patient_id = v_patient_id
            WHERE id = v_invitation.id;
            
            RETURN QUERY SELECT 
                TRUE, 
                'Invitation accepted - existing patient'::TEXT, 
                v_user_id, 
                v_patient_id;
            RETURN;
        END IF;
    END IF;
    
    -- If we get here, we need to create the patient record
    -- (User creation will be handled by Supabase Auth in the application)
    
    -- Update invitation to mark as accepted
    UPDATE patient_invitations
    SET status = 'accepted',
        accepted_at = NOW()
    WHERE id = v_invitation.id;
    
    RETURN QUERY SELECT 
        TRUE, 
        'Invitation accepted - ready for registration'::TEXT, 
        v_invitation.id, -- Return invitation ID instead
        NULL::UUID;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE patient_invitations
    SET status = 'expired',
        updated_at = NOW()
    WHERE status IN ('pending', 'sent', 'opened')
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE patient_invitations IS 'Tracks patient invitations sent by providers';
COMMENT ON COLUMN patient_invitations.invitation_token IS 'Secure token for magic link authentication';
COMMENT ON COLUMN patient_invitations.sent_via IS 'Array of delivery methods: email, sms';
COMMENT ON COLUMN patient_invitations.custom_message IS 'Optional personalized message from provider';