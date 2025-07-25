-- =====================================================
-- DEMO DATA POPULATION
-- Run this AFTER creating test users to add realistic demo data
-- =====================================================

-- This script assumes you have created users via the registration form
-- It will add realistic demo data to make the demo more impressive

-- 1. ADD DEMO CONVERSATIONS AND MESSAGES
-- =====================================================

-- Insert demo conversations for patients
INSERT INTO conversations (id, patient_id, tenant_id, title, total_messages, last_activity_at)
SELECT 
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Recovery Chat - Day ' || EXTRACT(DAY FROM (CURRENT_DATE - p.surgery_date)),
  15 + (RANDOM() * 20)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '2 hours')
FROM patients p
ON CONFLICT DO NOTHING;

-- Insert demo messages for conversations
INSERT INTO messages (conversation_id, tenant_id, sender_type, content, created_at)
SELECT 
  c.id,
  c.tenant_id,
  'ai',
  'Good morning! How are you feeling today? Let''s start with your daily check-in.',
  NOW() - INTERVAL '2 hours'
FROM conversations c;

INSERT INTO messages (conversation_id, tenant_id, sender_type, content, created_at)
SELECT 
  c.id,
  c.tenant_id,
  'patient',
  'I''m feeling better today! The knee is less stiff than yesterday.',
  NOW() - INTERVAL '1 hour 45 minutes'
FROM conversations c;

INSERT INTO messages (conversation_id, tenant_id, sender_type, content, created_at)
SELECT 
  c.id,
  c.tenant_id,
  'ai',
  'That''s wonderful progress! Let''s work on your knee flexion exercises. I''ll guide you through 10 reps.',
  NOW() - INTERVAL '1 hour 30 minutes'
FROM conversations c;

INSERT INTO messages (conversation_id, tenant_id, sender_type, content, created_at)
SELECT 
  c.id,
  c.tenant_id,
  'patient',
  'Just completed the exercises! My range of motion definitely feels better.',
  NOW() - INTERVAL '1 hour'
FROM conversations c;

INSERT INTO messages (conversation_id, tenant_id, sender_type, content, created_at)
SELECT 
  c.id,
  c.tenant_id,
  'ai',
  'Excellent work! Your recovery is progressing well. Remember to ice for 15 minutes after exercises.',
  NOW() - INTERVAL '30 minutes'
FROM conversations c;

-- 2. ADD REALISTIC PATIENT DATA
-- =====================================================

-- Update patients with more realistic surgery dates and info
UPDATE patients SET 
  surgery_date = CURRENT_DATE - INTERVAL '7 days',
  surgery_type = 'TKA',
  phone = '+1 (555) 123-4567',
  address = '123 Main St',
  city = 'Atlanta',
  state = 'GA',
  zip_code = '30309',
  date_of_birth = '1965-03-15'
WHERE first_name = 'Sarah';

UPDATE patients SET 
  surgery_date = CURRENT_DATE - INTERVAL '14 days',
  surgery_type = 'THA',
  phone = '+1 (555) 987-6543',
  address = '456 Oak Ave',
  city = 'Atlanta',
  state = 'GA',
  zip_code = '30309',
  date_of_birth = '1972-08-22'
WHERE first_name = 'Mike';

-- 3. ADD DEMO FORMS AND RESPONSES
-- =====================================================

-- Create demo forms
INSERT INTO forms (id, tenant_id, name, description, form_type, form_schema, is_active)
VALUES 
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Daily Pain Assessment',
    'Track your daily pain levels and recovery progress',
    'daily_checkin',
    '{"fields": [{"name": "pain_level", "type": "scale", "label": "Pain Level (1-10)", "required": true}, {"name": "mobility", "type": "scale", "label": "Mobility (1-10)", "required": true}, {"name": "sleep_quality", "type": "scale", "label": "Sleep Quality (1-10)", "required": true}]}',
    true
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Weekly Progress Check',
    'Comprehensive weekly assessment of recovery progress',
    'assessment',
    '{"fields": [{"name": "range_of_motion", "type": "number", "label": "Range of Motion (degrees)", "required": true}, {"name": "walking_distance", "type": "number", "label": "Walking Distance (feet)", "required": true}, {"name": "medication_changes", "type": "text", "label": "Any medication changes?", "required": false}]}',
    true
  );

