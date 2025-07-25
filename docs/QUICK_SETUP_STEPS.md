# Quick Setup Steps - What Goes Where

## 🔴 IN SUPABASE SQL EDITOR (SQL Only!)

### Step 1: Disable RLS (Copy & Paste This)
```sql
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

### Step 2: Create Exercise Tables (Copy & Paste All of This)
```sql
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

-- Daily check-in questions (SIMPLIFIED VERSION)
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('pain_scale', 'yes_no', 'multiple_choice', 'text', 'numeric')),
  category TEXT NOT NULL CHECK (category IN ('pain', 'mobility', 'mood', 'medication', 'general')),
  recovery_phase TEXT[] DEFAULT ARRAY['all'],
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'],
  
  -- Question configuration
  options JSONB DEFAULT '[]',
  min_value INTEGER,
  max_value INTEGER,
  required BOOLEAN DEFAULT true,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient responses to daily questions
CREATE TABLE IF NOT EXISTS patient_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  question_id UUID REFERENCES daily_questions(id) ON DELETE CASCADE,
  response_date DATE DEFAULT CURRENT_DATE,
  
  -- Response data
  response_value TEXT,
  response_numeric INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient exercise logs
CREATE TABLE IF NOT EXISTS patient_exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  
  -- Completion data
  completed BOOLEAN DEFAULT false,
  repetitions_completed INTEGER,
  sets_completed INTEGER,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient assigned exercises
CREATE TABLE IF NOT EXISTS patient_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Assignment details
  assigned_date DATE DEFAULT CURRENT_DATE,
  assigned_by UUID REFERENCES profiles(id),
  
  -- Custom parameters (override defaults)
  custom_repetitions INTEGER,
  custom_sets INTEGER,
  custom_duration_seconds INTEGER,
  
  -- Schedule
  frequency TEXT DEFAULT 'daily', -- daily, twice_daily, weekly, etc.
  specific_days INTEGER[], -- Day numbers when to do exercise
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🟢 IN YOUR TERMINAL (JavaScript Only!)

### Step 3: After Tables are Created, Run This Command
```bash
node scripts/seed-exercises.js
```

## ❌ COMMON MISTAKE
Do NOT paste JavaScript code (like `const { createClient } = require...`) into the SQL Editor!

## ✅ VERIFICATION
After completing all steps:
1. Check Supabase dashboard - you should see new tables
2. The chat should work (no RLS errors)
3. Exercise tables should have sample data

## 🎯 Summary
1. SQL Editor: 2 SQL commands (disable RLS + create tables)
2. Terminal: 1 JavaScript command (seed data)
3. Total time: ~5 minutes