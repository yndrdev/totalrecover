import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type PatientTask = Database['public']['Tables']['patient_tasks']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export interface PatientData extends Patient {
  profile?: Profile;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_type: 'patient' | 'ai' | 'nurse' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

export class PatientChatService {
  private supabase = createClient();

  /**
   * Get current patient data including profile and recovery info
   */
  async getCurrentPatient(): Promise<{ success: boolean; patient?: PatientData; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get patient data using profile ID
      const { data: patient, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          profiles!profile_id(first_name, last_name, email, phone)
        `)
        .eq('profile_id', user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch patient data: ${error.message}`);
      }

      if (!patient) {
        throw new Error('Patient record not found');
      }

      return { success: true, patient };

    } catch (error: any) {
      console.error('Get current patient error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get patient's care team members
   */
  async getCareTeam(patientId: string): Promise<{ success: boolean; careTeam: CareTeamMember[]; error?: string }> {
    try {
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select(`
          surgeon_id,
          primary_nurse_id,
          physical_therapist_id
        `)
        .eq('id', patientId)
        .single();

      if (patientError) {
        throw new Error(`Failed to fetch care team: ${patientError.message}`);
      }

      const careTeam: CareTeamMember[] = [];

      // Get surgeon profile if assigned
      if (patient.surgeon_id) {
        const { data: surgeon } = await this.supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .eq('id', patient.surgeon_id)
          .single();
        
        if (surgeon) {
          careTeam.push({
            id: surgeon.id,
            name: `Dr. ${surgeon.first_name} ${surgeon.last_name}`,
            role: 'Orthopedic Surgeon',
            avatar: '', // TODO: Use real avatar URLs
            isOnline: true // TODO: Implement real presence tracking
          });
        }
      }

      // Get nurse profile if assigned
      if (patient.primary_nurse_id) {
        const { data: nurse } = await this.supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .eq('id', patient.primary_nurse_id)
          .single();
        
        if (nurse) {
          careTeam.push({
            id: nurse.id,
            name: `${nurse.first_name} ${nurse.last_name}, RN`,
            role: 'Recovery Nurse',
            avatar: '', // TODO: Use real avatar URLs
            isOnline: true
          });
        }
      }

      // Get PT profile if assigned
      if (patient.physical_therapist_id) {
        const { data: pt } = await this.supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .eq('id', patient.physical_therapist_id)
          .single();
        
        if (pt) {
          careTeam.push({
            id: pt.id,
            name: `${pt.first_name} ${pt.last_name}`,
            role: 'Physical Therapist',
            avatar: '', // TODO: Use real avatar URLs
            isOnline: false
          });
        }
      }

      return { success: true, careTeam };

    } catch (error: any) {
      console.error('Get care team error:', error);
      return { success: false, careTeam: [], error: error.message };
    }
  }

  /**
   * Get tasks for patient's current recovery day and recent days
   */
  async getPatientTasks(patientId: string, recoveryDay: number): Promise<{ 
    success: boolean; 
    todaysTasks: PatientTask[]; 
    recentTasks: PatientTask[]; 
    upcomingTasks: PatientTask[];
    error?: string;
  }> {
    try {
      // Get tasks for current day
      const { data: todaysTasks, error: todayError } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks (
            chat_prompt,
            instructions,
            completion_criteria,
            content_data
          )
        `)
        .eq('patient_id', patientId)
        .eq('day', recoveryDay)
        .order('created_at', { ascending: true });

      if (todayError) {
        throw new Error(`Failed to fetch today's tasks: ${todayError.message}`);
      }

      // Get recent completed tasks (last 7 days)
      const { data: recentTasks, error: recentError } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks (
            chat_prompt,
            instructions,
            completion_criteria,
            content_data
          )
        `)
        .eq('patient_id', patientId)
        .gte('day', recoveryDay - 7)
        .lt('day', recoveryDay)
        .eq('status', 'completed')
        .order('day', { ascending: false })
        .limit(10);

      if (recentError) {
        throw new Error(`Failed to fetch recent tasks: ${recentError.message}`);
      }

      // Get upcoming tasks (next 7 days)
      const { data: upcomingTasks, error: upcomingError } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks (
            chat_prompt,
            instructions,
            completion_criteria,
            content_data
          )
        `)
        .eq('patient_id', patientId)
        .gt('day', recoveryDay)
        .lte('day', recoveryDay + 7)
        .order('day', { ascending: true })
        .limit(10);

      if (upcomingError) {
        throw new Error(`Failed to fetch upcoming tasks: ${upcomingError.message}`);
      }

      return { 
        success: true, 
        todaysTasks: todaysTasks || [],
        recentTasks: recentTasks || [],
        upcomingTasks: upcomingTasks || []
      };

    } catch (error: any) {
      console.error('Get patient tasks error:', error);
      return { 
        success: false, 
        todaysTasks: [],
        recentTasks: [],
        upcomingTasks: [],
        error: error.message 
      };
    }
  }

  /**
   * Get or create conversation for patient's current day
   */
  async getCurrentConversation(patientId: string, recoveryDay: number): Promise<{ 
    success: boolean; 
    conversationId?: string; 
    error?: string;
  }> {
    try {
      // Look for existing conversation for today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: conversation, error: fetchError } = await this.supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', patientId)
        .gte('created_at', today)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error is ok
        throw new Error(`Failed to fetch conversation: ${fetchError.message}`);
      }

      // Create new conversation if none exists
      let conversationId: string;
      
      if (!conversation) {
        const { data: newConversation, error: createError } = await this.supabase
          .from('conversations')
          .insert({
            patient_id: patientId,
            status: 'active',
            total_messages: 0,
            last_activity_at: new Date().toISOString(),
            conversation_metadata: {
              recovery_day: recoveryDay,
              created_date: today
            }
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create conversation: ${createError.message}`);
        }

        conversationId = newConversation.id;
      } else {
        conversationId = conversation.id;
      }

      return { success: true, conversationId };

    } catch (error: any) {
      console.error('Get current conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId: string): Promise<{ 
    success: boolean; 
    messages: ConversationMessage[]; 
    error?: string;
  }> {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      return { success: true, messages: messages || [] };

    } catch (error: any) {
      console.error('Get conversation messages error:', error);
      return { success: false, messages: [], error: error.message };
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(
    conversationId: string, 
    content: string, 
    senderType: 'patient' | 'ai' | 'nurse' | 'system' = 'patient',
    metadata?: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_type: senderType,
          content,
          metadata: metadata || {},
          completion_status: 'completed'
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      // Update conversation last activity
      await this.supabase
        .from('conversations')
        .update({ 
          last_activity_at: new Date().toISOString(),
          total_messages: this.supabase.rpc('increment_total_messages', { 
            conversation_id: conversationId 
          })
        })
        .eq('id', conversationId);

      return { success: true, messageId: message.id };

    } catch (error: any) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete a patient task through chat interaction
   */
  async completeTaskFromChat(
    taskId: string,
    conversationId: string,
    completionData: any = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update task status to completed
      const { error: updateError } = await this.supabase
        .from('patient_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_data: completionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) {
        throw new Error(`Failed to update task: ${updateError.message}`);
      }

      // Log activity in conversation
      const { error: activityError } = await this.supabase
        .from('conversation_activities')
        .insert({
          conversation_id: conversationId,
          activity_type: 'form_completed',
          activity_data: {
            task_id: taskId,
            completion_data: completionData
          }
        });

      if (activityError) {
        console.error('Failed to log activity:', activityError);
      }

      return { success: true };

    } catch (error: any) {
      console.error('Complete task from chat error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get task completion summary for patient
   */
  async getTaskCompletionSummary(patientId: string): Promise<{ 
    success: boolean; 
    summary: {
      todayCompleted: number;
      todayTotal: number;
      overallCompleted: number;
      overallTotal: number;
      missedTasks: number;
    }; 
    error?: string;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get patient's surgery date to calculate current day
      const { data: patient } = await this.supabase
        .from('patients')
        .select('surgery_date')
        .eq('profile_id', user.id)
        .single();

      let currentDay = 0;
      if (patient?.surgery_date) {
        const surgeryDate = new Date(patient.surgery_date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
        currentDay = daysDiff > 0 ? daysDiff : 0; // Only count post-op days
      }

      // Get task counts
      const { data: allTasks } = await this.supabase
        .from('patient_tasks')
        .select('day, status')
        .eq('patient_id', patientId);

      const todayTasks = allTasks?.filter(t => t.day === currentDay) || [];
      const completedToday = todayTasks.filter(t => t.status === 'completed').length;
      
      const overallCompleted = allTasks?.filter(t => t.status === 'completed').length || 0;
      const overallTotal = allTasks?.length || 0;
      
      const missedTasks = allTasks?.filter(t => 
        t.status !== 'completed' && t.day < currentDay
      ).length || 0;

      return {
        success: true,
        summary: {
          todayCompleted: completedToday,
          todayTotal: todayTasks.length,
          overallCompleted,
          overallTotal,
          missedTasks
        }
      };

    } catch (error: any) {
      console.error('Get task completion summary error:', error);
      return {
        success: false,
        summary: {
          todayCompleted: 0,
          todayTotal: 0,
          overallCompleted: 0,
          overallTotal: 0,
          missedTasks: 0
        },
        error: error.message
      };
    }
  }
}

export const patientChatService = new PatientChatService();