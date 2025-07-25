-- Check what role constraint exists on profiles table
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
  AND contype = 'c'
  AND conname LIKE '%role%';

-- Also check all constraints on profiles table
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

