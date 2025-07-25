-- =====================================================
-- COMPLETE SCHEMA FIX - ADD ALL MISSING COLUMNS
-- This will update your existing tables to be compatible with demo data
-- =====================================================

-- Fix tenants table - add all missing columns
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'practice' CHECK (tenant_type IN ('super_admin', 'practice', 'clinic'));

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id);

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise'));

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS max_patients INTEGER DEFAULT 100;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS max_providers INTEGER DEFAULT 10;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['chat', 'exercises', 'forms'];

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS billing_email TEXT;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS address JSONB;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Fix profiles table - add missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[];

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS license_number TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix patients table - add missing columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS medical_record_number TEXT;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS insurance_info JSONB;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS allergies TEXT[];

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS medications JSONB;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS primary_nurse_id UUID REFERENCES profiles(id);

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS physical_therapist_id UUID REFERENCES profiles(id);

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pre_surgery', 'active', 'completed', 'inactive'));

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing data to have proper values
UPDATE tenants SET tenant_type = 'practice' WHERE tenant_type IS NULL;
UPDATE tenants SET is_active = true WHERE is_active IS NULL;
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
UPDATE patients SET status = 'active' WHERE status IS NULL;

-- Verify the changes worked
SELECT 'tenants' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND table_schema = 'public'
UNION ALL
SELECT 'profiles', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'patients', COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'patients' AND table_schema = 'public';

