-- EMERGENCY: Disable ALL Row Level Security for Demo
-- WARNING: This removes all security - USE ONLY FOR DEMOS!

-- Disable RLS on all tables
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recovery_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS protocol_tasks DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT pol.polname, cls.relname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.polname, r.relname);
    END LOOP;
END $$;

-- Grant full access to all roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create auth bypass functions for demo
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'sub')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json ->> 'role',
    'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to track this is for demo only
COMMENT ON SCHEMA public IS 'RLS DISABLED FOR DEMO - RE-ENABLE FOR PRODUCTION';