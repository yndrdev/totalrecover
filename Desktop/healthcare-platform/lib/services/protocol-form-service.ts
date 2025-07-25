import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { FormExtractionService, ExtractedForm } from './form-extraction-service';

type Protocol = Database['public']['Tables']['protocols']['Row'];
type ProtocolTask = Database['public']['Tables']['protocol_tasks']['Row'];
type PatientProtocol = Database['public']['Tables']['patient_protocols']['Row'];
type PatientForm = Database['public']['Tables']['patient_forms']['Row'];

export interface ProtocolForm {
  taskId: string;
  formId: string;
  form: ExtractedForm | null;
  scheduledDay: number;
  isRequired: boolean;
  frequency: {
    startDay: number;
    stopDay: number;
    repeat: boolean;
  };
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface PatientProtocolForms {
  protocolId: string;
  protocolName: string;
  currentDay: number;
  forms: ProtocolForm[];
  todaysForms: ProtocolForm[];
  upcomingForms: ProtocolForm[];
  completedForms: ProtocolForm[];
}

export class ProtocolFormService {
  private supabase;
  private formExtractionService: FormExtractionService;

  constructor() {
    this.supabase = createClient();
    this.formExtractionService = new FormExtractionService();
  }

  /**
   * Get all forms for a patient's active protocol
   */
  async getPatientProtocolForms(patientId: string): Promise<PatientProtocolForms | null> {
    try {
      // Get active patient protocol
      const { data: patientProtocol, error: protocolError } = await this.supabase
        .from('patient_protocols')
        .select(`
          *,
          protocols!inner(*)
        `)
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single();

      if (protocolError || !patientProtocol) {
        console.error('Error fetching patient protocol:', protocolError);
        return null;
      }

      // Calculate current recovery day
      const surgeryDate = new Date(patientProtocol.surgery_date);
      const today = new Date();
      const currentDay = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get all form tasks from the protocol
      const { data: formTasks, error: tasksError } = await this.supabase
        .from('protocol_tasks')
        .select('*')
        .eq('protocol_id', patientProtocol.protocol_id)
        .eq('type', 'form')
        .order('day', { ascending: true });

      if (tasksError) {
        console.error('Error fetching protocol tasks:', tasksError);
        return null;
      }

      // Process each form task
      const protocolForms: ProtocolForm[] = [];
      
      for (const task of formTasks || []) {
        // Parse form ID from task content (assuming it's stored as JSON)
        let formId: string;
        try {
          const content = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
          formId = content.formId || content.form_id;
        } catch (e) {
          console.error('Error parsing task content:', e);
          continue;
        }

        if (!formId) continue;

        // Extract form details
        const extractedForm = await this.formExtractionService.extractFormById(formId);

        // Check if form has been completed
        const { data: patientForm } = await this.supabase
          .from('patient_forms')
          .select('*')
          .eq('patient_id', patientId)
          .eq('form_template_id', formId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine if this form should be shown based on frequency
        const shouldShowForm = this.shouldShowFormForDay(
          currentDay,
          task.frequency_start_day || task.day,
          task.frequency_stop_day || task.day,
          task.frequency_repeat || false
        );

        if (shouldShowForm || patientForm) {
          protocolForms.push({
            taskId: task.id,
            formId: formId,
            form: extractedForm,
            scheduledDay: task.day,
            isRequired: task.required || false,
            frequency: {
              startDay: task.frequency_start_day || task.day,
              stopDay: task.frequency_stop_day || task.day,
              repeat: task.frequency_repeat || false
            },
            status: patientForm?.status === 'completed' ? 'completed' : 
                   patientForm?.status === 'in_progress' ? 'in_progress' : 'pending',
            completedAt: patientForm?.completed_at ? new Date(patientForm.completed_at) : undefined
          });
        }
      }

      // Categorize forms
      const todaysForms = protocolForms.filter(form => 
        this.isFormDueToday(form, currentDay) && form.status !== 'completed'
      );
      
      const upcomingForms = protocolForms.filter(form => 
        this.isFormUpcoming(form, currentDay) && form.status !== 'completed'
      );
      
      const completedForms = protocolForms.filter(form => 
        form.status === 'completed'
      );

      return {
        protocolId: patientProtocol.protocol_id,
        protocolName: patientProtocol.protocols.name,
        currentDay,
        forms: protocolForms,
        todaysForms,
        upcomingForms,
        completedForms
      };
    } catch (error) {
      console.error('Error in getPatientProtocolForms:', error);
      return null;
    }
  }

  /**
   * Get forms scheduled for a specific day in the protocol
   */
  async getFormsForDay(protocolId: string, day: number): Promise<ProtocolForm[]> {
    try {
      const { data: formTasks, error } = await this.supabase
        .from('protocol_tasks')
        .select('*')
        .eq('protocol_id', protocolId)
        .eq('type', 'form')
        .gte('frequency_start_day', day)
        .lte('frequency_stop_day', day);

      if (error) {
        console.error('Error fetching forms for day:', error);
        return [];
      }

      const forms: ProtocolForm[] = [];
      
      for (const task of formTasks || []) {
        // Check if form should be shown on this day
        if (this.shouldShowFormForDay(day, task.frequency_start_day || task.day, 
            task.frequency_stop_day || task.day, task.frequency_repeat || false)) {
          
          let formId: string;
          try {
            const content = typeof task.content === 'string' ? JSON.parse(task.content) : task.content;
            formId = content.formId || content.form_id;
          } catch (e) {
            console.error('Error parsing task content:', e);
            continue;
          }

          const extractedForm = await this.formExtractionService.extractFormById(formId);
          
          forms.push({
            taskId: task.id,
            formId: formId,
            form: extractedForm,
            scheduledDay: task.day,
            isRequired: task.required || false,
            frequency: {
              startDay: task.frequency_start_day || task.day,
              stopDay: task.frequency_stop_day || task.day,
              repeat: task.frequency_repeat || false
            },
            status: 'pending'
          });
        }
      }

      return forms;
    } catch (error) {
      console.error('Error in getFormsForDay:', error);
      return [];
    }
  }

  /**
   * Create or update a patient form instance
   */
  async createPatientFormInstance(patientId: string, formTemplateId: string, protocolTaskId?: string): Promise<string | null> {
    try {
      // Check if form already exists for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingForm } = await this.supabase
        .from('patient_forms')
        .select('id')
        .eq('patient_id', patientId)
        .eq('form_template_id', formTemplateId)
        .eq('assigned_date', today.toISOString().split('T')[0])
        .single();

      if (existingForm) {
        return existingForm.id;
      }

      // Create new form instance
      const { data: newForm, error } = await this.supabase
        .from('patient_forms')
        .insert({
          patient_id: patientId,
          form_template_id: formTemplateId,
          assigned_date: today.toISOString().split('T')[0],
          due_date: today.toISOString().split('T')[0],
          status: 'assigned',
          metadata: protocolTaskId ? { protocol_task_id: protocolTaskId } : {}
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating patient form instance:', error);
        return null;
      }

      return newForm.id;
    } catch (error) {
      console.error('Error in createPatientFormInstance:', error);
      return null;
    }
  }

  /**
   * Update form completion status
   */
  async updateFormStatus(patientFormId: string, status: 'in_progress' | 'completed', completionPercentage?: number): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completion_percentage = 100;
      } else if (completionPercentage !== undefined) {
        updateData.completion_percentage = completionPercentage;
      }

      const { error } = await this.supabase
        .from('patient_forms')
        .update(updateData)
        .eq('id', patientFormId);

      if (error) {
        console.error('Error updating form status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateFormStatus:', error);
      return false;
    }
  }

