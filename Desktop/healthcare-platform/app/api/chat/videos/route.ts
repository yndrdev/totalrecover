import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { conversationId, tenantId, videoType, videoData } = await request.json();
    console.log("Video delivery API called:", { conversationId, tenantId, videoType });
    
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

    // Generate video-specific AI message
    const videoMessage = generateVideoMessage(videoType, videoData);

    // Save video message to database
    const { data: messageData, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender_type: "ai",
      sender_id: null,
      content: videoMessage.content,
      metadata: {
        message_type: "video_delivery",
        video_type: videoType,
        video_data: videoData,
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
      video_type: videoType
    });
  } catch (error) {
    console.error("Video delivery API error:", error);
    return NextResponse.json(
      { error: "Failed to deliver video" },
      { status: 500 }
    );
  }
}

function generateVideoMessage(videoType: string, videoData: any) {
  switch (videoType) {
    case 'exercise':
      return {
        content: `Here's your exercise video for today: "${videoData.title}". Watch the demonstration and then try the exercise yourself.`,
        video: {
          id: videoData.id || `exercise_${Date.now()}`,
          title: videoData.title || "Exercise Video",
          description: videoData.description || "Follow along with this exercise demonstration",
          url: videoData.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          duration: videoData.duration || 300,
          thumbnail: videoData.thumbnail,
          type: 'exercise' as const
        }
      };
    
    case 'education':
      return {
        content: `I have an educational video for you: "${videoData.title}". This will help you understand more about your recovery process.`,
        video: {
          id: videoData.id || `education_${Date.now()}`,
          title: videoData.title || "Educational Video",
          description: videoData.description || "Learn more about your recovery",
          url: videoData.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          duration: videoData.duration || 600,
          thumbnail: videoData.thumbnail,
          type: 'education' as const
        }
      };
    
    case 'demonstration':
      return {
        content: `Let me show you how to do this: "${videoData.title}". Pay attention to the technique demonstrated in this video.`,
        video: {
          id: videoData.id || `demo_${Date.now()}`,
          title: videoData.title || "Demonstration Video",
          description: videoData.description || "Step-by-step demonstration",
          url: videoData.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: videoData.duration || 240,
          thumbnail: videoData.thumbnail,
          type: 'demonstration' as const
        }
      };
    
    case 'progress_check':
      return {
        content: `Time to check your progress! Watch this video and let me know how you're doing with these movements.`,
        video: {
          id: videoData.id || `progress_${Date.now()}`,
          title: videoData.title || "Progress Check",
          description: videoData.description || "Assess your current abilities",
          url: videoData.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          duration: videoData.duration || 180,
          thumbnail: videoData.thumbnail,
          type: 'demonstration' as const
        }
      };
    
    default:
      return {
        content: `I have a video to share with you: "${videoData.title || 'Recovery Video'}". This will help with your recovery journey.`,
        video: {
          id: videoData.id || `video_${Date.now()}`,
          title: videoData.title || "Recovery Video",
          description: videoData.description || "Helpful video for your recovery",
          url: videoData.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          duration: videoData.duration || 300,
          thumbnail: videoData.thumbnail,
          type: 'education' as const
        }
      };
  }
}

// POST endpoint to track video completion
export async function PUT(request: Request) {
  try {
    const { conversationId, tenantId, videoId, watchTime, completed } = await request.json();
    console.log("Video completion tracking:", { conversationId, tenantId, videoId, watchTime, completed });
    
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

    // Save video completion data
    const { error } = await supabase.from("video_completions").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      patient_id: user.id,
      video_id: videoId,
      watch_time: watchTime,
      completed: completed,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Error saving video completion:", error);
      // Don't fail the request if we can't save completion data
    }

    // Generate encouraging AI response for video completion
    if (completed) {
      const encouragementMessage = generateVideoCompletionMessage(videoId, watchTime);
      
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        tenant_id: tenantId,
        sender_type: "ai",
        sender_id: null,
        content: encouragementMessage,
        metadata: {
          message_type: "video_completion_response",
          video_id: videoId,
          watch_time: watchTime
        },
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Video completion tracked"
    });
  } catch (error) {
    console.error("Video completion tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track video completion" },
      { status: 500 }
    );
  }
}

function generateVideoCompletionMessage(videoId: string, watchTime: number): string {
  const encouragements = [
    "Great job watching the entire video! You're doing an excellent job staying engaged with your recovery.",
    "Fantastic! You completed the video. This shows your dedication to your recovery process.",
    "Well done! Watching these videos is an important part of your recovery journey.",
    "Excellent work! You're staying on track with your recovery education.",
    "Amazing commitment! Completing these videos shows you're taking your recovery seriously."
  ];

  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  
  const minutes = Math.floor(watchTime / 60);
  const seconds = Math.floor(watchTime % 60);
  const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  
  return `${randomEncouragement} You watched for ${timeString}. How are you feeling about what you learned?`;
}