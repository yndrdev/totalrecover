-- =============================================
-- SEED DEMO DATA FOR MULTI-TENANT HEALTHCARE APP
-- =============================================
-- This migration creates demo data including:
-- 1 practice, 3 staff members, 2 patients, tasks, and relationships

-- Use or create the demo tenant
DO $$
DECLARE
    v_tenant_id UUID;
    v_surgeon_profile_id UUID;
    v_nurse_profile_id UUID;
    v_pt_profile_id UUID;
    v_patient1_profile_id UUID;
    v_patient2_profile_id UUID;
    v_surgeon_id UUID;
    v_nurse_id UUID;
    v_pt_id UUID;
    v_patient1_id UUID;
    v_patient2_id UUID;
    v_preop_protocol_id UUID;
    v_postop_protocol_id UUID;
    v_patient1_protocol_id UUID;
    v_patient2_protocol_id UUID;
BEGIN
    -- Get or create demo tenant
    SELECT id INTO v_tenant_id FROM tenants WHERE subdomain = 'tjv';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, subdomain, settings)
        VALUES (
            'Demo Healthcare Practice',
            'tjv',
            jsonb_build_object(
                'features', jsonb_build_object(
                    'chat_enabled', true,
                    'video_calls_enabled', true,
                    'ai_assistant_enabled', true
                ),
                'branding', jsonb_build_object(
                    'primary_color', '#2563eb',
                    'logo_url', '/logo.png',
                    'name', 'TJV Recovery Center'
                )
            )
        ) RETURNING id INTO v_tenant_id;
    END IF;

    -- Create auth users and profiles for staff
    
    -- Dr. Sarah Chen (Surgeon)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'dr.chen@demo.tjv.com',
        crypt('DemoPass123!', gen_salt('bf')),
        NOW(),
        jsonb_build_object('role', 'surgeon', 'tenant_id', v_tenant_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_surgeon_profile_id;

    INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, phone)
    VALUES (
        v_surgeon_profile_id,
        v_tenant_id,
        'dr.chen@demo.tjv.com',
        'Sarah',
        'Chen',
        'surgeon',
        '+1234567890'
    );

    INSERT INTO providers (profile_id, tenant_id, license_number, specialties, department)
    VALUES (
        v_surgeon_profile_id,
        v_tenant_id,
        'MD-2024-12345',
        ARRAY['Orthopedic Surgery', 'Joint Replacement'],
        'Orthopedics'
    ) RETURNING id INTO v_surgeon_id;

    -- Jane Smith (Nurse)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'jane.smith@demo.tjv.com',
        crypt('DemoPass123!', gen_salt('bf')),
        NOW(),
        jsonb_build_object('role', 'nurse', 'tenant_id', v_tenant_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_nurse_profile_id;

    INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, phone)
    VALUES (
        v_nurse_profile_id,
        v_tenant_id,
        'jane.smith@demo.tjv.com',
        'Jane',
        'Smith',
        'nurse',
        '+1234567891'
    );

    INSERT INTO providers (profile_id, tenant_id, license_number, specialties, department)
    VALUES (
        v_nurse_profile_id,
        v_tenant_id,
        'RN-2024-67890',
        ARRAY['Surgical Nursing', 'Patient Care'],
        'Nursing'
    ) RETURNING id INTO v_nurse_id;

    -- Michael Rodriguez (Physical Therapist)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'michael.rodriguez@demo.tjv.com',
        crypt('DemoPass123!', gen_salt('bf')),
        NOW(),
        jsonb_build_object('role', 'physical_therapist', 'tenant_id', v_tenant_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_pt_profile_id;

    INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, phone)
    VALUES (
        v_pt_profile_id,
        v_tenant_id,
        'michael.rodriguez@demo.tjv.com',
        'Michael',
        'Rodriguez',
        'physical_therapist',
        '+1234567892'
    );

    INSERT INTO providers (profile_id, tenant_id, license_number, specialties, department)
    VALUES (
        v_pt_profile_id,
        v_tenant_id,
        'PT-2024-11111',
        ARRAY['Orthopedic Rehabilitation', 'Post-Surgical Recovery'],
        'Physical Therapy'
    ) RETURNING id INTO v_pt_id;

    -- Create patients
    
    -- John Doe (Preop Patient - 5 days before surgery)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'john.doe@demo.com',
        crypt('DemoPass123!', gen_salt('bf')),
        NOW(),
        jsonb_build_object('role', 'patient', 'tenant_id', v_tenant_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_patient1_profile_id;

    INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, phone)
    VALUES (
        v_patient1_profile_id,
        v_tenant_id,
        'john.doe@demo.com',
        'John',
        'Doe',
        'patient',
        '+1234567893'
    );

    INSERT INTO patients (
        profile_id, 
        tenant_id, 
        mrn, 
        date_of_birth, 
        surgery_date, 
        surgery_type, 
        surgeon_id,
        primary_provider_id,
        patient_type,
        emergency_contact,
        medical_history,
        status
    ) VALUES (
        v_patient1_profile_id,
        v_tenant_id,
        'MRN-2025-001',
        '1960-05-15'::DATE,
        CURRENT_DATE + INTERVAL '5 days',
        'Total Knee Replacement - Right',
        v_surgeon_id,
        v_surgeon_id,
        'preop',
        jsonb_build_object(
            'name', 'Jane Doe',
            'relationship', 'Spouse',
            'phone', '+1234567894'
        ),
        jsonb_build_object(
            'conditions', ARRAY['Hypertension', 'Type 2 Diabetes'],
            'medications', ARRAY['Metformin', 'Lisinopril'],
            'allergies', ARRAY['Penicillin']
        ),
        'active'
    ) RETURNING id INTO v_patient1_id;

    -- Mary Johnson (Postop Patient - 10 days after surgery)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'mary.johnson@demo.com',
        crypt('DemoPass123!', gen_salt('bf')),
        NOW(),
        jsonb_build_object('role', 'patient', 'tenant_id', v_tenant_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_patient2_profile_id;

    INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, phone)
    VALUES (
        v_patient2_profile_id,
        v_tenant_id,
        'mary.johnson@demo.com',
        'Mary',
        'Johnson',
        'patient',
        '+1234567895'
    );

    INSERT INTO patients (
        profile_id, 
        tenant_id, 
        mrn, 
        date_of_birth, 
        surgery_date, 
        surgery_type, 
        surgeon_id,
        primary_provider_id,
        patient_type,
        emergency_contact,
        medical_history,
        status
    ) VALUES (
        v_patient2_profile_id,
        v_tenant_id,
        'MRN-2025-002',
        '1955-08-22'::DATE,
        CURRENT_DATE - INTERVAL '10 days',
        'Total Hip Replacement - Left',
        v_surgeon_id,
        v_surgeon_id,
        'postop',
        jsonb_build_object(
            'name', 'Robert Johnson',
            'relationship', 'Son',
            'phone', '+1234567896'
        ),
        jsonb_build_object(
            'conditions', ARRAY['Osteoarthritis', 'High Cholesterol'],
            'medications', ARRAY['Atorvastatin', 'Acetaminophen'],
            'allergies', ARRAY['Sulfa drugs']
        ),
        'active'
    ) RETURNING id INTO v_patient2_id;

    -- Create protocols and generate tasks
    SELECT create_demo_protocol(v_tenant_id, 'Preop Protocol - Total Joint Replacement', 'preop') 
    INTO v_preop_protocol_id;
    
    SELECT create_demo_protocol(v_tenant_id, 'Postop Protocol - Total Joint Replacement', 'postop') 
    INTO v_postop_protocol_id;

    -- Assign protocols to patients
    INSERT INTO patient_protocols (
        patient_id, 
        protocol_id, 
        tenant_id, 
        assigned_by, 
        surgery_date, 
        status
    ) VALUES (
        v_patient1_id,
        v_preop_protocol_id,
        v_tenant_id,
        v_surgeon_profile_id,
        CURRENT_DATE + INTERVAL '5 days',
        'active'
    ) RETURNING id INTO v_patient1_protocol_id;

    INSERT INTO patient_protocols (
        patient_id, 
        protocol_id, 
        tenant_id, 
        assigned_by, 
        surgery_date, 
        status
    ) VALUES (
        v_patient2_id,
        v_postop_protocol_id,
        v_tenant_id,
        v_surgeon_profile_id,
        CURRENT_DATE - INTERVAL '10 days',
        'active'
    ) RETURNING id INTO v_patient2_protocol_id;

    -- Generate patient tasks based on protocols
    INSERT INTO patient_tasks (
        patient_protocol_id,
        task_id,
        tenant_id,
        scheduled_date,
        status
    )
    SELECT 
        v_patient1_protocol_id,
        t.id,
        v_tenant_id,
        (CURRENT_DATE + INTERVAL '5 days') + (t.day || ' days')::INTERVAL,
        CASE 
            WHEN t.day < -5 THEN 'completed'
            WHEN t.day = -5 THEN 'in_progress'
            ELSE 'pending'
        END
    FROM tasks t
    WHERE t.protocol_id = v_preop_protocol_id;

    -- For postop patient, mark some tasks as completed
    INSERT INTO patient_tasks (
        patient_protocol_id,
        task_id,
        tenant_id,
        scheduled_date,
        status,
        completed_at,
        completion_data
    )
    SELECT 
        v_patient2_protocol_id,
        t.id,
        v_tenant_id,
        (CURRENT_DATE - INTERVAL '10 days') + (t.day || ' days')::INTERVAL,
        CASE 
            WHEN t.day <= 10 THEN 'completed'
            ELSE 'pending'
        END,
        CASE 
            WHEN t.day <= 10 THEN NOW() - ((10 - t.day) || ' days')::INTERVAL
            ELSE NULL
        END,
        CASE 
            WHEN t.day <= 10 AND t.task_type = 'form' THEN 
                jsonb_build_object(
                    'pain_level', FLOOR(RANDOM() * 5 + 1)::INT,
                    'completed_by', 'patient'
                )
            ELSE NULL
        END
    FROM tasks t
    WHERE t.protocol_id = v_postop_protocol_id;

    -- Create staff-patient assignments (all staff assigned to both patients)
    PERFORM assign_all_staff_to_patient(v_patient1_id, v_tenant_id);
    PERFORM assign_all_staff_to_patient(v_patient2_id, v_tenant_id);

    -- Create conversations for each patient
    INSERT INTO conversations (tenant_id, patient_id, provider_id, status)
    VALUES 
        (v_tenant_id, v_patient1_id, v_surgeon_id, 'active'),
        (v_tenant_id, v_patient2_id, v_surgeon_id, 'active');

    -- Add some sample messages
    INSERT INTO messages (
        conversation_id, 
        tenant_id, 
        sender_id, 
        content, 
        message_type,
        is_read,
        read_at
    )
    SELECT 
        c.id,
        v_tenant_id,
        CASE 
            WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY c.id) % 2 = 1 
            THEN c.patient_id 
            ELSE v_surgeon_profile_id 
        END,
        CASE 
            WHEN c.patient_id = v_patient1_id THEN
                CASE ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY c.id)
                    WHEN 1 THEN 'Hello Dr. Chen, I have some questions about my upcoming surgery.'
                    WHEN 2 THEN 'Hi John, I''d be happy to answer your questions. What would you like to know?'
                    WHEN 3 THEN 'How long will I need to stay in the hospital?'
                    WHEN 4 THEN 'For a knee replacement, most patients stay 1-2 nights. We''ll monitor your progress.'
                END
            ELSE
                CASE ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY c.id)
                    WHEN 1 THEN 'Dr. Chen, my pain has decreased significantly today!'
                    WHEN 2 THEN 'That''s wonderful news, Mary! Keep up with your exercises.'
                    WHEN 3 THEN 'I completed all my PT exercises this morning.'
                    WHEN 4 THEN 'Excellent! Your dedication to recovery is showing great results.'
                END
        END,
        'text',
        true,
        NOW() - INTERVAL '1 hour'
    FROM conversations c
    CROSS JOIN generate_series(1, 4) AS n(num)
    WHERE c.tenant_id = v_tenant_id;

    -- Log the demo data creation
    INSERT INTO audit_logs (
        tenant_id,
        action,
        resource_type,
        details
    ) VALUES (
        v_tenant_id,
        'demo_data_created',
        'seed_data',
        jsonb_build_object(
            'staff_created', 3,
            'patients_created', 2,
            'protocols_created', 2,
            'timestamp', NOW()
        )
    );

    RAISE NOTICE 'Demo data created successfully!';
    RAISE NOTICE 'Staff accounts:';
    RAISE NOTICE '  - dr.chen@demo.tjv.com (Surgeon)';
    RAISE NOTICE '  - jane.smith@demo.tjv.com (Nurse)';
    RAISE NOTICE '  - michael.rodriguez@demo.tjv.com (Physical Therapist)';
    RAISE NOTICE 'Patient accounts:';
    RAISE NOTICE '  - john.doe@demo.com (Preop - 5 days before surgery)';
    RAISE NOTICE '  - mary.johnson@demo.com (Postop - 10 days after surgery)';
    RAISE NOTICE 'All passwords: DemoPass123!';
END $$;