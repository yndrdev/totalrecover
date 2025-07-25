import OpenAI from 'openai';

// Initialize OpenAI client with error handling
export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  return new OpenAI({
    apiKey,
    maxRetries: 3,
    timeout: 30000, // 30 seconds timeout
  });
}

// Singleton instance for reuse
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
}

// Model configurations for healthcare context
export const AI_MODELS = {
  CONVERSATION: 'gpt-4-turbo-preview', // Better for medical context understanding
  ANALYSIS: 'gpt-4', // For complex medical analysis
  QUICK_RESPONSE: 'gpt-3.5-turbo', // For simple, fast responses
} as const;

// Temperature settings for different use cases
export const AI_TEMPERATURES = {
  MEDICAL_ADVICE: 0.3, // Lower temperature for consistent medical responses
  CONVERSATION: 0.7, // Balanced for natural conversation
  CREATIVE: 0.9, // Higher for educational content generation
} as const;

// Token limits for different response types
export const TOKEN_LIMITS = {
  SHORT_RESPONSE: 150,
  NORMAL_RESPONSE: 500,
  DETAILED_RESPONSE: 1000,
  MAX_CONTEXT: 4000,
} as const;