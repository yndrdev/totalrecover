import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { conversationId, tenantId, taskType, taskData } = await request.json();
    console.log("Task delivery API called:", { conversationId, tenantId, taskType });
    
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

    // Generate task-specific AI message
    const taskMessage = generateTaskMessage(taskType, taskData);

    // Save task message to database
    const { data: messageData, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender_type: "ai",
      sender_id: null,
      content: taskMessage.content,
      metadata: {
        message_type: "task_delivery",
        task_type: taskType,
        task_data: taskData,
        interactive: true
      },
      created_at: new Date().toISOString()
    }).select().single();

    if (error) {
      throw error;
    }

    // Update conversation analytics
    await supabase
      .from("conversations")
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("tenant_id", tenantId);

    return NextResponse.json({ 
      success: true, 
      message: messageData,
      task_type: taskType
    });
  } catch (error) {
    console.error("Task delivery API error:", error);
    return NextResponse.json(
      { error: "Failed to deliver task" },
      { status: 500 }
    );
  }
}

function generateTaskMessage(taskType: string, taskData: any) {
  switch (taskType) {
    case 'pain_assessment':
      return {
        content: `Let's check your pain level today. Please rate your pain on a scale of 1-10, where 1 is minimal discomfort and 10 is severe pain.`,
        quickActions: [
          { label: "1-2 (Minimal)", value: "My pain is minimal today", data: { pain_range: "1-2" } },
          { label: "3-4 (Mild)", value: "I have mild pain", data: { pain_range: "3-4" } },
          { label: "5-6 (Moderate)", value: "My pain is moderate", data: { pain_range: "5-6" } },
          { label: "7-8 (Severe)", value: "I'm experiencing severe pain", data: { pain_range: "7-8" } },
          { label: "9-10 (Extreme)", value: "My pain is extreme", data: { pain_range: "9-10" } }
        ]
      };
    
    case 'exercise':
      return {
        content: `Time for your ${taskData.title || 'exercise'}! ${taskData.description || 'Let me guide you through this exercise.'}`,
        quickActions: [
          { label: "Start Exercise", value: "I'm ready to start", data: { action: "start_exercise" } },
          { label: "Watch Video", value: "I'd like to watch the video first", data: { action: "watch_video" } },
          { label: "Need Help", value: "I need help with this exercise", data: { action: "need_help" } }
        ]
      };
    
    case 'walking_goal':
      return {
        content: `Your walking goal today is ${taskData.target_steps || 2000} steps. How are you feeling about getting some movement in?`,
        quickActions: [
          { label: "Ready to Walk", value: "I'm ready to work on my walking goal", data: { action: "start_walking" } },
          { label: "Check Progress", value: "I want to check my current progress", data: { action: "check_progress" } },
          { label: "Need Motivation", value: "I need some motivation to get moving", data: { action: "need_motivation" } }
        ]
      };
    
    case 'daily_checkin':
      return {
        content: `Good to see you today! Let's do your daily check-in. How are you feeling overall?`,
        quickActions: [
          { label: "Great! 😊", value: "I'm feeling great today!", data: { mood: "great" } },
          { label: "Good 🙂", value: "I'm feeling good", data: { mood: "good" } },
          { label: "Okay 😐", value: "I'm feeling okay", data: { mood: "okay" } },
          { label: "Not Good 😔", value: "I'm not feeling well", data: { mood: "not_good" } },
          { label: "Struggling 😣", value: "I'm struggling today", data: { mood: "struggling" } }
        ]
      };
    
    case 'medication_reminder':
      return {
        content: `Time for your medication! Have you taken your prescribed pain medication as directed?`,
        quickActions: [
          { label: "Yes, Taken", value: "Yes, I've taken my medication", data: { medication_taken: true } },
          { label: "Not Yet", value: "Not yet, I'll take it now", data: { medication_taken: false } },
          { label: "Skipped", value: "I skipped this dose", data: { medication_taken: false, reason: "skipped" } },
          { label: "Questions", value: "I have questions about my medication", data: { action: "questions" } }
        ]
      };
    
    default:
      return {
        content: `I have a task for you. Are you ready to get started?`,
        quickActions: [
          { label: "Ready", value: "I'm ready to start", data: { action: "start" } },
          { label: "Not Now", value: "Can we do this later?", data: { action: "postpone" } },
          { label: "Need Help", value: "I need help with this", data: { action: "help" } }
        ]
      };
  }
}

// GET endpoint to retrieve available tasks for a patient
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const tenantId = searchParams.get('tenantId');
    const patientId = searchParams.get('patientId');

    if (!conversationId || !tenantId || !patientId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get user to ensure they're authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get available tasks for the patient
    const { data: tasks, error } = await supabase
      .from("patient_tasks")
      .select(`
        *,
        task_templates (
          id,
          title,
          description,
          task_type,
          metadata
        )
      `)
      .eq("patient_id", patientId)
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .eq("scheduled_for", new Date().toISOString().split('T')[0]) // Today's tasks
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      tasks: tasks || []
    });
  } catch (error) {
    console.error("Get tasks API error:", error);
    return NextResponse.json(
      { error: "Failed to get tasks" },
      { status: 500 }
    );
  }
}