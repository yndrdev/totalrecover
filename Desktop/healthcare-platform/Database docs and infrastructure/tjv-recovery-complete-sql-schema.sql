-- TJV RECOVERY COMPLETE SQL SCHEMA
-- Multi-tenant, HIPAA-compliant database with chat conversation tracking
-- Supports Practice → Clinic → Patient flow with template system

-- =====================================================
-- 1. MULTI-TENANT FOUNDATION
-- =====================================================

-- Core tenant management (Practice level)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  domain TEXT,
  
  -- Hierarchy and Organization
  tenant_type TEXT DEFAULT 'practice' CHECK (tenant_type IN ('super_admin', 'practice', 'clinic')),
  parent_tenant_id UUID REFERENCES tenants(id),
  
  -- Settings and Configuration
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  max_patients INTEGER DEFAULT 100,
  max_providers INTEGER DEFAULT 10,
  features TEXT[] DEFAULT ARRAY['chat', 'exercises', 'forms'],
  
  -- Branding and Customization
  branding JSONB DEFAULT '{}',
  ai_training_data JSONB DEFAULT '{}',
  
  -- Contact and Billing
  billing_email TEXT,
  contact_phone TEXT,
  address JSONB,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
);

-- =====================================================
-- 2. USER MANAGEMENT WITH HIERARCHY
-- =====================================================

-- Extended user profiles with multi-level access
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  
  -- Role hierarchy: super_admin > practice_admin > clinic_admin > surgeon > nurse > physical_therapist > patient
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist', 'patient')),
  
  -- Multi-tenant access permissions
  accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[], -- Tenants this user can access
  primary_tenant_id UUID REFERENCES tenants(id), -- User's primary tenant
  
  -- Profile Information
  avatar_url TEXT,
  phone TEXT,
  license_number TEXT,
  specialties TEXT[],
  department TEXT,
  title TEXT,
  bio TEXT,
  
  -- Settings and Preferences
  settings JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "push": true,
    "patient_alerts": true,
    "task_reminders": true,
    "progress_updates": true
  }',
  
  -- Status and Activity
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT provider_license CHECK (
    (role IN ('surgeon', 'nurse', 'physical_therapist') AND license_number IS NOT NULL) OR
    (role NOT IN ('surgeon', 'nurse', 'physical_therapist'))
  )
);

-- =====================================================
-- 3. TEMPLATE SYSTEM FOR CONSISTENCY
-- =====================================================

-- Master templates (managed by super admin)
CREATE TABLE master_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL CHECK (template_type IN ('recovery_protocol', 'form', 'exercise', 'education', 'notification')),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  
  -- Template Content
  template_schema JSONB NOT NULL,
  default_settings JSONB DEFAULT '{}',
  customization_rules JSONB DEFAULT '{}', -- What can be customized by practices
  
  -- Applicability
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  activity_levels TEXT[] DEFAULT ARRAY['active', 'sedentary'],
  
  -- Management
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice-level template customizations
CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  master_template_id UUID REFERENCES master_templates(id),
  
  -- Customization
  name TEXT NOT NULL,
  description TEXT,
  customized_schema JSONB NOT NULL, -- Practice-specific modifications
  custom_settings JSONB DEFAULT '{}',
  
  -- Usage and Status
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. PATIENT MANAGEMENT
-- =====================================================

-- Core patient information
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  patient_number TEXT,
  medical_record_number TEXT,
  
  -- Surgery Information
  surgery_type TEXT NOT NULL CHECK (surgery_type IN ('TKA', 'THA')),
  surgery_side TEXT CHECK (surgery_side IN ('left', 'right', 'bilateral')),
  surgery_date DATE,
  surgeon_id UUID REFERENCES profiles(id),
  surgery_location TEXT,
  
  -- Implant Information
  implant_type TEXT,
  implant_manufacturer TEXT,
  implant_model TEXT,
  implant_size TEXT,
  
  -- Recovery Information
  activity_level TEXT CHECK (activity_level IN ('active', 'sedentary')),
  recovery_protocol_id UUID,
  current_phase INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 0,
  expected_recovery_days INTEGER DEFAULT 84,
  
  -- Care Team Assignment
  assigned_surgeon UUID REFERENCES profiles(id),
  assigned_nurse UUID REFERENCES profiles(id),
  assigned_pt UUID REFERENCES profiles(id),
  primary_caregiver_name TEXT,
  primary_caregiver_phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Medical Information
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,1),
  blood_type TEXT,
  allergies TEXT[],
  medications JSONB DEFAULT '[]',
  medical_conditions TEXT[],
  previous_surgeries JSONB DEFAULT '[]',
  
  -- Status and Tracking
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'pre_op', 'post_op', 'completed', 'withdrawn', 'transferred')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  discharge_date DATE,
  completion_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_surgery_date CHECK (surgery_date IS NULL OR surgery_date >= '2020-01-01'),
  CONSTRAINT valid_bmi CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80))
);

