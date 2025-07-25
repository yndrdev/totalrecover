-- =====================================================
-- EXERCISE SYSTEM SEED DATA
-- TJV Recovery Platform - Comprehensive Exercise Library
-- =====================================================

-- =====================================================
-- 1. EXERCISE CATEGORIES SEED DATA
-- =====================================================

-- Insert exercise categories for the default tenant
INSERT INTO exercise_categories (tenant_id, name, description, icon, color_code, sort_order) VALUES
-- Get the default tenant ID (assuming it exists)
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Range of Motion', 'Exercises to improve joint flexibility and movement', 'rotate-3d', '#4F46E5', 1),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Strengthening', 'Exercises to build muscle strength and endurance', 'dumbbell', '#059669', 2),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Balance & Stability', 'Exercises to improve balance and prevent falls', 'balance-scale', '#DC2626', 3),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Functional Movement', 'Real-world movements for daily activities', 'walking', '#7C2D12', 4),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Cardiovascular', 'Exercises to improve heart health and endurance', 'heart', '#BE185D', 5),
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1), 'Pain Management', 'Gentle exercises for pain relief and comfort', 'shield-heart', '#0891B2', 6);

-- =====================================================
-- 2. COMPREHENSIVE EXERCISE LIBRARY
-- =====================================================

-- Range of Motion Exercises
INSERT INTO exercises (
  tenant_id, category_id, name, description, instructions, exercise_type, difficulty_level,
  surgery_types, recovery_phases, default_duration_minutes, default_repetitions, default_sets,
  target_muscle_groups, joint_movements, pain_level_max, contraindications, precautions,
  modifications, equipment_needed, progression_criteria, evidence_level
) VALUES

-- Knee Range of Motion Exercises
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Range of Motion' LIMIT 1),
 'Ankle Pumps',
 'Simple ankle movement to improve circulation and prevent blood clots',
 'Lie on your back with legs straight. Point your toes up toward your head, then point them down away from your head. Move slowly and smoothly.',
 'range_of_motion', 'beginner',
 ARRAY['TKA', 'THA'], ARRAY['immediate', 'early', 'intermediate'],
 5, 20, 3,
 ARRAY['calf muscles', 'anterior tibialis'], ARRAY['ankle dorsiflexion', 'ankle plantarflexion'], 3,
 ARRAY['severe ankle injury', 'acute DVT'], ARRAY['stop if severe pain occurs'],
 ARRAY['can be done sitting if lying is uncomfortable'], ARRAY['none'],
 'Patient can perform 20 repetitions without fatigue', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Range of Motion' LIMIT 1),
 'Knee Flexion (Heel Slides)',
 'Gentle knee bending exercise to restore knee flexibility',
 'Lie on your back. Slowly slide your heel toward your buttocks, bending your knee as far as comfortable. Hold for 5 seconds, then slowly straighten your leg.',
 'range_of_motion', 'beginner',
 ARRAY['TKA'], ARRAY['immediate', 'early', 'intermediate'],
 10, 10, 2,
 ARRAY['quadriceps', 'hamstrings'], ARRAY['knee flexion', 'knee extension'], 5,
 ARRAY['acute knee infection', 'unstable fracture'], ARRAY['do not force movement', 'stop if sharp pain'],
 ARRAY['use towel under heel for easier sliding', 'can be done sitting'], ARRAY['towel (optional)'],
 'Achieve 90 degrees of knee flexion without significant pain', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Range of Motion' LIMIT 1),
 'Knee Extension (Quad Sets)',
 'Strengthening exercise for the quadriceps muscle',
 'Lie on your back with legs straight. Tighten your thigh muscle and push your knee down toward the floor. Hold for 5 seconds, then relax.',
 'range_of_motion', 'beginner',
 ARRAY['TKA'], ARRAY['immediate', 'early', 'intermediate', 'advanced'],
 10, 15, 3,
 ARRAY['quadriceps'], ARRAY['knee extension'], 4,
 ARRAY['acute quadriceps tear'], ARRAY['do not hold breath during exercise'],
 ARRAY['place rolled towel under knee for support'], ARRAY['towel (optional)'],
 'Can hold contraction for 10 seconds without fatigue', 'high'),

