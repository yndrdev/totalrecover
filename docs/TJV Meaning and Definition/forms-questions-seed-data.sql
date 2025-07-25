-- =====================================================
-- FORMS AND QUESTIONS SEED DATA
-- TJV Recovery Platform - Comprehensive Form Library
-- =====================================================

-- =====================================================
-- 1. MEDICAL REFERENCE DATA
-- =====================================================

-- Medical Conditions
INSERT INTO medical_conditions (name, icd_10_code, description, category, severity_levels, common_symptoms, surgical_implications, synonyms, search_keywords) VALUES
('Diabetes Mellitus Type 2', 'E11', 'Non-insulin dependent diabetes mellitus', 'endocrine', ARRAY['mild', 'moderate', 'severe'], ARRAY['increased thirst', 'frequent urination', 'fatigue'], 'Increased infection risk, delayed healing, blood sugar monitoring required', ARRAY['Type 2 diabetes', 'NIDDM'], ARRAY['diabetes', 'blood sugar', 'glucose']),
('Hypertension', 'I10', 'Essential hypertension', 'cardiovascular', ARRAY['mild', 'moderate', 'severe'], ARRAY['headache', 'dizziness', 'chest pain'], 'Blood pressure monitoring, medication adjustments may be needed', ARRAY['high blood pressure', 'HTN'], ARRAY['hypertension', 'blood pressure', 'BP']),
('Coronary Artery Disease', 'I25.9', 'Chronic ischemic heart disease', 'cardiovascular', ARRAY['mild', 'moderate', 'severe'], ARRAY['chest pain', 'shortness of breath', 'fatigue'], 'Cardiac clearance required, increased monitoring needed', ARRAY['CAD', 'heart disease'], ARRAY['heart', 'cardiac', 'coronary', 'chest pain']),
('Chronic Obstructive Pulmonary Disease', 'J44.9', 'COPD, unspecified', 'respiratory', ARRAY['mild', 'moderate', 'severe'], ARRAY['shortness of breath', 'chronic cough', 'wheezing'], 'Pulmonary function assessment, respiratory therapy may be needed', ARRAY['COPD', 'emphysema', 'chronic bronchitis'], ARRAY['COPD', 'breathing', 'lungs', 'respiratory']),
('Osteoarthritis', 'M19.9', 'Osteoarthritis, unspecified site', 'musculoskeletal', ARRAY['mild', 'moderate', 'severe'], ARRAY['joint pain', 'stiffness', 'reduced range of motion'], 'Primary indication for joint replacement surgery', ARRAY['arthritis', 'degenerative joint disease'], ARRAY['arthritis', 'joint pain', 'stiffness']),
('Rheumatoid Arthritis', 'M06.9', 'Rheumatoid arthritis, unspecified', 'autoimmune', ARRAY['mild', 'moderate', 'severe'], ARRAY['joint pain', 'swelling', 'morning stiffness'], 'Immunosuppression considerations, infection risk', ARRAY['RA'], ARRAY['rheumatoid', 'autoimmune', 'joint inflammation']),
('Obesity', 'E66.9', 'Obesity, unspecified', 'endocrine', ARRAY['mild', 'moderate', 'severe'], ARRAY['excess weight', 'fatigue', 'joint pain'], 'Increased surgical risk, wound healing considerations', ARRAY['overweight'], ARRAY['obesity', 'weight', 'BMI']),
('Depression', 'F32.9', 'Major depressive disorder, single episode, unspecified', 'psychiatric', ARRAY['mild', 'moderate', 'severe'], ARRAY['sadness', 'loss of interest', 'fatigue'], 'Pain perception and recovery motivation considerations', ARRAY['major depression'], ARRAY['depression', 'mood', 'mental health']),
('Anxiety Disorder', 'F41.9', 'Anxiety disorder, unspecified', 'psychiatric', ARRAY['mild', 'moderate', 'severe'], ARRAY['worry', 'restlessness', 'panic'], 'Pre-operative anxiety management, pain perception', ARRAY['anxiety'], ARRAY['anxiety', 'worry', 'panic', 'stress']),
('Sleep Apnea', 'G47.30', 'Sleep apnea, unspecified', 'respiratory', ARRAY['mild', 'moderate', 'severe'], ARRAY['snoring', 'daytime fatigue', 'morning headaches'], 'Anesthesia considerations, airway management', ARRAY['OSA', 'obstructive sleep apnea'], ARRAY['sleep apnea', 'snoring', 'CPAP']);