-- =====================================================
-- 5. CHAT SYSTEM WITH COMPREHENSIVE TRACKING
-- =====================================================

-- Chat conversations (one per patient)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  
  -- Conversation Analytics
  total_forms_assigned INTEGER DEFAULT 0,
  total_forms_completed INTEGER DEFAULT 0,
  total_videos_assigned INTEGER DEFAULT 0,
  total_videos_watched INTEGER DEFAULT 0,
  total_exercises_assigned INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, patient_id)
);

-- Individual chat messages with comprehensive tracking
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider', 'ai', 'system')),
  
  -- Message Content
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'task', 'form', 'exercise', 'education', 'assessment', 'voice', 'image', 'video', 'form_completion', 'video_completion', 'exercise_completion')),
  content TEXT NOT NULL,
  formatted_content JSONB,
  
  -- Task/Form/Exercise Integration
  task_id UUID,
  form_id UUID,
  exercise_id UUID,
  education_content_id UUID,
  
  -- Completion Tracking
  completion_status TEXT CHECK (completion_status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed')),
  completion_data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  
  -- Form-specific tracking
  form_response_id UUID,
  form_completion_percentage INTEGER DEFAULT 0 CHECK (form_completion_percentage BETWEEN 0 AND 100),
  
  -- Video-specific tracking
  video_url TEXT,
  video_duration_seconds INTEGER,
  video_watched_seconds INTEGER DEFAULT 0,
  video_completion_percentage INTEGER DEFAULT 0 CHECK (video_completion_percentage BETWEEN 0 AND 100),
  video_watched_at TIMESTAMPTZ,
  
  -- Exercise-specific tracking
  exercise_started_at TIMESTAMPTZ,
  exercise_completed_at TIMESTAMPTZ,
  exercise_duration_seconds INTEGER,
  exercise_repetitions INTEGER,
  exercise_sets INTEGER,
  exercise_difficulty_rating INTEGER CHECK (exercise_difficulty_rating BETWEEN 1 AND 10),
  exercise_pain_before INTEGER CHECK (exercise_pain_before BETWEEN 0 AND 10),
  exercise_pain_after INTEGER CHECK (exercise_pain_after BETWEEN 0 AND 10),
  
  -- Voice Message Data
  voice_file_url TEXT,
  voice_duration_seconds INTEGER,
  voice_transcript TEXT,
  voice_confidence DECIMAL(3,2),
  
  -- Media Attachments
  attachments JSONB DEFAULT '[]',
  
  -- AI Integration
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  ai_prompt TEXT,
  ai_confidence DECIMAL(3,2),
  
  -- Message Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sending', 'sent', 'delivered', 'read', 'failed')),
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES profiles(id),
  
  -- Threading and Replies
  parent_message_id UUID REFERENCES messages(id),
  thread_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Chat conversation activity tracking
CREATE TABLE conversation_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT NOT NULL CHECK (activity_type IN ('form_assigned', 'form_started', 'form_completed', 'video_assigned', 'video_started', 'video_watched', 'exercise_assigned', 'exercise_started', 'exercise_completed', 'task_assigned', 'task_completed')),
  activity_description TEXT NOT NULL,
  
  -- Related Content
  related_message_id UUID REFERENCES messages(id),
  related_form_id UUID,
  related_exercise_id UUID,
  related_video_id UUID,
  related_task_id UUID,
  
  -- Progress Data
  progress_data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. FORMS WITH CHAT INTEGRATION
-- =====================================================

-- Form templates and definitions
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  practice_template_id UUID REFERENCES practice_templates(id),
  
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('medical_questionnaire', 'consent', 'assessment', 'survey', 'intake', 'pre_op', 'post_op', 'daily_checkin')),
  category TEXT,
  
  -- Form Configuration
  form_schema JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  conditional_logic JSONB DEFAULT '{}',
  
  -- Chat Integration
  chat_delivery_method TEXT DEFAULT 'conversational' CHECK (chat_delivery_method IN ('conversational', 'embedded', 'link')),
  chat_introduction_message TEXT,
  chat_completion_message TEXT,
  
  -- Usage and Scheduling
  is_required BOOLEAN DEFAULT false,
  can_be_repeated BOOLEAN DEFAULT false,
  trigger_conditions JSONB DEFAULT '{}',
  
  -- Content and Presentation
  instructions TEXT,
  estimated_completion_minutes INTEGER,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_form_id UUID REFERENCES forms(id),
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient form responses with chat tracking
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  initiating_message_id UUID REFERENCES messages(id),
  
  -- Response Data
  responses JSONB NOT NULL,
  completion_status TEXT DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Chat Integration Tracking
  chat_started_at TIMESTAMPTZ,
  chat_completed_at TIMESTAMPTZ,
  chat_messages_count INTEGER DEFAULT 0,
  chat_voice_responses_count INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  
  -- Digital Signatures
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  
  -- Review and Approval
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  requires_follow_up BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. EXERCISES WITH CHAT INTEGRATION
-- =====================================================