-- Hip Range of Motion Exercises
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Range of Motion' LIMIT 1),
 'Hip Flexion (Lying)',
 'Gentle hip bending to improve hip mobility',
 'Lie on your back. Slowly bring your knee toward your chest as far as comfortable. Hold for 5 seconds, then slowly lower your leg.',
 'range_of_motion', 'beginner',
 ARRAY['THA'], ARRAY['early', 'intermediate'],
 10, 10, 2,
 ARRAY['hip flexors', 'glutes'], ARRAY['hip flexion'], 5,
 ARRAY['hip dislocation precautions', 'acute hip infection'], ARRAY['do not flex hip beyond 90 degrees initially'],
 ARRAY['use hands to assist if needed'], ARRAY['none'],
 'Achieve 90 degrees of hip flexion comfortably', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Range of Motion' LIMIT 1),
 'Hip Abduction (Side-lying)',
 'Hip strengthening and mobility exercise',
 'Lie on your side with operated leg on top. Slowly lift your top leg toward the ceiling, keeping your knee straight. Hold for 2 seconds, then slowly lower.',
 'range_of_motion', 'intermediate',
 ARRAY['THA'], ARRAY['intermediate', 'advanced'],
 10, 12, 2,
 ARRAY['hip abductors', 'glutes'], ARRAY['hip abduction'], 4,
 ARRAY['acute hip pain'], ARRAY['do not lift leg too high initially'],
 ARRAY['support head with pillow', 'can be done standing with support'], ARRAY['pillow'],
 'Can lift leg 45 degrees without difficulty', 'high');

-- Strengthening Exercises
INSERT INTO exercises (
  tenant_id, category_id, name, description, instructions, exercise_type, difficulty_level,
  surgery_types, recovery_phases, default_duration_minutes, default_repetitions, default_sets,
  target_muscle_groups, joint_movements, pain_level_max, contraindications, precautions,
  modifications, equipment_needed, progression_criteria, evidence_level
) VALUES

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Strengthening' LIMIT 1),
 'Straight Leg Raises',
 'Strengthening exercise for quadriceps and hip flexors',
 'Lie on your back with one knee bent and foot flat on floor. Keep the other leg straight and lift it 6-12 inches off the ground. Hold for 5 seconds, then slowly lower.',
 'strength', 'intermediate',
 ARRAY['TKA', 'THA'], ARRAY['early', 'intermediate', 'advanced'],
 15, 10, 3,
 ARRAY['quadriceps', 'hip flexors'], ARRAY['hip flexion', 'knee extension'], 4,
 ARRAY['acute back pain', 'hip flexor strain'], ARRAY['keep back flat against floor'],
 ARRAY['bend knee slightly if too difficult', 'add ankle weights for progression'], ARRAY['ankle weights (optional)'],
 'Can perform 15 repetitions with 2-pound ankle weight', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Strengthening' LIMIT 1),
 'Glute Bridges',
 'Strengthening exercise for glutes and hamstrings',
 'Lie on your back with knees bent and feet flat on floor. Squeeze your buttocks and lift your hips off the ground. Hold for 5 seconds, then slowly lower.',
 'strength', 'intermediate',
 ARRAY['TKA', 'THA'], ARRAY['intermediate', 'advanced'],
 15, 12, 3,
 ARRAY['glutes', 'hamstrings', 'core'], ARRAY['hip extension'], 3,
 ARRAY['acute back pain'], ARRAY['do not arch back excessively'],
 ARRAY['place pillow between knees', 'single leg progression'], ARRAY['pillow (optional)'],
 'Can perform 15 repetitions holding for 10 seconds', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Strengthening' LIMIT 1),
 'Wall Sits',
 'Functional strengthening exercise for legs',
 'Stand with your back against a wall. Slowly slide down until your thighs are parallel to the floor (or as low as comfortable). Hold this position.',
 'strength', 'advanced',
 ARRAY['TKA', 'THA'], ARRAY['advanced', 'maintenance'],
 10, 1, 3,
 ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['knee flexion', 'hip flexion'], 5,
 ARRAY['acute knee pain', 'balance issues'], ARRAY['have chair nearby for support'],
 ARRAY['do not go as low initially', 'use exercise ball behind back'], ARRAY['exercise ball (optional)'],
 'Can hold position for 60 seconds', 'moderate');

