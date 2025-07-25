import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { protocolInstantiationService } from '@/lib/services/protocol-instantiation';
import { getOpenAIClient, AI_MODELS, AI_TEMPERATURES, TOKEN_LIMITS } from '@/lib/ai/openai-client';
import { 
  SYSTEM_PROMPTS, 
  buildPatientContext, 
  buildTaskContext,
  shouldEscalateToProvider,
  truncateConversationHistory,
} from '@/lib/ai/healthcare-prompts';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { 
  withRetry, 
  categorizeOpenAIError, 
  logAIError, 
  getPatientFriendlyError,
  aiCircuitBreaker,
  rateLimitTracker
} from '@/lib/ai/error-handling';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      context, 
      patientId, 
      conversationId,
      currentTask,
      recoveryDay 
    } = await request.json();

    // Check rate limiting
    if (!rateLimitTracker.canMakeRequest()) {
      const waitTime = rateLimitTracker.getWaitTime();
      return new Response(JSON.stringify({
        error: `Rate limited. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get patient's current tasks
    let patientTasks = [];
    if (patientId && recoveryDay !== undefined) {
      const tasksResult = await protocolInstantiationService.getPatientTasksForDay(
        patientId, 
        recoveryDay
      );
      if (tasksResult.success) {
        patientTasks = tasksResult.tasks;
      }
    }

    // Build comprehensive context
    const patientContext = buildPatientContext({
      recoveryDay: recoveryDay || context?.recoveryDay || 0,
      surgeryType: context?.surgeryType || 'joint replacement',
      currentPhase: context?.currentPhase,
      lastPainLevel: context?.lastPainLevel,
      recentProgress: context?.recentProgress
    });

    const taskContext = currentTask ? buildTaskContext(currentTask) : '';
    const conversationHistory = context?.conversationHistory || [];
    
    // Initialize OpenAI client
    const openai = getOpenAIClient();
    
    // Prepare messages
    const messages: ChatCompletionMessageParam[] = [
      { 
        role: "system", 
        content: `${SYSTEM_PROMPTS.PATIENT_CONVERSATION}\n\n${patientContext}\n\n${taskContext}`
      },
      ...truncateConversationHistory(conversationHistory, TOKEN_LIMITS.MAX_CONTEXT).map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      })),
      { 
        role: "user", 
        content: message 
      }
    ];

    // Check if we should escalate
    const shouldEscalate = shouldEscalateToProvider(message, context?.lastPainLevel, context);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          rateLimitTracker.recordAttempt();
          
          // Generate streaming AI response
          const completion = await openai.chat.completions.create({
            model: AI_MODELS.CONVERSATION,
            messages,
            temperature: AI_TEMPERATURES.MEDICAL_ADVICE,
            max_tokens: TOKEN_LIMITS.NORMAL_RESPONSE,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
            stream: true,
          });

          let fullResponse = '';
          let tokenCount = 0;

          // Send initial metadata
          const metadata = {
            type: 'metadata',
            data: {
              model: AI_MODELS.CONVERSATION,
              shouldEscalate,
              timestamp: new Date().toISOString()
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Stream the response chunks
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              tokenCount++;
              
              const data = {
                type: 'content',
                data: content
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          }

          // Handle task completion detection
          let taskCompletion = null;
          let nextTasks = [];
          
          if (message.toLowerCase().includes('completed') || 
              message.toLowerCase().includes('finished') || 
              message.toLowerCase().includes('done')) {
            const pendingTasks = patientTasks.filter(t => t.status === 'pending');
            if (pendingTasks.length > 0) {
              taskCompletion = {
                taskId: pendingTasks[0].id,
                completionData: {
                  completed_via: 'chat',
                  completion_message: message,
                  timestamp: new Date().toISOString()
                }
              };
              nextTasks = pendingTasks.slice(1, 4);
              
              // Handle task completion
              await protocolInstantiationService.completePatientTask(
                taskCompletion.taskId,
                taskCompletion.completionData,
                conversationId
              );
            }
          }

          // Send completion metadata
          const completionData = {
            type: 'completion',
            data: {
              fullResponse,
              tokenCount,
              taskCompleted: !!taskCompletion,
              nextTasks,
              shouldEscalate
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
          
          // Close the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          
        } catch (error: any) {
          console.error('Streaming error:', error);
          
          // Send error message
          const errorData = {
            type: 'error',
            data: {
              message: getPatientFriendlyError(categorizeOpenAIError(error)),
              error: error.message
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
      },
    });

  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response',
      message: "I'm having trouble responding right now. Let me connect you with a care team member."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}