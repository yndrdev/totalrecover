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
  /**
   * Deliver protocol tasks to patient in real-time via chat
   */
  async deliverProtocolTasks(
    patientId: string,
    protocolId: string,
    recoveryDay: number
  ): Promise<{ success: boolean; tasksDelivered: number; error?: string }> {
    try {
      // Get conversation for today
      const conversationResult = await this.getCurrentConversation(patientId, recoveryDay);
      if (!conversationResult.success || !conversationResult.conversationId) {
        throw new Error('Failed to get conversation');
      }

      // Get tasks for today that aren't delivered yet
      const { data: tasks, error: tasksError } = await this.supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks (
            name,
            type,
            chat_prompt,
            instructions,
            completion_criteria,
            content_data
          )
        `)
        .eq('patient_id', patientId)
        .eq('day', recoveryDay)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (tasksError) {
        throw new Error(`Failed to get tasks: ${tasksError.message}`);
      }

      let tasksDelivered = 0;

      // Deliver each task as a chat message
      for (const task of tasks || []) {
        const taskData = task.tasks as any;
        
        // Create interactive chat prompt based on task type
        let chatContent = '';
        let messageMetadata: any = {
          task_id: task.id,
          task_type: taskData?.type,
          is_protocol_delivery: true,
          requires_interaction: true
        };

        switch (taskData?.type) {
          case 'form':
            chatContent = `📋 **${taskData.name}**\n\n${taskData.chat_prompt || taskData.instructions}\n\n*Click "Complete Form" when ready to fill this out.*`;
            messageMetadata = {
              ...messageMetadata,
              form_data: taskData.content_data,
              completion_criteria: taskData.completion_criteria
            };
            break;

          case 'exercise':
            chatContent = `💪 **${taskData.name}**\n\n${taskData.chat_prompt || taskData.instructions}\n\n*Mark as complete when you've finished this exercise.*`;
            break;

          case 'video':
            chatContent = `🎥 **${taskData.name}**\n\n${taskData.chat_prompt || taskData.instructions}\n\n*Watch the video and mark complete when done.*`;
            break;

          case 'message':
            chatContent = `💬 **${taskData.name}**\n\n${taskData.content_data?.message || taskData.instructions}`;
            messageMetadata.requires_interaction = false;
            break;

          default:
            chatContent = `📌 **${taskData.name}**\n\n${taskData.chat_prompt || taskData.instructions}`;
            break;
        }

        // Send as system message
        const messageResult = await this.sendMessage(
          conversationResult.conversationId,
          chatContent,
          'system',
          messageMetadata
        );

        if (messageResult.success) {
          // Update task status to delivered
          await this.supabase
            .from('patient_tasks')
            .update({
              status: 'in_progress',
              delivered_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', task.id);

          tasksDelivered++;
        }

        // Small delay between messages for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { success: true, tasksDelivered };

    } catch (error: any) {
      console.error('Deliver protocol tasks error:', error);
      return { success: false, tasksDelivered: 0, error: error.message };
    }
  }

  /**
   * Send standard practice protocol welcome message
   */
  async sendStandardPracticeWelcome(
    patientId: string,
    protocolName: string,
    recoveryDay: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const conversationResult = await this.getCurrentConversation(patientId, recoveryDay);
      if (!conversationResult.success || !conversationResult.conversationId) {
        throw new Error('Failed to get conversation');
      }

      const welcomeMessage = `🌟 **Welcome to ${protocolName}**

This is our evidence-based standard practice protocol designed to guide you through your recovery journey.

I'll be delivering your daily tasks and checking in on your progress. Each task is carefully timed to support your healing and help you achieve the best possible outcomes.

Your recovery matters, and I'm here to support you every step of the way! 💙

*Ready to begin? Your first tasks will appear shortly.*`;

      const messageResult = await this.sendMessage(
        conversationResult.conversationId,
        welcomeMessage,
        'system',
        {
          is_welcome_message: true,
          protocol_name: protocolName,
          is_standard_practice: true
        }
      );

      return { success: messageResult.success, error: messageResult.error };

    } catch (error: any) {
      console.error('Send standard practice welcome error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check for and deliver any pending protocol tasks for patient
   */
  async checkAndDeliverPendingTasks(patientId: string): Promise<{
    success: boolean;
    tasksDelivered: number;
    error?: string
  }> {
    try {
      // Get patient's current recovery day
      const { data: patient } = await this.supabase
        .from('patients')
        .select('surgery_date')
        .eq('id', patientId)
        .single();

      if (!patient?.surgery_date) {
        return { success: true, tasksDelivered: 0 }; // No surgery date set yet
      }

      const surgeryDate = new Date(patient.surgery_date);
      const today = new Date();
      const recoveryDay = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (recoveryDay < 0) {
        return { success: true, tasksDelivered: 0 }; // Surgery hasn't happened yet
      }

      // Get patient's active protocol
      const { data: patientProtocol } = await this.supabase
        .from('patient_protocols')
        .select(`
          *,
          protocol:protocols(name, is_standard_practice)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();

      if (!patientProtocol) {
        return { success: true, tasksDelivered: 0 }; // No active protocol
      }

      const protocol = patientProtocol.protocol as any;

      // Send welcome message if this is a new standard practice protocol
      if (protocol?.is_standard_practice && recoveryDay === 0) {
        await this.sendStandardPracticeWelcome(
          patientId,
          protocol.name,
          recoveryDay
        );
      }

      // Deliver pending tasks
      const deliveryResult = await this.deliverProtocolTasks(
        patientId,
        patientProtocol.protocol_id,
        recoveryDay
      );

      return {
        success: deliveryResult.success,
        tasksDelivered: deliveryResult.tasksDelivered,
        error: deliveryResult.error
      };

    } catch (error: any) {
      console.error('Check and deliver pending tasks error:', error);
      return { success: false, tasksDelivered: 0, error: error.message };
    }
  }

  /**
   * Schedule automatic task delivery (to be called from a cron job or similar)
   */
  async scheduleTaskDelivery(): Promise<{
    success: boolean;
    patientsProcessed: number;
    totalTasksDelivered: number;
    error?: string;
  }> {
    try {
      // Get all patients with active protocols
      const { data: activePatients, error } = await this.supabase
        .from('patient_protocols')
        .select(`
          patient_id,
          patients(id, surgery_date)
        `)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to get active patients: ${error.message}`);
      }

      let patientsProcessed = 0;
      let totalTasksDelivered = 0;

      for (const patientProtocol of activePatients || []) {
        const patient = patientProtocol.patients as any;
        if (!patient?.id) continue;

        const result = await this.checkAndDeliverPendingTasks(patient.id);
        if (result.success) {
          patientsProcessed++;
          totalTasksDelivered += result.tasksDelivered;
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        success: true,
        patientsProcessed,
        totalTasksDelivered
      };

    } catch (error: any) {
      console.error('Schedule task delivery error:', error);
      return {
        success: false,
        patientsProcessed: 0,
        totalTasksDelivered: 0,
        error: error.message
      };
    }
  }
}

export const patientChatService = new PatientChatService();