-- Balance & Stability Exercises
INSERT INTO exercises (
  tenant_id, category_id, name, description, instructions, exercise_type, difficulty_level,
  surgery_types, recovery_phases, default_duration_minutes, default_repetitions, default_sets,
  target_muscle_groups, joint_movements, pain_level_max, contraindications, precautions,
  modifications, equipment_needed, progression_criteria, evidence_level
) VALUES

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Balance & Stability' LIMIT 1),
 'Single Leg Standing',
 'Balance exercise to improve stability and prevent falls',
 'Stand behind a chair for support. Lift one foot off the ground and balance on the other leg. Hold for as long as comfortable, up to 30 seconds.',
 'balance', 'intermediate',
 ARRAY['TKA', 'THA'], ARRAY['intermediate', 'advanced', 'maintenance'],
 10, 5, 2,
 ARRAY['core', 'ankle stabilizers', 'hip stabilizers'], ARRAY['ankle stabilization', 'hip stabilization'], 3,
 ARRAY['severe balance disorders', 'recent falls'], ARRAY['always have support nearby'],
 ARRAY['hold chair with both hands initially', 'progress to no hands'], ARRAY['sturdy chair'],
 'Can balance for 30 seconds without support', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Balance & Stability' LIMIT 1),
 'Heel-to-Toe Walking',
 'Dynamic balance exercise for walking stability',
 'Walk in a straight line placing the heel of one foot directly in front of the toes of the other foot. Take 10-20 steps.',
 'balance', 'intermediate',
 ARRAY['TKA', 'THA'], ARRAY['intermediate', 'advanced', 'maintenance'],
 10, 20, 2,
 ARRAY['core', 'ankle stabilizers', 'hip stabilizers'], ARRAY['dynamic balance'], 3,
 ARRAY['severe balance disorders', 'recent falls'], ARRAY['practice near wall for support'],
 ARRAY['start with normal walking, progress to heel-to-toe'], ARRAY['none'],
 'Can walk 20 steps without losing balance', 'high');

-- Functional Movement Exercises
INSERT INTO exercises (
  tenant_id, category_id, name, description, instructions, exercise_type, difficulty_level,
  surgery_types, recovery_phases, default_duration_minutes, default_repetitions, default_sets,
  target_muscle_groups, joint_movements, pain_level_max, contraindications, precautions,
  modifications, equipment_needed, progression_criteria, evidence_level
) VALUES

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Functional Movement' LIMIT 1),
 'Sit-to-Stand',
 'Functional exercise for getting up from chairs',
 'Sit in a chair with feet flat on floor. Without using your hands, stand up slowly and then sit back down slowly. Use your leg muscles to control the movement.',
 'functional', 'intermediate',
 ARRAY['TKA', 'THA'], ARRAY['early', 'intermediate', 'advanced'],
 10, 10, 3,
 ARRAY['quadriceps', 'glutes', 'core'], ARRAY['knee extension', 'hip extension'], 4,
 ARRAY['severe knee pain', 'balance issues'], ARRAY['have arms available for assistance if needed'],
 ARRAY['use hands on chair arms initially', 'use higher chair if needed'], ARRAY['sturdy chair'],
 'Can perform 10 repetitions without using hands', 'high'),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 (SELECT id FROM exercise_categories WHERE name = 'Functional Movement' LIMIT 1),
 'Step-Ups',
 'Functional exercise for stair climbing',
 'Stand in front of a step or sturdy platform. Step up with your operated leg, then bring the other leg up. Step down with the non-operated leg first.',
 'functional', 'advanced',
 ARRAY['TKA', 'THA'], ARRAY['advanced', 'maintenance'],
 15, 10, 2,
 ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['knee extension', 'hip extension', 'ankle plantarflexion'], 5,
 ARRAY['severe balance issues', 'acute joint pain'], ARRAY['use handrail for support'],
 ARRAY['start with low step', 'use handrail initially'], ARRAY['step or platform', 'handrail'],
 'Can perform 15 repetitions on 8-inch step without support', 'high');

-- =====================================================
-- 3. RECOVERY PROTOCOLS SEED DATA
-- =====================================================

