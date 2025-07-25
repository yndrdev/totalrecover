// Database types for the healthcare platform
// These should match your Supabase database schema

export interface User {
  id: string;
  email: string;
  role: "patient" | "provider" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bio?: string;
  years_of_experience?: number;
  education?: string[];
  certifications?: string[];
  accepting_new_patients: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";
  reason_for_visit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_id?: string;
  record_type:
    | "consultation"
    | "lab_result"
    | "imaging"
    | "prescription"
    | "procedure"
    | "other";
  title: string;
  description: string;
  content: Record<string, unknown>;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

// Tenant for multi-tenant architecture
export interface Tenant {
  id: string;
  name: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Profile extends User with tenant relationship
export interface Profile {
  id: string;
  user_id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Conversation for chat functionality
export interface Conversation {
  id: string;
  patient_id: string;
  tenant_id: string;
  total_messages?: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

// Message for chat functionality
export interface Message {
  id: string;
  conversation_id: string;
  tenant_id: string;
  sender_type: 'patient' | 'ai' | 'system';
  sender_id?: string;
  content: string;
  metadata?: Record<string, any>;
  completion_status?: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// Recovery Phase for TJV recovery journey
export interface RecoveryPhase {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  phase_order: number;
  start_day: number;
  end_day: number;
  created_at: string;
  updated_at: string;
}

// Task for recovery tasks
export interface Task {
  id: string;
  tenant_id: string;
  recovery_phase_id: string;
  type: 'form' | 'exercise' | 'education' | 'check_in';
  title: string;
  description: string;
  instructions?: string;
  due_date_offset: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

// Patient Task Assignment
export interface PatientTask {
  id: string;
  patient_id: string;
  task_id: string;
  tenant_id: string;
  assigned_at: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completion_data?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Exercise system
export interface Exercise {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  video_url?: string;
  image_url?: string;
  duration_minutes?: number;
  repetitions?: number;
  sets?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  body_part: string;
  equipment_required?: string[];
  created_at: string;
  updated_at: string;
}

// Form Builder
export interface Form {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  form_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form Response
export interface FormResponse {
  id: string;
  form_id: string;
  patient_id: string;
  tenant_id: string;
  response_data: Record<string, any>;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

// Patient Progress Tracking
export interface PatientProgress {
  id: string;
  patient_id: string;
  tenant_id: string;
  surgery_date: string;
  current_phase_id: string;
  pain_level?: number;
  mobility_score?: number;
  satisfaction_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Notification system
export interface Notification {
  id: string;
  patient_id: string;
  tenant_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'info' | 'success';
  is_read: boolean;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

// Comprehensive types for the application
export type UserRole = 'patient' | 'provider' | 'admin';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type TaskType = 'form' | 'exercise' | 'education' | 'check_in';
export type SenderType = 'patient' | 'ai' | 'system';
export type NotificationType = 'reminder' | 'alert' | 'info' | 'success';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CompletionStatus = 'pending' | 'completed' | 'failed';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type RecordType = 'consultation' | 'lab_result' | 'imaging' | 'prescription' | 'procedure' | 'other';
