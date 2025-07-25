# TJV Smart Recovery App - Developer Implementation Guide

## Quick Start Guide

This implementation guide provides developers with the technical specifications, code examples, and deployment instructions needed to build the TJV Smart Recovery App. The system is designed using modern web and mobile technologies with a focus on scalability, security, and healthcare compliance.

### Prerequisites

Before beginning development, ensure you have:

- **Node.js 18+** and **npm/yarn** for JavaScript development
- **React/Next.js experience** for web frontend development
- **React Native experience** for mobile app development
- **Supabase account** for backend services and database
- **Vercel account** for web application deployment
- **Healthcare compliance knowledge** (HIPAA requirements)
- **Git version control** setup

### Technology Stack Overview

```json
{
  "frontend": {
    "web": "Next.js 14+ with React 18+",
    "mobile": "React Native 0.72+",
    "styling": "Tailwind CSS with healthcare design system",
    "state_management": "Redux Toolkit + RTK Query",
    "forms": "React Hook Form with Zod validation"
  },
  "backend": {
    "service": "Supabase (PostgreSQL + Auth + Storage)",
    "api": "RESTful APIs with TypeScript",
    "real_time": "Supabase Realtime subscriptions",
    "file_storage": "Supabase Storage for media files"
  },
  "deployment": {
    "web": "Vercel with automatic deployments",
    "mobile": "App Store + Google Play Store",
    "database": "Supabase managed PostgreSQL",
    "cdn": "Vercel Edge Network"
  },
  "monitoring": {
    "errors": "Sentry for error tracking",
    "analytics": "Healthcare-compliant analytics",
    "performance": "Vercel Analytics + Web Vitals"
  }
}
```

## Project Structure

### Monorepo Organization

```
tjv-smart-recovery/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── lib/          # Utilities and configurations
│   │   │   └── types/        # TypeScript type definitions
│   │   ├── public/           # Static assets
│   │   └── package.json
│   │
│   ├── mobile/                # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/      # Screen components
│   │   │   ├── components/   # Reusable components
│   │   │   ├── navigation/   # Navigation configuration
│   │   │   ├── services/     # API services
│   │   │   └── store/        # Redux store
│   │   ├── android/          # Android-specific files
│   │   ├── ios/             # iOS-specific files
│   │   └── package.json
│   │
│   └── provider-dashboard/    # Healthcare provider web app
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── shared/               # Shared utilities and types
│   │   ├── types/           # Common TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Application constants
│   │
│   ├── ui/                  # Shared UI component library
│   │   ├── components/      # Reusable components
│   │   ├── styles/         # Shared styles and themes
│   │   └── icons/          # Icon components
│   │
│   └── api/                # API client and types
│       ├── client/         # Supabase client configuration
│       ├── types/          # API response types
│       └── hooks/          # React Query hooks
│
├── supabase/               # Database schema and migrations
│   ├── migrations/         # SQL migration files
│   ├── seed.sql           # Initial data seeding
│   └── config.toml        # Supabase configuration
│
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── package.json          # Root package.json
```

## Database Schema Implementation

### Core Tables

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  surgery_type VARCHAR(10) CHECK (surgery_type IN ('TKA', 'THA')) NOT NULL,
  surgery_date DATE,
  activity_level VARCHAR(20) CHECK (activity_level IN ('active', 'sedentary')) NOT NULL,
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('low', 'general', 'advanced')) DEFAULT 'general',
  smart_knee_enabled BOOLEAN DEFAULT FALSE,
  care_partner_name VARCHAR(200),
  care_partner_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise templates table
