-- TJV Recovery Platform - Complete RLS Setup
-- This script implements Row Level Security for multi-tenant isolation and HIPAA compliance

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

-- Core tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_activities ENABLE ROW LEVEL SECURITY;

-- Protocol and task tables
ALTER TABLE recovery_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;

-- Form and exercise tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

-- Progress and metrics tables
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Get current user's tenant IDs from profiles
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN COALESCE(
    (SELECT accessible_tenants FROM profiles WHERE id = auth.uid()),
    ARRAY[]::UUID[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's primary tenant ID
CREATE OR REPLACE FUNCTION get_user_primary_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a provider
CREATE OR REPLACE FUNCTION is_provider()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('provider', 'admin', 'nurse');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a patient
CREATE OR REPLACE FUNCTION is_patient()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'patient';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. TENANT POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view accessible tenants" ON tenants;
DROP POLICY IF EXISTS "Admins can manage tenants" ON tenants;

-- Users can only view tenants they have access to
CREATE POLICY "Users can view accessible tenants" ON tenants
  FOR SELECT
  USING (
    id = ANY(get_user_tenant_ids())
    OR
    id = get_user_primary_tenant_id()
  );

-- Only super admins can create/update/delete tenants
CREATE POLICY "Admins can manage tenants" ON tenants
  FOR ALL
  USING (
    get_user_role() = 'admin' AND
    (SELECT tenant_type FROM tenants WHERE id = get_user_primary_tenant_id()) = 'super_admin'
  );

-- ============================================
-- 4. PROFILE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Providers can view profiles in their tenants" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Providers can view profiles in their accessible tenants
CREATE POLICY "Providers can view profiles in their tenants" ON profiles
  FOR SELECT
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- ============================================
-- 5. PATIENT POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;
DROP POLICY IF EXISTS "Providers can view patients in their tenants" ON patients;
DROP POLICY IF EXISTS "Providers can update patients in their tenants" ON patients;

-- Patients can only view their own data (remember: patients.id = auth.users.id)
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT
  USING (id = auth.uid());

-- Patients can update their own data
CREATE POLICY "Patients can update their own data" ON patients
  FOR UPDATE
  USING (id = auth.uid());

-- Providers can view patients in their accessible tenants
CREATE POLICY "Providers can view patients in their tenants" ON patients
  FOR SELECT
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Providers can update patients in their accessible tenants
CREATE POLICY "Providers can update patients in their tenants" ON patients
  FOR UPDATE
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Providers can create patients in their primary tenant
CREATE POLICY "Providers can create patients" ON patients
  FOR INSERT
  WITH CHECK (
    is_provider() AND
    tenant_id = get_user_primary_tenant_id()
  );

-- ============================================
-- 6. CONVERSATION POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Patients can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Patients can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Providers can view conversations in their tenants" ON conversations;
DROP POLICY IF EXISTS "Providers can update conversations in their tenants" ON conversations;

-- Patients can view their own conversations
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT
  USING (
    patient_id = auth.uid()
  );

-- Patients can create conversations
CREATE POLICY "Patients can create their own conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    patient_id = auth.uid() AND
    tenant_id = (SELECT tenant_id FROM patients WHERE id = auth.uid())
  );

-- Patients can update their own conversations
CREATE POLICY "Patients can update their own conversations" ON conversations
  FOR UPDATE
  USING (
    patient_id = auth.uid()
  );

-- Providers can view conversations in their accessible tenants
CREATE POLICY "Providers can view conversations in their tenants" ON conversations
  FOR SELECT
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Providers can update conversations in their accessible tenants
CREATE POLICY "Providers can update conversations in their tenants" ON conversations
  FOR UPDATE
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- ============================================
-- 7. MESSAGE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON messages;
DROP POLICY IF EXISTS "System can update messages" ON messages;

-- Users can view messages in conversations they have access to
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE 
        -- Patients see their own conversations
        (patient_id = auth.uid())
        OR
        -- Providers see conversations in their tenants
        (is_provider() AND tenant_id = ANY(get_user_tenant_ids()))
    )
  );

-- Authenticated users can create messages in conversations they have access to
CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE 
        -- Patients can message in their own conversations
        (patient_id = auth.uid())
        OR
        -- Providers can message in conversations in their tenants
        (is_provider() AND tenant_id = ANY(get_user_tenant_ids()))
    )
  );

-- Allow message updates (for status changes, etc.)
CREATE POLICY "System can update messages" ON messages
  FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE 
        (patient_id = auth.uid())
        OR
        (is_provider() AND tenant_id = ANY(get_user_tenant_ids()))
    )
  );

-- ============================================
-- 8. CONVERSATION ACTIVITY POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view activities in their conversations" ON conversation_activities;
DROP POLICY IF EXISTS "Users can create activities" ON conversation_activities;

-- Users can view activities in conversations they have access to
CREATE POLICY "Users can view activities in their conversations" ON conversation_activities
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE 
        (patient_id = auth.uid())
        OR
        (is_provider() AND tenant_id = ANY(get_user_tenant_ids()))
    )
  );

-- Users can create activities in conversations they have access to
CREATE POLICY "Users can create activities" ON conversation_activities
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE 
        (patient_id = auth.uid())
        OR
        (is_provider() AND tenant_id = ANY(get_user_tenant_ids()))
    )
  );

-- ============================================
-- 9. PROTOCOL AND TASK POLICIES
-- ============================================

