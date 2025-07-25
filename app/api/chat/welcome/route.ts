import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions for recovery phase analysis
function getRecoveryPhase(daysPostOp: number): string {
  if (daysPostOp <= 14) return "Early Recovery";
  if (daysPostOp <= 42) return "Mid Recovery";
  if (daysPostOp <= 84) return "Late Recovery";
  return "Maintenance";
}

function getSurgeryFullName(surgeryType: string): string {
  switch (surgeryType) {
    case 'TKA': return 'Total Knee Arthroplasty';
    case 'THA': return 'Total Hip Arthroplasty';
    case 'TSA': return 'Total Shoulder Arthroplasty';
    default: return surgeryType;
  }
}

function getWelcomePrompt(context: any): string {
  const recoveryPhase = getRecoveryPhase(context.daysPostOp);
  const surgeryFullName = getSurgeryFullName(context.surgeryType);
  
  return `You are a compassionate healthcare recovery assistant. Generate a warm, personalized welcome message for a patient returning to their recovery platform.

Patient Context:
- Name: ${context.firstName}
- Surgery: ${surgeryFullName}
- Recovery day: ${context.daysPostOp} (${recoveryPhase} phase)
- Time of day: ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}

Welcome Message Guidelines:
- Start with appropriate greeting for time of day
- Use their first name warmly
- Reference their surgery type and recovery day
- Acknowledge their progress appropriately for their phase
- Ask how they're feeling today
- Keep it warm, supportive, and conversational (2-3 sentences)
- Sound like a caring healthcare professional, not a chatbot

For ${recoveryPhase} Phase:
${getPhaseSpecificWelcomeGuidance(recoveryPhase)}

Generate ONLY the welcome message, no additional text.`;
}

function getPhaseSpecificWelcomeGuidance(phase: string): string {
  switch (phase) {
    case "Early Recovery":
      return "- Acknowledge they're in early recovery and that's a crucial time\n- Express support for their healing process\n- Show understanding that this phase can be challenging";
    case "Mid Recovery":
      return "- Celebrate their progress so far\n- Acknowledge they're in an active recovery phase\n- Encourage their continued efforts";
    case "Late Recovery":
      return "- Celebrate how far they've come\n- Acknowledge they're in the final stretch\n- Show enthusiasm for their progress";
    case "Maintenance":
      return "- Celebrate their successful recovery\n- Acknowledge they're in maintenance phase\n- Express continued support";
    default:
      return "- Provide warm, encouraging support\n- Acknowledge their recovery journey";
  }
}

export async function POST(request: Request) {
  try {
    const { conversationId, patientId, tenantId, context } = await request.json();
    console.log("Welcome API called with:", { conversationId, patientId, context });
    
    const supabase = await createClient();

    // Get user to ensure they're authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for tenant isolation
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.tenant_id !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if conversation already has messages
    const { data: existingMessages } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("tenant_id", tenantId)
      .limit(1);

    if (existingMessages && existingMessages.length > 0) {
      return NextResponse.json({ 
        message: "Conversation already has messages",
        skip: true 
      });
    }

    // Generate AI welcome message
    let welcomeMessage: string;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: getWelcomePrompt(context),
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      welcomeMessage = completion.choices[0].message.content || 
        `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${context.firstName}! Welcome back to your recovery journey. How are you feeling today?`;
      
      console.log("Welcome message generated:", welcomeMessage);
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      // Fallback welcome message
      welcomeMessage = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${context.firstName}! Welcome back to your recovery journey. How are you feeling today?`;
    }

    // Save welcome message to database
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender_type: "ai",
      sender_id: null,
      content: welcomeMessage,
      metadata: { 
        message_type: "welcome",
        recovery_phase: getRecoveryPhase(context.daysPostOp),
        surgery_type: context.surgeryType,
        days_post_op: context.daysPostOp
      },
      created_at: new Date().toISOString()
    });

    if (error) {
      throw error;
    }

    // Update conversation with first message
    await supabase
      .from("conversations")
      .update({
        total_messages: 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("tenant_id", tenantId);

    return NextResponse.json({ 
      success: true, 
      message: welcomeMessage,
      phase: getRecoveryPhase(context.daysPostOp)
    });
  } catch (error) {
    console.error("Welcome API error:", error);
    return NextResponse.json(
      { error: "Failed to generate welcome message" },
      { status: 500 }
    );
  }
}