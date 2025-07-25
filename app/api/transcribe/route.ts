import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get user to ensure they're authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ 
        error: "Invalid audio format. Supported formats: webm, mp4, mpeg, wav, ogg" 
      }, { status: 400 });
    }

    // Validate file size (max 25MB as per OpenAI limits)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ 
        error: "Audio file too large. Maximum size is 25MB" 
      }, { status: 400 });
    }

    console.log("Transcribing audio file:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
    });

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Can be made configurable
      response_format: "json",
      prompt: "This is a healthcare conversation between a patient and their recovery assistant. Please transcribe accurately, including medical terminology.", // Context for better accuracy
    });

    console.log("Transcription completed:", transcription.text);

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
    });

  } catch (error) {
    console.error("Transcription error:", error);
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("audio")) {
        return NextResponse.json(
          { error: "Audio processing failed. Please try again." },
          { status: 400 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: "Transcription failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}