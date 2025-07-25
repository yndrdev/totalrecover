import { createClient } from '@/lib/supabase/server';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  cost: number;
}

// Pricing per 1K tokens (as of 2024)
export const TOKEN_PRICING = {
  'gpt-4-turbo-preview': {
    prompt: 0.01,    // $0.01 per 1K tokens
    completion: 0.03 // $0.03 per 1K tokens
  },
  'gpt-4': {
    prompt: 0.03,    // $0.03 per 1K tokens
    completion: 0.06 // $0.06 per 1K tokens
  },
  'gpt-3.5-turbo': {
    prompt: 0.0005,  // $0.0005 per 1K tokens
    completion: 0.0015 // $0.0015 per 1K tokens
  }
} as const;

// Calculate cost based on token usage
export function calculateTokenCost(usage: TokenUsage): number {
  const pricing = TOKEN_PRICING[usage.model as keyof typeof TOKEN_PRICING] || TOKEN_PRICING['gpt-3.5-turbo'];
  
  const promptCost = (usage.promptTokens / 1000) * pricing.prompt;
  const completionCost = (usage.completionTokens / 1000) * pricing.completion;
  
  return Number((promptCost + completionCost).toFixed(4));
}

// Token usage tracking service
export class TokenUsageTracker {
  private dailyUsage: Map<string, TokenUsage[]> = new Map();
  private monthlyUsage: Map<string, TokenUsage[]> = new Map();
  
  // Track token usage
  async trackUsage(
    patientId: string,
    conversationId: string,
    usage: TokenUsage,
    context?: {
      operation: string;
      tenantId?: string;
      metadata?: any;
    }
  ): Promise<void> {
    try {
      const supabase = await createClient();
      const cost = calculateTokenCost(usage);
      
      // Store in database
      const { error } = await supabase.from('ai_token_usage').insert({
        patient_id: patientId,
        conversation_id: conversationId,
        tenant_id: context?.tenantId,
        operation: context?.operation || 'chat_response',
        model: usage.model,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        total_tokens: usage.totalTokens,
        cost_usd: cost,
        metadata: context?.metadata || {},
        created_at: new Date().toISOString()
      });
      
      if (error) {
        console.error('Failed to track token usage:', error);
      }
      
      // Update in-memory tracking
      this.updateInMemoryTracking(patientId, usage);
      
    } catch (error) {
      console.error('Token tracking error:', error);
    }
  }
  
  // Update in-memory tracking for quick access
  private updateInMemoryTracking(key: string, usage: TokenUsage): void {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().slice(0, 7);
    
    // Daily tracking
    const dailyKey = `${key}:${today}`;
    if (!this.dailyUsage.has(dailyKey)) {
      this.dailyUsage.set(dailyKey, []);
    }
    this.dailyUsage.get(dailyKey)!.push(usage);
    
    // Monthly tracking
    const monthlyKey = `${key}:${month}`;
    if (!this.monthlyUsage.has(monthlyKey)) {
      this.monthlyUsage.set(monthlyKey, []);
    }
    this.monthlyUsage.get(monthlyKey)!.push(usage);
    
    // Clean up old entries (keep last 30 days)
    this.cleanupOldEntries();
  }
  
  // Get usage statistics
  async getUsageStats(
    tenantId: string,
    timeframe: 'day' | 'week' | 'month' = 'month'
  ): Promise<{
    totalTokens: number;
    totalCost: number;
    byModel: Record<string, { tokens: number; cost: number }>;
    byOperation: Record<string, { tokens: number; cost: number }>;
  }> {
    const supabase = await createClient();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    // Query usage data
    const { data, error } = await supabase
      .from('ai_token_usage')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (error) {
      console.error('Failed to get usage stats:', error);
      return {
        totalTokens: 0,
        totalCost: 0,
        byModel: {},
        byOperation: {}
      };
    }
    
    // Aggregate statistics
    let totalTokens = 0;
    let totalCost = 0;
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    const byOperation: Record<string, { tokens: number; cost: number }> = {};
    
    for (const record of data || []) {
      totalTokens += record.total_tokens;
      totalCost += record.cost_usd;
      
      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { tokens: 0, cost: 0 };
      }
      byModel[record.model].tokens += record.total_tokens;
      byModel[record.model].cost += record.cost_usd;
      
      // By operation
      if (!byOperation[record.operation]) {
        byOperation[record.operation] = { tokens: 0, cost: 0 };
      }
      byOperation[record.operation].tokens += record.total_tokens;
      byOperation[record.operation].cost += record.cost_usd;
    }
    
    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(2)),
      byModel,
      byOperation
    };
  }
  
  // Get patient-specific usage
  async getPatientUsage(
    patientId: string,
    days: number = 30
  ): Promise<{
    totalTokens: number;
    totalCost: number;
    conversationCount: number;
    averageTokensPerConversation: number;
  }> {
    const supabase = await createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('ai_token_usage')
      .select('*')
      .eq('patient_id', patientId)
      .gte('created_at', startDate.toISOString());
    
    if (error || !data) {
      return {
        totalTokens: 0,
        totalCost: 0,
        conversationCount: 0,
        averageTokensPerConversation: 0
      };
    }
    
    const totalTokens = data.reduce((sum, record) => sum + record.total_tokens, 0);
    const totalCost = data.reduce((sum, record) => sum + record.cost_usd, 0);
    const uniqueConversations = new Set(data.map(record => record.conversation_id)).size;
    
    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(2)),
      conversationCount: uniqueConversations,
      averageTokensPerConversation: uniqueConversations > 0 ? Math.round(totalTokens / uniqueConversations) : 0
    };
  }
  
  // Set usage alerts
  async checkUsageAlerts(tenantId: string): Promise<{
    exceeded: boolean;
    percentage: number;
    limit: number;
    current: number;
  }> {
    const supabase = await createClient();
    
    // Get tenant's monthly limit
    const { data: tenant } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();
    
    const monthlyLimit = tenant?.settings?.ai_token_limit || 1000000; // Default 1M tokens
    
    // Get current month usage
    const stats = await this.getUsageStats(tenantId, 'month');
    const percentage = (stats.totalTokens / monthlyLimit) * 100;
    
    return {
      exceeded: stats.totalTokens >= monthlyLimit,
      percentage: Number(percentage.toFixed(2)),
      limit: monthlyLimit,
      current: stats.totalTokens
    };
  }
  
  // Clean up old in-memory entries
  private cleanupOldEntries(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Clean daily usage
    for (const [key, _] of this.dailyUsage) {
      const date = key.split(':')[1];
      if (date < cutoffDate) {
        this.dailyUsage.delete(key);
      }
    }
    
    // Clean monthly usage older than 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoffMonth = threeMonthsAgo.toISOString().slice(0, 7);
    
    for (const [key, _] of this.monthlyUsage) {
      const month = key.split(':')[1];
      if (month < cutoffMonth) {
        this.monthlyUsage.delete(key);
      }
    }
  }
}

// Singleton instance
export const tokenTracker = new TokenUsageTracker();

// Helper function to extract usage from OpenAI response
export function extractTokenUsage(
  completion: any,
  model: string
): TokenUsage {
  const usage = completion.usage || {};
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    model,
    cost: 0 // Will be calculated by tracker
  };
}