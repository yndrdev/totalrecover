// Manus-style Chat Service for TJV Recovery Platform
// Professional healthcare chat with real-time capabilities

import { createClient } from '@/lib/supabase/client';
import { 
  ChatMessage, 
  ConversationSession, 
  RecoveryDayInfo, 
  PatientRecoveryContext,
  TaskMetadata,
  RealtimeMessagePayload,
  HIIPAAuditLog
} from '@/types/chat';

export class ManusChatService {
  private supabase = createClient();
  private subscriptions: Map<string, any> = new Map();

  // Initialize chat session for a specific recovery day
  async initializeChatSession(
    patientId: string, 
    recoveryDay: number
  ): Promise<ConversationSession | null> {
    try {
      // Check if session exists for this day
      const { data: existingSession, error: sessionError } = await this.supabase
        .from('conversation_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('recovery_day', recoveryDay)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        throw sessionError;
      }

      if (existingSession) {
        return existingSession;
      }

      // Create new session for this day
      const { data: newSession, error: createError } = await this.supabase
        .from('conversation_sessions')
        .insert({
          patient_id: patientId,
          recovery_day: recoveryDay,
          session_date: new Date().toISOString().split('T')[0],
          status: 'active',
          tasks_total: 0,
          tasks_completed: 0,
          tasks_missed: 0
        })
        .select()
        .single();

      if (createError) throw createError;

      return newSession;
    } catch (error) {
      console.error('Error initializing chat session:', error);
      return null;
    }
  }