-- Medications
INSERT INTO medications (name, generic_name, brand_names, drug_class, common_dosages, administration_routes, surgical_considerations, preop_instructions, contraindications, synonyms, search_keywords) VALUES
('Metformin', 'metformin', ARRAY['Glucophage', 'Fortamet'], 'antidiabetic', ARRAY['500mg', '850mg', '1000mg'], ARRAY['oral'], 'Hold 48 hours before surgery if contrast used', 'Continue until day of surgery unless contrast study planned', ARRAY['kidney disease', 'metabolic acidosis'], ARRAY['Glucophage'], ARRAY['metformin', 'diabetes', 'blood sugar']),
('Lisinopril', 'lisinopril', ARRAY['Prinivil', 'Zestril'], 'ACE inhibitor', ARRAY['5mg', '10mg', '20mg', '40mg'], ARRAY['oral'], 'May cause hypotension during anesthesia', 'Continue until day of surgery', ARRAY['pregnancy', 'angioedema'], ARRAY['Prinivil', 'Zestril'], ARRAY['lisinopril', 'blood pressure', 'ACE inhibitor']),
('Atorvastatin', 'atorvastatin', ARRAY['Lipitor'], 'statin', ARRAY['10mg', '20mg', '40mg', '80mg'], ARRAY['oral'], 'Continue perioperatively', 'Continue until day of surgery', ARRAY['liver disease', 'pregnancy'], ARRAY['Lipitor'], ARRAY['atorvastatin', 'cholesterol', 'statin']),
('Warfarin', 'warfarin', ARRAY['Coumadin'], 'anticoagulant', ARRAY['1mg', '2mg', '5mg', '10mg'], ARRAY['oral'], 'STOP 5 days before surgery, bridge if needed', 'Stop 5 days before surgery, check INR', ARRAY['bleeding disorders', 'pregnancy'], ARRAY['Coumadin'], ARRAY['warfarin', 'blood thinner', 'anticoagulant']),
('Aspirin', 'aspirin', ARRAY['Bayer', 'Ecotrin'], 'antiplatelet', ARRAY['81mg', '325mg'], ARRAY['oral'], 'Stop 7 days before surgery unless cardiac risk', 'Stop 7 days before surgery unless high cardiac risk', ARRAY['bleeding disorders', 'allergy'], ARRAY['ASA'], ARRAY['aspirin', 'blood thinner', 'antiplatelet']),
('Ibuprofen', 'ibuprofen', ARRAY['Advil', 'Motrin'], 'NSAID', ARRAY['200mg', '400mg', '600mg', '800mg'], ARRAY['oral'], 'Stop 7 days before surgery', 'Stop 7 days before surgery', ARRAY['kidney disease', 'bleeding disorders'], ARRAY['Advil', 'Motrin'], ARRAY['ibuprofen', 'NSAID', 'pain reliever']),
('Omeprazole', 'omeprazole', ARRAY['Prilosec'], 'proton pump inhibitor', ARRAY['20mg', '40mg'], ARRAY['oral'], 'Continue perioperatively', 'Continue until day of surgery', ARRAY['severe liver disease'], ARRAY['Prilosec'], ARRAY['omeprazole', 'acid reflux', 'PPI']),
('Levothyroxine', 'levothyroxine', ARRAY['Synthroid', 'Levoxyl'], 'thyroid hormone', ARRAY['25mcg', '50mcg', '100mcg', '150mcg'], ARRAY['oral'], 'Continue perioperatively', 'Continue until day of surgery', ARRAY['hyperthyroidism'], ARRAY['Synthroid'], ARRAY['levothyroxine', 'thyroid', 'hormone']),
('Sertraline', 'sertraline', ARRAY['Zoloft'], 'SSRI antidepressant', ARRAY['25mg', '50mg', '100mg'], ARRAY['oral'], 'Continue perioperatively, bleeding risk', 'Continue until day of surgery', ARRAY['MAOI use'], ARRAY['Zoloft'], ARRAY['sertraline', 'antidepressant', 'SSRI']),
('Gabapentin', 'gabapentin', ARRAY['Neurontin'], 'anticonvulsant', ARRAY['100mg', '300mg', '600mg'], ARRAY['oral'], 'Continue perioperatively, may help with pain', 'Continue until day of surgery', ARRAY['kidney disease'], ARRAY['Neurontin'], ARRAY['gabapentin', 'nerve pain', 'seizure']);

