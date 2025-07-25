-- =====================================================
-- BASIC DEMO SEED DATA FOR BASE SCHEMA
-- TJV Recovery Platform - Essential Demo Data
-- =====================================================

-- =====================================================
-- 1. DEMO TENANTS
-- =====================================================

-- Super Admin Tenant
INSERT INTO tenants (id, name, subdomain, tenant_type, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'TJV Recovery Super Admin', 'tjv-admin', 'super_admin', true);

-- Demo Practice
INSERT INTO tenants (id, name, subdomain, tenant_type, parent_tenant_id, is_active) VALUES
('00000000-0000-0000-0000-000000000002', 'Demo Orthopedic Practice', 'demo-practice', 'practice', '00000000-0000-0000-0000-000000000001', true);

-- Demo Clinic
INSERT INTO tenants (id, name, subdomain, tenant_type, parent_tenant_id, is_active) VALUES
('00000000-0000-0000-0000-000000000003', 'Demo Surgery Center', 'demo-clinic', 'clinic', '00000000-0000-0000-0000-000000000002', true);

-- =====================================================
-- 2. DEMO USERS AND PROFILES
-- =====================================================

-- Note: In a real implementation, these would be created through Supabase Auth
-- For demo purposes, we'll create placeholder profiles

-- Super Admin
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, is_active) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@tjvrecovery.com', 'System', 'Administrator', 'super_admin', ARRAY['00000000-0000-0000-0000-000000000001'::UUID, '00000000-0000-0000-0000-000000000002'::UUID, '00000000-0000-0000-0000-000000000003'::UUID], true);

-- Practice Admin
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, is_active) VALUES
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'admin@demo-practice.com', 'Practice', 'Administrator', 'practice_admin', ARRAY['00000000-0000-0000-0000-000000000002'::UUID, '00000000-0000-0000-0000-000000000003'::UUID], true);

-- Surgeon
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, title, specialties, is_active) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'dr.smith@demo-practice.com', 'John', 'Smith', 'surgeon', ARRAY['00000000-0000-0000-0000-000000000002'::UUID, '00000000-0000-0000-0000-000000000003'::UUID], 'Orthopedic Surgeon', ARRAY['Joint Replacement', 'Sports Medicine'], true);

-- Nurse
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, title, is_active) VALUES
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'nurse.johnson@demo-clinic.com', 'Mary', 'Johnson', 'nurse', ARRAY['00000000-0000-0000-0000-000000000003'::UUID], 'Registered Nurse', true);

-- Physical Therapist
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, title, specialties, is_active) VALUES
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'pt.williams@demo-practice.com', 'Sarah', 'Williams', 'physical_therapist', ARRAY['00000000-0000-0000-0000-000000000002'::UUID, '00000000-0000-0000-0000-000000000003'::UUID], 'Physical Therapist', ARRAY['Orthopedic Rehabilitation', 'Post-Surgical Recovery'], true);

-- Demo Patients
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role, accessible_tenants, is_active) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'sarah.johnson@demo.com', 'Sarah', 'Johnson', 'patient', ARRAY['00000000-0000-0000-0000-000000000003'::UUID], true),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'john.smith@demo.com', 'John', 'Smith', 'patient', ARRAY['00000000-0000-0000-0000-000000000003'::UUID], true),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'maria.rodriguez@demo.com', 'Maria', 'Rodriguez', 'patient', ARRAY['00000000-0000-0000-0000-000000000003'::UUID], true);

-- =====================================================
-- 3. DEMO PATIENTS
-- =====================================================

-- Sarah Johnson - Day 5 post-TKA
INSERT INTO patients (
  user_id, tenant_id, surgery_type, surgery_date, surgeon_id, 
  current_recovery_day, activity_level, primary_nurse_id, physical_therapist_id,
  medical_record_number, status
) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'TKA', CURRENT_DATE - INTERVAL '5 days', '10000000-0000-0000-0000-000000000003', 5, 'active', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'MR001', 'active');

-- John Smith - Day 14 post-THA
INSERT INTO patients (
  user_id, tenant_id, surgery_type, surgery_date, surgeon_id, 
  current_recovery_day, activity_level, primary_nurse_id, physical_therapist_id,
  medical_record_number, status
) VALUES
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'THA', CURRENT_DATE - INTERVAL '14 days', '10000000-0000-0000-0000-000000000003', 14, 'active', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'MR002', 'active');

-- Maria Rodriguez - Day 30 post-TKA
INSERT INTO patients (
  user_id, tenant_id, surgery_type, surgery_date, surgeon_id, 
  current_recovery_day, activity_level, primary_nurse_id, physical_therapist_id,
  medical_record_number, status
) VALUES
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'TKA', CURRENT_DATE - INTERVAL '30 days', '10000000-0000-0000-0000-000000000003', 30, 'very_active', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'MR003', 'active');

-- =====================================================
-- 4. DEMO CONVERSATIONS
-- =====================================================

-- Sarah Johnson's daily check-in conversation
INSERT INTO conversations (
  id, patient_id, tenant_id, title, conversation_type, surgery_day, status
) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Daily Check-in - Day 5', 'assessment', 5, 'active');

-- John Smith's conversation
INSERT INTO conversations (
  id, patient_id, tenant_id, title, conversation_type, surgery_day, status
) VALUES
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Daily Check-in - Day 14', 'assessment', 14, 'active');

-- Maria Rodriguez's conversation
INSERT INTO conversations (
  id, patient_id, tenant_id, title, conversation_type, surgery_day, status
) VALUES
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Weekly Assessment - Day 30', 'assessment', 30, 'active');

