-- =============================================
-- Organization Tables: Practices
-- =============================================

-- =============================================
-- PRACTICES TABLE - Healthcare practices/organizations
-- =============================================
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address JSONB DEFAULT '{}', -- Structured address: street, city, state, zip, country
    phone TEXT,
    email TEXT,
    settings JSONB DEFAULT '{}', -- Practice-specific settings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to practices
CREATE TRIGGER update_practices_updated_at BEFORE UPDATE ON practices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Organization Tables
-- =============================================

-- Practices indexes
CREATE INDEX idx_practices_tenant_id ON practices(tenant_id);
CREATE INDEX idx_practices_name ON practices(name);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on practices
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Practices RLS Policies
CREATE POLICY "Users can view practices in their tenant" ON practices
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert practices in their tenant" ON practices
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update practices in their tenant" ON practices
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete practices in their tenant" ON practices
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE practices IS 'Healthcare practices/organizations within a tenant';
COMMENT ON COLUMN practices.address IS 'Structured address JSON: {street, city, state, zip, country}';
COMMENT ON COLUMN practices.settings IS 'Practice-specific configuration and preferences';