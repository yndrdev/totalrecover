-- =============================================
-- Adapt Database Structure for Multi-tenant Healthcare Demo
-- =============================================
-- This migration adapts the existing structure to support the specific
-- demo requirements with practices, staff, and patient tagging

-- Add patient_type to patients table to distinguish preop/postop
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS patient_type TEXT CHECK (patient_type IN ('preop', 'postop')) DEFAULT 'postop';

-- Create a more user-friendly view for staff (providers)
CREATE OR REPLACE VIEW staff AS
SELECT 
    p.id,
    p.profile_id,
    p.tenant_id,
    pr.first_name,
    pr.last_name,
    pr.email,
    pr.phone,
    pr.role,
    p.license_number,
    p.specialties,
    p.department,
    p.is_active,
    p.created_at,
    p.updated_at
FROM providers p
JOIN profiles pr ON pr.id = p.profile_id;

-- Create a view for staff_patient_tags (alias for provider_patient_assignments)
CREATE OR REPLACE VIEW staff_patient_tags AS
SELECT 
    id,
    provider_id as staff_id,
    patient_id,
    tenant_id,
    assignment_type as tag_type,
    status,
    assigned_at as tagged_at,
    assigned_by as tagged_by,
    notes,
    created_at,
    updated_at
FROM provider_patient_assignments;

-- Add days_relative_to_surgery to track preop/postop timeline
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS days_relative_to_surgery INTEGER GENERATED ALWAYS AS (
    CASE 
        WHEN surgery_date IS NULL THEN NULL
        WHEN patient_type = 'preop' THEN DATE_PART('day', surgery_date - CURRENT_DATE)::INTEGER
        WHEN patient_type = 'postop' THEN DATE_PART('day', CURRENT_DATE - surgery_date)::INTEGER
        ELSE NULL
    END
) STORED;

