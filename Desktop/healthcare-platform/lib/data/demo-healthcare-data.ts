// Demo Healthcare Data for Provider Dashboard
// This file contains realistic mock data for the demo site

export interface DemoProvider {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'surgeon' | 'nurse' | 'physical_therapist' | 'practice_admin'
  tenant_id: string
  profile_image?: string
  specialization?: string
}

export interface DemoPatient {
  id: string
  first_name: string
  last_name: string
  email: string
  surgery_date: string
  surgery_type: 'TKA' | 'THA' | 'TSA'
  surgery_side: 'left' | 'right' | 'bilateral'
  status: 'active' | 'inactive' | 'completed'
  protocol_id: string
  surgeon_id: string
  primary_nurse_id: string
  physical_therapist_id: string
  phone_number: string
  medical_record_number: string
  insurance_provider: string
  insurance_policy_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  created_at: string
  updated_at: string
  last_activity?: string
  recovery_progress: number
  compliance_rate: number
  pain_level: number
}

export interface DemoTask {
  id: string
  patient_id: string
  task_id: string
  title: string
  description: string
  task_type: 'exercise' | 'questionnaire' | 'education' | 'medication'
  scheduled_date: string
  status: 'pending' | 'completed' | 'missed' | 'skipped'
  completed_at?: string
  phase: string
  day_offset: number
}

export interface DemoMessage {
  id: string
  conversation_id: string
  patient_id: string
  sender_type: 'patient' | 'ai' | 'provider'
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  metadata?: any
}

export interface DemoAlert {
  id: string
  patient_id: string
  patient_name: string
  type: 'pain' | 'missed_tasks' | 'compliance' | 'urgent'
  severity: 'low' | 'medium' | 'high'
  message: string
  created_at: string
  resolved: boolean
}

// Demo Providers
export const demoProviders: DemoProvider[] = [
  {
    id: 'demo-surgeon-1',
    email: 'sarah.martinez@tjvrecovery.com',
    first_name: 'Sarah',
    last_name: 'Martinez',
    role: 'surgeon',
    tenant_id: 'demo-tenant',
    specialization: 'Orthopedic Surgery'
  },
  {
    id: 'demo-nurse-1',
    email: 'jessica.chen@tjvrecovery.com',
    first_name: 'Jessica',
    last_name: 'Chen',
    role: 'nurse',
    tenant_id: 'demo-tenant',
    specialization: 'Post-Surgical Care'
  },
  {
    id: 'demo-pt-1',
    email: 'michael.thompson@tjvrecovery.com',
    first_name: 'Michael',
    last_name: 'Thompson',
    role: 'physical_therapist',
    tenant_id: 'demo-tenant',
    specialization: 'Joint Rehabilitation'
  },
  {
    id: 'demo-admin-1',
    email: 'robert.kim@tjvrecovery.com',
    first_name: 'Robert',
    last_name: 'Kim',
    role: 'practice_admin',
    tenant_id: 'demo-tenant'
  }
]