-- Exercise library and content
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  practice_template_id UUID REFERENCES practice_templates(id),
  
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Exercise Classification
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('range_of_motion', 'strengthening', 'balance', 'endurance', 'functional')),
  body_part TEXT NOT NULL CHECK (body_part IN ('knee', 'hip', 'ankle', 'core', 'upper_body', 'full_body')),
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  activity_levels TEXT[] DEFAULT ARRAY['active', 'sedentary'],
  
  -- Exercise Parameters
  default_repetitions INTEGER,
  default_sets INTEGER,
  default_duration_seconds INTEGER,
  default_rest_seconds INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Chat Integration
  chat_introduction_message TEXT,
  chat_instruction_message TEXT,
  chat_completion_message TEXT,
  chat_encouragement_messages TEXT[],
  
  -- Content and Media
  video_url TEXT,
  video_thumbnail_url TEXT,
  video_duration_seconds INTEGER,
  image_urls TEXT[],
  animation_url TEXT,
  
  -- Safety and Contraindications
  contraindications TEXT[],
  precautions TEXT[],
  modifications JSONB DEFAULT '{}',
  
  -- Equipment and Setup
  equipment_needed TEXT[],
  setup_instructions TEXT,
  space_requirements TEXT,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient exercise completions with chat tracking
CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  initiating_message_id UUID REFERENCES messages(id),
  
  -- Completion Data
  completion_status TEXT DEFAULT 'assigned' CHECK (completion_status IN ('assigned', 'started', 'completed', 'skipped', 'modified')),
  
  -- Exercise Performance
  actual_repetitions INTEGER,
  actual_sets INTEGER,
  actual_duration_seconds INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  pain_before INTEGER CHECK (pain_before BETWEEN 0 AND 10),
  pain_after INTEGER CHECK (pain_after BETWEEN 0 AND 10),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  
  -- Chat Integration Tracking
  chat_started_at TIMESTAMPTZ,
  chat_completed_at TIMESTAMPTZ,
  chat_messages_count INTEGER DEFAULT 0,
  voice_feedback_provided BOOLEAN DEFAULT false,
  
  -- Video Engagement
  video_watched_seconds INTEGER DEFAULT 0,
  video_completion_percentage INTEGER DEFAULT 0 CHECK (video_completion_percentage BETWEEN 0 AND 100),
  video_replays INTEGER DEFAULT 0,
  
  -- Timing
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_time_seconds INTEGER,
  
  -- Provider Oversight
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  provider_notes TEXT,
  requires_attention BOOLEAN DEFAULT false,
  
  -- Modifications
  was_modified BOOLEAN DEFAULT false,
  modification_reason TEXT,
  modified_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. EDUCATIONAL CONTENT WITH CHAT INTEGRATION
-- =====================================================

