import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ChatMessage } from '@/types/chat';
import React from 'react';

export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  user_name?: string;
  user_type?: 'patient' | 'provider';
}

export interface RealtimeCallbacks {
  onNewMessage?: (message: ChatMessage) => void;
  onMessageUpdated?: (message: ChatMessage) => void;
  onMessageDeleted?: (messageId: string) => void;
  onTypingUpdate?: (indicator: TypingIndicator) => void;
  onReadReceipt?: (messageId: string, userId: string, readAt: string) => void;
  onPresenceChange?: (users: any[]) => void;
}

export class RealtimeChatService {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: RealtimeCallbacks = {};

  constructor(callbacks?: RealtimeCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  // Subscribe to a conversation for real-time updates
  async subscribeToConversation(
    conversationId: string,
    userId: string,
    userType: 'patient' | 'provider' = 'patient'
  ): Promise<void> {
    // Clean up existing subscription if any
    await this.unsubscribeFromConversation(conversationId);

    const channelName = `conversation-${conversationId}`;
    const channel = this.supabase.channel(channelName);

    // Subscribe to new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload: RealtimePostgresChangesPayload<any>) => {
        if (this.callbacks.onNewMessage && payload.new) {
          // Fetch complete message with provider info
          const { data: fullMessage } = await this.supabase
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
            .eq('id', payload.new.id)
            .single();

          if (fullMessage) {
            const chatMessage: ChatMessage = {
              ...fullMessage,
              provider_name: fullMessage.provider?.user?.full_name
            };
            this.callbacks.onNewMessage(chatMessage);
          }
        }
      }
    );