CREATE TABLE exercise_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('motion', 'strengthening', 'stabilization', 'functional')) NOT NULL,
  position VARCHAR(50) CHECK (position IN ('supine', 'sitting', 'standing', 'prone')),
  phases TEXT[] NOT NULL, -- Array like ['pre', '1', '2', '3']
  surgery_types TEXT[] NOT NULL, -- Array like ['TKA', 'THA']
  difficulty_levels TEXT[] NOT NULL, -- Array like ['low', 'general', 'advanced']
  functional_goal TEXT,
  instructions TEXT NOT NULL,
  cues TEXT,
  modifications TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  repetitions JSONB, -- {"low": "2x5", "general": "2x10", "advanced": "3x10"}
  holds JSONB, -- {"low": "1s", "general": "2s", "advanced": "3s"}
  frequency JSONB, -- {"low": "1x/day", "general": "2x/day", "advanced": "3x/day"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient exercise prescriptions
CREATE TABLE exercise_prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercise_templates(id),
  prescribed_repetitions VARCHAR(20),
  prescribed_holds VARCHAR(20),
  prescribed_frequency VARCHAR(20),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sessions (completed exercises)
CREATE TABLE exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercise_templates(id),
  prescription_id UUID REFERENCES exercise_prescriptions(id),
  completed_reps INTEGER,
  completed_sets INTEGER,
  hold_duration INTEGER, -- seconds
  pain_before INTEGER CHECK (pain_before >= 0 AND pain_before <= 10),
  pain_after INTEGER CHECK (pain_after >= 0 AND pain_after <= 10),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational content library
CREATE TABLE educational_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('video', 'article', 'checklist', 'interactive', 'pdf')) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('instructional', 'educational', 'reference', 'assessment')) NOT NULL,
  target_audience VARCHAR(50) CHECK (target_audience IN ('active', 'sedentary', 'all')) DEFAULT 'all',
  surgery_types TEXT[] NOT NULL,
  delivery_phase VARCHAR(50) CHECK (delivery_phase IN ('enrollment', 'pre_op', 'post_op', 'ongoing')) NOT NULL,
  delivery_timeline INTEGER, -- days relative to surgery (negative for pre-op)
  content_url VARCHAR(500),
  display_content TEXT,
  duration INTEGER, -- estimated minutes to complete
  prerequisites TEXT[], -- array of content IDs that should be completed first
  follow_up_actions TEXT[], -- array of actions to trigger after completion
  smart_knee_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content delivery tracking
CREATE TABLE content_delivery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  content_id UUID REFERENCES educational_content(id),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT
);

-- Daily tasks
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  task_type VARCHAR(50) CHECK (task_type IN ('exercise', 'activity', 'self_care', 'education', 'monitoring')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  estimated_duration INTEGER, -- minutes
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_status VARCHAR(20) CHECK (completion_status IN ('pending', 'completed', 'skipped', 'overdue')) DEFAULT 'pending',
  completion_data JSONB, -- flexible data storage for task-specific completion info
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient check-ins
CREATE TABLE patient_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  checkin_type VARCHAR(50) CHECK (checkin_type IN ('daily', 'weekly', 'milestone', 'symptom_triggered')) NOT NULL,
  checkin_date DATE NOT NULL,
  responses JSONB NOT NULL, -- structured responses to check-in questions
  calculated_scores JSONB, -- derived scores and metrics
  flags_triggered TEXT[], -- array of alert flags raised by responses
  provider_reviewed BOOLEAN DEFAULT FALSE,
  provider_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Smart knee data (for Persona IQ integration)
CREATE TABLE smart_knee_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  data_date DATE NOT NULL,
  step_count INTEGER,
  range_of_motion DECIMAL(5,2), -- degrees
  tibial_motion DECIMAL(5,2), -- degrees during gait
  activity_score INTEGER,
  raw_data JSONB, -- store complete data payload from device
  sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notifications
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) CHECK (notification_type IN ('task_reminder', 'educational_content', 'milestone_achievement', 'check_in_reminder', 'alert')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed')) DEFAULT 'pending',
  metadata JSONB -- additional notification data
);