-- Recovery protocols - providers can manage in their tenants
CREATE POLICY "Providers can view protocols" ON recovery_protocols
  FOR SELECT
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY "Providers can manage protocols" ON recovery_protocols
  FOR ALL
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Tasks - providers can manage in their tenants
CREATE POLICY "Providers can view tasks" ON tasks
  FOR SELECT
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

CREATE POLICY "Providers can manage tasks" ON tasks
  FOR ALL
  USING (
    is_provider() AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- Patient tasks - patients see their own, providers see in their tenants
CREATE POLICY "Patients can view their tasks" ON patient_tasks
  FOR SELECT
  USING (
    patient_id = auth.uid()
  );

CREATE POLICY "Providers can view patient tasks" ON patient_tasks
  FOR SELECT
  USING (
    is_provider() AND
    patient_id IN (
      SELECT id FROM patients WHERE tenant_id = ANY(get_user_tenant_ids())
    )
  );

CREATE POLICY "Providers can manage patient tasks" ON patient_tasks
  FOR ALL
  USING (
    is_provider() AND
    patient_id IN (
      SELECT id FROM patients WHERE tenant_id = ANY(get_user_tenant_ids())
    )
  );

-- ============================================
-- 10. FORM AND RESPONSE POLICIES
-- ============================================

-- Forms - accessible by tenant
CREATE POLICY "Users can view forms in their tenants" ON forms
  FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    OR
    tenant_id = get_user_primary_tenant_id()
  );

CREATE POLICY "Providers can manage forms" ON forms
  FOR ALL
  USING (
    is_provider() AND
    tenant_id = get_user_primary_tenant_id()
  );

-- Form responses - patients see their own, providers see in their tenants
CREATE POLICY "Patients can view their form responses" ON form_responses
  FOR SELECT
  USING (
    patient_id = auth.uid()
  );

CREATE POLICY "Patients can create form responses" ON form_responses
  FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
  );

CREATE POLICY "Providers can view form responses" ON form_responses
  FOR SELECT
  USING (
    is_provider() AND
    patient_id IN (
      SELECT id FROM patients WHERE tenant_id = ANY(get_user_tenant_ids())
    )
  );

-- ============================================
-- 11. EDUCATIONAL CONTENT POLICIES
-- ============================================

-- Educational content - accessible by tenant
CREATE POLICY "Users can view content in their tenants" ON educational_content
  FOR SELECT
  USING (
    tenant_id = ANY(get_user_tenant_ids())
    OR
    tenant_id = get_user_primary_tenant_id()
  );

CREATE POLICY "Providers can manage content" ON educational_content
  FOR ALL
  USING (
    is_provider() AND
    tenant_id = get_user_primary_tenant_id()
  );

-- ============================================
-- 12. PROGRESS METRICS POLICIES
-- ============================================

-- Progress metrics - patients see their own, providers see in their tenants
CREATE POLICY "Patients can view their progress" ON progress_metrics
  FOR SELECT
  USING (
    patient_id = auth.uid()
  );

CREATE POLICY "Providers can view patient progress" ON progress_metrics
  FOR SELECT
  USING (
    is_provider() AND
    patient_id IN (
      SELECT id FROM patients WHERE tenant_id = ANY(get_user_tenant_ids())
    )
  );

CREATE POLICY "System can create progress metrics" ON progress_metrics
  FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    OR
    (is_provider() AND patient_id IN (
      SELECT id FROM patients WHERE tenant_id = ANY(get_user_tenant_ids())
    ))
  );

-- ============================================
-- 13. AUDIT LOG POLICIES
-- ============================================

-- Audit logs - only viewable by admins in their tenant
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    get_user_role() = 'admin' AND
    tenant_id = ANY(get_user_tenant_ids())
  );

-- System can create audit logs (using service role)
-- No policy needed as service role bypasses RLS

-- ============================================
-- 14. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on all schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant appropriate permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;
GRANT INSERT, UPDATE ON patients TO authenticated;
GRANT INSERT, UPDATE ON conversations TO authenticated;
GRANT INSERT, UPDATE ON messages TO authenticated;
GRANT INSERT ON conversation_activities TO authenticated;
GRANT INSERT ON form_responses TO authenticated;
GRANT INSERT ON progress_metrics TO authenticated;

-- Grant permissions for providers
GRANT INSERT, UPDATE, DELETE ON recovery_protocols TO authenticated;
GRANT INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON patient_tasks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON forms TO authenticated;
GRANT INSERT, UPDATE, DELETE ON educational_content TO authenticated;

-- ============================================
-- 15. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_recovery_protocols_tenant_id ON recovery_protocols(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_protocol_id ON tasks(protocol_id);
CREATE INDEX IF NOT EXISTS idx_patient_tasks_patient_id ON patient_tasks(patient_id);

-- ============================================
-- 16. VERIFICATION QUERIES
-- ============================================

-- You can run these queries to verify RLS is working:
/*
-- Check if RLS is enabled on tables:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check existing policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Test as a patient (replace with actual patient ID):
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'patient-uuid-here';
SELECT * FROM patients; -- Should only see their own record
SELECT * FROM conversations; -- Should only see their own conversations

-- Test as a provider (replace with actual provider ID):
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'provider-uuid-here';
SELECT * FROM patients; -- Should see patients in their tenants
SELECT * FROM conversations; -- Should see conversations in their tenants
*/

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. This script assumes the auth.uid() function returns the current user's ID
-- 2. The service role key bypasses RLS for system operations
-- 3. Always test RLS policies thoroughly before production deployment
-- 4. Monitor query performance and add indexes as needed
-- 5. Review and update policies as requirements change