    // Subscribe to message updates (edits, read receipts)
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload: RealtimePostgresChangesPayload<any>) => {
        if (this.callbacks.onMessageUpdated && payload.new) {
          const { data: fullMessage } = await this.supabase
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
            .eq('id', payload.new.id)
            .single();

          if (fullMessage) {
            const chatMessage: ChatMessage = {
              ...fullMessage,
              provider_name: fullMessage.provider?.user?.full_name
            };
            this.callbacks.onMessageUpdated(chatMessage);
          }
        }
      }
    );

    // Subscribe to typing indicators
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload: RealtimePostgresChangesPayload<any>) => {
        if (this.callbacks.onTypingUpdate) {
          const typingData = payload.new || payload.old;
          if (typingData && typingData.user_id !== userId) {
            // Get user info
            const { data: userData } = await this.supabase
              .from('profiles')
              .select('full_name')
              .eq('id', typingData.user_id)
              .single();

            // Check if user is a provider
            const { data: providerData } = await this.supabase
              .from('providers')
              .select('id')
              .eq('user_id', typingData.user_id)
              .single();

            const indicator: TypingIndicator = {
              user_id: typingData.user_id,
              conversation_id: conversationId,
              is_typing: payload.eventType !== 'DELETE' && typingData.is_typing,
              user_name: userData?.full_name,
              user_type: providerData ? 'provider' : 'patient'
            };

            this.callbacks.onTypingUpdate(indicator);
          }
        }
      }
    );

    // Subscribe to read receipts
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'message_read_receipts'
      },
      async (payload: RealtimePostgresChangesPayload<any>) => {
        if (this.callbacks.onReadReceipt && payload.new) {
          // Check if this receipt is for a message in our conversation
          const { data: message } = await this.supabase
            .from('chat_messages')
            .select('conversation_id')
            .eq('id', payload.new.message_id)
            .single();

          if (message && message.conversation_id === conversationId) {
            this.callbacks.onReadReceipt(
              payload.new.message_id,
              payload.new.user_id,
              payload.new.read_at
            );
          }
        }
      }
    );

    // Subscribe to presence (who's online)
    channel.on('presence', { event: 'sync' }, () => {
      if (this.callbacks.onPresenceChange) {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        this.callbacks.onPresenceChange(users);
      }
    });

    // Track our own presence
    await channel.track({
      user_id: userId,
      user_type: userType,
      online_at: new Date().toISOString()
    });

    // Subscribe to the channel
    await channel.subscribe();
    this.channels.set(conversationId, channel);
  }

  // Unsubscribe from a conversation
  async unsubscribeFromConversation(conversationId: string): Promise<void> {
    const channel = this.channels.get(conversationId);
    if (channel) {
      await channel.untrack();
      await channel.unsubscribe();
      this.channels.delete(conversationId);
    }

    // Clear any typing timeouts
    const timeoutKey = `typing-${conversationId}`;
    const timeout = this.typingTimeouts.get(timeoutKey);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(timeoutKey);
    }
  }

  // Send typing indicator
  async sendTypingIndicator(
    conversationId: string,
    isTyping: boolean = true
  ): Promise<void> {
    try {
      // Update typing indicator in database
      await this.supabase.rpc('update_typing_indicator', {
        p_conversation_id: conversationId,
        p_is_typing: isTyping
      });

      // Auto-clear typing after 10 seconds
      if (isTyping) {
        const timeoutKey = `typing-${conversationId}`;
        
        // Clear existing timeout
        const existingTimeout = this.typingTimeouts.get(timeoutKey);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          this.sendTypingIndicator(conversationId, false);
          this.typingTimeouts.delete(timeoutKey);
        }, 10000);

        this.typingTimeouts.set(timeoutKey, timeout);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      // Create read receipt
      await this.supabase
        .from('message_read_receipts')
        .insert({
          message_id: messageId,
          user_id: (await this.supabase.auth.getUser()).data.user?.id
        });

      // Update message read_at timestamp
      await this.supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) return;

      // Get unread messages
      const { data: unreadMessages } = await this.supabase
        .from('chat_messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .is('read_at', null)
        .neq('sender_id', user.user.id);

      if (unreadMessages && unreadMessages.length > 0) {
        // Create read receipts for all unread messages
        const receipts = unreadMessages.map(msg => ({
          message_id: msg.id,
          user_id: user.user!.id
        }));

        await this.supabase
          .from('message_read_receipts')
          .insert(receipts);

        // Update read_at for all messages
        const messageIds = unreadMessages.map(msg => msg.id);
        await this.supabase
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }

  // Subscribe to multiple conversations (for providers monitoring multiple patients)
  async subscribeToMultipleConversations(
    conversationIds: string[],
    userId: string,
    userType: 'provider' | 'patient' = 'provider'
  ): Promise<void> {
    for (const conversationId of conversationIds) {
      await this.subscribeToConversation(conversationId, userId, userType);
    }
  }

  // Update callbacks
  updateCallbacks(callbacks: Partial<RealtimeCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Clean up all subscriptions
  async cleanup(): Promise<void> {
    // Clear all typing timeouts
    for (const timeout of this.typingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.typingTimeouts.clear();

    // Unsubscribe from all channels
    for (const conversationId of this.channels.keys()) {
      await this.unsubscribeFromConversation(conversationId);
    }
  }

  // Get online users in a conversation
  getOnlineUsers(conversationId: string): any[] {
    const channel = this.channels.get(conversationId);
    if (!channel) return [];

    const state = channel.presenceState();
    return Object.values(state).flat();
  }

  // Check if user is typing
  async isUserTyping(conversationId: string, userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('typing_indicators')
      .select('is_typing, updated_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    // Check if typing indicator is recent (within 30 seconds)
    const updatedAt = new Date(data.updated_at);
    const now = new Date();
    const diffSeconds = (now.getTime() - updatedAt.getTime()) / 1000;

    return data.is_typing && diffSeconds < 30;
  }
}

// Singleton instance for app-wide use
let realtimeService: RealtimeChatService | null = null;

export function getRealtimeChatService(callbacks?: RealtimeCallbacks): RealtimeChatService {
  if (!realtimeService) {
    realtimeService = new RealtimeChatService(callbacks);
  } else if (callbacks) {
    realtimeService.updateCallbacks(callbacks);
  }
  return realtimeService;
}

// Helper hook for React components
export function useRealtimeChat(
  conversationId: string | null,
  userId: string | null,
  userType: 'patient' | 'provider' = 'patient',
  callbacks?: RealtimeCallbacks
) {
  const service = getRealtimeChatService(callbacks);

  // Subscribe on mount/change
  React.useEffect(() => {
    if (conversationId && userId) {
      service.subscribeToConversation(conversationId, userId, userType);
    }

    return () => {
      if (conversationId) {
        service.unsubscribeFromConversation(conversationId);
      }
    };
  }, [conversationId, userId, userType]);

  return {
    sendTypingIndicator: (isTyping: boolean) => 
      conversationId ? service.sendTypingIndicator(conversationId, isTyping) : Promise.resolve(),
    markMessageAsRead: (messageId: string) => 
      service.markMessageAsRead(messageId),
    markConversationAsRead: () => 
      conversationId ? service.markConversationAsRead(conversationId) : Promise.resolve(),
    getOnlineUsers: () => 
      conversationId ? service.getOnlineUsers(conversationId) : [],
    isUserTyping: (userId: string) => 
      conversationId ? service.isUserTyping(conversationId, userId) : Promise.resolve(false)
  };
}