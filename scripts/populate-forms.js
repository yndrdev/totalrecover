const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateForms() {
  console.log('Starting forms population...');
  
  try {
    // Get default tenant ID
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('tenant_type', 'practice')
      .limit(1);
    
    if (tenantError) {
      console.error('Error fetching tenant:', tenantError);
      return;
    }
    
    if (!tenants || tenants.length === 0) {
      console.error('No practice tenant found');
      return;
    }
    
    const tenantId = tenants[0].id;
    console.log('Using tenant ID:', tenantId);
    
    // Define comprehensive form data based on the extracted SQL
    const formsData = [
      {
        tenant_id: tenantId,
        name: 'Universal Medical Questionnaire',
        description: 'Comprehensive pre-operative medical history assessment',
        form_type: 'pre_surgery',
        questions: [
          {
            id: 'basic_info_name',
            question: 'What is your full name?',
            type: 'text',
            required: true,
            section: 'Basic Information',
            placeholder: 'Enter your full legal name',
            help_text: 'Please provide your full legal name as it appears on your insurance card',
            voice_prompt: 'Please tell me your full name'
          },
          {
            id: 'basic_info_dob',
            question: 'What is your date of birth?',
            type: 'date',
            required: true,
            section: 'Basic Information',
            placeholder: 'MM/DD/YYYY',
            help_text: 'Your date of birth helps us verify your identity and calculate age-related risk factors',
            voice_prompt: 'What is your date of birth?'
          },
          {
            id: 'lifestyle_smoking',
            question: 'Do you smoke cigarettes or use tobacco products?',
            type: 'yes_no',
            required: true,
            section: 'Lifestyle Factors',
            help_text: 'Smoking significantly affects healing and increases surgical complications',
            voice_prompt: 'Do you smoke cigarettes or use any tobacco products?',
            clinical_significance: 'Smoking increases infection risk and delays healing'
          },
          {
            id: 'lifestyle_smoking_amount',
            question: 'How many cigarettes do you smoke per day?',
            type: 'number',
            required: false,
            section: 'Lifestyle Factors',
            placeholder: 'Number of cigarettes',
            help_text: 'This helps us assess your surgical risk and plan for smoking cessation',
            voice_prompt: 'How many cigarettes do you smoke per day?',
            conditional_display: { depends_on: 'lifestyle_smoking', value: 'yes' }
          },
          {
            id: 'lifestyle_alcohol',
            question: 'Do you drink alcohol?',
            type: 'yes_no',
            required: true,
            section: 'Lifestyle Factors',
            help_text: 'Alcohol use can affect anesthesia and pain medications',
            voice_prompt: 'Do you drink alcohol?',
            clinical_significance: 'Alcohol affects anesthesia and medication metabolism'
          },
          {
            id: 'medical_diabetes',
            question: 'Do you have diabetes?',
            type: 'yes_no',
            required: true,
            section: 'Current Medical Conditions',
            help_text: 'Diabetes affects healing and infection risk',
            voice_prompt: 'Do you have diabetes?',
            clinical_significance: 'Diabetes increases infection risk and affects healing',
            clinical_flags: ['diabetes_present']
          },
          {
            id: 'medical_hypertension',
            question: 'Do you have high blood pressure?',
            type: 'yes_no',
            required: true,
            section: 'Current Medical Conditions',
            help_text: 'High blood pressure affects anesthesia and surgical risk',
            voice_prompt: 'Do you have high blood pressure?',
            clinical_significance: 'Hypertension affects perioperative blood pressure management',
            clinical_flags: ['hypertension_present']
          },
          {
            id: 'medical_heart_disease',
            question: 'Do you have heart disease or have you had a heart attack?',
            type: 'yes_no',
            required: true,
            section: 'Current Medical Conditions',
            help_text: 'Heart conditions require special precautions during surgery',
            voice_prompt: 'Do you have any heart disease or have you had a heart attack?',
            clinical_significance: 'Cardiac conditions require perioperative monitoring and clearance',
            clinical_flags: ['cardiac_disease_present']
          },
          {
            id: 'medical_lung_disease',
            question: 'Do you have any breathing problems or lung disease?',
            type: 'yes_no',
            required: true,
            section: 'Current Medical Conditions',
            help_text: 'Lung conditions affect anesthesia and recovery',
            voice_prompt: 'Do you have any breathing problems or lung disease?',
            clinical_significance: 'Pulmonary conditions affect anesthesia and postoperative recovery',
            clinical_flags: ['pulmonary_disease_present']
          }
        ],
        metadata: {
          estimated_completion_time: 20,
          clinical_purpose: 'Assess patient medical history, current conditions, and surgical risk factors',
          surgery_types: ['TKA', 'THA'],
          version: 1
        },
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: 'Medication and Allergy Assessment',
        description: 'Complete medication list and allergy documentation',
        form_type: 'pre_surgery',
        questions: [
          {
            id: 'medications_current',
            question: 'List all medications you are currently taking',
            type: 'textarea',
            required: true,
            section: 'Current Medications',
            placeholder: 'Include prescription medications, over-the-counter drugs, and dosages',
            help_text: 'List all medications you are currently taking, including dosages and frequency',
            voice_prompt: 'Please tell me about all the medications you are currently taking'
          },
          {
            id: 'allergies_drug',
            question: 'Do you have any drug allergies?',
            type: 'yes_no',
            required: true,
            section: 'Allergies and Reactions',
            help_text: 'Drug allergies are important for medication safety during surgery',
            voice_prompt: 'Do you have any drug allergies?',
            clinical_significance: 'Drug allergies affect medication selection and safety'
          },
          {
            id: 'allergies_list',
            question: 'What medications are you allergic to and what happens?',
            type: 'textarea',
            required: false,
            section: 'Allergies and Reactions',
            placeholder: 'List each medication and describe the reaction',
            help_text: 'Please describe each medication allergy and what reaction you have',
            voice_prompt: 'What medications are you allergic to and what happens when you take them?',
            conditional_display: { depends_on: 'allergies_drug', value: 'yes' }
          },
          {
            id: 'supplements_vitamins',
            question: 'Do you take any vitamins, supplements, or herbal products?',
            type: 'yes_no',
            required: true,
            section: 'Supplements and Vitamins',
            help_text: 'Some supplements can affect bleeding and healing',
            voice_prompt: 'Do you take any vitamins, supplements, or herbal products?'
          },
          {
            id: 'supplements_list',
            question: 'What supplements, vitamins, or herbal products do you take?',
            type: 'textarea',
            required: false,
            section: 'Supplements and Vitamins',
            placeholder: 'List all supplements, vitamins, and herbal products',
            help_text: 'Include vitamins, minerals, herbal supplements, and any other non-prescription products',
            voice_prompt: 'What supplements, vitamins, or herbal products do you take?',
            conditional_display: { depends_on: 'supplements_vitamins', value: 'yes' }
          }
        ],
        metadata: {
          estimated_completion_time: 15,
          clinical_purpose: 'Document all medications and allergies for surgical safety',
          surgery_types: ['TKA', 'THA'],
          version: 1
        },
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: 'Daily Recovery Check-in',
        description: 'Daily assessment of pain, symptoms, and recovery progress',
        form_type: 'post_surgery',
        questions: [
          {
            id: 'pain_level',
            question: 'On a scale of 0-10, what is your current pain level?',
            type: 'pain_scale',
            required: true,
            section: 'Pain Assessment',
            help_text: '0 means no pain, 10 means the worst pain imaginable',
            voice_prompt: 'On a scale of 0 to 10, what is your current pain level?',
            clinical_significance: 'Pain assessment for medication adjustment and intervention',
            clinical_flags: ['high_pain_level'],
            validation: { min: 0, max: 10 }
          },
          {
            id: 'pain_location',
            question: 'Where is your pain located?',
            type: 'multiple_choice',
            required: true,
            section: 'Pain Assessment',
            help_text: 'Select all areas where you are experiencing pain',
            voice_prompt: 'Where is your pain located?',
            options: [
              { value: 'surgical_site', label: 'At the surgical site' },
              { value: 'knee', label: 'In my knee' },
              { value: 'hip', label: 'In my hip' },
              { value: 'thigh', label: 'In my thigh' },
              { value: 'calf', label: 'In my calf' },
              { value: 'back', label: 'In my back' },
              { value: 'other', label: 'Other location' }
            ],
            clinical_significance: 'Pain location helps identify complications or normal healing'
          },
          {
            id: 'pain_description',
            question: 'How would you describe your pain?',
            type: 'multiple_choice',
            required: false,
            section: 'Pain Assessment',
            help_text: 'Select the words that best describe your pain',
            voice_prompt: 'How would you describe your pain?',
            options: [
              { value: 'sharp', label: 'Sharp or stabbing' },
              { value: 'dull', label: 'Dull or aching' },
              { value: 'burning', label: 'Burning' },
              { value: 'throbbing', label: 'Throbbing' },
              { value: 'cramping', label: 'Cramping' },
              { value: 'shooting', label: 'Shooting' },
              { value: 'tingling', label: 'Tingling or numbness' }
            ],
            clinical_significance: 'Pain quality helps differentiate types of pain and appropriate treatment'
          },
          {
            id: 'pain_medication_compliance',
            question: 'Are you taking your pain medication as prescribed?',
            type: 'yes_no',
            required: true,
            section: 'Pain Assessment',
            help_text: 'It is important to take pain medication as directed for best results',
            voice_prompt: 'Are you taking your pain medication as prescribed?',
            clinical_significance: 'Medication compliance affects pain control and recovery',
            clinical_flags: ['medication_noncompliance']
          },
          {
            id: 'mobility_walking',
            question: 'Can you walk without assistance?',
            type: 'yes_no',
            required: true,
            section: 'Activity and Mobility',
            help_text: 'This helps us track your mobility progress',
            voice_prompt: 'Can you walk without any assistance?',
            clinical_significance: 'Independent mobility is a key recovery milestone'
          },
          {
            id: 'mobility_walking_distance',
            question: 'How far can you walk without stopping?',
            type: 'single_choice',
            required: true,
            section: 'Activity and Mobility',
            help_text: 'Select the distance that best describes how far you can walk',
            voice_prompt: 'How far can you walk without stopping to rest?',
            options: [
              { value: 'less_than_50_feet', label: 'Less than 50 feet' },
              { value: '50_to_100_feet', label: '50 to 100 feet' },
              { value: '100_to_300_feet', label: '100 to 300 feet' },
              { value: 'more_than_300_feet', label: 'More than 300 feet' },
              { value: 'unlimited', label: 'As far as I want' }
            ],
            clinical_significance: 'Walking distance indicates functional capacity and endurance'
          },
          {
            id: 'mobility_stairs',
            question: 'Can you climb stairs?',
            type: 'single_choice',
            required: true,
            section: 'Activity and Mobility',
            help_text: 'Stair climbing is an important functional milestone',
            voice_prompt: 'Can you climb stairs?',
            options: [
              { value: 'no', label: 'No, I cannot climb stairs' },
              { value: 'with_help', label: 'Yes, but I need help' },
              { value: 'with_rail', label: 'Yes, using the handrail' },
              { value: 'independently', label: 'Yes, without any assistance' }
            ],
            clinical_significance: 'Stair climbing requires strength, balance, and confidence'
          },
          {
            id: 'mobility_driving',
            question: 'Are you able to drive?',
            type: 'yes_no',
            required: false,
            section: 'Activity and Mobility',
            help_text: 'Driving requires good reflexes and range of motion',
            voice_prompt: 'Are you able to drive a car?',
            clinical_significance: 'Driving indicates functional independence and safety'
          }
        ],
        metadata: {
          estimated_completion_time: 5,
          clinical_purpose: 'Monitor daily recovery progress and identify complications early',
          surgery_types: ['TKA', 'THA'],
          version: 1
        },
        is_active: true
      },
      {
        tenant_id: tenantId,
        name: 'Weekly Functional Assessment',
        description: 'Weekly evaluation of functional progress and mobility',
        form_type: 'post_surgery',
        questions: [
          {
            id: 'functional_daily_activities',
            question: 'How well can you perform your daily activities?',
            type: 'scale',
            required: true,
            section: 'Functional Assessment',
            help_text: 'Rate your ability to perform daily activities like bathing, dressing, cooking',
            voice_prompt: 'How well can you perform your daily activities?',
            scale_options: { min: 1, max: 5, labels: ['Very difficult', 'Difficult', 'Moderate', 'Easy', 'Very easy'] },
            clinical_significance: 'Functional assessment indicates recovery progress and independence'
          },
          {
            id: 'functional_work_activities',
            question: 'Are you able to return to work activities?',
            type: 'single_choice',
            required: false,
            section: 'Functional Assessment',
            help_text: 'Select the option that best describes your work status',
            voice_prompt: 'Are you able to return to work activities?',
            options: [
              { value: 'not_applicable', label: 'Not applicable (retired/not working)' },
              { value: 'no', label: 'No, not yet' },
              { value: 'light_duty', label: 'Yes, light duty only' },
              { value: 'modified_duty', label: 'Yes, with modifications' },
              { value: 'full_duty', label: 'Yes, full duty' }
            ],
            clinical_significance: 'Work capacity indicates functional recovery level'
          },
          {
            id: 'functional_exercise_compliance',
            question: 'How often are you doing your prescribed exercises?',
            type: 'single_choice',
            required: true,
            section: 'Exercise Compliance',
            help_text: 'Select how frequently you are completing your exercise routine',
            voice_prompt: 'How often are you doing your prescribed exercises?',
            options: [
              { value: 'never', label: 'Never' },
              { value: 'rarely', label: 'Rarely (less than once a week)' },
              { value: 'sometimes', label: 'Sometimes (1-2 times per week)' },
              { value: 'often', label: 'Often (3-4 times per week)' },
              { value: 'daily', label: 'Daily as prescribed' }
            ],
            clinical_significance: 'Exercise compliance affects recovery outcomes',
            clinical_flags: ['poor_exercise_compliance']
          },
          {
            id: 'functional_sleep_quality',
            question: 'How would you rate your sleep quality?',
            type: 'scale',
            required: true,
            section: 'Sleep and Recovery',
            help_text: 'Rate your overall sleep quality over the past week',
            voice_prompt: 'How would you rate your sleep quality?',
            scale_options: { min: 1, max: 5, labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
            clinical_significance: 'Sleep quality affects healing and recovery'
          },
          {
            id: 'functional_mood',
            question: 'How would you describe your mood and emotional well-being?',
            type: 'scale',
            required: true,
            section: 'Mood and Well-being',
            help_text: 'Rate your overall mood and emotional state',
            voice_prompt: 'How would you describe your mood and emotional well-being?',
            scale_options: { min: 1, max: 5, labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
            clinical_significance: 'Mood affects recovery motivation and outcomes'
          }
        ],
        metadata: {
          estimated_completion_time: 10,
          clinical_purpose: 'Track functional recovery milestones and adjust treatment plans',
          surgery_types: ['TKA', 'THA'],
          version: 1
        },
        is_active: true
      }
    ];
    
    console.log(`Preparing to insert ${formsData.length} forms...`);
    
    // Insert forms one by one to handle any errors
    for (let i = 0; i < formsData.length; i++) {
      const form = formsData[i];
      console.log(`Inserting form ${i + 1}/${formsData.length}: ${form.name}...`);
      
      const { data, error } = await supabase
        .from('forms')
        .insert([form])
        .select('id, name');
      
      if (error) {
        console.error(`Error inserting form "${form.name}":`, error);
        console.error('Form data:', form);
        return;
      }
      
      console.log(`Successfully inserted form: ${data[0].name}`);
    }
    
    // Verify final count
    const { data: finalCount, error: countError } = await supabase
      .from('forms')
      .select('id')
      .eq('tenant_id', tenantId);
    
    if (countError) {
      console.error('Error getting final count:', countError);
    } else {
      console.log(`\n✅ Successfully populated ${finalCount.length} forms in the database!`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
if (require.main === module) {
  populateForms().then(() => {
    console.log('Forms population complete!');
    process.exit(0);
  }).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { populateForms };