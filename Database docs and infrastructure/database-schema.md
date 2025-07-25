# Database Schema - TJV Smart Recovery App

## Overview

The TJV Smart Recovery App uses a comprehensive PostgreSQL database schema designed for multi-tenant SaaS architecture with strict HIPAA compliance requirements. The schema supports the complete patient recovery journey from pre-surgery preparation through long-term maintenance, with robust role-based access controls and audit logging.

## Multi-Tenant Architecture

The database implements tenant isolation through a combination of tenant-specific schemas and Row Level Security (RLS) policies. Each tenant (practice/hospital) has isolated data while sharing the core application infrastructure.

### Tenant Isolation Strategy
- **Logical Separation**: All tables include `tenant_id` for data isolation
- **Row Level Security**: Automatic filtering based on tenant context
- **Audit Logging**: Complete audit trail for all data access and modifications
- **Data Encryption**: Sensitive medical data encrypted at rest and in transit

## Core Schema Structure

### 1. Tenant Management

```sql
-- Core tenant management table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  domain TEXT, -- Custom domain if configured
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  max_patients INTEGER DEFAULT 100,
  max_providers INTEGER DEFAULT 10,
  features TEXT[] DEFAULT ARRAY['chat', 'exercises', 'forms'],
  billing_email TEXT,
  contact_phone TEXT,
  address JSONB,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  branding JSONB DEFAULT '{}', -- Logo, colors, custom styling
  ai_training_data JSONB DEFAULT '{}', -- Tenant-specific AI customizations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT valid_timezone CHECK (timezone IS NOT NULL)
);

-- Tenant subscription and billing
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_per_month DECIMAL(10,2),
  max_patients INTEGER,
  max_providers INTEGER,
  features TEXT[],
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id TEXT, -- Stripe payment method ID
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant usage tracking
CREATE TABLE tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- First day of the month
  active_patients INTEGER DEFAULT 0,
  active_providers INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  ai_interactions INTEGER DEFAULT 0,
  voice_minutes INTEGER DEFAULT 0,
  storage_gb DECIMAL(10,2) DEFAULT 0,
  video_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, month_year)
);
```

### 2. User Management and Authentication

```sql
-- Extended user profiles with tenant association
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist', 'patient')),
  avatar_url TEXT,
  phone TEXT,
  license_number TEXT, -- For healthcare providers
  specialties TEXT[], -- For healthcare providers
  department TEXT,
  title TEXT,
  bio TEXT,
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
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT provider_license CHECK (
    (role IN ('surgeon', 'nurse', 'physical_therapist') AND license_number IS NOT NULL) OR
    (role NOT IN ('surgeon', 'nurse', 'physical_therapist'))
  )
);

-- User sessions and device tracking
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  location JSONB, -- City, country, etc.
  is_mobile BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  logout_reason TEXT -- 'manual', 'timeout', 'security'
);

-- Role-based permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  resource TEXT NOT NULL, -- 'patients', 'tasks', 'analytics', etc.
  actions TEXT[] NOT NULL, -- ['read', 'write', 'delete', 'assign']
  conditions JSONB DEFAULT '{}', -- Additional conditions for permission
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, role, resource)
);
```

### 3. Patient Management

