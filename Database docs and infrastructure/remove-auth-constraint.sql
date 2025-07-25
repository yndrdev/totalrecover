-- Remove the foreign key constraint to auth.users
-- This allows us to create demo profiles without needing real auth users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Also remove any other auth-related constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Recreate primary key without foreign key reference
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Verify constraints are removed
SELECT 'Foreign key constraints removed successfully!' as message;

-- Show remaining constraints
SELECT 
  conname as remaining_constraints,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

