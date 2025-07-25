const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function populateExercises() {
  console.log('Starting exercises population...');
  
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
    
    // Define comprehensive exercise data matching the actual table structure
    const exercisesData = [
      // Range of Motion Exercises
      {
        tenant_id: tenantId,
        name: 'Ankle Pumps',
        description: 'Simple ankle movement to improve circulation and prevent blood clots',
        instructions: 'Lie on your back with legs straight. Point your toes up toward your head, then point them down away from your head. Move slowly and smoothly.',
        exercise_type: 'range_of_motion',
        body_part: 'ankle',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 20,
        default_sets: 3,
        default_duration_seconds: 300,
        default_rest_seconds: 30,
        difficulty_level: 1,
        progression_criteria: 'Patient can perform 20 repetitions without fatigue',
        equipment_needed: [],
        contraindications: ['severe ankle injury', 'acute DVT'],
        precautions: ['stop if severe pain occurs'],
        modifications: ['can be done sitting if lying is uncomfortable'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Knee Flexion (Heel Slides)',
        description: 'Gentle knee bending exercise to restore knee flexibility',
        instructions: 'Lie on your back. Slowly slide your heel toward your buttocks, bending your knee as far as comfortable. Hold for 5 seconds, then slowly straighten your leg.',
        exercise_type: 'range_of_motion',
        body_part: 'knee',
        surgery_types: ['TKA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 10,
        default_sets: 2,
        default_duration_seconds: 600,
        default_rest_seconds: 60,
        difficulty_level: 1,
        progression_criteria: 'Achieve 90 degrees of knee flexion without significant pain',
        equipment_needed: ['towel (optional)'],
        contraindications: ['acute knee infection', 'unstable fracture'],
        precautions: ['do not force movement', 'stop if sharp pain'],
        modifications: ['use towel under heel for easier sliding', 'can be done sitting'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Knee Extension (Quad Sets)',
        description: 'Strengthening exercise for the quadriceps muscle',
        instructions: 'Lie on your back with legs straight. Tighten your thigh muscle and push your knee down toward the floor. Hold for 5 seconds, then relax.',
        exercise_type: 'range_of_motion',
        body_part: 'knee',
        surgery_types: ['TKA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 15,
        default_sets: 3,
        default_duration_seconds: 600,
        default_rest_seconds: 45,
        difficulty_level: 1,
        progression_criteria: 'Can hold contraction for 10 seconds without fatigue',
        equipment_needed: ['towel (optional)'],
        contraindications: ['acute quadriceps tear'],
        precautions: ['do not hold breath during exercise'],
        modifications: ['place rolled towel under knee for support'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Hip Flexion (Lying)',
        description: 'Gentle hip bending to improve hip mobility',
        instructions: 'Lie on your back. Slowly bring your knee toward your chest as far as comfortable. Hold for 5 seconds, then slowly lower your leg.',
        exercise_type: 'range_of_motion',
        body_part: 'hip',
        surgery_types: ['THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 10,
        default_sets: 2,
        default_duration_seconds: 600,
        default_rest_seconds: 60,
        difficulty_level: 1,
        progression_criteria: 'Achieve 90 degrees of hip flexion comfortably',
        equipment_needed: [],
        contraindications: ['hip dislocation precautions', 'acute hip infection'],
        precautions: ['do not flex hip beyond 90 degrees initially'],
        modifications: ['use hands to assist if needed'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Hip Abduction (Side-lying)',
        description: 'Hip strengthening and mobility exercise',
        instructions: 'Lie on your side with operated leg on top. Slowly lift your top leg toward the ceiling, keeping your knee straight. Hold for 2 seconds, then slowly lower.',
        exercise_type: 'range_of_motion',
        body_part: 'hip',
        surgery_types: ['THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 12,
        default_sets: 2,
        default_duration_seconds: 600,
        default_rest_seconds: 60,
        difficulty_level: 2,
        progression_criteria: 'Can lift leg 45 degrees without difficulty',
        equipment_needed: ['pillow'],
        contraindications: ['acute hip pain'],
        precautions: ['do not lift leg too high initially'],
        modifications: ['support head with pillow', 'can be done standing with support'],
        is_active: true,
        usage_count: 0
      },
      
      // Strengthening Exercises
      {
        tenant_id: tenantId,
        name: 'Straight Leg Raises',
        description: 'Strengthening exercise for quadriceps and hip flexors',
        instructions: 'Lie on your back with one knee bent and foot flat on floor. Keep the other leg straight and lift it 6-12 inches off the ground. Hold for 5 seconds, then slowly lower.',
        exercise_type: 'range_of_motion',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 10,
        default_sets: 3,
        default_duration_seconds: 900,
        default_rest_seconds: 90,
        difficulty_level: 2,
        progression_criteria: 'Can perform 15 repetitions with 2-pound ankle weight',
        equipment_needed: ['ankle weights (optional)'],
        contraindications: ['acute back pain', 'hip flexor strain'],
        precautions: ['keep back flat against floor'],
        modifications: ['bend knee slightly if too difficult', 'add ankle weights for progression'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Glute Bridges',
        description: 'Strengthening exercise for glutes and hamstrings',
        instructions: 'Lie on your back with knees bent and feet flat on floor. Squeeze your buttocks and lift your hips off the ground. Hold for 5 seconds, then slowly lower.',
        exercise_type: 'range_of_motion',
        body_part: 'hip',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 12,
        default_sets: 3,
        default_duration_seconds: 900,
        default_rest_seconds: 90,
        difficulty_level: 2,
        progression_criteria: 'Can perform 15 repetitions holding for 10 seconds',
        equipment_needed: ['pillow (optional)'],
        contraindications: ['acute back pain'],
        precautions: ['do not arch back excessively'],
        modifications: ['place pillow between knees', 'single leg progression'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Wall Sits',
        description: 'Functional strengthening exercise for legs',
        instructions: 'Stand with your back against a wall. Slowly slide down until your thighs are parallel to the floor (or as low as comfortable). Hold this position.',
        exercise_type: 'range_of_motion',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active'],
        default_repetitions: 1,
        default_sets: 3,
        default_duration_seconds: 600,
        default_rest_seconds: 120,
        difficulty_level: 3,
        progression_criteria: 'Can hold position for 60 seconds',
        equipment_needed: ['exercise ball (optional)'],
        contraindications: ['acute knee pain', 'balance issues'],
        precautions: ['have chair nearby for support'],
        modifications: ['do not go as low initially', 'use exercise ball behind back'],
        is_active: true,
        usage_count: 0
      },
      
      // Balance & Stability Exercises
      {
        tenant_id: tenantId,
        name: 'Single Leg Standing',
        description: 'Balance exercise to improve stability and prevent falls',
        instructions: 'Stand behind a chair for support. Lift one foot off the ground and balance on the other leg. Hold for as long as comfortable, up to 30 seconds.',
        exercise_type: 'balance',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 5,
        default_sets: 2,
        default_duration_seconds: 600,
        default_rest_seconds: 60,
        difficulty_level: 2,
        progression_criteria: 'Can balance for 30 seconds without support',
        equipment_needed: ['sturdy chair'],
        contraindications: ['severe balance disorders', 'recent falls'],
        precautions: ['always have support nearby'],
        modifications: ['hold chair with both hands initially', 'progress to no hands'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Heel-to-Toe Walking',
        description: 'Dynamic balance exercise for walking stability',
        instructions: 'Walk in a straight line placing the heel of one foot directly in front of the toes of the other foot. Take 10-20 steps.',
        exercise_type: 'balance',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 20,
        default_sets: 2,
        default_duration_seconds: 600,
        default_rest_seconds: 60,
        difficulty_level: 2,
        progression_criteria: 'Can walk 20 steps without losing balance',
        equipment_needed: [],
        contraindications: ['severe balance disorders', 'recent falls'],
        precautions: ['practice near wall for support'],
        modifications: ['start with normal walking, progress to heel-to-toe'],
        is_active: true,
        usage_count: 0
      },
      
      // Functional Movement Exercises
      {
        tenant_id: tenantId,
        name: 'Sit-to-Stand',
        description: 'Functional exercise for getting up from chairs',
        instructions: 'Sit in a chair with feet flat on floor. Without using your hands, stand up slowly and then sit back down slowly. Use your leg muscles to control the movement.',
        exercise_type: 'functional',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active', 'sedentary'],
        default_repetitions: 10,
        default_sets: 3,
        default_duration_seconds: 600,
        default_rest_seconds: 90,
        difficulty_level: 2,
        progression_criteria: 'Can perform 10 repetitions without using hands',
        equipment_needed: ['sturdy chair'],
        contraindications: ['severe knee pain', 'balance issues'],
        precautions: ['have arms available for assistance if needed'],
        modifications: ['use hands on chair arms initially', 'use higher chair if needed'],
        is_active: true,
        usage_count: 0
      },
      {
        tenant_id: tenantId,
        name: 'Step-Ups',
        description: 'Functional exercise for stair climbing',
        instructions: 'Stand in front of a step or sturdy platform. Step up with your operated leg, then bring the other leg up. Step down with the non-operated leg first.',
        exercise_type: 'functional',
        body_part: 'knee',
        surgery_types: ['TKA', 'THA'],
        activity_levels: ['active'],
        default_repetitions: 10,
        default_sets: 2,
        default_duration_seconds: 900,
        default_rest_seconds: 120,
        difficulty_level: 3,
        progression_criteria: 'Can perform 15 repetitions on 8-inch step without support',
        equipment_needed: ['step or platform', 'handrail'],
        contraindications: ['severe balance issues', 'acute joint pain'],
        precautions: ['use handrail for support'],
        modifications: ['start with low step', 'use handrail initially'],
        is_active: true,
        usage_count: 0
      }
    ];
    
    console.log(`Preparing to insert ${exercisesData.length} exercises...`);
    
    // Insert exercises in batches
    const batchSize = 3;
    for (let i = 0; i < exercisesData.length; i += batchSize) {
      const batch = exercisesData.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(exercisesData.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(batch)
        .select('id, name');
      
      if (error) {
        console.error('Error inserting exercises batch:', error);
        console.error('Failed batch:', batch);
        return;
      }
      
      console.log(`Successfully inserted exercises:`, data.map(e => e.name));
    }
    
    // Verify final count
    const { data: finalCount, error: countError } = await supabase
      .from('exercises')
      .select('id')
      .eq('tenant_id', tenantId);
    
    if (countError) {
      console.error('Error getting final count:', countError);
    } else {
      console.log(`\n✅ Successfully populated ${finalCount.length} exercises in the database!`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
if (require.main === module) {
  populateExercises().then(() => {
    console.log('Exercise population complete!');
    process.exit(0);
  }).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { populateExercises };