```sql
-- Core patient information
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  patient_number TEXT, -- Practice-specific patient ID
  medical_record_number TEXT,
  
  -- Surgery Information
  surgery_type TEXT NOT NULL CHECK (surgery_type IN ('TKA', 'THA')),
  surgery_side TEXT CHECK (surgery_side IN ('left', 'right', 'bilateral')),
  surgery_date DATE,
  surgeon_id UUID REFERENCES profiles(id),
  surgery_location TEXT,
  implant_type TEXT,
  implant_manufacturer TEXT,
  implant_model TEXT,
  implant_size TEXT,
  
  -- Recovery Information
  activity_level TEXT CHECK (activity_level IN ('active', 'sedentary')),
  recovery_protocol_id UUID, -- References recovery_protocols table
  current_phase INTEGER DEFAULT 0,
  current_day INTEGER DEFAULT 0, -- Days since surgery (can be negative for pre-op)
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
  
  -- Smart Device Integration
  smart_device_id TEXT, -- Persona IQ device ID
  smart_device_paired_at TIMESTAMPTZ,
  smart_device_last_sync TIMESTAMPTZ,
  
  -- Status and Tracking
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'pre_op', 'post_op', 'completed', 'withdrawn', 'transferred')),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  discharge_date DATE,
  completion_date DATE,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_surgery_date CHECK (surgery_date IS NULL OR surgery_date >= '2020-01-01'),
  CONSTRAINT valid_bmi CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
  CONSTRAINT valid_height CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  CONSTRAINT valid_weight CHECK (weight_kg IS NULL OR (weight_kg >= 30 AND weight_kg <= 300))
);

-- Patient baseline assessments
CREATE TABLE patient_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'baseline', 'weekly', 'milestone', 'discharge'
  assessment_date DATE DEFAULT CURRENT_DATE,
  days_from_surgery INTEGER,
  
  -- Functional Scores
  hoos_jr_score DECIMAL(4,1), -- Hip disability and Osteoarthritis Outcome Score
  koos_jr_score DECIMAL(4,1), -- Knee injury and Osteoarthritis Outcome Score
  forgotten_joint_score DECIMAL(4,1),
  vr12_physical_score DECIMAL(4,1), -- Veterans RAND 12 Physical Component
  vr12_mental_score DECIMAL(4,1), -- Veterans RAND 12 Mental Component
  
  -- Range of Motion
  knee_flexion_degrees INTEGER,
  knee_extension_degrees INTEGER,
  hip_flexion_degrees INTEGER,
  hip_extension_degrees INTEGER,
  hip_abduction_degrees INTEGER,
  hip_internal_rotation_degrees INTEGER,
  hip_external_rotation_degrees INTEGER,
  
  -- Functional Tests
  timed_up_go_seconds DECIMAL(4,1),
  six_minute_walk_distance_meters INTEGER,
  stair_climb_test_seconds DECIMAL(4,1),
  single_leg_stance_seconds DECIMAL(4,1),
  
  -- Pain and Symptoms
  pain_at_rest INTEGER CHECK (pain_at_rest BETWEEN 0 AND 10),
  pain_with_activity INTEGER CHECK (pain_with_activity BETWEEN 0 AND 10),
  stiffness_level INTEGER CHECK (stiffness_level BETWEEN 0 AND 10),
  swelling_level INTEGER CHECK (swelling_level BETWEEN 0 AND 10),
  
  -- Quality of Life
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 0 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 10),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 0 AND 10),
  
  -- Additional Data
  notes TEXT,
  assessor_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient goals and milestones
CREATE TABLE patient_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'range_of_motion', 'functional', 'pain', 'activity'
  goal_category TEXT, -- 'short_term', 'medium_term', 'long_term'
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(10,2),
  target_unit TEXT,
  current_value DECIMAL(10,2),
  target_date DATE,
  achieved_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'modified', 'discontinued')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  set_by_id UUID REFERENCES profiles(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```



### 4. Chat System and Communication

```sql
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
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, patient_id)
);

-- Individual chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider', 'ai', 'system')),
  
  -- Message Content
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'task', 'form', 'exercise', 'education', 'assessment', 'voice', 'image', 'video')),
  content TEXT NOT NULL,
  formatted_content JSONB, -- Rich formatting, buttons, cards
  
  -- Task/Form Integration
  task_id UUID, -- References tasks table
  form_response_id UUID, -- References form_responses table
  
  -- Voice Message Data
  voice_file_url TEXT,
  voice_duration_seconds INTEGER,
  voice_transcript TEXT,
  voice_confidence DECIMAL(3,2), -- Whisper confidence score
  
  -- Media Attachments
  attachments JSONB DEFAULT '[]', -- Array of file URLs and metadata
  
  -- AI Integration
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT, -- 'gpt-4', 'claude-3', etc.
  ai_prompt TEXT, -- Original prompt for AI generation
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
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT voice_message_validation CHECK (
    (message_type = 'voice' AND voice_file_url IS NOT NULL) OR
    (message_type != 'voice')
  )
);

-- Message reactions and interactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- 'like', 'helpful', 'unclear', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(message_id, user_id, reaction_type)
);

-- AI training data and responses
CREATE TABLE ai_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'patient_response', 'provider_guidance', 'exercise_instruction'
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  context JSONB DEFAULT '{}', -- Patient info, surgery type, recovery day, etc.
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI response analytics
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  ai_model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  processing_time_ms INTEGER,
  token_count INTEGER,
  cost_usd DECIMAL(8,4),
  confidence_score DECIMAL(3,2),
  user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Task and Recovery Management

```sql
-- Recovery protocols and templates
CREATE TABLE recovery_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  surgery_type TEXT NOT NULL CHECK (surgery_type IN ('TKA', 'THA')),
  activity_level TEXT CHECK (activity_level IN ('active', 'sedentary')),
  total_days INTEGER DEFAULT 84,
  created_by UUID REFERENCES profiles(id),
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  parent_protocol_id UUID REFERENCES recovery_protocols(id),
  
  -- Protocol Metadata
  success_rate DECIMAL(4,1), -- Percentage of successful completions
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
  category TEXT, -- 'mobility', 'strength', 'pain_management', 'education'
  
  -- Scheduling
  day_number INTEGER NOT NULL, -- Day in recovery protocol (can be negative for pre-op)
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'any'
  estimated_duration_minutes INTEGER,
  is_required BOOLEAN DEFAULT true,
  can_repeat BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 1,
  
  -- Task Configuration
  task_config JSONB DEFAULT '{}', -- Task-specific configuration
  completion_criteria JSONB DEFAULT '{}', -- What constitutes completion
  
  -- Content and Media
  video_url TEXT,
  video_duration_seconds INTEGER,
  image_urls TEXT[],
  document_urls TEXT[],
  
  -- Exercise-Specific Fields
  exercise_type TEXT, -- 'range_of_motion', 'strengthening', 'balance', 'endurance'
  target_repetitions INTEGER,
  target_sets INTEGER,
  target_duration_seconds INTEGER,
  target_distance_meters INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Form-Specific Fields
  form_schema JSONB, -- JSON schema for form fields
  
  -- Dependencies and Prerequisites
  prerequisite_tasks UUID[], -- Array of task IDs that must be completed first
  unlocks_tasks UUID[], -- Array of task IDs that this task unlocks
  
  -- Ordering and Display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient-specific task instances
