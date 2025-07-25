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

-- User profiles with role-based access
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Personal Information
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Role and Permissions
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist', 'patient')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[], -- For multi-tenant access
  
  -- Professional Information
  license_number TEXT,
  specialties TEXT[],
  department TEXT,
  title TEXT,
  
  -- Settings and Preferences
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, email)
);

-- =====================================================
-- 3. PATIENT MANAGEMENT
-- =====================================================

-- Patient records with surgery tracking
CREATE TABLE patients (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Surgery Information
  surgery_type TEXT CHECK (surgery_type IN ('TKA', 'THA', 'bilateral_TKA', 'bilateral_THA')),
  surgery_date DATE,
  surgeon_id UUID REFERENCES profiles(id),
  
  -- Recovery Tracking
  current_recovery_day INTEGER DEFAULT 0,
  activity_level TEXT DEFAULT 'sedentary' CHECK (activity_level IN ('sedentary', 'active', 'very_active')),
  recovery_protocol_id UUID, -- Will reference recovery_protocols table
  
  -- Medical Information
  medical_record_number TEXT,
  insurance_info JSONB,
  emergency_contact JSONB,
  allergies TEXT[],
  medications JSONB,
  
  -- Care Team
  primary_nurse_id UUID REFERENCES profiles(id),
  physical_therapist_id UUID REFERENCES profiles(id),
  
  -- Status and Notes
  status TEXT DEFAULT 'active' CHECK (status IN ('pre_surgery', 'active', 'completed', 'inactive')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, medical_record_number)
);

-- =====================================================
-- 4. CHAT CONVERSATION SYSTEM
-- =====================================================

-- Chat conversations between patients and AI/providers
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Conversation Metadata
  title TEXT,
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'form', 'exercise', 'education', 'assessment')),
  
  -- Context and State
  context JSONB DEFAULT '{}', -- Current conversation context
  surgery_day INTEGER, -- Day of recovery when conversation started
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  is_urgent BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages within conversations
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  
  -- Message Content
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('patient', 'ai', 'provider', 'system')),
  sender_id UUID REFERENCES profiles(id), -- For provider messages
  
  -- Message Metadata
  metadata JSONB DEFAULT '{}',
  attachments TEXT[], -- URLs to attached files
  
  -- AI Processing
  ai_model TEXT,
  ai_tokens INTEGER,
  processing_time_ms INTEGER,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. FORMS AND ASSESSMENTS
-- =====================================================

-- Form templates for different types of assessments
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Form Information
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('intake', 'daily_assessment', 'weekly_assessment', 'discharge')),
  
  -- Form Structure
  fields JSONB NOT NULL, -- Form field definitions
  validation_rules JSONB DEFAULT '{}',
  
  -- Configuration
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  
  -- Chat Integration
  chat_prompts JSONB DEFAULT '{}', -- Prompts for conversational delivery
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name, version)
);

-- Patient form responses
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Response Data
  responses JSONB NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. EXERCISE SYSTEM
-- =====================================================

-- Exercise library
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Exercise Information
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  
  -- Exercise Properties
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('strength', 'flexibility', 'balance', 'endurance')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  
  -- Media
  video_url TEXT,
  image_urls TEXT[],
  
  -- Parameters
  default_duration INTEGER, -- minutes
  default_repetitions INTEGER,
  default_sets INTEGER,
  
  -- Configuration
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Chat Integration
  chat_prompts JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name)
);

-- Patient exercise completions
CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Completion Data
  duration_minutes INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'partial', 'skipped')),
  notes TEXT,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. EDUCATIONAL CONTENT
-- =====================================================

-- Educational content library
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Content Information
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'infographic', 'checklist')),
  
  -- Content Data
  content TEXT, -- For articles/text content
  media_url TEXT, -- For videos/images
  
  -- Targeting
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  recovery_phases TEXT[] DEFAULT ARRAY['pre_surgery', 'immediate', 'early', 'intermediate', 'advanced'],
  
  -- Configuration
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Chat Integration
  chat_prompts JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, title)
);

