-- =============================================
-- Fix User Segregation and Role Management
-- Created: 2025-01-25
-- Purpose: Add missing roles, fix patient-staff relationships, 
--          and ensure proper data consistency
-- =============================================

-- =============================================
-- STEP 1: Update role constraints to include new roles
-- =============================================
-- First, check current constraint on profiles table
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the CHECK constraint name for role column in profiles table
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'profiles'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';
    
    -- Drop the existing constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
    END IF;
    
    -- Add new constraint with all roles
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('patient', 'provider', 'surgeon', 'nurse', 'physical_therapist', 
                    'practice_admin', 'admin', 'clinic_admin', 'practice_admin', 'super_admin'));
END $$;

-- =============================================
-- STEP 2: Add missing staff assignment columns to patients table
-- =============================================
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS primary_nurse_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS physical_therapist_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_patients_primary_nurse_id ON patients(primary_nurse_id);
CREATE INDEX IF NOT EXISTS idx_patients_physical_therapist_id ON patients(physical_therapist_id);

-- Update foreign key constraint for surgeon_id to reference profiles instead of providers
-- First drop the existing constraint if it exists
ALTER TABLE patients 
DROP CONSTRAINT IF EXISTS patients_surgeon_id_fkey;

-- Add new constraint referencing profiles table
ALTER TABLE patients 
ADD CONSTRAINT patients_surgeon_id_fkey 
FOREIGN KEY (surgeon_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================
-- STEP 3: Create trigger functions for automatic record creation
-- =============================================

-- Function to automatically create patient record when user with role='patient' is created
CREATE OR REPLACE FUNCTION auto_create_patient_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if role is 'patient' and no existing patient record
    IF NEW.role = 'patient' AND NOT EXISTS (
        SELECT 1 FROM patients WHERE profile_id = NEW.id
    ) THEN
        INSERT INTO patients (
            profile_id,
            tenant_id,
            mrn,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            -- Generate MRN from email or ID
            COALESCE(SPLIT_PART(NEW.email, '@', 1), NEW.id::TEXT),
            'active',
            NOW(),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create provider record for staff roles
CREATE OR REPLACE FUNCTION auto_create_provider_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Create provider record for staff roles
    IF NEW.role IN ('surgeon', 'nurse', 'physical_therapist', 'provider') 
    AND NOT EXISTS (
        SELECT 1 FROM providers WHERE profile_id = NEW.id
    ) THEN
        INSERT INTO providers (
            profile_id,
            tenant_id,
            specialties,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            ARRAY[CASE 
                WHEN NEW.role = 'surgeon' THEN 'Orthopedic Surgery'
                WHEN NEW.role = 'nurse' THEN 'Nursing'
                WHEN NEW.role = 'physical_therapist' THEN 'Physical Therapy'
                ELSE 'General Practice'
            END],
            true,
            NOW(),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS create_patient_record_on_profile ON profiles;
CREATE TRIGGER create_patient_record_on_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_patient_record();

DROP TRIGGER IF EXISTS create_provider_record_on_profile ON profiles;
CREATE TRIGGER create_provider_record_on_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_provider_record();

-- =============================================
-- STEP 4: Fix existing data - create missing records
-- =============================================

-- Create missing patient records for profiles with role='patient'
INSERT INTO patients (
    profile_id,
    tenant_id,
    mrn,
    status,
    created_at,
    updated_at
)
SELECT 
    p.id,
    p.tenant_id,
    COALESCE(SPLIT_PART(p.email, '@', 1), p.id::TEXT) as mrn,
    'active',
    p.created_at,
    NOW()
FROM profiles p
WHERE p.role = 'patient'
AND NOT EXISTS (
    SELECT 1 FROM patients pat WHERE pat.profile_id = p.id
);

-- Create missing provider records for staff roles
INSERT INTO providers (
    profile_id,
    tenant_id,
    specialties,
    is_active,
    created_at,
    updated_at
)
SELECT 
    p.id,
    p.tenant_id,
    ARRAY[CASE 
        WHEN p.role = 'surgeon' THEN 'Orthopedic Surgery'
        WHEN p.role = 'nurse' THEN 'Nursing'
        WHEN p.role = 'physical_therapist' THEN 'Physical Therapy'
        WHEN p.role = 'provider' THEN 'General Practice'
        ELSE 'Healthcare Professional'
    END],
    true,
    p.created_at,
    NOW()
FROM profiles p
WHERE p.role IN ('surgeon', 'nurse', 'physical_therapist', 'provider', 'admin')
AND NOT EXISTS (
    SELECT 1 FROM providers prov WHERE prov.profile_id = p.id
);

-- =============================================
-- STEP 5: Update existing 'provider' roles to more specific roles
-- =============================================
-- This is optional - only run if you want to convert generic 'provider' to specific roles
-- You might want to do this manually based on actual provider specialties

-- Example: Update providers who are surgeons based on their specialty
-- UPDATE users u
-- SET role = 'surgeon'
-- FROM providers p
-- WHERE u.id = p.user_id
-- AND u.role = 'provider'
-- AND p.is_primary_surgeon = true;

-- =============================================
-- STEP 6: Create helper view for easier patient queries
-- =============================================
CREATE OR REPLACE VIEW patient_assignments AS
SELECT 
    p.id as patient_id,
    p.profile_id,
    p.tenant_id,
    p.mrn,
    p.status,
    p.surgery_date,
    p.surgery_type,
    -- Patient profile info
    prof.email as patient_email,
    COALESCE(prof.first_name || ' ' || prof.last_name, prof.email) as patient_name,
    -- Surgeon info
    surgeon.id as surgeon_id,
    surgeon.email as surgeon_email,
    COALESCE(surgeon.first_name || ' ' || surgeon.last_name, surgeon.email) as surgeon_name,
    -- Nurse info
    nurse.id as nurse_id,
    nurse.email as nurse_email,
    COALESCE(nurse.first_name || ' ' || nurse.last_name, nurse.email) as nurse_name,
    -- Physical Therapist info
    pt.id as pt_id,
    pt.email as pt_email,
    COALESCE(pt.first_name || ' ' || pt.last_name, pt.email) as pt_name,
    -- Primary provider info
    provider.id as primary_provider_id,
    provider.email as primary_provider_email,
    COALESCE(provider.first_name || ' ' || provider.last_name, provider.email) as primary_provider_name
FROM patients p
JOIN profiles prof ON p.profile_id = prof.id
LEFT JOIN profiles surgeon ON p.surgeon_id = surgeon.id
LEFT JOIN profiles nurse ON p.primary_nurse_id = nurse.id
LEFT JOIN profiles pt ON p.physical_therapist_id = pt.id
LEFT JOIN profiles provider ON p.primary_provider_id = provider.id
WHERE prof.role = 'patient';

-- =============================================
-- STEP 7: Add comments for documentation
-- =============================================
COMMENT ON COLUMN patients.primary_nurse_id IS 'Primary nurse assigned to this patient';
COMMENT ON COLUMN patients.physical_therapist_id IS 'Primary physical therapist assigned to this patient';

-- =============================================
-- Verification queries (commented out, run manually to verify)
-- =============================================
-- SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY role;
-- SELECT COUNT(*) as patient_profiles FROM profiles WHERE role = 'patient';
-- SELECT COUNT(*) as patient_records FROM patients;
-- SELECT COUNT(*) as provider_profiles FROM profiles WHERE role IN ('surgeon', 'nurse', 'physical_therapist', 'provider');
-- SELECT COUNT(*) as provider_records FROM providers;