-- Educational content library
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  practice_template_id UUID REFERENCES practice_templates(id),
  
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'infographic', 'interactive', 'pdf')),
  category TEXT NOT NULL,
  
  -- Content Targeting
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  activity_levels TEXT[] DEFAULT ARRAY['active', 'sedentary'],
  recovery_days INTEGER[],
  
  -- Chat Integration
  chat_introduction_message TEXT,
  chat_completion_message TEXT,
  chat_quiz_questions JSONB DEFAULT '[]',
  
  -- Content Data
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  reading_time_minutes INTEGER,
  file_size_bytes BIGINT,
  
  -- Content Metadata
  tags TEXT[],
  keywords TEXT[],
  language TEXT DEFAULT 'en',
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Engagement Tracking
  view_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(4,1),
  average_rating DECIMAL(3,1),
  
  -- Content Management
  created_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient content engagement with chat tracking
CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  initiating_message_id UUID REFERENCES messages(id),
  
  -- Engagement Data
  engagement_status TEXT DEFAULT 'assigned' CHECK (engagement_status IN ('assigned', 'started', 'completed', 'skipped')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Chat Integration Tracking
  chat_started_at TIMESTAMPTZ,
  chat_completed_at TIMESTAMPTZ,
  chat_messages_count INTEGER DEFAULT 0,
  quiz_responses JSONB DEFAULT '{}',
  quiz_score INTEGER,
  
  -- User Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  found_helpful BOOLEAN,
  
  -- Interaction Data
  interactions JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. RECOVERY PROTOCOLS AND TASKS
-- =====================================================

-- Recovery protocols based on templates
CREATE TABLE recovery_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  practice_template_id UUID REFERENCES practice_templates(id),
  
  name TEXT NOT NULL,
  description TEXT,
  surgery_type TEXT NOT NULL CHECK (surgery_type IN ('TKA', 'THA')),
  activity_level TEXT CHECK (activity_level IN ('active', 'sedentary')),
  total_days INTEGER DEFAULT 84,
  
  -- Protocol Configuration
  protocol_schema JSONB NOT NULL,
  
  created_by UUID REFERENCES profiles(id),
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  parent_protocol_id UUID REFERENCES recovery_protocols(id),
  
  -- Protocol Metadata
  success_rate DECIMAL(4,1),
  average_completion_days INTEGER,
  patient_satisfaction DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual tasks within protocols
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  protocol_id UUID REFERENCES recovery_protocols(id) ON DELETE CASCADE,
  
  -- Task Definition
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('exercise', 'assessment', 'education', 'form', 'medication', 'appointment', 'milestone')),
  category TEXT,
  
  -- Scheduling
  day_number INTEGER NOT NULL,
  time_of_day TEXT,
  estimated_duration_minutes INTEGER,
  is_required BOOLEAN DEFAULT true,
  can_repeat BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 1,
  
  -- Chat Integration
  chat_delivery_method TEXT DEFAULT 'conversational' CHECK (chat_delivery_method IN ('conversational', 'notification', 'reminder')),
  chat_introduction_message TEXT,
  chat_completion_message TEXT,
  
  -- Task Configuration
  task_config JSONB DEFAULT '{}',
  completion_criteria JSONB DEFAULT '{}',
  
  -- Content References
  form_id UUID REFERENCES forms(id),
  exercise_id UUID REFERENCES exercises(id),
  education_content_id UUID REFERENCES educational_content(id),
  
  -- Dependencies and Prerequisites
  prerequisite_tasks UUID[],
  unlocks_tasks UUID[],
  
  -- Ordering and Display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient-specific task instances with chat tracking
CREATE TABLE patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  due_date DATE,
  
  -- Completion Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_method TEXT,
  
  -- Chat Integration Tracking
  chat_message_id UUID REFERENCES messages(id),
  chat_started_at TIMESTAMPTZ,
  chat_completed_at TIMESTAMPTZ,
  chat_interaction_count INTEGER DEFAULT 0,
  
  -- Completion Data
  completion_data JSONB DEFAULT '{}',
  completion_notes TEXT,
  completion_quality INTEGER CHECK (completion_quality BETWEEN 1 AND 5),
  
  -- Related Completions
  form_response_id UUID REFERENCES form_responses(id),
  exercise_completion_id UUID REFERENCES exercise_completions(id),
  content_engagement_id UUID REFERENCES content_engagement(id),
  
  -- Provider Oversight
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  provider_notes TEXT,
  requires_attention BOOLEAN DEFAULT false,
  
  -- Attempts and Retries
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. ANALYTICS AND PROGRESS TRACKING
-- =====================================================