-- Outcome assessments
CREATE TABLE outcome_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) CHECK (assessment_type IN ('hoos_jr', 'koos_jr', 'forgotten_joint', 'vr12')) NOT NULL,
  assessment_date DATE NOT NULL,
  responses JSONB NOT NULL, -- individual question responses
  total_score DECIMAL(5,2),
  subscale_scores JSONB, -- scores for different domains
  baseline BOOLEAN DEFAULT FALSE, -- true if this is the baseline assessment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_exercise_sessions_patient_date ON exercise_sessions(patient_id, completed_at);
CREATE INDEX idx_daily_tasks_patient_date ON daily_tasks(patient_id, scheduled_date);
CREATE INDEX idx_checkins_patient_date ON patient_checkins(patient_id, checkin_date);
CREATE INDEX idx_smart_knee_patient_date ON smart_knee_data(patient_id, data_date);
CREATE INDEX idx_notifications_patient_scheduled ON push_notifications(patient_id, scheduled_for);

-- Row Level Security (RLS) policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_knee_data ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Patients can view own exercise sessions" ON exercise_sessions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients can insert own exercise sessions" ON exercise_sessions
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- Add similar policies for other patient-specific tables...
```

### Seed Data

```sql
-- Insert sample exercise templates
INSERT INTO exercise_templates (
  exercise_number, name, type, position, phases, surgery_types, difficulty_levels,
  functional_goal, instructions, cues, repetitions, holds, frequency
) VALUES 
(
  1, 'Heel slide in supine', 'motion', 'supine', 
  ARRAY['pre', '1', '2', '3'], ARRAY['TKA', 'THA'], ARRAY['low', 'general', 'advanced'],
  'knee and hip motion to help get in and out of bed',
  'Lie on back with affected leg straight. Slowly slide heel toward buttocks, bending knee. Return to starting position.',
  'Maintain neutral spine by tightening abdominal muscles, keep heel on surface',
  '{"low": "2x5", "general": "2x10", "advanced": "3x10"}',
  '{"low": "1s", "general": "2s", "advanced": "3s"}',
  '{"low": "2x/day", "general": "3x/day", "advanced": "3x/day"}'
),
(
  2, 'Hip abduction in supine', 'motion', 'supine',
  ARRAY['1', '2'], ARRAY['TKA', 'THA'], ARRAY['low', 'general', 'advanced'],
  'hip motion and to strengthen the muscles of walking',
  'Lie on back with both knees bent, straighten affected leg, keep heel on surface and gently slide out to side',
  'Keep heel on surface throughout movement, control the return',
  '{"low": "2x5", "general": "2x10", "advanced": "3x10"}',
  '{"low": "1s", "general": "2s", "advanced": "3s"}',
  '{"low": "2x/day", "general": "2x/day", "advanced": "3x/day"}'
);

