-- Fix for user creation issues
-- This script updates the handle_new_user function to handle the tenant_id properly

-- First, let's update the handle_new_user function to use the default tenant
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role, tenant_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE(
            (NEW.raw_user_meta_data->>'tenant_id')::UUID, 
            'c1234567-89ab-cdef-0123-456789abcdef'::UUID  -- Default tenant
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also, let's add a temporary workaround to manually create test users
-- This creates a function to manually add users with proper profiles

CREATE OR REPLACE FUNCTION create_test_user(
    user_email TEXT,
    user_password TEXT,
    user_role TEXT,
    first_name TEXT DEFAULT NULL,
    last_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- First check if user already exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
    
    IF new_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'User with email % already exists', user_email;
    END IF;
    
    -- Create the auth user (this is a placeholder - in reality you'd use Supabase's auth API)
    -- For now, return a generated UUID
    new_user_id := gen_random_uuid();
    
    -- Create the profile
    INSERT INTO profiles (
        id, 
        email, 
        role, 
        tenant_id,
        first_name,
        last_name
    ) VALUES (
        new_user_id,
        user_email,
        user_role,
        'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
        first_name,
        last_name
    );
    
    -- If it's a provider role, create provider record
    IF user_role IN ('provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin') THEN
        INSERT INTO providers (
            profile_id,
            tenant_id,
            is_active
        ) VALUES (
            new_user_id,
            'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
            true
        );
    END IF;
    
    -- If it's a patient role, create patient record
    IF user_role = 'patient' THEN
        INSERT INTO patients (
            profile_id,
            tenant_id,
            status
        ) VALUES (
            new_user_id,
            'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
            'active'
        );
    END IF;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_test_user TO anon;
GRANT EXECUTE ON FUNCTION create_test_user TO authenticated;