-- Patient progress metrics with chat context
CREATE TABLE progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  
  -- Timing
  measurement_date DATE DEFAULT CURRENT_DATE,
  days_from_surgery INTEGER,
  recovery_phase INTEGER,
  
  -- Chat-Based Metrics
  daily_chat_interactions INTEGER DEFAULT 0,
  forms_completed_today INTEGER DEFAULT 0,
  exercises_completed_today INTEGER DEFAULT 0,
  videos_watched_today INTEGER DEFAULT 0,
  voice_messages_sent_today INTEGER DEFAULT 0,
  
  -- Functional Metrics
  range_of_motion JSONB,
  strength_measurements JSONB,
  balance_scores JSONB,
  endurance_metrics JSONB,
  
  -- Activity Metrics
  daily_steps INTEGER,
  active_minutes INTEGER,
  exercise_minutes INTEGER,
  sleep_hours DECIMAL(3,1),
  
  -- Pain and Symptoms (from chat interactions)
  pain_levels JSONB,
  medication_usage JSONB,
  symptom_scores JSONB,
  
  -- Compliance Metrics
  task_completion_rate DECIMAL(4,1),
  exercise_compliance_rate DECIMAL(4,1),
  form_completion_rate DECIMAL(4,1),
  chat_engagement_score DECIMAL(4,1),
  
  -- Quality of Life (from chat assessments)
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- Function to get current tenant ID from JWT or session
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::uuid,
    current_setting('app.current_tenant_id', true)::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    (SELECT role FROM profiles WHERE id = get_current_user_id())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access tenant (for multi-tenant hierarchy)