// Demo Patients with realistic recovery timelines
export const demoPatients: DemoPatient[] = [
  // Post-surgery patients
  {
    id: 'patient-1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@email.com',
    surgery_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    surgery_type: 'TKA',
    surgery_side: 'right',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 123-4567',
    medical_record_number: 'MRN-001234',
    insurance_provider: 'Blue Cross Blue Shield',
    insurance_policy_number: 'BCBS-789456',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4568',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    recovery_progress: 21,
    compliance_rate: 92,
    pain_level: 3
  },
  {
    id: 'patient-2',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@email.com',
    surgery_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    surgery_type: 'THA',
    surgery_side: 'left',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 234-5678',
    medical_record_number: 'MRN-002345',
    insurance_provider: 'Aetna',
    insurance_policy_number: 'AET-123789',
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '(555) 234-5679',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    recovery_progress: 64,
    compliance_rate: 95,
    pain_level: 2
  },
  // Pre-surgery patients
  {
    id: 'patient-3',
    first_name: 'Lisa',
    last_name: 'Rodriguez',
    email: 'lisa.rodriguez@email.com',
    surgery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    surgery_type: 'TKA',
    surgery_side: 'bilateral',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 345-6789',
    medical_record_number: 'MRN-003456',
    insurance_provider: 'UnitedHealth',
    insurance_policy_number: 'UHC-456123',
    emergency_contact_name: 'Carlos Rodriguez',
    emergency_contact_phone: '(555) 345-6790',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    recovery_progress: 0,
    compliance_rate: 88,
    pain_level: 5
  },
  {
    id: 'patient-4',
    first_name: 'David',
    last_name: 'Williams',
    email: 'david.williams@email.com',
    surgery_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    surgery_type: 'TSA',
    surgery_side: 'right',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 456-7890',
    medical_record_number: 'MRN-004567',
    insurance_provider: 'Cigna',
    insurance_policy_number: 'CIG-789456',
    emergency_contact_name: 'Mary Williams',
    emergency_contact_phone: '(555) 456-7891',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    recovery_progress: 4,
    compliance_rate: 85,
    pain_level: 6
  },
  // More patients with various recovery stages
  {
    id: 'patient-5',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily.davis@email.com',
    surgery_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    surgery_type: 'TKA',
    surgery_side: 'left',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 567-8901',
    medical_record_number: 'MRN-005678',
    insurance_provider: 'Anthem',
    insurance_policy_number: 'ANT-123456',
    emergency_contact_name: 'Robert Davis',
    emergency_contact_phone: '(555) 567-8902',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    recovery_progress: 90,
    compliance_rate: 98,
    pain_level: 1
  },
  {
    id: 'patient-6',
    first_name: 'James',
    last_name: 'Miller',
    email: 'james.miller@email.com',
    surgery_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    surgery_type: 'THA',
    surgery_side: 'right',
    status: 'active',
    protocol_id: 'tjv-protocol',
    surgeon_id: 'demo-surgeon-1',
    primary_nurse_id: 'demo-nurse-1',
    physical_therapist_id: 'demo-pt-1',
    phone_number: '(555) 678-9012',
    medical_record_number: 'MRN-006789',
    insurance_provider: 'Kaiser Permanente',
    insurance_policy_number: 'KP-789123',
    emergency_contact_name: 'Susan Miller',
    emergency_contact_phone: '(555) 678-9013',
    created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // Missed yesterday
    last_activity: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    recovery_progress: 35,
    compliance_rate: 75,
    pain_level: 4
  }
]

