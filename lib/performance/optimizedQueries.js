import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Performance-optimized database queries with caching and real-time subscriptions
 */
export class OptimizedQueries {
  static cache = new Map();
  static subscriptions = new Map();
  
  // Cache duration in milliseconds
  static CACHE_DURATION = {
    SHORT: 30 * 1000,      // 30 seconds
    MEDIUM: 5 * 60 * 1000,  // 5 minutes  
    LONG: 30 * 60 * 1000    // 30 minutes
  };

  /**
   * Generic cached query with automatic invalidation
   */
  static async cachedQuery(key, queryFn, cacheDuration = this.CACHE_DURATION.MEDIUM) {
    const now = Date.now();
    const cached = this.cache.get(key);
    
    if (cached && (now - cached.timestamp) < cacheDuration) {
      return cached.data;
    }

    const data = await queryFn();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Optimized patient list query with selective fields and filters
   */
  static async getOptimizedPatientList(tenantId, filters = {}) {
    const cacheKey = `patients_${tenantId}_${JSON.stringify(filters)}`;
    
    return this.cachedQuery(cacheKey, async () => {
      let query = supabase
        .from('patients')
        .select(`
          id,
          user_id,
          surgery_type,
          surgery_date,
          current_recovery_day,
          status,
          created_at,
          profiles!patients_user_id_fkey(
            first_name,
            last_name,
            full_name,
            email
          ),
          surgeon:profiles!patients_surgeon_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      // Apply filters efficiently
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.surgeryType) {
        query = query.eq('surgery_type', filters.surgeryType);
      }
      if (filters.recoveryPhase) {
        if (filters.recoveryPhase === 'pre_surgery') {
          query = query.lt('current_recovery_day', 0);
        } else if (filters.recoveryPhase === 'post_surgery') {
          query = query.gte('current_recovery_day', 0);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }, this.CACHE_DURATION.SHORT);
  }

  /**
   * Optimized conversation list with message counts
   */
  static async getOptimizedConversations(tenantId) {
    const cacheKey = `conversations_${tenantId}`;
    
    return this.cachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .rpc('get_conversations_with_counts', {
          p_tenant_id: tenantId
        });
      
      if (error) {
        // Fallback to regular query if RPC not available
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('conversations')
          .select(`
            id,
            patient_id,
            title,
            status,
            created_at,
            last_message_at,
            patients!conversations_patient_id_fkey(
              id,
              profiles!patients_user_id_fkey(
                first_name,
                last_name,
                full_name
              )
            )
          `)
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .order('last_message_at', { ascending: false })
          .limit(20);
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      
      return data;
    }, this.CACHE_DURATION.SHORT);
  }

  /**
   * Optimized metrics calculation
   */
  static async getOptimizedMetrics(tenantId) {
    const cacheKey = `metrics_${tenantId}`;
    
    return this.cachedQuery(cacheKey, async () => {
      // Use RPC for efficient metrics calculation
      const { data, error } = await supabase
        .rpc('get_tenant_metrics', {
          p_tenant_id: tenantId
        });
      
      if (error) {
        // Fallback to individual queries
        const [
          { count: totalPatients },
          { count: activeConversations },
          { count: completedTasks },
          { count: totalProviders }
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
          supabase.from('patient_tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).neq('role', 'patient')
        ]);

        return {
          totalPatients: totalPatients || 0,
          activeConversations: activeConversations || 0,
          completedTasks: completedTasks || 0,
          totalProviders: totalProviders || 0
        };
      }
      
      return data;
    }, this.CACHE_DURATION.MEDIUM);
  }

  /**
   * Paginated patient search with performance optimization
   */
  static async searchPatients(tenantId, searchTerm, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const cacheKey = `search_${tenantId}_${searchTerm}_${page}_${limit}`;
    
    return this.cachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          surgery_type,
          current_recovery_day,
          status,
          profiles!patients_user_id_fkey(
            first_name,
            last_name,
            full_name,
            email
          )
        `)
        .eq('tenant_id', tenantId)
        .or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }, this.CACHE_DURATION.SHORT);
  }

  /**
   * Real-time subscription manager with automatic cleanup
   */
  static setupRealtimeSubscription(subscriptionKey, config) {
    // Clean up existing subscription
    this.cleanupSubscription(subscriptionKey);

    const channel = supabase.channel(subscriptionKey);
    
    // Configure postgres_changes subscriptions
    if (config.tables) {
      config.tables.forEach(tableConfig => {
        channel.on('postgres_changes', {
          event: tableConfig.event || '*',
          schema: 'public',
          table: tableConfig.table,
          filter: tableConfig.filter
        }, (payload) => {
          // Invalidate related cache entries
          this.invalidateCache(tableConfig.table, payload);
          
          // Call the callback
          if (tableConfig.callback) {
            tableConfig.callback(payload);
          }
        });
      });
    }

    // Configure broadcast subscriptions
    if (config.broadcasts) {
      config.broadcasts.forEach(broadcastConfig => {
        channel.on('broadcast', { event: broadcastConfig.event }, broadcastConfig.callback);
      });
    }

    // Subscribe and store reference
    channel.subscribe();
    this.subscriptions.set(subscriptionKey, channel);
    
    return channel;
  }

  /**
   * Cleanup specific subscription
   */
  static cleanupSubscription(subscriptionKey) {
    const existingSubscription = this.subscriptions.get(subscriptionKey);
    if (existingSubscription) {
      supabase.removeChannel(existingSubscription);
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Cleanup all subscriptions
   */
  static cleanupAllSubscriptions() {
    for (const [key, channel] of this.subscriptions) {
      supabase.removeChannel(channel);
    }
    this.subscriptions.clear();
  }

  /**
   * Invalidate cache entries based on table changes
   */
  static invalidateCache(table, payload) {
    const keysToDelete = [];
    
    for (const [key] of this.cache) {
      if (key.includes(table) || 
          (table === 'patients' && key.includes('metrics')) ||
          (table === 'conversations' && key.includes('chat')) ||
          (table === 'messages' && key.includes('conversation'))) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      subscriptions: this.subscriptions.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Pre-fetch commonly used data
   */
  static async prefetchCommonData(tenantId) {
    const prefetchPromises = [
      this.getOptimizedPatientList(tenantId),
      this.getOptimizedConversations(tenantId),
      this.getOptimizedMetrics(tenantId)
    ];
    
    return Promise.all(prefetchPromises);
  }

  /**
   * Batch update multiple records efficiently
   */
  static async batchUpdatePatients(updates) {
    const { data, error } = await supabase
      .from('patients')
      .upsert(updates, { onConflict: 'id' })
      .select();
    
    if (error) throw error;
    
    // Invalidate patient cache
    this.invalidateCache('patients', null);
    
    return data;
  }

  /**
   * Efficient task completion tracking
   */
  static async trackTaskCompletion(taskId, completionData) {
    const { data, error } = await supabase.rpc('complete_patient_task', {
      p_task_id: taskId,
      p_completion_data: completionData
    });
    
    if (error) {
      // Fallback to regular update
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('patient_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_data: completionData
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    
    // Invalidate cache
    this.invalidateCache('patient_tasks', null);
    
    return data;
  }
}

/**
 * Hook for React components to use optimized queries
 */
export function useOptimizedQuery(key, queryFn, dependencies = [], cacheDuration) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await OptimizedQueries.cachedQuery(key, queryFn, cacheDuration);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

export default OptimizedQueries;