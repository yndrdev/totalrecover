"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Message } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { TaskCard } from "@/components/chat/task-card";
import { ConversationalForm } from "@/components/chat/conversational-form";
import { VideoMessage } from "@/components/chat/video-message";
import { Send, Mic, LogOut, Activity, Dumbbell, FileText, Video } from "lucide-react";

interface PatientChatInterfaceProps {
  user: User;
  patient: any;
  conversation: any;
  tenantId: string;
}

interface QuickAction {
  label: string;
  value: string;
  emoji?: string;
}

export function PatientChatInterface({
  user,
  patient,
  conversation,
  tenantId,
}: PatientChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const realtimeChannelRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract patient name for display
  const userMetadata = user.user_metadata || {};
  const firstName = userMetadata.first_name || 
                   userMetadata.full_name?.split(' ')[0] || 
                   user.email?.split('@')[0].split('.')[0] || 
                   "Patient";

  const surgeryType = patient.surgery_type === 'TKA' ? 'TKA' :
                     patient.surgery_type === 'THA' ? 'THA' :
                     patient.surgery_type === 'TSA' ? 'TSA' : 'Surgery';

  const daysPostOp = patient.surgery_date ?
    Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const generateWelcomeMessage = async () => {
    try {
      setIsTyping(true);
      
      const response = await fetch('/api/chat/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          patientId: patient.id,
          tenantId: tenantId,
          context: {
            firstName: firstName,
            surgeryType: surgeryType,
            daysPostOp: daysPostOp,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (!result.skip) {
          console.log("Welcome message generated:", result.message);
          // Set appropriate quick actions after welcome message
          setQuickActions([
            { label: "Great!", value: "I'm feeling great today!", emoji: "😊" },
            { label: "Okay", value: "I'm feeling okay", emoji: "😐" },
            { label: "Not Good", value: "I'm not feeling well", emoji: "😔" },
            { label: "In Pain", value: "I'm experiencing pain", emoji: "😣" },
          ]);
        }
      } else {
        console.error("Failed to generate welcome message");
      }
    } catch (error) {
      console.error("Error generating welcome message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
    } else {
      setMessages(data || []);
      
      // If no messages exist, generate AI-first welcome message
      if (!data || data.length === 0) {
        await generateWelcomeMessage();
      } else {
        // Set appropriate quick actions based on latest message
        const latestMessage = data[data.length - 1];
        if (latestMessage.sender_type === "ai") {
          setQuickActions([
            { label: "Great!", value: "I'm feeling great today!", emoji: "😊" },
            { label: "Okay", value: "I'm feeling okay", emoji: "😐" },
            { label: "Not Good", value: "I'm not feeling well", emoji: "😔" },
            { label: "In Pain", value: "I'm experiencing pain", emoji: "😣" },
          ]);
        }
      }
    }
  }, [conversation.id, tenantId, supabase]);

  const setupRealtimeSubscription = useCallback(() => {
    // Remove existing subscription if any
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    // Create new realtime channel for this conversation
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          const newMessage = payload.new as Message;
          
          // Only add if it's for our tenant (security check)
          if (newMessage.tenant_id === tenantId) {
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (!exists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    realtimeChannelRef.current = channel;
  }, [conversation.id, tenantId, supabase]);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
    
    // Cleanup on unmount
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [conversation.id, loadMessages, setupRealtimeSubscription, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setQuickActions([]);

    try {
      // Add user message to database (realtime will handle UI update)
      const { error: userMessageError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        tenant_id: tenantId,
        sender_type: "patient",
        sender_id: user.id,
        content: messageText,
        metadata: {},
        created_at: new Date().toISOString()
      });

      if (userMessageError) {
        console.error("Error sending message:", userMessageError);
        return;
      }

      // Set typing indicator for AI response
      setIsTyping(true);

      // Generate AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationId: conversation.id,
          patientId: patient.id,
          tenantId: tenantId,
          context: {
            firstName: firstName,
            surgeryType: surgeryType,
            daysPostOp: daysPostOp,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // AI response is already saved by the API endpoint
        // Realtime will handle adding it to the UI
        console.log("AI response generated:", result.response);
      } else {
        console.error("Failed to generate AI response");
      }

    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.value);
    setQuickActions([]);
    
    // Auto-submit the quick action
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const handleVoiceToggle = async () => {
    if (isVoiceRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await handleAudioTranscription(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsVoiceRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsVoiceRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      console.log('No audio data recorded');
      return;
    }

    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const transcription = result.transcription?.trim();
        
        if (transcription) {
          setInputValue(transcription);
          console.log('Transcription successful:', transcription);
        } else {
          console.log('No speech detected in recording');
        }
      } else {
        const error = await response.json();
        console.error('Transcription failed:', error);
        alert('Transcription failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      alert('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
      setRecordingTime(0);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleTaskStart = async (taskId: string) => {
    console.log("Starting task:", taskId);
    // Update task status to in_progress
    // This would connect to your task management system
  };

  const handleTaskComplete = async (taskId: string, taskData?: any) => {
    console.log("Completing task:", taskId, taskData);
    
    // Send completion message to chat
    const completionMessage = `I've completed the task! ${taskData ? JSON.stringify(taskData) : ''}`;
    
    // Add user message about task completion
    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      tenant_id: tenantId,
      sender_type: "patient",
      sender_id: user.id,
      content: completionMessage,
      metadata: { 
        task_completion: true,
        task_id: taskId,
        task_data: taskData 
      },
      created_at: new Date().toISOString()
    });

    if (userMessageError) {
      console.error("Error sending task completion message:", userMessageError);
      return;
    }

    // Generate AI response for task completion
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: completionMessage,
          conversationId: conversation.id,
          patientId: patient.id,
          tenantId: tenantId,
          context: {
            firstName: firstName,
            surgeryType: surgeryType,
            daysPostOp: daysPostOp,
            taskCompleted: true,
            taskId: taskId,
            taskData: taskData
          },
        }),
      });

      if (response.ok) {
        console.log("Task completion response generated");
      }
    } catch (error) {
      console.error("Error generating task completion response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const deliverTask = async (taskType: string, taskData?: any) => {
    try {
      const response = await fetch('/api/chat/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          tenantId: tenantId,
          taskType: taskType,
          taskData: taskData
        }),
      });

      if (response.ok) {
        console.log("Task delivered successfully");
      }
    } catch (error) {
      console.error("Error delivering task:", error);
    }
  };

  const deliverForm = async (formType: string, formData?: any) => {
    try {
      const response = await fetch('/api/chat/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          tenantId: tenantId,
          formType: formType,
          formData: formData
        }),
      });

      if (response.ok) {
        console.log("Form delivered successfully");
      }
    } catch (error) {
      console.error("Error delivering form:", error);
    }
  };

  const handleFormComplete = async (formId: string, formData: Record<string, any>) => {
    console.log("Form completed:", formId, formData);
    
    // Send completion message to chat
    const completionMessage = `I've completed the ${formId} form. Thank you for helping me track my progress!`;
    
    // Add user message about form completion
    const { error: userMessageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      tenant_id: tenantId,
      sender_type: "patient",
      sender_id: user.id,
      content: completionMessage,
      metadata: { 
        form_completion: true,
        form_id: formId,
        form_data: formData 
      },
      created_at: new Date().toISOString()
    });

    if (userMessageError) {
      console.error("Error sending form completion message:", userMessageError);
      return;
    }

    // Generate AI response for form completion
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: completionMessage,
          conversationId: conversation.id,
          patientId: patient.id,
          tenantId: tenantId,
          context: {
            firstName: firstName,
            surgeryType: surgeryType,
            daysPostOp: daysPostOp,
            formCompleted: true,
            formId: formId,
            formData: formData
          },
        }),
      });

      if (response.ok) {
        console.log("Form completion response generated");
      }
    } catch (error) {
      console.error("Error generating form completion response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const deliverVideo = async (videoType: string, videoData?: any) => {
    try {
      const response = await fetch('/api/chat/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          tenantId: tenantId,
          videoType: videoType,
          videoData: videoData
        }),
      });

      if (response.ok) {
        console.log("Video delivered successfully");
      }
    } catch (error) {
      console.error("Error delivering video:", error);
    }
  };

  const handleVideoStart = async (videoId: string) => {
    console.log("Video started:", videoId);
    // Track video start analytics
  };

  const handleVideoComplete = async (videoId: string, watchTime: number) => {
    console.log("Video completed:", videoId, "Watch time:", watchTime);
    
    try {
      const response = await fetch('/api/chat/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          tenantId: tenantId,
          videoId: videoId,
          watchTime: watchTime,
          completed: true
        }),
      });

      if (response.ok) {
        console.log("Video completion tracked");
      }
    } catch (error) {
      console.error("Error tracking video completion:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header - Clean with profile in top right */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full">
                  <p className="text-sm font-semibold">Day {daysPostOp} Recovery</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{surgeryType} Recovery Assistant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <ChatBubble
                sender={message.sender_type === "patient" ? "patient" : "ai"}
                message={message.content}
                timestamp={new Date(message.created_at)}
                showAvatar={true}
              />
              
              {/* Render task card if this is a task delivery message */}
              {message.metadata?.message_type === "task_delivery" && (
                <div className="flex justify-start">
                  <TaskCard
                    task={{
                      id: message.metadata.task_data?.id || message.id,
                      type: message.metadata.task_type,
                      title: message.metadata.task_data?.title || "Task",
                      description: message.metadata.task_data?.description,
                      status: message.metadata.task_data?.status || "pending",
                      metadata: message.metadata.task_data?.metadata || {}
                    }}
                    onStart={handleTaskStart}
                    onComplete={handleTaskComplete}
                    showProgress={true}
                    allowVoiceCompletion={true}
                  />
                </div>
              )}
              
              {/* Render conversational form if this is a form delivery message */}
              {message.metadata?.message_type === "form_delivery" && message.metadata?.form_data?.form && (
                <div className="flex justify-start">
                  <ConversationalForm
                    form={message.metadata?.form_data?.form}
                    onFormComplete={(formData) => handleFormComplete(message.metadata?.form_data?.form?.id, formData)}
                    allowVoiceInput={true}
                    showProgress={true}
                    autoSave={true}
                    validationMode="conversational"
                  />
                </div>
              )}
              
              {/* Render video message if this is a video delivery message */}
              {message.metadata?.message_type === "video_delivery" && message.metadata?.video_data?.video && (
                <div className="flex justify-start">
                  <VideoMessage
                    video={message.metadata.video_data.video}
                    onVideoStart={handleVideoStart}
                    onVideoComplete={handleVideoComplete}
                    autoPlay={false}
                    showControls={true}
                    allowFullscreen={true}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <ChatBubble
              sender="ai"
              message=""
              isTyping={true}
              showAvatar={true}
            />
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && !isTyping && (
            <div className="flex justify-start">
              <div className="flex flex-wrap gap-2 max-w-xs lg:max-w-md">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="bg-white hover:bg-blue-50 border-2 border-blue-200 text-gray-800 text-sm h-auto py-3 px-4 rounded-lg hover:border-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {action.emoji && <span className="mr-1">{action.emoji}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-6 space-y-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Recording Status */}
          {(isVoiceRecording || isTranscribing) && (
            <div className="mb-3 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                {isVoiceRecording ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-800 font-medium">Recording {formatRecordingTime(recordingTime)}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-800 font-medium">Transcribing...</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="pr-12 h-12 text-base rounded-lg border border-gray-300 bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors placeholder:text-gray-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoiceToggle}
                disabled={isTranscribing}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full focus:ring-2 focus:ring-offset-2 transition-colors ${
                  isVoiceRecording 
                    ? "bg-red-100 text-red-600 animate-pulse focus:ring-red-500" 
                    : isTranscribing 
                    ? "bg-blue-100 text-blue-600 focus:ring-blue-500" 
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
                }`}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          
          {/* Progress and Exercises buttons */}
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deliverTask("pain_assessment", {
                title: "Pain Assessment",
                description: "Rate your current pain level"
              })}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Activity className="w-3 h-3 mr-1" />
              Pain
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deliverTask("exercise", {
                title: "Knee Flexion Exercise",
                description: "10 repetitions, 3 sets",
                video_url: "https://example.com/knee-flexion.mp4",
                reps: 10,
                sets: 3,
                duration: 5
              })}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Dumbbell className="w-3 h-3 mr-1" />
              Exercise
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deliverTask("walking_goal", {
                title: "Walking Goal",
                description: "Daily step target",
                target_steps: 2000,
                current_steps: 847
              })}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🚶 Walk
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deliverForm("pain_assessment")}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FileText className="w-3 h-3 mr-1" />
              Form
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deliverVideo("exercise", {
                title: "Knee Flexion Exercise",
                description: "Follow along with this exercise demonstration",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                duration: 60
              })}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Video className="w-3 h-3 mr-1" />
              Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}