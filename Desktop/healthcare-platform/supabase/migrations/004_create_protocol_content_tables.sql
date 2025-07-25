-- =============================================
-- Protocol and Content Tables
-- =============================================

-- =============================================
-- PROTOCOLS TABLE - Clinical protocols from the protocol builder
-- =============================================
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    surgery_types TEXT[] DEFAULT '{}', -- Array of surgery types (TKA, THA, etc.)
    activity_levels TEXT[] DEFAULT '{}', -- Array of activity levels (active, sedentary)
    timeline_start INTEGER DEFAULT -45, -- Days before surgery (negative values)
    timeline_end INTEGER DEFAULT 200, -- Days after surgery
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_draft BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to protocols
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROTOCOL_TASKS TABLE - Individual timeline tasks within protocols
-- =============================================
CREATE TABLE protocol_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    day INTEGER NOT NULL, -- Day in timeline (can be negative for pre-surgery)
    type TEXT CHECK (type IN ('form', 'exercise', 'video', 'message')) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    required BOOLEAN DEFAULT TRUE,
    duration TEXT, -- Duration estimate (e.g., "5 minutes", "10-15 minutes")
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    frequency JSONB DEFAULT '{}', -- Frequency settings: {type: 'daily', repeat: true}
    dependencies TEXT[] DEFAULT '{}', -- Array of protocol_task IDs this depends on
    triggers JSONB[] DEFAULT '{}', -- Array of trigger conditions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to protocol_tasks
CREATE TRIGGER update_protocol_tasks_updated_at BEFORE UPDATE ON protocol_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PATIENT_PROTOCOLS TABLE - Protocol assignments to patients
-- =============================================
CREATE TABLE patient_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    surgery_date DATE NOT NULL,
    surgery_type TEXT NOT NULL,
    assigned_by UUID NOT NULL REFERENCES users(id),
    status protocol_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}', -- Additional assignment metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),  
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, protocol_id) -- One active protocol per patient
);

