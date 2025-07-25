import { createClient } from '@/lib/supabase/server';

// Error types for AI operations
export enum AIErrorType {
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  INVALID_REQUEST = 'invalid_request',
  TIMEOUT = 'timeout',
  CONTENT_FILTER = 'content_filter',
  UNKNOWN = 'unknown'
}

export interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: any;
  retryable: boolean;
  fallbackAvailable: boolean;
}

// Categorize OpenAI errors
export function categorizeOpenAIError(error: any): AIError {
  // Rate limit errors
  if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
    return {
      type: AIErrorType.RATE_LIMIT,
      message: 'AI service is currently busy. Please try again in a moment.',
      originalError: error,
      retryable: true,
      fallbackAvailable: true
    };
  }

  // Authentication errors
  if (error?.status === 401 || error?.code === 'invalid_api_key') {
    return {
      type: AIErrorType.AUTHENTICATION,
      message: 'AI service configuration error. Please contact support.',
      originalError: error,
      retryable: false,
      fallbackAvailable: true
    };
  }

  // Network errors
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || error?.message?.includes('fetch')) {
    return {
      type: AIErrorType.NETWORK,
      message: 'Network connection issue. Please check your connection.',
      originalError: error,
      retryable: true,
      fallbackAvailable: true
    };
  }

  // Content filter errors
  if (error?.code === 'content_filter' || error?.message?.includes('content filtering')) {
    return {
      type: AIErrorType.CONTENT_FILTER,
      message: 'Your message was flagged by our safety system. Please rephrase.',
      originalError: error,
      retryable: false,
      fallbackAvailable: false
    };
  }

  // Invalid request errors
  if (error?.status === 400 || error?.code === 'invalid_request_error') {
    return {
      type: AIErrorType.INVALID_REQUEST,
      message: 'Invalid request format. Please try again.',
      originalError: error,
      retryable: false,
      fallbackAvailable: true
    };
  }

  // Timeout errors
  if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
    return {
      type: AIErrorType.TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
      retryable: true,
      fallbackAvailable: true
    };
  }

  // Unknown errors
  return {
    type: AIErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Using fallback response.',
    originalError: error,
    retryable: true,
    fallbackAvailable: true
  };
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Exponential backoff with jitter
export function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, config.maxDelay);
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

// Retry wrapper for AI operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: AIError) => void
): Promise<T> {
  let lastError: AIError | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = categorizeOpenAIError(error);
      
      // Don't retry if not retryable
      if (!lastError.retryable) {
        throw lastError;
      }
      
      // Don't retry if this is the last attempt
      if (attempt === config.maxRetries) {
        throw lastError;
      }
      
      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, config);
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }
      
      // Log retry attempt
      console.log(`AI operation retry attempt ${attempt}/${config.maxRetries} after ${delay}ms delay`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

// Log AI errors to database for monitoring
export async function logAIError(
  error: AIError,
  context: {
    patientId?: string;
    conversationId?: string;
    message?: string;
    operation: string;
  }
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from('ai_error_logs').insert({
      error_type: error.type,
      error_message: error.message,
      original_error: error.originalError ? JSON.stringify(error.originalError) : null,
      patient_id: context.patientId,
      conversation_id: context.conversationId,
      operation: context.operation,
      context_message: context.message,
      retryable: error.retryable,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    // Don't throw if logging fails - just console error
    console.error('Failed to log AI error:', logError);
  }
}

// Rate limiting tracker
class RateLimitTracker {
  private attempts: number[] = [];
  private windowMs: number = 60000; // 1 minute window
  private maxAttempts: number = 50; // 50 requests per minute
  
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove attempts outside the window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);
    
    return this.attempts.length < this.maxAttempts;
  }
  
  recordAttempt(): void {
    this.attempts.push(Date.now());
  }
  
  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldestAttempt = Math.min(...this.attempts);
    const waitTime = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, waitTime);
  }
}

export const rateLimitTracker = new RateLimitTracker();

// Enhanced error response for patient-facing messages
export function getPatientFriendlyError(error: AIError): string {
  switch (error.type) {
    case AIErrorType.RATE_LIMIT:
      return "I'm helping many patients right now. Let me try again in just a moment...";
      
    case AIErrorType.NETWORK:
      return "I'm having trouble connecting. Please check your internet connection and try again.";
      
    case AIErrorType.CONTENT_FILTER:
      return "I couldn't process that message. Could you please rephrase your question?";
      
    case AIErrorType.TIMEOUT:
      return "That took longer than expected. Let me try a simpler approach...";
      
    case AIErrorType.AUTHENTICATION:
    case AIErrorType.INVALID_REQUEST:
    case AIErrorType.UNKNOWN:
    default:
      return "I'm having technical difficulties. Your care team has been notified. In the meantime, please feel free to contact them directly if you need immediate assistance.";
  }
}

// Circuit breaker pattern for AI service
export class AICircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly failureThreshold: number = 5;
  private readonly resetTimeout: number = 60000; // 1 minute
  private readonly halfOpenRequests: number = 3;
  private halfOpenAttempts: number = 0;
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'open' && Date.now() - this.lastFailureTime > this.resetTimeout) {
      this.state = 'half-open';
      this.halfOpenAttempts = 0;
    }
    
    // If circuit is open, reject immediately
    if (this.state === 'open') {
      throw new Error('AI service circuit breaker is open. Service temporarily unavailable.');
    }
    
    // If half-open, limit requests
    if (this.state === 'half-open') {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts > this.halfOpenRequests) {
        this.state = 'open';
        throw new Error('AI service circuit breaker reopened due to continued failures.');
      }
    }
    
    try {
      const result = await operation();
      
      // Success - reset failures
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        console.error(`AI Circuit breaker opened after ${this.failures} failures`);
      }
      
      throw error;
    }
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
  
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.halfOpenAttempts = 0;
  }
}

export const aiCircuitBreaker = new AICircuitBreaker();