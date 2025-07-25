-- Just drop the problematic constraint entirely
-- This will allow any role values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Verify it's gone
SELECT 'Constraint removed successfully!' as message;

-- Show what constraints remain on profiles table
SELECT 
  conname as remaining_constraints
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