-- Patient content engagement tracking
CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Engagement Data
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('viewed', 'completed', 'shared', 'bookmarked')),
  duration_seconds INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  
  engaged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TASK AND PROTOCOL MANAGEMENT
-- =====================================================

-- Patient tasks (combines forms, exercises, content)
CREATE TABLE patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Task Information
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('form', 'exercise', 'education', 'appointment', 'medication')),
  
  -- Task References
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  content_id UUID REFERENCES educational_content(id) ON DELETE SET NULL,
  
  -- Scheduling
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  surgery_day INTEGER, -- Day relative to surgery
  
  -- Status
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  
  -- Assignment
  assigned_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenant and user indexes
CREATE INDEX idx_profiles_tenant_role ON profiles(tenant_id, role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_patients_tenant_surgery ON patients(tenant_id, surgery_type, surgery_date);
CREATE INDEX idx_patients_recovery_day ON patients(current_recovery_day);

-- Conversation indexes
CREATE INDEX idx_conversations_patient_status ON conversations(patient_id, status);
CREATE INDEX idx_conversations_tenant_type ON conversations(tenant_id, conversation_type);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, sent_at);
CREATE INDEX idx_messages_patient_type ON messages(patient_id, message_type);

-- Form and exercise indexes
CREATE INDEX idx_forms_tenant_type ON forms(tenant_id, form_type, is_active);
CREATE INDEX idx_form_responses_patient_status ON form_responses(patient_id, status);
CREATE INDEX idx_exercises_tenant_type ON exercises(tenant_id, exercise_type, is_active);
CREATE INDEX idx_exercise_completions_patient_date ON exercise_completions(patient_id, completed_at);

-- Unique constraint for form responses (one per patient per form per day)
CREATE UNIQUE INDEX idx_form_responses_patient_form_date ON form_responses(patient_id, form_id, (started_at::DATE));

-- Task indexes
CREATE INDEX idx_patient_tasks_patient_status ON patient_tasks(patient_id, status);
CREATE INDEX idx_patient_tasks_due_date ON patient_tasks(due_date, status);
CREATE INDEX idx_patient_tasks_surgery_day ON patient_tasks(surgery_day, task_type);

-- =====================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
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
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;

-- Tenant policies
CREATE POLICY "Users can view their accessible tenants" ON tenants
  FOR SELECT USING (id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

-- Profile policies
CREATE POLICY "Users can view profiles in their tenant" ON profiles
  FOR SELECT USING (tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Patient policies
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view patients in their tenant" ON patients
  FOR SELECT USING (
    tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist'))
  );

-- Conversation policies
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Providers can view conversations in their tenant" ON conversations
  FOR SELECT USING (
    tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist'))
  );

-- Message policies
CREATE POLICY "Patients can view their own messages" ON messages
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own messages" ON messages
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Providers can view messages in their tenant" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND c.tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
      AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist'))
    )
  );

-- Form policies
CREATE POLICY "Users can view forms in their tenant" ON forms
  FOR SELECT USING (tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Patients can view their own form responses" ON form_responses
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own form responses" ON form_responses
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Exercise policies
CREATE POLICY "Users can view exercises in their tenant" ON exercises
  FOR SELECT USING (tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Patients can view their own exercise completions" ON exercise_completions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own exercise completions" ON exercise_completions
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Content policies
CREATE POLICY "Users can view content in their tenant" ON educational_content
  FOR SELECT USING (tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Patients can view their own content engagement" ON content_engagement
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can insert their own content engagement" ON content_engagement
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Task policies
CREATE POLICY "Patients can view their own tasks" ON patient_tasks
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Providers can view tasks in their tenant" ON patient_tasks
  FOR SELECT USING (
    tenant_id = ANY(SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist'))
  );

-- =====================================================
-- 11. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
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

