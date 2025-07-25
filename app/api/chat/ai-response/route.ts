import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, patientId, currentTask } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback response');
      return NextResponse.json({
        reply: "Thank you for sharing that with me. How else can I help you with your recovery today?",
        actions: []
      });
    }

    // Build system prompt based on context
    const systemPrompt = buildSystemPrompt(context, currentTask);
    
    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiReply = completion.choices[0]?.message?.content || "I'm here to help with your recovery. Could you tell me more?";
    
    // Determine next actions based on response
    const actions = determineActions(aiReply, currentTask, context, message);
    
    return NextResponse.json({
      reply: aiReply,
      actions
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    return NextResponse.json({ 
      reply: "I'm having trouble responding right now, but I'm here to help. A care team member will be with you shortly if you need immediate assistance.",
      actions: [{
        type: 'escalate_to_provider',
        reason: 'ai_system_error'
      }]
    });
  }
}

function buildSystemPrompt(context: any, currentTask: any) {
  const basePrompt = `You are a helpful recovery assistant for TJV Recovery Platform, helping patients through their joint replacement recovery journey.

PATIENT CONTEXT:
- Recovery Day: ${context.recoveryDay || 'unknown'}
- Surgery Type: ${context.surgeryType || 'joint replacement'}
- Patient ID: ${context.patientId}

RECENT CONVERSATION:
${context.recentMessages?.map((msg: any) => `${msg.message_type}: ${msg.content}`).join('\n') || 'No recent messages'}

CURRENT TASK: ${currentTask ? `Patient should complete: ${currentTask.title || 'Assessment'}` : 'No specific task assigned'}

GUIDELINES:
- Be encouraging, empathetic, and supportive
- Ask relevant follow-up questions about pain, mobility, and concerns
- Provide gentle guidance and motivation
- Suggest when to contact care team for serious issues
- Keep responses conversational but professional
- Focus on the patient's recovery progress and wellbeing
- If patient reports severe pain (8+) or concerning symptoms, recommend immediate care team contact
- Celebrate small wins and progress
- Be concise but thorough (2-3 sentences typically)

CONCERNING SYMPTOMS TO WATCH FOR:
- Severe pain (8+ on scale)
- Signs of infection (fever, unusual swelling, discharge)
- Inability to move or bear weight
- Severe shortness of breath
- Chest pain
- Signs of blood clots (leg swelling, warmth, redness)

RESPONSE STYLE:
- Warm and personable
- Use encouraging language
- Ask one relevant question to continue the conversation
- Acknowledge the patient's feelings and concerns
- Provide practical, actionable guidance when appropriate

Respond naturally and helpfully to the patient's message, keeping their recovery journey in mind.`;

  return basePrompt;
}

function determineActions(aiReply: string, currentTask: any, context: any, userMessage: string) {
  const actions = [];
  
  // Check for high pain level mentions in user message
  const painMatch = userMessage.match(/pain.*?(\d+)|(\d+).*?pain/i);
  if (painMatch) {
    const painLevel = parseInt(painMatch[1] || painMatch[2]);
    if (painLevel >= 8) {
      actions.push({
        type: 'escalate_to_provider',
        reason: 'high_pain_level',
        data: { painLevel, userMessage }
      });
    }
  }
  
  // Check for concerning keywords in user message
  const concerningKeywords = [
    'emergency', 'severe', 'can\'t move', 'infection', 'fever', 
    'chest pain', 'can\'t breathe', 'blood', 'swelling', 'discharge',
    'urgent', 'help me', 'something wrong', 'worried', 'scared'
  ];
  
  const hasConcerningSymptoms = concerningKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (hasConcerningSymptoms) {
    actions.push({
      type: 'escalate_to_provider',
      reason: 'concerning_symptoms',
      data: { symptoms: userMessage }
    });
  }
  
  // Check if task should be marked complete based on user message
  if (currentTask) {
    const completionKeywords = [
      'completed', 'finished', 'done', 'yes', 'finished it', 
      'did it', 'completed it', 'already did'
    ];
    
    const taskCompleted = completionKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (taskCompleted) {
      actions.push({
        type: 'complete_task',
        taskId: currentTask.id
      });
    }
  }
  
  // Check for positive progress indicators
  const positiveKeywords = [
    'better', 'good', 'great', 'improving', 'progress', 
    'feeling well', 'much better', 'getting stronger'
  ];
  
  const hasPositiveProgress = positiveKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (hasPositiveProgress) {
    actions.push({
      type: 'record_positive_progress',
      data: { progressNote: userMessage }
    });
  }
  
  // Check for requests for help
  const helpKeywords = [
    'help', 'assistance', 'support', 'don\'t know', 'confused',
    'question', 'need someone', 'talk to someone'
  ];
  
  const needsHelp = helpKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  if (needsHelp && !hasConcerningSymptoms) {
    actions.push({
      type: 'offer_provider_contact',
      reason: 'patient_needs_support'
    });
  }
  
  return actions;
}

// Additional utility functions for context building
async function buildConversationContext(patientId: string) {
  const supabase = await createClient();
  
  try {
    // Get patient information
    const { data: patient } = await supabase
      .from('patients')
      .select('*, profiles(*)')
      .eq('user_id', patientId)
      .single();

    // Get recent pain reports
    const { data: painReports } = await supabase
      .from('pain_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('reported_at', { ascending: false })
      .limit(5);

    // Get recent task completions
    const { data: taskCompletions } = await supabase
      .from('patient_tasks')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    return {
      patient,
      recentPainReports: painReports || [],
      recentTaskCompletions: taskCompletions || []
    };
  } catch (error) {
    console.error('Error building conversation context:', error);
    return {};
  }
}