CREATE TABLE patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  due_date DATE,
  
  -- Completion Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_method TEXT, -- 'manual', 'voice', 'automatic'
  
  -- Completion Data
  completion_data JSONB DEFAULT '{}', -- Task-specific completion data
  completion_notes TEXT,
  completion_quality INTEGER CHECK (completion_quality BETWEEN 1 AND 5),
  
  -- Exercise Completion Data
  actual_repetitions INTEGER,
  actual_sets INTEGER,
  actual_duration_seconds INTEGER,
  actual_distance_meters INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  pain_before INTEGER CHECK (pain_before BETWEEN 0 AND 10),
  pain_after INTEGER CHECK (pain_after BETWEEN 0 AND 10),
  
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

-- Task modifications and customizations
CREATE TABLE task_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_task_id UUID REFERENCES patient_tasks(id) ON DELETE CASCADE,
  modified_by UUID REFERENCES profiles(id) NOT NULL,
  
  modification_type TEXT NOT NULL CHECK (modification_type IN ('difficulty', 'repetitions', 'duration', 'skip', 'substitute')),
  original_value JSONB,
  modified_value JSONB,
  reason TEXT NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Forms and Assessments

```sql
-- Form templates and definitions
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('medical_questionnaire', 'consent', 'assessment', 'survey', 'intake')),
  category TEXT,
  
  -- Form Configuration
  form_schema JSONB NOT NULL, -- JSON schema defining form structure
  validation_rules JSONB DEFAULT '{}',
  conditional_logic JSONB DEFAULT '{}', -- Show/hide fields based on responses
  
  -- Usage and Scheduling
  is_required BOOLEAN DEFAULT false,
  can_be_repeated BOOLEAN DEFAULT false,
  trigger_conditions JSONB DEFAULT '{}', -- When to present this form
  
  -- Content and Presentation
  instructions TEXT,
  estimated_completion_minutes INTEGER,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_form_id UUID REFERENCES forms(id),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient form responses
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Response Data
  responses JSONB NOT NULL, -- All form field responses
  completion_status TEXT DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  
  -- Digital Signatures
  signature_data JSONB, -- Digital signature information
  signed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  
  -- Review and Approval
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  requires_follow_up BOOLEAN DEFAULT false,
  
  -- Triggered Actions
  triggered_tasks UUID[], -- Tasks triggered by this form completion
  triggered_alerts UUID[], -- Alerts triggered by responses
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form field responses (for detailed analysis)
CREATE TABLE form_field_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'number', 'boolean', 'select', 'multiselect'
  field_label TEXT,
  response_value TEXT,
  response_numeric DECIMAL(10,4),
  response_boolean BOOLEAN,
  response_array TEXT[],
  
  -- Voice Response Data
  voice_file_url TEXT,
  voice_transcript TEXT,
  voice_confidence DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```


### 7. Exercise and Education Content

