// Chat system types for TJV Recovery Platform
// Professional healthcare chat interface with Manus-style design

export interface ChatMessage {
  id: string;
  conversation_id: string;
  session_id: string;
  patient_id: string;
  sender_id: string;
  sender_type: 'patient' | 'ai' | 'provider' | 'system' | 'ai_assistant';
  source?: 'patient' | 'ai' | 'provider' | 'system';
  provider_id?: string;
  provider_name?: string;
  content: string;
  message_type: 'text' | 'form' | 'task' | 'notification';
  priority?: 'normal' | 'urgent' | 'emergency';
  recovery_day: number;
  metadata?: {
    buttons?: MessageButton[];
    tasks?: TaskMetadata[];
    forms?: FormMetadata[];
    attachments?: AttachmentMetadata[];
    escalation?: EscalationMetadata;
  };
  read_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageButton {
  id: string;
  text: string;
  action: 'complete_task' | 'start_form' | 'view_exercise' | 'schedule_appointment' | 'contact_provider';
  payload: Record<string, any>;
  style: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

export interface TaskMetadata {
  task_id: string;
  task_type: 'exercise' | 'medication' | 'form' | 'check_in' | 'appointment';
  title: string;
  description: string;
  due_time?: string;
  completed_at?: string;
  status: 'pending' | 'completed' | 'missed' | 'overdue';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface FormMetadata {
  form_id: string;
  form_type: 'pain_assessment' | 'symptom_report' | 'medication_log' | 'exercise_log';
  title: string;
  fields: FormField[];
  submitted_at?: string;
  responses?: Record<string, any>;
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'scale' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AttachmentMetadata {
  id: string;
  filename: string;
  file_type: 'image' | 'video' | 'document' | 'audio';
  file_size: number;
  url: string;
  thumbnail_url?: string;
}

export interface EscalationMetadata {
  escalated_at: string;
  escalation_reason: 'high_pain' | 'missed_medications' | 'concerning_symptoms' | 'no_response';
  escalation_level: 'nurse' | 'provider' | 'emergency';
  provider_notified: boolean;
  resolved_at?: string;
}

export interface ConversationSession {
  id: string;
  patient_id: string;
  recovery_day: number;
  surgery_date: string;
  session_date: string;
  status: 'active' | 'completed' | 'archived';
  tasks_total: number;
  tasks_completed: number;
  tasks_missed: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecoveryDayInfo {
  day: number;
  date: string;
  phase: 'pre_surgery' | 'immediate_post_op' | 'early_recovery' | 'active_recovery' | 'maintenance';
  session_id?: string;
  has_messages: boolean;
  task_summary: {
    total: number;
    completed: number;
    missed: number;
    pending: number;
  };
  status_indicator: 'success' | 'warning' | 'error' | 'pending';
  milestones?: RecoveryMilestone[];
}

export interface RecoveryMilestone {
  id: string;
  title: string;
  description: string;
  target_day: number;
  achieved: boolean;
  achieved_date?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface PatientRecoveryContext {
  patient_id: string;
  tenant_id?: string;
  surgery_type: 'TKA' | 'THA' | 'bilateral_TKA' | 'bilateral_THA' | 'revision';
  surgery_date: string;
  current_day: number;
  phase: 'pre_surgery' | 'immediate_post_op' | 'early_recovery' | 'active_recovery' | 'maintenance';
  provider_team: {
    surgeon: string;
    nurse: string;
    physical_therapist?: string;
    case_manager?: string;
  };
  current_medications: MedicationInfo[];
  current_exercises: ExerciseInfo[];
  risk_factors: RiskFactor[];
  preferences: PatientPreferences;
  care_team?: any[];
  patient_name?: string;
}

export interface MedicationInfo {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  adherence_rate: number;
  last_taken?: string;
  side_effects?: string[];
}

export interface ExerciseInfo {
  id: string;
  name: string;
  type: 'range_of_motion' | 'strengthening' | 'walking' | 'balance';
  frequency: string;
  duration: number;
  instructions: string;
  video_url?: string;
  compliance_rate: number;
  last_completed?: string;
}

export interface RiskFactor {
  id: string;
  factor: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  monitoring_required: boolean;
}

export interface PatientPreferences {
  communication_time: 'morning' | 'afternoon' | 'evening' | 'any';
  reminder_frequency: 'high' | 'medium' | 'low';
  preferred_language: string;
  accessibility_needs?: string[];
  emergency_contacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}

export interface ChatInterfaceState {
  currentDay: number;
  selectedDay: number;
  messages: ChatMessage[];
  loading: boolean;
  typing: boolean;
  error: string | null;
  sidebarOpen: boolean;
  recoveryDays: RecoveryDayInfo[];
  patientContext: PatientRecoveryContext | null;
  activeSession: ConversationSession | null;
}

export interface ChatSidebarProps {
  recoveryDays: RecoveryDayInfo[];
  currentDay: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
  onReturnToToday: () => void;
  loading: boolean;
}

export interface ChatMainProps {
  messages: ChatMessage[];
  loading: boolean;
  typing: boolean;
  selectedDay: number;
  currentDay: number;
  onSendMessage: (content: string) => void;
  onCompleteTask: (taskId: string) => void;
  onSubmitForm: (formId: string, responses: Record<string, any>) => void;
  patientContext: PatientRecoveryContext | null;
}

export interface MissedTaskRecoveryProps {
  missedTasks: TaskMetadata[];
  recoveryDay: number;
  onCompleteTask: (taskId: string) => void;
  onDismissTask: (taskId: string) => void;
}

// Supabase real-time subscription types
export interface RealtimeMessagePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: ChatMessage;
  old?: ChatMessage;
  errors?: any;
}

export interface RealtimeTypingPayload {
  user_id: string;
  session_id: string;
  is_typing: boolean;
  timestamp: string;
}

// Chat API response types
export interface ChatAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    conversation_id: string;
    session_id: string;
    response_time: number;
  };
}

export interface AIResponsePayload {
  message_id: string;
  content: string;
  metadata?: {
    confidence: number;
    escalation_triggered: boolean;
    suggested_actions: string[];
  };
}

// Healthcare compliance types
export interface HIIPAAuditLog {
  id: string;
  user_id: string;
  patient_id: string;
  action: 'message_sent' | 'message_viewed' | 'task_completed' | 'form_submitted' | 'escalation_triggered';
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface DataRetentionPolicy {
  message_retention_days: number;
  task_retention_days: number;
  audit_log_retention_days: number;
  automatic_archival: boolean;
  patient_data_export: boolean;
}

// Chat performance optimization types
export interface MessageCache {
  session_id: string;
  messages: ChatMessage[];
  last_updated: string;
  ttl: number;
}

export interface ChatMetrics {
  session_id: string;
  total_messages: number;
  response_time_avg: number;
  task_completion_rate: number;
  patient_engagement_score: number;
  escalation_rate: number;
  provider_intervention_count: number;
  last_calculated: string;
}