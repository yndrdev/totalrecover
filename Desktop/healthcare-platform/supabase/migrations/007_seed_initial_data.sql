-- =============================================
-- Seed Initial Data
-- =============================================

-- =============================================
-- SEED DEFAULT TENANT
-- =============================================

-- Insert default tenant for testing
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    settings,
    subscription_plan,
    subscription_status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'TJV Healthcare Demo',
    'tjv-demo',
    'demo.tjvhealthcare.com',
    jsonb_build_object(
        'features', jsonb_build_object(
            'ai_chat', true,
            'protocol_builder', true,
            'video_library', true,
            'form_builder', true,
            'analytics', true
        ),
        'branding', jsonb_build_object(
            'primary_color', '#006DB1',
            'secondary_color', '#4A90A4',
            'logo_url', '/images/tjv-logo.png'
        )
    ),
    'professional',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- =============================================
-- SEED DEFAULT PRACTICE
-- =============================================

-- Insert default practice
INSERT INTO practices (
    id,
    tenant_id,
    name,
    address,
    phone,
    email,
    settings
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'TJV Orthopedic Center',
    jsonb_build_object(
        'street', '123 Healthcare Drive',
        'city', 'Medical City',
        'state', 'CA',
        'zip', '90210',
        'country', 'USA'
    ),
    '(555) 123-4567',
    'info@tjvortho.com',
    jsonb_build_object(
        'office_hours', jsonb_build_object(
            'monday', '8:00 AM - 5:00 PM',
            'tuesday', '8:00 AM - 5:00 PM',
            'wednesday', '8:00 AM - 5:00 PM',
            'thursday', '8:00 AM - 5:00 PM',
            'friday', '8:00 AM - 4:00 PM'
        ),
        'specialties', array['Orthopedic Surgery', 'Joint Replacement', 'Sports Medicine']
    )
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- =============================================
-- SEED SAMPLE VIDEOS
-- =============================================

-- Insert sample educational videos
INSERT INTO content_videos (
    id,
    tenant_id,
    title,
    description,
    category,
    url,
    thumbnail_url,
    duration,
    tags,
    phase,
    surgery_types,
    created_by,
    is_active
) VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Welcome from Your Care Team',
    'Meet your surgeon and care navigator who will guide you through your recovery journey',
    'education',
    'https://tjv-recovery.com/videos/welcome-team',
    '/images/video-thumbnails/welcome-team.jpg',
    '5:00',
    array['welcome', 'introduction', 'care-team'],
    'pre-op',
    array['TKA', 'THA'],
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Understanding Your Surgery',
    'Educational video about TKA/THA procedures and what to expect',
    'education',
    'https://tjv-recovery.com/videos/surgery-education',
    '/images/video-thumbnails/surgery-education.jpg',
    '15:00',
    array['education', 'surgery', 'preparation'],
    'pre-op',
    array['TKA', 'THA'],
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Preparing Your Home',
    'How to set up your home for a safe recovery',
    'preparation',
    'https://tjv-recovery.com/videos/home-preparation',
    '/images/video-thumbnails/home-prep.jpg',
    '8:00',
    array['home', 'preparation', 'safety'],
    'pre-op',
    array['TKA', 'THA'],
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Hospital Mobility Basics',
    'Safe movement techniques in the hospital',
    'education',
    'https://tjv-recovery.com/videos/hospital-mobility',
    '/images/video-thumbnails/hospital-mobility.jpg',
    '6:00',
    array['mobility', 'hospital', 'safety'],
    'post-op',
    array['TKA', 'THA'],
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Home Exercise Program',
    'Your complete home exercise routine',
    'exercise',
    'https://tjv-recovery.com/videos/home-exercises',
    '/images/video-thumbnails/home-exercises.jpg',
    '12:00',
    array['exercise', 'rehabilitation', 'home'],
    'recovery',
    array['TKA', 'THA'],
    '00000000-0000-0000-0000-000000000001',
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =============================================
-- SEED SAMPLE FORMS
-- =============================================

-- Insert sample forms
INSERT INTO content_forms (
    id,
    tenant_id,
    title,
    description,
    category,
    form_schema,
    estimated_time,
    phase,
    surgery_types,
    tags,
    created_by,
    is_active
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Initial Health Assessment',
    'Complete your baseline health questionnaire',
    'assessment',
    jsonb_build_object(
        'sections', jsonb_build_array(
            jsonb_build_object(
                'title', 'Current Health Status',
                'fields', jsonb_build_array(
                    jsonb_build_object(
                        'id', 'pain_level',
                        'type', 'scale',
                        'label', 'What is your current pain level (1-10)?',
                        'required', true,
                        'min', 1,
                        'max', 10
                    ),
                    jsonb_build_object(
                        'id', 'medications',
                        'type', 'textarea',
                        'label', 'List all current medications',
                        'required', true,
                        'placeholder', 'Include dosage and frequency'
                    ),
                    jsonb_build_object(
                        'id', 'allergies',
                        'type', 'textarea',
                        'label', 'Do you have any allergies?',
                        'required', false,
                        'placeholder', 'List any known allergies'
                    ),
                    jsonb_build_object(
                        'id', 'mobility_level',
                        'type', 'scale',
                        'label', 'Rate your current mobility (1-10)',
                        'required', true,
                        'min', 1,
                        'max', 10
                    ),
                    jsonb_build_object(
                        'id', 'previous_surgeries',
                        'type', 'textarea',
                        'label', 'Any previous surgeries?',
                        'required', false,
                        'placeholder', 'Describe any previous surgeries'
                    )
                )
            )
        )
    ),
    '15 minutes',
    'pre-op',
    array['TKA', 'THA'],
    array['assessment', 'health', 'baseline'],
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Pre-Surgery Planning',
    'Help us prepare for your surgery and recovery',
    'planning',
    jsonb_build_object(
        'sections', jsonb_build_array(
            jsonb_build_object(
                'title', 'Recovery Support',
                'fields', jsonb_build_array(
                    jsonb_build_object(
                        'id', 'primary_caregiver',
                        'type', 'text',
                        'label', 'Who will be your primary caregiver after surgery?',
                        'required', true
                    ),
                    jsonb_build_object(
                        'id', 'home_stairs',
                        'type', 'radio',
                        'label', 'Do you have stairs in your home?',
                        'required', true,
                        'options', array['Yes', 'No']
                    ),
                    jsonb_build_object(
                        'id', 'bathroom_setup',
                        'type', 'textarea',
                        'label', 'What is your home bathroom setup?',
                        'required', true,
                        'placeholder', 'Describe accessibility features'
                    ),
                    jsonb_build_object(
                        'id', 'mobility_aids',
                        'type', 'checkbox',
                        'label', 'Any mobility aids currently in use?',
                        'required', false,
                        'options', array['Walker', 'Cane', 'Wheelchair', 'None']
                    ),
                    jsonb_build_object(
                        'id', 'preferred_pharmacy',
                        'type', 'text',
                        'label', 'Preferred pharmacy for prescriptions?',
                        'required', true
                    )
                )
            )
        )
    ),
    '10 minutes',
    'pre-op',
    array['TKA', 'THA'],
    array['planning', 'preparation', 'home'],
    '00000000-0000-0000-0000-000000000001',
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    form_schema = EXCLUDED.form_schema,
    updated_at = NOW();

-- =============================================
-- SEED SAMPLE EXERCISES
-- =============================================

-- Insert sample exercises
INSERT INTO content_exercises (
    id,
    tenant_id,
    title,
    description,
    category,
    difficulty,
    duration,
    instructions,
    body_parts,
    phase,
    surgery_types,
    tags,
    video_url,
    created_by,
    is_active
) VALUES 
(
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Ankle Pumps',
    'Begin gentle ankle movements to prevent blood clots',
    'circulation',
    'beginner',
    '2-3 minutes',
    'Pump ankles up and down, 10 times every hour while awake. Point your toes toward your head, then point them away from your head. This helps maintain blood circulation.',
    array['ankle', 'lower_leg'],
    'post-op',
    array['TKA', 'THA'],
    array['circulation', 'prevention', 'basic'],
    'https://tjv-recovery.com/videos/ankle-pumps',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Quad Sets',
    'Strengthen quadriceps muscles while in bed',
    'strengthening',
    'beginner',
    '5 minutes',
    'Tighten the muscles on the front of your thigh by pushing your knee down into the bed. Hold for 5 seconds. Repeat 10 times, 3 times daily.',
    array['quadriceps', 'thigh'],
    'post-op',
    array['TKA', 'THA'],
    array['strengthening', 'bed', 'basic'],
    'https://tjv-recovery.com/videos/quad-sets',
    '00000000-0000-0000-0000-000000000001',
    true
),
(
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Heel Slides',
    'Improve knee flexibility with gentle sliding motion',
    'flexibility',
    'beginner',
    '5-10 minutes',
    'While lying in bed, slowly slide your heel toward your buttocks, bending your knee. Hold for 5 seconds, then slowly slide back. Repeat 10-15 times.',
    array['knee', 'hamstring'],
    'recovery',
    array['TKA'],
    array['flexibility', 'range_of_motion'],
    'https://tjv-recovery.com/videos/heel-slides',
    '00000000-0000-0000-0000-000000000001',
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    updated_at = NOW();

-- =============================================
-- SEED TJV COMPLETE TIMELINE PROTOCOL
-- =============================================

-- Insert the comprehensive TJV protocol
INSERT INTO protocols (
    id,
    tenant_id,
    name,
    description,
    surgery_types,
    activity_levels,
    timeline_start,
    timeline_end,
    version,
    is_active,
    is_draft,
    created_by
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'TJV Complete Recovery Protocol',
    'Complete evidence-based recovery protocol from TJV clinical data. Covers Day -45 (enrollment) through Day +200 (long-term recovery) with phase-specific tasks, exercises, education, and outcome assessments.',
    array['TKA', 'THA'],
    array['active', 'sedentary'],
    -45,
    200,
    1,
    true,
    false,
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =============================================
-- SEED PROTOCOL TASKS (TJV Timeline Data)
-- =============================================

-- Phase 1: Enrollment & Scheduling (Day -45 to -15)
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', -45, 'message', 'Welcome to TJV Recovery', 'Welcome to your personalized recovery journey. We''ll guide you every step of the way.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', -45, 'form', 'Initial Health Assessment', 'Complete your baseline health questionnaire', null, null, true, '15 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -45, 'video', 'Welcome from Your Care Team', 'Meet your surgeon and care navigator who will guide you through your recovery journey', null, 'https://tjv-recovery.com/videos/welcome-team', true, '5 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -30, 'video', 'Understanding Your Surgery', 'Educational video about TKA/THA procedures', 'Learn what to expect during your total joint replacement surgery', 'https://tjv-recovery.com/videos/surgery-education', true, '15 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -30, 'exercise', 'Pre-Surgery Strengthening', 'Begin gentle strengthening exercises to prepare for surgery', null, null, false, null, 'easy', '{"type": "daily", "repeat": true}'),
('40000000-0000-0000-0000-000000000001', -21, 'form', 'Pre-Surgery Planning', 'Help us prepare for your surgery and recovery', null, null, true, '10 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -21, 'message', 'Nutrition Guidelines', 'Proper nutrition before surgery helps with healing. Focus on protein-rich foods, stay hydrated, and maintain a balanced diet.', null, null, true, null, null, '{}');

-- Phase 2: Pre-Surgery Preparation (Day -14 to -1)
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', -14, 'form', 'Pre-Surgery Checklist', 'Complete final preparations for surgery', null, null, true, '8 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -14, 'message', 'Surgery Preparation Instructions', 'Important reminders for the days leading up to your surgery. Follow all pre-operative instructions from your surgical team.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', -14, 'video', 'Preparing Your Home', 'How to set up your home for a safe recovery', null, 'https://tjv-recovery.com/videos/home-preparation', true, '8 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -7, 'video', 'What to Expect on Surgery Day', 'Step-by-step guide for surgery day', null, 'https://tjv-recovery.com/videos/surgery-day-guide', true, '10 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -7, 'form', 'Final Health Check', 'Last health assessment before surgery', null, null, true, '7 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', -5, 'message', 'Pre-Op Skin Wash Instructions', 'You play an important part in helping to prevent wound infection. Use the 2% Chlorhexidine Gluconate (CHG) cloths as instructed the night before surgery.', null, null, true, null, null, '{"repeat": true}'),
('40000000-0000-0000-0000-000000000001', -2, 'message', '48 Hours Until Surgery', 'Review your pre-surgery checklist. Confirm your arrival time. Pack your hospital bag with comfortable clothes and personal items.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', -1, 'message', 'Surgery Tomorrow - Final Reminders', 'Nothing to eat or drink after midnight. Use CHG cloths tonight. Arrive at hospital at scheduled time. Bring insurance cards and ID.', null, null, true, null, null, '{}');

-- Phase 3: Immediate Post-Surgery (Day 0 to 7)
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', 0, 'message', 'Welcome to Recovery', 'Surgery complete! Your recovery journey begins now. Rest and follow your care team''s instructions.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 0, 'form', 'Post-Surgery Check-in', 'How are you feeling after surgery?', null, null, true, '5 minutes', null, '{"type": "every_4_hours"}'),
('40000000-0000-0000-0000-000000000001', 1, 'exercise', 'Ankle Pumps', 'Begin gentle ankle movements to prevent blood clots', null, null, true, '2 minutes', 'easy', '{"type": "hourly"}'),
('40000000-0000-0000-0000-000000000001', 1, 'form', 'Daily Recovery Check', 'Daily assessment of your recovery progress', null, null, true, '8 minutes', null, '{"type": "daily", "repeat": true}'),
('40000000-0000-0000-0000-000000000001', 1, 'video', 'Hospital Mobility Basics', 'Safe movement techniques in the hospital', null, 'https://tjv-recovery.com/videos/hospital-mobility', true, '6 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 2, 'message', 'Pain Management Tips', 'Stay ahead of pain by taking medications as scheduled. Use ice packs for 20 minutes at a time. Keep your leg elevated when resting.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 3, 'video', 'Safe Transfer Techniques', 'How to safely get in/out of bed and chairs', null, 'https://tjv-recovery.com/videos/safe-transfers', true, '8 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 3, 'exercise', 'Bed Exercises', 'Gentle exercises you can do in bed', null, null, true, '10 minutes', 'easy', '{}'),
('40000000-0000-0000-0000-000000000001', 4, 'message', 'Wound Care Basics', 'Keep your bandage clean and dry. Watch for signs of infection: increased redness, warmth, drainage, or fever.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 5, 'exercise', 'Standing Exercises', 'Progress to standing exercises with support', null, null, false, '5 minutes', 'medium', '{}'),
('40000000-0000-0000-0000-000000000001', 6, 'form', 'One Week Progress Check', 'Assess your progress at one week', null, null, true, '10 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 7, 'message', 'Bandage Removal Instructions', 'You may remove your bandage today. It''s helpful to get the bandage wet in a warm shower and remove like a bandaid. You have dissolvable sutures and glue underneath.', null, null, true, null, null, '{}');

-- Phase 4: Early Recovery (Day 8 to 30) - Key tasks
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', 8, 'video', 'Home Exercise Program', 'Your complete home exercise routine', null, 'https://tjv-recovery.com/videos/home-exercises', true, '12 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 10, 'message', 'When Can I Return to Driving?', 'Consider: Are you off narcotic pain medication? Can you safely enter/exit vehicle? Quick brake response? Check with your surgeon first.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 10, 'exercise', 'Range of Motion Exercises', 'Focus on improving joint flexibility', null, null, true, '15 minutes', 'medium', '{"repeat": true}'),
('40000000-0000-0000-0000-000000000001', 14, 'form', 'Two-Week Milestone Assessment', 'Important milestone check at 2 weeks', null, null, true, '12 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 14, 'message', 'Weaning Off Pain Medication', 'You may be ready to start decreasing pain medication. It''s ok if not - everyone recovers at their own pace. Discuss with your care team.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 15, 'exercise', 'Walking Program', 'Progressive walking to build endurance', null, null, true, '20 minutes', 'medium', '{"repeat": true}'),
('40000000-0000-0000-0000-000000000001', 21, 'form', 'Activity Progress Check', 'How are your daily activities progressing?', null, null, true, '10 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 21, 'message', 'Celebrating Three Weeks', 'You''ve made it three weeks! Continue your exercises, stay active, and listen to your body. Recovery is a marathon, not a sprint.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 30, 'message', 'One Month Milestone', 'Congratulations on your first month! Recovery varies - be patient with yourself. If your incision is healed, you may use vitamin E or lotion on your scar.', null, null, true, null, null, '{}');

-- Phase 5: Advanced Recovery (Day 31 to 90) - Key milestones
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', 35, 'exercise', 'Strength Building Program', 'Progress to more challenging exercises', null, null, false, '25 minutes', 'medium', '{}'),
('40000000-0000-0000-0000-000000000001', 45, 'form', '6-Week Milestone Assessment', 'Major milestone evaluation at 6 weeks', null, null, true, '15 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 45, 'video', 'Return to Exercise Guidelines', 'Safe return to recreational activities', null, 'https://tjv-recovery.com/videos/return-to-exercise', true, '12 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 60, 'message', 'Two Month Progress', 'Most patients see significant improvement by now. Continue PT exercises, stay active, and maintain healthy habits for optimal recovery.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 60, 'exercise', 'Advanced Strengthening', 'Progress to more challenging exercises', null, null, false, '30 minutes', 'hard', '{}'),
('40000000-0000-0000-0000-000000000001', 75, 'form', 'Pre-3-Month Check', 'Prepare for your 3-month follow-up', null, null, true, '12 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 88, 'message', 'Completing Smart Recovery Program', 'Congratulations on completing the smart recovery program! We wish you the best on your continued success. The messaging program will end on day 90.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 88, 'form', 'Patient Reported Outcome Measures', 'Final outcome assessment for your care team', null, null, true, '15 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 90, 'form', '3-Month Comprehensive Assessment', 'Complete evaluation at 3 months', null, null, true, '18 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 90, 'message', 'Thank You and Continued Success', 'Thank you for trusting us with your recovery journey. Continue your exercises and healthy lifestyle for long-term success!', null, null, true, null, null, '{}');

-- Phase 6: Long-term Recovery (Day 91 to 200) - Key checkpoints
INSERT INTO protocol_tasks (protocol_id, day, type, title, content, description, video_url, required, duration, difficulty, frequency) VALUES
('40000000-0000-0000-0000-000000000001', 120, 'form', '4-Month Check-in', 'Long-term recovery assessment', null, null, false, '10 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 120, 'message', 'Maintaining Your Progress', 'Continue regular exercise, maintain healthy weight, and stay active. Your new joint should allow you to enjoy activities with less pain.', null, null, false, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 150, 'form', '5-Month Progress', 'Optional check-in', null, null, false, '8 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 180, 'form', '6-Month Milestone', 'Half-year comprehensive assessment', null, null, true, '15 minutes', null, '{}'),
('40000000-0000-0000-0000-000000000001', 180, 'message', '6-Month Celebration', 'Congratulations on reaching 6 months! Most recovery is complete, but continue to protect your joint with regular exercise and healthy habits.', null, null, true, null, null, '{}'),
('40000000-0000-0000-0000-000000000001', 200, 'message', 'Long-term Success', 'Your active participation in recovery has brought you here. Remember annual check-ups and maintain your exercise routine for lasting success!', null, null, true, null, null, '{}')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON COLUMN protocol_tasks.frequency IS 'JSON frequency settings like {"type": "daily", "repeat": true}';