-- Create demo exercises
INSERT INTO exercises (id, tenant_id, name, description, instructions, exercise_type, difficulty_level, default_repetitions, default_sets, is_active)
VALUES 
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Knee Flexion',
    'Improve knee bending range of motion',
    'Sit in a chair and slowly bend your knee, bringing your heel toward your buttocks. Hold for 5 seconds, then slowly lower.',
    'range_of_motion',
    2,
    10,
    3,
    true
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Straight Leg Raises',
    'Strengthen quadriceps muscles',
    'Lie flat on your back. Keeping your leg straight, lift it 6 inches off the ground. Hold for 3 seconds, then lower slowly.',
    'strengthening',
    3,
    8,
    2,
    true
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Walking Program',
    'Build endurance and mobility',
    'Walk at a comfortable pace for the prescribed duration. Use assistive devices as needed.',
    'endurance',
    1,
    1,
    1,
    true
  );

-- 4. CREATE DEMO TASKS
-- =====================================================

-- Create demo tasks for patients
INSERT INTO patient_tasks (id, patient_id, tenant_id, title, description, task_type, assigned_date, status)
SELECT 
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Complete Daily Pain Assessment',
  'Rate your pain, mobility, and sleep quality on a scale of 1-10',
  'assessment',
  CURRENT_DATE,
  'completed'
FROM patients p WHERE first_name = 'Sarah';

INSERT INTO patient_tasks (id, patient_id, tenant_id, title, description, task_type, assigned_date, status)
SELECT 
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Knee Flexion Exercises',
  'Complete 10 reps x 3 sets of knee flexion exercises',
  'exercise',
  CURRENT_DATE,
  'completed'
FROM patients p WHERE first_name = 'Sarah';

INSERT INTO patient_tasks (id, patient_id, tenant_id, title, description, task_type, assigned_date, status)
SELECT 
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Walking Program - 10 minutes',
  'Walk for 10 minutes at a comfortable pace',
  'exercise',
  CURRENT_DATE,
  'pending'
FROM patients p WHERE first_name = 'Sarah';

-- Tasks for Mike
INSERT INTO patient_tasks (id, patient_id, tenant_id, title, description, task_type, assigned_date, status)
SELECT 
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Hip Mobility Assessment',
  'Complete range of motion measurements',
  'assessment',
  CURRENT_DATE,
  'pending'
FROM patients p WHERE first_name = 'Mike';

-- 5. UPDATE PROFILES WITH BETTER INFORMATION
-- =====================================================

-- Update provider profiles with more professional information
UPDATE profiles SET 
  full_name = 'Dr. Robert Smith, MD',
  onboarding_completed = true,
  email_verified = true
WHERE email = 'dr.smith@tjvrecovery.com';

UPDATE profiles SET 
  full_name = 'Linda Jones, RN',
  onboarding_completed = true,
  email_verified = true
WHERE email = 'nurse.jones@tjvrecovery.com';

UPDATE profiles SET 
  full_name = 'Sarah Johnson',
  onboarding_completed = true,
  email_verified = true
WHERE email = 'sarah.patient@tjvrecovery.com';

UPDATE profiles SET 
  full_name = 'Mike Wilson',
  onboarding_completed = true,
  email_verified = true
WHERE email = 'mike.patient@tjvrecovery.com';

-- Update provider records
UPDATE providers SET 
  phone = '+1 (555) 200-1001',
  address = '789 Medical Plaza',
  city = 'Atlanta',
  state = 'GA',
  zip_code = '30309'
WHERE first_name = 'Dr. Robert';

UPDATE providers SET 
  phone = '+1 (555) 200-1002',
  address = '789 Medical Plaza',
  city = 'Atlanta',
  state = 'GA',
  zip_code = '30309'
WHERE first_name = 'Linda';

-- 6. SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: Demo data populated!' as message;
SELECT 'Your demo environment is ready!' as status;

-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check what we created
SELECT 'PATIENTS:' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'PROVIDERS:', COUNT(*) FROM providers  
UNION ALL
SELECT 'CONVERSATIONS:', COUNT(*) FROM conversations
UNION ALL
SELECT 'MESSAGES:', COUNT(*) FROM messages
UNION ALL
SELECT 'FORMS:', COUNT(*) FROM forms
UNION ALL
SELECT 'EXERCISES:', COUNT(*) FROM exercises
UNION ALL
SELECT 'PATIENT_TASKS:', COUNT(*) FROM patient_tasks;