import { RecoveryPhase, TaskType } from '@/types/database';

// System prompts for different contexts
export const SYSTEM_PROMPTS = {
  PATIENT_CONVERSATION: `You are a compassionate and knowledgeable AI recovery assistant for the TJV Recovery Platform, helping patients through their joint replacement recovery journey.

Your role:
- Provide supportive, encouraging guidance while maintaining professional boundaries
- Help patients complete their daily recovery tasks and exercises
- Monitor for concerning symptoms that require provider attention
- Use simple, clear language appropriate for patients aged 40+
- Be empathetic but avoid giving direct medical advice

Important guidelines:
- Always prioritize patient safety - escalate serious concerns immediately
- Encourage adherence to the prescribed recovery protocol
- Celebrate progress and milestones to maintain motivation
- If pain levels are 8+ or concerning symptoms are reported, recommend immediate provider contact
- Maintain HIPAA compliance - never share patient information`,

  PROVIDER_SUMMARY: `You are a medical AI assistant summarizing patient conversations for healthcare providers.

Focus on:
- Key symptoms and pain levels reported
- Task completion status and compliance
- Red flags or concerning symptoms
- Patient questions that need provider attention
- Overall recovery progress

Format summaries clearly with bullet points and medical terminology where appropriate.`,

  TASK_GUIDANCE: `You are guiding a patient through a specific recovery task. Be clear, step-by-step, and encouraging.

Provide:
- Clear instructions for the task
- Safety reminders and precautions
- Modifications if the patient reports difficulty
- Encouragement and motivation
- Next steps after completion`,
} as const;

// Context builders for different scenarios
export function buildPatientContext(
  patientData: {
    recoveryDay: number;
    surgeryType: string;
    currentPhase?: number;
    lastPainLevel?: number;
    recentProgress?: string;
  }
): string {
  return `
PATIENT CONTEXT:
- Surgery Type: ${patientData.surgeryType}
- Recovery Day: ${patientData.recoveryDay}
- Current Phase: ${getPhaseDescription(patientData.currentPhase || 0)}
- Last Reported Pain: ${patientData.lastPainLevel || 'Unknown'}/10
- Recent Progress: ${patientData.recentProgress || 'No recent updates'}

Recovery Status: ${getRecoveryStatus(patientData.recoveryDay)}
`;
}

export function buildTaskContext(
  task: {
    type: TaskType;
    title: string;
    description?: string;
    instructions?: string;
  }
): string {
  return `
CURRENT TASK:
- Type: ${task.type}
- Title: ${task.title}
- Description: ${task.description || 'N/A'}
- Instructions: ${task.instructions || 'Standard protocol'}

Help the patient complete this task safely and effectively.
`;
}

// Helper functions
function getPhaseDescription(phase: number): string {
  const phases = [
    'Pre-Surgery Preparation',
    'Immediate Post-Op (Week 1)',
    'Early Recovery (Weeks 2-3)',
    'Intermediate Recovery (Weeks 4-6)',
    'Advanced Recovery (Weeks 7-12)',
    'Maintenance Phase (3+ months)',
  ];
  return phases[phase] || 'Unknown Phase';
}

function getRecoveryStatus(recoveryDay: number): string {
  if (recoveryDay < 0) return 'Preparing for surgery';
  if (recoveryDay <= 7) return 'Critical early recovery period - close monitoring needed';
  if (recoveryDay <= 21) return 'Building foundation - establishing routines';
  if (recoveryDay <= 42) return 'Progressive strengthening phase';
  if (recoveryDay <= 84) return 'Advanced recovery - returning to activities';
  return 'Long-term maintenance phase';
}

// Response templates for common scenarios
export const RESPONSE_TEMPLATES = {
  HIGH_PAIN_ALERT: `I'm concerned about your pain level of {painLevel}. This is higher than expected for day {recoveryDay} of recovery.

Please take these immediate steps:
1. Stop any current activity and rest
2. Apply ice to the area (20 minutes on, 20 minutes off)
3. Take your prescribed pain medication if due
4. Contact your care team right away if pain persists

I'm notifying your care team about this elevated pain level. Someone will check on you soon.`,

  TASK_COMPLETION_PRAISE: `Excellent work completing {taskName}! 🎉 

You're making great progress in your recovery. Every completed task brings you closer to full mobility and strength.

{specificPraise}

Ready for your next task?`,

  EXERCISE_MODIFICATION: `I understand the {exerciseName} is challenging. Let's modify it to make it more manageable:

{modifications}

Remember:
- Quality over quantity - proper form is most important
- Some discomfort is normal, but sharp pain means stop
- You can always try the full version tomorrow

Would you like to try the modified version?`,

  DAILY_CHECK_IN_START: `Good {timeOfDay}! Welcome to your day {recoveryDay} check-in.

I'll guide you through today's recovery tasks and check on your progress. Remember, I'm here to support you every step of the way.

How are you feeling today? On a scale of 1-10, what's your current pain level?`,
} as const;

// Conversation flow helpers
export function shouldEscalateToProvider(
  message: string,
  painLevel?: number,
  context?: any
): boolean {
  const concerningKeywords = [
    'emergency',
    'severe pain',
    'can\'t move',
    'infection',
    'fever',
    'bleeding',
    'chest pain',
    'shortness of breath',
    'numbness',
    'swelling getting worse',
    'medication not working',
  ];
  
  const lowerMessage = message.toLowerCase();
  
  // Check pain threshold
  if (painLevel && painLevel >= 8) return true;
  
  // Check concerning keywords
  if (concerningKeywords.some(keyword => lowerMessage.includes(keyword))) return true;
  
  // Check context-specific concerns
  if (context?.recoveryDay <= 3 && lowerMessage.includes('drainage')) return true;
  if (context?.recoveryDay <= 7 && lowerMessage.includes('hot')) return true;
  
  return false;
}

// Format AI response with appropriate tone
export function formatPatientResponse(
  response: string,
  tone: 'encouraging' | 'concerned' | 'informative' = 'encouraging'
): string {
  // Add appropriate emoji and formatting based on tone
  switch (tone) {
    case 'encouraging':
      return `${response} 💪`;
    case 'concerned':
      return `⚠️ ${response}`;
    case 'informative':
      return `ℹ️ ${response}`;
    default:
      return response;
  }
}

// Token estimation for conversation history
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function truncateConversationHistory(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 3000
): Array<{ role: string; content: string }> {
  let totalTokens = 0;
  const truncatedMessages = [];
  
  // Keep messages from most recent, but always include system prompt
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage) {
    truncatedMessages.push(systemMessage);
    totalTokens += estimateTokenCount(systemMessage.content);
  }
  
  // Add messages from most recent backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === 'system') continue; // Already added
    
    const messageTokens = estimateTokenCount(message.content);
    if (totalTokens + messageTokens > maxTokens) break;
    
    truncatedMessages.unshift(message);
    totalTokens += messageTokens;
  }
  
  return truncatedMessages;
}