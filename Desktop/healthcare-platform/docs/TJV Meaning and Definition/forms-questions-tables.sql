-- =====================================================
-- FORMS AND QUESTIONS SYSTEM TABLES
-- TJV Recovery Platform - Comprehensive Form Management
-- =====================================================

-- =====================================================
-- 1. FORM TEMPLATES AND STRUCTURE
-- =====================================================

-- Form templates for different types of questionnaires
CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Template Information
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('pre_surgery', 'post_surgery', 'daily_checkin', 'assessment', 'consent', 'clearance')),
  category TEXT, -- medical_history, medications, symptoms, etc.
  
  -- Form Configuration
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false, -- Can be used as template for other tenants
  
  -- Conditional Logic
  surgery_types TEXT[] DEFAULT ARRAY['TKA', 'THA'], -- Which surgeries this applies to
  patient_criteria JSONB, -- Conditions for when this form should be presented
  
  -- Form Behavior
  allow_partial_completion BOOLEAN DEFAULT true,
  auto_save_enabled BOOLEAN DEFAULT true,
  voice_input_enabled BOOLEAN DEFAULT true,
  image_upload_enabled BOOLEAN DEFAULT false,
  
  -- Clinical Information
  clinical_purpose TEXT,
  completion_time_estimate INTEGER, -- Estimated minutes to complete
  medical_terminology_level TEXT DEFAULT 'patient_friendly' CHECK (medical_terminology_level IN ('clinical', 'patient_friendly', 'simplified')),
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approval_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name, version)
);

-- Form sections for organizing questions
CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  
  -- Section Information
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Section Configuration
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  
  -- Conditional Display
  display_conditions JSONB, -- Conditions for when this section should be shown
  
  -- Section Behavior
  allow_skip BOOLEAN DEFAULT false,
  completion_required BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(form_template_id, sort_order)
);

-- =====================================================
-- 2. QUESTION LIBRARY AND TYPES
-- =====================================================

-- Comprehensive question library
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Question Content
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'text', 'textarea', 'number', 'date', 'time', 'datetime',
    'single_choice', 'multiple_choice', 'yes_no', 'scale',
    'file_upload', 'image_upload', 'voice_recording',
    'medication_search', 'condition_search', 'pain_scale'
  )),
  
  -- Question Configuration
  is_required BOOLEAN DEFAULT false,
  placeholder_text TEXT,
  help_text TEXT,
  medical_definition TEXT, -- Explanation of medical terms
  
  -- Validation Rules
  validation_rules JSONB, -- Min/max values, patterns, etc.
  error_message TEXT,
  
  -- Question Options (for choice questions)
  options JSONB, -- Array of options for choice questions
  
  -- Conditional Logic
  display_conditions JSONB, -- When this question should be shown
  skip_conditions JSONB, -- When this question should be skipped
  
  -- Voice and Accessibility
  voice_prompt TEXT, -- How the question should be read aloud
  voice_response_type TEXT DEFAULT 'any' CHECK (voice_response_type IN ('any', 'yes_no', 'number', 'choice')),
  accessibility_notes TEXT,
  
  -- Clinical Information
  clinical_significance TEXT,
  icd_10_codes TEXT[], -- Related ICD-10 codes
  clinical_alerts JSONB, -- Conditions that should trigger alerts
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions within form sections
CREATE TABLE section_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES form_sections(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Question Placement
  sort_order INTEGER DEFAULT 0,
  
  -- Section-Specific Overrides
  is_required_override BOOLEAN, -- Override question's default required setting
  custom_help_text TEXT, -- Section-specific help text
  custom_validation JSONB, -- Additional validation for this context
  
  -- Conditional Logic
  display_conditions JSONB, -- Section-specific display conditions
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(section_id, sort_order),
  UNIQUE(section_id, question_id)
);

-- =====================================================
-- 3. PATIENT FORM INSTANCES AND RESPONSES
-- =====================================================

-- Patient-specific form instances
CREATE TABLE patient_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  
  -- Form Instance Information
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Completion Status
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'submitted', 'reviewed', 'approved')),
  completion_percentage INTEGER DEFAULT 0,
  
  -- Form Data
  responses JSONB DEFAULT '{}', -- All form responses
  metadata JSONB DEFAULT '{}', -- Form-specific metadata
  
  -- Clinical Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  clinical_notes TEXT,
  requires_followup BOOLEAN DEFAULT false,
  followup_notes TEXT,
  
  -- Submission Information
  submitted_by UUID REFERENCES profiles(id), -- Usually the patient
  submission_method TEXT DEFAULT 'chat' CHECK (submission_method IN ('chat', 'web', 'mobile', 'voice', 'assisted')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(patient_id, form_template_id, assigned_date)
);

