"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { TaskCard } from "@/components/ui/task-card";
import { VoiceRecorder } from "@/components/ui/voice-recorder";
import { PainScale } from "@/components/ui/pain-scale";
import { Send, Mic, Sparkles, Heart, ChevronDown, Paperclip, Image as ImageIcon, User } from "lucide-react";

interface PatientChatProps {
  userId: string;
  conversationId: string;
  tenantId: string;
  patientId: string;
}

interface QuickAction {
  label: string;
  value: string;
  emoji?: string;
  type?: 'text' | 'pain_scale' | 'task';
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'pain_assessment' | 'exercise' | 'education' | 'walking' | 'medication' | 'form';
  status: 'pending' | 'completed' | 'in_progress';
  progress?: number;
  dueTime?: string;
}

export function PatientChat({ userId, conversationId, tenantId, patientId }: PatientChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showPainScale, setShowPainScale] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [showTasksInChat, setShowTasksInChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load initial messages and real tasks
  useEffect(() => {
    loadMessages();
    loadTasks();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((current) => [...current, newMessage]);
          setIsTyping(false);
          
          // Update quick actions based on AI message
          if (newMessage.sender_type === "ai") {
            updateQuickActions(newMessage.content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Load real tasks from database
  const loadTasks = async () => {
    try {
      // Get assigned exercises for the patient with tenant isolation
      const { data: exercises, error: exerciseError } = await supabase
        .from("patient_exercises")
        .select(`
          id,
          exercise_id,
          custom_repetitions,
          custom_sets,
          custom_duration_seconds,
          exercises (
            name,
            description,
            default_repetitions,
            default_sets,
            category
          )
        `)
        .eq("patient_id", patientId)
        .eq("tenant_id", tenantId)
        .eq("is_active", true);

      // Get daily check-in questions with tenant isolation
      const { data: questions, error: questionError } = await supabase
        .from("daily_checkin_questions")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("display_order");

      const tasks: Task[] = [];

      // Add exercise tasks
      if (exercises && !exerciseError) {
        exercises.forEach((patientExercise) => {
          const exercise = patientExercise.exercises;
          if (exercise) {
            const reps = patientExercise.custom_repetitions || (exercise as any).default_repetitions || 10;
            const sets = patientExercise.custom_sets || (exercise as any).default_sets || 3;
            
            tasks.push({
              id: patientExercise.id,
              title: (exercise as any).name,
              description: `${reps} repetitions, ${sets} sets`,
              type: 'exercise',
              status: 'pending'
            });
          }
        });
      }

      // Add daily questions as tasks
      if (questions && !questionError) {
        questions.forEach((question) => {
          if (question.category === 'pain') {
            tasks.push({
              id: `question_${question.id}`,
              title: 'Daily Pain Assessment',
              description: question.question_text,
              type: 'pain_assessment',
              status: 'pending'
            });
          } else {
            tasks.push({
              id: `question_${question.id}`,
              title: question.question_text,
              description: `${question.category} check-in`,
              type: 'form',
              status: 'pending'
            });
          }
        });
      }

      // If no tasks found, add a default welcome task
      if (tasks.length === 0) {
        tasks.push({
          id: 'welcome',
          title: 'Welcome to TJV Recovery',
          description: 'Get started with your recovery journey',
          type: 'education',
          status: 'pending'
        });
      }

      setCurrentTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to welcome task if database fails
      setCurrentTasks([{
        id: 'welcome',
        title: 'Welcome to TJV Recovery',
        description: 'Get started with your recovery journey',
        type: 'education',
        status: 'pending'
      }]);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      // Set quick actions based on last AI message
      const lastAiMessage = data.filter(m => m.sender_type === "ai").pop();
      if (lastAiMessage) {
        updateQuickActions(lastAiMessage.content);
      }
    }
  };

  const updateQuickActions = (aiMessage: string) => {
    const message = aiMessage.toLowerCase();
    
    // Healthcare-focused quick actions based on AI message content
    if (message.includes("pain") && (message.includes("scale") || message.includes("0-10") || message.includes("rate"))) {
      setQuickActions([
        { label: "Use Pain Scale", value: "pain_scale", emoji: "📊", type: "pain_scale" },
        { label: "No pain today", value: "I have no pain today", emoji: "😊" },
        { label: "Some discomfort", value: "I have some discomfort", emoji: "😐" },
        { label: "Need help", value: "I need help with pain management", emoji: "🤝" },
      ]);
    } else if (message.includes("how") && (message.includes("feeling") || message.includes("doing"))) {
      setQuickActions([
        { label: "Excellent!", value: "I'm feeling excellent today!", emoji: "🌟" },
        { label: "Good progress", value: "I'm doing well, making good progress", emoji: "👍" },
        { label: "Some challenges", value: "I'm having some challenges today", emoji: "😬" },
        { label: "Need assistance", value: "I could use some assistance", emoji: "🤝" },
      ]);
    } else if (message.includes("exercise") || message.includes("therapy") || message.includes("movement")) {
      setQuickActions([
        { label: "Show tasks", value: "tasks", emoji: "💪", type: "task" },
        { label: "Completed exercises", value: "I completed my exercises", emoji: "✅" },
        { label: "Exercise questions", value: "I have questions about my exercises", emoji: "❓" },
        { label: "Difficulty with exercise", value: "I'm having difficulty with an exercise", emoji: "⚠️" },
      ]);
    } else if (message.includes("task") || message.includes("today") || message.includes("should")) {
      setQuickActions([
        { label: "Show today's tasks", value: "tasks", emoji: "📋", type: "task" },
        { label: "Check my progress", value: "How is my recovery progress?", emoji: "📈" },
        { label: "Report pain", value: "pain_scale", emoji: "📊", type: "pain_scale" },
        { label: "Ask question", value: "I have a question about my recovery", emoji: "💬" },
      ]);
    } else {
      // Default healthcare quick actions
      setQuickActions([
        { label: "Today's tasks", value: "tasks", emoji: "📋", type: "task" },
        { label: "Report pain", value: "pain_scale", emoji: "📊", type: "pain_scale" },
        { label: "My progress", value: "Show me my recovery progress", emoji: "📈" },
        { label: "I have a question", value: "I have a question", emoji: "💬" },
      ]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setInputValue("");
    setQuickActions([]); // Clear quick actions after sending

    // Add patient message with tenant isolation
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender_type: "patient",
      sender_id: userId,
      content: content.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    });

    if (!messageError) {
      // Simulate AI typing
      setIsTyping(true);
      
      // Call AI endpoint to get response
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            message: content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        setIsTyping(false);
      }
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.type === 'pain_scale') {
      setShowPainScale(true);
      setQuickActions([]); // Clear quick actions
    } else if (action.type === 'task') {
      setShowTasksInChat(true);
      setQuickActions([]); // Clear quick actions
    } else {
      sendMessage(action.value);
    }
  };

  const handlePainScaleSubmit = (painLevel: number) => {
    setShowPainScale(false);
    sendMessage(`My pain level is ${painLevel} out of 10`);
  };

  const handleTaskComplete = (taskId: string) => {
    setCurrentTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      )
    );
    sendMessage(`I completed the task: ${currentTasks.find(t => t.id === taskId)?.title}`);
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setShowVoiceRecorder(false);
    // TODO: Implement voice transcription with OpenAI Whisper
    // For now, just show a placeholder message
    sendMessage("(Voice message - transcription would be implemented here)");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Healthcare Header - Matching Dashboard */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TJV Recovery Platform</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none bg-white border border-input rounded-lg px-4 py-2 text-sm text-foreground font-medium min-w-[140px] cursor-pointer hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all">
                  <option>Patient Name</option>
                  <option>John Smith</option>
                  <option>Switch Account</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Welcome Screen - Matching Target Screenshot */}
        {messages.length === 0 && !showTasksInChat && !showPainScale && !showVoiceRecorder && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-16">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Welcome Title */}
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-foreground">Welcome Patient</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get Started By Script A Task And Chat Can Do The Rest.<br />
                  Not Sure Where To Start?
                </p>
              </div>

              {/* Large Input Area - Matching Screenshot */}
              <div className="w-full max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <Input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Write your message ..."
                      disabled={isLoading}
                      className="w-full h-16 px-6 text-lg border-2 border-input rounded-2xl bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200 pr-32"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowVoiceRecorder(true)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors touch-target"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVoiceRecorder(true)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors touch-target"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <Button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        size="icon"
                        className="h-10 w-10 bg-primary hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Action Buttons - Matching Screenshot */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowTasksInChat(true)}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 h-12 rounded-xl border-input text-foreground hover:bg-accent hover:border-primary transition-all"
                >
                  View Today&apos;s Exercises
                </Button>
                <Button
                  onClick={() => sendMessage("How is my recovery progress?")}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 h-12 rounded-xl border-input text-foreground hover:bg-accent hover:border-primary transition-all"
                >
                  Check My Progress
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Chat Interface */}
        {(messages.length > 0 || showTasksInChat || showPainScale || showVoiceRecorder) && (
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Today's Tasks Section - Show if enabled */}
              {showTasksInChat && currentTasks.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Today&apos;s Recovery Tasks</h3>
                    <p className="text-sm text-muted-foreground">Complete your daily tasks to support your recovery</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {currentTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        title={task.title}
                        description={task.description}
                        type={task.type}
                        status={task.status}
                        progress={task.progress}
                        dueTime={task.dueTime}
                        isCompleted={task.status === 'completed'}
                        onComplete={() => handleTaskComplete(task.id)}
                        onStart={() => console.log(`Starting task: ${task.title}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    sender={message.sender_type === "ai" ? "ai" : "patient"}
                    message={message.content}
                    timestamp={new Date(message.created_at)}
                    showAvatar={true}
                  />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <ChatBubble
                    sender="ai"
                    message=""
                    isTyping={true}
                    showAvatar={true}
                  />
                )}

                {/* Quick Actions after latest AI message */}
                {messages.length > 0 && quickActions.length > 0 && !isTyping && (
                  <div className="flex justify-start">
                    <div className="flex flex-wrap gap-2 max-w-[80%] ml-11">
                      {quickActions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          onClick={() => handleQuickAction(action)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                          className="touch-target bg-background hover:bg-accent hover:border-primary transition-all"
                        >
                          {action.emoji && <span className="mr-2 text-base">{action.emoji}</span>}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pain Scale Modal Content */}
                {showPainScale && (
                  <div className="healthcare-card max-w-2xl mx-auto">
                    <PainScale
                      onChange={handlePainScaleSubmit}
                      showLabels={true}
                      size="large"
                    />
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setShowPainScale(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Voice Recorder Modal Content */}
                {showVoiceRecorder && (
                  <div className="healthcare-card max-w-md mx-auto">
                    <VoiceRecorder
                      onRecordingComplete={handleVoiceRecordingComplete}
                      onError={(error) => console.error("Voice recording error:", error)}
                      maxDuration={60}
                    />
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setShowVoiceRecorder(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area - Only show when there are messages */}
      {(messages.length > 0 || showTasksInChat || showPainScale || showVoiceRecorder) && (
        <div className="border-t border-border px-6 py-4 bg-background">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || showPainScale || showVoiceRecorder}
                    className="w-full h-12 px-4 pr-20 border border-input rounded-xl bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all duration-200"
                  />
                  
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowVoiceRecorder(true)}
                      disabled={isLoading || showPainScale || showVoiceRecorder}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors touch-target"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim() || showPainScale || showVoiceRecorder}
                      size="icon"
                      className="h-8 w-8 bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}