-- TKA Recovery Protocol for Active Patients
INSERT INTO recovery_protocols (
  tenant_id, name, description, surgery_type, patient_activity_level,
  total_duration_days, phases, created_by, evidence_based, clinical_guidelines
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'TKA Active Patient Protocol',
 'Comprehensive recovery protocol for active patients following total knee arthroplasty',
 'TKA', 'active',
 90,
 '[
   {
     "name": "Immediate Post-Op",
     "days": "1-3",
     "goals": ["Pain management", "Prevent complications", "Begin gentle movement"],
     "focus": "Safety and initial mobility"
   },
   {
     "name": "Early Recovery",
     "days": "4-14",
     "goals": ["Restore basic ROM", "Reduce swelling", "Begin strengthening"],
     "focus": "Foundation building"
   },
   {
     "name": "Intermediate Recovery",
     "days": "15-42",
     "goals": ["Improve strength", "Advance ROM", "Functional activities"],
     "focus": "Progressive strengthening"
   },
   {
     "name": "Advanced Recovery",
     "days": "43-90",
     "goals": ["Return to activities", "Optimize function", "Prevent re-injury"],
     "focus": "Activity-specific training"
   }
 ]'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1),
 true,
 'Based on AAOS Clinical Practice Guidelines for TKA rehabilitation');

-- THA Recovery Protocol for Active Patients
INSERT INTO recovery_protocols (
  tenant_id, name, description, surgery_type, patient_activity_level,
  total_duration_days, phases, created_by, evidence_based, clinical_guidelines
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'THA Active Patient Protocol',
 'Comprehensive recovery protocol for active patients following total hip arthroplasty',
 'THA', 'active',
 90,
 '[
   {
     "name": "Immediate Post-Op",
     "days": "1-3",
     "goals": ["Pain management", "Hip precautions", "Begin gentle movement"],
     "focus": "Safety and precautions"
   },
   {
     "name": "Early Recovery",
     "days": "4-21",
     "goals": ["Restore basic ROM", "Strengthen hip", "Mobility training"],
     "focus": "Foundation and mobility"
   },
   {
     "name": "Intermediate Recovery",
     "days": "22-56",
     "goals": ["Advance strengthening", "Improve endurance", "Functional training"],
     "focus": "Progressive strengthening"
   },
   {
     "name": "Advanced Recovery",
     "days": "57-90",
     "goals": ["Return to activities", "Sport-specific training", "Long-term maintenance"],
     "focus": "Activity optimization"
   }
 ]'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1),
 true,
 'Based on AAOS Clinical Practice Guidelines for THA rehabilitation');

-- =====================================================
-- 4. PROTOCOL EXERCISES ASSIGNMENT
-- =====================================================

-- TKA Protocol Exercise Assignments
INSERT INTO protocol_exercises (
  protocol_id, exercise_id, start_day, end_day, frequency_per_day,
  duration_minutes, repetitions, sets, special_instructions
) VALUES

