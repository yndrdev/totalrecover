-- =====================================================
-- CHAT AND CONVERSATION SEED DATA
-- TJV Recovery Platform - Comprehensive Chat Content
-- =====================================================

-- =====================================================
-- 1. CHAT PROMPTS AND TEMPLATES
-- =====================================================

-- Welcome and Onboarding Prompts
INSERT INTO chat_prompts (
  tenant_id, name, description, prompt_type, system_prompt, user_prompt_template,
  surgery_types, recovery_phases, max_tokens, temperature, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Welcome Message - Day 1',
 'Initial welcome message for patients on their first day post-surgery',
 'welcome',
 'You are a compassionate recovery assistant for patients who just had joint replacement surgery. Your role is to provide comfort, guidance, and support during their recovery journey. Always be encouraging, professional, and empathetic.',
 'Welcome {patient_name}! I''m your recovery assistant, here to support you through your {surgery_type} recovery journey. You''re on day {current_day} of your recovery. How are you feeling today?',
 ARRAY['TKA', 'THA'], ARRAY['immediate'], 300, 0.7,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Daily Check-in Prompt',
 'Daily check-in conversation starter',
 'daily_checkin',
 'You are a supportive recovery assistant conducting a daily check-in. Focus on pain levels, mobility, mood, and any concerns. Be encouraging about progress and address any worries.',
 'Good morning {patient_name}! It''s day {current_day} of your {surgery_type} recovery. Let''s do your daily check-in. How are you feeling today?',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate'], 400, 0.7,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Exercise Guidance',
 'Guidance and encouragement for exercise sessions',
 'exercise_guidance',
 'You are a knowledgeable physical therapy assistant helping patients with their recovery exercises. Provide clear instructions, safety reminders, and encouragement. Always prioritize patient safety.',
 'Time for your {exercise_name} exercise! This will help improve your {target_area}. Remember to stop if you feel sharp pain. Are you ready to begin?',
 ARRAY['TKA', 'THA'], ARRAY['early', 'intermediate', 'advanced'], 350, 0.6,
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Pain Assessment',
 'Comprehensive pain assessment conversation',
 'pain_assessment',
 'You are a clinical assistant conducting a pain assessment. Ask about pain location, intensity, quality, and what makes it better or worse. Be thorough but compassionate.',
 'Let''s assess your pain levels today. On a scale of 0-10, where 0 is no pain and 10 is the worst pain imaginable, how would you rate your current pain?',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate', 'advanced'], 400, 0.5,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Medication Reminder',
 'Gentle reminders about medication compliance',
 'medication_reminder',
 'You are a helpful medication assistant. Remind patients about their medications in a caring way, explain the importance of compliance, and address any concerns about side effects.',
 'Hi {patient_name}! It''s time for your {medication_name}. This medication helps with {medication_purpose}. Have you taken it as prescribed today?',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate'], 300, 0.6,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Encouragement and Support',
 'Motivational messages for challenging days',
 'encouragement',
 'You are a supportive recovery coach. Provide encouragement, celebrate small victories, and help patients stay motivated during difficult moments in their recovery.',
 'I know recovery can be challenging, {patient_name}. Remember that every day you''re getting stronger. You''ve already made great progress since your {surgery_type} surgery {current_day} days ago.',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate', 'advanced'], 350, 0.8,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Emergency Response',
 'Response protocol for emergency situations',
 'emergency_response',
 'You are an emergency response assistant. When patients report serious symptoms, immediately recommend contacting their healthcare provider or emergency services. Be calm but urgent.',
 'I understand you''re experiencing {emergency_symptom}. This requires immediate medical attention. Please contact your surgeon or go to the emergency room right away. Would you like me to help you contact your care team?',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate', 'advanced'], 200, 0.3,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1));

-- =====================================================
-- 2. QUICK RESPONSES LIBRARY
-- =====================================================

-- Pain Level Responses
INSERT INTO quick_responses (
  tenant_id, text, category, surgery_types, recovery_phases, trigger_keywords, sort_order
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'My pain is about a 3 out of 10', 'pain_levels', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['pain', 'hurt'], 1),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'My pain is about a 5 out of 10', 'pain_levels', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['pain', 'hurt'], 2),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'My pain is about a 7 out of 10', 'pain_levels', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['pain', 'hurt'], 3),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'The pain is getting worse', 'pain_levels', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['worse', 'increasing'], 4);

