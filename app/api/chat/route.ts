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

function getPhaseGoals(phase: string): string {
  switch (phase) {
    case "Early Recovery":
      return "Pain management, wound healing, basic mobility";
    case "Mid Recovery":
      return "Physical therapy progress, increasing activity";
    case "Late Recovery":
      return "Return to normal activities, strength building";
    case "Maintenance":
      return "Long-term health maintenance, activity optimization";
    default:
      return "Recovery progress";
  }
}

function getPhaseSpecificGuidelines(phase: string): string {
  switch (phase) {
    case "Early Recovery":
      return `- Focus on pain management and comfort measures
- Encourage gentle movement and circulation
- Monitor for signs of complications
- Provide reassurance about normal recovery experiences
- Emphasize importance of following post-op instructions`;
    case "Mid Recovery":
      return `- Encourage physical therapy engagement
- Discuss activity progression and milestones
- Support motivation during challenging PT sessions
- Help set realistic expectations for progress
- Celebrate achievements and improvements`;
    case "Late Recovery":
      return `- Focus on returning to normal activities
- Discuss long-term activity goals
- Address any lingering concerns or limitations
- Prepare for discharge from active recovery
- Emphasize maintenance of gains achieved`;
    case "Maintenance":
      return `- Support long-term health maintenance
- Encourage ongoing activity and exercise
- Help with activity modification as needed
- Celebrate successful recovery completion
- Provide ongoing motivation for healthy lifestyle`;
    default:
      return "Provide supportive, recovery-focused guidance";
  }
}

export async function POST(request: Request) {
  try {
    const { conversationId, message, context } = await request.json();
    console.log("Chat API called with:", { conversationId, message, context });
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

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get conversation with tenant isolation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("patient_id, tenant_id")
      .eq("id", conversationId)
      .eq("tenant_id", profile.tenant_id)  // CRITICAL: Tenant isolation
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Get conversation context with tenant isolation
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("tenant_id", profile.tenant_id)  // CRITICAL: Tenant isolation
      .order("created_at", { ascending: true })
      .limit(10);

    // Build conversation history for context
    const conversationHistory = messages?.map((msg) => ({
      role: msg.sender_type === "patient" ? "user" as const : "assistant" as const,
      content: msg.content,
    })) || [];

    // Generate AI response with patient context
    let aiResponse: string;
    try {
      console.log("Calling OpenAI with model: gpt-4");
      
      // Build comprehensive context-aware system prompt
      let systemPrompt = `You are a compassionate healthcare recovery assistant helping patients during their post-surgery recovery. You are part of the TJV Recovery platform, providing personalized support throughout their healing journey.

Core Personality:
- Warm, supportive, and encouraging
- Professional yet conversational tone
- Focus on one topic at a time
- Use simple language appropriate for adults 40+
- Celebrate progress and provide emotional support
- Always prioritize patient safety

Safety Guidelines:
- Encourage contact with healthcare provider for urgent concerns
- Never provide specific medical advice or dosing
- Escalate concerning symptoms to care team
- Remind patients to follow their physician's orders

Response Style:
- Be concise (1-3 sentences typically)
- Ask direct questions without "please" or "could you"
- Use encouraging language and positive reinforcement
- Reference their specific progress when appropriate
- Provide actionable next steps`;

      // Add patient-specific context if available
      if (context) {
        const recoveryPhase = getRecoveryPhase(context.daysPostOp);
        const surgeryFullName = getSurgeryFullName(context.surgeryType);
        
        systemPrompt += `\n\nPatient Context:
- Patient name: ${context.firstName}
- Surgery: ${surgeryFullName}
- Recovery day: ${context.daysPostOp} (${recoveryPhase} phase)
- Today's focus: ${getPhaseGoals(recoveryPhase)}

Conversation Guidelines for ${recoveryPhase} Phase:
${getPhaseSpecificGuidelines(recoveryPhase)}

Always personalize responses using their name (${context.firstName}) and reference their specific surgery type and recovery timeline.`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...conversationHistory,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      aiResponse = completion.choices[0].message.content || "I'm here to help. Could you tell me more?";
      console.log("OpenAI response received:", aiResponse);
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      if (openaiError instanceof Error) {
        console.error("Error details:", openaiError.message);
        return NextResponse.json(
          { error: "Failed to generate AI response", details: openaiError.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to generate AI response" },
        { status: 400 }
      );
    }

    // Save AI response to database with tenant isolation
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: profile.tenant_id,  // CRITICAL: Tenant isolation
      sender_type: "ai",
      sender_id: null, // AI messages don't have a sender_id
      content: aiResponse,
      metadata: {},
      created_at: new Date().toISOString()
    });

    if (error) {
      throw error;
    }

    // Update conversation analytics with tenant isolation
    await supabase
      .from("conversations")
      .update({
        total_messages: (messages?.length || 0) + 2, // Patient message + AI response
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("tenant_id", profile.tenant_id);  // CRITICAL: Tenant isolation

    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}