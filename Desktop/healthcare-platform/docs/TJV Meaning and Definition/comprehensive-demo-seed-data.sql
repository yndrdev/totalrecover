-- =====================================================
-- COMPREHENSIVE DEMO AND TESTING SEED DATA
-- TJV Recovery Platform - Complete Demo Environment
-- =====================================================

-- =====================================================
-- 1. ADDITIONAL DEMO PATIENTS
-- =====================================================

-- Create additional demo patients for testing different scenarios

-- John Smith - Day 14 post-THA (Hip replacement)
INSERT INTO patients (
  user_id, tenant_id, surgery_type, surgery_date, activity_level,
  surgeon_id, current_recovery_day, recovery_protocol_id, notes
) VALUES
((SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT tenant_id FROM profiles WHERE email = 'john.smith@demo.com'),
 'THA', CURRENT_DATE - INTERVAL '14 days', 'active',
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1),
 14,
 (SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 'Patient progressing well, good compliance with hip precautions');

-- Maria Rodriguez - Day 30 post-TKA (Advanced recovery)
INSERT INTO patients (
  user_id, tenant_id, surgery_type, surgery_date, activity_level,
  surgeon_id, current_recovery_day, recovery_protocol_id, notes
) VALUES
((SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 (SELECT tenant_id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 'TKA', CURRENT_DATE - INTERVAL '30 days', 'very_active',
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1),
 30,
 (SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 'Excellent progress, ahead of typical recovery timeline');

-- =====================================================
-- 2. EXERCISE ASSIGNMENTS FOR ALL DEMO PATIENTS
-- =====================================================

-- John Smith (Day 14 THA) - Assign appropriate exercises
INSERT INTO patient_exercises (
  patient_id, exercise_id, protocol_exercise_id, assigned_date, start_date,
  current_duration_minutes, current_repetitions, current_sets
)
SELECT 
  (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
  pe.exercise_id,
  pe.id,
  CURRENT_DATE - INTERVAL '14 days',
  CURRENT_DATE - INTERVAL '14 days',
  pe.duration_minutes,
  pe.repetitions,
  pe.sets
FROM protocol_exercises pe
JOIN recovery_protocols rp ON pe.protocol_id = rp.id
WHERE rp.name = 'THA Active Patient Protocol'
AND pe.start_day <= 14
AND (pe.end_day IS NULL OR pe.end_day >= 14);

-- Maria Rodriguez (Day 30 TKA) - Assign appropriate exercises
INSERT INTO patient_exercises (
  patient_id, exercise_id, protocol_exercise_id, assigned_date, start_date,
  current_duration_minutes, current_repetitions, current_sets
)
SELECT 
  (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
  pe.exercise_id,
  pe.id,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '30 days',
  pe.duration_minutes,
  pe.repetitions,
  pe.sets
FROM protocol_exercises pe
JOIN recovery_protocols rp ON pe.protocol_id = rp.id
WHERE rp.name = 'TKA Active Patient Protocol'
AND pe.start_day <= 30
AND (pe.end_day IS NULL OR pe.end_day >= 30);

-- =====================================================
-- 3. EXERCISE COMPLETION HISTORY
-- =====================================================

-- Sarah Johnson - Exercise completions over past 5 days
INSERT INTO exercise_completions (
  patient_exercise_id, patient_id, exercise_id, completed_at, completion_date,
  duration_minutes, repetitions_completed, sets_completed,
  difficulty_rating, pain_level_before, pain_level_during, pain_level_after,
  fatigue_level, patient_notes, mood_rating, confidence_level
) VALUES

-- Day 1 completions
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Ankle Pumps' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Ankle Pumps'),
 CURRENT_DATE - INTERVAL '4 days' + INTERVAL '8 hours',
 CURRENT_DATE - INTERVAL '4 days',
 5, 20, 3, 2, 6, 3, 3, 2, 'First day doing exercises, felt good to move', 3, 3),

-- Day 2 completions
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Ankle Pumps' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Ankle Pumps'),
 CURRENT_DATE - INTERVAL '3 days' + INTERVAL '9 hours',
 CURRENT_DATE - INTERVAL '3 days',
 5, 20, 3, 3, 5, 3, 2, 2, 'Getting easier each day', 4, 4),

((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Knee Extension (Quad Sets)' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Knee Extension (Quad Sets)'),
 CURRENT_DATE - INTERVAL '3 days' + INTERVAL '14 hours',
 CURRENT_DATE - INTERVAL '3 days',
 10, 15, 3, 4, 5, 4, 3, 3, 'Could really feel my thigh muscle working', 3, 3);