-- Individual question responses
CREATE TABLE question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_form_id UUID REFERENCES patient_forms(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(user_id) ON DELETE CASCADE,
  
  -- Response Content
  response_text TEXT,
  response_number DECIMAL,
  response_date DATE,
  response_time TIME,
  response_datetime TIMESTAMPTZ,
  response_boolean BOOLEAN,
  response_json JSONB, -- For complex responses (multiple choice, etc.)
  
  -- File Uploads
  file_urls TEXT[], -- Uploaded files
  image_urls TEXT[], -- Uploaded images
  audio_url TEXT, -- Voice recordings
  
  -- Response Metadata
  response_method TEXT DEFAULT 'text' CHECK (response_method IN ('text', 'voice', 'selection', 'upload', 'scan')),
  confidence_score DECIMAL, -- For voice recognition
  
  -- Clinical Processing
  requires_review BOOLEAN DEFAULT false,
  clinical_flags TEXT[], -- Any clinical concerns identified
  auto_processed BOOLEAN DEFAULT false,
  
  -- Timing Information
  time_to_respond_seconds INTEGER, -- How long patient took to answer
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(patient_form_id, question_id)
);

-- =====================================================
-- 4. MEDICAL REFERENCE DATA
-- =====================================================

-- Medical conditions database
CREATE TABLE medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Condition Information
  name TEXT NOT NULL,
  icd_10_code TEXT,
  description TEXT,
  category TEXT, -- cardiovascular, respiratory, etc.
  
  -- Clinical Information
  severity_levels TEXT[], -- mild, moderate, severe
  common_symptoms TEXT[],
  surgical_implications TEXT,
  
  -- Search and Matching
  synonyms TEXT[], -- Alternative names
  search_keywords TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(icd_10_code)
);

-- Medications database
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Medication Information
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_names TEXT[],
  drug_class TEXT,
  
  -- Clinical Information
  common_dosages TEXT[],
  administration_routes TEXT[], -- oral, injection, topical, etc.
  surgical_considerations TEXT,
  preop_instructions TEXT, -- Stop X days before surgery, etc.
  
  -- Drug Interactions
  contraindications TEXT[],
  interactions JSONB, -- Drug interaction data
  
  -- Search and Matching
  synonyms TEXT[],
  search_keywords TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(name)
);

-- =====================================================
-- 5. FORM ANALYTICS AND TRACKING
-- =====================================================

-- Form completion analytics
CREATE TABLE form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  
  -- Analytics Period
  date DATE DEFAULT CURRENT_DATE,
  
  -- Completion Metrics
  forms_assigned INTEGER DEFAULT 0,
  forms_started INTEGER DEFAULT 0,
  forms_completed INTEGER DEFAULT 0,
  average_completion_time_minutes INTEGER,
  
  -- Question Metrics
  most_skipped_questions JSONB,
  questions_requiring_help JSONB,
  voice_usage_percentage DECIMAL,
  
  -- Clinical Metrics
  forms_requiring_review INTEGER DEFAULT 0,
  clinical_flags_triggered INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, form_template_id, date)
);

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Form system indexes
CREATE INDEX idx_form_templates_tenant_type ON form_templates(tenant_id, form_type);
CREATE INDEX idx_form_templates_surgery_types ON form_templates USING GIN(surgery_types);

CREATE INDEX idx_questions_tenant_type ON questions(tenant_id, question_type);
CREATE INDEX idx_questions_clinical_codes ON questions USING GIN(icd_10_codes);

CREATE INDEX idx_patient_forms_patient_status ON patient_forms(patient_id, status);
CREATE INDEX idx_patient_forms_completion ON patient_forms(completed_at, status);

CREATE INDEX idx_question_responses_patient_form ON question_responses(patient_form_id, question_id);
CREATE INDEX idx_question_responses_clinical_flags ON question_responses USING GIN(clinical_flags);

CREATE INDEX idx_medical_conditions_search ON medical_conditions USING GIN(search_keywords);
CREATE INDEX idx_medications_search ON medications USING GIN(search_keywords);

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all form tables
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;

