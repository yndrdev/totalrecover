-- TJV Recovery Platform - Complete Database Restructure
-- This migration creates a clean, consistent schema with proper relationships
-- Created: 2024-01-20
-- Purpose: Fix all foreign key issues and establish proper data structure

-- ============================================
-- STEP 1: DROP EXISTING TABLES (CASCADE)
-- ============================================
-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS patient_tasks CASCADE;
DROP TABLE IF EXISTS patient_protocols CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS recovery_protocols CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS protocol_templates CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ============================================
-- STEP 2: CREATE BASE TABLES
-- ============================================

-- Tenants table for multi-tenant architecture
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table (for provider-specific data)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    license_number TEXT,
    specialties TEXT[],
    department TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mrn TEXT,
    date_of_birth DATE,
    surgery_date DATE,
    surgery_type TEXT,
    surgeon_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    primary_provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    emergency_contact JSONB DEFAULT '{}',
    medical_history JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    form_type TEXT NOT NULL,
    fields JSONB NOT NULL DEFAULT '[]',
    scoring_logic JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level TEXT,
    instructions JSONB NOT NULL DEFAULT '{}',
    video_url TEXT,
    image_url TEXT,
    duration_minutes INTEGER,
    equipment_needed TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery protocols table
CREATE TABLE recovery_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    surgery_types TEXT[] NOT NULL DEFAULT '{}',
    timeline_start INTEGER NOT NULL DEFAULT -45,
    timeline_end INTEGER NOT NULL DEFAULT 200,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES recovery_protocols(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('form', 'exercise', 'video', 'message')),
    title TEXT NOT NULL,
    description TEXT,
    content_data JSONB DEFAULT '{}',
    required BOOLEAN DEFAULT true,
    frequency_data JSONB DEFAULT '{"repeat": false}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient protocols (assigned protocols)
CREATE TABLE patient_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES recovery_protocols(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    surgery_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, protocol_id)
);

-- Patient tasks (individual task assignments)
CREATE TABLE patient_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_protocol_id UUID NOT NULL REFERENCES patient_protocols(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue')),
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_data JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Providers indexes
CREATE INDEX idx_providers_tenant_id ON providers(tenant_id);
CREATE INDEX idx_providers_profile_id ON providers(profile_id);

-- Patients indexes
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_patients_surgeon_id ON patients(surgeon_id);
CREATE INDEX idx_patients_primary_provider_id ON patients(primary_provider_id);
CREATE INDEX idx_patients_status ON patients(status);

-- Recovery protocols indexes
CREATE INDEX idx_recovery_protocols_tenant_id ON recovery_protocols(tenant_id);
CREATE INDEX idx_recovery_protocols_created_by ON recovery_protocols(created_by);
CREATE INDEX idx_recovery_protocols_is_active ON recovery_protocols(is_active);

-- Tasks indexes
CREATE INDEX idx_tasks_protocol_id ON tasks(protocol_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_day ON tasks(day);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);

-- Patient protocols indexes
CREATE INDEX idx_patient_protocols_patient_id ON patient_protocols(patient_id);
CREATE INDEX idx_patient_protocols_protocol_id ON patient_protocols(protocol_id);
CREATE INDEX idx_patient_protocols_tenant_id ON patient_protocols(tenant_id);
CREATE INDEX idx_patient_protocols_status ON patient_protocols(status);

-- Patient tasks indexes
CREATE INDEX idx_patient_tasks_patient_protocol_id ON patient_tasks(patient_protocol_id);
CREATE INDEX idx_patient_tasks_task_id ON patient_tasks(task_id);
CREATE INDEX idx_patient_tasks_tenant_id ON patient_tasks(tenant_id);
CREATE INDEX idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX idx_patient_tasks_status ON patient_tasks(status);

-- Conversations indexes
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX idx_conversations_provider_id ON conversations(provider_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- STEP 4: CREATE FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role, tenant_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate patient protocol progress
CREATE OR REPLACE FUNCTION calculate_protocol_progress(patient_protocol_id UUID)
RETURNS JSONB AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    pending_tasks INTEGER;
    overdue_tasks INTEGER;
    progress_percentage NUMERIC;
BEGIN
    SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'overdue') AS overdue
    INTO total_tasks, completed_tasks, pending_tasks, overdue_tasks
    FROM patient_tasks
    WHERE patient_protocol_id = $1;
    
    IF total_tasks > 0 THEN
        progress_percentage := (completed_tasks::NUMERIC / total_tasks::NUMERIC) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    RETURN jsonb_build_object(
        'total_tasks', total_tasks,
        'completed_tasks', completed_tasks,
        'pending_tasks', pending_tasks,
        'overdue_tasks', overdue_tasks,
        'progress_percentage', ROUND(progress_percentage, 2)
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: CREATE TRIGGERS
-- ============================================

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recovery_protocols_updated_at BEFORE UPDATE ON recovery_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_protocols_updated_at BEFORE UPDATE ON patient_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_tasks_updated_at BEFORE UPDATE ON patient_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 6: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for patients (providers can see all patients in their tenant)
CREATE POLICY "Providers can view all patients in their tenant"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = patients.tenant_id
            AND profiles.role IN ('provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin', 'admin')
        )
    );

CREATE POLICY "Patients can view their own record"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.id = patients.profile_id
        )
    );

-- RLS Policies for messages (users can see messages in their conversations)
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (
                -- Patient can see their own conversations
                (c.patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()))
                OR
                -- Provider can see conversations in their tenant
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.tenant_id = c.tenant_id
                    AND profiles.role IN ('provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin', 'admin')
                )
            )
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (
                -- Patient can send in their own conversations
                (c.patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()))
                OR
                -- Provider can send in conversations in their tenant
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.tenant_id = c.tenant_id
                    AND profiles.role IN ('provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin', 'admin')
                )
            )
        )
    );

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        -- Patient can see their own conversations
        (patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid()))
        OR
        -- Provider can see conversations in their tenant
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = conversations.tenant_id
            AND profiles.role IN ('provider', 'surgeon', 'nurse', 'physical_therapist', 'clinic_admin', 'practice_admin', 'admin')
        )
    );

-- ============================================
-- STEP 7: SEED DEFAULT DATA
-- ============================================

-- Insert default tenant
INSERT INTO tenants (id, name, subdomain, settings)
VALUES (
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
    'TJV Healthcare',
    'tjv',
    jsonb_build_object(
        'features', jsonb_build_object(
            'chat_enabled', true,
            'video_calls_enabled', true,
            'ai_assistant_enabled', true
        ),
        'branding', jsonb_build_object(
            'primary_color', '#2563eb',
            'logo_url', '/logo.png'
        )
    )
)
ON CONFLICT (subdomain) DO NOTHING;

-- ============================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;
GRANT INSERT ON messages TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- Grant additional permissions for providers
-- (Note: These are controlled by RLS policies above)

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Create a migration log entry
INSERT INTO audit_logs (
    tenant_id,
    action,
    resource_type,
    details
) VALUES (
    'c1234567-89ab-cdef-0123-456789abcdef'::UUID,
    'database_migration',
    'schema',
    jsonb_build_object(
        'migration_name', 'complete_db_restructure',
        'version', '1.0.0',
        'timestamp', NOW()
    )
);