-- John Smith - Exercise completions for Day 14 THA patient
INSERT INTO exercise_completions (
  patient_exercise_id, patient_id, exercise_id, completed_at, completion_date,
  duration_minutes, repetitions_completed, sets_completed,
  difficulty_rating, pain_level_before, pain_level_during, pain_level_after,
  fatigue_level, patient_notes, mood_rating, confidence_level
) VALUES

-- Hip exercises for John
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Hip Flexion (Lying)' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Hip Flexion (Lying)'),
 NOW() - INTERVAL '2 hours',
 CURRENT_DATE,
 10, 10, 2, 3, 3, 2, 2, 2, 'Hip mobility improving daily', 4, 4),

((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Straight Leg Raises' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Straight Leg Raises'),
 NOW() - INTERVAL '3 hours',
 CURRENT_DATE,
 15, 10, 3, 4, 2, 3, 2, 3, 'Getting stronger each day', 4, 5);

-- =====================================================
-- 4. FORM ASSIGNMENTS AND COMPLETIONS
-- =====================================================

-- Assign forms to John Smith (Day 14 THA)
INSERT INTO patient_forms (
  patient_id, form_template_id, assigned_date, due_date, status, completion_percentage
) VALUES
-- Pre-surgery forms (completed)
((SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 CURRENT_DATE - INTERVAL '20 days',
 CURRENT_DATE - INTERVAL '15 days',
 'completed', 100),

-- Daily check-ins (ongoing)
((SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 CURRENT_DATE,
 CURRENT_DATE,
 'completed', 100);

-- Assign forms to Maria Rodriguez (Day 30 TKA)
INSERT INTO patient_forms (
  patient_id, form_template_id, assigned_date, due_date, status, completion_percentage
) VALUES
-- Weekly functional assessment
((SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 (SELECT id FROM form_templates WHERE name = 'Weekly Functional Assessment'),
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '2 days',
 'in_progress', 75);

-- =====================================================
-- 5. QUESTION RESPONSES FOR DEMO PATIENTS
-- =====================================================

-- John Smith's responses
INSERT INTO question_responses (
  patient_form_id, question_id, patient_id, response_boolean, response_number,
  response_json, response_method, time_to_respond_seconds
) VALUES

-- Daily check-in responses for John
((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in') AND assigned_date = CURRENT_DATE),
 (SELECT id FROM questions WHERE question_text = 'On a scale of 0-10, what is your current pain level?'),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 null, 3, null, 'voice', 8),

((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in') AND assigned_date = CURRENT_DATE),
 (SELECT id FROM questions WHERE question_text = 'Can you walk without assistance?'),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 true, null, null, 'selection', 5),

((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in') AND assigned_date = CURRENT_DATE),
 (SELECT id FROM questions WHERE question_text = 'How far can you walk without stopping?'),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 null, null, '{"value": "100_to_300_feet", "label": "100 to 300 feet"}', 'selection', 12);

-- =====================================================
-- 6. ADDITIONAL CONVERSATIONS
-- =====================================================

-- John Smith's conversation
INSERT INTO conversations (
  patient_id, tenant_id, title, conversation_type, surgery_day, recovery_phase,
  status, context_summary, patient_mood, pain_level_mentioned, topics_discussed
) VALUES
((SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 (SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com')),
 'Daily Check-in - Day 14',
 'daily_checkin',
 14,
 'early',
 'active',
 'Patient doing well at 2 weeks post-THA, good mobility progress, minimal pain',
 'positive',
 3,
 ARRAY['mobility', 'hip_precautions', 'progress']);

-- Maria Rodriguez's conversation
INSERT INTO conversations (
  patient_id, tenant_id, title, conversation_type, surgery_day, recovery_phase,
  status, context_summary, patient_mood, pain_level_mentioned, topics_discussed
) VALUES
((SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 (SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com')),
 'Weekly Assessment - Day 30',
 'assessment',
 30,
 'intermediate',
 'active',
 'Patient exceeding expectations at 30 days, ready for advanced exercises',
 'very positive',
 2,
 ARRAY['advanced_exercises', 'return_to_activities', 'excellent_progress']);

-- =====================================================
-- 7. CONVERSATION MESSAGES FOR DEMO PATIENTS
-- =====================================================

-- John Smith's messages
INSERT INTO messages (
  conversation_id, patient_id, content, message_type, sender_type,
  contains_pain_mention, mentioned_pain_level, sentiment_score, ai_model_used
) VALUES

-- John's daily check-in
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com')),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 'Good morning, John! It''s day 14 of your THA recovery - you''re doing great! How are you feeling today?',
 'ai_response', 'ai', false, null, 0.8, 'gpt-4'),

((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com')),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 'Morning! I''m feeling much better. My pain is only about a 3 today, and I walked to the mailbox yesterday without my walker!',
 'patient_text', 'patient', true, 3, 0.9, null),

((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com')),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 'That''s fantastic progress, John! Walking to the mailbox without your walker is a huge milestone at 2 weeks. A pain level of 3 is excellent. Are you remembering to follow your hip precautions?',
 'ai_response', 'ai', false, null, 0.9, 'gpt-4');

-- Maria Rodriguez's messages
INSERT INTO messages (
  conversation_id, patient_id, content, message_type, sender_type,
  contains_pain_mention, mentioned_pain_level, sentiment_score, ai_model_used
) VALUES

-- Maria's assessment conversation
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com')),
 (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 'Hi Maria! It''s been 30 days since your TKA surgery. You''ve been making exceptional progress! Let''s do your weekly functional assessment.',
 'ai_response', 'ai', false, null, 0.9, 'gpt-4'),

((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com')),
 (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 'Hi! I feel amazing. My pain is barely a 2 most days, and I''m walking over a mile now. I even went up and down stairs normally yesterday!',
 'patient_text', 'patient', true, 2, 0.95, null),

((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com')),
 (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 'Maria, that''s absolutely incredible! Walking over a mile and going up stairs normally at 30 days is outstanding progress. You''re ahead of the typical recovery timeline. Are you ready to start some more advanced strengthening exercises?',
 'ai_response', 'ai', false, null, 0.95, 'gpt-4');

-- =====================================================
-- 8. EXERCISE MODIFICATIONS EXAMPLES
-- =====================================================

-- Example modification for Sarah Johnson (reduce intensity due to pain)
INSERT INTO exercise_modifications (
  patient_exercise_id, patient_id, exercise_id, modified_by, modification_type,
  previous_parameters, new_parameters, reason, clinical_notes, effective_date
) VALUES
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Knee Flexion (Heel Slides)' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Knee Flexion (Heel Slides)'),
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
 'reduce_intensity',
 '{"repetitions": 10, "sets": 2, "duration_minutes": 10}',
 '{"repetitions": 8, "sets": 2, "duration_minutes": 8}',
 'Patient reported increased pain during exercise',
 'Reduced repetitions from 10 to 8 due to patient discomfort. Will reassess in 2 days.',
 CURRENT_DATE - INTERVAL '1 day');

-- =====================================================
-- 9. PROVIDER INTERVENTIONS
-- =====================================================

-- Example nurse intervention for Sarah's pain concern
INSERT INTO chat_interventions (
  conversation_id, patient_id, provider_id, intervention_type,
  provider_message, internal_notes, trigger_reason, urgency_level
) VALUES
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
 'reassurance',
 'Hi Sarah, I see you mentioned some concern about swelling. This is completely normal at day 5. Keep elevating your leg and using ice as directed. I''ll check in with you tomorrow to see how you''re doing.',
 'Patient expressed normal post-op concerns about swelling. Provided reassurance and education.',
 'Patient expressed concern about swelling',
 'routine');

-- =====================================================
-- 10. ANALYTICS DATA
-- =====================================================

-- Update analytics for all demo patients
INSERT INTO conversation_analytics (
  tenant_id, patient_id, date, total_conversations, total_messages,
  ai_messages, patient_messages, average_pain_level, pain_mentions_count,
  positive_interactions, average_sentiment_score
) VALUES

-- John Smith analytics
((SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'john.smith@demo.com')),
 (SELECT id FROM profiles WHERE email = 'john.smith@demo.com'),
 CURRENT_DATE, 1, 3, 2, 1, 3.0, 1, 1, 0.85),

-- Maria Rodriguez analytics
((SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com')),
 (SELECT id FROM profiles WHERE email = 'maria.rodriguez@demo.com'),
 CURRENT_DATE, 1, 3, 2, 1, 2.0, 1, 1, 0.95);

-- =====================================================
-- 11. ADDITIONAL EXERCISE CATEGORIES AND EXERCISES
-- =====================================================

-- Add more exercise categories
INSERT INTO exercise_categories (tenant_id, name, description, icon, color_code, sort_order) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Advanced Strengthening', 'High-intensity strengthening for late-stage recovery', 'weight', '#7C2D12', 7),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Sport-Specific', 'Exercises for return to sports and high-level activities', 'trophy', '#BE185D', 8);

-- Add advanced exercises
INSERT INTO exercises (
  tenant_id, category_id, name, description, instructions, exercise_type, difficulty_level,
  surgery_types, recovery_phases, default_duration_minutes, default_repetitions, default_sets,
  target_muscle_groups, joint_movements, pain_level_max, evidence_level, created_by
) VALUES

-- Advanced strengthening exercise
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Advanced Strengthening' LIMIT 1),
 'Single Leg Squats',
 'Advanced single-leg strengthening exercise for return to high-level activities',
 'Stand on one leg and slowly lower yourself into a squat position, keeping your knee aligned over your toe. Return to standing position.',
 'strength', 'advanced',
 ARRAY['TKA', 'THA'], ARRAY['advanced', 'maintenance'],
 15, 8, 3,
 ARRAY['quadriceps', 'glutes', 'core'], ARRAY['knee flexion', 'hip flexion'], 3,
 'moderate', (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1)),

-- Sport-specific exercise
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Sport-Specific' LIMIT 1),
 'Lateral Lunges',
 'Side-to-side movement preparation for sports activities',
 'Step to the side into a lunge position, keeping the opposite leg straight. Push back to center and repeat on the other side.',
 'functional', 'advanced',
 ARRAY['TKA', 'THA'], ARRAY['advanced', 'maintenance'],
 20, 10, 3,
 ARRAY['quadriceps', 'glutes', 'adductors'], ARRAY['lateral movement', 'knee flexion'], 3,
 'moderate', (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1));

-- =====================================================
-- 12. ADDITIONAL FORM QUESTIONS
-- =====================================================

-- Add more comprehensive questions
INSERT INTO questions (
  tenant_id, question_text, question_type, is_required, help_text,
  voice_prompt, clinical_significance, created_by
) VALUES

-- Sleep quality questions
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How would you rate your sleep quality last night?', 'scale', true,
 'Rate from 1 (very poor) to 5 (excellent)',
 'How would you rate your sleep quality last night on a scale of 1 to 5?',
 'Sleep quality affects recovery and pain perception',
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

-- Mood assessment
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How is your mood today?', 'single_choice', true,
 'Your emotional well-being is important for recovery',
 'How is your mood today?',
 'Mood affects recovery motivation and pain perception',
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

-- Return to work assessment
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Are you ready to return to work?', 'single_choice', false,
 'This helps us plan your return to normal activities',
 'Do you feel ready to return to work?',
 'Work readiness indicates functional recovery level',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1));

-- Update mood question with options
UPDATE questions SET options = '[
  {"value": "excellent", "label": "Excellent - feeling very positive"},
  {"value": "good", "label": "Good - generally positive"},
  {"value": "neutral", "label": "Neutral - neither good nor bad"},
  {"value": "concerned", "label": "Concerned - somewhat worried"},
  {"value": "distressed", "label": "Distressed - very worried or upset"}
]'::jsonb WHERE question_text = 'How is your mood today?';

-- Update work readiness question with options
UPDATE questions SET options = '[
  {"value": "not_ready", "label": "No, not ready yet"},
  {"value": "light_duty", "label": "Ready for light duty only"},
  {"value": "full_duty", "label": "Ready for full duty"},
  {"value": "need_accommodations", "label": "Ready with accommodations"}
]'::jsonb WHERE question_text = 'Are you ready to return to work?';

-- =====================================================
-- 13. UPDATE ALL STATISTICS
-- =====================================================

-- Update table statistics for optimal query performance
ANALYZE tenants;
ANALYZE profiles;
ANALYZE patients;
ANALYZE exercise_categories;
ANALYZE exercises;
ANALYZE recovery_protocols;
ANALYZE protocol_exercises;
ANALYZE patient_exercises;
ANALYZE exercise_completions;
ANALYZE exercise_modifications;
ANALYZE form_templates;
ANALYZE form_sections;
ANALYZE questions;
ANALYZE section_questions;
ANALYZE patient_forms;
ANALYZE question_responses;
ANALYZE medical_conditions;
ANALYZE medications;
ANALYZE conversations;
ANALYZE messages;
ANALYZE chat_prompts;
ANALYZE quick_responses;
ANALYZE conversation_analytics;
ANALYZE conversation_topics;
ANALYZE chat_interventions;

