import { createClient } from '@/lib/supabase/client';

interface Protocol {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  surgery_types: string[];
  activity_levels: string[];
  timeline_start: number;
  timeline_end: number;
  version: number;
  is_active: boolean;
  is_draft: boolean;
  is_standard_practice?: boolean;
  is_template?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

interface ProtocolTask {
  id: string;
  protocol_id: string;
  day: number;
  type: 'form' | 'exercise' | 'video' | 'message';
  title: string;
  content: string;
  description?: string;
  video_url?: string;
  required: boolean;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  frequency?: any;
  dependencies: string[];
  triggers?: any[];
  created_at?: string;
  updated_at?: string;
}

interface PatientProtocol {
  id: string;
  patient_id: string;
  protocol_id: string;
  surgery_date: string;
  surgery_type: string;
  assigned_by: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export class ProtocolService {
  private supabase = createClient();

  /**
   * Get all protocols for the current tenant
   */
  async getProtocols({
    isActive = true,
    isDraft = false,
    surgeryType = '',
    activityLevel = '',
    isStandardPractice,
    isTemplate
  }: {
    isActive?: boolean;
    isDraft?: boolean;
    surgeryType?: string;
    activityLevel?: string;
    isStandardPractice?: boolean;
    isTemplate?: boolean;
  } = {}) {
    try {
      // Get current user's tenant from profiles
      const { data: currentUser } = await this.supabase.auth.getUser();
      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', currentUser?.user?.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      let query = this.supabase
        .from('protocols')
        .select('*, created_by_user:profiles!created_by(full_name)')
        .eq('tenant_id', userData.tenant_id)
        .eq('is_active', isActive)
        .eq('is_draft', isDraft);

      if (surgeryType) {
        query = query.contains('surgery_types', [surgeryType]);
      }

      if (activityLevel) {
        query = query.contains('activity_levels', [activityLevel]);
      }

      if (isStandardPractice !== undefined) {
        query = query.eq('is_standard_practice', isStandardPractice);
      }

      if (isTemplate !== undefined) {
        query = query.eq('is_template', isTemplate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching protocols:', error);
      throw error;
    }
  }

  /**
   * Get a single protocol by ID with tasks
   */
  async getProtocolById(protocolId: string) {
    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .select(`
          *,
          tasks:protocol_tasks(*),
          created_by_user:profiles!created_by(full_name)
        `)
        .eq('id', protocolId)
        .single();

      if (error) throw error;

      // Sort tasks by day
      if (data?.tasks) {
        data.tasks = data.tasks.sort((a: ProtocolTask, b: ProtocolTask) => a.day - b.day);
      }

      return data;
    } catch (error) {
      console.error('Error fetching protocol:', error);
      throw error;
    }
  }

  /**
   * Create a new protocol
   */
  async createProtocol(protocolData: Omit<Protocol, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();
      const { data: userData } = await this.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', currentUser?.user?.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      const { data, error } = await this.supabase
        .from('protocols')
        .insert({
          ...protocolData,
          tenant_id: userData.tenant_id,
          created_by: currentUser.user!.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating protocol:', error);
      throw error;
    }
  }

  /**
   * Update a protocol
   */
  async updateProtocol(protocolId: string, updates: Partial<Protocol>) {
    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .update(updates)
        .eq('id', protocolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating protocol:', error);
      throw error;
    }
  }

  /**
   * Delete a protocol (soft delete by setting is_active to false)
   */
  async deleteProtocol(protocolId: string) {
    try {
      const { error } = await this.supabase
        .from('protocols')
        .update({ is_active: false })
        .eq('id', protocolId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting protocol:', error);
      throw error;
    }
  }

  /**
   * Create a protocol task
   */
  async createProtocolTask(taskData: Omit<ProtocolTask, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('protocol_tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating protocol task:', error);
      throw error;
    }
  }

  /**
   * Update a protocol task
   */
  async updateProtocolTask(taskId: string, updates: Partial<ProtocolTask>) {
    try {
      const { data, error } = await this.supabase
        .from('protocol_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating protocol task:', error);
      throw error;
    }
  }

  /**
   * Delete a protocol task
   */
  async deleteProtocolTask(taskId: string) {
    try {
      const { error } = await this.supabase
        .from('protocol_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting protocol task:', error);
      throw error;
    }
  }

  /**
   * Assign a protocol to a patient
   */
  async assignProtocolToPatient({
    patientId,
    protocolId,
    surgeryDate,
    surgeryType
  }: {
    patientId: string;
    protocolId: string;
    surgeryDate: string;
    surgeryType: string;
  }) {
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();

      // Create patient protocol assignment
      const { data: assignment, error: assignError } = await this.supabase
        .from('patient_protocols')
        .insert({
          patient_id: patientId,
          protocol_id: protocolId,
          surgery_date: surgeryDate,
          surgery_type: surgeryType,
          assigned_by: currentUser.user!.id,
          status: 'active'
        })
        .select()
        .single();

      if (assignError) throw assignError;

      // Get protocol tasks
      const { data: protocolTasks, error: tasksError } = await this.supabase
        .from('protocol_tasks')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('day');

      if (tasksError) throw tasksError;

      // Create patient tasks based on protocol tasks
      const patientTasks = protocolTasks.map(task => {
        const scheduledDate = new Date(surgeryDate);
        scheduledDate.setDate(scheduledDate.getDate() + task.day);

        return {
          patient_protocol_id: assignment.id,
          protocol_task_id: task.id,
          patient_id: patientId,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          due_date: scheduledDate.toISOString().split('T')[0],
          status: 'pending'
        };
      });

      if (patientTasks.length > 0) {
        const { error: tasksInsertError } = await this.supabase
          .from('patient_tasks')
          .insert(patientTasks);

        if (tasksInsertError) throw tasksInsertError;
      }

      return assignment;
    } catch (error) {
      console.error('Error assigning protocol to patient:', error);
      throw error;
    }
  }

  /**
   * Get patient protocols
   */
  async getPatientProtocols(patientId: string, status?: string) {
    try {
      let query = this.supabase
        .from('patient_protocols')
        .select(`
          *,
          protocol:protocols(*),
          assigned_by_user:profiles!assigned_by(full_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient protocols:', error);
      throw error;
    }
  }

  /**
   * Update patient protocol status
   */
  async updatePatientProtocolStatus(
    patientProtocolId: string, 
    status: 'active' | 'completed' | 'paused' | 'cancelled'
  ) {
    try {
      const { data, error } = await this.supabase
        .from('patient_protocols')
        .update({ status })
        .eq('id', patientProtocolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient protocol status:', error);
      throw error;
    }
  }

  /**
   * Duplicate a protocol
   */
  async duplicateProtocol(protocolId: string, newName: string) {
    try {
      // Get the original protocol with tasks
      const originalProtocol = await this.getProtocolById(protocolId);
      if (!originalProtocol) throw new Error('Protocol not found');

      // Create new protocol
      const { tasks, id, created_at, updated_at, ...protocolData } = originalProtocol;
      const newProtocol = await this.createProtocol({
        ...protocolData,
        name: newName,
        is_draft: true,
        version: 1
      });

      // Duplicate tasks
      if (tasks && tasks.length > 0) {
        const newTasks = tasks.map(({ id, protocol_id, created_at, updated_at, ...taskData }: ProtocolTask) => ({
          ...taskData,
          protocol_id: newProtocol.id
        }));

        const { error: tasksError } = await this.supabase
          .from('protocol_tasks')
          .insert(newTasks);

        if (tasksError) throw tasksError;
      }

      return this.getProtocolById(newProtocol.id);
    } catch (error) {
      console.error('Error duplicating protocol:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const protocolService = new ProtocolService();