-- Mood and Emotional Responses
INSERT INTO quick_responses (
  tenant_id, text, category, surgery_types, recovery_phases, trigger_keywords, sort_order
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'I''m feeling good today', 'mood_responses', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['mood', 'feeling'], 1),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'I''m feeling anxious about my recovery', 'mood_responses', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['anxious', 'worried'], 2),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'I''m frustrated with my progress', 'mood_responses', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['frustrated', 'slow'], 3),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'I''m feeling optimistic', 'mood_responses', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['optimistic', 'positive'], 4);

-- Exercise Feedback Responses
INSERT INTO quick_responses (
  tenant_id, text, category, surgery_types, recovery_phases, trigger_keywords, sort_order
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'The exercise was easy', 'exercise_feedback', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['exercise', 'easy'], 1),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'The exercise was challenging but manageable', 'exercise_feedback', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['exercise', 'challenging'], 2),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'The exercise was too difficult', 'exercise_feedback', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['exercise', 'difficult'], 3),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'I completed all my exercises today', 'exercise_feedback', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['completed', 'finished'], 4);

-- General Questions
INSERT INTO quick_responses (
  tenant_id, text, category, surgery_types, recovery_phases, trigger_keywords, sort_order
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'When can I drive again?', 'general_questions', ARRAY['TKA', 'THA'], 
 ARRAY['early', 'intermediate', 'advanced'], ARRAY['drive', 'driving'], 1),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'When can I return to work?', 'general_questions', ARRAY['TKA', 'THA'], 
 ARRAY['intermediate', 'advanced'], ARRAY['work', 'job'], 2),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Is this swelling normal?', 'general_questions', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate'], ARRAY['swelling', 'swollen'], 3),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How long will my recovery take?', 'general_questions', ARRAY['TKA', 'THA'], 
 ARRAY['immediate', 'early', 'intermediate', 'advanced'], ARRAY['recovery', 'heal'], 4);

-- =====================================================
-- 3. DEMO CONVERSATIONS
-- =====================================================

-- Create a conversation for Sarah Johnson (Day 5 post-TKA)
INSERT INTO conversations (
  patient_id, tenant_id, title, conversation_type, surgery_day, recovery_phase,
  status, context_summary, patient_mood, pain_level_mentioned, topics_discussed
) VALUES
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 'Daily Check-in - Day 5',
 'daily_checkin',
 5,
 'early',
 'active',
 'Patient reporting moderate pain levels, completed morning exercises, asking about driving timeline',
 'cautiously optimistic',
 4,
 ARRAY['pain_management', 'exercise', 'mobility', 'driving_timeline']);

-- =====================================================
-- 4. DEMO MESSAGES
-- =====================================================

-- Sample conversation messages for Sarah Johnson
INSERT INTO messages (
  conversation_id, patient_id, content, message_type, sender_type,
  contains_pain_mention, mentioned_pain_level, contains_concern, clinical_keywords,
  sentiment_score, ai_model_used, ai_processing_time_ms
) VALUES

-- AI Welcome Message
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Good morning, Sarah! It''s day 5 of your TKA recovery. I hope you''re feeling better today. Let''s do your daily check-in. How are you feeling this morning?',
 'ai_response', 'ai', false, null, false, ARRAY[]::TEXT[], 0.8, 'gpt-4', 1250),

-- Patient Response
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Hi! I''m feeling okay today. My pain is about a 4 out of 10, which is better than yesterday. I did my ankle pumps this morning.',
 'patient_text', 'patient', true, 4, false, ARRAY['pain'], 0.6, null, null),

-- AI Follow-up
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'That''s wonderful progress, Sarah! A pain level of 4 is much more manageable, and it''s great that you''re staying consistent with your ankle pumps. Those help prevent blood clots and improve circulation. How is your mobility today? Are you able to walk with your walker?',
 'ai_response', 'ai', false, null, false, ARRAY[]::TEXT[], 0.9, 'gpt-4', 1180),

-- Patient Response about mobility
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Yes, I can walk to the bathroom and kitchen with my walker. I''m still a bit slow, but I feel more stable than a few days ago. When do you think I''ll be able to drive again?',
 'patient_text', 'patient', false, null, false, ARRAY[]::TEXT[], 0.4, null, null),

-- AI Response about driving
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'It''s great to hear you''re feeling more stable! For TKA patients, driving is typically safe when you can bend your knee enough to get in and out of the car comfortably, and when you''re off narcotic pain medications. This is usually around 2-6 weeks, but your surgeon will give you the final clearance. Since you''re on day 5, you''re making good progress toward that goal!',
 'ai_response', 'ai', false, null, false, ARRAY[]::TEXT[], 0.7, 'gpt-4', 1420),

-- Patient expressing concern
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'That sounds reasonable. I''m a little worried about the swelling around my knee though. Is that normal?',
 'patient_text', 'patient', false, null, true, ARRAY['worried'], 0.2, null, null),