```sql
-- Exercise library and content
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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
  
  -- Progression Rules
  progression_criteria JSONB DEFAULT '{}', -- When to increase difficulty
  regression_criteria JSONB DEFAULT '{}', -- When to decrease difficulty
  
  -- Content and Media
  video_url TEXT,
  video_thumbnail_url TEXT,
  video_duration_seconds INTEGER,
  image_urls TEXT[],
  animation_url TEXT,
  
  -- Safety and Contraindications
  contraindications TEXT[],
  precautions TEXT[],
  modifications JSONB DEFAULT '{}', -- Alternative versions for different limitations
  
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

-- Educational content library
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'infographic', 'interactive', 'pdf')),
  category TEXT NOT NULL, -- 'pre_surgery', 'post_surgery', 'pain_management', 'exercise', 'nutrition'
  
  -- Content Targeting
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  activity_levels TEXT[] DEFAULT ARRAY['active', 'sedentary'],
  recovery_days INTEGER[], -- Which days this content is relevant
  
  -- Content Data
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER, -- For videos
  reading_time_minutes INTEGER, -- For articles
  file_size_bytes BIGINT,
  
  -- Content Metadata
  tags TEXT[],
  keywords TEXT[],
  language TEXT DEFAULT 'en',
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Engagement Tracking
  view_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(4,1), -- Percentage who complete the content
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

-- Patient content engagement tracking
CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
  
  -- Engagement Data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- User Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  found_helpful BOOLEAN,
  
  -- Interaction Data
  interactions JSONB DEFAULT '{}', -- Clicks, pauses, rewinds, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Analytics and Reporting

```sql
-- Patient progress tracking
CREATE TABLE progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Timing
  measurement_date DATE DEFAULT CURRENT_DATE,
  days_from_surgery INTEGER,
  recovery_phase INTEGER,
  
  -- Functional Metrics
  range_of_motion JSONB, -- Joint-specific ROM measurements
  strength_measurements JSONB, -- Strength test results
  balance_scores JSONB, -- Balance assessment scores
  endurance_metrics JSONB, -- Endurance test results
  
  -- Activity Metrics
  daily_steps INTEGER,
  active_minutes INTEGER,
  exercise_minutes INTEGER,
  sleep_hours DECIMAL(3,1),
  
  -- Pain and Symptoms
  pain_levels JSONB, -- Pain at different times/activities
  medication_usage JSONB, -- Pain medication tracking
  symptom_scores JSONB, -- Swelling, stiffness, etc.
  
  -- Compliance Metrics
  task_completion_rate DECIMAL(4,1),
  exercise_compliance_rate DECIMAL(4,1),
  appointment_attendance_rate DECIMAL(4,1),
  
  -- Quality of Life
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  
  -- Smart Device Data
  smart_device_data JSONB, -- Data from Persona IQ or other devices
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outcome measurements and milestones
CREATE TABLE outcome_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  measurement_type TEXT NOT NULL, -- 'baseline', 'weekly', 'milestone', 'discharge', 'follow_up'
  measurement_date DATE DEFAULT CURRENT_DATE,
  days_from_surgery INTEGER,
  
  -- Standardized Outcome Measures
  hoos_jr_score DECIMAL(4,1),
  koos_jr_score DECIMAL(4,1),
  forgotten_joint_score DECIMAL(4,1),
  vr12_physical_score DECIMAL(4,1),
  vr12_mental_score DECIMAL(4,1),
  womac_score DECIMAL(4,1), -- Western Ontario and McMaster Universities Arthritis Index
  
  -- Functional Tests
  timed_up_go_seconds DECIMAL(4,1),
  six_minute_walk_distance_meters INTEGER,
  stair_climb_test_seconds DECIMAL(4,1),
  single_leg_stance_seconds DECIMAL(4,1),
  
  -- Range of Motion
  knee_flexion_active INTEGER,
  knee_flexion_passive INTEGER,
  knee_extension_active INTEGER,
  knee_extension_passive INTEGER,
  hip_flexion_active INTEGER,
  hip_extension_active INTEGER,
  hip_abduction_active INTEGER,
  
  -- Strength Measurements
  quadriceps_strength_kg DECIMAL(5,2),
  hamstring_strength_kg DECIMAL(5,2),
  hip_abductor_strength_kg DECIMAL(5,2),
  
  -- Measured By
  measured_by UUID REFERENCES profiles(id),
  measurement_method TEXT, -- 'goniometer', 'app', 'smart_device', 'clinical_assessment'
  
  -- Notes and Context
  notes TEXT,
  measurement_conditions TEXT, -- Environmental factors, patient state, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System analytics and usage tracking
