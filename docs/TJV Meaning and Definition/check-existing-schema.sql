-- =====================================================
-- CHECK YOUR EXISTING SCHEMA STRUCTURE
-- Run this to see what columns you actually have
-- =====================================================

-- Check what columns exist in your tenants table
SELECT 
  'tenants' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in your profiles table  
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in your patients table
SELECT 
  'patients' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- List all tables in your database
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

