-- =====================================================
-- COMPLETE RLS POLICIES IMPLEMENTATION
-- =====================================================
--
-- This script implements comprehensive Row Level Security
-- for the healthcare platform when moving to production
--
-- EXECUTE THESE IN ORDER WHEN READY FOR PRODUCTION
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Optional tables (enable if they exist)
-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: TENANT POLICIES (Multi-Tenant Foundation)
-- =====================================================

-- Tenants: Authenticated users can view basic tenant info
CREATE POLICY "Authenticated users can view tenants" ON tenants
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can manage tenants (if needed later)
CREATE POLICY "Admins can manage tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 3: PROFILES POLICIES (Core User Data)
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers can view profiles in their tenant (for patient management)
CREATE POLICY "Providers can view profiles in their tenant" ON profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT p.tenant_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- =====================================================
-- STEP 4: PATIENTS POLICIES (Patient Data Protection)
-- =====================================================

-- Patients can view their own record
CREATE POLICY "Patients can view their own record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

-- Patients can update their own record
CREATE POLICY "Patients can update their own record" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Patients can insert their own record (during registration)
CREATE POLICY "Patients can insert their own record" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers can view patients in their tenant
CREATE POLICY "Providers can view patients in their tenant" ON patients
  FOR SELECT USING (
    tenant_id IN (
      SELECT p.tenant_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- Providers can update patients in their tenant (for medical updates)
CREATE POLICY "Providers can update patients in their tenant" ON patients
  FOR UPDATE USING (
    tenant_id IN (
      SELECT p.tenant_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- =====================================================
-- STEP 5: PROVIDERS POLICIES (Provider Data Protection)
-- =====================================================

-- Providers can view their own record
CREATE POLICY "Providers can view their own record" ON providers
  FOR SELECT USING (auth.uid() = user_id);

-- Providers can update their own record
CREATE POLICY "Providers can update their own record" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

-- Providers can insert their own record (during registration)
CREATE POLICY "Providers can insert their own record" ON providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers can view other providers in their tenant
CREATE POLICY "Providers can view providers in their tenant" ON providers
  FOR SELECT USING (
    tenant_id IN (
      SELECT p.tenant_id FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- =====================================================
-- STEP 6: CONVERSATIONS POLICIES (Chat Security)
-- =====================================================

-- Patients can view their own conversations
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p 
      WHERE p.user_id = auth.uid()
    )
  );

-- Patients can insert their own conversations (when chat starts)
CREATE POLICY "Patients can insert their own conversations" ON conversations
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT p.id FROM patients p 
      WHERE p.user_id = auth.uid()
    )
  );

-- Providers can view conversations in their tenant
CREATE POLICY "Providers can view conversations in their tenant" ON conversations
  FOR SELECT USING (
    tenant_id IN (
      SELECT pr.tenant_id FROM profiles pr 
      WHERE pr.id = auth.uid() 
      AND pr.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- Providers can insert conversations in their tenant
CREATE POLICY "Providers can insert conversations in their tenant" ON conversations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT pr.tenant_id FROM profiles pr 
      WHERE pr.id = auth.uid() 
      AND pr.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- System/AI can manage all conversations (for automated messages)
CREATE POLICY "System can manage conversations" ON conversations
  FOR ALL USING (auth.uid() IS NULL);

-- =====================================================
-- STEP 7: MESSAGES POLICIES (Message Security)
-- =====================================================

-- Patients can view messages in their conversations
CREATE POLICY "Patients can view their messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN patients p ON c.patient_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Patients can insert their own messages
CREATE POLICY "Patients can insert their messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN patients p ON c.patient_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Providers can view messages in their tenant
CREATE POLICY "Providers can view messages in their tenant" ON messages
  FOR SELECT USING (
    tenant_id IN (
      SELECT pr.tenant_id FROM profiles pr 
      WHERE pr.id = auth.uid() 
      AND pr.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- Providers can insert messages in their tenant
CREATE POLICY "Providers can insert messages in their tenant" ON messages
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT pr.tenant_id FROM profiles pr 
      WHERE pr.id = auth.uid() 
      AND pr.role IN ('provider', 'surgeon', 'nurse', 'admin')
    )
  );

-- System/AI can manage all messages (for automated responses)
CREATE POLICY "System can manage messages" ON messages
  FOR ALL USING (auth.uid() IS NULL);

-- =====================================================
-- STEP 8: ADDITIONAL SECURITY FUNCTIONS (Optional)
-- =====================================================

-- Helper function to get current user's tenant
CREATE OR REPLACE FUNCTION get_current_user_tenant()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is provider
CREATE OR REPLACE FUNCTION is_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('provider', 'surgeon', 'nurse', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 9: GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permissions on helper functions
GRANT EXECUTE ON FUNCTION get_current_user_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION is_provider() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- STEP 10: VERIFICATION QUERIES
-- =====================================================

-- Test queries to verify RLS is working
-- (Run these after enabling RLS to test)

/*
-- Test 1: Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'profiles', 'patients', 'providers', 'conversations', 'messages');

-- Test 2: Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Test 3: Verify user can only see their own data
-- (Must be run as authenticated user)
SELECT count(*) FROM profiles; -- Should return 1 (only current user)
SELECT count(*) FROM patients WHERE user_id = auth.uid(); -- Should return 1 if user is patient
SELECT count(*) FROM conversations; -- Should return only user's conversations
*/

-- =====================================================
-- STEP 11: ROLLBACK SCRIPT (EMERGENCY USE ONLY)
-- =====================================================

/*
-- EMERGENCY ROLLBACK: Disable RLS if issues occur
-- USE ONLY IF PRODUCTION ISSUES REQUIRE IMMEDIATE FIX

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all policies (if needed)
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON tenants;
DROP POLICY IF EXISTS "Admins can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
-- ... (continue for all policies)
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'RLS policies implemented successfully!' as status;
SELECT 'Ready for production security!' as message;
SELECT 'Test all user flows before full deployment' as reminder;