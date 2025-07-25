-- =====================================================
-- SIMPLE SCHEMA FIX - NO FOREIGN KEY ISSUES
-- This adds missing columns without complex relationships
-- =====================================================

-- =====================================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Fix tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'practice';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_tenant_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT 'Unknown';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT 'User';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_record_number TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_type TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_recovery_day INTEGER DEFAULT 0;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'active';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgeon_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_nurse_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS physical_therapist_id UUID;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 2. CREATE SIMPLE TABLES WITHOUT COMPLEX FOREIGN KEYS
-- =====================================================

-- Create conversations table (simple version)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  tenant_id UUID,
  title TEXT,
  conversation_type TEXT DEFAULT 'general',
  surgery_day INTEGER,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table (simple version)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  patient_id UUID,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table (simple version)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  exercise_type TEXT,
  difficulty_level TEXT,
  default_duration INTEGER,
  default_repetitions INTEGER,
  default_sets INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_completions table (simple version)
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  exercise_id UUID,
  duration_minutes INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  difficulty_rating INTEGER,
  pain_level INTEGER,
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forms table (simple version)
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT,
  fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create form_responses table (simple version)
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  form_id UUID,
  responses JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_tasks table (simple version)
CREATE TABLE IF NOT EXISTS patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  tenant_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT,
  exercise_id UUID,
  assigned_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'assigned',
  assigned_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. UPDATE EXISTING DATA
-- =====================================================

-- Update existing records with proper values
UPDATE tenants SET tenant_type = 'practice' WHERE tenant_type IS NULL;
UPDATE tenants SET is_active = true WHERE is_active IS NULL;
UPDATE profiles SET is_active = true WHERE is_active IS NULL;
UPDATE profiles SET first_name = 'Unknown' WHERE first_name IS NULL;
UPDATE profiles SET last_name = 'User' WHERE last_name IS NULL;
UPDATE patients SET status = 'active' WHERE status IS NULL;

-- =====================================================
-- 4. SUCCESS MESSAGE
-- =====================================================

SELECT 'SUCCESS: Simple schema update complete!' as message;
SELECT 'All tables and columns are now ready for demo data!' as next_step;