-- Create simplified task categories for demo
CREATE TABLE IF NOT EXISTS task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    patient_type TEXT NOT NULL CHECK (patient_type IN ('preop', 'postop', 'both')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default task categories
INSERT INTO task_categories (name, description, patient_type, display_order) VALUES
    ('Forms', 'Medical forms and documentation', 'both', 1),
    ('Videos', 'Educational and instructional videos', 'both', 2),
    ('Assessments', 'Health and recovery assessments', 'postop', 3),
    ('Exercises', 'Physical therapy exercises', 'postop', 4),
    ('Preparation', 'Pre-surgery preparation tasks', 'preop', 5)
ON CONFLICT (name) DO NOTHING;

-- Add category reference to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES task_categories(id);

-- Create helper function to assign all staff to a patient
CREATE OR REPLACE FUNCTION assign_all_staff_to_patient(
    p_patient_id UUID,
    p_tenant_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Assign all active staff (providers) in the tenant to this patient
    INSERT INTO provider_patient_assignments (
        provider_id,
        patient_id,
        tenant_id,
        assignment_type,
        status,
        assigned_by
    )
    SELECT 
        p.id,
        p_patient_id,
        p_tenant_id,
        'primary',
        'active',
        p.profile_id -- self-assigned for demo
    FROM providers p
    WHERE p.tenant_id = p_tenant_id
    AND p.is_active = true
    ON CONFLICT (provider_id, patient_id, assignment_type) 
    DO UPDATE SET 
        status = 'active',
        assigned_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create helper function to generate preop tasks
CREATE OR REPLACE FUNCTION generate_preop_tasks(
    p_protocol_id UUID,
    p_tenant_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Medical History Form (Day -5)
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES (
        p_protocol_id,
        p_tenant_id,
        -5,
        'form',
        'Complete Medical History Form',
        'Please complete your comprehensive medical history form',
        jsonb_build_object(
            'form_type', 'medical_history',
            'required_fields', jsonb_build_array('medications', 'allergies', 'medical_conditions', 'previous_surgeries'),
            'estimated_time_minutes', 15
        ),
        (SELECT id FROM task_categories WHERE name = 'Forms')
    );

    -- Insurance Verification (Day -4)
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES (
        p_protocol_id,
        p_tenant_id,
        -4,
        'form',
        'Insurance Verification',
        'Upload your insurance card and complete verification',
        jsonb_build_object(
            'form_type', 'insurance_verification',
            'requires_upload', true,
            'upload_types', jsonb_build_array('insurance_card_front', 'insurance_card_back')
        ),
        (SELECT id FROM task_categories WHERE name = 'Forms')
    );

    -- Pre-Surgery Education Video (Day -3)
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES (
        p_protocol_id,
        p_tenant_id,
        -3,
        'video',
        'Watch Pre-Surgery Education Video',
        'Important information about your upcoming surgery',
        jsonb_build_object(
            'video_url', 'https://example.com/presurgery-education',
            'duration_minutes', 20,
            'requires_completion_confirmation', true
        ),
        (SELECT id FROM task_categories WHERE name = 'Videos')
    );

    -- Home Preparation Checklist (Day -2)
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES (
        p_protocol_id,
        p_tenant_id,
        -2,
        'form',
        'Home Preparation Checklist',
        'Ensure your home is ready for recovery',
        jsonb_build_object(
            'checklist_items', jsonb_build_array(
                'Remove trip hazards',
                'Install grab bars',
                'Prepare recovery area',
                'Stock medications',
                'Arrange transportation'
            )
        ),
        (SELECT id FROM task_categories WHERE name = 'Preparation')
    );

    -- Pre-Admission Testing (Day -1)
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES (
        p_protocol_id,
        p_tenant_id,
        -1,
        'form',
        'Complete Pre-Admission Testing',
        'Confirm completion of required lab work and tests',
        jsonb_build_object(
            'required_tests', jsonb_build_array('Blood work', 'EKG', 'Chest X-ray'),
            'requires_confirmation', true
        ),
        (SELECT id FROM task_categories WHERE name = 'Preparation')
    );
END;
$$ LANGUAGE plpgsql;

-- Create helper function to generate postop tasks
CREATE OR REPLACE FUNCTION generate_postop_tasks(
    p_protocol_id UUID,
    p_tenant_id UUID
)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    -- Daily pain assessment for first 14 days
    FOR i IN 1..14 LOOP
        INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
        VALUES (
            p_protocol_id,
            p_tenant_id,
            i,
            'form',
            'Daily Pain Assessment',
            'Rate your pain level and describe any concerns',
            jsonb_build_object(
                'form_type', 'pain_assessment',
                'fields', jsonb_build_array(
                    jsonb_build_object('name', 'pain_level', 'type', 'scale', 'min', 0, 'max', 10),
                    jsonb_build_object('name', 'pain_location', 'type', 'text'),
                    jsonb_build_object('name', 'medication_taken', 'type', 'boolean')
                )
            ),
            (SELECT id FROM task_categories WHERE name = 'Assessments')
        );
    END LOOP;

    -- Exercise videos - Days 1, 3, 5, 7, 10, 14
    FOR i IN ARRAY[1, 3, 5, 7, 10, 14] LOOP
        INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
        VALUES (
            p_protocol_id,
            p_tenant_id,
            i,
            'exercise',
            'Physical Therapy Exercises - Day ' || i,
            'Complete your prescribed exercises and log completion',
            jsonb_build_object(
                'exercise_set', 'post_surgery_week_' || CEIL(i/7.0),
                'duration_minutes', 30,
                'exercises', jsonb_build_array(
                    'Ankle pumps',
                    'Quad sets',
                    'Heel slides',
                    'Straight leg raises'
                )
            ),
            (SELECT id FROM task_categories WHERE name = 'Exercises')
        );
    END LOOP;

    -- Recovery milestone videos
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES 
        (p_protocol_id, p_tenant_id, 7, 'video', 'Week 1 Recovery Check-In', 
         'Watch this video about what to expect in week 1', 
         jsonb_build_object('video_url', 'https://example.com/week1-recovery'),
         (SELECT id FROM task_categories WHERE name = 'Videos')),
        
        (p_protocol_id, p_tenant_id, 14, 'video', 'Week 2 Recovery Progress', 
         'Important milestones and goals for week 2',
         jsonb_build_object('video_url', 'https://example.com/week2-recovery'),
         (SELECT id FROM task_categories WHERE name = 'Videos'));

    -- Recovery assessment forms
    INSERT INTO tasks (protocol_id, tenant_id, day, task_type, title, description, content_data, category_id)
    VALUES 
        (p_protocol_id, p_tenant_id, 7, 'form', 'Week 1 Recovery Assessment', 
         'Complete your weekly recovery assessment',
         jsonb_build_object(
             'form_type', 'weekly_assessment',
             'includes_photo_upload', true
         ),
         (SELECT id FROM task_categories WHERE name = 'Assessments')),
        
        (p_protocol_id, p_tenant_id, 14, 'form', 'Week 2 Recovery Assessment', 
         'Complete your bi-weekly recovery assessment',
         jsonb_build_object(
             'form_type', 'weekly_assessment',
             'includes_range_of_motion', true
         ),
         (SELECT id FROM task_categories WHERE name = 'Assessments'));
END;
$$ LANGUAGE plpgsql;

-- Function to create complete demo protocol with tasks
CREATE OR REPLACE FUNCTION create_demo_protocol(
    p_tenant_id UUID,
    p_name TEXT,
    p_patient_type TEXT
)
RETURNS UUID AS $$
DECLARE
    v_protocol_id UUID;
BEGIN
    -- Create the protocol
    INSERT INTO recovery_protocols (
        tenant_id,
        name,
        description,
        surgery_types,
        timeline_start,
        timeline_end,
        is_active
    ) VALUES (
        p_tenant_id,
        p_name,
        'Demo protocol for ' || p_patient_type || ' patients',
        ARRAY['Total Knee Replacement', 'Total Hip Replacement'],
        CASE WHEN p_patient_type = 'preop' THEN -5 ELSE 0 END,
        CASE WHEN p_patient_type = 'preop' THEN 0 ELSE 30 END,
        true
    ) RETURNING id INTO v_protocol_id;

    -- Generate appropriate tasks
    IF p_patient_type = 'preop' THEN
        PERFORM generate_preop_tasks(v_protocol_id, p_tenant_id);
    ELSE
        PERFORM generate_postop_tasks(v_protocol_id, p_tenant_id);
    END IF;

    RETURN v_protocol_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON COLUMN patients.patient_type IS 'Patient classification: preop (before surgery) or postop (after surgery)';
COMMENT ON VIEW staff IS 'User-friendly view of providers as staff members';
COMMENT ON VIEW staff_patient_tags IS 'User-friendly view of provider-patient assignments as staff-patient tags';