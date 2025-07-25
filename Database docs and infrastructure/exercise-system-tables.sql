-- =====================================================
-- EXERCISE SYSTEM TABLES AND SEED DATA
-- TJV Recovery Platform - Comprehensive Exercise Management
-- =====================================================

-- =====================================================
-- 1. EXERCISE CATEGORIES AND TYPES
-- =====================================================

-- Exercise categories for organization and filtering
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon identifier for UI
  color_code TEXT, -- Hex color for category
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name)
);

-- Exercise library with comprehensive metadata
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES exercise_categories(id) ON DELETE SET NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  
  -- Exercise Classification
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('strength', 'flexibility', 'range_of_motion', 'balance', 'endurance', 'functional')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'], -- Which surgeries this applies to
  recovery_phases TEXT[] DEFAULT ARRAY['immediate', 'early', 'intermediate', 'advanced', 'maintenance'],
  
  -- Exercise Parameters
  default_duration_minutes INTEGER, -- Default duration in minutes
  default_repetitions INTEGER, -- Default number of reps
  default_sets INTEGER, -- Default number of sets
  default_hold_seconds INTEGER, -- Default hold time for static exercises
  
  -- Media and Resources
  video_url TEXT, -- Primary exercise video