-- Form Templates Policies
CREATE POLICY "Users can view form templates in their tenant" ON form_templates
  FOR SELECT USING (tenant_id IN (SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Providers can manage form templates in their tenant" ON form_templates
  FOR ALL USING (
    tenant_id IN (SELECT unnest(accessible_tenants) FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse'))
  );

-- Patient Forms Policies
CREATE POLICY "Patients can view their own forms" ON patient_forms
  FOR SELECT USING (
    patient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

CREATE POLICY "Patients can update their own forms" ON patient_forms
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Providers can manage patient forms in their tenant" ON patient_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

-- Question Responses Policies
CREATE POLICY "Patients can manage their own responses" ON question_responses
  FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Providers can view responses in their tenant" ON question_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN patients pt ON pt.user_id = patient_id
      WHERE p.id = auth.uid()
      AND p.tenant_id = pt.tenant_id
      AND p.role IN ('practice_admin', 'clinic_admin', 'surgeon', 'nurse', 'physical_therapist')
    )
  );

-- Medical Reference Data Policies (public read access)
CREATE POLICY "All users can view medical conditions" ON medical_conditions FOR SELECT USING (true);
CREATE POLICY "All users can view medications" ON medications FOR SELECT USING (true);

-- =====================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update form completion percentage
CREATE OR REPLACE FUNCTION update_form_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_questions INTEGER;
  answered_questions INTEGER;
  completion_pct INTEGER;
BEGIN
  -- Count total required questions in the form
  SELECT COUNT(DISTINCT sq.question_id) INTO total_questions
  FROM section_questions sq
  JOIN form_sections fs ON sq.section_id = fs.id
  JOIN questions q ON sq.question_id = q.id
  WHERE fs.form_template_id = (SELECT form_template_id FROM patient_forms WHERE id = NEW.patient_form_id)
  AND (q.is_required = true OR sq.is_required_override = true);
  
  -- Count answered required questions
  SELECT COUNT(*) INTO answered_questions
  FROM question_responses qr
  JOIN questions q ON qr.question_id = q.id
  JOIN section_questions sq ON q.id = sq.question_id
  JOIN form_sections fs ON sq.section_id = fs.id
  WHERE qr.patient_form_id = NEW.patient_form_id
  AND (q.is_required = true OR sq.is_required_override = true)
  AND (
    qr.response_text IS NOT NULL OR
    qr.response_number IS NOT NULL OR
    qr.response_date IS NOT NULL OR
    qr.response_boolean IS NOT NULL OR
    qr.response_json IS NOT NULL
  );
  
  -- Calculate completion percentage
  IF total_questions > 0 THEN
    completion_pct := (answered_questions * 100) / total_questions;
  ELSE
    completion_pct := 100;
  END IF;
  
  -- Update patient form
  UPDATE patient_forms 
  SET 
    completion_percentage = completion_pct,
    status = CASE 
      WHEN completion_pct = 100 THEN 'completed'
      WHEN completion_pct > 0 THEN 'in_progress'
      ELSE 'assigned'
    END,
    completed_at = CASE 
      WHEN completion_pct = 100 AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END,
    updated_at = NOW()
  WHERE id = NEW.patient_form_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for form completion updates
CREATE TRIGGER trigger_update_form_completion
  AFTER INSERT OR UPDATE ON question_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_form_completion_percentage();

-- Function to check for clinical alerts
CREATE OR REPLACE FUNCTION check_clinical_alerts()
RETURNS TRIGGER AS $$
DECLARE
  question_rec RECORD;
  alert_conditions JSONB;
  requires_review BOOLEAN := false;
  clinical_flags TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get question details
  SELECT * INTO question_rec FROM questions WHERE id = NEW.question_id;
  
  -- Check for clinical alerts based on question configuration
  IF question_rec.clinical_alerts IS NOT NULL THEN
    alert_conditions := question_rec.clinical_alerts;
    
    -- Example alert checks (can be expanded)
    IF alert_conditions ? 'pain_threshold' THEN
      IF NEW.response_number >= (alert_conditions->>'pain_threshold')::INTEGER THEN
        requires_review := true;
        clinical_flags := array_append(clinical_flags, 'high_pain_level');
      END IF;
    END IF;
    
    IF alert_conditions ? 'concerning_responses' THEN
      IF NEW.response_text = ANY(ARRAY(SELECT jsonb_array_elements_text(alert_conditions->'concerning_responses'))) THEN
        requires_review := true;
        clinical_flags := array_append(clinical_flags, 'concerning_response');
      END IF;
    END IF;
  END IF;
  
  -- Update response with clinical flags
  NEW.requires_review := requires_review;
  NEW.clinical_flags := clinical_flags;
  
  -- Update patient form if review is required
  IF requires_review THEN
    UPDATE patient_forms 
    SET requires_followup = true
    WHERE id = NEW.patient_form_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for clinical alert checking
CREATE TRIGGER trigger_check_clinical_alerts
  BEFORE INSERT OR UPDATE ON question_responses
  FOR EACH ROW
  EXECUTE FUNCTION check_clinical_alerts();

