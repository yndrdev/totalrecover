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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai" | "provider";
  timestamp: Date;
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
  const [selectedDay, setSelectedDay] = useState<number>(0); // Current day
  const [currentDay, setCurrentDay] = useState<number>(2); // Patient is on Day 2 post-op
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
  const [patientInfo, setPatientInfo] = useState({
    name: "Sarah Johnson",
    avatar: "/avatars/patient-sarah.jpg",
    surgeryType: "Total Knee Replacement",
    surgeryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  });
  const [careTeam, setCareTeam] = useState([
    { id: 1, name: "Dr. Michael Smith", role: "Surgeon", avatar: "/avatars/dr-smith.jpg", available: true },
    { id: 2, name: "Nancy Johnson", role: "Nurse", avatar: "/avatars/nurse-johnson.jpg", available: true },
    { id: 3, name: "PT Williams", role: "Physical Therapist", avatar: "/avatars/pt-williams.jpg", available: false }
  ]);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const supabase = createClient();

  // Initialize timeline and load data
  useEffect(() => {
    initializeTimeline();
    loadConversationHistory(selectedDay);
    
    // Add welcome message if it's the current day and no messages
    if (selectedDay === currentDay && messages.length === 0) {
      setMessages([{
        id: "1",
        content: `Good morning ${patientInfo.name.split(' ')[0]}! How are you feeling today on Day ${currentDay} of your recovery?`,
        sender: "ai",
        timestamp: new Date(),
        provider: {
          name: "Recovery Assistant",
          role: "AI Assistant"
        }
      }]);
    }
  }, []);

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
        status: day < currentDay ? "completed" : "future",
        tasks: generateTasksForDay(day),
        hasConversation: day >= -7 && day < currentDay // Has conversation in last week pre-op
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
    } else if (day >= 1 && day <= 7) {
      tasks.push(
        { id: "3", title: "Ankle pumps exercise", type: "exercise", completed: day < currentDay, required: true },
        { id: "4", title: "Pain assessment", type: "form", completed: day < currentDay || day === 1, required: true },
        { id: "5", title: "Range of motion exercises", type: "exercise", completed: day === 1, required: false }
      );
    } else if (day === currentDay) {
      tasks.push(
        { id: "6", title: "Morning exercises", type: "exercise", completed: false, required: true },
        { id: "7", title: "Pain check-in", type: "form", completed: false, required: true },
        { id: "8", title: "Afternoon walking", type: "exercise", completed: false, required: false }
      );
    }
    
    return tasks;
  };

  // Load conversation history for selected day
  const loadConversationHistory = async (day: number) => {
    // In a real app, this would fetch from Supabase
    // For now, we'll generate sample messages based on the day
    const sampleMessages: Message[] = [];
    
    if (day === -7) {
      sampleMessages.push(
        {
          id: "pre1",
          content: "Hi! I wanted to check in before your surgery next week. Do you have any questions?",
          sender: "ai",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          provider: { name: "Nancy Johnson", role: "Nurse", avatar: "/avatars/nurse-johnson.jpg" }
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
          content: "Good morning! How was your first night after surgery?",
          sender: "ai",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          provider: { name: "Recovery Assistant", role: "AI Assistant" }
        },
        {
          id: "post2",
          content: "It was tough. I had some pain around 3 AM.",
          sender: "user",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000)
        },
        {
          id: "post3",
          content: "I understand. Pain is normal at this stage. Let's do a pain assessment to help manage it better.",
          sender: "ai",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 120000),
          provider: { name: "Dr. Michael Smith", role: "Surgeon", avatar: "/avatars/dr-smith.jpg" }
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand. Let me help you with that. Based on what you've told me, I recommend...",
        sender: "ai",
        timestamp: new Date(),
        provider: {
          name: "Recovery Assistant",
          role: "AI Assistant"
        }
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
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

  // Format day label
  const formatDayLabel = (day: number) => {
    if (day === 0) return "Surgery Day";
    if (day < 0) return `Pre-Op Day ${Math.abs(day)}`;
    return `Day ${day}`;
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
            Day {selectedDay} of Recovery
          </p>
        </div>

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
                    ? "bg-[#3b82f6] text-white shadow-md" 
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
        {/* Chat Header */}
        <div className="bg-white border-b border-[#e2e8f0] px-8 py-6 shadow-sm">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedDay !== currentDay && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDayClick(currentDay)}
                    className="text-[#3b82f6] hover:bg-[#f1f5f9] hover:text-[#1d4ed8]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Today
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-semibold text-[#1e293b] leading-tight">
                    {selectedDay === currentDay ? 'Recovery Assistant' : `Day ${selectedDay} Conversation`}
                  </h1>
                  <p className="text-sm text-[#64748b] mt-1">
                    {selectedDay === currentDay ? `Day ${currentDay} of your recovery journey` : 'Previous conversation history'}
                  </p>
                </div>
              </div>
              
              {/* Patient Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1e293b]">{patientInfo.name}</p>
                  <p className="text-xs text-[#64748b]">{patientInfo.surgeryType}</p>
                </div>
                <Avatar className="h-10 w-10 bg-[#e2e8f0] border border-[#cbd5e1]">
                  <span className="text-sm font-medium text-[#475569]">
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
                        {task.type === "exercise" && <Dumbbell className="h-4 w-4 text-[#3b82f6]" />}
                        {task.type === "form" && <FileText className="h-4 w-4 text-[#3b82f6]" />}
                        {task.type === "message" && <MessageSquare className="h-4 w-4 text-[#3b82f6]" />}
                        <span className="text-sm text-[#1e293b]">{task.title}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-[#3b82f6] border-[#3b82f6] hover:bg-[#f1f5f9]">
                        Start
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden bg-[#f8fafc]">
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
                    {/* Provider/AI Avatar */}
                    {message.sender !== "user" && (
                      <Avatar className="h-10 w-10 bg-[#e2e8f0] border border-[#cbd5e1] shadow-sm">
                        {message.provider?.avatar ? (
                          <img src={message.provider.avatar} alt={message.provider.name} className="rounded-full" />
                        ) : (
                          <span className="text-xs font-medium text-[#475569]">
                            {message.provider?.role === "AI Assistant" ? "AI" : 
                             message.provider?.name.split(' ').map(n => n[0]).join('') || "AI"}
                          </span>
                        )}
                      </Avatar>
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      "max-w-[70%]",
                      message.sender === "user" && "order-first"
                    )}>
                      {message.sender !== "user" && message.provider && (
                        <p className="text-xs text-[#64748b] mb-2 font-medium">
                          {message.provider.name} • {message.provider.role}
                        </p>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        message.sender === "user" 
                          ? "bg-[#3b82f6] text-white" 
                          : "bg-white text-[#1e293b] border border-[#e2e8f0]"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className={cn(
                        "text-xs mt-2",
                        message.sender === "user" ? "text-right text-[#64748b]" : "text-[#64748b]"
                      )}>
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>

                    {/* User Avatar */}
                    {message.sender === "user" && (
                      <Avatar className="h-10 w-10 bg-[#3b82f6] border border-[#1d4ed8] shadow-sm">
                        <span className="text-xs font-medium text-white">
                          {patientInfo.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 bg-[#e2e8f0] border border-[#cbd5e1] shadow-sm">
                      <span className="text-xs font-medium text-[#475569]">AI</span>
                    </Avatar>
                    <div className="bg-white rounded-2xl px-4 py-3 border border-[#e2e8f0] shadow-sm">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-[#e2e8f0] px-8 py-6 shadow-lg">
          <div className="max-w-[800px] mx-auto">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder={selectedDay === currentDay ? "Type your message..." : "This is a historical conversation"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={selectedDay !== currentDay}
                className="flex-1 border-[#e2e8f0] focus:border-[#3b82f6] focus:ring-[#3b82f6] rounded-xl px-4 py-3 text-sm placeholder:text-[#94a3b8]"
                autoFocus
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || selectedDay !== currentDay}
                className="bg-[#3b82f6] hover:bg-[#1d4ed8] text-white rounded-xl px-6 py-3 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions (only on current day) */}
            {selectedDay === currentDay && (
              <div className="flex items-center space-x-3 mt-4">
                <span className="text-xs text-[#64748b] font-medium">Quick responses:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("I'm feeling good today")}
                  className="text-xs border-[#e2e8f0] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#f1f5f9] rounded-lg"
                >
                  Feeling good
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("I have some pain")}
                  className="text-xs border-[#e2e8f0] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#f1f5f9] rounded-lg"
                >
                  Have pain
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("Need help with exercises")}
                  className="text-xs border-[#e2e8f0] hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#f1f5f9] rounded-lg"
                >
                  Exercise help
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}