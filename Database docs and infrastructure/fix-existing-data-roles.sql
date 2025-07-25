-- First, let's see what roles already exist in your data
SELECT DISTINCT role, COUNT(*) as count
FROM profiles 
WHERE role IS NOT NULL
GROUP BY role
ORDER BY role;

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Update any existing roles that might be problematic
-- (This is safe - it only updates if these values exist)
UPDATE profiles SET role = 'admin' WHERE role = 'administrator';
UPDATE profiles SET role = 'user' WHERE role = 'member';
UPDATE profiles SET role = 'patient' WHERE role = 'client';

-- Now add a very permissive constraint that allows all common roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN (
    'super_admin', 'practice_admin', 'clinic_admin', 
    'surgeon', 'nurse', 'physical_therapist', 'patient',
    'admin', 'user', 'provider', 'staff', 'member', 'client',
    'doctor', 'therapist', 'manager', 'owner'
  ));

-- Show what roles we now have
SELECT 'Existing roles after fix:' as message;
SELECT DISTINCT role, COUNT(*) as count
FROM profiles 
WHERE role IS NOT NULL
GROUP BY role
ORDER BY role;

