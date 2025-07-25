-- Create patient_protocol_customizations table
CREATE TABLE IF NOT EXISTS public.patient_protocol_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Customization tracking
  is_customized BOOLEAN DEFAULT FALSE,
  base_protocol_id UUID REFERENCES protocols(id), -- Original protocol if cloned
  customization_reason TEXT,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  
  UNIQUE(patient_id, protocol_id)
);

-- Create patient_protocol_tasks for customized tasks
CREATE TABLE IF NOT EXISTS public.patient_protocol_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  original_task_id UUID REFERENCES protocol_tasks(id), -- Link to original task if modified
  
  -- Task details
  day INTEGER NOT NULL, -- Day relative to surgery (-45 to +200)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'video', 'form', 'exercise', 'assessment', 'medication', 'education')),
  content JSONB, -- Flexible content storage
  
  -- Task requirements
  required BOOLEAN DEFAULT TRUE,
  duration_minutes INTEGER,
  
  -- Recurring settings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB, -- Stores pattern like { "frequency": "daily", "interval": 1, "endDay": 30 }
  recurring_parent_id UUID REFERENCES patient_protocol_tasks(id), -- For linking recurring instances
  
  -- Form assignment
  form_template_id UUID REFERENCES form_templates(id),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  INDEX idx_patient_protocol_tasks_patient_day (patient_id, day),
  INDEX idx_patient_protocol_tasks_status (patient_id, status)
);

-- Create modification history table
CREATE TABLE IF NOT EXISTS public.patient_protocol_modifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  task_id UUID REFERENCES patient_protocol_tasks(id),
  
  -- Modification details
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder')),
  field_changed VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  provider_name VARCHAR(255),
  provider_role VARCHAR(50)
);

-- Create task library table
CREATE TABLE IF NOT EXISTS public.task_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Task template details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'video', 'form', 'exercise', 'assessment', 'medication', 'education')),
  content JSONB,
  duration_minutes INTEGER,
  
  -- Medical categorization
  surgery_types TEXT[], -- Array of applicable surgery types
  recovery_phase VARCHAR(50), -- pre-op, immediate-post-op, early-recovery, late-recovery
  difficulty_level VARCHAR(20), -- easy, moderate, hard
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX idx_patient_protocol_customizations_patient ON patient_protocol_customizations(patient_id);
CREATE INDEX idx_patient_protocol_modifications_patient ON patient_protocol_modifications(patient_id);
CREATE INDEX idx_task_library_category ON task_library(category);
CREATE INDEX idx_task_library_surgery_types ON task_library USING GIN(surgery_types);

-- Add RLS policies
ALTER TABLE patient_protocol_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocol_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocol_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_library ENABLE ROW LEVEL SECURITY;

-- Providers can view and modify their patients' protocols
CREATE POLICY "Providers can manage patient protocols" ON patient_protocol_customizations
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE surgeon_id = auth.uid() 
        OR primary_nurse_id = auth.uid() 
        OR physical_therapist_id = auth.uid()
    )
  );

CREATE POLICY "Providers can manage patient tasks" ON patient_protocol_tasks
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE surgeon_id = auth.uid() 
        OR primary_nurse_id = auth.uid() 
        OR physical_therapist_id = auth.uid()
    )
  );

-- All authenticated users can view modification history
CREATE POLICY "View modification history" ON patient_protocol_modifications
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only providers can create modifications
CREATE POLICY "Create modifications" ON patient_protocol_modifications
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients 
      WHERE surgeon_id = auth.uid() 
        OR primary_nurse_id = auth.uid() 
        OR physical_therapist_id = auth.uid()
    )
  );

-- Task library is viewable by all authenticated users in the tenant
CREATE POLICY "View task library" ON task_library
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenant_associations 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can modify task library
CREATE POLICY "Manage task library" ON task_library
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_tenant_associations 
      WHERE user_id = auth.uid() 
        AND tenant_id = task_library.tenant_id 
        AND role = 'admin'
    )
  );

-- Create function to track modifications
CREATE OR REPLACE FUNCTION track_protocol_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO patient_protocol_modifications (
      patient_id,
      protocol_id,
      task_id,
      action,
      field_changed,
      old_value,
      new_value,
      created_by
    )
    SELECT 
      NEW.patient_id,
      NEW.protocol_id,
      NEW.id,
      'update',
      key,
      to_jsonb(old_value),
      to_jsonb(new_value),
      auth.uid()
    FROM jsonb_each_text(to_jsonb(OLD)) old_data(key, old_value)
    JOIN jsonb_each_text(to_jsonb(NEW)) new_data(key, new_value) 
      ON old_data.key = new_data.key
    WHERE old_data.value IS DISTINCT FROM new_data.value
      AND old_data.key NOT IN ('updated_at', 'created_at');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tracking modifications
CREATE TRIGGER track_patient_task_modifications
  AFTER UPDATE ON patient_protocol_tasks
  FOR EACH ROW
  EXECUTE FUNCTION track_protocol_modification();

-- Function to clone protocol for patient customization
CREATE OR REPLACE FUNCTION clone_protocol_for_patient(
  p_patient_id UUID,
  p_protocol_id UUID,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_new_protocol_id UUID;
BEGIN
  -- Create customization record
  INSERT INTO patient_protocol_customizations (
    patient_id,
    protocol_id,
    is_customized,
    base_protocol_id,
    created_by
  )
  VALUES (
    p_patient_id,
    p_protocol_id,
    TRUE,
    p_protocol_id,
    p_created_by
  )
  ON CONFLICT (patient_id, protocol_id) 
  DO UPDATE SET 
    is_customized = TRUE,
    updated_at = NOW();
  
  -- Copy all protocol tasks to patient-specific tasks
  INSERT INTO patient_protocol_tasks (
    patient_id,
    protocol_id,
    original_task_id,
    day,
    name,
    description,
    type,
    content,
    required,
    duration_minutes,
    created_by
  )
  SELECT 
    p_patient_id,
    p_protocol_id,
    pt.id,
    pt.day_offset,
    pt.name,
    pt.description,
    CASE 
      WHEN pt.category = 'exercise' THEN 'exercise'
      WHEN pt.category = 'assessment' THEN 'assessment'
      WHEN pt.category = 'medication' THEN 'medication'
      WHEN pt.category = 'education' THEN 'education'
      ELSE 'message'
    END,
    jsonb_build_object(
      'instructions', pt.instructions,
      'category', pt.category
    ),
    pt.required,
    pt.duration_minutes,
    p_created_by
  FROM protocol_tasks pt
  WHERE pt.protocol_id = p_protocol_id;
  
  RETURN p_protocol_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;