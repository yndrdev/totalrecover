import { createClient } from '@/lib/supabase/client';

interface ProtocolTask {
  id: string;
  title: string;
  description: string;
  task_type: string;
  day_number: number;
  time_of_day?: string;
  estimated_duration_minutes?: number;
  is_required: boolean;
  can_repeat: boolean;
  max_attempts: number;
  chat_prompt?: string;
  completion_criteria?: any;
  content_data?: any;
  instructions?: string;
  category?: string;
}

interface Patient {
  id: string;
  surgery_date: string;
  tenant_id: string;
  protocol_id: string;
}

export class ProtocolInstantiationService {
  private supabase = createClient();

  /**
   * Generate patient-specific tasks when a protocol is assigned
   */
  async instantiateProtocolForPatient(
    patientId: string, 
    protocolId: string
  ): Promise<{ success: boolean; tasksCreated: number; error?: string }> {
    try {
      // Get patient info including surgery date
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, surgery_date, tenant_id, protocol_id')
        .eq('id', patientId)
        .single();

      if (patientError || !patient) {
        throw new Error(`Patient not found: ${patientError?.message}`);
      }

      // Get protocol tasks
      const { data: protocolTasks, error: tasksError } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('day_number', { ascending: true });

      if (tasksError) {
        throw new Error(`Failed to fetch protocol tasks: ${tasksError.message}`);
      }

      if (!protocolTasks || protocolTasks.length === 0) {
        return { success: true, tasksCreated: 0 };
      }

      // Calculate scheduled dates based on surgery date
      const surgeryDate = new Date(patient.surgery_date);
      const patientTasks = protocolTasks.map((task: ProtocolTask) => {
        const scheduledDate = new Date(surgeryDate);
        scheduledDate.setDate(surgeryDate.getDate() + task.day_number);

        return {
          id: crypto.randomUUID(),
          tenant_id: patient.tenant_id,
          patient_id: patientId,
          task_id: task.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_time: task.time_of_day,
          due_date: scheduledDate.toISOString().split('T')[0],
          status: 'pending',
          completion_data: {},
          day: task.day_number,
          title: task.title,
          description: task.description,
          type: task.task_type,
          required: task.is_required,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      // Delete existing tasks for this patient to avoid duplicates
      await this.supabase
        .from('patient_tasks')
        .delete()
        .eq('patient_id', patientId);

      // Insert new patient tasks
      const { error: insertError } = await this.supabase
        .from('patient_tasks')
        .insert(patientTasks);

      if (insertError) {
        throw new Error(`Failed to create patient tasks: ${insertError.message}`);
      }

      return { 
        success: true, 
        tasksCreated: patientTasks.length 
      };

    } catch (error: any) {
      console.error('Protocol instantiation error:', error);
      return { 
        success: false, 
        tasksCreated: 0, 
        error: error.message 
      };
    }
  }

  /**
   * Update patient tasks when recovery day changes
   */
  async updatePatientRecoveryDay(
    patientId: string, 
    newRecoveryDay: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update patient's current recovery day
      const { error: updateError } = await this.supabase
        .from('patients')
        .update({ 
          current_recovery_day: newRecoveryDay,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (updateError) {
        throw new Error(`Failed to update recovery day: ${updateError.message}`);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Recovery day update error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get tasks for a specific patient and recovery day
   */
  async getPatientTasksForDay(
    patientId: string, 
    recoveryDay: number
  ): Promise<{ success: boolean; tasks: any[]; error?: string }> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks (
            title,
            description,
            task_type,
            chat_prompt,
            completion_criteria,
            content_data,
            instructions,
            category
          )
        `)
        .eq('patient_id', patientId)
        .eq('day', recoveryDay)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch patient tasks: ${error.message}`);
      }

      return { 
        success: true, 
        tasks: tasks || [] 
      };

    } catch (error: any) {
      console.error('Get patient tasks error:', error);
      return { 
        success: false, 
        tasks: [],
        error: error.message 
      };
    }
  }

  /**
   * Complete a patient task and update chat context
   */
  async completePatientTask(
    taskId: string, 
    completionData: any = {},
    conversationId?: string,
    messageId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_data: completionData,
        updated_at: new Date().toISOString()
      };

      if (conversationId) {
        updateData.conversation_id = conversationId;
      }

      if (messageId) {
        updateData.chat_message_id = messageId;
      }

      const { error } = await this.supabase
        .from('patient_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        throw new Error(`Failed to complete task: ${error.message}`);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Complete task error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Re-instantiate protocol tasks when protocol is updated
   */
  async updateProtocolTasks(
    patientId: string, 
    protocolId: string
  ): Promise<{ success: boolean; tasksUpdated: number; error?: string }> {
    try {
      // Get current patient tasks to preserve completion status
      const { data: existingTasks } = await this.supabase
        .from('patient_tasks')
        .select('day, status, completed_at, completion_data')
        .eq('patient_id', patientId);

      const completedTasksByDay = new Map();
      existingTasks?.forEach(task => {
        if (task.status === 'completed') {
          completedTasksByDay.set(task.day, {
            status: task.status,
            completed_at: task.completed_at,
            completion_data: task.completion_data
          });
        }
      });

      // Re-instantiate protocol
      const result = await this.instantiateProtocolForPatient(patientId, protocolId);
      
      if (!result.success) {
        return result;
      }

      // Restore completed task status
      if (completedTasksByDay.size > 0) {
        for (const [day, taskData] of completedTasksByDay) {
          await this.supabase
            .from('patient_tasks')
            .update({
              status: taskData.status,
              completed_at: taskData.completed_at,
              completion_data: taskData.completion_data
            })
            .eq('patient_id', patientId)
            .eq('day', day);
        }
      }

      return { 
        success: true, 
        tasksUpdated: result.tasksCreated 
      };

    } catch (error: any) {
      console.error('Update protocol tasks error:', error);
      return { 
        success: false, 
        tasksUpdated: 0, 
        error: error.message 
      };
    }
  }
}

export const protocolInstantiationService = new ProtocolInstantiationService();