CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  domain TEXT,
  
  -- Hierarchy and Organization
  tenant_type TEXT DEFAULT 'practice' CHECK (tenant_type IN ('super_admin', 'practice', 'clinic')),
  parent_tenant_id UUID REFERENCES tenants(id),
  
  -- Settings and Configuration
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  max_patients INTEGER DEFAULT 100,
  max_providers INTEGER DEFAULT 10,
  features TEXT[] DEFAULT ARRAY['chat', 'exercises', 'forms'],
  
  -- Branding and Customization
  branding JSONB DEFAULT '{}',
  ai_training_data JSONB DEFAULT '{}',
  
  -- Contact and Billing
  billing_email TEXT,
  contact_phone TEXT,
  address JSONB,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
);

-- =====================================================
-- 2. USER MANAGEMENT WITH HIERARCHY
-- =====================================================