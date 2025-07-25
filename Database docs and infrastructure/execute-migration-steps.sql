-- =====================================================
-- STEP-BY-STEP MIGRATION EXECUTION GUIDE
-- Execute these queries one at a time in Supabase SQL Editor
-- =====================================================

-- STEP 1: First, check current state
SELECT 'Current Tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- STEP 2: Execute the complete restructure
-- Copy and paste the entire content of complete-db-restructure.sql here
-- It will drop all existing tables and recreate them properly

-- STEP 3: Verify migration success
SELECT 'Migration Verification:' as status;
SELECT 
    'Tables' as check_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'tenants', 'profiles', 'patients', 'providers',
    'recovery_protocols', 'tasks', 'patient_tasks',
    'conversations', 'messages', 'audit_logs'
)
UNION ALL
SELECT 
    'RLS Enabled Tables' as check_type,
    COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- STEP 4: Check default tenant exists
SELECT 'Default Tenant Check:' as info;
SELECT * FROM tenants WHERE id = '00000000-0000-0000-0000-000000000000';

-- EXPECTED OUTPUT:
-- Tables: 10
-- RLS Enabled Tables: 10
-- Default Tenant: 1 row with 'TJV Recovery Demo'

-- If all checks pass, proceed to clear auth users in Supabase Dashboard