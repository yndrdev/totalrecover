-- AI-Powered Forms System Migration
-- Creates comprehensive schema for intelligent form upload, conversion, and completion

-- Forms table for uploaded forms and metadata
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('pre_op', 'post_op', 'assessment', 'medical_history', 'physical_therapy', 'insurance', 'administrative', 'other')),
    original_file_url TEXT NOT NULL,
    original_file_type VARCHAR(20) NOT NULL CHECK (original_file_type IN ('pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png')),
    file_size_bytes INTEGER,
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    ai_processing_metadata JSONB DEFAULT '{}',
    requirements TEXT,
    created_by UUID REFERENCES auth.users(id),
    practice_id UUID REFERENCES practices(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Form fields extracted by AI from uploaded forms
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_label TEXT NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'radio', 'checkbox', 'signature', 'email', 'phone')),
    field_options JSONB DEFAULT '{}', -- For select/radio options
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}',
    display_order INTEGER NOT NULL,
    conversational_prompt TEXT, -- AI-generated chat prompt for this field
    conditional_logic JSONB DEFAULT '{}', -- Logic for showing/hiding fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form assignments to patients for specific days
CREATE TABLE form_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_for_day INTEGER NOT NULL, -- Recovery day
    protocol_task_id UUID REFERENCES patient_protocol_tasks(id),
    assignment_status VARCHAR(50) DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'in_progress', 'completed', 'expired')),
    due_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    ai_conversation_id UUID, -- Link to chat conversation
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient responses captured from chat conversations
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_assignment_id UUID REFERENCES form_assignments(id) ON DELETE CASCADE,
    form_field_id UUID REFERENCES form_fields(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    response_value TEXT,
    response_type VARCHAR(50), -- Type of response (text, number, date, etc.)
    confidence_score DECIMAL(3,2), -- AI confidence in response extraction
    chat_message_id UUID, -- Reference to original chat message
    needs_clarification BOOLEAN DEFAULT false,
    clarification_requested TEXT,
    response_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completed forms generated from chat responses
CREATE TABLE completed_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_assignment_id UUID REFERENCES form_assignments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    completed_form_url TEXT, -- PDF/document with filled responses
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    ai_completion_summary JSONB DEFAULT '{}',
    digital_signature_url TEXT,
    signature_timestamp TIMESTAMP WITH TIME ZONE,
    provider_reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversation flows for form completion
CREATE TABLE form_conversation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    flow_name VARCHAR(255) NOT NULL,
    conversation_script JSONB NOT NULL, -- AI conversation flow definition
    personality_traits JSONB DEFAULT '{}', -- AI agent personality for this form
    language_preferences JSONB DEFAULT '{}',
    validation_prompts JSONB DEFAULT '{}',
    completion_messages JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form templates library for common healthcare forms
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(100) NOT NULL,
    template_description TEXT,
    template_fields JSONB NOT NULL, -- Predefined field structure
    conversation_flow JSONB, -- Default conversation flow
    is_system_template BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    practice_id UUID REFERENCES practices(id),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form processing jobs for AI analysis
CREATE TABLE form_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('field_extraction', 'conversation_generation', 'validation_setup')),
    job_status VARCHAR(50) DEFAULT 'queued' CHECK (job_status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    job_parameters JSONB DEFAULT '{}',
    job_results JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_forms_category ON forms(category);
CREATE INDEX idx_forms_practice_id ON forms(practice_id);
CREATE INDEX idx_forms_processing_status ON forms(processing_status);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_display_order ON form_fields(form_id, display_order);
CREATE INDEX idx_form_assignments_patient_id ON form_assignments(patient_id);
CREATE INDEX idx_form_assignments_status ON form_assignments(assignment_status);
CREATE INDEX idx_form_assignments_day ON form_assignments(assigned_for_day);
CREATE INDEX idx_form_responses_assignment_id ON form_responses(form_assignment_id);
CREATE INDEX idx_form_responses_patient_id ON form_responses(patient_id);
CREATE INDEX idx_completed_forms_patient_id ON completed_forms(patient_id);
CREATE INDEX idx_completed_forms_reviewed ON completed_forms(provider_reviewed);
CREATE INDEX idx_form_processing_jobs_status ON form_processing_jobs(job_status);

-- Row Level Security (RLS) policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined based on specific requirements)
CREATE POLICY "Users can view forms for their practice" ON forms
    FOR SELECT USING (
        practice_id IN (
            SELECT practice_id FROM user_practice_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can manage forms for their practice" ON forms
    FOR ALL USING (
        practice_id IN (
            SELECT practice_id FROM user_practice_roles 
            WHERE user_id = auth.uid() AND role IN ('provider', 'admin')
        )
    );

-- Similar policies for other tables (abbreviated for brevity)
CREATE POLICY "Users can view form assignments for their patients" ON form_assignments
    FOR SELECT USING (
        patient_id IN (
            SELECT p.id FROM patients p
            JOIN user_practice_roles upr ON p.practice_id = upr.practice_id
            WHERE upr.user_id = auth.uid()
        )
    );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_assignments_updated_at BEFORE UPDATE ON form_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at BEFORE UPDATE ON form_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_forms_updated_at BEFORE UPDATE ON completed_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_conversation_flows_updated_at BEFORE UPDATE ON form_conversation_flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample form templates
INSERT INTO form_templates (template_name, template_category, template_description, template_fields, conversation_flow, is_system_template) VALUES
('Pre-Operative Assessment', 'pre_op', 'Standard pre-operative patient assessment form', 
'{
  "fields": [
    {"name": "medical_history", "label": "Medical History", "type": "textarea", "required": true},
    {"name": "current_medications", "label": "Current Medications", "type": "textarea", "required": true},
    {"name": "allergies", "label": "Known Allergies", "type": "textarea", "required": true},
    {"name": "emergency_contact", "label": "Emergency Contact", "type": "text", "required": true},
    {"name": "insurance_info", "label": "Insurance Information", "type": "text", "required": true}
  ]
}',
'{
  "introduction": "Hi! I need to collect some important information before your surgery. This should only take a few minutes.",
  "completion_message": "Thank you! Your pre-operative assessment is complete."
}',
true),

