import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'patient' | 'provider' | 'ai_assistant' | 'system';
  source: 'ai' | 'provider' | 'patient' | 'system';
  provider_id?: string;
  message_type: 'text' | 'form' | 'video' | 'task_completion' | 'system_notification';
  content: string;
  priority: 'normal' | 'urgent' | 'emergency';
  metadata?: any;
  attachments?: any[];
  delivered_at?: string;
  read_at?: string;
  is_edited?: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  patient_id: string;
  provider_id?: string;
  tenant_id: string;
  type: 'patient_support' | 'medical_consultation' | 'recovery_coaching';
  status: 'active' | 'closed' | 'archived';
  metadata?: any;
  created_at: string;
  updated_at: string;
  patient?: any;
  messages?: ChatMessage[];
  unread_count?: number;
  urgent_count?: number;
  is_typing?: boolean;
  typing_user?: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  started_at: string;
  updated_at: string;
}

export interface ProviderPatientAssignment {
  id: string;
  provider_id: string;
  patient_id: string;
  tenant_id: string;
  assignment_type: 'primary' | 'secondary' | 'on_call' | 'temporary';
  status: 'active' | 'inactive' | 'pending';
  assigned_at: string;
  assigned_by?: string;
  notes?: string;
}

export class ProviderChatService {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  // Subscribe to all conversations for a provider
  subscribeToProviderConversations(
    providerId: string,
    onConversationUpdate: (conversation: ChatConversation) => void,
    onNewMessage: (message: ChatMessage) => void,
    onTypingUpdate: (indicator: TypingIndicator) => void
  ) {
    // Get provider's tenant
    this.getProviderTenant(providerId).then(tenantId => {
      if (!tenantId) return;

      // Subscribe to conversations
      const conversationsChannel = this.supabase
        .channel(`provider-conversations-${providerId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_conversations',
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload: RealtimePostgresChangesPayload<ChatConversation>) => {
            this.handleConversationChange(payload, onConversationUpdate);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          },
          async (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
            // Check if message is in provider's tenant conversations
            const isRelevant = await this.isMessageRelevantToProvider(
              payload.new as ChatMessage,
              tenantId
            );
            if (isRelevant) {
              onNewMessage(payload.new as ChatMessage);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'typing_indicators'
          },
          async (payload: RealtimePostgresChangesPayload<TypingIndicator>) => {
            // Check if typing indicator is in provider's conversations
            const isRelevant = await this.isTypingRelevantToProvider(
              payload.new as TypingIndicator,
              tenantId
            );
            if (isRelevant) {
              onTypingUpdate(payload.new as TypingIndicator);
            }
          }
        )
        .subscribe();

      this.channels.set(`provider-${providerId}`, conversationsChannel);
    });
  }

  // Subscribe to a specific conversation
  subscribeToConversation(
    conversationId: string,
    onMessageUpdate: (message: ChatMessage) => void,
    onTypingUpdate: (indicator: TypingIndicator) => void,
    onReadReceipt: (messageId: string, readBy: string) => void
  ) {
    const channel = this.supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<ChatMessage>) => {
          onMessageUpdate(payload.new as ChatMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<TypingIndicator>) => {
          onTypingUpdate(payload.new as TypingIndicator);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts'
        },
        async (payload: any) => {
          // Check if read receipt is for this conversation
          const message = await this.getMessage(payload.new.message_id);
          if (message?.conversation_id === conversationId) {
            onReadReceipt(payload.new.message_id, payload.new.user_id);
          }
        }
      )
      .subscribe();

    this.channels.set(`conversation-${conversationId}`, channel);
  }

  // Send a message as a provider
  async sendProviderMessage(
    conversationId: string,
    providerId: string,
    content: string,
    messageType: 'text' | 'form' | 'video' | 'task_completion' | 'system_notification' = 'text',
    priority: 'normal' | 'urgent' | 'emergency' = 'normal',
    metadata?: any
  ): Promise<ChatMessage | null> {
    const { data, error } = await this.supabase
      .rpc('send_provider_message', {
        p_conversation_id: conversationId,
        p_provider_id: providerId,
        p_content: content,
        p_message_type: messageType,
        p_priority: priority,
        p_metadata: metadata
      });

    if (error) {
      console.error('Error sending provider message:', error);
      return null;
    }

    // Get the full message details
    return this.getMessage(data);
  }

  // Update typing indicator
  async updateTypingIndicator(
    conversationId: string,
    isTyping: boolean
  ): Promise<void> {
    const { error } = await this.supabase
      .rpc('update_typing_indicator', {
        p_conversation_id: conversationId,
        p_is_typing: isTyping
      });

    if (error) {
      console.error('Error updating typing indicator:', error);
    }

    // Clear any existing timer
    const timerId = this.typingTimers.get(conversationId);
    if (timerId) {
      clearTimeout(timerId);
      this.typingTimers.delete(conversationId);
    }

    // Set a timer to automatically stop typing after 10 seconds
    if (isTyping) {
      const timer = setTimeout(() => {
        this.updateTypingIndicator(conversationId, false);
      }, 10000);
      this.typingTimers.set(conversationId, timer);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('mark_messages_read', {
        p_conversation_id: conversationId,
        p_user_id: userId
      });

    if (error) {
      console.error('Error marking messages as read:', error);
      return 0;
    }

    return data || 0;
  }

  // Get provider's conversation list with filters
  async getProviderConversations(
    providerId: string,
    includeUrgentOnly: boolean = false,
    limit: number = 50
  ): Promise<ChatConversation[]> {
    const { data, error } = await this.supabase
      .rpc('get_provider_conversation_list', {
        p_provider_id: providerId,
        p_include_urgent_only: includeUrgentOnly,
        p_limit: limit
      });

    if (error) {
      console.error('Error fetching provider conversations:', error);
      return [];
    }

    return data || [];
  }

  // Assign provider to patient
  async assignProviderToPatient(
    providerId: string,
    patientId: string,
    assignmentType: 'primary' | 'secondary' | 'on_call' | 'temporary' = 'primary',
    assignedBy?: string,
    notes?: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .rpc('assign_provider_to_patient', {
        p_provider_id: providerId,
        p_patient_id: patientId,
        p_assignment_type: assignmentType,
        p_assigned_by: assignedBy,
        p_notes: notes
      });

    if (error) {
      console.error('Error assigning provider to patient:', error);
      return null;
    }

    return data;
  }

  // Get patient's assigned providers
  async getPatientProviders(patientId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_patient_providers', {
        p_patient_id: patientId
      });

    if (error) {
      console.error('Error fetching patient providers:', error);
      return [];
    }

    return data || [];
  }

  // Create or get existing conversation
  async getOrCreateConversation(
    patientId: string,
    providerId?: string,
    type: 'patient_support' | 'medical_consultation' | 'recovery_coaching' = 'patient_support'
  ): Promise<ChatConversation | null> {
    // First, try to find existing active conversation
    const { data: existing, error: findError } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing && !findError) {
      return existing;
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await this.supabase
      .rpc('create_conversation', {
        p_patient_id: patientId,
        p_provider_id: providerId,
        p_type: type
      });

    if (createError) {
      console.error('Error creating conversation:', createError);
      return null;
    }

    // Fetch the full conversation details
    const { data: conversation, error: fetchError } = await this.supabase
      .from('chat_conversations')
      .select(`
        *,
        patient:patients!patient_id(
          id,
          first_name,
          last_name,
          medical_record_number,
          surgery_date,
          surgery_type
        )
      `)
      .eq('id', newConversation)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return null;
    }

    return conversation;
  }

  // Get conversation messages with pagination
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        provider:providers!provider_id(
          id,
          user:profiles!user_id(
            full_name,
            email
          )
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).reverse();
  }

  // Search conversations
  async searchConversations(
    providerId: string,
    searchTerm: string
  ): Promise<ChatConversation[]> {
    const providerTenant = await this.getProviderTenant(providerId);
    if (!providerTenant) return [];

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select(`
        *,
        patient:patients!patient_id(
          id,
          first_name,
          last_name,
          medical_record_number
        ),
        messages:chat_messages(count)
      `)
      .eq('tenant_id', providerTenant)
      .or(`patient.first_name.ilike.%${searchTerm}%,patient.last_name.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error searching conversations:', error);
      return [];
    }

    return data || [];
  }

  // Helper methods
  private async getProviderTenant(providerId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('tenant_id')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error('Error fetching provider tenant:', error);
      return null;
    }

    return data?.tenant_id;
  }

  private async getMessage(messageId: string): Promise<ChatMessage | null> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      return null;
    }

    return data;
  }

  private async isMessageRelevantToProvider(
    message: ChatMessage,
    tenantId: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('tenant_id')
      .eq('id', message.conversation_id)
      .single();

    return !error && data?.tenant_id === tenantId;
  }

  private async isTypingRelevantToProvider(
    indicator: TypingIndicator,
    tenantId: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('tenant_id')
      .eq('id', indicator.conversation_id)
      .single();

    return !error && data?.tenant_id === tenantId;
  }

  private handleConversationChange(
    payload: RealtimePostgresChangesPayload<ChatConversation>,
    callback: (conversation: ChatConversation) => void
  ) {
    if (payload.new) {
      callback(payload.new as ChatConversation);
    }
  }

  // Cleanup subscriptions
  unsubscribe(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, key) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
    
    // Clear all typing timers
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
  }
}

// Export singleton instance
export const providerChatService = new ProviderChatService();