-- =====================================================
-- MINIMAL SETUP FOR AUTHENTICATION TO WORK
-- This creates the essential tables needed for login to work
-- =====================================================

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'provider', 'admin', 'surgeon', 'nurse', 'physical_therapist')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  license_number TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  accepting_new_patients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create default tenant if it doesn't exist
INSERT INTO tenants (id, name, subdomain) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Tenant', 'default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) on tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow authenticated users to access their own data)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patient record" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own provider record" ON providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider record" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider record" ON providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view tenants
CREATE POLICY "Authenticated users can view tenants" ON tenants
  FOR SELECT USING (auth.role() = 'authenticated');

-- Success message
SELECT 'SUCCESS: Minimal authentication setup complete!' as message;
SELECT 'You can now register and login users!' as next_step;