('Post-Operative Pain Assessment', 'post_op', 'Pain level and recovery tracking form', 
'{
  "fields": [
    {"name": "pain_level", "label": "Pain Level (1-10)", "type": "number", "required": true, "min": 1, "max": 10},
    {"name": "pain_location", "label": "Pain Location", "type": "text", "required": true},
    {"name": "medication_taken", "label": "Pain Medication Taken", "type": "text", "required": false},
    {"name": "mobility_level", "label": "Mobility Level", "type": "select", "options": ["Limited", "Moderate", "Good"], "required": true},
    {"name": "additional_concerns", "label": "Additional Concerns", "type": "textarea", "required": false}
  ]
}',
'{
  "introduction": "Let me check on your recovery progress today. How are you feeling?",
  "completion_message": "Thanks for the update! Your care team will review this information."
}',
true),

('Physical Therapy Evaluation', 'physical_therapy', 'PT assessment and progress tracking', 
'{
  "fields": [
    {"name": "range_of_motion", "label": "Range of Motion (degrees)", "type": "number", "required": true},
    {"name": "exercise_completion", "label": "Exercise Completion (%)", "type": "number", "required": true, "min": 0, "max": 100},
    {"name": "difficulty_level", "label": "Exercise Difficulty", "type": "select", "options": ["Too Easy", "Just Right", "Too Difficult"], "required": true},
    {"name": "therapist_notes", "label": "Therapist Notes", "type": "textarea", "required": false}
  ]
}',
'{
  "introduction": "Time for your physical therapy check-in! Let me know how your exercises are going.",
  "completion_message": "Great work! Keep up the excellent progress with your therapy."
}',
true);

COMMENT ON TABLE forms IS 'Stores uploaded medical forms and their metadata for AI processing';
COMMENT ON TABLE form_fields IS 'AI-extracted field structure from uploaded forms';
COMMENT ON TABLE form_assignments IS 'Forms assigned to patients for specific recovery days';
COMMENT ON TABLE form_responses IS 'Patient responses captured from chat conversations';
COMMENT ON TABLE completed_forms IS 'Generated completed forms with patient responses';
COMMENT ON TABLE form_conversation_flows IS 'AI conversation scripts for form completion';
COMMENT ON TABLE form_templates IS 'Reusable form templates for common healthcare forms';
COMMENT ON TABLE form_processing_jobs IS 'Background job tracking for AI form processing';