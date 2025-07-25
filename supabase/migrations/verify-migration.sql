-- TJV Recovery Platform - Migration Verification Script
-- Run this after applying the complete-db-restructure migration
-- to verify all tables and relationships are correctly set up

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Check all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'tenants', 'profiles', 'providers', 'patients', 
            'forms', 'exercises', 'recovery_protocols', 'tasks',
            'patient_protocols', 'patient_tasks', 'conversations', 
            'messages', 'audit_logs'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ Valid FK' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 3. Check RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'tenants', 'profiles', 'providers', 'patients', 
    'forms', 'exercises', 'recovery_protocols', 'tasks',
    'patient_protocols', 'patient_tasks', 'conversations', 
    'messages', 'audit_logs'
)
ORDER BY tablename;

-- 4. Check indexes exist
SELECT 
    tablename,
    indexname,
    '✅ Index exists' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'providers', 'patients', 'recovery_protocols',
    'tasks', 'patient_protocols', 'patient_tasks', 
    'conversations', 'messages', 'audit_logs'
)
ORDER BY tablename, indexname;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    '✅ Policy exists' as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Check triggers
SELECT 
    trigger_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    '✅ Trigger exists' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. Check functions
SELECT 
    routine_name,
    routine_type,
    '✅ Function exists' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'handle_new_user',
    'calculate_protocol_progress'
)
ORDER BY routine_name;

-- 8. Check default tenant exists
SELECT 
    id,
    name,
    subdomain,
    CASE 
        WHEN id = 'c1234567-89ab-cdef-0123-456789abcdef'::UUID THEN '✅ Default tenant exists'
        ELSE '❌ Default tenant missing'
    END as status
FROM tenants
WHERE subdomain = 'tjv';

-- 9. Summary report
SELECT 
    'Migration Verification Complete' as message,
    NOW() as verified_at;