-- Insert sample educational content
INSERT INTO educational_content (
  title, type, category, target_audience, surgery_types, delivery_phase, delivery_timeline,
  display_content, duration
) VALUES 
(
  'Welcome and TJV Introduction', 'video', 'educational', 'all', 
  ARRAY['TKA', 'THA'], 'enrollment', 0,
  'Introduction to the care team and benefits of remote monitoring', 15
),
(
  'Pre-op Shopping List', 'checklist', 'instructional', 'all',
  ARRAY['TKA', 'THA'], 'pre_op', -45,
  'Essential items to purchase before surgery for optimal recovery', 10
),
(
  'How to Sleep After Surgery', 'article', 'instructional', 'all',
  ARRAY['TKA', 'THA'], 'post_op', 0,
  'Proper positioning and sleep strategies for comfort and healing', 5
);
```

## API Implementation

### Supabase Client Configuration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// For server-side operations
export const createServerSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### TypeScript Types

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          surgery_type: 'TKA' | 'THA'
          surgery_date: string | null
          activity_level: 'active' | 'sedentary'
          difficulty_level: 'low' | 'general' | 'advanced'
          smart_knee_enabled: boolean
          care_partner_name: string | null
          care_partner_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          surgery_type: 'TKA' | 'THA'
          surgery_date?: string | null
          activity_level: 'active' | 'sedentary'
          difficulty_level?: 'low' | 'general' | 'advanced'
          smart_knee_enabled?: boolean
          care_partner_name?: string | null
          care_partner_phone?: string | null
        }
        Update: {
          first_name?: string
          last_name?: string
          date_of_birth?: string
          surgery_type?: 'TKA' | 'THA'
          surgery_date?: string | null
          activity_level?: 'active' | 'sedentary'
          difficulty_level?: 'low' | 'general' | 'advanced'
          smart_knee_enabled?: boolean
          care_partner_name?: string | null
          care_partner_phone?: string | null
          updated_at?: string
        }
      }
      exercise_templates: {
        Row: {
          id: string
          exercise_number: number
          name: string
          type: 'motion' | 'strengthening' | 'stabilization' | 'functional'
          position: 'supine' | 'sitting' | 'standing' | 'prone' | null
          phases: string[]
          surgery_types: string[]
          difficulty_levels: string[]
          functional_goal: string | null
          instructions: string
          cues: string | null
          modifications: string | null
          video_url: string | null
          image_url: string | null
          repetitions: Record<string, string> | null
          holds: Record<string, string> | null
          frequency: Record<string, string> | null
          created_at: string
        }
        Insert: {
          id?: string
          exercise_number: number
          name: string
          type: 'motion' | 'strengthening' | 'stabilization' | 'functional'
          position?: 'supine' | 'sitting' | 'standing' | 'prone' | null
          phases: string[]
          surgery_types: string[]
          difficulty_levels: string[]
          functional_goal?: string | null
          instructions: string
          cues?: string | null
          modifications?: string | null
          video_url?: string | null
          image_url?: string | null
          repetitions?: Record<string, string> | null
          holds?: Record<string, string> | null
          frequency?: Record<string, string> | null
        }
        Update: {
          exercise_number?: number
          name?: string
          type?: 'motion' | 'strengthening' | 'stabilization' | 'functional'
          position?: 'supine' | 'sitting' | 'standing' | 'prone' | null
          phases?: string[]
          surgery_types?: string[]
          difficulty_levels?: string[]
          functional_goal?: string | null
          instructions?: string
          cues?: string | null
          modifications?: string | null
          video_url?: string | null
          image_url?: string | null
          repetitions?: Record<string, string> | null
          holds?: Record<string, string> | null
          frequency?: Record<string, string> | null
        }
      }
      // Add other table types...
    }
  }
}

// Application-specific types
export interface Patient extends Database['public']['Tables']['patients']['Row'] {}
export interface ExerciseTemplate extends Database['public']['Tables']['exercise_templates']['Row'] {}

export interface ExerciseSession {
  id: string
  patient_id: string
  exercise_id: string
  prescription_id: string | null
  completed_reps: number | null
  completed_sets: number | null
  hold_duration: number | null
  pain_before: number | null
  pain_after: number | null
  difficulty_rating: number | null
  notes: string | null
  completed_at: string
}

export interface DailyTask {
  id: string
  patient_id: string
  task_type: 'exercise' | 'activity' | 'self_care' | 'education' | 'monitoring'
  title: string
  description: string | null
  priority: 'high' | 'medium' | 'low'
  estimated_duration: number | null
  scheduled_date: string
  scheduled_time: string | null
  completed_at: string | null
  completion_status: 'pending' | 'completed' | 'skipped' | 'overdue'
  completion_data: Record<string, any> | null
  notes: string | null
  created_at: string
}

export interface CheckinResponse {
  pain_level: {
    current: number
    worst_today: number
    location: string
    triggers: string[]
  }
  sleep_quality: {
    hours_slept: number
    quality_rating: number
    sleep_position: string
    interruptions: string
  }
  mobility_status: {
    assistive_device: string
    walking_distance: string
    stairs_climbed: number
    independence_level: number
  }
  exercise_completion: {
    prescribed_exercises_done: number
    walking_completed: boolean
    duration_exercised: number
    difficulty_level: string
  }
  symptoms: {
    swelling: string
    stiffness: string
    numbness: string
    other_concerns: string
  }
  mood_energy: {
    mood_rating: number
    energy_level: number
    motivation: number
  }
}
```