-- =====================================================
-- 5. DEMO MESSAGES
-- =====================================================

-- Sarah Johnson's messages
INSERT INTO messages (conversation_id, patient_id, content, message_type, sent_at) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Good morning, Sarah! How are you feeling on day 5 of your recovery?', 'ai', NOW() - INTERVAL '2 hours'),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Hi! I''m feeling better today. My pain is about a 4 out of 10.', 'patient', NOW() - INTERVAL '1 hour 45 minutes'),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'That''s great progress! A pain level of 4 is much more manageable. Have you been doing your exercises?', 'ai', NOW() - INTERVAL '1 hour 30 minutes');

-- John Smith's messages
INSERT INTO messages (conversation_id, patient_id, content, message_type, sent_at) VALUES
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Good morning, John! It''s day 14 of your THA recovery. How are you feeling?', 'ai', NOW() - INTERVAL '1 hour'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Much better! I walked to the mailbox yesterday without my walker.', 'patient', NOW() - INTERVAL '45 minutes'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'That''s fantastic progress! Walking without your walker at 2 weeks is excellent.', 'ai', NOW() - INTERVAL '30 minutes');

-- Maria Rodriguez's messages
INSERT INTO messages (conversation_id, patient_id, content, message_type, sent_at) VALUES
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Hi Maria! It''s been 30 days since your TKA surgery. How are you progressing?', 'ai', NOW() - INTERVAL '30 minutes'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'I feel amazing! I''m walking over a mile now and went up stairs normally yesterday.', 'patient', NOW() - INTERVAL '15 minutes'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'That''s incredible progress! You''re ahead of the typical recovery timeline.', 'ai', NOW() - INTERVAL '10 minutes');

-- =====================================================
-- 6. DEMO EXERCISES
-- =====================================================

-- Basic exercises for demo
INSERT INTO exercises (
  id, tenant_id, name, description, instructions, exercise_type, difficulty_level, 
  surgery_types, default_duration, default_repetitions, default_sets, is_active
) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Ankle Pumps', 'Basic circulation exercise', 'Flex and point your foot up and down', 'flexibility', 'beginner', ARRAY['TKA', 'THA'], 5, 20, 3, true),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Quad Sets', 'Strengthen thigh muscles', 'Tighten your thigh muscle and hold', 'strength', 'beginner', ARRAY['TKA'], 10, 10, 3, true),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Hip Flexion', 'Improve hip mobility', 'Slowly bring your knee toward your chest', 'flexibility', 'intermediate', ARRAY['THA'], 10, 10, 2, true);

-- =====================================================
-- 7. DEMO EXERCISE COMPLETIONS
-- =====================================================

-- Sarah Johnson's exercise completions
INSERT INTO exercise_completions (
  patient_id, exercise_id, duration_minutes, repetitions, sets, 
  difficulty_rating, pain_level, status, completed_at
) VALUES
('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 5, 20, 3, 2, 3, 'completed', NOW() - INTERVAL '3 hours'),
('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 8, 8, 2, 3, 4, 'completed', NOW() - INTERVAL '2 hours');

-- John Smith's exercise completions
INSERT INTO exercise_completions (
  patient_id, exercise_id, duration_minutes, repetitions, sets, 
  difficulty_rating, pain_level, status, completed_at
) VALUES
('20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 10, 10, 2, 3, 2, 'completed', NOW() - INTERVAL '1 hour');

-- =====================================================
-- 8. DEMO FORMS
-- =====================================================

-- Daily Assessment Form
INSERT INTO forms (
  id, tenant_id, name, description, form_type, fields, is_active
) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Daily Recovery Assessment', 'Daily check-in for recovery progress', 'daily_assessment', 
'[
  {"name": "pain_level", "type": "scale", "label": "Pain Level (0-10)", "required": true, "min": 0, "max": 10},
  {"name": "mobility", "type": "select", "label": "Mobility Status", "required": true, "options": ["Bed rest", "Walker", "Cane", "Independent"]},
  {"name": "mood", "type": "select", "label": "How is your mood?", "required": false, "options": ["Excellent", "Good", "Fair", "Poor"]}
]'::jsonb, true);

-- =====================================================
-- 9. DEMO FORM RESPONSES
-- =====================================================

-- Sarah Johnson's form response
INSERT INTO form_responses (
  patient_id, form_id, responses, completion_percentage, status, completed_at
) VALUES
('20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 
'{"pain_level": 4, "mobility": "Walker", "mood": "Good"}'::jsonb, 100, 'completed', NOW() - INTERVAL '1 hour');

-- =====================================================
-- 10. DEMO TASKS
-- =====================================================

-- Assign tasks to patients
INSERT INTO patient_tasks (
  patient_id, tenant_id, title, description, task_type, exercise_id, 
  assigned_date, due_date, surgery_day, status, assigned_by
) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Morning Ankle Pumps', 'Complete ankle pump exercises', 'exercise', '40000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE, 5, 'completed', '10000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Hip Mobility Exercise', 'Work on hip flexion', 'exercise', '40000000-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE, 14, 'completed', '10000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Daily Assessment', 'Complete daily recovery check-in', 'form', null, CURRENT_DATE, CURRENT_DATE, 30, 'assigned', '10000000-0000-0000-0000-000000000004');

-- =====================================================
-- 11. UPDATE STATISTICS
-- =====================================================

-- Update table statistics for better query performance
ANALYZE tenants;
ANALYZE profiles;
ANALYZE patients;
ANALYZE conversations;
ANALYZE messages;
ANALYZE exercises;
ANALYZE exercise_completions;
ANALYZE forms;
ANALYZE form_responses;
ANALYZE patient_tasks;

