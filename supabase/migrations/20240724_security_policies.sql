-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION auth.tenant_id() 
RETURNS uuid AS $$
  SELECT tenant_id 
  FROM public.users 
  WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS text AS $$
  SELECT role 
  FROM public.users 
  WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view other users in their tenant" ON public.users
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('nurse', 'surgeon', 'physical_therapist', 'practice_admin')
  );

CREATE POLICY "SaaS admins can view all users" ON public.users
  FOR SELECT USING (auth.user_role() = 'saas_admin');

CREATE POLICY "Practice admins can manage users in their tenant" ON public.users
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() = 'practice_admin'
  );

-- Tenants table policies
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = auth.tenant_id());

CREATE POLICY "SaaS admins can manage all tenants" ON public.tenants
  FOR ALL USING (auth.user_role() = 'saas_admin');

-- Patients table policies
CREATE POLICY "Patients can view their own record" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Healthcare providers can view patients in their tenant" ON public.patients
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('nurse', 'surgeon', 'physical_therapist', 'practice_admin')
  );

CREATE POLICY "Healthcare providers can manage patients in their tenant" ON public.patients
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('surgeon', 'practice_admin')
  );

-- Protocols table policies
CREATE POLICY "Users can view protocols in their tenant" ON public.protocols
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    OR is_public = true
  );

CREATE POLICY "Healthcare providers can create protocols" ON public.protocols
  FOR INSERT WITH CHECK (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('surgeon', 'practice_admin')
  );

CREATE POLICY "Protocol creators can update their own protocols" ON public.protocols
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR (tenant_id = auth.tenant_id() AND auth.user_role() = 'practice_admin')
  );

CREATE POLICY "SaaS admins can manage all protocols" ON public.protocols
  FOR ALL USING (auth.user_role() = 'saas_admin');

-- Patient tasks policies
CREATE POLICY "Patients can view their own tasks" ON public.patient_tasks
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Healthcare providers can view patient tasks in their tenant" ON public.patient_tasks
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('nurse', 'surgeon', 'physical_therapist', 'practice_admin')
  );

CREATE POLICY "Healthcare providers can update patient tasks" ON public.patient_tasks
  FOR UPDATE USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('nurse', 'surgeon', 'physical_therapist')
  );

-- Content policies (forms, videos, exercises)
CREATE POLICY "Users can view content in their tenant" ON public.content_forms
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Content creators can manage content" ON public.content_forms
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('surgeon', 'practice_admin')
  );

-- Apply same policies to videos and exercises
CREATE POLICY "Users can view content in their tenant" ON public.content_videos
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Content creators can manage content" ON public.content_videos
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('surgeon', 'practice_admin')
  );

CREATE POLICY "Users can view content in their tenant" ON public.content_exercises
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "Content creators can manage content" ON public.content_exercises
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('surgeon', 'physical_therapist', 'practice_admin')
  );

-- Practice settings policies
CREATE POLICY "Practice admins can view their practice settings" ON public.practice_settings
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() = 'practice_admin'
  );

CREATE POLICY "Practice admins can update their practice settings" ON public.practice_settings
  FOR ALL USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() = 'practice_admin'
  );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their tenant" ON public.audit_logs
  FOR SELECT USING (
    tenant_id = auth.tenant_id() 
    AND auth.user_role() IN ('practice_admin', 'saas_admin')
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX idx_protocols_tenant_id ON public.protocols(tenant_id);
CREATE INDEX idx_patient_tasks_tenant_id ON public.patient_tasks(tenant_id);
CREATE INDEX idx_patient_tasks_patient_id ON public.patient_tasks(patient_id);
CREATE INDEX idx_content_forms_tenant_id ON public.content_forms(tenant_id);
CREATE INDEX idx_content_videos_tenant_id ON public.content_videos(tenant_id);
CREATE INDEX idx_content_exercises_tenant_id ON public.content_exercises(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);