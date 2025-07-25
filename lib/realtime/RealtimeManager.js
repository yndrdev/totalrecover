import { createClient } from '@/lib/supabase/client';
import OptimizedQueries from '@/lib/performance/optimizedQueries';

const supabase = createClient();

/**
 * Advanced real-time manager with intelligent connection handling,
 * automatic reconnection, and performance optimization
 */
export class RealtimeManager {
  constructor() {
    this.channels = new Map();
    this.callbacks = new Map();
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.heartbeatInterval = null;
    this.isOnline = navigator?.onLine ?? true;
    
    this.setupConnectionMonitoring();
    this.setupNetworkMonitoring();
  }

  /**
   * Setup connection state monitoring
   */
  setupConnectionMonitoring() {
    // Monitor Supabase connection state
    supabase.realtime.onOpen(() => {
      console.log('Realtime connection opened');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.startHeartbeat();
      this.notifyConnectionState('connected');
    });

    supabase.realtime.onClose(() => {
      console.log('Realtime connection closed');
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      this.notifyConnectionState('disconnected');
      this.handleReconnection();
    });

    supabase.realtime.onError((error) => {
      console.error('Realtime connection error:', error);
      this.connectionState = 'error';
      this.notifyConnectionState('error', error);
    });
  }

  /**
   * Setup network connectivity monitoring
   */
  setupNetworkMonitoring() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network back online');
        this.isOnline = true;
        this.reconnectIfNeeded();
      });

      window.addEventListener('offline', () => {
        console.log('Network went offline');
        this.isOnline = false;
        this.connectionState = 'offline';
        this.notifyConnectionState('offline');
      });
    }
  }

  /**
   * Start heartbeat to monitor connection health
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      // Simple heartbeat - just check if we can still access the client
      try {
        if (supabase.realtime.channels.size === 0 && this.channels.size > 0) {
          console.warn('Detected potential connection issue - no active channels');
          this.handleReconnection();
        }
      } catch (error) {
        console.error('Heartbeat check failed:', error);
        this.handleReconnection();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  async handleReconnection() {
    if (!this.isOnline || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    this.connectionState = 'reconnecting';
    this.notifyConnectionState('reconnecting');

    setTimeout(() => {
      this.reconnectIfNeeded();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  /**
   * Reconnect if needed
   */
  async reconnectIfNeeded() {
    if (this.connectionState === 'connected' || !this.isOnline) {
      return;
    }

    try {
      // Recreate all channels
      const channelConfigs = Array.from(this.callbacks.entries());
      
      // Clear existing channels
      this.cleanup();
      
      // Recreate channels
      for (const [channelKey, config] of channelConfigs) {
        await this.subscribe(channelKey, config);
      }
      
      console.log('Successfully reconnected realtime channels');
    } catch (error) {
      console.error('Failed to reconnect:', error);
      this.handleReconnection();
    }
  }

  /**
   * Notify subscribers of connection state changes
   */
  notifyConnectionState(state, error = null) {
    const connectionCallbacks = this.callbacks.get('__connection__');
    if (connectionCallbacks) {
      connectionCallbacks.forEach(callback => {
        try {
          callback({ state, error, timestamp: new Date().toISOString() });
        } catch (err) {
          console.error('Error in connection callback:', err);
        }
      });
    }
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(callback) {
    if (!this.callbacks.has('__connection__')) {
      this.callbacks.set('__connection__', new Set());
    }
    this.callbacks.get('__connection__').add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get('__connection__')?.delete(callback);
    };
  }

  /**
   * Subscribe to real-time updates with intelligent batching
   */
  async subscribe(channelKey, config) {
    try {
      // Clean up existing channel
      this.unsubscribe(channelKey);

      const channel = supabase.channel(channelKey);
      
      // Store configuration for reconnection
      this.callbacks.set(channelKey, config);

      // Setup postgres_changes subscriptions
      if (config.tables) {
        for (const tableConfig of config.tables) {
          channel.on('postgres_changes', {
            event: tableConfig.event || '*',
            schema: 'public',
            table: tableConfig.table,
            filter: tableConfig.filter
          }, (payload) => {
            this.handleTableChange(tableConfig, payload);
          });
        }
      }

      // Setup broadcast subscriptions
      if (config.broadcasts) {
        for (const broadcastConfig of config.broadcasts) {
          channel.on('broadcast', { 
            event: broadcastConfig.event 
          }, (payload) => {
            this.handleBroadcast(broadcastConfig, payload);
          });
        }
      }

      // Setup presence subscriptions
      if (config.presence) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          config.presence.onSync?.(state);
        });

        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          config.presence.onJoin?.(key, newPresences);
        });

        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          config.presence.onLeave?.(key, leftPresences);
        });
      }

      // Subscribe to the channel
      const subscribeResponse = await channel.subscribe();
      
      if (subscribeResponse === 'SUBSCRIBED') {
        this.channels.set(channelKey, channel);
        console.log(`Successfully subscribed to channel: ${channelKey}`);
        
        // Track presence if configured
        if (config.presence?.track) {
          await channel.track(config.presence.track);
        }
      } else {
        throw new Error(`Failed to subscribe to channel: ${channelKey}`);
      }

      return channel;
    } catch (error) {
      console.error(`Error subscribing to channel ${channelKey}:`, error);
      throw error;
    }
  }

  /**
   * Handle table changes with batching and debouncing
   */
  handleTableChange(tableConfig, payload) {
    // Invalidate cache
    OptimizedQueries.invalidateCache(tableConfig.table, payload);

    // Batch similar changes to avoid overwhelming the UI
    const batchKey = `${tableConfig.table}_${payload.eventType}`;
    
    if (!this.changeBatches) {
      this.changeBatches = new Map();
    }

    if (!this.changeBatches.has(batchKey)) {
      this.changeBatches.set(batchKey, []);
      
      // Debounce and batch changes
      setTimeout(() => {
        const batched = this.changeBatches.get(batchKey);
        this.changeBatches.delete(batchKey);
        
        if (tableConfig.callback) {
          try {
            tableConfig.callback(batched.length === 1 ? batched[0] : batched);
          } catch (error) {
            console.error('Error in table change callback:', error);
          }
        }
      }, tableConfig.debounceMs || 100);
    }

    this.changeBatches.get(batchKey).push(payload);
  }

  /**
   * Handle broadcast messages
   */
  handleBroadcast(broadcastConfig, payload) {
    if (broadcastConfig.callback) {
      try {
        broadcastConfig.callback(payload);
      } catch (error) {
        console.error('Error in broadcast callback:', error);
      }
    }
  }

  /**
   * Send broadcast message
   */
  async broadcast(channelKey, event, payload) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      return await channel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
    throw new Error(`Channel ${channelKey} not found`);
  }

  /**
   * Update presence
   */
  async updatePresence(channelKey, presenceData) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      return await channel.track(presenceData);
    }
    throw new Error(`Channel ${channelKey} not found`);
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelKey) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
      this.callbacks.delete(channelKey);
      console.log(`Unsubscribed from channel: ${channelKey}`);
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    console.log('Cleaning up all realtime subscriptions');
    
    for (const [channelKey, channel] of this.channels) {
      supabase.removeChannel(channel);
    }
    
    this.channels.clear();
    this.callbacks.clear();
    this.stopHeartbeat();
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return {
      state: this.connectionState,
      isOnline: this.isOnline,
      channelCount: this.channels.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Force reconnection
   */
  async forceReconnect() {
    console.log('Forcing realtime reconnection');
    this.cleanup();
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    await this.reconnectIfNeeded();
  }
}