-- Add updated_at trigger to patient_protocols
CREATE TRIGGER update_patient_protocols_updated_at BEFORE UPDATE ON patient_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PATIENT_TASKS TABLE - Individual task assignments with completion tracking
-- =============================================
CREATE TABLE patient_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_protocol_id UUID NOT NULL REFERENCES patient_protocols(id) ON DELETE CASCADE,
    protocol_task_id UUID NOT NULL REFERENCES protocol_tasks(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    due_date DATE,
    status task_status DEFAULT 'pending',
    completion_date TIMESTAMPTZ,
    response_data JSONB, -- Form responses, exercise completion data, etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to patient_tasks
CREATE TRIGGER update_patient_tasks_updated_at BEFORE UPDATE ON patient_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTENT_VIDEOS TABLE - Educational video content library
-- =============================================
CREATE TABLE content_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- education, exercise, preparation, etc.
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT, -- Duration string (e.g., "5:30")
    tags TEXT[] DEFAULT '{}',
    phase TEXT, -- pre-op, post-op, recovery, etc.
    surgery_types TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to content_videos
CREATE TRIGGER update_content_videos_updated_at BEFORE UPDATE ON content_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTENT_FORMS TABLE - Dynamic form definitions
-- =============================================
CREATE TABLE content_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- assessment, intake, follow-up, etc.
    form_schema JSONB NOT NULL, -- JSON schema defining form fields
    estimated_time TEXT, -- Estimated completion time
    phase TEXT, -- pre-op, post-op, recovery, etc.
    surgery_types TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to content_forms
CREATE TRIGGER update_content_forms_updated_at BEFORE UPDATE ON content_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTENT_EXERCISES TABLE - Physical therapy exercise library
-- =============================================
CREATE TABLE content_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- strengthening, flexibility, balance, etc.
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration TEXT, -- Duration estimate
    instructions TEXT NOT NULL,
    body_parts TEXT[] DEFAULT '{}', -- Array of body parts targeted
    phase TEXT, -- pre-op, post-op, recovery, etc.
    surgery_types TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    video_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger to content_exercises
CREATE TRIGGER update_content_exercises_updated_at BEFORE UPDATE ON content_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Protocol/Content Tables
-- =============================================

-- Protocols indexes
CREATE INDEX idx_protocols_tenant_id ON protocols(tenant_id);
CREATE INDEX idx_protocols_is_active ON protocols(is_active);
CREATE INDEX idx_protocols_is_draft ON protocols(is_draft);
CREATE INDEX idx_protocols_created_by ON protocols(created_by);
CREATE INDEX idx_protocols_surgery_types ON protocols USING GIN(surgery_types);

-- Protocol_tasks indexes
CREATE INDEX idx_protocol_tasks_protocol_id ON protocol_tasks(protocol_id);
CREATE INDEX idx_protocol_tasks_day ON protocol_tasks(day);
CREATE INDEX idx_protocol_tasks_type ON protocol_tasks(type);
CREATE INDEX idx_protocol_tasks_required ON protocol_tasks(required);

-- Patient_protocols indexes
CREATE INDEX idx_patient_protocols_patient_id ON patient_protocols(patient_id);
CREATE INDEX idx_patient_protocols_protocol_id ON patient_protocols(protocol_id);
CREATE INDEX idx_patient_protocols_surgery_date ON patient_protocols(surgery_date);
CREATE INDEX idx_patient_protocols_status ON patient_protocols(status);
CREATE INDEX idx_patient_protocols_assigned_by ON patient_protocols(assigned_by);

-- Patient_tasks indexes
CREATE INDEX idx_patient_tasks_patient_protocol_id ON patient_tasks(patient_protocol_id);
CREATE INDEX idx_patient_tasks_protocol_task_id ON patient_tasks(protocol_task_id);
CREATE INDEX idx_patient_tasks_patient_id ON patient_tasks(patient_id);
CREATE INDEX idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX idx_patient_tasks_status ON patient_tasks(status);
CREATE INDEX idx_patient_tasks_completion_date ON patient_tasks(completion_date);

-- Content_videos indexes
CREATE INDEX idx_content_videos_tenant_id ON content_videos(tenant_id);
CREATE INDEX idx_content_videos_category ON content_videos(category);
CREATE INDEX idx_content_videos_is_active ON content_videos(is_active);
CREATE INDEX idx_content_videos_phase ON content_videos(phase);
CREATE INDEX idx_content_videos_surgery_types ON content_videos USING GIN(surgery_types);
CREATE INDEX idx_content_videos_tags ON content_videos USING GIN(tags);

-- Content_forms indexes
CREATE INDEX idx_content_forms_tenant_id ON content_forms(tenant_id);
CREATE INDEX idx_content_forms_category ON content_forms(category);
CREATE INDEX idx_content_forms_is_active ON content_forms(is_active);
CREATE INDEX idx_content_forms_phase ON content_forms(phase);
CREATE INDEX idx_content_forms_surgery_types ON content_forms USING GIN(surgery_types);
CREATE INDEX idx_content_forms_tags ON content_forms USING GIN(tags);

-- Content_exercises indexes
CREATE INDEX idx_content_exercises_tenant_id ON content_exercises(tenant_id);
CREATE INDEX idx_content_exercises_category ON content_exercises(category);
CREATE INDEX idx_content_exercises_difficulty ON content_exercises(difficulty);
CREATE INDEX idx_content_exercises_is_active ON content_exercises(is_active);
CREATE INDEX idx_content_exercises_phase ON content_exercises(phase);
CREATE INDEX idx_content_exercises_surgery_types ON content_exercises USING GIN(surgery_types);
CREATE INDEX idx_content_exercises_body_parts ON content_exercises USING GIN(body_parts);
CREATE INDEX idx_content_exercises_tags ON content_exercises USING GIN(tags);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all protocol/content tables
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_exercises ENABLE ROW LEVEL SECURITY;

-- Protocols RLS Policies
CREATE POLICY "Users can view protocols in their tenant" ON protocols
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Providers and admins can manage protocols in their tenant" ON protocols
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'admin', 'super_admin')
        )
    );

-- Protocol_tasks RLS Policies  
CREATE POLICY "Users can view protocol tasks in their tenant" ON protocol_tasks
    FOR SELECT USING (
        protocol_id IN (
            SELECT id FROM protocols 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid()
            )
        )
    );

