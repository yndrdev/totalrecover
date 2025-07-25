-- Fix user creation for the new provider-only signup flow
-- This migration updates the handle_new_user function and adds phone number support

-- First, add phone_number column to patients table if it doesn't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Update the handle_new_user function to handle provider roles properly
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create or update the provider creation function
CREATE OR REPLACE FUNCTION create_provider_record(
  p_profile_id UUID,
  p_tenant_id UUID,
  p_department VARCHAR,
  p_provider_role VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO providers (
    profile_id,
    tenant_id,
    department,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_profile_id,
    p_tenant_id,
    COALESCE(p_department, p_provider_role, 'General'),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET 
    department = EXCLUDED.department,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users function for easier testing
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS TABLE (
  email TEXT,
  password TEXT,
  role TEXT,
  status TEXT
) AS $$
DECLARE
  surgeon_id UUID;
  nurse_id UUID;
  pt_id UUID;
  patient_id UUID;
  default_tenant_id UUID := 'c1234567-89ab-cdef-0123-456789abcdef';
BEGIN
  -- Create Surgeon
  surgeon_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    surgeon_id,
    'surgeon@tjv.com',
    crypt('demo123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'provider',
      'first_name', 'Dr. Sarah',
      'last_name', 'Johnson',
      'tenant_id', default_tenant_id,
      'provider_role', 'Surgeon'
    )
  );
  
  -- Create provider record for surgeon
  PERFORM create_provider_record(surgeon_id, default_tenant_id, 'Surgeon', 'Surgeon');
  
  -- Create Nurse
  nurse_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    nurse_id,
    'nurse@tjv.com',
    crypt('demo123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'provider',
      'first_name', 'Nancy',
      'last_name', 'Williams',
      'tenant_id', default_tenant_id,
      'provider_role', 'Nurse'
    )
  );
  
  -- Create provider record for nurse
  PERFORM create_provider_record(nurse_id, default_tenant_id, 'Nurse', 'Nurse');
  
  -- Create Physical Therapist
  pt_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    pt_id,
    'pt@tjv.com',
    crypt('demo123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'provider',
      'first_name', 'Mike',
      'last_name', 'Thompson',
      'tenant_id', default_tenant_id,
      'provider_role', 'Physical Therapist'
    )
  );
  
  -- Create provider record for PT
  PERFORM create_provider_record(pt_id, default_tenant_id, 'Physical Therapist', 'Physical Therapist');
  
  -- Create Patient
  patient_id := gen_random_uuid();
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    patient_id,
    'patient@tjv.com',
    crypt('demo123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'patient',
      'first_name', 'John',
      'last_name', 'Smith',
      'tenant_id', default_tenant_id
    )
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
  
  -- Return created users
  RETURN QUERY
  SELECT 'surgeon@tjv.com', 'demo123!', 'Surgeon', 'Created'
  UNION ALL
  SELECT 'nurse@tjv.com', 'demo123!', 'Nurse', 'Created'
  UNION ALL
  SELECT 'pt@tjv.com', 'demo123!', 'Physical Therapist', 'Created'
  UNION ALL
  SELECT 'patient@tjv.com', 'demo123!', 'Patient', 'Created';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION create_provider_record(UUID, UUID, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_users() TO authenticated;

-- Add index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);

-- Add RLS policies for the new phone_number column
CREATE POLICY "Patients can view their own phone number" ON patients
  FOR SELECT USING (auth.uid() = profile_id OR 
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.profile_id = auth.uid()
      AND p.tenant_id = patients.tenant_id
    )
  );

-- Output message
DO $$
BEGIN
  RAISE NOTICE 'User creation fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'To create test users, run: SELECT * FROM create_test_users();';
  RAISE NOTICE '';
  RAISE NOTICE 'Test accounts:';
  RAISE NOTICE '- Surgeon: surgeon@tjv.com / demo123!';
  RAISE NOTICE '- Nurse: nurse@tjv.com / demo123!';
  RAISE NOTICE '- Physical Therapist: pt@tjv.com / demo123!';
  RAISE NOTICE '- Patient: patient@tjv.com / demo123!';
END $$;