  // Load messages for a specific recovery day
  async loadMessagesForDay(
    patientId: string,
    recoveryDay: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('chat_messages')
        .select(`
          *,
          conversation_sessions!inner(recovery_day)
        `)
        .eq('patient_id', patientId)
        .eq('conversation_sessions.recovery_day', recoveryDay)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return messages || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Send a new message
  async sendMessage(
    patientId: string,
    sessionId: string,
    content: string,
    senderType: 'patient' | 'ai' | 'provider' | 'system' = 'patient',
    messageType: 'text' | 'form' | 'task' | 'notification' = 'text',
    metadata?: any
  ): Promise<ChatMessage | null> {
    try {
      const { data: message, error } = await this.supabase
        .from('chat_messages')
        .insert({
          conversation_id: sessionId,
          session_id: sessionId,
          patient_id: patientId,
          sender_id: patientId, // This would be dynamic based on sender
          sender_type: senderType,
          content,
          message_type: messageType,
          recovery_day: 0, // This would be calculated
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Log for HIPAA compliance
      await this.logUserAction(patientId, 'message_sent', {
        message_id: message.id,
        content_length: content.length,
        message_type: messageType
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Get patient recovery context
  async getPatientRecoveryContext(patientId: string): Promise<PatientRecoveryContext | null> {
    try {
      // This would fetch from multiple tables to build comprehensive context
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select(`
          *,
          profiles(*),
          surgeries(*),
          medications(*),
          exercises(*),
          risk_assessments(*)
        `)
        .eq('user_id', patientId)
        .single();

      if (patientError) throw patientError;

      // Build recovery context from patient data
      const context: PatientRecoveryContext = {
        patient_id: patientId,
        surgery_type: patient.surgeries?.[0]?.surgery_type || 'TKA',
        surgery_date: patient.surgeries?.[0]?.surgery_date || new Date().toISOString(),
        current_day: this.calculateRecoveryDay(patient.surgeries?.[0]?.surgery_date),
        phase: this.determineRecoveryPhase(this.calculateRecoveryDay(patient.surgeries?.[0]?.surgery_date)),
        provider_team: {
          surgeon: patient.surgeries?.[0]?.surgeon_name || 'Dr. Smith',
          nurse: 'Nurse Johnson',
          physical_therapist: 'PT Williams'
        },
        current_medications: patient.medications || [],
        current_exercises: patient.exercises || [],
        risk_factors: patient.risk_assessments || [],
        preferences: {
          communication_time: 'morning',
          reminder_frequency: 'medium',
          preferred_language: 'en',
          emergency_contacts: []
        }
      };

      return context;
    } catch (error) {
      console.error('Error getting patient context:', error);
      return null;
    }
  }

  // Generate recovery days array
  generateRecoveryDays(
    surgeryDate: string, 
    currentDay: number,
    patientId: string
  ): Promise<RecoveryDayInfo[]> {
    return new Promise(async (resolve) => {
      try {
        const days: RecoveryDayInfo[] = [];
        const surgeryDateTime = new Date(surgeryDate);
        
        // Get task summaries for each day (this would be a real query)
        const taskSummaries = await this.getTaskSummariesForDays(patientId, -45, Math.max(currentDay + 30, 200));
        
        for (let day = -45; day <= Math.max(currentDay + 30, 200); day++) {
          const dayDate = new Date(surgeryDateTime);
          dayDate.setDate(dayDate.getDate() + day);
          
          const phase = this.determineRecoveryPhase(day);
          const taskSummary = taskSummaries[day] || {
            total: 0,
            completed: 0,
            missed: 0,
            pending: 0
          };

          let statusIndicator: RecoveryDayInfo['status_indicator'] = 'pending';
          if (day < currentDay) {
            if (taskSummary.missed > 0) statusIndicator = 'error';
            else if (taskSummary.completed === taskSummary.total) statusIndicator = 'success';
            else statusIndicator = 'warning';
          }

          days.push({
            day,
            date: dayDate.toISOString().split('T')[0],
            phase,
            has_messages: await this.checkMessagesExist(patientId, day),
            task_summary: taskSummary,
            status_indicator: statusIndicator
          });
        }
        
        resolve(days);
      } catch (error) {
        console.error('Error generating recovery days:', error);
        resolve([]);
      }
    });
  }

  // Get missed tasks for a specific day
  async getMissedTasksForDay(patientId: string, recoveryDay: number): Promise<TaskMetadata[]> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('patient_tasks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('recovery_day', recoveryDay)
        .eq('status', 'missed')
        .order('importance', { ascending: false });

      if (error) throw error;

      return tasks?.map(task => ({
        task_id: task.id,
        task_type: task.task_type,
        title: task.title,
        description: task.description,
        due_time: task.due_time,
        completed_at: task.completed_at,
        status: task.status,
        importance: task.importance
      })) || [];
    } catch (error) {
      console.error('Error getting missed tasks:', error);
      return [];
    }
  }

  // Complete a task
  async completeTask(taskId: string, patientId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('patient_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('patient_id', patientId);

      if (error) throw error;

      // Log for HIPAA compliance
      await this.logUserAction(patientId, 'task_completed', {
        task_id: taskId,
        completed_at: new Date().toISOString()
      });

      // Trigger notification to care team
      await this.notifyCareTeam(patientId, 'task_completed', { task_id: taskId });

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  // Set up real-time subscriptions
  setupRealtimeSubscriptions(
    patientId: string,
    onMessageReceived: (message: ChatMessage) => void,
    onTypingUpdate: (isTyping: boolean, userId: string) => void
  ): string {
    const subscriptionId = `chat-${patientId}-${Date.now()}`;
    
    // Message subscription
    const messageSubscription = this.supabase
      .channel(`chat-messages-${patientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `patient_id=eq.${patientId}`
      }, (payload: RealtimeMessagePayload) => {
        onMessageReceived(payload.new);
      })
      .subscribe();

    // Typing indicators subscription
    const typingSubscription = this.supabase
      .channel(`typing-${patientId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTypingUpdate(payload.payload.isTyping, payload.payload.userId);
      })
      .subscribe();

    this.subscriptions.set(subscriptionId, {
      messages: messageSubscription,
      typing: typingSubscription
    });

    return subscriptionId;
  }

  // Cleanup subscriptions
  cleanupSubscriptions(subscriptionId: string): void {
    const subs = this.subscriptions.get(subscriptionId);
    if (subs) {
      subs.messages?.unsubscribe();
      subs.typing?.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  // Broadcast typing status
  broadcastTyping(patientId: string, isTyping: boolean): void {
    this.supabase
      .channel(`typing-${patientId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: patientId, isTyping }
      });
  }

  // Private helper methods
  private calculateRecoveryDay(surgeryDate: string): number {
    const surgery = new Date(surgeryDate);
    const today = new Date();
    const diffTime = today.getTime() - surgery.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineRecoveryPhase(day: number): RecoveryDayInfo['phase'] {
    if (day < 0) return 'pre_surgery';
    if (day <= 3) return 'immediate_post_op';
    if (day <= 14) return 'early_recovery';
    if (day <= 90) return 'active_recovery';
    return 'maintenance';
  }

  private async getTaskSummariesForDays(
    patientId: string, 
    startDay: number, 
    endDay: number
  ): Promise<Record<number, any>> {
    try {
      const { data: tasks, error } = await this.supabase
        .from('patient_tasks')
        .select('recovery_day, status')
        .eq('patient_id', patientId)
        .gte('recovery_day', startDay)
        .lte('recovery_day', endDay);

      if (error) throw error;

      const summaries: Record<number, any> = {};
      
      tasks?.forEach(task => {
        if (!summaries[task.recovery_day]) {
          summaries[task.recovery_day] = {
            total: 0,
            completed: 0,
            missed: 0,
            pending: 0
          };
        }
        
        summaries[task.recovery_day].total++;
        summaries[task.recovery_day][task.status]++;
      });

      return summaries;
    } catch (error) {
      console.error('Error getting task summaries:', error);
      return {};
    }
  }

  private async checkMessagesExist(patientId: string, recoveryDay: number): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('recovery_day', recoveryDay);

      return !error && (count || 0) > 0;
    } catch (error) {
      return false;
    }
  }

  private async logUserAction(
    userId: string,
    action: HIIPAAuditLog['action'],
    details: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          patient_id: userId,
          action,
          details,
          ip_address: 'unknown', // This would be captured from request
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  }

  private async notifyCareTeam(
    patientId: string,
    eventType: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      // This would trigger notifications to the care team
      await this.supabase
        .from('care_team_notifications')
        .insert({
          patient_id: patientId,
          event_type: eventType,
          data,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error notifying care team:', error);
    }
  }
}

// Export singleton instance
export const manusChatService = new ManusChatService();