-- =====================================================
-- 2. FORM TEMPLATES
-- =====================================================

-- Universal Medical Questionnaire
INSERT INTO form_templates (
  tenant_id, name, description, form_type, category, version, is_required,
  surgery_types, completion_time_estimate, clinical_purpose, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Universal Medical Questionnaire',
 'Comprehensive pre-operative medical history assessment',
 'pre_surgery', 'medical_history', 1, true,
 ARRAY['TKA', 'THA'], 20,
 'Assess patient medical history, current conditions, and surgical risk factors',
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

-- Medication and Allergy Documentation
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Medication and Allergy Assessment',
 'Complete medication list and allergy documentation',
 'pre_surgery', 'medications', 1, true,
 ARRAY['TKA', 'THA'], 15,
 'Document all medications and allergies for surgical safety',
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

-- Daily Pain and Symptom Check-in
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Daily Recovery Check-in',
 'Daily assessment of pain, symptoms, and recovery progress',
 'post_surgery', 'daily_assessment', 1, true,
 ARRAY['TKA', 'THA'], 5,
 'Monitor daily recovery progress and identify complications early',
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

-- Weekly Functional Assessment
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Weekly Functional Assessment',
 'Weekly evaluation of functional progress and mobility',
 'post_surgery', 'functional_assessment', 1, false,
 ARRAY['TKA', 'THA'], 10,
 'Track functional recovery milestones and adjust treatment plans',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1));

-- =====================================================
-- 3. FORM SECTIONS
-- =====================================================