  /**
   * Helper: Check if form should be shown for a specific day
   */
  private shouldShowFormForDay(currentDay: number, startDay: number, stopDay: number, repeat: boolean): boolean {
    if (!repeat) {
      return currentDay === startDay;
    }
    return currentDay >= startDay && currentDay <= stopDay;
  }

  /**
   * Helper: Check if form is due today
   */
  private isFormDueToday(form: ProtocolForm, currentDay: number): boolean {
    return this.shouldShowFormForDay(currentDay, form.frequency.startDay, form.frequency.stopDay, form.frequency.repeat);
  }

  /**
   * Helper: Check if form is upcoming
   */
  private isFormUpcoming(form: ProtocolForm, currentDay: number): boolean {
    return form.frequency.startDay > currentDay || 
           (form.frequency.repeat && form.frequency.stopDay > currentDay && form.frequency.startDay <= currentDay);
  }

  /**
   * Get next form to be completed for a patient
   */
  async getNextPendingForm(patientId: string): Promise<ProtocolForm | null> {
    const protocolForms = await this.getPatientProtocolForms(patientId);
    
    if (!protocolForms) return null;
    
    // First check today's forms
    if (protocolForms.todaysForms.length > 0) {
      return protocolForms.todaysForms[0];
    }
    
    // Then check upcoming forms
    if (protocolForms.upcomingForms.length > 0) {
      // Sort by scheduled day and return the earliest
      const sorted = protocolForms.upcomingForms.sort((a, b) => a.scheduledDay - b.scheduledDay);
      return sorted[0];
    }
    
    return null;
  }
}