### API Service Layer

```typescript
// services/api.ts
import { supabase } from '@/lib/supabase'
import { Patient, ExerciseTemplate, ExerciseSession, DailyTask, CheckinResponse } from '@/types/database'

export class PatientService {
  static async getPatient(userId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCurrentPhase(patientId: string): Promise<string> {
    const patient = await this.getPatient(patientId)
    if (!patient?.surgery_date) return 'pre'

    const surgeryDate = new Date(patient.surgery_date)
    const today = new Date()
    const daysSinceSurgery = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceSurgery < 0) return 'pre'
    if (daysSinceSurgery <= 7) return '1'
    if (daysSinceSurgery <= 21) return '2'
    if (daysSinceSurgery <= 42) return '3'
    if (daysSinceSurgery <= 84) return '4'
    return '5'
  }
}

export class ExerciseService {
  static async getPrescribedExercises(patientId: string): Promise<ExerciseTemplate[]> {
    const patient = await PatientService.getPatient(patientId)
    if (!patient) throw new Error('Patient not found')

    const currentPhase = await PatientService.getCurrentPhase(patientId)

    const { data, error } = await supabase
      .from('exercise_templates')
      .select('*')
      .contains('surgery_types', [patient.surgery_type])
      .contains('phases', [currentPhase])
      .contains('difficulty_levels', [patient.difficulty_level])
      .order('exercise_number')

    if (error) throw error
    return data
  }

  static async recordExerciseSession(session: Omit<ExerciseSession, 'id' | 'completed_at'>): Promise<ExerciseSession> {
    const { data, error } = await supabase
      .from('exercise_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getExerciseHistory(patientId: string, exerciseId?: string): Promise<ExerciseSession[]> {
    let query = supabase
      .from('exercise_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: false })

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
}

export class TaskService {
  static async getDailyTasks(patientId: string, date: string): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('patient_id', patientId)
      .eq('scheduled_date', date)
      .order('priority', { ascending: false })
      .order('scheduled_time', { ascending: true })

    if (error) throw error
    return data
  }

  static async completeTask(taskId: string, completionData?: Record<string, any>): Promise<DailyTask> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .update({
        completion_status: 'completed',
        completed_at: new Date().toISOString(),
        completion_data: completionData
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async generateDailyTasks(patientId: string, date: string): Promise<DailyTask[]> {
    const patient = await PatientService.getPatient(patientId)
    if (!patient) throw new Error('Patient not found')

    const currentPhase = await PatientService.getCurrentPhase(patientId)
    const tasks = await this.getTaskTemplatesForPhase(currentPhase, patient.surgery_type, patient.difficulty_level)

    const dailyTasks = tasks.map(template => ({
      patient_id: patientId,
      task_type: template.task_type,
      title: template.title,
      description: template.description,
      priority: template.priority,
      estimated_duration: template.estimated_duration,
      scheduled_date: date,
      scheduled_time: template.default_time,
      completion_status: 'pending' as const
    }))

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(dailyTasks)
      .select()

    if (error) throw error
    return data
  }

  private static async getTaskTemplatesForPhase(phase: string, surgeryType: string, difficultyLevel: string) {
    // This would typically come from a task_templates table
    // For now, return hardcoded templates based on phase
    const templates = {
      '1': [
        {
          task_type: 'monitoring' as const,
          title: 'Morning Pain Assessment',
          description: 'Rate your current pain level and identify any triggers',
          priority: 'high' as const,
          estimated_duration: 2,
          default_time: '08:00'
        },
        {
          task_type: 'exercise' as const,
          title: 'Ankle Pumps',
          description: 'Perform ankle pumps to improve circulation',
          priority: 'high' as const,
          estimated_duration: 5,
          default_time: '09:00'
        },
        {
          task_type: 'activity' as const,
          title: 'Walker-Assisted Walking',
          description: 'Short walking session with walker for 3-5 minutes',
          priority: 'medium' as const,
          estimated_duration: 10,
          default_time: '10:00'
        }
      ]
    }

    return templates[phase] || []
  }
}

export class CheckinService {
  static async submitDailyCheckin(patientId: string, responses: CheckinResponse): Promise<void> {
    const calculatedScores = this.calculateScores(responses)
    const flagsTriggered = this.checkAlertFlags(responses)

    const { error } = await supabase
      .from('patient_checkins')
      .insert({
        patient_id: patientId,
        checkin_type: 'daily',
        checkin_date: new Date().toISOString().split('T')[0],
        responses,
        calculated_scores: calculatedScores,
        flags_triggered: flagsTriggered
      })

    if (error) throw error

    // Trigger alerts if necessary
    if (flagsTriggered.length > 0) {
      await this.triggerAlerts(patientId, flagsTriggered)
    }
  }

  private static calculateScores(responses: CheckinResponse): Record<string, number> {
    return {
      overall_pain_score: (responses.pain_level.current + responses.pain_level.worst_today) / 2,
      mobility_score: responses.mobility_status.independence_level,
      exercise_compliance: responses.exercise_completion.prescribed_exercises_done,
      sleep_quality_score: responses.sleep_quality.quality_rating,
      mood_score: (responses.mood_energy.mood_rating + responses.mood_energy.energy_level + responses.mood_energy.motivation) / 3
    }
  }

  private static checkAlertFlags(responses: CheckinResponse): string[] {
    const flags: string[] = []

    if (responses.pain_level.current >= 8) {
      flags.push('high_pain_level')
    }

    if (responses.mobility_status.independence_level <= 2) {
      flags.push('low_mobility')
    }

    if (responses.exercise_completion.prescribed_exercises_done < 50) {
      flags.push('low_exercise_compliance')
    }

    if (responses.symptoms.swelling === 'severe' || responses.symptoms.stiffness === 'severe') {
      flags.push('severe_symptoms')
    }

    return flags
  }

  private static async triggerAlerts(patientId: string, flags: string[]): Promise<void> {
    // Implementation would send notifications to healthcare providers
    console.log(`Alerts triggered for patient ${patientId}:`, flags)
  }
}
```

