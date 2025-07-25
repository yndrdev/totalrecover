-- =============================================
-- DISABLE RLS FOR DEMO PURPOSES
-- =============================================
-- WARNING: This migration disables Row Level Security on all tables
-- This should ONLY be used for demo environments
-- DO NOT run this in production!

-- First, drop all existing RLS policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recovery_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- Additional tables from other migrations
ALTER TABLE IF EXISTS form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS form_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS protocol_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_form_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS provider_patient_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS typing_indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS message_read_receipts DISABLE ROW LEVEL SECURITY;

-- Chat tables
ALTER TABLE IF EXISTS chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_templates DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated and anon users for demo
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Log this action
INSERT INTO audit_logs (
    tenant_id,
    action,
    resource_type,
    details
) VALUES (
    (SELECT id FROM tenants WHERE subdomain = 'tjv' LIMIT 1),
    'disable_rls_demo',
    'security',
    jsonb_build_object(
        'warning', 'RLS has been disabled for demo purposes',
        'timestamp', NOW(),
        'tables_affected', (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        )
    )
);

-- Add a warning comment
COMMENT ON SCHEMA public IS 'WARNING: Row Level Security has been DISABLED on all tables for demo purposes. This is NOT secure for production use!';