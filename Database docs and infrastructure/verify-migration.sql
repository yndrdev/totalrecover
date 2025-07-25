-- =====================================================
-- MIGRATION VERIFICATION SCRIPT
-- Run this after completing the database restructure
-- =====================================================

-- 1. Check all tables exist
SELECT 
    table_name,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'tenants', 'profiles', 'patients', 'providers',
    'recovery_protocols', 'tasks', 'patient_tasks',
    'conversations', 'messages', 'audit_logs'
)
GROUP BY table_name
ORDER BY table_name;

-- Expected: 10 tables

-- 2. Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 3. Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'tenants', 'profiles', 'patients', 'providers',
    'recovery_protocols', 'tasks', 'patient_tasks',
    'conversations', 'messages', 'audit_logs'
)
ORDER BY tablename;

-- Expected: All tables should have rowsecurity = true

-- 4. Check RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check helper functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_tenant_id', 'is_tenant_member', 'update_updated_at_column')
ORDER BY routine_name;

-- Expected: 3 functions

-- 6. Check indexes exist
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 7. Check default tenant exists
SELECT 
    id,
    name,
    subdomain
FROM tenants
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Expected: 1 row with 'TJV Recovery Demo'

-- 8. Check triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- Expected: 8 triggers for updated_at columns

-- 9. Summary check
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
    'Foreign Keys' as check_type,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public'
UNION ALL
SELECT 
    'Functions' as check_type,
    COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_tenant_id', 'is_tenant_member', 'update_updated_at_column')
UNION ALL
SELECT 
    'Policies' as check_type,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Indexes' as check_type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
UNION ALL
SELECT 
    'Triggers' as check_type,
    COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY check_type;

-- Expected counts:
-- Tables: 10
-- Foreign Keys: 13+
-- Functions: 3
-- Policies: 19+
-- Indexes: 13+
-- Triggers: 8

-- If all checks pass, the migration was successful!