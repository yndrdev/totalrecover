import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, AI_MODELS, AI_TEMPERATURES } from '@/lib/ai/openai-client';
import { SYSTEM_PROMPTS, buildPatientContext } from '@/lib/ai/healthcare-prompts';

// Test endpoint for OpenAI integration
export async function POST(request: NextRequest) {
  try {
    const { testType = 'basic' } = await request.json();
    
    // Test different scenarios
    let messages;
    let model;
    let temperature;
    
    switch (testType) {
      case 'basic':
        messages = [
          { role: "system" as const, content: "You are a helpful healthcare assistant. Keep responses brief." },
          { role: "user" as const, content: "Hello, can you help me with my recovery?" }
        ];
        model = AI_MODELS.QUICK_RESPONSE;
        temperature = AI_TEMPERATURES.CONVERSATION;
        break;
        
      case 'medical':
        const patientContext = buildPatientContext({
          recoveryDay: 5,
          surgeryType: 'Total Knee Replacement',
          currentPhase: 1,
          lastPainLevel: 6,
          recentProgress: 'Completed walking exercises'
        });
        messages = [
          { role: "system" as const, content: `${SYSTEM_PROMPTS.PATIENT_CONVERSATION}\n\n${patientContext}` },
          { role: "user" as const, content: "My knee hurts more today than yesterday. Is this normal?" }
        ];
        model = AI_MODELS.CONVERSATION;
        temperature = AI_TEMPERATURES.MEDICAL_ADVICE;
        break;
        
      case 'task':
        messages = [
          { role: "system" as const, content: SYSTEM_PROMPTS.TASK_GUIDANCE },
          { role: "user" as const, content: "I completed my knee flexion exercises" }
        ];
        model = AI_MODELS.CONVERSATION;
        temperature = AI_TEMPERATURES.CONVERSATION;
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }
    
    // Test OpenAI connection
    const openai = getOpenAIClient();
    
    console.log('Testing OpenAI with:', { model, temperature, messageCount: messages.length });
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 150,
    });
    
    const response = completion.choices[0].message.content;
    const usage = completion.usage;
    
    return NextResponse.json({
      success: true,
      testType,
      response,
      usage,
      model,
      temperature,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('OpenAI test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.constructor.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for quick health check
export async function GET() {
  try {
    // Just check if we can create the client
    const openai = getOpenAIClient();
    
    return NextResponse.json({
      status: 'healthy',
      configured: true,
      models: AI_MODELS,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      configured: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}