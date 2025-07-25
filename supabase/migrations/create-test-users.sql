-- Manual creation of test users for TJV Recovery Platform
-- Run this AFTER the fix-user-creation.sql script

-- First, run the fix-user-creation.sql to update the trigger
-- Then use these queries to manually create test profiles

-- Note: You'll still need to create the auth users through Supabase Dashboard
-- Authentication > Users > Invite User

-- After creating auth users in dashboard, get their IDs and update these queries:

-- 1. Create Provider Profile (after creating auth user for doctorchris@email.com)
-- Replace 'YOUR_PROVIDER_AUTH_ID' with the actual auth user ID from Supabase
/*
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    tenant_id
) VALUES (
    'YOUR_PROVIDER_AUTH_ID'::UUID,  -- Replace with actual auth.users ID
    'doctorchris@email.com',
    'Dr. Chris',
    'Johnson',
    'provider',
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID
);

-- Create corresponding provider record
INSERT INTO providers (
    profile_id,
    tenant_id,
    license_number,
    department,
    is_active
) VALUES (
    'YOUR_PROVIDER_AUTH_ID'::UUID,  -- Same ID as above
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
    'MD12345',
    'Orthopedics',
    true
);
*/

-- 2. Create Patient Profile (after creating auth user for patientjohn@email.com)
-- Replace 'YOUR_PATIENT_AUTH_ID' with the actual auth user ID from Supabase
/*
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    tenant_id
) VALUES (
    'YOUR_PATIENT_AUTH_ID'::UUID,  -- Replace with actual auth.users ID
    'patientjohn@email.com',
    'John',
    'Smith',
    'patient',
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID
);

-- Create corresponding patient record
INSERT INTO patients (
    profile_id,
    tenant_id,
    mrn,
    surgery_date,
    surgery_type,
    status
) VALUES (
    'YOUR_PATIENT_AUTH_ID'::UUID,  -- Same ID as above
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
    'MRN123456',
    CURRENT_DATE + INTERVAL '30 days',  -- Surgery in 30 days
    'TKA',
    'active'
);

-- Create a conversation between provider and patient
INSERT INTO conversations (
    tenant_id,
    patient_id,
    provider_id,
    status
) VALUES (
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
    (SELECT id FROM patients WHERE profile_id = 'YOUR_PATIENT_AUTH_ID'::UUID),
    (SELECT id FROM providers WHERE profile_id = 'YOUR_PROVIDER_AUTH_ID'::UUID),
    'active'
);
*/

-- Alternative: Query to check if profiles were created automatically
SELECT 
    u.id as auth_id,
    u.email,
    p.id as profile_id,
    p.role,
    p.tenant_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- If profiles are missing, you can create them manually using the INSERT statements above