-- Drop the existing role constraint that's blocking our demo data
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add a new constraint that allows all the roles we need
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist', 'patient', 'admin', 'user', 'provider'));

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
  AND conname = 'profiles_role_check';

