-- TJV RECOVERY PERFORMANCE INDEXES
-- Run this AFTER the main schema is complete
-- These indexes improve query performance for the chat system

-- =====================================================
-- PERFORMANCE INDEXES (Run separately)
-- =====================================================

-- Primary performance indexes
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_accessible_tenants ON profiles USING GIN(accessible_tenants);

CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_surgery_date ON patients(surgery_date);
CREATE INDEX idx_patients_current_day ON patients(current_day);
CREATE INDEX idx_patients_status ON patients(status);

CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_patient_id ON conversations(patient_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_message_type ON messages(message_type);
CREATE INDEX idx_messages_completion_status ON messages(completion_status);

CREATE INDEX idx_conversation_activities_conversation_id ON conversation_activities(conversation_id);
CREATE INDEX idx_conversation_activities_activity_type ON conversation_activities(activity_type);
CREATE INDEX idx_conversation_activities_created_at ON conversation_activities(created_at DESC);

CREATE INDEX idx_form_responses_tenant_id ON form_responses(tenant_id);
CREATE INDEX idx_form_responses_patient_id ON form_responses(patient_id);
CREATE INDEX idx_form_responses_conversation_id ON form_responses(conversation_id);
CREATE INDEX idx_form_responses_completion_status ON form_responses(completion_status);

CREATE INDEX idx_exercise_completions_tenant_id ON exercise_completions(tenant_id);
CREATE INDEX idx_exercise_completions_patient_id ON exercise_completions(patient_id);
CREATE INDEX idx_exercise_completions_conversation_id ON exercise_completions(conversation_id);
CREATE INDEX idx_exercise_completions_completion_status ON exercise_completions(completion_status);

CREATE INDEX idx_content_engagement_tenant_id ON content_engagement(tenant_id);
CREATE INDEX idx_content_engagement_patient_id ON content_engagement(patient_id);
CREATE INDEX idx_content_engagement_conversation_id ON content_engagement(conversation_id);
CREATE INDEX idx_content_engagement_engagement_status ON content_engagement(engagement_status);

CREATE INDEX idx_patient_tasks_tenant_id ON patient_tasks(tenant_id);
CREATE INDEX idx_patient_tasks_patient_id ON patient_tasks(patient_id);
CREATE INDEX idx_patient_tasks_conversation_id ON patient_tasks(conversation_id);
CREATE INDEX idx_patient_tasks_scheduled_date ON patient_tasks(scheduled_date);
CREATE INDEX idx_patient_tasks_status ON patient_tasks(status);

-- GIN indexes for JSONB columns
CREATE INDEX idx_messages_completion_data_gin ON messages USING GIN(completion_data);
CREATE INDEX idx_form_responses_responses_gin ON form_responses USING GIN(responses);
CREATE INDEX idx_conversation_activities_progress_data_gin ON conversation_activities USING GIN(progress_data);

