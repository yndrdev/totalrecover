'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  CheckCircle,
  Circle,
  User,
  Bot,
  LogOut,
  FileText,
  Settings,
  ChevronDown,
  Activity,
  Target,
  Play,
  BarChart3,
  X,
  ArrowLeft,
  Stethoscope,
  Clock,
  Mic,
  Paperclip,
  Heart,
  Calendar,
  HelpCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { patientTimelineService } from '@/lib/services/patient-timeline-service';
import { patientChatService } from '@/lib/services/patient-chat-service';
import { PatientData } from '@/lib/services/patient-chat-service';
import { TimelineDay, TimelineTask } from '@/lib/services/patient-timeline-service';

// Types
interface Message {
  id: string;
  type: string;
  timestamp: string;
  content: string;
  video?: {
    id?: string;
    title: string;
    duration: string;
    url?: string;
  };
  form?: {
    id?: string;
    title: string;
    schema?: any;
  };
  exercise?: {
    id?: string;
    title: string;
    instructions?: string;
    duration?: string;
  };
  taskId?: string;
  sender_type?: string;
}

interface ThreadDay {
  day: string;
  date: string;
  description: string;
  status: string;
  messages: Message[];
  timelineDay?: TimelineDay;
}

// Suggested prompts for post-op patients
const SUGGESTED_PROMPTS = [
  "How is my pain today?",
  "Show me today's exercises",
  "When is my next appointment?",
  "I have a question about medication",
  "I completed my physical therapy",
  "How is my recovery progressing?"
];

