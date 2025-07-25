-- =============================================
-- Form Submission and Audit Tables
-- =============================================

-- =============================================
-- FORM_SUBMISSIONS TABLE - Patient form responses with signatures
-- =============================================
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_task_id UUID NOT NULL REFERENCES patient_tasks(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES content_forms(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL, -- Form field responses
    digital_signature JSONB, -- Digital signature data (if applicable)
    ip_address INET, -- IP address for audit trail
    user_agent TEXT, -- Browser/device info for audit trail
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to form_submissions
CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON form_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUDIT_LOGS TABLE - HIPAA compliance logging
-- =============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null for system actions
    action TEXT NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    resource_type TEXT NOT NULL, -- patients, protocols, messages, etc.
    resource_id UUID, -- ID of the affected resource
    resource_details JSONB, -- Additional details about the resource
    metadata JSONB DEFAULT '{}', -- Action-specific metadata
    ip_address INET, -- IP address for audit trail
    user_agent TEXT, -- Browser/device info
    session_id TEXT, -- Session identifier
    outcome TEXT CHECK (outcome IN ('success', 'failure', 'unauthorized')) DEFAULT 'success',
    error_details TEXT, -- Error details if outcome is failure
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for Form/Audit Tables
-- =============================================

-- Form_submissions indexes
CREATE INDEX idx_form_submissions_patient_task_id ON form_submissions(patient_task_id);
CREATE INDEX idx_form_submissions_patient_id ON form_submissions(patient_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at);

-- Audit_logs indexes
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_outcome ON audit_logs(outcome);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Compound indexes for common audit queries
CREATE INDEX idx_audit_logs_tenant_resource ON audit_logs(tenant_id, resource_type, created_at);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on form submission and audit tables
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Form_submissions RLS Policies
CREATE POLICY "Patients can view their own form submissions" ON form_submissions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view form submissions in their tenant" ON form_submissions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Patients can insert their own form submissions" ON form_submissions
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can insert form submissions in their tenant" ON form_submissions
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        )
    );

-- Audit_logs RLS Policies
CREATE POLICY "Admins can view audit logs in their tenant" ON audit_logs
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true); -- Allow system/trigger inserts

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- AUDIT TRIGGER FUNCTIONS
-- =============================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_tenant_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_resource_details JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_outcome TEXT DEFAULT 'success',
    p_error_details TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        resource_details,
        metadata,
        ip_address,
        user_agent,
        session_id,
        outcome,
        error_details
    ) VALUES (
        p_tenant_id,
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_resource_details,
        p_metadata,
        p_ip_address,
        p_user_agent,
        p_session_id,
        p_outcome,
        p_error_details
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    tenant_id_val UUID;
    user_id_val UUID;
    action_val TEXT;
    resource_details JSONB;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        action_val := 'CREATE';
        resource_details := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_val := 'UPDATE';
        resource_details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        action_val := 'DELETE';
        resource_details := to_jsonb(OLD);
    END IF;
    
    -- Get tenant_id (try multiple ways)
    IF TG_OP = 'DELETE' THEN
        tenant_id_val := COALESCE(OLD.tenant_id, 
            (SELECT tenant_id FROM users WHERE id = OLD.user_id LIMIT 1),
            (SELECT tenant_id FROM patients WHERE id = OLD.patient_id LIMIT 1));
    ELSE
        tenant_id_val := COALESCE(NEW.tenant_id, 
            (SELECT tenant_id FROM users WHERE id = NEW.user_id LIMIT 1),
            (SELECT tenant_id FROM patients WHERE id = NEW.patient_id LIMIT 1));
    END IF;
    
    -- Get current user
    user_id_val := auth.uid();
    
    -- Log the audit event
    PERFORM log_audit_event(
        tenant_id_val,
        user_id_val,
        action_val,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        resource_details,
        jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- AUDIT TRIGGERS FOR SENSITIVE TABLES
-- =============================================

-- Patient data access audit
CREATE TRIGGER audit_patients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Provider data access audit
CREATE TRIGGER audit_providers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON providers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Protocol assignment audit
CREATE TRIGGER audit_patient_protocols_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patient_protocols
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Task completion audit
CREATE TRIGGER audit_patient_tasks_trigger
    AFTER UPDATE ON patient_tasks
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.completion_date IS DISTINCT FROM NEW.completion_date)
    EXECUTE FUNCTION audit_trigger_function();

-- Form submission audit
CREATE TRIGGER audit_form_submissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON form_submissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Chat message audit (for HIPAA compliance)
CREATE TRIGGER audit_chat_messages_trigger
    AFTER INSERT OR DELETE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to submit form with validation
CREATE OR REPLACE FUNCTION submit_patient_form(
    p_patient_task_id UUID,
    p_form_data JSONB,
    p_digital_signature JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    submission_id UUID;
    patient_id_val UUID;
    form_id_val UUID;
    task_status_val task_status;
BEGIN
    -- Get patient_id and form_id from patient_task
    SELECT pt.patient_id, prt.id, pt.status
    INTO patient_id_val, form_id_val, task_status_val
    FROM patient_tasks pt
    JOIN protocol_tasks prt ON prt.id = pt.protocol_task_id
    WHERE pt.id = p_patient_task_id
    AND prt.type = 'form';
    
    -- Validate that task exists and is a form
    IF patient_id_val IS NULL THEN
        RAISE EXCEPTION 'Invalid patient task or not a form task';
    END IF;
    
    -- Validate that task is not already completed
    IF task_status_val = 'completed' THEN
        RAISE EXCEPTION 'Task is already completed';
    END IF;
    
    -- Insert form submission
    INSERT INTO form_submissions (
        patient_task_id,
        patient_id,
        form_id,
        submission_data,
        digital_signature,
        ip_address,
        user_agent
    ) VALUES (
        p_patient_task_id,
        patient_id_val,
        form_id_val,
        p_form_data,
        p_digital_signature,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO submission_id;
    
    -- Mark task as completed
    UPDATE patient_tasks 
    SET 
        status = 'completed',
        completion_date = NOW(),
        response_data = p_form_data,
        updated_at = NOW()
    WHERE id = p_patient_task_id;
    
    RETURN submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit trail for a resource
CREATE OR REPLACE FUNCTION get_audit_trail(
    p_resource_type TEXT,
    p_resource_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    audit_id UUID,
    action TEXT,
    user_name TEXT,
    user_role user_role,
    outcome TEXT,
    created_at TIMESTAMPTZ,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action,
        u.full_name,
        u.role,
        al.outcome,
        al.created_at,
        al.metadata
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    WHERE al.resource_type = p_resource_type
    AND al.resource_id = p_resource_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_retention_days INTEGER DEFAULT 2555 -- 7 years for HIPAA
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE form_submissions IS 'Patient form responses with digital signatures for HIPAA compliance';
COMMENT ON COLUMN form_submissions.submission_data IS 'Form field responses in JSON format';
COMMENT ON COLUMN form_submissions.digital_signature IS 'Digital signature data for form validation';
COMMENT ON COLUMN form_submissions.ip_address IS 'IP address for audit trail';
COMMENT ON COLUMN form_submissions.user_agent IS 'Browser/device info for audit trail';

COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit logging for all sensitive operations';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: CREATE, READ, UPDATE, DELETE, LOGIN, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource: patients, protocols, messages, etc.';
COMMENT ON COLUMN audit_logs.resource_details IS 'Details about the affected resource';
COMMENT ON COLUMN audit_logs.outcome IS 'success, failure, or unauthorized';