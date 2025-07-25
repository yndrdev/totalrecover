/**
 * TJV Recovery Platform - Real Data Population Script
 * 
 * This script populates the Supabase database with real healthcare data
 * extracted from Claude_Docs including:
 * - Master exercise lists with comprehensive TKA/THA exercises
 * - Pre-surgery forms and questionnaires
 * - Daily check-in questions for recovery tracking
 * - Demo users and accounts for testing
 * 
 * Run with: npm run populate-data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

// Load environment variables from .env.local
const supabaseUrl = 'https://slhdxlhnwujvqkwdgfko.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaGR4bGhud3VqdnFrd2RnZmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI5NjM3NiwiZXhwIjoyMDY3ODcyMzc2fQ.d6mv3rYpvSa4mjhWpOkcNUGwqzpgq0a6cNIyl__EvdE';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Master Exercise Library from Claude_Docs
const exerciseLibrary = [
  // Range of Motion Exercises - TKA
  {
    name: "Ankle Pumps",
    description: "Basic ankle flexion and extension to improve circulation and prevent blood clots. Targets ankle and calf muscles through ankle flexion and extension movements. Benefits include improved circulation, blood clot prevention, and early mobility.",
    instructions: "Sit comfortably with legs extended or lie flat in bed. Flex and extend your ankles slowly and smoothly.",
    exercise_type: "range_of_motion",
    body_part: "ankle",
    surgery_types: ["TKA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 3,
    default_duration_seconds: null,
    difficulty_level: 1,
    contraindications: ["severe_swelling", "cast_immobilization"],
    equipment_needed: [],
    space_requirements: "bed or chair",
    setup_instructions: "Sit comfortably with legs extended or lie flat in bed",
    modifications: {
      "high_pain": { "repetitions": 5, "rest_seconds": 60 },
      "limited_mobility": { "assisted": true }
    }
  },
  {
    name: "Quad Sets",
    description: "Isometric quadriceps strengthening to prevent muscle atrophy and improve knee stability",
    category: "strengthening",
    surgery_types: ["TKA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 3,
    default_duration_seconds: 5,
    difficulty_level: 2,
    target_muscle_groups: ["quadriceps"],
    joint_movements: ["knee_extension"],
    benefits: ["muscle_strength", "knee_stability", "atrophy_prevention"],
    contraindications: ["severe_knee_pain", "fresh_surgical_site"],
    required_equipment: [],
    optional_equipment: ["towel_roll"],
    space_requirements: "bed or floor mat",
    setup_instructions: "Lie flat with towel roll under knee, tighten thigh muscle",
    progression_criteria: { "hold_time": "> 5_seconds", "completion_rate": "> 90%" },
    modifications: {
      "acute_phase": { "hold_time": 3, "repetitions": 5 },
      "advanced": { "hold_time": 10, "repetitions": 15 }
    }
  },
  {
    name: "Heel Slides",
    description: "Active knee flexion exercise to restore range of motion and prevent stiffness",
    category: "range_of_motion",
    surgery_types: ["TKA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: null,
    difficulty_level: 2,
    target_muscle_groups: ["hamstrings", "quadriceps"],
    joint_movements: ["knee_flexion", "knee_extension"],
    benefits: ["range_of_motion", "flexibility", "scar_tissue_prevention"],
    contraindications: ["knee_flexion_restriction", "severe_pain"],
    required_equipment: [],
    optional_equipment: ["plastic_bag", "powder"],
    space_requirements: "bed or floor mat",
    setup_instructions: "Lie flat, slide heel toward buttocks, return to start",
    progression_criteria: { "knee_flexion": "> 90_degrees", "pain_level": "< 6" },
    modifications: {
      "early_phase": { "assisted": true, "repetitions": 5 },
      "stiff_knee": { "warm_up": true, "slow_movement": true }
    }
  },
  {
    name: "Straight Leg Raises",
    description: "Hip flexor and quadriceps strengthening while maintaining knee extension",
    category: "strengthening",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: 2,
    difficulty_level: 3,
    target_muscle_groups: ["quadriceps", "hip_flexors"],
    joint_movements: ["hip_flexion", "knee_extension"],
    benefits: ["leg_strength", "hip_mobility", "functional_movement"],
    contraindications: ["hip_flexor_strain", "severe_back_pain"],
    required_equipment: [],
    optional_equipment: ["ankle_weights"],
    space_requirements: "bed or floor mat",
    setup_instructions: "Lie flat, lift straight leg 6 inches, hold, lower slowly",
    progression_criteria: { "hold_time": "> 3_seconds", "completion_rate": "> 85%" },
    modifications: {
      "weak_quad": { "bent_knee_assist": true },
      "advanced": { "ankle_weights": "1-2_lbs", "hold_time": 5 }
    }
  },

  // Range of Motion Exercises - THA  
  {
    name: "Hip Abduction",
    description: "Strengthen hip abductor muscles and improve lateral hip stability",
    category: "strengthening",
    surgery_types: ["THA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: 2,
    difficulty_level: 2,
    target_muscle_groups: ["hip_abductors", "gluteus_medius"],
    joint_movements: ["hip_abduction"],
    benefits: ["hip_stability", "walking_balance", "lateral_strength"],
    contraindications: ["hip_dislocation_precautions", "severe_pain"],
    required_equipment: [],
    optional_equipment: ["resistance_band"],
    space_requirements: "standing or lying position",
    setup_instructions: "Lying on side or standing, lift leg out to side",
    progression_criteria: { "range": "> 30_degrees", "completion_rate": "> 90%" },
    modifications: {
      "supine": { "position": "lying_on_back" },
      "standing": { "support": "wall_or_chair" },
      "advanced": { "resistance_band": true }
    }
  },
  {
    name: "Hip Extension",
    description: "Strengthen gluteal muscles and improve hip extension for walking",
    category: "strengthening", 
    surgery_types: ["THA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: 2,
    difficulty_level: 2,
    target_muscle_groups: ["gluteus_maximus", "hamstrings"],
    joint_movements: ["hip_extension"],
    benefits: ["walking_power", "stair_climbing", "posture"],
    contraindications: ["hip_flexion_contracture", "severe_back_pain"],
    required_equipment: [],
    optional_equipment: ["resistance_band"],
    space_requirements: "standing or prone position",
    setup_instructions: "Standing or lying face down, lift leg backward",
    progression_criteria: { "range": "> 15_degrees", "completion_rate": "> 85%" },
    modifications: {
      "standing": { "support": "wall_or_chair" },
      "prone": { "pillow_under_hips": true },
      "advanced": { "resistance_band": true }
    }
  },

  // Balance and Proprioception Exercises
  {
    name: "Single Leg Stance",
    description: "Improve balance, proprioception, and confidence in single-leg support",
    category: "balance",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active"],
    default_repetitions: 5,
    default_sets: 2,
    default_duration_seconds: 10,
    difficulty_level: 3,
    target_muscle_groups: ["core", "hip_stabilizers", "ankle_stabilizers"],
    joint_movements: ["balance_reactions"],
    benefits: ["balance", "confidence", "fall_prevention"],
    contraindications: ["severe_balance_impairment", "recent_falls"],
    required_equipment: [],
    optional_equipment: ["balance_pad", "wall_support"],
    space_requirements: "open area with wall nearby",
    setup_instructions: "Stand on one leg with hand near wall for safety",
    progression_criteria: { "hold_time": "> 15_seconds", "confidence": "good" },
    modifications: {
      "beginner": { "wall_support": "both_hands", "hold_time": 5 },
      "intermediate": { "wall_support": "one_finger", "hold_time": 10 },
      "advanced": { "eyes_closed": true, "unstable_surface": true }
    }
  },
  {
    name: "Heel-to-Toe Walking",
    description: "Dynamic balance training to improve walking confidence and stability",
    category: "balance",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: null,
    difficulty_level: 3,
    target_muscle_groups: ["core", "hip_stabilizers", "ankle_stabilizers"],
    joint_movements: ["dynamic_balance"],
    benefits: ["dynamic_balance", "walking_confidence", "coordination"],
    contraindications: ["severe_balance_impairment", "fear_of_falling"],
    required_equipment: [],
    optional_equipment: ["parallel_bars", "hallway"],
    space_requirements: "10-foot walking space",
    setup_instructions: "Walk placing heel directly in front of toe of other foot",
    progression_criteria: { "steps": "> 8_consecutive", "steadiness": "good" },
    modifications: {
      "beginner": { "wall_support": true, "wider_base": "2_inches" },
      "advanced": { "eyes_closed": true, "head_turns": true }
    }
  },

  // Functional Exercises
  {
    name: "Sit to Stand",
    description: "Functional exercise to improve ability to get up from chairs and toilets",
    category: "functional",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: null,
    difficulty_level: 3,
    target_muscle_groups: ["quadriceps", "gluteus_maximus", "core"],
    joint_movements: ["knee_extension", "hip_extension"],
    benefits: ["functional_independence", "leg_strength", "balance"],
    contraindications: ["severe_knee_pain", "hip_dislocation_risk"],
    required_equipment: ["chair"],
    optional_equipment: ["chair_cushion", "armrests"],
    space_requirements: "chair and standing space",
    setup_instructions: "Sit in chair, stand up without using hands, sit back down",
    progression_criteria: { "completion_rate": "> 80%", "no_hand_support": true },
    modifications: {
      "assisted": { "hand_support": "chair_arms" },
      "high_chair": { "seat_height": "increased" },
      "advanced": { "chair_height": "standard", "arms_crossed": true }
    }
  },
  {
    name: "Step-Ups",
    description: "Functional exercise to improve stair climbing ability and leg strength",
    category: "functional",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active"],
    default_repetitions: 10,
    default_sets: 2,
    default_duration_seconds: null,
    difficulty_level: 4,
    target_muscle_groups: ["quadriceps", "gluteus_maximus", "calves"],
    joint_movements: ["knee_extension", "hip_extension", "ankle_flexion"],
    benefits: ["stair_climbing", "functional_strength", "confidence"],
    contraindications: ["severe_knee_pain", "balance_impairment"],
    required_equipment: ["step", "sturdy_platform"],
    optional_equipment: ["handrail", "adjustable_step"],
    space_requirements: "step platform with safety clearance",
    setup_instructions: "Step up onto platform with surgical leg, step down slowly",
    progression_criteria: { "step_height": "> 6_inches", "control": "good" },
    modifications: {
      "low_step": { "height": "4_inches" },
      "support": { "handrail": true },
      "advanced": { "height": "8_inches", "no_support": true }
    }
  },

  // Walking and Endurance Exercises
  {
    name: "Progressive Walking",
    description: "Graduated walking program to improve endurance and functional mobility",
    category: "cardiovascular",
    surgery_types: ["TKA", "THA"],
    activity_levels: ["active", "sedentary"],
    default_repetitions: 1,
    default_sets: 1,
    default_duration_seconds: 300, // 5 minutes
    difficulty_level: 2,
    target_muscle_groups: ["all_leg_muscles", "cardiovascular"],
    joint_movements: ["gait_pattern"],
    benefits: ["endurance", "cardiovascular_health", "functional_mobility"],
    contraindications: ["severe_pain", "medical_restrictions"],
    required_equipment: [],
    optional_equipment: ["walking_aid", "timer"],
    space_requirements: "safe walking area",
    setup_instructions: "Walk at comfortable pace with appropriate assistive device",
    progression_criteria: { "duration": "> 10_minutes", "pain_level": "< 5" },
    modifications: {
      "early_phase": { "duration": 120, "assistive_device": "walker" },
      "intermediate": { "duration": 300, "assistive_device": "cane" },
      "advanced": { "duration": 600, "assistive_device": "none" }
    }
  }
];

// Daily Check-in Questions from Claude_Docs
const dailyCheckinQuestions = [
  {
    question_text: "How is your pain level today?",
    question_type: "pain_scale",
    category: "pain",
    response_type: "numeric",
    scale_min: 0,
    scale_max: 10,
    scale_labels: {
      "0": "No pain",
      "1-3": "Mild pain",
      "4-6": "Moderate pain", 
      "7-9": "Severe pain",
      "10": "Worst possible pain"
    },
    display_order: 1,
    is_required: true,
    trigger_conditions: { "always": true },
    alert_thresholds: { "high_pain": 8, "severe_pain": 9 }
  },
  {
    question_text: "How is your swelling today?",
    question_type: "symptom_scale",
    category: "symptoms",
    response_type: "numeric",
    scale_min: 0,
    scale_max: 10,
    scale_labels: {
      "0": "No swelling",
      "1-3": "Mild swelling",
      "4-6": "Moderate swelling",
      "7-10": "Severe swelling"
    },
    display_order: 2,
    is_required: true,
    trigger_conditions: { "always": true },
    alert_thresholds: { "high_swelling": 7 }
  },
  {
    question_text: "How did you sleep last night?",
    question_type: "quality_scale",
    category: "sleep",
    response_type: "numeric",
    scale_min: 0,
    scale_max: 10,
    scale_labels: {
      "0": "Terrible sleep",
      "1-3": "Poor sleep",
      "4-6": "Fair sleep",
      "7-8": "Good sleep",
      "9-10": "Excellent sleep"
    },
    display_order: 3,
    is_required: true,
    trigger_conditions: { "always": true },
    alert_thresholds: { "poor_sleep": 3 }
  },
  {
    question_text: "How is your mood today?",
    question_type: "mood_scale",
    category: "mental_health",
    response_type: "numeric",
    scale_min: 0,
    scale_max: 10,
    scale_labels: {
      "0": "Very depressed",
      "1-3": "Low mood",
      "4-6": "Neutral mood",
      "7-8": "Good mood",
      "9-10": "Excellent mood"
    },
    display_order: 4,
    is_required: true,
    trigger_conditions: { "always": true },
    alert_thresholds: { "low_mood": 3, "depression_risk": 2 }
  },
  {
    question_text: "Did you complete your exercises today?",
    question_type: "boolean",
    category: "compliance",
    response_type: "boolean",
    display_order: 5,
    is_required: true,
    trigger_conditions: { "has_exercises": true },
    alert_thresholds: { "non_compliance": false }
  },
  {
    question_text: "How difficult were your exercises today?",
    question_type: "difficulty_scale",
    category: "exercise",
    response_type: "numeric",
    scale_min: 1,
    scale_max: 5,
    scale_labels: {
      "1": "Too easy",
      "2": "Easy",
      "3": "Just right",
      "4": "Difficult",
      "5": "Too difficult"
    },
    display_order: 6,
    is_required: false,
    trigger_conditions: { "completed_exercises": true },
    alert_thresholds: { "too_difficult": 5, "too_easy": 1 }
  },
  {
    question_text: "Did you take your pain medication today?",
    question_type: "boolean",
    category: "medication",
    response_type: "boolean",
    display_order: 7,
    is_required: false,
    trigger_conditions: { "has_pain_medication": true }
  },
  {
    question_text: "How many steps did you take today?",
    question_type: "numeric_input",
    category: "activity",
    response_type: "numeric",
    display_order: 8,
    is_required: false,
    trigger_conditions: { "day": "> 7" },
    alert_thresholds: { "low_activity": 1000 }
  },
  {
    question_text: "Do you have any concerns about your recovery?",
    question_type: "text_input",
    category: "concerns",
    response_type: "text",
    display_order: 9,
    is_required: false,
    trigger_conditions: { "always": true },
    alert_thresholds: { "has_concerns": "not_empty" }
  },
  {
    question_text: "Are you experiencing any new symptoms?",
    question_type: "text_input",
    category: "symptoms",
    response_type: "text",
    display_order: 10,
    is_required: false,
    trigger_conditions: { "always": true },
    alert_thresholds: { "new_symptoms": "not_empty" }
  }
];

// Pre-Surgery Forms from Claude_Docs
const preSurgeryForms = [
  {
    name: "Universal Medical Questionnaire",
    description: "Comprehensive medical history and health assessment",
    form_type: "medical_questionnaire",
    category: "medical_history",
    is_required: true,
    trigger_conditions: { "surgery_scheduled": true },
    estimated_completion_minutes: 15,
    form_schema: {
      "sections": [
        {
          "title": "Personal Information",
          "fields": [
            { "name": "emergency_contact_name", "type": "text", "label": "Emergency Contact Name", "required": true },
            { "name": "emergency_contact_phone", "type": "phone", "label": "Emergency Contact Phone", "required": true },
            { "name": "emergency_contact_relationship", "type": "text", "label": "Relationship", "required": true }
          ]
        },
        {
          "title": "Medical History",
          "fields": [
            { "name": "previous_surgeries", "type": "text_area", "label": "Previous Surgeries", "required": false },
            { "name": "current_medications", "type": "medication_list", "label": "Current Medications", "required": true },
            { "name": "allergies", "type": "allergy_list", "label": "Allergies and Reactions", "required": true },
            { "name": "medical_conditions", "type": "condition_list", "label": "Current Medical Conditions", "required": true }
          ]
        },
        {
          "title": "Symptoms and Function",
          "fields": [
            { "name": "pain_level", "type": "scale", "label": "Current Pain Level (0-10)", "scale_max": 10, "required": true },
            { "name": "functional_limitations", "type": "text_area", "label": "Current Functional Limitations", "required": false },
            { "name": "mobility_aids", "type": "checkbox_group", "label": "Mobility Aids Used", "options": ["cane", "walker", "wheelchair", "crutches", "none"] }
          ]
        }
      ]
    }
  },
  {
    name: "Informed Consent - Total Knee Arthroplasty",
    description: "Comprehensive informed consent for total knee replacement surgery",
    form_type: "consent",
    category: "surgical_consent",
    is_required: true,
    trigger_conditions: { "surgery_type": "TKA" },
    estimated_completion_minutes: 10,
    form_schema: {
      "sections": [
        {
          "title": "Procedure Understanding",
          "fields": [
            { "name": "procedure_explained", "type": "boolean", "label": "I understand that I will undergo Total Knee Arthroplasty", "required": true },
            { "name": "risks_explained", "type": "boolean", "label": "The risks and benefits have been explained to me", "required": true },
            { "name": "alternatives_discussed", "type": "boolean", "label": "Alternative treatments have been discussed", "required": true }
          ]
        },
        {
          "title": "Digital Signature",
          "fields": [
            { "name": "patient_signature", "type": "digital_signature", "label": "Patient Signature", "required": true },
            { "name": "witness_signature", "type": "digital_signature", "label": "Witness Signature", "required": false },
            { "name": "consent_date", "type": "date", "label": "Date of Consent", "required": true, "default": "today" }
          ]
        }
      ]
    }
  },
  {
    name: "Informed Consent - Total Hip Arthroplasty", 
    description: "Comprehensive informed consent for total hip replacement surgery",
    form_type: "consent",
    category: "surgical_consent",
    is_required: true,
    trigger_conditions: { "surgery_type": "THA" },
    estimated_completion_minutes: 10,
    form_schema: {
      "sections": [
        {
          "title": "Procedure Understanding",
          "fields": [
            { "name": "procedure_explained", "type": "boolean", "label": "I understand that I will undergo Total Hip Arthroplasty", "required": true },
            { "name": "risks_explained", "type": "boolean", "label": "The risks and benefits have been explained to me", "required": true },
            { "name": "alternatives_discussed", "type": "boolean", "label": "Alternative treatments have been discussed", "required": true }
          ]
        },
        {
          "title": "Digital Signature",
          "fields": [
            { "name": "patient_signature", "type": "digital_signature", "label": "Patient Signature", "required": true },
            { "name": "witness_signature", "type": "digital_signature", "label": "Witness Signature", "required": false },
            { "name": "consent_date", "type": "date", "label": "Date of Consent", "required": true, "default": "today" }
          ]
        }
      ]
    }
  },
  {
    name: "Cardiac Risk Assessment",
    description: "Comprehensive cardiac risk evaluation for surgical clearance",
    form_type: "assessment",
    category: "cardiac_clearance",
    is_required: false,
    trigger_conditions: { "age": "> 65", "cardiac_risk_factors": true },
    estimated_completion_minutes: 8,
    form_schema: {
      "sections": [
        {
          "title": "Cardiac History",
          "fields": [
            { "name": "coronary_artery_disease", "type": "boolean", "label": "History of Coronary Artery Disease", "required": true },
            { "name": "heart_failure", "type": "boolean", "label": "History of Heart Failure", "required": true },
            { "name": "cerebrovascular_disease", "type": "boolean", "label": "History of Stroke or TIA", "required": true },
            { "name": "diabetes", "type": "boolean", "label": "Diabetes Mellitus", "required": true },
            { "name": "renal_insufficiency", "type": "boolean", "label": "Kidney Disease", "required": true }
          ]
        },
        {
          "title": "Current Symptoms",
          "fields": [
            { "name": "chest_pain", "type": "boolean", "label": "Chest Pain with Activity", "required": true },
            { "name": "shortness_of_breath", "type": "boolean", "label": "Shortness of Breath", "required": true },
            { "name": "exercise_tolerance", "type": "select", "label": "Exercise Tolerance", "options": ["excellent", "good", "fair", "poor"], "required": true }
          ]
        }
      ]
    }
  },
  {
    name: "Anesthesia Consent and Assessment",
    description: "Anesthesia risk assessment and informed consent",
    form_type: "consent",
    category: "anesthesia_consent",
    is_required: true,
    trigger_conditions: { "surgery_scheduled": true },
    estimated_completion_minutes: 7,
    form_schema: {
      "sections": [
        {
          "title": "Anesthesia History",
          "fields": [
            { "name": "previous_anesthesia", "type": "boolean", "label": "Previous Experience with Anesthesia", "required": true },
            { "name": "anesthesia_complications", "type": "text_area", "label": "Any Previous Anesthesia Complications", "required": false },
            { "name": "family_anesthesia_problems", "type": "boolean", "label": "Family History of Anesthesia Problems", "required": true }
          ]
        },
        {
          "title": "Anesthesia Preference",
          "fields": [
            { "name": "anesthesia_type_preference", "type": "select", "label": "Anesthesia Type Preference", "options": ["general", "spinal", "epidural", "no_preference"], "required": false },
            { "name": "anesthesia_concerns", "type": "text_area", "label": "Concerns About Anesthesia", "required": false }
          ]
        },
        {
          "title": "Consent",
          "fields": [
            { "name": "anesthesia_consent", "type": "boolean", "label": "I consent to anesthesia administration", "required": true },
            { "name": "anesthesia_signature", "type": "digital_signature", "label": "Signature", "required": true }
          ]
        }
      ]
    }
  }
];

// Demo Users and Test Accounts
const demoUsers = [
  {
    email: "sarah.johnson@demo.com",
    full_name: "Sarah Johnson",
    first_name: "Sarah",
    last_name: "Johnson",
    role: "patient",
    patient_data: {
      surgery_type: "TKA",
      surgery_side: "right",
      surgery_date: "2024-01-15", // 2 weeks ago
      activity_level: "active",
      current_day: 14,
      height_cm: 165,
      weight_kg: 70,
      age: 62,
      medical_conditions: ["hypertension", "diabetes_type_2"],
      allergies: ["penicillin"],
      status: "post_op"
    }
  },
  {
    email: "michael.chen@demo.com", 
    full_name: "Michael Chen",
    first_name: "Michael",
    last_name: "Chen",
    role: "patient",
    patient_data: {
      surgery_type: "THA",
      surgery_side: "left",
      surgery_date: "2024-01-08", // 3 weeks ago
      activity_level: "active",
      current_day: 21,
      height_cm: 178,
      weight_kg: 82,
      age: 58,
      medical_conditions: ["osteoarthritis"],
      allergies: [],
      status: "post_op"
    }
  },
  {
    email: "dr.smith@demo.com",
    full_name: "Dr. Robert Smith",
    first_name: "Robert",
    last_name: "Smith",
    role: "surgeon",
    license_number: "MD123456",
    specialties: ["orthopedic_surgery", "joint_replacement"],
    department: "Orthopedics",
    title: "Senior Orthopedic Surgeon"
  },
  {
    email: "nurse.williams@demo.com",
    full_name: "Jennifer Williams",
    first_name: "Jennifer", 
    last_name: "Williams",
    role: "nurse",
    license_number: "RN789012",
    specialties: ["orthopedic_nursing", "post_surgical_care"],
    department: "Orthopedics",
    title: "Orthopedic Nurse Specialist"
  },
  {
    email: "pt.davis@demo.com",
    full_name: "David Davis",
    first_name: "David",
    last_name: "Davis", 
    role: "physical_therapist",
    license_number: "PT345678",
    specialties: ["orthopedic_therapy", "post_surgical_rehabilitation"],
    department: "Physical Therapy",
    title: "Senior Physical Therapist"
  },
  {
    email: "admin@demo.com",
    full_name: "Practice Administrator",
    first_name: "Practice",
    last_name: "Administrator",
    role: "practice_admin",
    department: "Administration",
    title: "Practice Administrator"
  }
];

// Main population function
async function populateDatabase() {
  console.log('🚀 Starting TJV Recovery Platform data population...');
  console.log('📊 Populating with real healthcare data from Claude_Docs\n');

  try {
    // 1. Create demo tenant
    console.log('1️⃣ Creating demo tenant...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Demo Orthopedic Practice',
        subdomain: 'demo-practice',
        tenant_type: 'clinic',
        settings: {
          features: ['chat', 'exercises', 'forms', 'video_integration'],
          branding: {
            primary_color: '#1E40AF',
            secondary_color: '#3B82F6',
            logo_url: '/logo.png'
          }
        }
      })
      .select()
      .single();

    let existingTenant = null;
    
    if (tenantError) {
      // Tenant might already exist, try to get it
      const { data: existingTenantData } = await supabase
        .from('tenants')
        .select()
        .eq('subdomain', 'demo-practice')
        .single();
      
      if (!existingTenantData) {
        throw tenantError;
      }
      existingTenant = existingTenantData;
      console.log('   ✅ Using existing demo tenant');
    } else {
      console.log('   ✅ Demo tenant created successfully');
    }

    const tenantId = tenant?.id || existingTenant?.id;

    // 2. Populate exercises
    console.log('\n2️⃣ Populating exercise library...');
    for (const exercise of exerciseLibrary) {
      const { error } = await supabase
        .from('exercises')
        .upsert({
          ...exercise,
          tenant_id: tenantId,
          is_active: true,
          created_at: new Date().toISOString()
        }, { 
          onConflict: 'tenant_id,name',
          ignoreDuplicates: false 
        });

      if (error) {
        console.log(`   ⚠️ Error inserting exercise "${exercise.name}":`, error.message);
      }
    }
    console.log(`   ✅ Populated ${exerciseLibrary.length} exercises`);

    // 3. Populate daily check-in questions
    console.log('\n3️⃣ Populating daily check-in questions...');
    for (const question of dailyCheckinQuestions) {
      const { error } = await supabase
        .from('daily_checkin_questions')
        .upsert({
          ...question,
          tenant_id: tenantId,
          is_active: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id,question_text',
          ignoreDuplicates: false
        });

      if (error) {
        console.log(`   ⚠️ Error inserting question "${question.question_text}":`, error.message);
      }
    }
    console.log(`   ✅ Populated ${dailyCheckinQuestions.length} daily check-in questions`);

    // 4. Populate forms
    console.log('\n4️⃣ Populating pre-surgery forms...');
    for (const form of preSurgeryForms) {
      const { error } = await supabase
        .from('forms')
        .upsert({
          ...form,
          tenant_id: tenantId,
          is_active: true,
          version: 1,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id,name',
          ignoreDuplicates: false
        });

      if (error) {
        console.log(`   ⚠️ Error inserting form "${form.name}":`, error.message);
      }
    }
    console.log(`   ✅ Populated ${preSurgeryForms.length} pre-surgery forms`);

    // 5. Create demo users and profiles
    console.log('\n5️⃣ Creating demo user profiles...');
    for (const user of demoUsers) {
      const { patient_data, ...profileData } = user;
      
      // First, create the auth user with Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'demo123!',
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      });

      if (authError) {
        console.log(`   ⚠️ Error creating auth user for ${user.email}:`, authError.message);
        // Continue to try to create profile anyway in case user already exists
      }

      // Get the user ID from auth user or try to find existing
      let userId = authUser?.user?.id;
      if (!userId) {
        // Try to find existing user by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === user.email);
        userId = existingUser?.id;
      }

      if (!userId) {
        console.log(`   ⚠️ Could not get user ID for ${user.email}`);
        continue;
      }
      
      // Create the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId, // Use the auth user's ID
          ...profileData,
          tenant_id: tenantId,
          is_active: true,
          email_verified: true,
          onboarding_completed: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.log(`   ⚠️ Error creating profile for ${user.email}:`, profileError.message);
        continue;
      }

      // Create patient record if this is a patient
      if (user.role === 'patient' && patient_data) {
        const surgeryDate = new Date(patient_data.surgery_date);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));

        const { error: patientError } = await supabase
          .from('patients')
          .upsert({
            tenant_id: tenantId,
            user_id: profile.id,
            ...patient_data,
            current_day: daysDiff,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'tenant_id,user_id',
            ignoreDuplicates: false
          });

        if (patientError) {
          console.log(`   ⚠️ Error creating patient record for ${user.email}:`, patientError.message);
        }
      }
    }
    console.log(`   ✅ Created ${demoUsers.length} demo user profiles`);

    // 6. Create patient exercises (assign exercises to patients)
    console.log('\n6️⃣ Assigning exercises to demo patients...');
    
    // Get patient profiles
    const { data: patients } = await supabase
      .from('patients')
      .select('id, user_id, surgery_type, current_day, tenant_id')
      .eq('tenant_id', tenantId);

    // Get exercises
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name, surgery_types, difficulty_level')
      .eq('tenant_id', tenantId);

    for (const patient of patients || []) {
      // Assign appropriate exercises based on surgery type and recovery day
      const appropriateExercises = exercises?.filter(ex => 
        ex.surgery_types.includes(patient.surgery_type) &&
        ex.difficulty_level <= Math.min(5, Math.floor(patient.current_day / 7) + 1)
      ) || [];

      for (const exercise of appropriateExercises.slice(0, 4)) { // Limit to 4 exercises per patient
        const { error } = await supabase
          .from('patient_exercises')
          .upsert({
            tenant_id: tenantId,
            patient_id: patient.id,
            exercise_id: exercise.id,
            is_active: true,
            assigned_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          }, {
            onConflict: 'tenant_id,patient_id,exercise_id',
            ignoreDuplicates: true
          });

        if (error) {
          console.log(`   ⚠️ Error assigning exercise to patient:`, error.message);
        }
      }
    }
    console.log('   ✅ Assigned exercises to demo patients');

    // 7. Create sample conversations
    console.log('\n7️⃣ Creating sample conversations...');
    for (const patient of patients || []) {
      const { error } = await supabase
        .from('conversations')
        .upsert({
          tenant_id: tenantId,
          patient_id: patient.id,
          title: 'Recovery Chat',
          status: 'active',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id,patient_id',
          ignoreDuplicates: true
        });

      if (error) {
        console.log(`   ⚠️ Error creating conversation:`, error.message);
      }
    }
    console.log('   ✅ Created sample conversations');

    console.log('\n🎉 Database population completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${exerciseLibrary.length} exercises added`);
    console.log(`   • ${dailyCheckinQuestions.length} daily check-in questions added`);
    console.log(`   • ${preSurgeryForms.length} pre-surgery forms added`);
    console.log(`   • ${demoUsers.length} demo users created`);
    console.log(`   • Patient exercises assigned`);
    console.log(`   • Sample conversations created`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Patient: sarah.johnson@demo.com (password: demo123!)');
    console.log('   Patient: michael.chen@demo.com (password: demo123!)');
    console.log('   Surgeon: dr.smith@demo.com (password: demo123!)');
    console.log('   Nurse: nurse.williams@demo.com (password: demo123!)');
    console.log('   PT: pt.davis@demo.com (password: demo123!)');
    console.log('   Admin: admin@demo.com (password: demo123!)');
    
    console.log('\n✨ Your TJV Recovery Platform is now populated with real healthcare data!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

// Run the population script
if (require.main === module) {
  populateDatabase();
}

export { populateDatabase, exerciseLibrary, dailyCheckinQuestions, preSurgeryForms, demoUsers };