export default function PostOpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedDay, setSelectedDay] = useState<ThreadDay | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [currentDayTasks, setCurrentDayTasks] = useState<TimelineTask[]>([]);
  const [threadDays, setThreadDays] = useState<ThreadDay[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [currentRecoveryDay, setCurrentRecoveryDay] = useState(0);

  // Check authentication and load patient data
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // Redirect to new patient profile page
      router.push(`/patient/${user.id}`);
      return;

      // Get patient data
      const patientResult = await patientChatService.getCurrentPatient();
      if (!patientResult.success || !patientResult.patient) {
        console.error('Failed to load patient data, creating new patient record');
        
        // Create patient record if it doesn't exist
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            status: 'active',
            surgery_date: yesterday.toISOString(), // Default to yesterday (post-op)
            recovery_phase: 'post-op',
            current_day: 1, // Day 1 post-op
            current_recovery_day: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError || !newPatient) {
          console.error('Failed to create patient record:', createError);
          router.push('/auth/signin?role=patient');
          return;
        }

        // Try to get patient data again
        const retryResult = await patientChatService.getCurrentPatient();
        if (!retryResult.success || !retryResult.patient) {
          console.error('Still failed to load patient data after creation');
          router.push('/auth/signin?role=patient');
          return;
        }

        setPatient(retryResult.patient);
      } else {
        setPatient(patientResult.patient);
      }

      const patientData = patient || patientResult.patient;
      if (!patientData) {
        console.error('No patient data available');
        router.push('/auth/signin?role=patient');
        return;
      }

      // Check if patient should see pre-op or post-op
      if (patientData.surgery_date) {
        const surgeryDate = new Date(patientData.surgery_date);
        const today = new Date();
        const daysSinceSurgery = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceSurgery < 0) {
          // Redirect to pre-op if surgery hasn't happened yet
          router.push('/preop');
          return;
        }

        setCurrentRecoveryDay(daysSinceSurgery);
      }

      // Load timeline
      const timelineResult = await patientTimelineService.getPatientTimeline(patientData.id);
      if (timelineResult.success && timelineResult.timeline) {
        setTimeline(timelineResult.timeline);
        
        // Convert timeline days to thread days for UI
        const postOpDays = timelineResult.timeline.days
          .filter(day => day.dayOffset >= 0)
          .map(day => convertToThreadDay(day));
        
        setThreadDays(postOpDays);
        
        // Set current day tasks
        const today = timelineResult.timeline.days.find(day => day.status === 'current');
        if (today) {
          setCurrentDayTasks(today.tasks);
        }
      }

      // Get or create conversation
      const currentDay = patientData.current_day;
      const conversationResult = await patientChatService.getCurrentConversation(
        patientData.id,
        currentDay
      );
      
      if (conversationResult.success && conversationResult.conversationId) {
        setConversationId(conversationResult.conversationId);
        
        // Load existing messages
        const messagesResult = await patientChatService.getConversationMessages(
          conversationResult.conversationId
        );
        
        if (messagesResult.success && messagesResult.messages) {
          const formattedMessages = messagesResult.messages.map(msg => ({
            id: msg.id,
            type: 'message',
            timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
            content: msg.content,
            sender_type: msg.sender_type,
            taskId: undefined
          }));
          setMessages(formattedMessages);
        }
      }

      // Subscribe to real-time updates
      if (patientData.id) {
        const subscription = patientTimelineService.subscribeToTaskUpdates(
          patientData.id,
          (updatedTask) => {
            // Update task in current day tasks
            setCurrentDayTasks(prev => 
              prev.map(task => 
                task.id === updatedTask.id 
                  ? { ...task, status: updatedTask.status as TimelineTask['status'] }
                  : task
              )
            );
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToThreadDay = (timelineDay: TimelineDay): ThreadDay => {
    return {
      day: timelineDay.day,
      date: timelineDay.date,
      description: timelineDay.description,
      status: timelineDay.status,
      messages: [], // Could load messages for specific days
      timelineDay
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || sendingMessage) return;
    
    setSendingMessage(true);
    const messageContent = inputValue;
    setInputValue('');

    try {
      // Send patient message
      const result = await patientChatService.sendMessage(
        conversationId,
        messageContent,
        'patient'
      );

      if (result.success) {
        // Add message to UI
        const newMessage: Message = {
          id: result.messageId || Math.random().toString(),
          type: 'message',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          content: messageContent,
          sender_type: 'patient'
        };
        setMessages(prev => [...prev, newMessage]);

        // Generate AI response
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(messageContent);
          if (aiResponse) {
            const aiResult = await patientChatService.sendMessage(
              conversationId,
              aiResponse,
              'ai'
            );

            if (aiResult.success) {
              const aiMessage: Message = {
                id: aiResult.messageId || Math.random().toString(),
                type: 'message',
                timestamp: new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                }),
                content: aiResponse,
                sender_type: 'ai'
              };
              setMessages(prev => [...prev, aiMessage]);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simple AI responses for demo - in production, this would call an AI service
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pain')) {
      return `I understand you're asking about pain management. On Day ${currentRecoveryDay} of recovery, some discomfort is normal. Here are some strategies:\n\n• Take prescribed medications as directed\n• Apply ice for 20 minutes every 2-3 hours\n• Keep your knee elevated when resting\n• Do gentle movements as tolerated\n\nIf pain is severe or worsening, please contact your care team immediately.`;
    } else if (lowerMessage.includes('exercise') || lowerMessage.includes('therapy')) {
      return `Great job focusing on your exercises! Today's routine includes:\n\n• Ankle pumps: 10 reps every hour\n• Quad sets: 10 reps, 3 times daily\n• Heel slides: 10 reps, 3 times daily\n• Short walks: 5-10 minutes, 3-4 times daily\n\nRemember to move slowly and stop if you feel sharp pain. Would you like me to show you video demonstrations?`;
    } else if (lowerMessage.includes('appointment')) {
      return `Your upcoming appointments:\n\n• Physical Therapy: Tomorrow at 2:00 PM\n• Post-op Follow-up: Friday at 10:30 AM with Dr. Smith\n• Wound Check: Next Monday at 9:00 AM\n\nWould you like directions to any of these appointments?`;
    } else if (lowerMessage.includes('medication')) {
      return `Your current medications:\n\n• Pain relief: Take as prescribed, typically every 4-6 hours\n• Anti-inflammatory: Once daily with food\n• Blood thinner: As prescribed to prevent clots\n\nAlways take medications exactly as prescribed. If you're experiencing side effects or have concerns, please contact your pharmacy or care team.`;
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('recovery')) {
      return `You're doing excellent! Day ${currentRecoveryDay} progress summary:\n\n✅ Tasks completed: ${currentDayTasks.filter(t => t.status === 'completed').length}/${currentDayTasks.length}\n✅ Range of motion improving\n✅ Pain levels manageable\n✅ Walking distance increasing\n\nYou're on track with your recovery timeline. Keep up the great work!`;
    } else {
      return `I'm here to support your recovery journey. You can ask me about:\n\n• Pain management strategies\n• Today's exercises and physical therapy\n• Upcoming appointments\n• Medication questions\n• Recovery progress\n• Any concerns you may have\n\nWhat would you like to know?`;
    }
  };

  const clearFilter = () => {
    setFilterType(null);
  };

  const markTaskComplete = async (taskId: string, taskType: string) => {
    if (!conversationId) return;

    const result = await patientChatService.completeTaskFromChat(
      taskId,
      conversationId,
      { completedVia: 'chat', taskType }
    );

    if (result.success) {
      setCurrentDayTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      );
    }
  };

  const filteredThreadDays = filterType ?
    threadDays.filter(day => day.status === filterType) :
    threadDays;

  // Get messages to display - either from selected day or current messages
  const displayMessages = selectedDay ? selectedDay.messages : messages;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your recovery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
      {/* Left Sidebar - Recovery Timeline */}
      <div className="w-[280px] bg-slate-800 flex flex-col">
        {/* Recovery Timeline Header */}
        <div className="p-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-medium text-sm">Recovery Timeline</h2>
            <p className="text-green-300 text-xs">Day {currentRecoveryDay}</p>
          </div>
        </div>

        {/* Task Filter */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('missed')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === 'missed' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Missed Task
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === 'completed' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Completed Tasks
              </button>
            </div>
            <div className="w-6 flex justify-center">
              {filterType && (
                <button
                  onClick={clearFilter}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Clear filter"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Day Task List Preview */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-green-400 font-medium text-sm mb-3">Day {currentRecoveryDay}</h3>
          <div className="space-y-2">
            {currentDayTasks.length === 0 ? (
              <p className="text-xs text-gray-400">No tasks scheduled for today</p>
            ) : (
              currentDayTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-2 text-white">
                  <div className="mt-1">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  <span className="text-xs text-gray-300">{task.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Thread - Past Days */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {filteredThreadDays.map((dayItem, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(dayItem)}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-all duration-200 hover:bg-slate-700 ${
                  selectedDay === dayItem ? 'bg-slate-700' : 'bg-transparent'
                } ${
                  filterType === 'completed' && dayItem.status === 'completed' ? 'border border-green-500' : 
                  filterType === 'missed' && dayItem.status === 'missed' ? 'border border-red-500' : 
                  ''
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {dayItem.day}
                </div>
                <div className="text-xs text-gray-400">
                  {dayItem.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header with Profile Menu */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-end">
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {patient?.profile ? `${patient.profile.first_name} ${patient.profile.last_name}` : 'Patient'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Recovery Forms</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>My Exercises</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Recovery Progress</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-4">
            {selectedDay && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                <div className="text-sm font-medium text-green-900">
                  Viewing {selectedDay.day}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {selectedDay.description} ({selectedDay.status})
                </div>
              </div>
            )}
            
            {displayMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Welcome to your recovery assistant!</p>
                <p className="text-gray-400 text-sm">I&apos;m here to help you through your recovery journey.</p>
              </div>
            )}

            {displayMessages.map((message: Message) => (
              <div key={message.id} className="flex items-start space-x-3">
                {/* Avatar */}
                {message.sender_type === 'patient' ? (
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className="flex-1 max-w-xl">
                  {/* Message Bubble */}
                  <div className={`rounded-2xl p-4 shadow-sm border ${
                    message.sender_type === 'patient' 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-green-600">
                        {message.sender_type === 'patient' ? 'You' : 'Recovery Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Video Content */}
                    {message.type === 'video' && message.video && (
                      <div className="bg-gray-50 rounded-xl overflow-hidden mt-3">
                        <div className="bg-black aspect-video flex items-center justify-center relative">
                          <div className="text-center text-white">
                            <div className="mb-2">
                              <Play className="h-12 w-12 mx-auto text-white" />
                            </div>
                            <div className="text-sm">Exercise Video</div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <Play className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{message.video.title}</div>
                              <div className="text-xs text-gray-600">Duration: {message.video.duration}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {message.taskId && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-xs rounded-lg"
                                onClick={() => markTaskComplete(message.taskId!, 'video')}
                              >
                                Mark as Watched
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-xs rounded-lg">
                              Add to Favorites
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Exercise Content */}
                    {message.exercise && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 mt-3">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>{message.exercise.title}</span>
                        </h4>
                        {message.exercise.instructions && (
                          <p className="text-sm text-green-800 mb-3">{message.exercise.instructions}</p>
                        )}
                        {message.exercise.duration && (
                          <p className="text-xs text-green-700 mb-3">Duration: {message.exercise.duration}</p>
                        )}
                        <div className="flex space-x-2">
                          {message.taskId && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs rounded-lg"
                              onClick={() => markTaskComplete(message.taskId!, 'exercise')}
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Form Content */}
                    {message.form && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 mt-3">
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>{message.form.title}</span>
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              Pain level (0-10)
                            </label>
                            <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-green-200">
                              <span className="text-sm text-green-700 font-medium">0</span>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                defaultValue="3"
                                className="flex-1 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <span className="text-sm text-green-700 font-medium">10</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-800 mb-2">
                              How do you feel today?
                            </label>
                            <select className="w-full p-3 border border-green-300 rounded-lg text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none bg-white">
                              <option>Select...</option>
                              <option>Much better</option>
                              <option>Better</option>
                              <option>Same</option>
                              <option>Worse</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          {message.taskId && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs rounded-lg"
                              onClick={() => markTaskComplete(message.taskId!, 'form')}
                            >
                              Submit Assessment
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs rounded-lg">
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    Delivered at {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <div className="px-4 pb-2">
            <div className="max-w-2xl mx-auto">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(prompt)}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modern Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Input Row */}
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask questions about your recovery or report any concerns..."
                  className="resize-none border-2 border-gray-200 focus:border-green-500 rounded-2xl bg-white text-sm py-3 px-4 pr-20 min-h-[48px]"
                  disabled={sendingMessage}
                />
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sendingMessage}
                style={{ backgroundColor: '#006DB1' }}
                className="hover:opacity-90 text-white p-3 rounded-2xl min-w-[48px] h-[48px] flex items-center justify-center"
              >
                {sendingMessage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}