-- =====================================================
-- COMPLETE DATABASE RESTRUCTURE FOR TJV RECOVERY PLATFORM
-- =====================================================
-- This script creates a clean, properly structured database
-- that matches all application requirements
-- =====================================================

-- 1. CLEAN SLATE - DROP ALL EXISTING OBJECTS
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "tenant_isolation" ON tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON patients;
DROP POLICY IF EXISTS "Providers can view patients in their tenant" ON patients;
DROP POLICY IF EXISTS "Users can view their own provider record" ON providers;
DROP POLICY IF EXISTS "Users can update their own provider record" ON providers;
DROP POLICY IF EXISTS "Patients can view providers in their tenant" ON providers;
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view tasks in their tenant" ON tasks;
DROP POLICY IF EXISTS "Users can view their patient tasks" ON patient_tasks;
DROP POLICY IF EXISTS "Users can update their patient tasks" ON patient_tasks;
DROP POLICY IF EXISTS "Users can view protocols in their tenant" ON recovery_protocols;

-- Drop all tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS form_responses CASCADE;
DROP TABLE IF EXISTS exercise_completions CASCADE;
DROP TABLE IF EXISTS content_engagement CASCADE;
DROP TABLE IF EXISTS patient_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS recovery_protocols CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS get_user_tenant_id();
DROP FUNCTION IF EXISTS is_tenant_member(uuid);

-- 2. CREATE CORE TABLES WITH PROPER STRUCTURE
-- =====================================================

-- Tenants table (multi-tenant support)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'provider', 'admin', 'surgeon', 'nurse', 'physical_therapist')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surgeon_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  zip_code TEXT DEFAULT '',
  date_of_birth DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
  surgery_type TEXT DEFAULT 'TKA',
  surgery_date DATE,
  discharge_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery protocols table
CREATE TABLE recovery_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  surgery_type TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 245,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES recovery_protocols(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('form', 'exercise', 'education', 'message', 'milestone')),
  day_offset INTEGER NOT NULL, -- Days from surgery date
  duration_minutes INTEGER,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  required BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient tasks (assigned tasks)
CREATE TABLE patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  protocol_id UUID REFERENCES recovery_protocols(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_data JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Recovery Chat',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  metadata JSONB DEFAULT '{}',
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider', 'ai', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_providers_tenant_id ON providers(tenant_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_tasks_protocol_id ON tasks(protocol_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_patient_tasks_patient_id ON patient_tasks(patient_id);
CREATE INDEX idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX idx_patient_tasks_status ON patient_tasks(status);
CREATE INDEX idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Get user's tenant ID
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is member of tenant
CREATE OR REPLACE FUNCTION is_tenant_member(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE id = auth.uid() 
      AND tenant_id = check_tenant_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- =====================================================

-- Tenants policies
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (
    id = get_user_tenant_id() OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Profiles policies
CREATE POLICY "Users can view profiles in their tenant" ON profiles
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() OR
    id = auth.uid() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Patients policies
CREATE POLICY "Patients can view their own record" ON patients
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Patients can update their own record" ON patients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Providers can create patient records" ON patients
  FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('provider', 'admin', 'surgeon', 'nurse')
    )
  );

-- Providers policies
CREATE POLICY "Users can view providers in their tenant" ON providers
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() OR
    user_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Providers can update their own record" ON providers
  FOR UPDATE USING (user_id = auth.uid());

-- Recovery protocols policies
CREATE POLICY "Users can view protocols in their tenant" ON recovery_protocols
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Providers can manage protocols" ON recovery_protocols
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('provider', 'admin')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their tenant" ON tasks
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Providers can manage tasks" ON tasks
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('provider', 'admin')
    )
  );

-- Patient tasks policies
CREATE POLICY "Patients can view their own tasks" ON patient_tasks
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    ) OR
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Patients can update their own tasks" ON patient_tasks
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can manage patient tasks" ON patient_tasks
  FOR ALL USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('provider', 'admin', 'surgeon', 'nurse')
    )
  );

-- Conversations policies
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    ) OR
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Authorized users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
      )
    ) OR
    tenant_id = get_user_tenant_id() OR
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    (sender_id = auth.uid() OR sender_type IN ('ai', 'system')) AND
    (tenant_id = get_user_tenant_id() OR auth.jwt() ->> 'role' = 'service_role')
  );

-- Audit logs policies
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 7. CREATE DEFAULT TENANT AND SEED DATA
-- =====================================================

-- Insert default tenant
INSERT INTO tenants (id, name, subdomain, settings) VALUES
  ('00000000-0000-0000-0000-000000000000', 'TJV Recovery Demo', 'demo', 
   '{"features": {"chat": true, "video": true, "forms": true}}'::jsonb);

-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recovery_protocols_updated_at BEFORE UPDATE ON recovery_protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_tasks_updated_at BEFORE UPDATE ON patient_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. SUCCESS MESSAGE
-- =====================================================

SELECT 'Database restructure complete!' as status;
SELECT 'Next steps:' as info;
SELECT '1. Delete all users in Supabase Auth' as step_1;
SELECT '2. Register new test users through the app' as step_2;
SELECT '3. Use the seed functions to populate test data' as step_3;