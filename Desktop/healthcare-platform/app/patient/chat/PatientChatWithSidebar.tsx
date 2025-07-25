"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Check, 
  AlertTriangle, 
  Circle, 
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  Dumbbell,
  FileText,
  Bot,
  Play,
  Mic,
  Paperclip,
  Heart,
  Calendar,
  Activity,
  Stethoscope,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai" | "provider";
  timestamp: Date;
  type?: "text" | "video" | "form" | "exercise" | "assessment";
  richContent?: {
    videoUrl?: string;
    videoTitle?: string;
    videoDuration?: string;
    formData?: any;
    exerciseTitle?: string;
    exerciseInstructions?: string;
  };
  provider?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

interface DayTask {
  id: string;
  title: string;
  type: "exercise" | "form" | "message" | "video";
  completed: boolean;
  required: boolean;
}

interface DayStatus {
  day: number;
  date: Date;
  status: "completed" | "missed" | "pending" | "future";
  tasks: DayTask[];
  hasConversation: boolean;
}

export default function PatientChatWithSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(2); // Current day
  const [currentDay, setCurrentDay] = useState<number>(2); // Patient is on Day 2 post-op
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [patientInfo, setPatientInfo] = useState({
    name: "Sarah Johnson",
    avatar: "/avatars/patient-sarah.jpg",
    surgeryType: "Total Knee Replacement",
    surgeryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isPreOp: false
  });
  const [careTeam, setCareTeam] = useState([
    { id: 1, name: "Dr. Michael Smith", role: "Surgeon", avatar: "/avatars/dr-smith.jpg", available: true },
    { id: 2, name: "Nancy Johnson", role: "Nurse", avatar: "/avatars/nurse-johnson.jpg", available: true },
    { id: 3, name: "Mike Chen", role: "Physical Therapist", avatar: "/avatars/pt-chen.jpg", available: false }
  ]);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const supabase = createClient();

  // Determine if this is pre-op or post-op based on current day
  const isPreOp = currentDay < 0;
  const assistantName = isPreOp ? "Pre-Op Assistant" : "Recovery Assistant";
  const assistantRole = isPreOp ? "Pre-Surgery Guide" : "Post-Surgery Recovery Coach";

  // Healthcare-specific suggested prompts
  const suggestedPrompts = isPreOp ? [
    "What should I expect during surgery?",
    "How should I prepare the night before?",
    "What medications should I stop taking?",
    "I'm feeling nervous about tomorrow",
    "Can I eat anything before surgery?",
    "What should I bring to the hospital?"
  ] : [
    "How is my pain today?",
    "Show me today's exercises",
    "When is my next appointment?",
    "I have a question about medication",
    "I completed my physical therapy",
    "How is my recovery progressing?"
  ];

  // Initialize timeline and load data
  useEffect(() => {
    initializeTimeline();
    loadConversationHistory(selectedDay);
    
    // Add welcome message if it's the current day and no messages
    if (selectedDay === currentDay && messages.length === 0) {
      const welcomeMessages: Message[] = [
        {
          id: "welcome-1",
          content: `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'} ${patientInfo.name.split(' ')[0]}! I'm your ${assistantName}, here to support you through your ${isPreOp ? 'surgery preparation' : 'recovery journey'}.`,
          sender: "ai",
          timestamp: new Date(),
          provider: {
            name: assistantName,
            role: assistantRole
          }
        }
      ];

      if (!isPreOp) {
        welcomeMessages.push({
          id: "welcome-2",
          content: `You're currently on Day ${currentDay} of your recovery. How are you feeling today? I'm here to help with any questions about your exercises, pain management, or recovery progress.`,
          sender: "ai",
          timestamp: new Date(Date.now() + 1000),
          provider: {
            name: assistantName,
            role: assistantRole
          }
        });

        // Add a sample video content
        welcomeMessages.push({
          id: "welcome-3",
          content: `Here's an important exercise video for Day ${currentDay} of your recovery:`,
          sender: "ai",
          timestamp: new Date(Date.now() + 2000),
          type: "video",
          richContent: {
            videoUrl: "https://www.youtube.com/embed/4BOTvaRaDjI",
            videoTitle: "Post-Surgery Knee Bending Exercises",
            videoDuration: "3:45"
          },
          provider: {
            name: assistantName,
            role: assistantRole
          }
        });

        // Add a sample form
        welcomeMessages.push({
          id: "welcome-4",
          content: `Please complete your daily pain and mobility assessment:`,
          sender: "ai",
          timestamp: new Date(Date.now() + 3000),
          type: "form",
          richContent: {
            formData: {
              title: "Daily Recovery Assessment",
              fields: ["Pain Level (0-10)", "Mobility Rating", "Sleep Quality"]
            }
          },
          provider: {
            name: assistantName,
            role: assistantRole
          }
        });
      } else {
        welcomeMessages.push({
          id: "welcome-2",
          content: `Your surgery is scheduled for ${Math.abs(currentDay)} days from now. I'll help you prepare with pre-surgery instructions, what to expect, and answer any questions you may have.`,
          sender: "ai",
          timestamp: new Date(Date.now() + 1000),
          provider: {
            name: assistantName,
            role: assistantRole
          }
        });
      }

      setMessages(welcomeMessages);
    }
  }, [selectedDay, currentDay]);

  // Initialize timeline with sample data
  const initializeTimeline = () => {
    const timeline: DayStatus[] = [];
    
    // Pre-op days (-45 to -1)
    for (let day = -45; day <= -1; day++) {
      const dayDate = new Date(patientInfo.surgeryDate);
      dayDate.setDate(dayDate.getDate() + day);
      
      timeline.push({
        day,
        date: dayDate,
        status: day < currentDay ? "completed" : day === currentDay ? "pending" : "future",
        tasks: generateTasksForDay(day),
        hasConversation: day >= -7 && day <= currentDay
      });
    }
    
    // Surgery day and post-op
    for (let day = 0; day <= 200; day++) {
      const dayDate = new Date(patientInfo.surgeryDate);
      dayDate.setDate(dayDate.getDate() + day);
      
      let status: "completed" | "missed" | "pending" | "future" = "future";
      if (day < currentDay) {
        // Check if any tasks were missed
        const tasks = generateTasksForDay(day);
        const hasMissedTasks = tasks.some(t => t.required && !t.completed);
        status = hasMissedTasks ? "missed" : "completed";
      } else if (day === currentDay) {
        status = "pending";
      }
      
      timeline.push({
        day,
        date: dayDate,
        status,
        tasks: generateTasksForDay(day),
        hasConversation: day <= currentDay
      });
    }
    
    setDayStatuses(timeline);
  };

  // Generate sample tasks for a day
  const generateTasksForDay = (day: number): DayTask[] => {
    const tasks: DayTask[] = [];
    
    if (day === -45) {
      tasks.push(
        { id: "1", title: "Complete enrollment forms", type: "form", completed: true, required: true },
        { id: "2", title: "Watch welcome video", type: "video", completed: true, required: true }
      );
    } else if (day >= -7 && day < 0) {
      tasks.push(
        { id: "pre1", title: "Pre-surgery checklist", type: "form", completed: day < -2, required: true },
        { id: "pre2", title: "Medication review", type: "message", completed: day < -1, required: true }
      );
    } else if (day >= 1 && day <= 7) {
      tasks.push(
        { id: "3", title: "Morning exercises", type: "exercise", completed: day < currentDay, required: true },
        { id: "4", title: "Pain assessment", type: "form", completed: day < currentDay || day === 1, required: true },
        { id: "5", title: "Ice therapy", type: "exercise", completed: day === 1, required: false }
      );
    } else if (day === currentDay) {
      tasks.push(
        { id: "6", title: "Morning exercises", type: "exercise", completed: false, required: true },
        { id: "7", title: "Pain check-in", type: "form", completed: false, required: true },
        { id: "8", title: "Quad sets", type: "exercise", completed: false, required: false }
      );
    }
    
    return tasks;
  };

  // Load conversation history for selected day
  const loadConversationHistory = async (day: number) => {
    if (day === currentDay) return; // Don't override current day messages
    
    const sampleMessages: Message[] = [];
    
    if (day === -7) {
      sampleMessages.push(
        {
          id: "pre1",
          content: "Hi Sarah! I wanted to check in before your surgery next week. Do you have any questions about the procedure?",
          sender: "ai",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          provider: { name: "Pre-Op Assistant", role: "Pre-Surgery Guide" }
        },
        {
          id: "pre2",
          content: "Yes, I'm a bit nervous about the recovery process. What should I expect?",
          sender: "user",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000)
        }
      );
    } else if (day === 1) {
      sampleMessages.push(
        {
          id: "post1",
          content: "Good morning Sarah! How was your first night after surgery?",
          sender: "ai",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          provider: { name: "Recovery Assistant", role: "Post-Surgery Recovery Coach" }
        },
        {
          id: "post2",
          content: "It was tough. I had some pain around 3 AM.",
          sender: "user",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000)
        }
      );
    }
    
    setMessages(sampleMessages);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate intelligent AI response based on context
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: "ai",
        timestamp: new Date(),
        type: aiResponse.type,
        richContent: aiResponse.richContent,
        provider: {
          name: assistantName,
          role: assistantRole  
        }
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  // Generate contextual AI responses
  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pain')) {
      return {
        content: `I understand you're experiencing pain. On Day ${currentDay} of recovery, some discomfort is normal. Here are some strategies:\n\n• Take prescribed medications as directed\n• Apply ice for 20 minutes every 2-3 hours\n• Keep your knee elevated when resting\n• Do gentle movements as tolerated\n\nIf pain is severe or worsening, please contact your care team immediately.`,
        type: "text" as const
      };
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('therapy')) {
      return {
        content: `Great job focusing on your exercises! Here's today's routine:`,
        type: "exercise" as const,
        richContent: {
          exerciseTitle: "Day 2 Knee Recovery Exercises",
          exerciseInstructions: "• Ankle pumps: 10 reps every hour\n• Quad sets: 10 reps, 3 times daily\n• Heel slides: 10 reps, 3 times daily\n• Short walks: 5-10 minutes, 3-4 times daily"
        }
      };
    } else if (lowerMessage.includes('appointment')) {
      return {
        content: `Your upcoming appointments:\n\n• Physical Therapy: Tomorrow at 2:00 PM\n• Post-op Follow-up: Friday at 10:30 AM with Dr. Smith\n• Wound Check: Next Monday at 9:00 AM\n\nWould you like directions to any of these appointments?`,
        type: "text" as const
      };
    } else {
      return {
        content: `I'm here to support your ${isPreOp ? 'surgery preparation' : 'recovery journey'}. You can ask me about:\n\n• ${isPreOp ? 'Pre-surgery preparation' : 'Pain management strategies'}\n• ${isPreOp ? 'What to expect during surgery' : "Today's exercises and physical therapy"}\n• Upcoming appointments\n• Medication questions\n• ${isPreOp ? 'Surgery day timeline' : 'Recovery progress'}\n\nWhat would you like to know?`,
        type: "text" as const
      };
    }
  };

  // Get status icon for day
  const getDayStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "missed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Circle className="h-4 w-4 text-blue-500 fill-current" />;
      default:
        return <Circle className="h-4 w-4 text-[#cbd5e1]" />;
    }
  };

  // Handle day navigation
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    loadConversationHistory(day);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Manus-style Sidebar - 280px width */}
      <div className="w-[280px] bg-white border-r border-[#e2e8f0] flex flex-col shadow-sm">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#e2e8f0]">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-1">Recovery Timeline</h2>
          <p className="text-sm text-[#64748b]">
            {isPreOp ? `${Math.abs(selectedDay)} days until surgery` : `Day ${selectedDay} of Recovery`}
          </p>
        </div>

        {/* Missed Tasks Alert Section */}
        {dayStatuses.filter(ds => ds.status === "missed").length > 0 && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Days with Missed Tasks
            </h3>
            <div className="space-y-2">
              {dayStatuses.filter(ds => ds.status === "missed").slice(0, 5).map((dayStatus) => (
                <button
                  key={dayStatus.day}
                  onClick={() => handleDayClick(dayStatus.day)}
                  className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">
                      ⚠️ Day {dayStatus.day}
                    </span>
                    <span className="text-xs text-red-600">
                      {dayStatus.tasks.filter(t => !t.completed && t.required).length} missed tasks
                    </span>
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {dayStatus.tasks.filter(t => !t.completed && t.required).map(t => t.title).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {dayStatuses.filter(ds => ds.day >= -45 && ds.day <= currentDay + 30).map((dayStatus) => (
              <button
                key={dayStatus.day}
                onClick={() => handleDayClick(dayStatus.day)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 hover:bg-[#f1f5f9]",
                  selectedDay === dayStatus.day 
                    ? "bg-[#006DB1] text-white shadow-md" 
                    : "hover:shadow-sm"
                )}
              >
                <div className="flex items-center space-x-3">
                  {getDayStatusIcon(dayStatus.status)}
                  <div className="flex flex-col">
                    <div className={cn(
                      "text-sm font-medium leading-tight",
                      selectedDay === dayStatus.day ? "text-white" : "text-[#1e293b]"
                    )}>
                      {dayStatus.day === 0 ? "Surgery" : dayStatus.day < 0 ? `${Math.abs(dayStatus.day)}` : `${dayStatus.day}`}
                    </div>
                    <div className={cn(
                      "text-xs leading-tight",
                      selectedDay === dayStatus.day ? "text-blue-100" : "text-[#64748b]"
                    )}>
                      {dayStatus.day === 0 ? "Day" : dayStatus.day < 0 ? "days to go" : "days post"}
                    </div>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="w-2 h-2 rounded-full">
                  {dayStatus.status === "completed" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  {dayStatus.status === "missed" && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  {dayStatus.status === "pending" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  {dayStatus.status === "future" && <div className="w-2 h-2 bg-[#cbd5e1] rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Care Team Section */}
        <div className="p-6 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Care Team</h3>
          <div className="space-y-3">
            {careTeam.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 bg-[#e2e8f0]">
                    <span className="text-xs font-medium text-[#475569]">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </Avatar>
                  {member.available && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1e293b] truncate">{member.name}</p>
                  <p className="text-xs text-[#64748b]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Modern AI Assistant Header */}
        <div className="bg-[#002238] px-8 py-6 shadow-lg">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedDay !== currentDay && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDayClick(currentDay)}
                    className="text-white border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Today
                  </Button>
                )}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#006DB1] rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white leading-tight">
                      {selectedDay === currentDay ? assistantName : `Day ${selectedDay} Conversation`}
                    </h1>
                    <p className="text-sm text-white/70 mt-1">
                      {selectedDay === currentDay 
                        ? `${patientInfo.name} • ${isPreOp ? `${Math.abs(currentDay)} days until surgery` : `Day ${currentDay} Recovery`} • ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                        : 'Previous conversation history'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Patient Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{patientInfo.name}</p>
                  <p className="text-xs text-white/70">{patientInfo.surgeryType}</p>
                </div>
                <Avatar className="h-10 w-10 bg-[#006DB1] border-2 border-white/20">
                  <span className="text-sm font-medium text-white">
                    {patientInfo.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        {/* Missed Tasks Alert (if viewing past day with missed tasks) */}
        {selectedDay < currentDay && dayStatuses.find(ds => ds.day === selectedDay)?.status === "missed" && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-4">
            <div className="max-w-[800px] mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Missed Tasks from Day {selectedDay}</p>
                    <p className="text-xs text-red-700">You can still complete these important recovery tasks</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Complete Now
                </Button>
              </div>
              
              {/* List of missed tasks */}
              <div className="mt-3 space-y-2">
                {dayStatuses.find(ds => ds.day === selectedDay)?.tasks
                  .filter(task => !task.completed && task.required)
                  .map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-3">
                        {task.type === "exercise" && <Dumbbell className="h-4 w-4 text-[#006DB1]" />}
                        {task.type === "form" && <FileText className="h-4 w-4 text-[#006DB1]" />}
                        {task.type === "message" && <MessageSquare className="h-4 w-4 text-[#006DB1]" />}
                        <span className="text-sm text-[#1e293b]">{task.title}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-[#006DB1] border-[#006DB1] hover:bg-[#f1f5f9]">
                        Start
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Modern Messages Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#f8fafc] to-white">
          <div className="max-w-[800px] mx-auto h-full px-8">
            <ScrollArea className="h-full py-8">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-4",
                      message.sender === "user" && "justify-end"
                    )}
                  >
                    {/* AI Assistant Avatar */}
                    {message.sender !== "user" && (
                      <div className="h-12 w-12 bg-gradient-to-br from-[#006DB1] to-[#004A7C] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      "max-w-[75%]",
                      message.sender === "user" && "order-first"
                    )}>
                      {message.sender !== "user" && message.provider && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-semibold text-[#006DB1]">
                            {message.provider.name}
                          </p>
                          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded-full">
                            {message.provider.role}
                          </span>
                        </div>
                      )}
                      
                      <div className={cn(
                        "rounded-2xl px-6 py-4 shadow-sm",
                        message.sender === "user" 
                          ? "bg-[#006DB1] text-white ml-4" 
                          : "bg-white text-[#1e293b] border border-[#e2e8f0]"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Rich Content - Video */}
                        {message.type === "video" && message.richContent?.videoUrl && (
                          <div className="mt-4 bg-gray-50 rounded-xl overflow-hidden">
                            <div className="bg-black aspect-video flex items-center justify-center relative">
                              <iframe
                                src={message.richContent.videoUrl}
                                title={message.richContent.videoTitle}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                            <div className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <Play className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{message.richContent.videoTitle}</div>
                                  <div className="text-xs text-gray-600">Duration: {message.richContent.videoDuration}</div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-[#006DB1] hover:bg-[#004A7C] text-xs">
                                  Mark as Watched
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  Add to Favorites
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rich Content - Exercise */}
                        {message.type === "exercise" && message.richContent?.exerciseTitle && (
                          <div className="mt-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                              <Activity className="h-5 w-5" />
                              <span>{message.richContent.exerciseTitle}</span>
                            </h4>
                            <div className="text-sm text-green-800 mb-3 whitespace-pre-line">
                              {message.richContent.exerciseInstructions}
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                              Mark as Completed
                            </Button>
                          </div>
                        )}

                        {/* Rich Content - Form */}
                        {message.type === "form" && message.richContent?.formData && (
                          <div className="mt-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>{message.richContent.formData.title}</span>
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                  Pain level (0-10)
                                </label>
                                <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-blue-200">
                                  <span className="text-sm text-blue-700 font-medium">0</span>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    defaultValue="3"
                                    className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-sm text-blue-700 font-medium">10</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                  How do you feel today?
                                </label>
                                <select className="w-full p-3 border border-blue-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                  <option>Select...</option>
                                  <option>Much better</option>
                                  <option>Better</option>
                                  <option>Same</option>
                                  <option>Worse</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                                Submit Assessment
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                Save for Later
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className={cn(
                        "text-xs mt-2 flex items-center space-x-1",
                        message.sender === "user" ? "text-right text-[#64748b] justify-end" : "text-[#64748b]"
                      )}>
                        <Clock className="h-3 w-3" />
                        <span>
                          {message.timestamp.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </p>
                    </div>

                    {/* User Avatar */}
                    {message.sender === "user" && (
                      <div className="h-12 w-12 bg-gradient-to-br from-[#006DB1] to-[#004A7C] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {patientInfo.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-[#006DB1] to-[#004A7C] rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl px-6 py-4 border border-[#e2e8f0] shadow-sm">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-[#006DB1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-[#006DB1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-[#006DB1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Modern Input Area */}
        <div className="bg-white border-t border-[#e2e8f0] px-8 py-6 shadow-lg">
          <div className="max-w-[800px] mx-auto">
            {/* Suggested Prompts (only on current day and when no messages yet) */}
            {selectedDay === currentDay && messages.length <= (isPreOp ? 2 : 4) && (
              <div className="mb-4">
                <p className="text-xs text-[#64748b] font-medium mb-3">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(prompt)}
                      className="text-xs px-4 py-2 bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] rounded-full hover:border-[#006DB1] hover:bg-gradient-to-r hover:from-[#006DB1]/5 hover:to-[#006DB1]/10 text-[#64748b] hover:text-[#006DB1] transition-all duration-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={
                    selectedDay === currentDay 
                      ? isPreOp 
                        ? "Ask any questions about your surgery preparation..."
                        : "Ask questions about your recovery or report any concerns..."
                      : "This is a historical conversation"
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={selectedDay !== currentDay}
                  className="border-2 border-[#e2e8f0] focus:border-[#006DB1] focus:ring-[#006DB1] rounded-2xl bg-white text-sm py-4 px-6 pr-20 min-h-[56px] shadow-sm placeholder:text-[#94a3b8]"
                  autoFocus
                />
                <div className="absolute right-4 bottom-4 flex space-x-2">
                  <button className="p-2 text-[#94a3b8] hover:text-[#006DB1] transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-[#94a3b8] hover:text-[#006DB1] transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || selectedDay !== currentDay}
                className="bg-[#006