CREATE POLICY "Providers and admins can manage protocol tasks in their tenant" ON protocol_tasks
    FOR ALL USING (
        protocol_id IN (
            SELECT id FROM protocols 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'admin', 'super_admin')
            )
        )
    );

-- Patient_protocols RLS Policies
CREATE POLICY "Patients can view their own protocol assignments" ON patient_protocols
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view patient protocols in their tenant" ON patient_protocols
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Providers and admins can manage patient protocols in their tenant" ON patient_protocols
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'admin', 'super_admin')
            )
        )
    );

-- Patient_tasks RLS Policies
CREATE POLICY "Patients can view their own tasks" ON patient_tasks
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update their own tasks" ON patient_tasks
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can view patient tasks in their tenant" ON patient_tasks
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients 
            WHERE tenant_id IN (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('provider', 'nurse', 'admin', 'super_admin')
            )
        )
    );

-- Content tables RLS Policies (similar pattern for videos, forms, exercises)
CREATE POLICY "Users can view content in their tenant" ON content_videos
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Providers and admins can manage content videos in their tenant" ON content_videos
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view forms in their tenant" ON content_forms
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Providers and admins can manage forms in their tenant" ON content_forms
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view exercises in their tenant" ON content_exercises
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Providers and admins can manage exercises in their tenant" ON content_exercises
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('provider', 'admin', 'super_admin')
        )
    );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to assign protocol to patient
CREATE OR REPLACE FUNCTION assign_protocol_to_patient(
    p_patient_id UUID,
    p_protocol_id UUID,
    p_surgery_date DATE,
    p_surgery_type TEXT,
    p_assigned_by UUID
)
RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
    task_record RECORD;
    scheduled_date DATE;
BEGIN
    -- Insert patient_protocol assignment
    INSERT INTO patient_protocols (patient_id, protocol_id, surgery_date, surgery_type, assigned_by)
    VALUES (p_patient_id, p_protocol_id, p_surgery_date, p_surgery_type, p_assigned_by)
    RETURNING id INTO assignment_id;
    
    -- Create individual patient tasks based on protocol tasks
    FOR task_record IN 
        SELECT * FROM protocol_tasks 
        WHERE protocol_id = p_protocol_id 
        ORDER BY day
    LOOP
        -- Calculate scheduled date based on surgery date and task day
        scheduled_date := p_surgery_date + task_record.day;
        
        INSERT INTO patient_tasks (
            patient_protocol_id,
            protocol_task_id,
            patient_id,
            scheduled_date,
            due_date
        ) VALUES (
            assignment_id,
            task_record.id,
            p_patient_id,
            scheduled_date,
            scheduled_date + INTERVAL '1 day' -- Default due date is next day
        );
    END LOOP;
    
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get patient timeline with tasks
CREATE OR REPLACE FUNCTION get_patient_timeline_tasks(
    p_patient_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    task_id UUID,
    protocol_task_id UUID,
    day INTEGER,
    task_type TEXT,
    title TEXT,
    content TEXT,
    scheduled_date DATE,
    status task_status,
    completion_date TIMESTAMPTZ,
    response_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.protocol_task_id,
        prt.day,
        prt.type,
        prt.title,
        prt.content,
        pt.scheduled_date,
        pt.status,
        pt.completion_date,
        pt.response_data
    FROM patient_tasks pt
    JOIN protocol_tasks prt ON prt.id = pt.protocol_task_id
    WHERE pt.patient_id = p_patient_id
    AND (p_start_date IS NULL OR pt.scheduled_date >= p_start_date)
    AND (p_end_date IS NULL OR pt.scheduled_date <= p_end_date)
    ORDER BY pt.scheduled_date, prt.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE protocols IS 'Clinical protocols created by protocol builder';
COMMENT ON TABLE protocol_tasks IS 'Individual tasks within a protocol timeline';
COMMENT ON TABLE patient_protocols IS 'Protocol assignments to patients';
COMMENT ON TABLE patient_tasks IS 'Individual task assignments with completion tracking';
COMMENT ON TABLE content_videos IS 'Educational video content library';
COMMENT ON TABLE content_forms IS 'Dynamic form definitions';
COMMENT ON TABLE content_exercises IS 'Physical therapy exercise library';