// Generate realistic chat messages
export function generateDemoMessages(patientId: string): DemoMessage[] {
  const patient = demoPatients.find(p => p.id === patientId)
  if (!patient) return []

  const daysSinceSurgery = Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceSurgery < 0) {
    // Pre-surgery messages
    return [
      {
        id: `msg-${patientId}-1`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: `Good morning ${patient.first_name}! Your surgery is scheduled for ${new Date(patient.surgery_date).toLocaleDateString()}. How are you feeling about the upcoming procedure?`,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-2`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'patient',
        sender_id: patientId,
        sender_name: `${patient.first_name} ${patient.last_name}`,
        content: "I'm a bit nervous but ready to get this done. The pre-surgery exercises have been helping.",
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-3`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: "That's wonderful to hear! Keeping up with the pre-surgery exercises will really help with your recovery. Remember to complete today's pre-op questionnaire when you have a moment.",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]
  } else if (daysSinceSurgery <= 7) {
    // Early post-surgery
    return [
      {
        id: `msg-${patientId}-1`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: `Good morning ${patient.first_name}! You're on day ${daysSinceSurgery} of your recovery. How is your pain level today on a scale of 1-10?`,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-2`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'patient',
        sender_id: patientId,
        sender_name: `${patient.first_name} ${patient.last_name}`,
        content: `It's about a ${patient.pain_level} today. The ice packs are helping.`,
        created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-3`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: "Good job using the ice packs! Remember to ice for 20 minutes at a time, with at least 40 minutes between sessions. Are you ready to try today's gentle range of motion exercises?",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  } else {
    // Later recovery
    return [
      {
        id: `msg-${patientId}-1`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: `Great progress ${patient.first_name}! You're ${Math.round(patient.recovery_progress)}% through your recovery journey. Today we have some strengthening exercises planned.`,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-2`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'patient',
        sender_id: patientId,
        sender_name: `${patient.first_name} ${patient.last_name}`,
        content: "I completed the morning exercises. My range of motion is definitely improving!",
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `msg-${patientId}-3`,
        conversation_id: `conv-${patientId}`,
        patient_id: patientId,
        sender_type: 'ai',
        sender_id: 'ai-coach',
        sender_name: 'TJV Recovery Coach',
        content: "Excellent work! Consistent exercise is key to your recovery. Your compliance rate of " + patient.compliance_rate + "% is outstanding. Keep it up!",
        created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

// Generate demo alerts
export function generateDemoAlerts(): DemoAlert[] {
  return [
    {
      id: 'alert-1',
      patient_id: 'patient-6',
      patient_name: 'James Miller',
      type: 'missed_tasks',
      severity: 'medium',
      message: 'Missed daily check-in for 2 consecutive days',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: 'alert-2',
      patient_id: 'patient-4',
      patient_name: 'David Williams',
      type: 'pain',
      severity: 'high',
      message: 'Reported pain level of 6/10 - above threshold',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: 'alert-3',
      patient_id: 'patient-3',
      patient_name: 'Lisa Rodriguez',
      type: 'compliance',
      severity: 'low',
      message: 'Pre-surgery education modules 88% complete',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      resolved: false
    }
  ]
}

// Analytics data
export function generateDemoAnalytics() {
  const totalPatients = demoPatients.length
  const activePatients = demoPatients.filter(p => p.status === 'active').length
  const preSurgery = demoPatients.filter(p => new Date(p.surgery_date) > new Date()).length
  const postSurgery = demoPatients.filter(p => new Date(p.surgery_date) <= new Date()).length
  const avgCompliance = Math.round(demoPatients.reduce((sum, p) => sum + p.compliance_rate, 0) / totalPatients)
  const avgPainLevel = Math.round(demoPatients.reduce((sum, p) => sum + p.pain_level, 0) / totalPatients * 10) / 10

  return {
    totalPatients,
    activePatients,
    preSurgery,
    postSurgery,
    avgCompliance,
    avgPainLevel,
    completedTasks: 847,
    pendingTasks: 234,
    missedTasks: 45,
    taskCompletionRate: 88,
    avgRecoveryTime: 84,
    patientSatisfaction: 4.6,
    monthlyTrends: [
      { month: 'Oct', patients: 22, satisfaction: 4.4 },
      { month: 'Nov', patients: 28, satisfaction: 4.5 },
      { month: 'Dec', patients: 25, satisfaction: 4.6 },
      { month: 'Jan', patients: totalPatients, satisfaction: 4.6 }
    ]
  }
}

// Recent activity for audit logs
export function generateRecentActivity() {
  return [
    {
      id: 'activity-1',
      description: 'Assigned TJV Recovery Protocol to Sarah Johnson',
      user_name: 'Dr. Sarah Martinez',
      user_role: 'surgeon',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action_type: 'assign_protocol'
    },
    {
      id: 'activity-2',
      description: 'Modified exercise plan for James Miller',
      user_name: 'Michael Thompson',
      user_role: 'physical_therapist',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action_type: 'modify_exercise'
    },
    {
      id: 'activity-3',
      description: 'Completed pain assessment for David Williams',
      user_name: 'Jessica Chen',
      user_role: 'nurse',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      action_type: 'complete_task'
    },
    {
      id: 'activity-4',
      description: 'Updated surgery date for Lisa Rodriguez',
      user_name: 'Dr. Sarah Martinez',
      user_role: 'surgeon',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      action_type: 'update_patient'
    },
    {
      id: 'activity-5',
      description: 'Reviewed analytics dashboard',
      user_name: 'Robert Kim',
      user_role: 'practice_admin',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      action_type: 'view_analytics'
    }
  ]
}
