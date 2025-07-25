-- =====================================================
-- DEMO RESET SCRIPT - CLEAN SLATE FOR TESTING
-- ⚠️  WARNING: THIS DELETES ALL EXISTING DATA!
-- Use this to prepare for demo/testing
-- =====================================================

-- 1. CLEAN UP EXISTING DATA
-- =====================================================

-- Drop all existing tables first to avoid dependency issues
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS exercise_completions CASCADE;
DROP TABLE IF EXISTS content_engagement CASCADE;
DROP TABLE IF EXISTS patient_tasks CASCADE;
DROP TABLE IF EXISTS progress_metrics CASCADE;
DROP TABLE IF EXISTS conversation_activities CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS form_templates CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- 2. RESET DATABASE STRUCTURE
-- =====================================================

-- Tables already dropped above, now recreate them

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
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

-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  surgeon_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  surgery_type TEXT DEFAULT 'TKA',
  surgery_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create providers table
CREATE TABLE providers (
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

-- Create conversations table for chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Recovery Chat',
  status TEXT DEFAULT 'active',
  total_messages INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'ai', 'system')),
  sender_id UUID,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  completion_status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE DEFAULT TENANT
-- =====================================================

INSERT INTO tenants (id, name, subdomain) 
VALUES ('00000000-0000-0000-0000-000000000000', 'TJV Recovery Demo', 'demo')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  subdomain = EXCLUDED.subdomain;

-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can insert their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can view their own provider record" ON providers;
DROP POLICY IF EXISTS "Users can update their own provider record" ON providers;
DROP POLICY IF EXISTS "Users can insert their own provider record" ON providers;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON tenants;

-- Create new policies
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

CREATE POLICY "Authenticated users can view tenants" ON tenants
  FOR SELECT USING (auth.role() = 'authenticated');

-- Basic conversation and message policies
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: Database reset complete!' as message;
SELECT 'Ready for demo user creation!' as next_step;

-- 7. INSTRUCTIONS FOR DEMO USERS
-- =====================================================

/*
AFTER RUNNING THIS SCRIPT:

1. Go to Supabase Auth > Users
2. DELETE ALL EXISTING USERS manually in the UI
3. Users will be created via the registration form with these credentials:

TEST USERS FOR DEMO:
==================

PATIENT ACCOUNTS:
- Email: sarah.patient@tjvrecovery.com
- Password: Demo123!
- Name: Sarah Johnson
- Role: Patient

- Email: mike.patient@tjvrecovery.com  
- Password: Demo123!
- Name: Mike Wilson
- Role: Patient

PROVIDER ACCOUNTS:
- Email: dr.smith@tjvrecovery.com
- Password: Demo123!
- Name: Dr. Robert Smith
- Role: Provider
- Specialty: Orthopedic Surgery
- License: MD123456

- Email: nurse.jones@tjvrecovery.com
- Password: Demo123!
- Name: Linda Jones
- Role: Provider
- Specialty: Nursing
- License: RN789012

ADMIN ACCOUNT:
- Email: admin@tjvrecovery.com
- Password: Demo123!
- Name: Admin User
- Role: Provider (will be admin)
- Specialty: Administration
- License: ADM001

TESTING WORKFLOW:
================
1. Register each user via /register
2. Check email and verify (or disable email verification temporarily)
3. Login with each account
4. Test role-based redirects
5. Test dashboard functionality

*/