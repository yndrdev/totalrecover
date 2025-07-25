import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeConfig {
  tenantId: string;
  patientId?: string;
  conversationId?: string;
  onNewMessage?: (message: any) => void;
  onNewAlert?: (alert: any) => void;
  onConversationUpdate?: (conversation: any) => void;
  onUserTyping?: (userId: string, isTyping: boolean) => void;
}

export class ChatRealtimeManager {
  private supabase;
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: RealtimeConfig;

  constructor(config: RealtimeConfig) {
    this.supabase = createClient();
    this.config = config;
  }

  /**
   * Setup all realtime subscriptions
   */
  async initialize(): Promise<void> {
    console.log('Initializing chat realtime subscriptions...');

    try {
      // Subscribe to messages
      await this.subscribeToMessages();
      
      // Subscribe to conversations
      await this.subscribeToConversations();
      
      // Subscribe to alerts
      await this.subscribeToAlerts();
      
      // Subscribe to typing indicators
      await this.subscribeToTypingIndicators();

      console.log('Chat realtime subscriptions initialized successfully');
    } catch (error) {
      console.error('Error initializing realtime subscriptions:', error);
    }
  }

  /**
   * Subscribe to new messages
   */
  private async subscribeToMessages(): Promise<void> {
    const channelName = this.config.conversationId 
      ? `messages-conversation-${this.config.conversationId}`
      : `messages-tenant-${this.config.tenantId}`;

    const channel = this.supabase.channel(channelName);

    // Listen for new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: this.config.conversationId 
          ? `conversation_id=eq.${this.config.conversationId}`
          : `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('New message received:', payload.new);
        if (this.config.onNewMessage) {
          this.config.onNewMessage(payload.new);
        }
      }
    );

    // Listen for message updates (read status, etc.)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: this.config.conversationId 
          ? `conversation_id=eq.${this.config.conversationId}`
          : `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('Message updated:', payload.new);
        if (this.config.onNewMessage) {
          this.config.onNewMessage(payload.new);
        }
      }
    );

    await channel.subscribe();
    this.channels.set('messages', channel);
  }

  /**
   * Subscribe to conversation changes
   */
  private async subscribeToConversations(): Promise<void> {
    const channelName = `conversations-tenant-${this.config.tenantId}`;
    const channel = this.supabase.channel(channelName);

    // Listen for new conversations
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('New conversation created:', payload.new);
        if (this.config.onConversationUpdate) {
          this.config.onConversationUpdate(payload.new);
        }
      }
    );

    // Listen for conversation updates
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('Conversation updated:', payload.new);
        if (this.config.onConversationUpdate) {
          this.config.onConversationUpdate(payload.new);
        }
      }
    );

    await channel.subscribe();
    this.channels.set('conversations', channel);
  }

  /**
   * Subscribe to alerts
   */
  private async subscribeToAlerts(): Promise<void> {
    const channelName = `alerts-tenant-${this.config.tenantId}`;
    const channel = this.supabase.channel(channelName);

    // Listen for new alerts
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('New alert created:', payload.new);
        if (this.config.onNewAlert) {
          this.config.onNewAlert(payload.new);
        }
      }
    );

    // Listen for alert updates
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'alerts',
        filter: `tenant_id=eq.${this.config.tenantId}`
      },
      (payload) => {
        console.log('Alert updated:', payload.new);
        if (this.config.onNewAlert) {
          this.config.onNewAlert(payload.new);
        }
      }
    );

    await channel.subscribe();
    this.channels.set('alerts', channel);
  }

  /**
   * Subscribe to typing indicators
   */
  private async subscribeToTypingIndicators(): Promise<void> {
    if (!this.config.conversationId) return;

    const channelName = `typing-${this.config.conversationId}`;
    const channel = this.supabase.channel(channelName);

    // Listen for typing events
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      console.log('Typing event received:', payload);
      if (this.config.onUserTyping && payload.payload) {
        this.config.onUserTyping(payload.payload.userId, payload.payload.isTyping);
      }
    });

    await channel.subscribe();
    this.channels.set('typing', channel);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(userId: string, isTyping: boolean): Promise<void> {
    if (!this.config.conversationId) return;

    const channel = this.channels.get('typing');
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping }
      });
    }
  }

  /**
   * Subscribe to presence (online users)
   */
  async subscribeToPresence(): Promise<void> {
    if (!this.config.conversationId) return;

    const channelName = `presence-${this.config.conversationId}`;
    const channel = this.supabase.channel(channelName);

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence sync:', state);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    });

    // Track current user
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presenceTrackStatus = await channel.track({
          user_id: this.config.patientId,
          online_at: new Date().toISOString(),
        });
        console.log('Presence track status:', presenceTrackStatus);
      }
    });

    this.channels.set('presence', channel);
  }

  /**
   * Update user presence
   */
  async updatePresence(status: 'online' | 'away' | 'busy'): Promise<void> {
    const channel = this.channels.get('presence');
    if (channel) {
      await channel.track({
        user_id: this.config.patientId,
        status,
        last_seen: new Date().toISOString(),
      });
    }
  }

  /**
   * Clean up all subscriptions
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up chat realtime subscriptions...');

    for (const [name, channel] of this.channels) {
      try {
        await this.supabase.removeChannel(channel);
        console.log(`Removed channel: ${name}`);
      } catch (error) {
        console.error(`Error removing channel ${name}:`, error);
      }
    }

    this.channels.clear();
    console.log('Chat realtime cleanup completed');
  }

  /**
   * Get channel status
   */
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  /**
   * Get all channel statuses
   */
  getAllChannelStatuses(): Record<string, string> {
    const statuses: Record<string, string> = {};
    for (const [name, channel] of this.channels) {
      statuses[name] = channel.state;
    }
    return statuses;
  }
}

// Utility functions for common realtime patterns
export function setupPatientChatRealtime(
  conversationId: string,
  tenantId: string,
  patientId: string,
  callbacks: {
    onNewMessage?: (message: any) => void;
    onNewAlert?: (alert: any) => void;
  }
): ChatRealtimeManager {
  const manager = new ChatRealtimeManager({
    conversationId,
    tenantId,
    patientId,
    ...callbacks
  });

  manager.initialize();
  return manager;
}

export function setupProviderMonitoringRealtime(
  tenantId: string,
  callbacks: {
    onNewMessage?: (message: any) => void;
    onNewAlert?: (alert: any) => void;
    onConversationUpdate?: (conversation: any) => void;
  }
): ChatRealtimeManager {
  const manager = new ChatRealtimeManager({
    tenantId,
    ...callbacks
  });

  manager.initialize();
  return manager;
}