## Frontend Implementation

### Next.js Web Application

```typescript
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PatientService, TaskService } from '@/services/api'
import { DailyTask, Patient } from '@/types/database'
import { TaskCard } from '@/components/TaskCard'
import { ProgressChart } from '@/components/ProgressChart'
import { CheckinModal } from '@/components/CheckinModal'

export default function DashboardPage() {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [showCheckin, setShowCheckin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPatientData()
    }
  }, [user])

  const loadPatientData = async () => {
    try {
      const patientData = await PatientService.getPatient(user.id)
      setPatient(patientData)

      if (patientData) {
        const today = new Date().toISOString().split('T')[0]
        const tasks = await TaskService.getDailyTasks(patientData.id, today)
        setDailyTasks(tasks)
      }
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId: string, completionData?: Record<string, any>) => {
    try {
      await TaskService.completeTask(taskId, completionData)
      await loadPatientData() // Refresh tasks
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!patient) {
    return <div>Patient not found</div>
  }

  const completedTasks = dailyTasks.filter(task => task.completion_status === 'completed')
  const pendingTasks = dailyTasks.filter(task => task.completion_status === 'pending')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {patient.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {patient.surgery_date 
            ? `Day ${Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))} of recovery`
            : 'Preparing for surgery'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Today's Tasks</h2>
              <button
                onClick={() => setShowCheckin(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Daily Check-in
              </button>
            </div>

            <div className="space-y-4">
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskComplete}
                />
              ))}
            </div>

            {pendingTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                All tasks completed for today! Great job! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Tasks Completed</span>
                  <span>{completedTasks.length}/{dailyTasks.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${dailyTasks.length > 0 ? (completedTasks.length / dailyTasks.length) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            <ProgressChart patientId={patient.id} />
          </div>
        </div>
      </div>

      {showCheckin && (
        <CheckinModal
          patientId={patient.id}
          onClose={() => setShowCheckin(false)}
          onComplete={() => {
            setShowCheckin(false)
            loadPatientData()
          }}
        />
      )}
    </div>
  )
}
```

