'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

export interface ProtocolTask {
  id: string
  title: string
  description: string
  task_type: 'exercise' | 'form' | 'education' | 'video'
  content?: {
    videoId?: string
    formId?: string
    exerciseId?: string
  }
  phase: string
  day_offset: number
  frequency: {
    repeat: boolean
    type?: 'daily' | 'everyOtherDay' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
    interval?: number
  }
  created_at?: string
}

export interface Protocol {
  id: string
  title: string
  description: string
  surgery_type: string
  tasks: ProtocolTask[]
  created_by: string
  tenant_id: string
  created_at?: string
}

export interface PatientProtocolAssignment {
  id: string
  patient_id: string
  protocol_id: string
  assigned_date: string
  status: 'active' | 'completed' | 'paused'
  tenant_id: string
}

type SupabaseTask = Database['public']['Tables']['tasks']['Row']
type SupabasePatientTask = Database['public']['Tables']['patient_tasks']['Row']

/**
 * Protocol-Patient Integration Service
 * Handles synchronization between protocol builder tasks and patient chat timeline
 */
export class ProtocolPatientIntegrationService {
  private supabase = createClient()

  /**
   * Assign a protocol to a patient and generate all tasks
   */
  async assignProtocolToPatient(
    protocolId: string,
    patientId: string,
    startDate?: Date
  ): Promise<{ success: boolean; error?: string; tasksCreated?: number }> {
    try {
      // Get patient data to determine surgery date and tenant
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('surgery_date, tenant_id, surgery_type')
        .eq('id', patientId)
        .single()

      if (patientError || !patient) {
        return { success: false, error: 'Patient not found' }
      }

      const surgeryDate = startDate || new Date(patient.surgery_date || '')
      
      // Get protocol with tasks
      const protocol = await this.getProtocolWithTasks(protocolId)
      if (!protocol) {
        return { success: false, error: 'Protocol not found' }
      }

      // Check if protocol is already assigned
      const { data: existingAssignment } = await this.supabase
        .from('protocol_assignments')
        .select('id')
        .eq('patient_id', patientId)
        .eq('protocol_id', protocolId)
        .eq('status', 'active')
        .single()

      let assignmentId = existingAssignment?.id

      // Create assignment if it doesn't exist
      if (!assignmentId) {
        const { data: assignment, error: assignmentError } = await this.supabase
          .from('protocol_assignments')
          .insert({
            patient_id: patientId,
            protocol_id: protocolId,
            assigned_date: surgeryDate.toISOString(),
            status: 'active',
            tenant_id: patient.tenant_id
          })
          .select('id')
          .single()

        if (assignmentError) {
          return { success: false, error: 'Failed to create protocol assignment' }
        }
        
        assignmentId = assignment.id
      }

      // Generate tasks for the timeline
      const tasksCreated = await this.generatePatientTasks(
        protocol,
        patientId,
        surgeryDate,
        patient.tenant_id,
        assignmentId
      )

      return { 
        success: true, 
        tasksCreated,
        error: undefined 
      }

    } catch (error) {
      console.error('Error assigning protocol to patient:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Generate patient tasks from protocol tasks with frequency scheduling
   */
  private async generatePatientTasks(
    protocol: Protocol,
    patientId: string,
    surgeryDate: Date,
    tenantId: string,
    assignmentId: string
  ): Promise<number> {
    let tasksCreated = 0

    for (const protocolTask of protocol.tasks) {
      // Create base task in tasks table
      const { data: createdTask, error: taskError } = await this.supabase
        .from('tasks')
        .insert({
          title: protocolTask.title,
          description: protocolTask.description,
          task_type: protocolTask.task_type,
          tenant_id: tenantId,
          surgery_type: protocol.surgery_type,
          phase: protocolTask.phase,
          day_offset: protocolTask.day_offset,
          content: protocolTask.content || null,
          metadata: {
            protocol_id: protocol.id,
            frequency: protocolTask.frequency
          }
        })
        .select()
        .single()

      if (taskError || !createdTask) {
        console.error('Error creating task:', taskError)
        continue
      }

      // Generate scheduled patient tasks based on frequency
      const scheduledDates = this.calculateTaskSchedule(
        protocolTask,
        surgeryDate,
        protocolTask.day_offset
      )

      for (const scheduledDate of scheduledDates) {
        const { error: patientTaskError } = await this.supabase
          .from('patient_tasks')
          .insert({
            patient_id: patientId,
            task_id: createdTask.id,
            protocol_assignment_id: assignmentId,
            scheduled_date: this.formatDate(scheduledDate),
            status: 'pending',
            tenant_id: tenantId,
            metadata: {
              protocol_task_id: protocolTask.id,
              original_day_offset: protocolTask.day_offset,
              frequency_info: protocolTask.frequency
            }
          })

        if (patientTaskError) {
          console.error('Error creating patient task:', patientTaskError)
        } else {
          tasksCreated++
        }
      }
    }

    return tasksCreated
  }

  /**
   * Calculate all scheduled dates for a task based on its frequency
   */
  private calculateTaskSchedule(
    task: ProtocolTask,
    surgeryDate: Date,
    dayOffset: number
  ): Date[] {
    const scheduledDates: Date[] = []
    const startDate = new Date(surgeryDate)
    startDate.setDate(startDate.getDate() + dayOffset)

    if (!task.frequency.repeat) {
      // One-time task
      scheduledDates.push(new Date(startDate))
      return scheduledDates
    }

    // Calculate end date (200 days from surgery for comprehensive coverage)
    const endDate = new Date(surgeryDate)
    endDate.setDate(endDate.getDate() + 200)

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      scheduledDates.push(new Date(currentDate))

      // Calculate next occurrence based on frequency type
      switch (task.frequency.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'everyOtherDay':
          currentDate.setDate(currentDate.getDate() + 2)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14)
          break
        case 'monthly':
          currentDate.setDate(currentDate.getDate() + 30)
          break
        case 'custom':
          const interval = task.frequency.interval || 1
          currentDate.setDate(currentDate.getDate() + interval)
          break
        default:
          // Default to daily if no type specified
          currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    return scheduledDates
  }

  /**
   * Get protocol with all tasks
   */
  private async getProtocolWithTasks(protocolId: string): Promise<Protocol | null> {
    try {
      // This would typically query a protocols table
      // For now, return a mock protocol structure
      // In a real implementation, you'd fetch from database
      return {
        id: protocolId,
        title: 'TKR Recovery Protocol',
        description: 'Comprehensive Total Knee Replacement recovery protocol',
        surgery_type: 'TKR',
        tasks: [], // Tasks would be fetched from protocol_builder or saved protocols
        created_by: '',
        tenant_id: '',
      }
    } catch (error) {
      console.error('Error fetching protocol:', error)
      return null
    }
  }

  /**
   * Update task completion status and sync with protocol progress
   */
  async updateTaskCompletion(
    patientTaskId: string,
    status: 'completed' | 'in_progress' | 'pending',
    completionData?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
        if (completionData) {
          updates.completion_data = completionData
        }
      }

      const { error } = await this.supabase
        .from('patient_tasks')
        .update(updates)
        .eq('id', patientTaskId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get patient's protocol assignments and progress
   */
  async getPatientProtocolProgress(patientId: string) {
    try {
      const { data: assignments, error } = await this.supabase
        .from('protocol_assignments')
        .select(`
          *,
          patient_tasks (
            id,
            status,
            scheduled_date,
            completed_at,
            task:tasks (
              title,
              task_type,
              phase
            )
          )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')

      if (error) throw error

      return { success: true, data: assignments }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Sync tasks from protocol builder to patient timeline
   */
  async syncProtocolToPatient(
    protocolData: Protocol,
    patientId: string
  ): Promise<{ success: boolean; error?: string; tasksCreated?: number }> {
    try {
      // First save the protocol if it doesn't exist
      const { data: existingProtocol } = await this.supabase
        .from('protocols')
        .select('id')
        .eq('id', protocolData.id)
        .single()

      if (!existingProtocol) {
        const { error: protocolError } = await this.supabase
          .from('protocols')
          .insert({
            id: protocolData.id,
            title: protocolData.title,
            description: protocolData.description,
            surgery_type: protocolData.surgery_type,
            tasks: protocolData.tasks,
            created_by: protocolData.created_by,
            tenant_id: protocolData.tenant_id
          })

        if (protocolError) {
          return { success: false, error: 'Failed to save protocol' }
        }
      }

      // Assign protocol to patient
      return await this.assignProtocolToPatient(protocolData.id, patientId)
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get tasks for specific day (used by patient chat)
   */
  async getTasksForDay(
    patientId: string,
    dayOffset: number,
    surgeryDate: string
  ) {
    try {
      const targetDate = new Date(surgeryDate)
      targetDate.setDate(targetDate.getDate() + dayOffset)
      const dateStr = this.formatDate(targetDate)

      const { data: patientTasks, error } = await this.supabase
        .from('patient_tasks')
        .select(`
          id,
          status,
          scheduled_date,
          completed_at,
          task:tasks (
            id,
            title,
            description,
            task_type,
            phase,
            content
          )
        `)
        .eq('patient_id', patientId)
        .eq('scheduled_date', dateStr)
        .order('created_at', { ascending: true })

      if (error) throw error

      return { success: true, data: patientTasks }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Create AI chatbot response based on task completion
   */
  async generateTaskCompletionResponse(
    taskTitle: string,
    taskType: string,
    status: string
  ): Promise<string> {
    const responses = {
      completed: {
        exercise: [
          `Great work completing your ${taskTitle}! Consistent exercise is key to your recovery. How are you feeling after that exercise session?`,
          `Excellent job on your ${taskTitle}! Your dedication to your recovery exercises is paying off. Keep up the fantastic work!`,
          `Well done completing your ${taskTitle}! Recovery takes commitment, and you're showing great progress.`
        ],
        form: [
          `Thank you for completing your ${taskTitle}. Your feedback helps us monitor your recovery progress and adjust your care as needed.`,
          `Great job filling out your ${taskTitle}. This information helps your care team provide the best possible support for your recovery.`,
          `Thanks for completing your ${taskTitle}. Your responses help us track how well you're progressing in your recovery journey.`
        ],
        education: [
          `Excellent work watching your ${taskTitle}! Education is a crucial part of your recovery. Do you have any questions about what you learned?`,
          `Great job completing your ${taskTitle}! Understanding your recovery process helps you make informed decisions about your care.`,
          `Well done on finishing your ${taskTitle}! Knowledge is power in your recovery journey.`
        ]
      }
    }

    const taskResponses = responses.completed[taskType as keyof typeof responses.completed] || responses.completed.exercise
    const randomResponse = taskResponses[Math.floor(Math.random() * taskResponses.length)]
    
    return randomResponse
  }

  /**
   * Format date as YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// Export singleton instance
export const protocolIntegrationService = new ProtocolPatientIntegrationService()

// Helper functions for protocol builder integration
export async function syncProtocolBuilderToPatient(
  protocolTasks: ProtocolTask[],
  patientId: string,
  protocolMetadata: {
    title: string
    description: string
    surgery_type: string
    created_by: string
    tenant_id: string
  }
): Promise<{ success: boolean; error?: string; tasksCreated?: number }> {
  const protocol: Protocol = {
    id: `protocol_${Date.now()}`,
    tasks: protocolTasks,
    ...protocolMetadata
  }

  return await protocolIntegrationService.syncProtocolToPatient(protocol, patientId)
}

export async function generateAIChatResponse(
  taskTitle: string,
  taskType: string,
  status: string
): Promise<string> {
  return await protocolIntegrationService.generateTaskCompletionResponse(
    taskTitle,
    taskType,
    status
  )
}