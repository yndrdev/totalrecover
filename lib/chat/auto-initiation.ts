import { createClient } from '@/lib/supabase/server';

export interface AutoInitiationConfig {
  tenantId: string;
  checkInterval?: number; // minutes
}

export class ChatAutoInitiation {
  private supabase;
  private config: AutoInitiationConfig;

  constructor(config: AutoInitiationConfig) {
    this.supabase = createClient();
    this.config = config;
  }

  /**
   * Check all patients for auto-initiation opportunities
   */
  async checkForAutoInitiation(): Promise<void> {
    try {
      console.log('Starting auto-initiation check...');
      
      // Get all active patients in this tenant
      const { data: patients, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          profiles!patients_user_id_fkey(first_name, last_name, full_name)
        `)
        .eq('status', 'active')
        .eq('tenant_id', this.config.tenantId);

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      if (!patients || patients.length === 0) {
        console.log('No active patients found');
        return;
      }

      console.log(`Checking ${patients.length} patients for auto-initiation`);

      for (const patient of patients) {
        await this.checkPatientForInitiation(patient);
      }

      console.log('Auto-initiation check completed');
    } catch (error) {
      console.error('Error in auto-initiation check:', error);
    }
  }

  /**
   * Check individual patient for initiation opportunities
   */
  private async checkPatientForInitiation(patient: any): Promise<void> {
    try {
      const recoveryDay = this.calculateRecoveryDay(patient.surgery_date);
      
      // Skip if no surgery date or too early in recovery
      if (!patient.surgery_date || recoveryDay < 1) {
        return;
      }

      // Check if patient has tasks for today
      const hasTasks = await this.checkPatientTasks(patient.id, recoveryDay);
      
      if (!hasTasks) {
        return;
      }

      // Check if conversation already exists for today
      const hasActiveConversation = await this.checkActiveConversation(patient.id);
      
      if (hasActiveConversation) {
        return;
      }

      // Check time-based rules (don't initiate too early/late)
      const shouldInitiate = this.checkTimeRules();
      
      if (!shouldInitiate) {
        return;
      }

      // Initiate conversation
      await this.initiateConversation(patient, recoveryDay);
      
    } catch (error) {
      console.error(`Error checking patient ${patient.id} for initiation:`, error);
    }
  }

  /**
   * Calculate recovery day based on surgery date
   */
  private calculateRecoveryDay(surgeryDate?: string): number {
    if (!surgeryDate) return 0;
    
    const today = new Date();
    const surgery = new Date(surgeryDate);
    const diffTime = Math.abs(today.getTime() - surgery.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays);
  }

  /**
   * Check if patient has assigned tasks for today
   */
  private async checkPatientTasks(patientId: string, recoveryDay: number): Promise<boolean> {
    const { data: tasks } = await this.supabase
      .from('patient_tasks')
      .select('id')
      .eq('patient_id', patientId)
      .eq('assigned_date', recoveryDay)
      .eq('status', 'assigned')
      .limit(1);

    return !!(tasks && tasks.length > 0);
  }

  /**
   * Check if patient has an active conversation today
   */
  private async checkActiveConversation(patientId: string): Promise<boolean> {
    const today = new Date().toDateString();
    
    const { data: conversations } = await this.supabase
      .from('conversations')
      .select('id')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .gte('created_at', today)
      .limit(1);

    return !!(conversations && conversations.length > 0);
  }

  /**
   * Check time-based rules for initiation
   */
  private checkTimeRules(): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Don't initiate too early (before 8 AM) or too late (after 8 PM)
    if (hour < 8 || hour > 20) {
      return false;
    }
    
    return true;
  }

  /**
   * Initiate a new conversation for the patient
   */
  private async initiateConversation(patient: any, recoveryDay: number): Promise<void> {
    try {
      console.log(`Initiating conversation for patient ${patient.profiles?.full_name} (Day ${recoveryDay})`);

      // Create new conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .insert({
          patient_id: patient.id,
          tenant_id: this.config.tenantId,
          title: `Day ${recoveryDay} Check-in`,
          conversation_type: 'daily_checkin',
          status: 'active',
          surgery_day: recoveryDay,
          is_urgent: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError || !conversation) {
        console.error('Error creating conversation:', convError);
        return;
      }

      // Get patient's first name for personalization
      const firstName = patient.profiles?.first_name || 'there';
      
      // Create welcome message based on recovery stage
      const welcomeMessage = this.generateWelcomeMessage(firstName, recoveryDay, patient.surgery_type);
      
      // Insert welcome message
      await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          patient_id: patient.id,
          tenant_id: this.config.tenantId,
          content: welcomeMessage.content,
          message_type: 'system',
          sender_type: 'ai',
          metadata: welcomeMessage.metadata,
          created_at: new Date().toISOString()
        });

      console.log(`Conversation initiated successfully for patient ${patient.id}`);
      
    } catch (error) {
      console.error(`Error initiating conversation for patient ${patient.id}:`, error);
    }
  }

  /**
   * Generate personalized welcome message based on recovery stage
   */
  private generateWelcomeMessage(firstName: string, recoveryDay: number, surgeryType?: string): any {
    const surgery = surgeryType === 'TKA' ? 'knee replacement' :
                   surgeryType === 'THA' ? 'hip replacement' :
                   surgeryType === 'TSA' ? 'shoulder surgery' : 'surgery';

    let content = '';
    let buttons = [];

    if (recoveryDay <= 7) {
      // Early recovery phase
      content = `🌟 Good morning ${firstName}! Welcome to day ${recoveryDay} of your ${surgery} recovery. You're in the early healing phase - how are you feeling today?`;
      buttons = [
        { text: "Ready for my check-in", action: 'start_checkin' },
        { text: "I have concerns", action: 'report_concerns' },
        { text: "Not ready yet", action: 'postpone' }
      ];
    } else if (recoveryDay <= 30) {
      // Active recovery phase
      content = `💪 Hello ${firstName}! Day ${recoveryDay} - you're making great progress with your ${surgery} recovery! Ready to check in and see how you're doing?`;
      buttons = [
        { text: "Yes, let's check in!", action: 'start_checkin' },
        { text: "I have questions", action: 'ask_questions' },
        { text: "Postpone for now", action: 'postpone' }
      ];
    } else if (recoveryDay <= 84) {
      // Advanced recovery phase
      content = `🎯 Hi ${firstName}! Day ${recoveryDay} of your recovery journey. You're in the strengthening phase - let's see how you're progressing today!`;
      buttons = [
        { text: "Start my assessment", action: 'start_checkin' },
        { text: "Feeling great!", action: 'positive_update' },
        { text: "Need help", action: 'request_help' }
      ];
    } else {
      // Long-term recovery
      content = `✨ Hello ${firstName}! Day ${recoveryDay} - you've come so far in your recovery! How are you maintaining your progress?`;
      buttons = [
        { text: "Doing well", action: 'positive_update' },
        { text: "Quick check-in", action: 'start_checkin' },
        { text: "I have concerns", action: 'report_concerns' }
      ];
    }

    return {
      content,
      metadata: { buttons }
    };
  }

  /**
   * Static method to start auto-initiation service
   */
  static async startAutoInitiationService(tenantId: string): Promise<void> {
    const autoInitiation = new ChatAutoInitiation({ 
      tenantId,
      checkInterval: 30 // Check every 30 minutes
    });

    // Run initial check
    await autoInitiation.checkForAutoInitiation();

    // Set up recurring checks
    setInterval(async () => {
      await autoInitiation.checkForAutoInitiation();
    }, (autoInitiation.config.checkInterval || 30) * 60 * 1000);

    console.log(`Auto-initiation service started for tenant ${tenantId}`);
  }
}

// API endpoint helper
export async function checkAutoInitiationForTenant(tenantId: string): Promise<void> {
  const autoInitiation = new ChatAutoInitiation({ tenantId });
  await autoInitiation.checkForAutoInitiation();
}