-- Universal Medical Questionnaire Sections
INSERT INTO form_sections (form_template_id, name, description, instructions, sort_order, is_required) VALUES
((SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 'Basic Information', 'Personal and contact information', 'Please provide your basic information for our records', 1, true),
((SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 'Current Medical Conditions', 'Active medical conditions and diagnoses', 'Tell us about any medical conditions you currently have', 2, true),
((SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 'Previous Surgeries', 'History of surgical procedures', 'List any previous surgeries or procedures you have had', 3, false),
((SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 'Family Medical History', 'Family history of medical conditions', 'Tell us about significant medical conditions in your family', 4, false),
((SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 'Lifestyle Factors', 'Smoking, alcohol, exercise habits', 'Information about your lifestyle and habits', 5, true);

-- Medication Assessment Sections
INSERT INTO form_sections (form_template_id, name, description, instructions, sort_order, is_required) VALUES
((SELECT id FROM form_templates WHERE name = 'Medication and Allergy Assessment'),
 'Current Medications', 'All prescription and over-the-counter medications', 'List all medications you are currently taking', 1, true),
((SELECT id FROM form_templates WHERE name = 'Medication and Allergy Assessment'),
 'Allergies and Reactions', 'Drug allergies and adverse reactions', 'Tell us about any allergies or bad reactions to medications', 2, true),
((SELECT id FROM form_templates WHERE name = 'Medication and Allergy Assessment'),
 'Supplements and Vitamins', 'Dietary supplements and vitamins', 'List any supplements, vitamins, or herbal products you take', 3, false);

-- Daily Check-in Sections
INSERT INTO form_sections (form_template_id, name, description, instructions, sort_order, is_required) VALUES
((SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 'Pain Assessment', 'Current pain levels and characteristics', 'Tell us about your pain today', 1, true),
((SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 'Symptoms and Side Effects', 'Any symptoms or medication side effects', 'Report any symptoms or concerns', 2, true),
((SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 'Activity and Mobility', 'Daily activities and mobility status', 'How are you moving and functioning today?', 3, true),
((SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 'Mood and Sleep', 'Emotional well-being and sleep quality', 'How are you feeling emotionally and sleeping?', 4, false);

-- =====================================================
-- 4. QUESTIONS LIBRARY
-- =====================================================

-- Basic Information Questions
INSERT INTO questions (
  tenant_id, question_text, question_type, is_required, placeholder_text, help_text,
  voice_prompt, voice_response_type, clinical_significance, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'What is your full name?', 'text', true, 'Enter your full legal name',
 'Please provide your full legal name as it appears on your insurance card',
 'Please tell me your full name', 'any',
 'Patient identification and record matching', (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'What is your date of birth?', 'date', true, 'MM/DD/YYYY',
 'Your date of birth helps us verify your identity and calculate age-related risk factors',
 'What is your date of birth?', 'any',
 'Age-related surgical risk assessment', (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you smoke cigarettes or use tobacco products?', 'yes_no', true, null,
 'Smoking significantly affects healing and increases surgical complications',
 'Do you smoke cigarettes or use any tobacco products?', 'yes_no',
 'Smoking increases infection risk and delays healing', (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How many cigarettes do you smoke per day?', 'number', false, 'Number of cigarettes',
 'This helps us assess your surgical risk and plan for smoking cessation',
 'How many cigarettes do you smoke per day?', 'number',
 'Quantify smoking exposure for risk stratification', (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you drink alcohol?', 'yes_no', true, null,
 'Alcohol use can affect anesthesia and pain medications',
 'Do you drink alcohol?', 'yes_no',
 'Alcohol affects anesthesia and medication metabolism', (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1));

-- Medical Conditions Questions
INSERT INTO questions (
  tenant_id, question_text, question_type, is_required, help_text,
  voice_prompt, clinical_significance, clinical_alerts, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you have diabetes?', 'yes_no', true,
 'Diabetes affects healing and infection risk',
 'Do you have diabetes?',
 'Diabetes increases infection risk and affects healing',
 '{"concerning_responses": ["yes"], "followup_required": true}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you have high blood pressure?', 'yes_no', true,
 'High blood pressure affects anesthesia and surgical risk',
 'Do you have high blood pressure?',
 'Hypertension affects perioperative blood pressure management',
 '{"concerning_responses": ["yes"], "followup_required": true}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you have heart disease or have you had a heart attack?', 'yes_no', true,
 'Heart conditions require special precautions during surgery',
 'Do you have any heart disease or have you had a heart attack?',
 'Cardiac conditions require perioperative monitoring and clearance',
 '{"concerning_responses": ["yes"], "followup_required": true}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Do you have any breathing problems or lung disease?', 'yes_no', true,
 'Lung conditions affect anesthesia and recovery',
 'Do you have any breathing problems or lung disease?',
 'Pulmonary conditions affect anesthesia and postoperative recovery',
 '{"concerning_responses": ["yes"], "followup_required": true}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'surgeon' LIMIT 1));

-- Pain Assessment Questions
INSERT INTO questions (
  tenant_id, question_text, question_type, is_required, help_text,
  voice_prompt, clinical_significance, clinical_alerts, validation_rules, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'On a scale of 0-10, what is your current pain level?', 'pain_scale', true,
 '0 means no pain, 10 means the worst pain imaginable',
 'On a scale of 0 to 10, what is your current pain level?',
 'Pain assessment for medication adjustment and intervention',
 '{"pain_threshold": 7, "severe_pain": 8}'::jsonb,
 '{"min": 0, "max": 10, "type": "integer"}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Where is your pain located?', 'multiple_choice', true,
 'Select all areas where you are experiencing pain',
 'Where is your pain located?',
 'Pain location helps identify complications or normal healing',
 null,
 null,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How would you describe your pain?', 'multiple_choice', false,
 'Select the words that best describe your pain',
 'How would you describe your pain?',
 'Pain quality helps differentiate types of pain and appropriate treatment',
 null,
 null,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Are you taking your pain medication as prescribed?', 'yes_no', true,
 'It is important to take pain medication as directed for best results',
 'Are you taking your pain medication as prescribed?',
 'Medication compliance affects pain control and recovery',
 '{"concerning_responses": ["no"], "followup_required": true}'::jsonb,
 (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1));

-- Functional Assessment Questions
INSERT INTO questions (
  tenant_id, question_text, question_type, is_required, help_text,
  voice_prompt, clinical_significance, created_by
) VALUES
((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Can you walk without assistance?', 'yes_no', true,
 'This helps us track your mobility progress',
 'Can you walk without any assistance?',
 'Independent mobility is a key recovery milestone',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'How far can you walk without stopping?', 'single_choice', true,
 'Select the distance that best describes how far you can walk',
 'How far can you walk without stopping to rest?',
 'Walking distance indicates functional capacity and endurance',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Can you climb stairs?', 'single_choice', true,
 'Stair climbing is an important functional milestone',
 'Can you climb stairs?',
 'Stair climbing requires strength, balance, and confidence',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1)),

((SELECT id FROM tenants WHERE tenant_type = 'practice' LIMIT 1),
 'Are you able to drive?', 'yes_no', false,
 'Driving requires good reflexes and range of motion',
 'Are you able to drive a car?',
 'Driving indicates functional independence and safety',
 (SELECT id FROM profiles WHERE role = 'physical_therapist' LIMIT 1));

-- =====================================================
-- 5. QUESTION OPTIONS
-- =====================================================

-- Update questions with options for choice questions
UPDATE questions SET options = '[
  {"value": "surgical_site", "label": "At the surgical site"},
  {"value": "knee", "label": "In my knee"},
  {"value": "hip", "label": "In my hip"},
  {"value": "thigh", "label": "In my thigh"},
  {"value": "calf", "label": "In my calf"},
  {"value": "back", "label": "In my back"},
  {"value": "other", "label": "Other location"}
]'::jsonb WHERE question_text = 'Where is your pain located?';

UPDATE questions SET options = '[
  {"value": "sharp", "label": "Sharp or stabbing"},
  {"value": "dull", "label": "Dull or aching"},
  {"value": "burning", "label": "Burning"},
  {"value": "throbbing", "label": "Throbbing"},
  {"value": "cramping", "label": "Cramping"},
  {"value": "shooting", "label": "Shooting"},
  {"value": "tingling", "label": "Tingling or numbness"}
]'::jsonb WHERE question_text = 'How would you describe your pain?';

UPDATE questions SET options = '[
  {"value": "less_than_50_feet", "label": "Less than 50 feet"},
  {"value": "50_to_100_feet", "label": "50 to 100 feet"},
  {"value": "100_to_300_feet", "label": "100 to 300 feet"},
  {"value": "more_than_300_feet", "label": "More than 300 feet"},
  {"value": "unlimited", "label": "As far as I want"}
]'::jsonb WHERE question_text = 'How far can you walk without stopping?';

UPDATE questions SET options = '[
  {"value": "no", "label": "No, I cannot climb stairs"},
  {"value": "with_help", "label": "Yes, but I need help"},
  {"value": "with_rail", "label": "Yes, using the handrail"},
  {"value": "independently", "label": "Yes, without any assistance"}
]'::jsonb WHERE question_text = 'Can you climb stairs?';

-- =====================================================
-- 6. SECTION QUESTIONS ASSIGNMENT
-- =====================================================

-- Universal Medical Questionnaire - Basic Information Section
INSERT INTO section_questions (section_id, question_id, sort_order, is_required_override) VALUES
((SELECT id FROM form_sections WHERE name = 'Basic Information' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'What is your full name?'), 1, true),
((SELECT id FROM form_sections WHERE name = 'Basic Information' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'What is your date of birth?'), 2, true);

-- Universal Medical Questionnaire - Lifestyle Factors Section
INSERT INTO section_questions (section_id, question_id, sort_order, is_required_override) VALUES
((SELECT id FROM form_sections WHERE name = 'Lifestyle Factors' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you smoke cigarettes or use tobacco products?'), 1, true),
((SELECT id FROM form_sections WHERE name = 'Lifestyle Factors' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'How many cigarettes do you smoke per day?'), 2, false),
((SELECT id FROM form_sections WHERE name = 'Lifestyle Factors' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you drink alcohol?'), 3, true);

-- Universal Medical Questionnaire - Current Medical Conditions Section
INSERT INTO section_questions (section_id, question_id, sort_order, is_required_override) VALUES
((SELECT id FROM form_sections WHERE name = 'Current Medical Conditions' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have diabetes?'), 1, true),
((SELECT id FROM form_sections WHERE name = 'Current Medical Conditions' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have high blood pressure?'), 2, true),
((SELECT id FROM form_sections WHERE name = 'Current Medical Conditions' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have heart disease or have you had a heart attack?'), 3, true),
((SELECT id FROM form_sections WHERE name = 'Current Medical Conditions' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have any breathing problems or lung disease?'), 4, true);

-- Daily Recovery Check-in - Pain Assessment Section
INSERT INTO section_questions (section_id, question_id, sort_order, is_required_override) VALUES
((SELECT id FROM form_sections WHERE name = 'Pain Assessment' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'On a scale of 0-10, what is your current pain level?'), 1, true),
((SELECT id FROM form_sections WHERE name = 'Pain Assessment' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'Where is your pain located?'), 2, true),
((SELECT id FROM form_sections WHERE name = 'Pain Assessment' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'How would you describe your pain?'), 3, false),
((SELECT id FROM form_sections WHERE name = 'Pain Assessment' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'Are you taking your pain medication as prescribed?'), 4, true);

-- Weekly Functional Assessment - Activity and Mobility Section
INSERT INTO section_questions (section_id, question_id, sort_order, is_required_override) VALUES
((SELECT id FROM form_sections WHERE name = 'Activity and Mobility' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'Can you walk without assistance?'), 1, true),
((SELECT id FROM form_sections WHERE name = 'Activity and Mobility' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'How far can you walk without stopping?'), 2, true),
((SELECT id FROM form_sections WHERE name = 'Activity and Mobility' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'Can you climb stairs?'), 3, true),
((SELECT id FROM form_sections WHERE name = 'Activity and Mobility' AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in')),
 (SELECT id FROM questions WHERE question_text = 'Are you able to drive?'), 4, false);

-- =====================================================
-- 7. DEMO PATIENT FORMS
-- =====================================================

-- Assign forms to demo patient Sarah Johnson
INSERT INTO patient_forms (
  patient_id, form_template_id, assigned_date, due_date, status
) VALUES
-- Pre-surgery forms (completed)
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire'),
 CURRENT_DATE - INTERVAL '10 days',
 CURRENT_DATE - INTERVAL '3 days',
 'completed'),

((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM form_templates WHERE name = 'Medication and Allergy Assessment'),
 CURRENT_DATE - INTERVAL '10 days',
 CURRENT_DATE - INTERVAL '3 days',
 'completed'),

-- Daily check-ins (ongoing)
((SELECT user_id FROM patients WHERE user_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com')),
 (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in'),
 CURRENT_DATE,
 CURRENT_DATE,
 'in_progress');

-- =====================================================
-- 8. SAMPLE QUESTION RESPONSES
-- =====================================================

-- Sample responses for Sarah Johnson's completed forms
INSERT INTO question_responses (
  patient_form_id, question_id, patient_id, response_text, response_boolean, response_number,
  response_method, time_to_respond_seconds
) VALUES

-- Basic Information responses
((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'What is your full name?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 'Sarah Marie Johnson', null, null, 'text', 15),

-- Lifestyle responses
((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you smoke cigarettes or use tobacco products?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 null, false, null, 'voice', 8),

((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you drink alcohol?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 null, true, null, 'voice', 12),

-- Medical conditions responses
((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have diabetes?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 null, false, null, 'selection', 5),

((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Universal Medical Questionnaire')),
 (SELECT id FROM questions WHERE question_text = 'Do you have high blood pressure?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 null, true, null, 'selection', 7),

-- Today's pain assessment (in progress)
((SELECT id FROM patient_forms WHERE patient_id = (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com') AND form_template_id = (SELECT id FROM form_templates WHERE name = 'Daily Recovery Check-in') AND assigned_date = CURRENT_DATE),
 (SELECT id FROM questions WHERE question_text = 'On a scale of 0-10, what is your current pain level?'),
 (SELECT id FROM profiles WHERE email = 'sarah.johnson@demo.com'),
 null, null, 4, 'voice', 10);

-- =====================================================
-- 9. UPDATE STATISTICS
-- =====================================================

-- Update table statistics for better query performance
ANALYZE form_templates;
ANALYZE form_sections;
ANALYZE questions;
ANALYZE section_questions;
ANALYZE patient_forms;
ANALYZE question_responses;
ANALYZE medical_conditions;
ANALYZE medications;

