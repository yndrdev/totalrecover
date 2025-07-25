-- =====================================================
-- COMPLETE MISSING COLUMNS FIX
-- This adds EVERY column needed for the demo data to work
-- Run this ONCE, then run the demo data
-- =====================================================

-- =====================================================
-- 1. FIX TENANTS TABLE - ADD ALL MISSING COLUMNS
-- =====================================================

-- Core identification columns
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'practice';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_tenant_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Settings and configuration
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_patients INTEGER DEFAULT 100;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_providers INTEGER DEFAULT 10;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['chat', 'exercises', 'forms'];

-- Branding and customization
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_training_data JSONB DEFAULT '{}';

-- Contact and billing
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';

-- Timestamps
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Note: Constraints will be added later if needed

-- =====================================================
-- 2. FIX PROFILES TABLE - ADD ALL MISSING COLUMNS
-- =====================================================

-- Personal information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Role and permissions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[];

-- Professional information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;

-- Settings and preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';

-- Status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Timestamps
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Note: Constraints will be added later if needed

-- =====================================================
-- 3. FIX PATIENTS TABLE - ADD ALL MISSING COLUMNS
-- =====================================================

-- Surgery information
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_type TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgeon_id UUID;

-- Recovery tracking
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_recovery_day INTEGER DEFAULT 0;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'sedentary';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS recovery_protocol_id UUID;

-- Medical information
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_record_number TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_info JSONB;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medications JSONB;

-- Care team
ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_nurse_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS physical_therapist_id UUID;

-- Status and notes
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Timestamps
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Note: Constraints will be added later if needed

-- =====================================================
-- 4. CREATE MISSING TABLES IF THEY DON'T EXIST
-- =====================================================

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT,
  conversation_type TEXT DEFAULT 'general',
  context JSONB DEFAULT '{}',
  surgery_day INTEGER,
  status TEXT DEFAULT 'active',
  is_urgent BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  attachments TEXT[],
  ai_model TEXT,
  ai_tokens INTEGER,
  processing_time_ms INTEGER,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  video_url TEXT,
  image_urls TEXT[],
  default_duration INTEGER,
  default_repetitions INTEGER,
  default_sets INTEGER,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  chat_prompts JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  duration_minutes INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  difficulty_rating INTEGER,
  pain_level INTEGER,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forms table if it doesn't exist
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL,
  fields JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  chat_prompts JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create form_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  surgery_day INTEGER,
  status TEXT DEFAULT 'assigned',
  priority TEXT DEFAULT 'normal',
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. UPDATE EXISTING DATA WITH PROPER VALUES
-- =====================================================

-- Update tenants
UPDATE tenants SET tenant_type = 'practice' WHERE tenant_type IS NULL;
UPDATE tenants SET is_active = true WHERE is_active IS NULL;

-- Update profiles  
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
UPDATE profiles SET first_name = 'Unknown' WHERE first_name IS NULL;
UPDATE profiles SET last_name = 'User' WHERE last_name IS NULL;

-- Update patients
UPDATE patients SET status = 'active' WHERE status IS NULL;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Show what we've created
SELECT 'SUCCESS: Schema update complete!' as message;

SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('tenants', 'profiles', 'patients', 'conversations', 'messages', 'exercises', 'forms', 'patient_tasks')
  AND table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