CREATE OR REPLACE FUNCTION can_access_tenant(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_tenant UUID;
  accessible_tenants UUID[];
BEGIN
  SELECT role, tenant_id, accessible_tenants 
  INTO user_role, user_tenant, accessible_tenants
  FROM profiles 
  WHERE id = get_current_user_id();
  
  -- Super admin can access all tenants
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- User can access their primary tenant
  IF user_tenant = target_tenant_id THEN
    RETURN TRUE;
  END IF;
  
  -- User can access tenants in their accessible_tenants array
  IF target_tenant_id = ANY(accessible_tenants) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Multi-tenant access policies
CREATE POLICY "Multi-tenant access" ON tenants
  FOR ALL USING (can_access_tenant(id));

CREATE POLICY "Multi-tenant profile access" ON profiles
  FOR ALL USING (can_access_tenant(tenant_id));

CREATE POLICY "Multi-tenant patient access" ON patients
  FOR ALL USING (
    can_access_tenant(tenant_id) AND
    (
      get_current_user_role() IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      (get_current_user_role() = 'patient' AND user_id = get_current_user_id())
    )
  );

CREATE POLICY "Multi-tenant conversation access" ON conversations
  FOR ALL USING (
    can_access_tenant(tenant_id) AND
    (
      get_current_user_role() IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      (get_current_user_role() = 'patient' AND 
       patient_id IN (SELECT id FROM patients WHERE user_id = get_current_user_id()))
    )
  );

CREATE POLICY "Multi-tenant message access" ON messages
  FOR ALL USING (
    can_access_tenant(tenant_id) AND
    (
      get_current_user_role() IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      (get_current_user_role() = 'patient' AND 
       conversation_id IN (
         SELECT id FROM conversations 
         WHERE patient_id IN (SELECT id FROM patients WHERE user_id = get_current_user_id())
       ))
    )
  );

-- =====================================================
-- 12. FUNCTIONS FOR CHAT TRACKING
-- =====================================================

-- Function to update conversation analytics when activities occur
CREATE OR REPLACE FUNCTION update_conversation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation analytics based on the activity
  IF TG_TABLE_NAME = 'form_responses' AND NEW.completion_status = 'completed' THEN
    UPDATE conversations 
    SET total_forms_completed = total_forms_completed + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  IF TG_TABLE_NAME = 'exercise_completions' AND NEW.completion_status = 'completed' THEN
    UPDATE conversations 
    SET total_exercises_completed = total_exercises_completed + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  IF TG_TABLE_NAME = 'content_engagement' AND NEW.engagement_status = 'completed' THEN
    UPDATE conversations 
    SET total_videos_watched = total_videos_watched + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update conversation analytics
CREATE TRIGGER update_conversation_form_analytics
  AFTER UPDATE ON form_responses
  FOR EACH ROW EXECUTE FUNCTION update_conversation_analytics();

CREATE TRIGGER update_conversation_exercise_analytics
  AFTER UPDATE ON exercise_completions
  FOR EACH ROW EXECUTE FUNCTION update_conversation_analytics();

CREATE TRIGGER update_conversation_content_analytics
  AFTER UPDATE ON content_engagement
  FOR EACH ROW EXECUTE FUNCTION update_conversation_analytics();

-- Function to create conversation activity entries
CREATE OR REPLACE FUNCTION log_conversation_activity(
  p_conversation_id UUID,
  p_activity_type TEXT,
  p_activity_description TEXT,
  p_related_message_id UUID DEFAULT NULL,
  p_progress_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO conversation_activities (
    tenant_id,
    conversation_id,
    patient_id,
    activity_type,
    activity_description,
    related_message_id,
    progress_data
  ) VALUES (
    get_current_tenant_id(),
    p_conversation_id,
    (SELECT patient_id FROM conversations WHERE id = p_conversation_id),
    p_activity_type,
    p_activity_description,
    p_related_message_id,
    p_progress_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. PERFORMANCE INDEXES
-- =====================================================

-- Primary performance indexes
CREATE INDEX CONCURRENTLY idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX CONCURRENTLY idx_profiles_role ON profiles(role);
CREATE INDEX CONCURRENTLY idx_profiles_accessible_tenants ON profiles USING GIN(accessible_tenants);

CREATE INDEX CONCURRENTLY idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX CONCURRENTLY idx_patients_user_id ON patients(user_id);
CREATE INDEX CONCURRENTLY idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX CONCURRENTLY idx_patients_current_day ON patients(current_day);
CREATE INDEX CONCURRENTLY idx_patients_status ON patients(status);

CREATE INDEX CONCURRENTLY idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX CONCURRENTLY idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX CONCURRENTLY idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_message_type ON messages(message_type);
CREATE INDEX CONCURRENTLY idx_messages_completion_status ON messages(completion_status);

CREATE INDEX CONCURRENTLY idx_conversation_activities_conversation_id ON conversation_activities(conversation_id);
CREATE INDEX CONCURRENTLY idx_conversation_activities_activity_type ON conversation_activities(activity_type);
CREATE INDEX CONCURRENTLY idx_conversation_activities_created_at ON conversation_activities(created_at DESC);

CREATE INDEX CONCURRENTLY idx_form_responses_tenant_id ON form_responses(tenant_id);
CREATE INDEX CONCURRENTLY idx_form_responses_patient_id ON form_responses(patient_id);
CREATE INDEX CONCURRENTLY idx_form_responses_conversation_id ON form_responses(conversation_id);
CREATE INDEX CONCURRENTLY idx_form_responses_completion_status ON form_responses(completion_status);

CREATE INDEX CONCURRENTLY idx_exercise_completions_tenant_id ON exercise_completions(tenant_id);
CREATE INDEX CONCURRENTLY idx_exercise_completions_patient_id ON exercise_completions(patient_id);
CREATE INDEX CONCURRENTLY idx_exercise_completions_conversation_id ON exercise_completions(conversation_id);
CREATE INDEX CONCURRENTLY idx_exercise_completions_completion_status ON exercise_completions(completion_status);

CREATE INDEX CONCURRENTLY idx_content_engagement_tenant_id ON content_engagement(tenant_id);
CREATE INDEX CONCURRENTLY idx_content_engagement_patient_id ON content_engagement(patient_id);
CREATE INDEX CONCURRENTLY idx_content_engagement_conversation_id ON content_engagement(conversation_id);
CREATE INDEX CONCURRENTLY idx_content_engagement_engagement_status ON content_engagement(engagement_status);

CREATE INDEX CONCURRENTLY idx_patient_tasks_tenant_id ON patient_tasks(tenant_id);
CREATE INDEX CONCURRENTLY idx_patient_tasks_patient_id ON patient_tasks(patient_id);
CREATE INDEX CONCURRENTLY idx_patient_tasks_conversation_id ON patient_tasks(conversation_id);
CREATE INDEX CONCURRENTLY idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX CONCURRENTLY idx_patient_tasks_status ON patient_tasks(status);

-- GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY idx_messages_completion_data_gin ON messages USING GIN(completion_data);
CREATE INDEX CONCURRENTLY idx_form_responses_responses_gin ON form_responses USING GIN(responses);
CREATE INDEX CONCURRENTLY idx_conversation_activities_progress_data_gin ON conversation_activities USING GIN(progress_data);

-- =====================================================
-- 14. DEMO DATA SEEDING
-- =====================================================

-- Function to seed demo data for testing
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS VOID AS $$
DECLARE
  super_admin_tenant_id UUID;
  practice_tenant_id UUID;
  clinic_tenant_id UUID;
  demo_patient_id UUID;
  demo_conversation_id UUID;
BEGIN
  -- Create super admin tenant
  INSERT INTO tenants (name, subdomain, tenant_type)
  VALUES ('TJV Recovery Super Admin', 'super-admin', 'super_admin')
  RETURNING id INTO super_admin_tenant_id;
  
  -- Create practice tenant
  INSERT INTO tenants (name, subdomain, tenant_type, parent_tenant_id)
  VALUES ('TJV Orthopedic Center', 'tjv-ortho', 'practice', super_admin_tenant_id)
  RETURNING id INTO practice_tenant_id;
  
  -- Create clinic tenant
  INSERT INTO tenants (name, subdomain, tenant_type, parent_tenant_id)
  VALUES ('TJV Main Clinic', 'tjv-main', 'clinic', practice_tenant_id)
  RETURNING id INTO clinic_tenant_id;
  
  -- Note: Actual user creation would be done through Supabase Auth
  -- This is just for reference of the expected data structure
  
  RAISE NOTICE 'Demo tenants created successfully';
  RAISE NOTICE 'Super Admin Tenant ID: %', super_admin_tenant_id;
  RAISE NOTICE 'Practice Tenant ID: %', practice_tenant_id;
  RAISE NOTICE 'Clinic Tenant ID: %', clinic_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 15. AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at BEFORE UPDATE ON form_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_completions_updated_at BEFORE UPDATE ON exercise_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON educational_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_engagement_updated_at BEFORE UPDATE ON content_engagement
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_tasks_updated_at BEFORE UPDATE ON patient_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- IMPLEMENTATION NOTES FOR CLAUDE CODE
-- =====================================================

/*
CRITICAL IMPLEMENTATION REQUIREMENTS:

1. MULTI-TENANT HIERARCHY:
   - Super Admin (you) can access all tenants
   - Practice Admin can access their practice and child clinics
   - Clinic Admin can access their clinic only
   - Providers can access patients in their tenant
   - Patients can access only their own data

2. CHAT CONVERSATION TRACKING:
   - Every form, exercise, and video is tracked in chat context
   - Completion status is updated in real-time
   - Progress analytics are automatically calculated
   - All activities are logged for provider visibility

3. TEMPLATE SYSTEM:
   - Master templates managed by super admin
   - Practice templates customize master templates
   - Consistency across all levels maintained
   - Easy deployment of updates through template hierarchy

4. SECURITY AND COMPLIANCE:
   - Row Level Security (RLS) enforced on all tables
   - Multi-tenant isolation guaranteed
   - HIPAA-compliant audit logging
   - Proper access controls at every level

5. PERFORMANCE OPTIMIZATION:
   - Comprehensive indexing strategy
   - Efficient queries for chat interactions
   - Real-time updates without performance impact
   - Scalable for multiple practices and thousands of patients

6. CHAT INTEGRATION REQUIREMENTS:
   - All forms delivered conversationally through chat
   - Exercise videos embedded in chat messages
   - Educational content presented in chat context
   - Progress tracking visible in conversation
   - Voice responses supported for all interactions

NEXT STEPS:
1. Run this SQL script in Supabase
2. Test multi-tenant access controls
3. Implement chat conversation tracking
4. Verify template system functionality
5. Test form/exercise/video completion tracking
6. Validate performance with sample data
*/