-- AI Reassurance
((SELECT id FROM conversations WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND conversation_type = 'daily_checkin'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Swelling is very normal after knee replacement surgery, especially in the first few weeks. Your body is healing, and some swelling is part of that process. Keep elevating your leg when resting, use ice as directed, and continue with your exercises. However, if you notice sudden increased swelling, redness, or warmth, that would be worth calling your surgeon about. How would you describe the swelling - is it getting better, worse, or staying about the same?',
 'ai_response', 'ai', false, null, false, ARRAY[]::TEXT[], 0.8, 'gpt-4', 1650);

-- =====================================================
-- 5. ADDITIONAL DEMO CONVERSATIONS
-- =====================================================

-- Create an exercise session conversation
INSERT INTO conversations (
  patient_id, tenant_id, title, conversation_type, surgery_day, recovery_phase,
  status, context_summary, patient_mood, topics_discussed
) VALUES
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 'Exercise Session - Knee Flexion',
 'exercise_session',
 5,
 'early',
 'completed',
 'Guided patient through knee flexion exercises, patient completed successfully with minimal discomfort',
 'determined',
 ARRAY['exercise', 'knee_flexion', 'progress']);

-- Exercise session messages
INSERT INTO messages (
  conversation_id, patient_id, content, message_type, sender_type,
  contains_pain_mention, mentioned_pain_level, sentiment_score, ai_model_used
) VALUES

-- Exercise introduction
((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Time for your knee flexion exercise, Sarah! This exercise helps restore the bending motion in your knee. We''ll start gently. Lie on your back and slowly slide your heel toward your buttocks. Stop if you feel sharp pain. Ready to begin?',
 'ai_response', 'ai', false, null, 0.7, 'gpt-4'),

-- Patient ready response
((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Yes, I''m ready. I''m lying down now.',
 'patient_text', 'patient', false, null, 0.6, null),

-- Exercise completion
((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'I completed 8 repetitions. There was some discomfort but no sharp pain. My knee feels a bit stiff.',
 'patient_text', 'patient', false, null, 0.5, null),

-- AI encouragement
((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Excellent work, Sarah! 8 repetitions is great for day 5. Some stiffness is completely normal - your knee is still healing and regaining its flexibility. The fact that you didn''t have sharp pain is a very good sign. Keep up the great work!',
 'ai_response', 'ai', false, null, 0.9, 'gpt-4');

-- =====================================================
-- 6. CONVERSATION TOPICS
-- =====================================================

-- Add topics for the conversations
INSERT INTO conversation_topics (
  conversation_id, topic, topic_category, confidence_score, message_count, is_clinically_significant
) VALUES
((SELECT id FROM conversations WHERE title = 'Daily Check-in - Day 5'),
 'pain_management', 'pain_management', 0.95, 3, true),

((SELECT id FROM conversations WHERE title = 'Daily Check-in - Day 5'),
 'mobility_progress', 'mobility', 0.88, 2, true),

((SELECT id FROM conversations WHERE title = 'Daily Check-in - Day 5'),
 'driving_timeline', 'daily_activities', 0.92, 2, false),

((SELECT id FROM conversations WHERE title = 'Daily Check-in - Day 5'),
 'swelling_concerns', 'concerns', 0.85, 2, true),

((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 'knee_flexion_exercise', 'exercise', 0.98, 4, true),

((SELECT id FROM conversations WHERE title = 'Exercise Session - Knee Flexion'),
 'exercise_completion', 'progress', 0.90, 2, true);

-- =====================================================
-- 7. CONVERSATION ANALYTICS
-- =====================================================

-- Add daily analytics for Sarah Johnson
INSERT INTO conversation_analytics (
  tenant_id, patient_id, date, total_conversations, total_messages,
  ai_messages, patient_messages, voice_messages_count, average_pain_level,
  pain_mentions_count, positive_interactions, average_sentiment_score
) VALUES
((SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 CURRENT_DATE,
 2, 11, 6, 5, 0, 4.0, 1, 2, 0.65),

-- Previous day analytics
((SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 CURRENT_DATE - INTERVAL '1 day',
 1, 8, 4, 4, 1, 5.0, 2, 1, 0.45),

-- Day before analytics
((SELECT tenant_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 CURRENT_DATE - INTERVAL '2 days',
 1, 6, 3, 3, 0, 6.0, 1, 0, 0.35);

-- =====================================================
-- 8. UPDATE STATISTICS
-- =====================================================

-- Update table statistics for better query performance
ANALYZE conversations;
ANALYZE messages;
ANALYZE chat_prompts;
ANALYZE quick_responses;
ANALYZE conversation_analytics;
ANALYZE conversation_topics;

