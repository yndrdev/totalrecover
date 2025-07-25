// Generated TypeScript types for Supabase database schema
// This file should be generated using: npx supabase gen types typescript --project-id slhdxlhnwujvqkwdgfko

export interface Database {
  public: {
    Tables: {
      // ===== AUTHENTICATION & USERS =====
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          bio: string | null
          address: {
            street?: string
            city?: string
            state?: string
            zip?: string
          } | null
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
          is_active: boolean
          tenant_id: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          bio?: string | null
          address?: {
            street?: string
            city?: string
            state?: string
            zip?: string
          } | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          is_active?: boolean
          tenant_id: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          bio?: string | null
          address?: {
            street?: string
            city?: string
            state?: string
            zip?: string
          } | null
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
          is_active?: boolean
          tenant_id?: string
        }
      }
      
      // ===== MULTI-TENANT ORGANIZATION =====
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          settings: Json
          subscription_plan: 'trial' | 'basic' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json
          subscription_plan?: 'trial' | 'basic' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json
          subscription_plan?: 'trial' | 'basic' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          created_at?: string
          updated_at?: string
        }
      }

      practices: {
        Row: {
          id: string
          tenant_id: string
          name: string
          address: Json
          phone: string | null
          email: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          address?: Json
          phone?: string | null
          email?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          address?: Json
          phone?: string | null
          email?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // ===== PATIENTS =====
      patients: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          practice_id: string | null
          mrn: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone: string | null
          email: string | null
          address: Json
          emergency_contact: Json
          medical_history: Json
          insurance_info: Json
          preferred_language: string
          status: 'active' | 'inactive' | 'discharged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          practice_id?: string | null
          mrn: string
          first_name: string
          last_name: string
          date_of_birth: string
          phone?: string | null
          email?: string | null
          address?: Json
          emergency_contact?: Json
          medical_history?: Json
          insurance_info?: Json
          preferred_language?: string
          status?: 'active' | 'inactive' | 'discharged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          practice_id?: string | null
          mrn?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          phone?: string | null
          email?: string | null
          address?: Json
          emergency_contact?: Json
          medical_history?: Json
          insurance_info?: Json
          preferred_language?: string
          status?: 'active' | 'inactive' | 'discharged'
          created_at?: string
          updated_at?: string
        }
      }

      // ===== PROVIDERS =====
      providers: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          practice_id: string | null
          npi: string | null
          specialty: string
          license_number: string | null
          credentials: string[]
          is_primary_surgeon: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          practice_id?: string | null
          npi?: string | null
          specialty: string
          license_number?: string | null
          credentials?: string[]
          is_primary_surgeon?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          practice_id?: string | null
          npi?: string | null
          specialty?: string
          license_number?: string | null
          credentials?: string[]
          is_primary_surgeon?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ===== PROTOCOLS =====
      protocols: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          surgery_types: string[]
          activity_levels: string[]
          timeline_start: number
          timeline_end: number
          version: number
          is_active: boolean
          is_draft: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          surgery_types?: string[]
          activity_levels?: string[]
          timeline_start?: number
          timeline_end?: number
          version?: number
          is_active?: boolean
          is_draft?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          surgery_types?: string[]
          activity_levels?: string[]
          timeline_start?: number
          timeline_end?: number
          version?: number
          is_active?: boolean
          is_draft?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      protocol_tasks: {
        Row: {
          id: string
          protocol_id: string
          day: number
          type: 'form' | 'exercise' | 'video' | 'message'
          title: string
          content: string
          description: string | null
          video_url: string | null
          required: boolean
          duration: string | null
          difficulty: 'easy' | 'medium' | 'hard' | null
          frequency: Json
          dependencies: string[]
          triggers: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          protocol_id: string
          day: number
          type: 'form' | 'exercise' | 'video' | 'message'
          title: string
          content: string
          description?: string | null
          video_url?: string | null
          required?: boolean
          duration?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          frequency?: Json
          dependencies?: string[]
          triggers?: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          protocol_id?: string
          day?: number
          type?: 'form' | 'exercise' | 'video' | 'message'
          title?: string
          content?: string
          description?: string | null
          video_url?: string | null
          required?: boolean
          duration?: string | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
          frequency?: Json
          dependencies?: string[]
          triggers?: Json[]
          created_at?: string
          updated_at?: string
        }
      }

      // ===== PATIENT PROTOCOL ASSIGNMENTS =====
      patient_protocols: {
        Row: {
          id: string
          patient_id: string
          protocol_id: string
          surgery_date: string
          surgery_type: string
          assigned_by: string
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          protocol_id: string
          surgery_date: string
          surgery_type: string
          assigned_by: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          protocol_id?: string
          surgery_date?: string
          surgery_type?: string
          assigned_by?: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // ===== PATIENT TIMELINE TASKS =====
      patient_tasks: {
        Row: {
          id: string
          patient_protocol_id: string
          protocol_task_id: string
          patient_id: string
          scheduled_date: string
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue'
          completion_date: string | null
          response_data: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_protocol_id: string
          protocol_task_id: string
          patient_id: string
          scheduled_date: string
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue'
          completion_date?: string | null
          response_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_protocol_id?: string
          protocol_task_id?: string
          patient_id?: string
          scheduled_date?: string
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue'
          completion_date?: string | null
          response_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ===== CHAT & MESSAGES =====
      chat_conversations: {
        Row: {
          id: string
          patient_id: string
          provider_id: string | null
          tenant_id: string
          type: 'patient_support' | 'medical_consultation' | 'recovery_coaching'
          status: 'active' | 'archived' | 'escalated'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          provider_id?: string | null
          tenant_id: string
          type?: 'patient_support' | 'medical_consultation' | 'recovery_coaching'
          status?: 'active' | 'archived' | 'escalated'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          provider_id?: string | null
          tenant_id?: string
          type?: 'patient_support' | 'medical_consultation' | 'recovery_coaching'
          status?: 'active' | 'archived' | 'escalated'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }

      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_type: 'patient' | 'provider' | 'ai_assistant' | 'system'
          message_type: 'text' | 'form' | 'video' | 'task_completion' | 'system_notification'
          content: string
          metadata: Json | null
          attachments: Json[]
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_type: 'patient' | 'provider' | 'ai_assistant' | 'system'
          message_type?: 'text' | 'form' | 'video' | 'task_completion' | 'system_notification'
          content: string
          metadata?: Json | null
          attachments?: Json[]
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          sender_type?: 'patient' | 'provider' | 'ai_assistant' | 'system'
          message_type?: 'text' | 'form' | 'video' | 'task_completion' | 'system_notification'
          content?: string
          metadata?: Json | null
          attachments?: Json[]
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ===== CONTENT LIBRARY =====
      content_videos: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string
          category: string
          url: string
          thumbnail_url: string | null
          duration: string | null
          tags: string[]
          phase: string | null
          surgery_types: string[]
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description: string
          category: string
          url: string
          thumbnail_url?: string | null
          duration?: string | null
          tags?: string[]
          phase?: string | null
          surgery_types?: string[]
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string
          category?: string
          url?: string
          thumbnail_url?: string | null
          duration?: string | null
          tags?: string[]
          phase?: string | null
          surgery_types?: string[]
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      content_forms: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string
          category: string
          form_schema: Json
          estimated_time: string | null
          phase: string | null
          surgery_types: string[]
          tags: string[]
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description: string
          category: string
          form_schema: Json
          estimated_time?: string | null
          phase?: string | null
          surgery_types?: string[]
          tags?: string[]
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string
          category?: string
          form_schema?: Json
          estimated_time?: string | null
          phase?: string | null
          surgery_types?: string[]
          tags?: string[]
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      content_exercises: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration: string | null
          instructions: string
          body_parts: string[]
          phase: string | null
          surgery_types: string[]
          tags: string[]
          video_url: string | null
          image_urls: string[]
          created_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description: string
          category: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: string | null
          instructions: string
          body_parts?: string[]
          phase?: string | null
          surgery_types?: string[]
          tags?: string[]
          video_url?: string | null
          image_urls?: string[]
          created_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: string | null
          instructions?: string
          body_parts?: string[]
          phase?: string | null
          surgery_types?: string[]
          tags?: string[]
          video_url?: string | null
          image_urls?: string[]
          created_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ===== FORM SUBMISSIONS =====
      form_submissions: {
        Row: {
          id: string
          patient_task_id: string
          patient_id: string
          form_id: string
          submission_data: Json
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_task_id: string
          patient_id: string
          form_id: string
          submission_data: Json
          submitted_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_task_id?: string
          patient_id?: string
          form_id?: string
          submission_data?: Json
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
      }

      // ===== AUDIT & MONITORING =====
      audit_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
      task_status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue'
      protocol_status: 'active' | 'completed' | 'paused' | 'cancelled'
      conversation_status: 'active' | 'archived' | 'escalated'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Commonly used types
export type User = TablesRow<'users'>
export type Patient = TablesRow<'patients'>
export type Provider = TablesRow<'providers'>
export type Protocol = TablesRow<'protocols'>
export type ProtocolTask = TablesRow<'protocol_tasks'>
export type PatientProtocol = TablesRow<'patient_protocols'>
export type PatientTask = TablesRow<'patient_tasks'>
export type ChatMessage = TablesRow<'chat_messages'>
export type FormSubmission = TablesRow<'form_submissions'>