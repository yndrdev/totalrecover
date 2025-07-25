// Generated types based on existing Supabase schema
// DO NOT SIMPLIFY - This matches our production-ready healthcare platform schema

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string
          tenant_type: 'super_admin' | 'practice' | 'clinic'
          parent_tenant_id: string | null
          settings: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          tenant_type?: 'super_admin' | 'practice' | 'clinic'
          parent_tenant_id?: string | null
          settings?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          tenant_type?: 'super_admin' | 'practice' | 'clinic'
          parent_tenant_id?: string | null
          settings?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          role: 'patient' | 'provider' | 'admin' | 'nurse'
          accessible_tenants: string[]
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          role?: 'patient' | 'provider' | 'admin' | 'nurse'
          accessible_tenants?: string[]
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'patient' | 'provider' | 'admin' | 'nurse'
          accessible_tenants?: string[]
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          patient_number: string | null
          medical_record_number: string | null
          surgery_type: 'TKA' | 'THA'
          surgery_side: 'left' | 'right' | 'bilateral' | null
          surgery_date: string | null
          surgeon_id: string | null
          surgery_location: string | null
          activity_level: 'active' | 'sedentary' | null
          recovery_protocol_id: string | null
          current_phase: number
          current_day: number
          expected_recovery_days: number
          assigned_surgeon: string | null
          assigned_nurse: string | null
          assigned_pt: string | null
          status: 'enrolled' | 'pre_op' | 'post_op' | 'completed' | 'withdrawn' | 'transferred'
          enrollment_date: string
          discharge_date: string | null
          completion_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          patient_number?: string | null
          medical_record_number?: string | null
          surgery_type: 'TKA' | 'THA'
          surgery_side?: 'left' | 'right' | 'bilateral' | null
          surgery_date?: string | null
          surgeon_id?: string | null
          surgery_location?: string | null
          activity_level?: 'active' | 'sedentary' | null
          recovery_protocol_id?: string | null
          current_phase?: number
          current_day?: number
          expected_recovery_days?: number
          assigned_surgeon?: string | null
          assigned_nurse?: string | null
          assigned_pt?: string | null
          status?: 'enrolled' | 'pre_op' | 'post_op' | 'completed' | 'withdrawn' | 'transferred'
          enrollment_date?: string
          discharge_date?: string | null
          completion_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          patient_number?: string | null
          medical_record_number?: string | null
          surgery_type?: 'TKA' | 'THA'
          surgery_side?: 'left' | 'right' | 'bilateral' | null
          surgery_date?: string | null
          surgeon_id?: string | null
          surgery_location?: string | null
          activity_level?: 'active' | 'sedentary' | null
          recovery_protocol_id?: string | null
          current_phase?: number
          current_day?: number
          expected_recovery_days?: number
          assigned_surgeon?: string | null
          assigned_nurse?: string | null
          assigned_pt?: string | null
          status?: 'enrolled' | 'pre_op' | 'post_op' | 'completed' | 'withdrawn' | 'transferred'
          enrollment_date?: string
          discharge_date?: string | null
          completion_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          patient_id: string
          tenant_id: string
          status: 'active' | 'completed' | 'nurse_intervention' | 'archived'
          total_messages: number
          last_activity_at: string
          conversation_metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          tenant_id: string
          status?: 'active' | 'completed' | 'nurse_intervention' | 'archived'
          total_messages?: number
          last_activity_at?: string
          conversation_metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          tenant_id?: string
          status?: 'active' | 'completed' | 'nurse_intervention' | 'archived'
          total_messages?: number
          last_activity_at?: string
          conversation_metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string
          sender_id: string
          sender_type: 'patient' | 'provider' | 'ai' | 'system'
          message_type: 'text' | 'task' | 'form' | 'exercise' | 'education' | 'assessment' | 'voice' | 'image' | 'video' | 'form_completion' | 'video_completion' | 'exercise_completion'
          content: string
          formatted_content: Record<string, unknown> | null
          task_id: string | null
          form_id: string | null
          exercise_id: string | null
          education_content_id: string | null
          completion_status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | null
          completion_data: Record<string, unknown>
          completed_at: string | null
          metadata: Record<string, unknown> | null
          status: 'draft' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          read_at: string | null
          read_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          conversation_id: string
          sender_id: string
          sender_type: 'patient' | 'provider' | 'ai' | 'system'
          message_type?: 'text' | 'task' | 'form' | 'exercise' | 'education' | 'assessment' | 'voice' | 'image' | 'video' | 'form_completion' | 'video_completion' | 'exercise_completion'
          content: string
          formatted_content?: Record<string, unknown> | null
          task_id?: string | null
          form_id?: string | null
          exercise_id?: string | null
          education_content_id?: string | null
          completion_status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | null
          completion_data?: Record<string, unknown>
          completed_at?: string | null
          metadata?: Record<string, unknown> | null
          status?: 'draft' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          read_at?: string | null
          read_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          conversation_id?: string
          sender_id?: string
          sender_type?: 'patient' | 'provider' | 'ai' | 'system'
          message_type?: 'text' | 'task' | 'form' | 'exercise' | 'education' | 'assessment' | 'voice' | 'image' | 'video' | 'form_completion' | 'video_completion' | 'exercise_completion'
          content?: string
          formatted_content?: Record<string, unknown> | null
          task_id?: string | null
          form_id?: string | null
          exercise_id?: string | null
          education_content_id?: string | null
          completion_status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | null
          completion_data?: Record<string, unknown>
          completed_at?: string | null
          metadata?: Record<string, unknown> | null
          status?: 'draft' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
          read_at?: string | null
          read_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      conversation_activities: {
        Row: {
          id: string
          conversation_id: string
          activity_type: 'form_completed' | 'video_watched' | 'exercise_logged' | 'medication_taken' | 'appointment_scheduled'
          activity_data: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          activity_type: 'form_completed' | 'video_watched' | 'exercise_logged' | 'medication_taken' | 'appointment_scheduled'
          activity_data: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          activity_type?: 'form_completed' | 'video_watched' | 'exercise_logged' | 'medication_taken' | 'appointment_scheduled'
          activity_data?: Record<string, unknown>
          created_at?: string
        }
      }
      recovery_protocols: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          surgery_type: 'TKA' | 'THA'
          activity_level: 'active' | 'sedentary' | null
          protocol_schema: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          surgery_type: 'TKA' | 'THA'
          activity_level?: 'active' | 'sedentary' | null
          protocol_schema: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          surgery_type?: 'TKA' | 'THA'
          activity_level?: 'active' | 'sedentary' | null
          protocol_schema?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          tenant_id: string
          protocol_id: string
          title: string
          description: string | null
          task_type: 'exercise' | 'assessment' | 'education' | 'form' | 'medication' | 'appointment' | 'milestone'
          day_number: number
          task_config: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          protocol_id: string
          title: string
          description?: string | null
          task_type: 'exercise' | 'assessment' | 'education' | 'form' | 'medication' | 'appointment' | 'milestone'
          day_number: number
          task_config?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          protocol_id?: string
          title?: string
          description?: string | null
          task_type?: 'exercise' | 'assessment' | 'education' | 'form' | 'medication' | 'appointment' | 'milestone'
          day_number?: number
          task_config?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      patient_tasks: {
        Row: {
          id: string
          tenant_id: string
          patient_id: string
          task_id: string
          scheduled_date: string
          status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'cancelled'
          completion_data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          patient_id: string
          task_id: string
          scheduled_date: string
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'cancelled'
          completion_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          patient_id?: string
          task_id?: string
          scheduled_date?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'cancelled'
          completion_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      tenant_type: 'super_admin' | 'practice' | 'clinic'
      user_role: 'patient' | 'provider' | 'admin' | 'nurse'
      conversation_status: 'active' | 'completed' | 'nurse_intervention' | 'archived'
      sender_type: 'patient' | 'ai' | 'nurse' | 'system'
      activity_type: 'form_completed' | 'video_watched' | 'exercise_logged' | 'medication_taken' | 'appointment_scheduled'
    }
  }
}

// Export type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience exports
export type Tenant = Tables<'tenants'>
export type Profile = Tables<'profiles'>
export type Patient = Tables<'patients'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type ConversationActivity = Tables<'conversation_activities'>