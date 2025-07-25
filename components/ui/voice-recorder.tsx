"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, Play, Pause } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
  disabled?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onTranscription,
  onError,
  maxDuration = 60,
  className,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // Check microphone permission on mount
  React.useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      onError?.("Microphone permission denied");
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await checkMicrophonePermission();
      if (!hasPermission) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Set up audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        onRecordingComplete?.(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      onError?.("Failed to start recording");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      if (isRecording) {
        requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className={cn("text-center p-4 border border-destructive/20 rounded-lg bg-destructive/5", className)}>
        <MicOff className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive mb-3">Microphone access is required for voice input</p>
        <Button onClick={checkMicrophonePermission} size="sm" variant="outline">
          Grant Permission
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4", className)}>
      {/* Recording Indicator */}
      {isRecording && (
        <div className="text-center">
          <div className={cn(
            "w-20 h-20 rounded-full border-4 border-destructive flex items-center justify-center mb-3 transition-all duration-150",
            "relative overflow-hidden",
            isPaused ? "animate-pulse" : ""
          )}>
            {/* Audio level visualization */}
            <div 
              className="absolute inset-0 bg-destructive/20 transition-all duration-75"
              style={{ 
                transform: `scale(${0.3 + audioLevel * 0.7})`,
                borderRadius: '50%'
              }}
            />
            <Mic className="w-8 h-8 text-destructive relative z-10" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isPaused ? "Paused" : "Recording..."}
          </div>
          <div className="text-lg font-mono font-semibold text-foreground">
            {formatTime(recordingTime)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Max: {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={disabled || hasPermission === null}
            size="lg"
            className="touch-target rounded-full"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              onClick={pauseRecording}
              variant="outline"
              size="lg"
              className="touch-target rounded-full"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              )}
            </Button>
            
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="touch-target rounded-full"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Tips */}
      {!isRecording && hasPermission && (
        <div className="text-center max-w-sm">
          <p className="text-sm text-muted-foreground">
            💡 Speak clearly and at a normal pace for best results
          </p>
        </div>
      )}
    </div>
  );
}