/**
 * Pre-configured subscription setups for common use cases
 */
export class RealtimeSubscriptions {
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Setup patient monitoring for clinic dashboard
   */
  async setupPatientMonitoring(tenantId, callbacks) {
    return this.manager.subscribe(`patient-monitoring-${tenantId}`, {
      tables: [
        {
          table: 'patients',
          filter: `tenant_id=eq.${tenantId}`,
          callback: callbacks.onPatientChange,
          debounceMs: 200
        },
        {
          table: 'patient_tasks',
          event: 'UPDATE',
          callback: callbacks.onTaskUpdate,
          debounceMs: 100
        },
        {
          table: 'alerts',
          filter: `tenant_id=eq.${tenantId}`,
          event: 'INSERT',
          callback: callbacks.onNewAlert,
          debounceMs: 0 // Immediate for alerts
        }
      ]
    });
  }

  /**
   * Setup conversation monitoring for chat
   */
  async setupConversationMonitoring(conversationId, userId, callbacks) {
    return this.manager.subscribe(`conversation-${conversationId}`, {
      tables: [
        {
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
          event: 'INSERT',
          callback: callbacks.onNewMessage,
          debounceMs: 0
        }
      ],
      broadcasts: [
        {
          event: 'typing',
          callback: callbacks.onTyping
        }
      ],
      presence: {
        track: {
          userId,
          onlineAt: new Date().toISOString()
        },
        onSync: callbacks.onPresenceSync,
        onJoin: callbacks.onUserJoin,
        onLeave: callbacks.onUserLeave
      }
    });
  }

  /**
   * Setup provider dashboard monitoring
   */
  async setupProviderMonitoring(tenantId, callbacks) {
    return this.manager.subscribe(`provider-dashboard-${tenantId}`, {
      tables: [
        {
          table: 'conversations',
          filter: `tenant_id=eq.${tenantId}`,
          callback: callbacks.onConversationChange,
          debounceMs: 300
        },
        {
          table: 'alerts',
          filter: `tenant_id=eq.${tenantId}`,
          callback: callbacks.onAlertChange,
          debounceMs: 0
        },
        {
          table: 'messages',
          filter: `tenant_id=eq.${tenantId}`,
          event: 'INSERT',
          callback: callbacks.onNewMessage,
          debounceMs: 100
        }
      ]
    });
  }
}

// Singleton instance
const realtimeManager = new RealtimeManager();
export const realtimeSubscriptions = new RealtimeSubscriptions(realtimeManager);

export default realtimeManager;