-- Immediate Phase (Days 1-3)
((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Ankle Pumps'),
 1, 14, 4, 5, 20, 3, 'Perform every 2 hours while awake to prevent blood clots'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Knee Extension (Quad Sets)'),
 1, 21, 3, 10, 15, 3, 'Focus on muscle activation, not force'),

-- Early Phase (Days 4-14)
((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Knee Flexion (Heel Slides)'),
 4, 42, 3, 10, 10, 2, 'Progress range of motion gradually'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Straight Leg Raises'),
 7, 90, 2, 15, 10, 3, 'Start when quad strength allows'),

-- Intermediate Phase (Days 15-42)
((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Glute Bridges'),
 15, 90, 2, 15, 12, 3, 'Focus on proper form and control'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Sit-to-Stand'),
 21, 90, 2, 10, 10, 3, 'Progress to no hands assistance'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Single Leg Standing'),
 28, 90, 2, 10, 5, 2, 'Start with support, progress to no hands'),

-- Advanced Phase (Days 43-90)
((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Wall Sits'),
 43, 90, 2, 10, 1, 3, 'Build endurance and functional strength'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Step-Ups'),
 50, 90, 2, 15, 10, 2, 'Start with low step, progress height'),

((SELECT id FROM recovery_protocols WHERE name = 'TKA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Heel-to-Toe Walking'),
 35, 90, 1, 10, 20, 2, 'Improve dynamic balance and coordination');

-- THA Protocol Exercise Assignments
INSERT INTO protocol_exercises (
  protocol_id, exercise_id, start_day, end_day, frequency_per_day,
  duration_minutes, repetitions, sets, special_instructions
) VALUES

-- Immediate Phase (Days 1-3)
((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Ankle Pumps'),
 1, 21, 4, 5, 20, 3, 'Essential for circulation and DVT prevention'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Knee Extension (Quad Sets)'),
 1, 21, 3, 10, 15, 3, 'Maintain quad strength during immobilization'),

-- Early Phase (Days 4-21)
((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Hip Flexion (Lying)'),
 4, 56, 3, 10, 10, 2, 'Respect hip precautions - no more than 90 degrees'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Straight Leg Raises'),
 7, 90, 2, 15, 10, 3, 'Strengthen hip flexors and quads'),

-- Intermediate Phase (Days 22-56)
((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Hip Abduction (Side-lying)'),
 22, 90, 2, 10, 12, 2, 'Strengthen hip abductors for stability'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Glute Bridges'),
 22, 90, 2, 15, 12, 3, 'Essential for hip extension strength'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Sit-to-Stand'),
 28, 90, 2, 10, 10, 3, 'Functional movement for daily activities'),

-- Advanced Phase (Days 57-90)
((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Single Leg Standing'),
 35, 90, 2, 10, 5, 2, 'Improve balance and hip stability'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Step-Ups'),
 57, 90, 2, 15, 10, 2, 'Advanced functional strengthening'),

((SELECT id FROM recovery_protocols WHERE name = 'THA Active Patient Protocol'),
 (SELECT id FROM exercises WHERE name = 'Heel-to-Toe Walking'),
 42, 90, 1, 10, 20, 2, 'Dynamic balance and gait training');

-- =====================================================
-- 5. DEMO PATIENT EXERCISE ASSIGNMENTS
-- =====================================================

-- Assign exercises to demo patient (Sarah Johnson - Day 5 post-TKA)
-- Assuming Sarah is 5 days post-surgery, assign appropriate exercises

INSERT INTO patient_exercises (
  patient_id, exercise_id, protocol_exercise_id, assigned_date, start_date,
  current_duration_minutes, current_repetitions, current_sets
)
SELECT 
  (SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
  pe.exercise_id,
  pe.id,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '5 days',
  pe.duration_minutes,
  pe.repetitions,
  pe.sets
FROM protocol_exercises pe
JOIN recovery_protocols rp ON pe.protocol_id = rp.id
WHERE rp.name = 'TKA Active Patient Protocol'
AND pe.start_day <= 5
AND (pe.end_day IS NULL OR pe.end_day >= 5);

-- =====================================================
-- 6. SAMPLE EXERCISE COMPLETIONS
-- =====================================================

-- Add some sample exercise completions for Sarah Johnson
INSERT INTO exercise_completions (
  patient_exercise_id, patient_id, exercise_id, completed_at, completion_date,
  duration_minutes, repetitions_completed, sets_completed,
  difficulty_rating, pain_level_before, pain_level_during, pain_level_after,
  fatigue_level, patient_notes, mood_rating, confidence_level
) VALUES

-- Ankle Pumps completion
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Ankle Pumps' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Ankle Pumps'),
 NOW() - INTERVAL '2 hours',
 CURRENT_DATE,
 5, 20, 3,
 3, 4, 2, 2,
 2, 'Felt good to move my ankle. No pain during exercise.', 4, 4),

-- Quad Sets completion
((SELECT pe.id FROM patient_exercises pe 
  JOIN exercises e ON pe.exercise_id = e.id 
  WHERE e.name = 'Knee Extension (Quad Sets)' 
  AND pe.patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') LIMIT 1),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 (SELECT id FROM exercises WHERE name = 'Knee Extension (Quad Sets)'),
 NOW() - INTERVAL '4 hours',
 CURRENT_DATE,
 10, 15, 3,
 4, 5, 4, 3,
 3, 'Could feel my thigh muscle working. Slight discomfort but manageable.', 3, 3);

-- =====================================================
-- 7. UPDATE STATISTICS
-- =====================================================

-- Update table statistics for better query performance
ANALYZE exercise_categories;
ANALYZE exercises;
ANALYZE recovery_protocols;
ANALYZE protocol_exercises;
ANALYZE patient_exercises;
ANALYZE exercise_completions;
ANALYZE exercise_modifications;

