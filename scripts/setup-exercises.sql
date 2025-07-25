-- Exercise library with video integration
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('range_of_motion', 'strengthening', 'balance', 'functional', 'cardiovascular')),
  
  -- Exercise parameters
  default_repetitions INTEGER,
  default_sets INTEGER,
  default_duration_seconds INTEGER,
  default_rest_seconds INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Targeting and benefits
  target_muscle_groups TEXT[],
  joint_movements TEXT[],
  benefits TEXT[],
  contraindications TEXT[],
  
  -- Video content
  primary_video_id UUID,
  alternative_video_ids UUID[],
  instruction_points JSONB DEFAULT '[]',
  safety_warnings JSONB DEFAULT '[]',
  
  -- Equipment and setup
  required_equipment TEXT[],
  optional_equipment TEXT[],
  space_requirements TEXT,
  setup_instructions TEXT,
  
  -- Progression and modification
  progression_criteria JSONB DEFAULT '{}',
  modifications JSONB DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise videos with streaming metadata
CREATE TABLE IF NOT EXISTS exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL,
  
  -- Video files and streaming
  video_files JSONB NOT NULL, -- Different quality versions
  thumbnail_url TEXT,
  preview_url TEXT, -- Short preview clip
  
  -- Video structure
  chapters JSONB DEFAULT '[]',
  instruction_overlays JSONB DEFAULT '[]',
  safety_overlays JSONB DEFAULT '[]',
  
  -- Content metadata
  language TEXT DEFAULT 'en',
  captions_available BOOLEAN DEFAULT false,
  transcript TEXT,
  
  -- Usage tracking
  view_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(4,1),
  average_watch_time_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient exercise performance tracking
CREATE TABLE IF NOT EXISTS patient_exercise_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Session details
  session_date DATE DEFAULT CURRENT_DATE,
  recovery_day INTEGER,
  
  -- Performance data
  completed_repetitions INTEGER,
  completed_sets INTEGER,
  actual_duration_seconds INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  
  -- Pain and comfort
  pain_before INTEGER CHECK (pain_before BETWEEN 0 AND 10),
  pain_during INTEGER CHECK (pain_during BETWEEN 0 AND 10),
  pain_after INTEGER CHECK (pain_after BETWEEN 0 AND 10),
  comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 5),
  
  -- Form and technique
  form_rating INTEGER CHECK (form_rating BETWEEN 1 AND 5),
  form_feedback JSONB DEFAULT '{}', -- AI-generated form analysis
  modifications_used TEXT[],
  
  -- Video engagement
  video_watch_time_seconds INTEGER,
  video_completion_percentage INTEGER,
  video_replays INTEGER DEFAULT 0,
  
  -- Notes and feedback
  patient_notes TEXT,
  provider_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise progression tracking
CREATE TABLE IF NOT EXISTS exercise_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Progression event
  progression_date DATE DEFAULT CURRENT_DATE,
  progression_type TEXT NOT NULL CHECK (progression_type IN ('difficulty_increase', 'repetition_increase', 'duration_increase', 'new_exercise_introduced')),
  
  -- Previous and new parameters
  previous_parameters JSONB NOT NULL,
  new_parameters JSONB NOT NULL,
  
  -- Progression rationale
  trigger_reason TEXT, -- 'automatic', 'provider_directed', 'patient_requested'
  performance_metrics JSONB, -- Metrics that triggered progression
  
  -- Outcome tracking
  patient_response TEXT, -- How patient responded to progression
  success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-in questions
CREATE TABLE IF NOT EXISTS daily_checkin_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('pain_scale', 'yes_no', 'multiple_choice', 'text', 'numeric')),
  category TEXT NOT NULL CHECK (category IN ('pain', 'mobility', 'mood', 'medication', 'general')),
  recovery_phase TEXT[] DEFAULT ARRAY['all'], -- Which phases this question applies to
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'], -- Which surgery types this applies to
  
  -- Question configuration
  options JSONB DEFAULT '[]', -- For multiple choice questions
  min_value INTEGER, -- For numeric questions
  max_value INTEGER, -- For numeric questions
  required BOOLEAN DEFAULT true,
  
  -- Display order and conditions
  display_order INTEGER DEFAULT 0,
  display_conditions JSONB DEFAULT '{}', -- Conditional logic for when to show
  
  -- Follow-up configuration
  follow_up_threshold INTEGER, -- Value that triggers follow-up
  follow_up_action TEXT, -- What to do if threshold is met
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient daily progress and adaptation
CREATE TABLE IF NOT EXISTS patient_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recovery_day INTEGER NOT NULL,
  
  -- Daily check-in data
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  swelling_level INTEGER CHECK (swelling_level BETWEEN 0 AND 10),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 0 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
  
  -- Task completion
  total_tasks_scheduled INTEGER,
  total_tasks_completed INTEGER,
  task_completion_rate DECIMAL(4,1),
  
  -- Protocol adaptation
  protocol_adaptation_applied BOOLEAN DEFAULT false,
  adaptation_reason TEXT,
  provider_modifications JSONB DEFAULT '[]',
  
  -- Progress metrics
  daily_steps INTEGER,
  active_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, recovery_day)
);

-- Pre-surgery form responses with medical validation
CREATE TABLE IF NOT EXISTS preop_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN (
    'universal_medical_questionnaire',
    'informed_consent',
    'anesthesia_consent',
    'facility_consent',
    'cardiac_risk_assessment',
    'dental_clearance',
    'specialist_clearance'
  )),
  
  -- Form data and metadata
  form_responses JSONB NOT NULL,
  completion_status TEXT DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'requires_review')),
  completion_percentage INTEGER DEFAULT 0,
  
  -- Medical validation
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'requires_attention')),
  validation_issues JSONB DEFAULT '[]',
  risk_flags JSONB DEFAULT '[]',
  
  -- Digital signatures and legal compliance
  digital_signatures JSONB DEFAULT '[]',
  consent_timestamp TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  
  -- Provider review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  clearance_status TEXT DEFAULT 'pending' CHECK (clearance_status IN ('pending', 'cleared', 'requires_additional_work')),
  
  -- Timing and workflow
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);