CREATE TABLE system_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Date and Time
  date DATE DEFAULT CURRENT_DATE,
  hour INTEGER CHECK (hour BETWEEN 0 AND 23),
  
  -- User Activity
  active_patients INTEGER DEFAULT 0,
  active_providers INTEGER DEFAULT 0,
  total_logins INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_session_duration_minutes DECIMAL(6,2),
  
  -- Feature Usage
  chat_messages_sent INTEGER DEFAULT 0,
  voice_messages_sent INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  forms_submitted INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  
  -- AI Usage
  ai_interactions INTEGER DEFAULT 0,
  ai_response_time_ms DECIMAL(8,2),
  ai_satisfaction_score DECIMAL(3,1),
  
  -- System Performance
  average_page_load_time_ms DECIMAL(8,2),
  error_count INTEGER DEFAULT 0,
  uptime_percentage DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, date, hour)
);
```

### 9. Notifications and Alerts

```sql
-- Notification templates and rules
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger Conditions
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('task_overdue', 'pain_spike', 'missed_exercises', 'milestone_achieved', 'complication_risk')),
  trigger_conditions JSONB NOT NULL,
  
  -- Notification Settings
  notification_channels TEXT[] DEFAULT ARRAY['app'], -- 'app', 'email', 'sms'
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Recipients
  recipient_roles TEXT[] DEFAULT ARRAY['patient'], -- Who should receive this notification
  escalation_rules JSONB DEFAULT '{}',
  
  -- Content
  message_template TEXT NOT NULL,
  email_template TEXT,
  sms_template TEXT,
  
  -- Timing and Frequency
  delay_minutes INTEGER DEFAULT 0,
  max_frequency_per_day INTEGER DEFAULT 1,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual notifications sent
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Notification Details
  notification_rule_id UUID REFERENCES notification_rules(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Delivery
  channels TEXT[] NOT NULL, -- Which channels were used
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Actions
  action_url TEXT, -- Deep link to relevant app section
  action_taken BOOLEAN DEFAULT false,
  action_taken_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert system for providers
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_pain', 'missed_tasks', 'poor_compliance', 'complication_risk', 'milestone_delay')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Assignment and Resolution
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  
  -- Related Data
  related_task_id UUID,
  related_message_id UUID REFERENCES messages(id),
  related_assessment_id UUID,
  
  -- Escalation
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES profiles(id),
  escalation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Audit and Compliance

```sql
-- Comprehensive audit log for HIPAA compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Who
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  user_role TEXT,
  impersonated_by UUID REFERENCES profiles(id), -- For admin impersonation
  
  -- What
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'login', 'logout'
  resource_type TEXT NOT NULL, -- 'patient', 'message', 'task', 'form'
  resource_id UUID,
  
  -- When
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Where
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- How
  method TEXT, -- 'web', 'mobile', 'api'
  endpoint TEXT, -- API endpoint or page URL
  
  -- Details
  old_values JSONB, -- Previous state for updates
  new_values JSONB, -- New state for creates/updates
  metadata JSONB DEFAULT '{}',
  
  -- Patient Context (for patient-related actions)
  patient_id UUID REFERENCES patients(id),
  
  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Retention
  retention_date DATE -- When this log can be purged
);

-- Data access logs for sensitive information
CREATE TABLE data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  
  -- Access Details
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'export', 'print')),
  data_type TEXT NOT NULL, -- 'medical_record', 'messages', 'assessments', 'forms'
  data_classification TEXT DEFAULT 'phi' CHECK (data_classification IN ('phi', 'pii', 'sensitive', 'public')),
  
  -- Context
  purpose TEXT, -- Business justification for access
  session_id TEXT,
  ip_address INET,
  
  -- Timing
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  session_duration_seconds INTEGER,
  
  -- Compliance
  consent_obtained BOOLEAN DEFAULT false,
  consent_type TEXT, -- 'explicit', 'implied', 'emergency'
  legal_basis TEXT, -- HIPAA justification
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention and deletion tracking
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Policy Details
  policy_name TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'patient_data', 'messages', 'audit_logs'
  retention_period_days INTEGER NOT NULL,
  
  -- Deletion Rules
  auto_delete BOOLEAN DEFAULT false,
  deletion_method TEXT DEFAULT 'soft' CHECK (deletion_method IN ('soft', 'hard', 'anonymize')),
  
  -- Legal Requirements
  legal_basis TEXT, -- HIPAA, state law, etc.
  exceptions JSONB DEFAULT '{}', -- Conditions where policy doesn't apply
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```


## Row Level Security (RLS) Policies

### Tenant Isolation Policies

```sql
-- Enable RLS on all tenant-aware tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Function to get current tenant ID from JWT or session
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- Get tenant_id from JWT claims or session variable
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

-- Tenant access policy (users can only access their tenant's data)
CREATE POLICY "Tenant isolation" ON tenants
  FOR ALL USING (id = get_current_tenant_id());

-- Profile access policies
CREATE POLICY "Users can view profiles in their tenant" ON profiles
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    id = get_current_user_id() AND 
    tenant_id = get_current_tenant_id()
  );

CREATE POLICY "Admins can manage profiles in their tenant" ON profiles
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    get_current_user_role() IN ('saas_owner', 'practice_admin')
  );

-- Patient access policies
CREATE POLICY "Providers can access patients in their tenant" ON patients
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    get_current_user_role() IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist')
  );

CREATE POLICY "Patients can access their own data" ON patients
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND
    user_id = get_current_user_id()
  );

-- Message access policies
CREATE POLICY "Users can access messages in their tenant conversations" ON messages
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    (
      -- Providers can see all messages in their tenant
      get_current_user_role() IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      -- Patients can see messages in their own conversations
      (get_current_user_role() = 'patient' AND 
       conversation_id IN (
         SELECT id FROM conversations 
         WHERE patient_id IN (
           SELECT id FROM patients WHERE user_id = get_current_user_id()
         )
       ))
    )
  );

-- Task access policies
CREATE POLICY "Task access by role and tenant" ON patient_tasks
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    (
      -- Providers can access all tasks in their tenant
      get_current_user_role() IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      -- Patients can access their own tasks
      (get_current_user_role() = 'patient' AND 
       patient_id IN (SELECT id FROM patients WHERE user_id = get_current_user_id()))
    )
  );

-- Form response access policies
CREATE POLICY "Form response access by role and tenant" ON form_responses
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    (
      -- Providers can access all form responses in their tenant
      get_current_user_role() IN ('saas_owner', 'practice_admin', 'surgeon', 'nurse', 'physical_therapist') OR
      -- Patients can access their own form responses
      (get_current_user_role() = 'patient' AND 
       patient_id IN (SELECT id FROM patients WHERE user_id = get_current_user_id()))
    )
  );

-- Audit log access (read-only for admins)
CREATE POLICY "Audit log access for admins" ON audit_logs
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND
    get_current_user_role() IN ('saas_owner', 'practice_admin')
  );
```

### Role-Based Access Policies

```sql
-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  required_role TEXT,
  resource_type TEXT DEFAULT NULL,
  resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_tenant UUID;
BEGIN
  SELECT role, tenant_id INTO user_role, user_tenant
  FROM profiles 
  WHERE id = get_current_user_id();
  
  -- SaaS owner has all permissions
  IF user_role = 'saas_owner' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user's role matches required role
  IF user_role = required_role THEN
    RETURN TRUE;
  END IF;
  
  -- Additional role hierarchy checks
  CASE required_role
    WHEN 'practice_admin' THEN
      RETURN user_role IN ('saas_owner');
    WHEN 'surgeon' THEN
      RETURN user_role IN ('saas_owner', 'practice_admin');
    WHEN 'nurse' THEN
      RETURN user_role IN ('saas_owner', 'practice_admin', 'surgeon');
    WHEN 'physical_therapist' THEN
      RETURN user_role IN ('saas_owner', 'practice_admin', 'surgeon');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Database Functions and Triggers

### Automatic Timestamp Updates

```sql
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

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_tasks_updated_at BEFORE UPDATE ON patient_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Audit Logging Functions

```sql
-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_patient_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    patient_id,
    ip_address,
    user_agent,
    session_id
  ) VALUES (
    get_current_tenant_id(),
    get_current_user_id(),
    (SELECT email FROM profiles WHERE id = get_current_user_id()),
    get_current_user_role(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_patient_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    current_setting('request.headers', true)::json->>'session-id'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_values JSONB;
  new_values JSONB;
  patient_id_val UUID;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_values = to_jsonb(OLD);
    new_values = NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    old_values = to_jsonb(OLD);
    new_values = to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    old_values = NULL;
    new_values = to_jsonb(NEW);
  END IF;
  
  -- Extract patient_id if available
  IF TG_TABLE_NAME = 'patients' THEN
    patient_id_val = COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME IN ('messages', 'patient_tasks', 'form_responses') THEN
    patient_id_val = COALESCE(NEW.patient_id, OLD.patient_id);
  END IF;
  
  -- Create audit log
  PERFORM create_audit_log(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_values,
    new_values,
    patient_id_val
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_messages_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_form_responses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON form_responses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Recovery Progress Calculation Functions

```sql
-- Function to calculate patient recovery progress
CREATE OR REPLACE FUNCTION calculate_recovery_progress(p_patient_id UUID)
RETURNS JSONB AS $$
DECLARE
  patient_record patients%ROWTYPE;
  total_tasks INTEGER;
  completed_tasks INTEGER;
  current_phase INTEGER;
  progress_percentage DECIMAL(5,2);
  result JSONB;
BEGIN
  -- Get patient information
  SELECT * INTO patient_record FROM patients WHERE id = p_patient_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "Patient not found"}'::JSONB;
  END IF;
  
  -- Calculate task completion
  SELECT COUNT(*) INTO total_tasks
  FROM patient_tasks 
  WHERE patient_id = p_patient_id 
    AND scheduled_date <= CURRENT_DATE;
  
  SELECT COUNT(*) INTO completed_tasks
  FROM patient_tasks 
  WHERE patient_id = p_patient_id 
    AND status = 'completed'
    AND scheduled_date <= CURRENT_DATE;
  
  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    progress_percentage = (completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100;
  ELSE
    progress_percentage = 0;
  END IF;
  
  -- Determine current phase based on days from surgery
  current_phase = CASE
    WHEN patient_record.current_day < 0 THEN 0  -- Pre-op
    WHEN patient_record.current_day <= 7 THEN 1   -- Immediate post-op
    WHEN patient_record.current_day <= 21 THEN 2  -- Early recovery
    WHEN patient_record.current_day <= 42 THEN 3  -- Intermediate recovery
    WHEN patient_record.current_day <= 84 THEN 4  -- Advanced recovery
    ELSE 5  -- Maintenance
  END;
  
  -- Build result JSON
  result = jsonb_build_object(
    'patient_id', p_patient_id,
    'current_day', patient_record.current_day,
    'current_phase', current_phase,
    'total_tasks', total_tasks,
    'completed_tasks', completed_tasks,
    'progress_percentage', progress_percentage,
    'surgery_date', patient_record.surgery_date,
    'surgery_type', patient_record.surgery_type,
    'activity_level', patient_record.activity_level
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update patient current day based on surgery date
CREATE OR REPLACE FUNCTION update_patient_current_day()
RETURNS VOID AS $$
BEGIN
  UPDATE patients 
  SET current_day = CASE
    WHEN surgery_date IS NULL THEN 0
    ELSE EXTRACT(DAY FROM (CURRENT_DATE - surgery_date))::INTEGER
  END,
  updated_at = NOW()
  WHERE surgery_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance Indexes

```sql
-- Primary performance indexes
CREATE INDEX CONCURRENTLY idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX CONCURRENTLY idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY idx_profiles_role ON profiles(role);

CREATE INDEX CONCURRENTLY idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX CONCURRENTLY idx_patients_user_id ON patients(user_id);
CREATE INDEX CONCURRENTLY idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX CONCURRENTLY idx_patients_current_day ON patients(current_day);
CREATE INDEX CONCURRENTLY idx_patients_status ON patients(status);
CREATE INDEX CONCURRENTLY idx_patients_assigned_surgeon ON patients(assigned_surgeon);
CREATE INDEX CONCURRENTLY idx_patients_assigned_nurse ON patients(assigned_nurse);
CREATE INDEX CONCURRENTLY idx_patients_assigned_pt ON patients(assigned_pt);

CREATE INDEX CONCURRENTLY idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX CONCURRENTLY idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX CONCURRENTLY idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_message_type ON messages(message_type);

CREATE INDEX CONCURRENTLY idx_patient_tasks_tenant_id ON patient_tasks(tenant_id);
CREATE INDEX CONCURRENTLY idx_patient_tasks_patient_id ON patient_tasks(patient_id);
CREATE INDEX CONCURRENTLY idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX CONCURRENTLY idx_patient_tasks_status ON patient_tasks(status);
CREATE INDEX CONCURRENTLY idx_patient_tasks_task_id ON patient_tasks(task_id);

CREATE INDEX CONCURRENTLY idx_form_responses_tenant_id ON form_responses(tenant_id);
CREATE INDEX CONCURRENTLY idx_form_responses_patient_id ON form_responses(patient_id);
CREATE INDEX CONCURRENTLY idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX CONCURRENTLY idx_form_responses_completed_at ON form_responses(completed_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_patients_tenant_status ON patients(tenant_id, status);
CREATE INDEX CONCURRENTLY idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_patient_tasks_patient_date ON patient_tasks(patient_id, scheduled_date);
CREATE INDEX CONCURRENTLY idx_audit_logs_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_patients_active ON patients(tenant_id, id) 
  WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_profiles_active ON profiles(tenant_id, id) 
  WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_messages_active ON messages(conversation_id, created_at DESC) 
  WHERE deleted_at IS NULL;

-- GIN indexes for JSONB columns
CREATE INDEX CONCURRENTLY idx_patients_medications_gin ON patients USING GIN(medications);
CREATE INDEX CONCURRENTLY idx_messages_formatted_content_gin ON messages USING GIN(formatted_content);
CREATE INDEX CONCURRENTLY idx_form_responses_responses_gin ON form_responses USING GIN(responses);
CREATE INDEX CONCURRENTLY idx_progress_metrics_smart_device_gin ON progress_metrics USING GIN(smart_device_data);

-- Text search indexes
CREATE INDEX CONCURRENTLY idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY idx_educational_content_search ON educational_content USING GIN(to_tsvector('english', title || ' ' || description));
```

## Database Relationships Summary

```sql
-- Core relationship diagram (conceptual)
/*
tenants (1) ──── (many) profiles
tenants (1) ──── (many) patients
tenants (1) ──── (many) conversations
tenants (1) ──── (many) messages
tenants (1) ──── (many) tasks
tenants (1) ──── (many) forms

profiles (1) ──── (many) patients [as user_id]
profiles (1) ──── (many) patients [as assigned_surgeon]
profiles (1) ──── (many) patients [as assigned_nurse]
profiles (1) ──── (many) patients [as assigned_pt]

patients (1) ──── (1) conversations
patients (1) ──── (many) patient_tasks
patients (1) ──── (many) form_responses
patients (1) ──── (many) progress_metrics
patients (1) ──── (many) patient_assessments

conversations (1) ──── (many) messages

recovery_protocols (1) ──── (many) tasks
tasks (1) ──── (many) patient_tasks

forms (1) ──── (many) form_responses
form_responses (1) ──── (many) form_field_responses

exercises (1) ──── (many) tasks [exercise tasks]
educational_content (1) ──── (many) tasks [education tasks]
*/
```

## Data Migration and Seeding

```sql
-- Initial data seeding for new tenants
CREATE OR REPLACE FUNCTION seed_tenant_data(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default recovery protocols
  INSERT INTO recovery_protocols (tenant_id, name, surgery_type, activity_level, total_days, is_template)
  VALUES 
    (p_tenant_id, 'Standard TKA - Active Adults', 'TKA', 'active', 84, true),
    (p_tenant_id, 'Standard TKA - Sedentary Adults', 'TKA', 'sedentary', 84, true),
    (p_tenant_id, 'Standard THA - Active Adults', 'THA', 'active', 84, true),
    (p_tenant_id, 'Standard THA - Sedentary Adults', 'THA', 'sedentary', 84, true);
  
  -- Insert default notification rules
  INSERT INTO notification_rules (tenant_id, name, trigger_type, trigger_conditions, message_template)
  VALUES 
    (p_tenant_id, 'Task Overdue', 'task_overdue', '{"hours": 24}', 'You have an overdue task: {task_name}'),
    (p_tenant_id, 'High Pain Alert', 'pain_spike', '{"pain_level": 8}', 'High pain level reported. Please check on patient.'),
    (p_tenant_id, 'Milestone Achieved', 'milestone_achieved', '{}', 'Congratulations! You''ve reached a recovery milestone.');
  
  -- Insert default role permissions
  INSERT INTO role_permissions (tenant_id, role, resource, actions)
  VALUES 
    (p_tenant_id, 'practice_admin', 'patients', ARRAY['read', 'write', 'delete', 'assign']),
    (p_tenant_id, 'surgeon', 'patients', ARRAY['read', 'write', 'assign']),
    (p_tenant_id, 'nurse', 'patients', ARRAY['read', 'write']),
    (p_tenant_id, 'physical_therapist', 'patients', ARRAY['read', 'write']),
    (p_tenant_id, 'patient', 'patients', ARRAY['read']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Important Implementation Notes

⚠️ **Critical for Claude Code Implementation:**

1. **Always use tenant_id filtering** in all queries to ensure proper data isolation
2. **Implement proper RLS policies** before deploying to production
3. **Use the provided functions** for getting current user/tenant context
4. **Enable audit logging** for all sensitive operations
5. **Encrypt sensitive medical data** at the application level before storing
6. **Implement proper backup and recovery** procedures for HIPAA compliance
7. **Use prepared statements** to prevent SQL injection
8. **Monitor query performance** and add indexes as needed
9. **Implement data retention policies** according to legal requirements
10. **Test multi-tenant isolation** thoroughly before production deployment

This comprehensive database schema provides a solid foundation for the TJV Smart Recovery App while ensuring HIPAA compliance, multi-tenant security, and optimal performance for healthcare data management.

