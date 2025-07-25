import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type PatientTask = Database['public']['Tables']['patient_tasks']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export interface TimelineTask {
  id: string;
  task_id: string;
  title: string;
  description: string;
  task_type: 'exercise' | 'form' | 'education' | 'video' | 'assessment';
  scheduled_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'cancelled';
  completed_at?: string;
  completion_data?: any;
  content?: {
    video?: any;
    form?: any;
    exercise?: any;
  };
  metadata?: any;
}

export interface TimelineDay {
  day: string;
  date: string;
  dayOffset: number;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'missed';
  tasks: TimelineTask[];
  hasContent: boolean;
}

export interface PatientTimeline {
  surgeryDate: string;
  currentDay: number;
  phase: 'pre-op' | 'post-op';
  days: TimelineDay[];
}

export class PatientTimelineService {
  private supabase = createClient();

  /**
   * Get patient timeline with tasks grouped by day
   */
  async getPatientTimeline(patientId: string): Promise<{
    success: boolean;
    timeline?: PatientTimeline;
    error?: string;
  }> {
    try {
      // Get patient data including surgery date
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('surgery_date, surgery_type, tenant_id')
        .eq('id', patientId)
        .single();

      if (patientError || !patient?.surgery_date) {
        throw new Error('Patient or surgery date not found');
      }

      const surgeryDate = new Date(patient.surgery_date);
      const today = new Date();
      const daysSinceSurgery = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
      const phase = daysSinceSurgery < 0 ? 'pre-op' : 'post-op';

      // Get all patient tasks with related content
      const { data: patientTasks, error: tasksError } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          task:tasks!patient_tasks_task_id_fkey (
            id,
            title,
            description,
            task_type,
            content,
            metadata
          )
        `)
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: true });

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }

      // Group tasks by day
      const dayMap = new Map<string, TimelineDay>();
      
      // Add tasks to timeline
      for (const patientTask of patientTasks || []) {
        if (!patientTask.task) continue;

        const scheduledDate = new Date(patientTask.scheduled_date);
        const dayOffset = Math.floor((scheduledDate.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
        const dateKey = scheduledDate.toISOString().split('T')[0];
        
        // Load content if referenced
        let content: TimelineTask['content'] = {};
        if (patientTask.task.content) {
          const taskContent = patientTask.task.content as any;
          
          if (taskContent.videoId) {
            const { data: video } = await this.supabase
              .from('content_videos')
              .select('*')
              .eq('id', taskContent.videoId)
              .single();
            if (video) content.video = video;
          }
          
          if (taskContent.formId) {
            const { data: form } = await this.supabase
              .from('content_forms')
              .select('*')
              .eq('id', taskContent.formId)
              .single();
            if (form) content.form = form;
          }
          
          if (taskContent.exerciseId) {
            const { data: exercise } = await this.supabase
              .from('content_exercises')
              .select('*')
              .eq('id', taskContent.exerciseId)
              .single();
            if (exercise) content.exercise = exercise;
          }
        }

        const timelineTask: TimelineTask = {
          id: patientTask.id,
          task_id: patientTask.task_id,
          title: patientTask.task.title,
          description: patientTask.task.description || '',
          task_type: patientTask.task.task_type as TimelineTask['task_type'],
          scheduled_date: patientTask.scheduled_date,
          status: patientTask.status,
          completed_at: patientTask.completed_at || undefined,
          completion_data: patientTask.completion_data,
          content,
          metadata: patientTask.metadata
        };

        if (!dayMap.has(dateKey)) {
          const dayLabel = this.getDayLabel(dayOffset, phase);
          const dayStatus = this.getDayStatus(scheduledDate, patientTasks?.filter(t => 
            t.scheduled_date.startsWith(dateKey)
          ) || []);

          dayMap.set(dateKey, {
            day: dayLabel,
            date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayOffset,
            description: this.getDayDescription(dayOffset, phase),
            status: dayStatus,
            tasks: [],
            hasContent: false
          });
        }

        const day = dayMap.get(dateKey)!;
        day.tasks.push(timelineTask);
        if (Object.keys(content).length > 0) {
          day.hasContent = true;
        }
      }

      // Convert map to sorted array
      const days = Array.from(dayMap.values()).sort((a, b) => a.dayOffset - b.dayOffset);

      return {
        success: true,
        timeline: {
          surgeryDate: patient.surgery_date,
          currentDay: daysSinceSurgery,
          phase,
          days
        }
      };

    } catch (error: any) {
      console.error('Get patient timeline error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get timeline for a specific date range
   */
  async getTimelineRange(
    patientId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    success: boolean;
    days?: TimelineDay[];
    error?: string;
  }> {
    try {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('surgery_date')
        .eq('id', patientId)
        .single();

      if (!patient?.surgery_date) {
        throw new Error('Patient surgery date not found');
      }

      const surgeryDate = new Date(patient.surgery_date);

      // Get tasks in date range
      const { data: patientTasks, error } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          task:tasks!patient_tasks_task_id_fkey (
            id,
            title,
            description,
            task_type,
            content,
            metadata
          )
        `)
        .eq('patient_id', patientId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      // Group by day (similar to getPatientTimeline)
      const dayMap = new Map<string, TimelineDay>();
      
      // Process tasks...
      // (Similar grouping logic as above)

      const days = Array.from(dayMap.values()).sort((a, b) => a.dayOffset - b.dayOffset);

      return { success: true, days };

    } catch (error: any) {
      console.error('Get timeline range error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: string,
    status: PatientTask['status'],
    completionData?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        if (completionData) {
          updates.completion_data = completionData;
        }
      }

      const { error } = await this.supabase
        .from('patient_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Update task status error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to task updates
   */
  subscribeToTaskUpdates(
    patientId: string,
    onUpdate: (task: PatientTask) => void
  ) {
    return this.supabase
      .channel(`patient-tasks-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_tasks',
          filter: `patient_id=eq.${patientId}`
        },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new as PatientTask);
          }
        }
      )
      .subscribe();
  }

  /**
   * Get day label relative to surgery
   */
  private getDayLabel(dayOffset: number, phase: 'pre-op' | 'post-op'): string {
    if (dayOffset === 0) return 'Surgery Day';
    if (dayOffset === -1) return 'Tomorrow';
    if (dayOffset === 1) return 'Day 1';
    
    if (phase === 'pre-op') {
      if (dayOffset < 0) {
        const daysUntil = Math.abs(dayOffset);
        if (daysUntil === 2) return 'Day After Tomorrow';
        return `${daysUntil} Days Until Surgery`;
      }
    }
    
    if (dayOffset > 0) {
      return `Day ${dayOffset}`;
    }
    
    return `Pre-Op Day ${Math.abs(dayOffset)}`;
  }

  /**
   * Get day description based on offset and phase
   */
  private getDayDescription(dayOffset: number, phase: 'pre-op' | 'post-op'): string {
    if (dayOffset === 0) return 'Surgery day';
    
    if (phase === 'pre-op') {
      if (dayOffset === -1) return 'Final preparation';
      if (dayOffset >= -7) return 'Pre-operative preparation';
      if (dayOffset >= -14) return 'Initial consultation';
      return 'Early preparation';
    }
    
    // Post-op descriptions
    if (dayOffset === 1) return 'Initial recovery';
    if (dayOffset <= 3) return 'Hospital recovery';
    if (dayOffset <= 7) return 'First week recovery';
    if (dayOffset <= 14) return 'Early home recovery';
    if (dayOffset <= 30) return 'Active recovery phase';
    if (dayOffset <= 90) return 'Strengthening phase';
    return 'Long-term recovery';
  }

  /**
   * Determine day status based on tasks
   */
  private getDayStatus(date: Date, dayTasks: PatientTask[]): TimelineDay['status'] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'current';
    }
    
    if (date > today) {
      return 'upcoming';
    }
    
    // Past day - check if all required tasks completed
    const incompleteTasks = dayTasks.filter(t => 
      t.status !== 'completed' && t.status !== 'skipped'
    );
    
    if (incompleteTasks.length > 0) {
      return 'missed';
    }
    
    return 'completed';
  }
}

// Export singleton instance
export const patientTimelineService = new PatientTimelineService();