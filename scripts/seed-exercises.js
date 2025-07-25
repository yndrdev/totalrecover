const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedExercises() {
  try {
    // Get the default tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', 'Default Healthcare Platform')
      .single();

    if (!tenant) {
      console.error('Default tenant not found. Please run setup-default-tenant.js first');
      process.exit(1);
    }

    const tenantId = tenant.id;
    console.log('Using tenant:', tenantId);

    // Create exercise videos first
    const exerciseVideos = [
      {
        tenant_id: tenantId,
        title: 'Knee Flexion and Extension',
        description: 'Basic knee movement exercise for range of motion',
        duration_seconds: 180,
        video_files: {
          '1080p': 'https://example.com/videos/knee-flexion-1080p.mp4',
          '720p': 'https://example.com/videos/knee-flexion-720p.mp4',
          '480p': 'https://example.com/videos/knee-flexion-480p.mp4'
        },
        thumbnail_url: 'https://example.com/thumbnails/knee-flexion.jpg',
        chapters: [
          { title: 'Introduction', startTime: 0, endTime: 30 },
          { title: 'Setup Position', startTime: 30, endTime: 60 },
          { title: 'Exercise Demonstration', startTime: 60, endTime: 150 },
          { title: 'Common Mistakes', startTime: 150, endTime: 180 }
        ],
        instruction_overlays: [
          { timestamp: 45, text: 'Keep your back flat against the bed', type: 'form_cue' },
          { timestamp: 90, text: 'Slowly bend your knee toward your chest', type: 'form_cue' },
          { timestamp: 120, text: 'Hold for 5 seconds at the top', type: 'form_cue' }
        ]
      },
      {
        tenant_id: tenantId,
        title: 'Heel Slides',
        description: 'Gentle knee bending exercise using heel slides',
        duration_seconds: 150,
        video_files: {
          '1080p': 'https://example.com/videos/heel-slides-1080p.mp4',
          '720p': 'https://example.com/videos/heel-slides-720p.mp4',
          '480p': 'https://example.com/videos/heel-slides-480p.mp4'
        },
        thumbnail_url: 'https://example.com/thumbnails/heel-slides.jpg',
        chapters: [
          { title: 'Introduction', startTime: 0, endTime: 20 },
          { title: 'Starting Position', startTime: 20, endTime: 40 },
          { title: 'Exercise Movement', startTime: 40, endTime: 130 },
          { title: 'Tips', startTime: 130, endTime: 150 }
        ]
      },
      {
        tenant_id: tenantId,
        title: 'Quadriceps Sets',
        description: 'Isometric strengthening exercise for quadriceps',
        duration_seconds: 120,
        video_files: {
          '1080p': 'https://example.com/videos/quad-sets-1080p.mp4',
          '720p': 'https://example.com/videos/quad-sets-720p.mp4',
          '480p': 'https://example.com/videos/quad-sets-480p.mp4'
        },
        thumbnail_url: 'https://example.com/thumbnails/quad-sets.jpg'
      },
      {
        tenant_id: tenantId,
        title: 'Ankle Pumps',
        description: 'Simple ankle movement to improve circulation',
        duration_seconds: 90,
        video_files: {
          '1080p': 'https://example.com/videos/ankle-pumps-1080p.mp4',
          '720p': 'https://example.com/videos/ankle-pumps-720p.mp4',
          '480p': 'https://example.com/videos/ankle-pumps-480p.mp4'
        },
        thumbnail_url: 'https://example.com/thumbnails/ankle-pumps.jpg'
      },
      {
        tenant_id: tenantId,
        title: 'Straight Leg Raises',
        description: 'Strengthening exercise for hip flexors and quadriceps',
        duration_seconds: 180,
        video_files: {
          '1080p': 'https://example.com/videos/straight-leg-raises-1080p.mp4',
          '720p': 'https://example.com/videos/straight-leg-raises-720p.mp4',
          '480p': 'https://example.com/videos/straight-leg-raises-480p.mp4'
        },
        thumbnail_url: 'https://example.com/thumbnails/straight-leg-raises.jpg'
      }
    ];

    console.log('Creating exercise videos...');
    const { data: videos, error: videoError } = await supabase
      .from('exercise_videos')
      .insert(exerciseVideos)
      .select();

    if (videoError) {
      console.error('Error creating videos:', videoError);
      return;
    }

    console.log('Created', videos.length, 'exercise videos');

    // Create exercises with references to videos
    const exercises = [
      {
        tenant_id: tenantId,
        name: 'Knee Flexion and Extension',
        description: 'Gentle bending and straightening of the knee to improve range of motion',
        category: 'range_of_motion',
        default_repetitions: 10,
        default_sets: 3,
        default_rest_seconds: 30,
        difficulty_level: 1,
        target_muscle_groups: ['quadriceps', 'hamstrings'],
        joint_movements: ['knee_flexion', 'knee_extension'],
        benefits: [
          'Improves knee flexibility',
          'Reduces stiffness',
          'Prepares for more advanced exercises'
        ],
        contraindications: ['Acute infection', 'Severe pain'],
        primary_video_id: videos[0].id,
        instruction_points: [
          { step: 1, instruction: 'Lie on your back with legs straight' },
          { step: 2, instruction: 'Slowly bend your knee, sliding your heel toward your buttocks' },
          { step: 3, instruction: 'Hold for 5 seconds' },
          { step: 4, instruction: 'Slowly straighten your leg back to starting position' }
        ],
        safety_warnings: [
          { warning: 'Stop if you feel sharp pain' },
          { warning: 'Do not force the movement beyond comfortable range' }
        ],
        required_equipment: [],
        optional_equipment: ['Towel roll for under knee'],
        space_requirements: 'Bed or floor space',
        setup_instructions: 'Lie flat on your back on a firm surface'
      },
      {
        tenant_id: tenantId,
        name: 'Heel Slides',
        description: 'Sliding heel movement to gently increase knee flexibility',
        category: 'range_of_motion',
        default_repetitions: 15,
        default_sets: 3,
        default_rest_seconds: 20,
        difficulty_level: 1,
        target_muscle_groups: ['quadriceps', 'hamstrings', 'hip_flexors'],
        joint_movements: ['knee_flexion', 'hip_flexion'],
        benefits: [
          'Gentle way to improve knee bending',
          'Minimal stress on joint',
          'Can be done in bed'
        ],
        contraindications: ['Wound drainage', 'Severe swelling'],
        primary_video_id: videos[1].id,
        instruction_points: [
          { step: 1, instruction: 'Lie on your back with legs straight' },
          { step: 2, instruction: 'Slowly slide your heel toward your buttocks' },
          { step: 3, instruction: 'Keep your heel in contact with the surface' },
          { step: 4, instruction: 'Return to starting position' }
        ],
        required_equipment: [],
        optional_equipment: ['Plastic bag under heel for easier sliding'],
        space_requirements: 'Bed or floor space'
      },
      {
        tenant_id: tenantId,
        name: 'Quadriceps Sets',
        description: 'Isometric exercise to strengthen thigh muscles without joint movement',
        category: 'strengthening',
        default_repetitions: 10,
        default_sets: 3,
        default_duration_seconds: 5,
        default_rest_seconds: 10,
        difficulty_level: 1,
        target_muscle_groups: ['quadriceps'],
        joint_movements: [],
        benefits: [
          'Strengthens quadriceps',
          'Improves muscle activation',
          'Safe early post-surgery'
        ],
        contraindications: ['DVT symptoms', 'Severe muscle pain'],
        primary_video_id: videos[2].id,
        instruction_points: [
          { step: 1, instruction: 'Lie on your back with legs straight' },
          { step: 2, instruction: 'Tighten your thigh muscle, pushing knee down' },
          { step: 3, instruction: 'Hold for 5 seconds' },
          { step: 4, instruction: 'Relax completely' }
        ],
        required_equipment: [],
        space_requirements: 'Bed or floor space'
      },
      {
        tenant_id: tenantId,
        name: 'Ankle Pumps',
        description: 'Simple ankle movements to improve circulation and reduce swelling',
        category: 'cardiovascular',
        default_repetitions: 20,
        default_sets: 5,
        default_rest_seconds: 10,
        difficulty_level: 1,
        target_muscle_groups: ['calves', 'tibialis_anterior'],
        joint_movements: ['ankle_dorsiflexion', 'ankle_plantarflexion'],
        benefits: [
          'Improves blood circulation',
          'Reduces risk of blood clots',
          'Decreases swelling'
        ],
        contraindications: ['Ankle injury', 'Peripheral vascular disease'],
        primary_video_id: videos[3].id,
        instruction_points: [
          { step: 1, instruction: 'Lie or sit with legs extended' },
          { step: 2, instruction: 'Point toes away from you' },
          { step: 3, instruction: 'Pull toes back toward you' },
          { step: 4, instruction: 'Repeat in smooth, controlled motion' }
        ],
        required_equipment: [],
        space_requirements: 'Can be done in bed or chair'
      },
      {
        tenant_id: tenantId,
        name: 'Straight Leg Raises',
        description: 'Strengthening exercise for hip and thigh muscles',
        category: 'strengthening',
        default_repetitions: 10,
        default_sets: 3,
        default_rest_seconds: 30,
        difficulty_level: 2,
        target_muscle_groups: ['quadriceps', 'hip_flexors', 'core'],
        joint_movements: ['hip_flexion'],
        benefits: [
          'Strengthens leg without bending knee',
          'Improves hip stability',
          'Prepares for walking'
        ],
        contraindications: ['Hip precautions', 'Severe weakness'],
        primary_video_id: videos[4].id,
        instruction_points: [
          { step: 1, instruction: 'Lie on your back, bend non-surgical knee' },
          { step: 2, instruction: 'Tighten thigh muscle of surgical leg' },
          { step: 3, instruction: 'Lift leg 6-12 inches off surface' },
          { step: 4, instruction: 'Hold for 5 seconds' },
          { step: 5, instruction: 'Lower slowly' }
        ],
        safety_warnings: [
          { warning: 'Keep knee straight throughout' },
          { warning: 'Do not arch your back' }
        ],
        required_equipment: [],
        space_requirements: 'Bed or floor space',
        modifications: {
          easier: 'Bend knee slightly if too difficult',
          harder: 'Add ankle weight when approved by therapist'
        }
      }
    ];

    console.log('Creating exercises...');
    const { data: createdExercises, error: exerciseError } = await supabase
      .from('exercises')
      .insert(exercises)
      .select();

    if (exerciseError) {
      console.error('Error creating exercises:', exerciseError);
      return;
    }

    console.log('Created', createdExercises.length, 'exercises');

    // Create daily check-in questions
    const checkInQuestions = [
      {
        tenant_id: tenantId,
        question_text: 'How would you rate your pain level right now?',
        question_type: 'pain_scale',
        category: 'pain',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        min_value: 0,
        max_value: 10,
        required: true,
        display_order: 1,
        follow_up_threshold: 7,
        follow_up_action: 'alert_nurse'
      },
      {
        tenant_id: tenantId,
        question_text: 'How is your surgical site swelling today?',
        question_type: 'multiple_choice',
        category: 'mobility',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        options: [
          { value: 'none', label: 'No swelling' },
          { value: 'mild', label: 'Mild swelling' },
          { value: 'moderate', label: 'Moderate swelling' },
          { value: 'severe', label: 'Severe swelling' }
        ],
        required: true,
        display_order: 2,
        follow_up_threshold: 3,
        follow_up_action: 'provide_swelling_tips'
      },
      {
        tenant_id: tenantId,
        question_text: 'How did you sleep last night?',
        question_type: 'multiple_choice',
        category: 'general',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        options: [
          { value: 'excellent', label: 'Excellent' },
          { value: 'good', label: 'Good' },
          { value: 'fair', label: 'Fair' },
          { value: 'poor', label: 'Poor' }
        ],
        required: true,
        display_order: 3
      },
      {
        tenant_id: tenantId,
        question_text: 'Have you taken your pain medication as prescribed today?',
        question_type: 'yes_no',
        category: 'medication',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        required: true,
        display_order: 4
      },
      {
        tenant_id: tenantId,
        question_text: 'How many steps did you take today?',
        question_type: 'numeric',
        category: 'mobility',
        recovery_phase: ['phase2', 'phase3', 'phase4'],
        surgery_types: ['TKA', 'THA'],
        min_value: 0,
        max_value: 10000,
        required: false,
        display_order: 5
      },
      {
        tenant_id: tenantId,
        question_text: 'How are you feeling emotionally today?',
        question_type: 'multiple_choice',
        category: 'mood',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        options: [
          { value: 'great', label: 'Great' },
          { value: 'good', label: 'Good' },
          { value: 'okay', label: 'Okay' },
          { value: 'anxious', label: 'Anxious' },
          { value: 'frustrated', label: 'Frustrated' },
          { value: 'sad', label: 'Sad' }
        ],
        required: true,
        display_order: 6,
        follow_up_threshold: 4,
        follow_up_action: 'provide_emotional_support'
      },
      {
        tenant_id: tenantId,
        question_text: 'Any concerns or questions for your care team?',
        question_type: 'text',
        category: 'general',
        recovery_phase: ['all'],
        surgery_types: ['TKA', 'THA'],
        required: false,
        display_order: 7
      }
    ];

    console.log('Creating daily check-in questions...');
    const { data: questions, error: questionError } = await supabase
      .from('daily_checkin_questions')
      .insert(checkInQuestions)
      .select();

    if (questionError) {
      console.error('Error creating questions:', questionError);
      return;
    }

    console.log('Created', questions.length, 'daily check-in questions');

    console.log('✅ Exercise system setup complete!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the seeding
seedExercises();