### React Native Mobile App

```typescript
// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native'
import { useAuth } from '../hooks/useAuth'
import { PatientService, TaskService } from '../services/api'
import { DailyTask, Patient } from '../types/database'
import { TaskCard } from '../components/TaskCard'
import { ProgressChart } from '../components/ProgressChart'

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPatientData()
    }
  }, [user])

  const loadPatientData = async () => {
    try {
      const patientData = await PatientService.getPatient(user.id)
      setPatient(patientData)

      if (patientData) {
        const today = new Date().toISOString().split('T')[0]
        const tasks = await TaskService.getDailyTasks(patientData.id, today)
        setDailyTasks(tasks)
      }
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadPatientData()
  }

  const handleTaskComplete = async (taskId: string, completionData?: Record<string, any>) => {
    try {
      await TaskService.completeTask(taskId, completionData)
      await loadPatientData()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Text>Patient not found</Text>
      </View>
    )
  }

  const completedTasks = dailyTasks.filter(task => task.completion_status === 'completed')
  const pendingTasks = dailyTasks.filter(task => task.completion_status === 'pending')

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {patient.first_name}!
        </Text>
        <Text style={styles.dayText}>
          {patient.surgery_date 
            ? `Day ${Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))} of recovery`
            : 'Preparing for surgery'
          }
        </Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            {completedTasks.length}/{dailyTasks.length} tasks completed
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${dailyTasks.length > 0 ? (completedTasks.length / dailyTasks.length) * 100 : 0}%`
                }
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.tasksCard}>
        <Text style={styles.cardTitle}>Today's Tasks</Text>
        {pendingTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleTaskComplete}
          />
        ))}
        {pendingTasks.length === 0 && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>
              All tasks completed for today! Great job! 🎉
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Weekly Progress</Text>
        <ProgressChart patientId={patient.id} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  dayText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tasksCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333'
  },
  progressBar: {
    marginTop: 10
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4
  },
  completedContainer: {
    padding: 20,
    alignItems: 'center'
  },
  completedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
})
```

## Deployment Guide

### Environment Variables

```bash
# .env.local (for Next.js)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# For production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

### Mobile App Deployment

```typescript
// app.config.js (for Expo/React Native)
export default {
  expo: {
    name: "TJV Smart Recovery",
    slug: "tjv-smart-recovery",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tjv.smartrecovery"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.tjv.smartrecovery"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

## Security and Compliance

### HIPAA Compliance Checklist

- [ ] **Data Encryption**: All data encrypted in transit and at rest
- [ ] **Access Controls**: Role-based access with multi-factor authentication
- [ ] **Audit Logging**: Comprehensive logging of all data access and modifications
- [ ] **Data Backup**: Automated backups with point-in-time recovery
- [ ] **Business Associate Agreements**: Signed BAAs with all third-party services
- [ ] **Risk Assessment**: Regular security risk assessments and penetration testing
- [ ] **Staff Training**: HIPAA training for all team members
- [ ] **Incident Response**: Documented incident response procedures
- [ ] **Data Retention**: Policies for data retention and secure deletion
- [ ] **Patient Rights**: Mechanisms for patients to access, modify, and delete their data

### Security Implementation

```typescript
// middleware.ts (Next.js middleware for authentication)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect provider routes
  if (req.nextUrl.pathname.startsWith('/provider') && !session) {
    return NextResponse.redirect(new URL('/provider/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/provider/:path*']
}
```

This implementation guide provides developers with the comprehensive technical foundation needed to build the TJV Smart Recovery App. The modular architecture, type-safe APIs, and healthcare-compliant infrastructure ensure a scalable, secure, and maintainable solution for patient recovery management.

