-- Complete Database Migration for TJV Recovery Platform
-- Run this script in Supabase SQL Editor

-- Step 1: Add missing columns
ALTER TABLE recovery_protocols 
ADD COLUMN IF NOT EXISTS surgery_type VARCHAR(50);

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Step 2: Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID := 'c1234567-89ab-cdef-0123-456789abcdef';
BEGIN
  -- Create profile for the new user
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    tenant_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, default_tenant_id),
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Create test users using direct SQL
DO $$
DECLARE
  surgeon_id UUID := gen_random_uuid();
  nurse_id UUID := gen_random_uuid();
  pt_id UUID := gen_random_uuid();
  patient_id UUID := gen_random_uuid();
  default_tenant_id UUID := 'c1234567-89ab-cdef-0123-456789abcdef';
BEGIN
  -- Create Surgeon
  BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      aud,
      role
    ) VALUES (
      surgeon_id,
      '00000000-0000-0000-0000-000000000000',
      'surgeon@tjv.com',
      crypt('demo123!', gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'role', 'provider',
        'first_name', 'Dr. Sarah',
        'last_name', 'Johnson',
        'tenant_id', default_tenant_id,
        'provider_role', 'Surgeon'
      ),
      NOW(),
      NOW(),
      '',
      'authenticated',
      'authenticated'
    );

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      tenant_id,
      created_at,
      updated_at
    ) VALUES (
      surgeon_id,
      'surgeon@tjv.com',
      'Dr. Sarah',
      'Johnson',
      'provider',
      default_tenant_id,
      NOW(),
      NOW()
    );

    -- Create provider record
    INSERT INTO providers (
      profile_id,
      tenant_id,
      department,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      surgeon_id,
      default_tenant_id,
      'Surgeon',
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created surgeon account: surgeon@tjv.com / demo123!';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Surgeon account already exists';
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating surgeon: %', SQLERRM;
  END;

  -- Create Nurse
  BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      aud,
      role
    ) VALUES (
      nurse_id,
      '00000000-0000-0000-0000-000000000000',
      'nurse@tjv.com',
      crypt('demo123!', gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'role', 'provider',
        'first_name', 'Nancy',
        'last_name', 'Williams',
        'tenant_id', default_tenant_id,
        'provider_role', 'Nurse'
      ),
      NOW(),
      NOW(),
      '',
      'authenticated',
      'authenticated'
    );

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      tenant_id,
      created_at,
      updated_at
    ) VALUES (
      nurse_id,
      'nurse@tjv.com',
      'Nancy',
      'Williams',
      'provider',
      default_tenant_id,
      NOW(),
      NOW()
    );

    -- Create provider record
    INSERT INTO providers (
      profile_id,
      tenant_id,
      department,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      nurse_id,
      default_tenant_id,
      'Nurse',
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created nurse account: nurse@tjv.com / demo123!';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Nurse account already exists';
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating nurse: %', SQLERRM;
  END;

  -- Create Physical Therapist
  BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      aud,
      role
    ) VALUES (
      pt_id,
      '00000000-0000-0000-0000-000000000000',
      'pt@tjv.com',
      crypt('demo123!', gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'role', 'provider',
        'first_name', 'Mike',
        'last_name', 'Thompson',
        'tenant_id', default_tenant_id,
        'provider_role', 'Physical Therapist'
      ),
      NOW(),
      NOW(),
      '',
      'authenticated',
      'authenticated'
    );

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      tenant_id,
      created_at,
      updated_at
    ) VALUES (
      pt_id,
      'pt@tjv.com',
      'Mike',
      'Thompson',
      'provider',
      default_tenant_id,
      NOW(),
      NOW()
    );

    -- Create provider record
    INSERT INTO providers (
      profile_id,
      tenant_id,
      department,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      pt_id,
      default_tenant_id,
      'Physical Therapist',
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created PT account: pt@tjv.com / demo123!';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Physical Therapist account already exists';
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating PT: %', SQLERRM;
  END;

  -- Create Patient
  BEGIN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      aud,
      role
    ) VALUES (
      patient_id,
      '00000000-0000-0000-0000-000000000000',
      'patient@tjv.com',
      crypt('demo123!', gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'role', 'patient',
        'first_name', 'John',
        'last_name', 'Smith',
        'tenant_id', default_tenant_id
      ),
      NOW(),
      NOW(),
      '',
      'authenticated',
      'authenticated'
    );

    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      tenant_id,
      created_at,
      updated_at
    ) VALUES (
      patient_id,
      'patient@tjv.com',
      'John',
      'Smith',
      'patient',
      default_tenant_id,
      NOW(),
      NOW()
    );

    -- Create patient record
    INSERT INTO patients (
      profile_id,
      tenant_id,
      mrn,
      surgery_date,
      surgery_type,
      phone_number,
      status,
      created_at,
      updated_at
    ) VALUES (
      patient_id,
      default_tenant_id,
      'MRN123456',
      CURRENT_DATE + INTERVAL '7 days',
      'TKA',
      '5551234567',
      'active',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created patient account: patient@tjv.com / demo123!';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Patient account already exists';
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating patient: %', SQLERRM;
  END;
END $$;

-- Step 5: Create sample protocol
INSERT INTO recovery_protocols (
  tenant_id,
  name,
  description,
  surgery_type,
  is_active,
  created_at,
  updated_at
) VALUES (
  'c1234567-89ab-cdef-0123-456789abcdef',
  'TJV Recovery Protocol',
  'Standard recovery protocol for Total Joint Ventures',
  'TKA',
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_recovery_protocols_surgery_type ON recovery_protocols(surgery_type);

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE '';
  RAISE NOTICE 'Test Accounts Created:';
  RAISE NOTICE '- Surgeon: surgeon@tjv.com / demo123!';
  RAISE NOTICE '- Nurse: nurse@tjv.com / demo123!';
  RAISE NOTICE '- Physical Therapist: pt@tjv.com / demo123!';
  RAISE NOTICE '- Patient: patient@tjv.com / demo123!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test provider signup at /auth/signup';
  RAISE NOTICE '2. Test patient access at /auth/patient-access';
  RAISE NOTICE '3. Login with test accounts at /auth/login';
  RAISE NOTICE '4. Use the auth flow test at /test/auth-flow';
  RAISE NOTICE '';
END $$;