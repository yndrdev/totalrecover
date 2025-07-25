-- =============================================
-- Foundation Tables: Tenants and Users
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('patient', 'provider', 'nurse', 'admin', 'super_admin');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'overdue');
CREATE TYPE protocol_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'escalated');

-- =============================================
-- TENANTS TABLE - Multi-tenant architecture foundation
-- =============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    subscription_plan TEXT CHECK (subscription_plan IN ('trial', 'basic', 'professional', 'enterprise')) DEFAULT 'trial',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- USERS TABLE - Extends auth.users with healthcare-specific data
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'patient',
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Foundation Tables
-- =============================================

-- Tenants indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);

-- Users indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Tenants RLS Policies
CREATE POLICY "Super admins can view all tenants" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Admins can view their tenant" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Super admins can insert tenants" ON tenants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update tenants" ON tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Users RLS Policies
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their tenant" ON users
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update users in their tenant" ON users
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user context for RLS
CREATE OR REPLACE FUNCTION set_user_context(user_id UUID, tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, true);
    PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE tenants IS 'Multi-tenant organizations (healthcare practices, hospital systems)';
COMMENT ON TABLE users IS 'User profiles extending auth.users with healthcare-specific data';
COMMENT ON COLUMN users.tenant_id IS 'References the tenant/organization this user belongs to';
COMMENT ON COLUMN users.role IS 'Healthcare role: patient, provider, nurse, admin, super_admin';