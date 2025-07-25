-- =============================================
-- Patient and Provider Tables
-- =============================================

-- =============================================
-- PATIENTS TABLE - Patient demographics and medical info
-- =============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    mrn TEXT NOT NULL, -- Medical Record Number
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    phone TEXT,
    email TEXT,
    address JSONB DEFAULT '{}', -- Structured address
    emergency_contact JSONB DEFAULT '{}', -- Emergency contact info
    medical_history JSONB DEFAULT '{}', -- Medical history and conditions
    insurance_info JSONB DEFAULT '{}', -- Insurance information
    preferred_language TEXT DEFAULT 'en',
    status TEXT CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, mrn) -- MRN unique within tenant
);

-- Add updated_at trigger to patients
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROVIDERS TABLE - Healthcare provider profiles
-- =============================================
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    npi TEXT, -- National Provider Identifier
    specialty TEXT NOT NULL,
    license_number TEXT,
    credentials TEXT[] DEFAULT '{}', -- Array of credentials (MD, RN, PT, etc.)
    is_primary_surgeon BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to providers
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Patient/Provider Tables
-- =============================================

-- Patients indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_patients_practice_id ON patients(practice_id);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_date_of_birth ON patients(date_of_birth);

-- Providers indexes
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_tenant_id ON providers(tenant_id);
CREATE INDEX idx_providers_practice_id ON providers(practice_id);
CREATE INDEX idx_providers_npi ON providers(npi);
CREATE INDEX idx_providers_specialty ON providers(specialty);
CREATE INDEX idx_providers_is_primary_surgeon ON providers(is_primary_surgeon);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on patient and provider tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Patients RLS Policies
CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Providers can view patients in their tenant" ON patients
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can insert patients in their tenant" ON patients
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Providers and admins can update patients in their tenant" ON patients
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Patients can update their own profile" ON patients
    FOR UPDATE USING (user_id = auth.uid());

-- Providers RLS Policies
CREATE POLICY "Users can view providers in their tenant" ON providers
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Providers can view their own data" ON providers
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Admins can insert providers in their tenant" ON providers
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update providers in their tenant" ON providers
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Providers can update their own profile" ON providers
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get patient's current protocol status
CREATE OR REPLACE FUNCTION get_patient_current_protocol(patient_id UUID)
RETURNS TABLE (
    protocol_id UUID,
    protocol_name TEXT,
    surgery_date DATE,
    current_day INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.protocol_id,
        p.name as protocol_name,
        pp.surgery_date::DATE,
        (CURRENT_DATE - pp.surgery_date::DATE)::INTEGER as current_day,
        pp.status
    FROM patient_protocols pp
    JOIN protocols p ON p.id = pp.protocol_id
    WHERE pp.patient_id = get_patient_current_protocol.patient_id
    AND pp.status = 'active'
    ORDER BY pp.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access patient data
CREATE OR REPLACE FUNCTION can_access_patient(patient_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tenant UUID;
    patient_tenant UUID;
    user_role_val user_role;
BEGIN
    -- Get user's tenant and role
    SELECT tenant_id, role INTO user_tenant, user_role_val
    FROM users WHERE id = user_id;
    
    -- Get patient's tenant
    SELECT tenant_id INTO patient_tenant
    FROM patients WHERE id = patient_id;
    
    -- Check if user is the patient themselves
    IF EXISTS (SELECT 1 FROM patients WHERE id = patient_id AND user_id = user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is provider/admin in same tenant
    IF user_tenant = patient_tenant AND user_role_val IN ('provider', 'nurse', 'admin', 'super_admin') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE patients IS 'Patient demographics and medical information';
COMMENT ON COLUMN patients.mrn IS 'Medical Record Number - unique within tenant';
COMMENT ON COLUMN patients.address IS 'Structured address JSON';
COMMENT ON COLUMN patients.emergency_contact IS 'Emergency contact information JSON';
COMMENT ON COLUMN patients.medical_history IS 'Medical history, conditions, allergies JSON';
COMMENT ON COLUMN patients.insurance_info IS 'Insurance information JSON';

COMMENT ON TABLE providers IS 'Healthcare provider profiles and credentials';
COMMENT ON COLUMN providers.npi IS 'National Provider Identifier';
COMMENT ON COLUMN providers.credentials IS 'Array of credentials (MD, RN, PT, etc.)';
COMMENT ON COLUMN providers.is_primary_surgeon IS 'Indicates if provider performs surgeries';