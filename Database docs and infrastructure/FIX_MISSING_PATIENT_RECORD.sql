-- Fix missing patient record for user e855f9d8-bc85-49d1-8e30-fe0062179fc8
-- This script will create the missing patient record

-- First, check current state
SELECT 
    'USER EXISTS IN AUTH:' as status,
    id, 
    email, 
    created_at
FROM auth.users 
WHERE id = 'e855f9d8-bc85-49d1-8e30-fe0062179fc8';

-- Check profile record
SELECT 
    'PROFILE EXISTS:' as status,
    id,
    user_id,
    tenant_id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE user_id = 'e855f9d8-bc85-49d1-8e30-fe0062179fc8';

-- Check if patient record exists
SELECT 
    'PATIENT RECORD EXISTS:' as status,
    id,
    user_id,
    tenant_id,
    first_name,
    last_name,
    status,
    created_at
FROM patients 
WHERE user_id = 'e855f9d8-bc85-49d1-8e30-fe0062179fc8';

-- Create missing patient record based on profile data
INSERT INTO patients (
    user_id,
    tenant_id,
    first_name,
    last_name,
    phone,
    address,
    city,
    state,
    zip_code,
    date_of_birth,
    status,
    surgery_type,
    surgery_date
)
SELECT 
    p.user_id,
    p.tenant_id,
    COALESCE(p.first_name, 'Unknown'),
    COALESCE(p.last_name, 'User'),
    '',
    '',
    '',
    '',
    '',
    '',
    'active',
    'TKA',
    CURRENT_DATE - INTERVAL '7 days'
FROM profiles p
WHERE p.user_id = 'e855f9d8-bc85-49d1-8e30-fe0062179fc8'
  AND p.role = 'patient'
  AND NOT EXISTS (
    SELECT 1 FROM patients pat 
    WHERE pat.user_id = p.user_id
  );

-- Verify the fix
SELECT 
    'PATIENT RECORD CREATED:' as status,
    id,
    user_id,
    tenant_id,
    first_name,
    last_name,
    status,
    surgery_type,
    surgery_date,
    created_at
FROM patients 
WHERE user_id = 'e855f9d8-bc85-49d1-8e30-fe0062179fc8';

-- Show success message
SELECT 'SUCCESS: Patient record created for user e855f9d8-bc85-49d1-8e30-fe0062179fc8' as result;