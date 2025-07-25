/**
 * Type definitions for AI-powered forms system
 */

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'radio' | 'checkbox' | 'signature' | 'email' | 'phone'
  required: boolean
  options?: string[]
  validation_rules?: {
    min?: number
    max?: number
    pattern?: string
    required?: boolean
  }
  conversational_prompt?: string
  display_order: number
  conditional_logic?: {
    show_if?: {
      field: string
      value: any
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    }
    hide_if?: {
      field: string
      value: any
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    }
  }
}

export interface AIForm {
  id: string
  title: string
  description: string
  category: 'pre_op' | 'post_op' | 'assessment' | 'medical_history' | 'physical_therapy' | 'insurance' | 'administrative' | 'other'
  original_file_url?: string
  original_file_type?: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png'
  file_size_bytes?: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_processing_metadata?: {
    confidence_score: number
    fields_extracted: number
    processing_time_seconds: number
    extraction_method?: 'ocr' | 'pdf_parse' | 'document_analysis'
    validation_errors?: string[]
  }
  fields: FormField[]
  conversation_flow?: ConversationFlow
  requirements?: string
  created_by?: string
  practice_id?: string
  created_at: string
  updated_at: string
  is_active: boolean
  tags: string[]
  estimated_time: string
  usage_count: number
}

export interface FormAssignment {
  id: string
  form_id: string
  patient_id: string
  assigned_by: string
  assigned_for_day: number
  protocol_task_id?: string
  assignment_status: 'assigned' | 'in_progress' | 'completed' | 'expired'
  due_date?: string
  started_at?: string
  completed_at?: string
  ai_conversation_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  form_assignment_id: string
  form_field_id: string
  patient_id: string
  response_value: string | number | boolean | string[]
  response_type: string
  confidence_score?: number
  chat_message_id?: string
  needs_clarification: boolean
  clarification_requested?: string
  response_timestamp: string
  updated_at: string
}

export interface CompletedForm {
  id: string
  form_assignment_id: string
  patient_id: string
  form_id: string
  completed_form_url?: string
  completion_percentage: number
  ai_completion_summary?: {
    total_fields: number
    completed_fields: number
    missing_required_fields: string[]
    validation_errors: string[]
    confidence_score: number
  }
  digital_signature_url?: string
  signature_timestamp?: string
  provider_reviewed: boolean
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

export interface ConversationFlow {
  introduction: string
  completion_message: string
  validation_prompts: Record<string, string>
  personality_traits: {
    tone: 'professional' | 'friendly' | 'empathetic'
    formality: 'formal' | 'casual' | 'semi-formal'
    supportiveness: 'high' | 'medium' | 'low'
  }
  custom_prompts?: {
    field_introduction?: Record<string, string>
    clarification_requests?: Record<string, string>
    validation_failures?: Record<string, string>
  }
}

export interface FormTemplate {
  id: string
  template_name: string
  template_category: string
  template_description: string
  template_fields: FormField[]
  conversation_flow?: ConversationFlow
  is_system_template: boolean
  created_by?: string
  practice_id?: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface FormProcessingJob {
  id: string
  form_id: string
  job_type: 'field_extraction' | 'conversation_generation' | 'validation_setup'
  job_status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  job_parameters: Record<string, any>
  job_results: Record<string, any>
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_type: 'ai' | 'patient' | 'provider'
  message_content: string
  message_type: 'question' | 'response' | 'clarification' | 'validation' | 'completion'
  related_field_id?: string
  extracted_data?: {
    field_name: string
    field_value: any
    confidence: number
  }
  timestamp: string
  is_edited: boolean
  parent_message_id?: string
}

export interface FormConversation {
  id: string
  form_assignment_id: string
  patient_id: string
  form_id: string
  conversation_status: 'active' | 'paused' | 'completed' | 'abandoned'
  current_field_index: number
  messages: ChatMessage[]
  extracted_responses: Record<string, FormResponse>
  completion_percentage: number
  started_at: string
  last_activity_at: string
  completed_at?: string
}

// Utility types
export type FormCategory = AIForm['category']
export type ProcessingStatus = AIForm['processing_status']
export type AssignmentStatus = FormAssignment['assignment_status']
export type ConversationStatus = FormConversation['conversation_status']

// Form validation types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field_id: string
  field_name: string
  error_type: 'required' | 'format' | 'range' | 'custom'
  error_message: string
}

export interface ValidationWarning {
  field_id: string
  field_name: string
  warning_type: 'unusual_value' | 'incomplete' | 'suggestion'
  warning_message: string
}