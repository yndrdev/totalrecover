-- =====================================================
-- CREATE DEMO USERS DIRECTLY IN DATABASE
-- Run this after DEMO_RESET_SCRIPT.sql to create test users
-- =====================================================

-- First, ensure we have the default tenant
INSERT INTO tenants (id, name, subdomain, settings) 
VALUES ('00000000-0000-0000-0000-000000000000', 'TJV Recovery Demo', 'demo', '{}')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  subdomain = EXCLUDED.subdomain;

-- =====================================================
-- CREATE DEMO USER ACCOUNTS
-- Note: These are created directly in the database for demo purposes
-- In production, users would register via the signup form
-- =====================================================

-- 1. PATIENT ACCOUNTS
-- =====================================================

-- Sarah Patient
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  'patient-sarah-001',
  'sarah.patient@tjvrecovery.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"firstName": "Sarah", "lastName": "Johnson", "userType": "patient"}',
  'authenticated',
  'authenticated'
);

-- Create Sarah's profile
INSERT INTO profiles (id, user_id, tenant_id, email, first_name, last_name, full_name, role, is_active, email_verified, onboarding_completed)
VALUES (
  'patient-sarah-001',
  'patient-sarah-001',
  '00000000-0000-0000-0000-000000000000',
  'sarah.patient@tjvrecovery.com',
  'Sarah',
  'Johnson',
  'Sarah Johnson',
  'patient',
  true,
  true,
  true
);

-- Create Sarah's patient record
INSERT INTO patients (id, user_id, tenant_id, first_name, last_name, status, surgery_type, surgery_date)
VALUES (
  gen_random_uuid(),
  'patient-sarah-001',
  '00000000-0000-0000-0000-000000000000',
  'Sarah',
  'Johnson',
  'active',
  'TKA',
  CURRENT_DATE - INTERVAL '7 days'
);

-- Mike Patient
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  'patient-mike-002',
  'mike.patient@tjvrecovery.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"firstName": "Mike", "lastName": "Wilson", "userType": "patient"}',
  'authenticated',
  'authenticated'
);

-- Create Mike's profile
INSERT INTO profiles (id, user_id, tenant_id, email, first_name, last_name, full_name, role, is_active, email_verified, onboarding_completed)
VALUES (
  'patient-mike-002',
  'patient-mike-002',
  '00000000-0000-0000-0000-000000000000',
  'mike.patient@tjvrecovery.com',
  'Mike',
  'Wilson',
  'Mike Wilson',
  'patient',
  true,
  true,
  true
);

-- Create Mike's patient record
INSERT INTO patients (id, user_id, tenant_id, first_name, last_name, status, surgery_type, surgery_date)
VALUES (
  gen_random_uuid(),
  'patient-mike-002',
  '00000000-0000-0000-0000-000000000000',
  'Mike',
  'Wilson',
  'active',
  'THA',
  CURRENT_DATE - INTERVAL '14 days'
);

-- 2. PROVIDER ACCOUNTS
-- =====================================================

-- Dr. Smith
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  'provider-smith-003',
  'dr.smith@tjvrecovery.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"firstName": "Dr. Robert", "lastName": "Smith", "userType": "provider", "specialty": "Orthopedic Surgery", "licenseNumber": "MD123456"}',
  'authenticated',
  'authenticated'
);

-- Create Dr. Smith's profile
INSERT INTO profiles (id, user_id, tenant_id, email, first_name, last_name, full_name, role, is_active, email_verified, onboarding_completed)
VALUES (
  'provider-smith-003',
  'provider-smith-003',
  '00000000-0000-0000-0000-000000000000',
  'dr.smith@tjvrecovery.com',
  'Dr. Robert',
  'Smith',
  'Dr. Robert Smith, MD',
  'surgeon',
  true,
  true,
  true
);

-- Create Dr. Smith's provider record
INSERT INTO providers (id, user_id, tenant_id, first_name, last_name, specialty, license_number, accepting_new_patients)
VALUES (
  gen_random_uuid(),
  'provider-smith-003',
  '00000000-0000-0000-0000-000000000000',
  'Dr. Robert',
  'Smith',
  'Orthopedic Surgery',
  'MD123456',
  true
);

-- Nurse Jones
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  'provider-jones-004',
  'nurse.jones@tjvrecovery.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"firstName": "Linda", "lastName": "Jones", "userType": "provider", "specialty": "Nursing", "licenseNumber": "RN789012"}',
  'authenticated',
  'authenticated'
);

-- Create Nurse Jones's profile
INSERT INTO profiles (id, user_id, tenant_id, email, first_name, last_name, full_name, role, is_active, email_verified, onboarding_completed)
VALUES (
  'provider-jones-004',
  'provider-jones-004',
  '00000000-0000-0000-0000-000000000000',
  'nurse.jones@tjvrecovery.com',
  'Linda',
  'Jones',
  'Linda Jones, RN',
  'nurse',
  true,
  true,
  true
);

-- Create Nurse Jones's provider record
INSERT INTO providers (id, user_id, tenant_id, first_name, last_name, specialty, license_number, accepting_new_patients)
VALUES (
  gen_random_uuid(),
  'provider-jones-004',
  '00000000-0000-0000-0000-000000000000',
  'Linda',
  'Jones',
  'Nursing',
  'RN789012',
  true
);

-- Admin User
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  'provider-admin-005',
  'admin@tjvrecovery.com',
  crypt('Demo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"firstName": "Admin", "lastName": "User", "userType": "provider", "specialty": "Administration", "licenseNumber": "ADM001"}',
  'authenticated',
  'authenticated'
);

-- Create Admin's profile
INSERT INTO profiles (id, user_id, tenant_id, email, first_name, last_name, full_name, role, is_active, email_verified, onboarding_completed)
VALUES (
  'provider-admin-005',
  'provider-admin-005',
  '00000000-0000-0000-0000-000000000000',
  'admin@tjvrecovery.com',
  'Admin',
  'User',
  'Admin User',
  'admin',
  true,
  true,
  true
);

-- Create Admin's provider record
INSERT INTO providers (id, user_id, tenant_id, first_name, last_name, specialty, license_number, accepting_new_patients)
VALUES (
  gen_random_uuid(),
  'provider-admin-005',
  '00000000-0000-0000-0000-000000000000',
  'Admin',
  'User',
  'Administration',
  'ADM001',
  true
);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: Demo users created!' as message;

-- Verify users were created
SELECT 
  'VERIFICATION:' as table_name,
  COUNT(*) as count,
  'auth.users' as table_type
FROM auth.users 
WHERE email LIKE '%@tjvrecovery.com'
UNION ALL
SELECT 
  'VERIFICATION:',
  COUNT(*),
  'profiles'
FROM profiles 
WHERE email LIKE '%@tjvrecovery.com'
UNION ALL
SELECT 
  'VERIFICATION:',
  COUNT(*),
  'patients'
FROM patients p
JOIN profiles prof ON p.user_id = prof.user_id
WHERE prof.email LIKE '%@tjvrecovery.com'
UNION ALL
SELECT 
  'VERIFICATION:',
  COUNT(*),
  'providers'
FROM providers p
JOIN profiles prof ON p.user_id = prof.user_id
WHERE prof.email LIKE '%@tjvrecovery.com';

-- Show all demo users
SELECT 
  'DEMO USERS:' as info,
  p.email,
  p.full_name,
  p.role,
  'Password: Demo123!' as password
FROM profiles p
WHERE p.email LIKE '%@tjvrecovery.com'
ORDER BY p.role, p.email;