"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserContext } from '@/components/auth/user-provider';
import {
  ChatMessage,
  ConversationSession,
  RecoveryDayInfo,
  PatientRecoveryContext,
  ChatInterfaceState,
  TaskMetadata,
  RealtimeMessagePayload
} from '@/types/chat';
import { useRealtimeChat, TypingIndicator } from '@/lib/services/realtime-chat-service';
import {
  Send,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle,
  ArrowRight,
  MessageSquare,
  User,
  Bot,
  Loader2,
  ExternalLink,
  Shield,
  Heart,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

{/* <thinking>
Healthcare Context: Manus-style chat interface for recovery conversations
- Update hardcoded hex colors to standard Tailwind classes
- Maintain healthcare-appropriate color scheme
- Professional medical interface appearance
- Ensure consistency with new design system
</thinking> */}

interface ManusStyleChatInterfaceProps {
  patientId?: string;
  providerId?: string;
  mode?: 'patient' | 'provider' | 'demo';
  className?: string;
}

export default function ManusStyleChatInterface({
  patientId,
  providerId,
  mode = 'patient',
  className = ''
}: ManusStyleChatInterfaceProps) {
  const { user } = useUserContext();
  const supabase = createClient();
  
  // Core state management
  const [state, setState] = useState<ChatInterfaceState>({
    currentDay: 0,
    selectedDay: 0,
    messages: [],
    loading: true,
    typing: false,
    error: null,
    sidebarOpen: true,
    recoveryDays: [],
    patientContext: null,
    activeSession: null
  });

  // Input and UI state
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup realtime chat with callbacks
  const realtimeChat = useRealtimeChat(
    conversationId,
    user?.id || null,
    'patient',
    {
      onNewMessage: (message: ChatMessage) => {
        // Only add message if it's not from current user (to avoid duplicates)
        if (message.sender_id !== user?.id) {
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, message],
            typing: false
          }));
        }
      },
      onMessageUpdated: (message: ChatMessage) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === message.id ? message : msg
          )
        }));
      },
      onTypingUpdate: (indicator: TypingIndicator) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.user_id !== indicator.user_id);
          if (indicator.is_typing) {
            return [...filtered, indicator];
          }
          return filtered;
        });
      },
      onReadReceipt: (messageId: string, userId: string, readAt: string) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, read_at: readAt } : msg
          )
        }));
      }
    }
  );

  // Calculate recovery day based on surgery date
  const calculateRecoveryDay = useCallback((surgeryDate: string): number => {
    const surgery = new Date(surgeryDate);
    const today = new Date();
    const diffTime = today.getTime() - surgery.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Generate recovery days with real task data from Supabase
  const generateRecoveryDays = useCallback(async (surgeryDate: string, currentDay: number, patientId: string): Promise<RecoveryDayInfo[]> => {
    const days: RecoveryDayInfo[] = [];
    const surgeryDateTime = new Date(surgeryDate);
    
    try {
      // Fetch patient tasks from database
      const { data: patientTasks } = await supabase
        .from('patient_tasks')
        .select(`
          *,
          tasks(*)
        `)
        .eq('patient_id', patientId);

      for (let day = -45; day <= Math.max(currentDay + 30, 200); day++) {
        const dayDate = new Date(surgeryDateTime);
        dayDate.setDate(dayDate.getDate() + day);
        
        // Determine phase
        let phase: RecoveryDayInfo['phase'] = 'maintenance';
        if (day < 0) phase = 'pre_surgery';
        else if (day <= 3) phase = 'immediate_post_op';
        else if (day <= 14) phase = 'early_recovery';
        else if (day <= 90) phase = 'active_recovery';
        
        // Calculate real task summary from database
        const dayTasks = patientTasks?.filter(pt => pt.tasks?.recovery_day === day) || [];
        const taskSummary = {
          total: dayTasks.length,
          completed: dayTasks.filter(pt => pt.status === 'completed').length,
          missed: dayTasks.filter(pt => pt.status === 'missed').length,
          pending: dayTasks.filter(pt => pt.status === 'pending').length
        };

        let statusIndicator: RecoveryDayInfo['status_indicator'] = 'pending';
        if (day < currentDay) {
          if (taskSummary.missed > 0) statusIndicator = 'error';
          else if (taskSummary.completed === taskSummary.total && taskSummary.total > 0) statusIndicator = 'success';
          else if (taskSummary.completed > 0) statusIndicator = 'warning';
        }

        // Check if day has messages
        const { data: dayMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('patient_id', patientId)
          .gte('created_at', dayDate.toISOString().split('T')[0])
          .lt('created_at', new Date(dayDate.getTime() + 86400000).toISOString().split('T')[0])
          .limit(1);

        days.push({
          day,
          date: dayDate.toISOString().split('T')[0],
          phase,
          has_messages: (dayMessages?.length || 0) > 0,
          task_summary: taskSummary,
          status_indicator: statusIndicator
        });
      }
    } catch (error) {
      console.error('Error generating recovery days:', error);
      // Fallback to basic structure if database query fails
      for (let day = -45; day <= Math.max(currentDay + 30, 200); day++) {
        const dayDate = new Date(surgeryDateTime);
        dayDate.setDate(dayDate.getDate() + day);
        
        let phase: RecoveryDayInfo['phase'] = 'maintenance';
        if (day < 0) phase = 'pre_surgery';
        else if (day <= 3) phase = 'immediate_post_op';
        else if (day <= 14) phase = 'early_recovery';
        else if (day <= 90) phase = 'active_recovery';
        
        days.push({
          day,
          date: dayDate.toISOString().split('T')[0],
          phase,
          has_messages: false,
          task_summary: { total: 0, completed: 0, missed: 0, pending: 0 },
          status_indicator: 'pending'
        });
      }
    }
    
    return days;
  }, [supabase]);

  // Initialize patient context and recovery data from Supabase
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !patientId) return;

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Fetch real patient context from Supabase
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select(`
            *,
            profiles!inner(tenant_id, first_name, last_name, full_name),
            recovery_protocols(*)
          `)
          .eq('user_id', patientId || user.id)
          .single();

        if (patientError || !patient) {
          throw new Error('Failed to load patient data');
        }

        // Fetch care team for this patient's tenant
        const { data: careTeam } = await supabase
          .from('profiles')
          .select('*')
          .eq('tenant_id', patient.profiles.tenant_id)
          .in('role', ['surgeon', 'provider', 'nurse', 'physical_therapist'])
          .eq('is_active', true);

        const patientContext: PatientRecoveryContext = {
          patient_id: patient.id,
          surgery_type: patient.surgery_type || 'TKA',
          surgery_date: patient.surgery_date,
          current_day: calculateRecoveryDay(patient.surgery_date),
          phase: 'early_recovery', // Calculate based on current_day
          provider_team: {
            surgeon: careTeam?.find(t => t.role === 'surgeon')?.full_name || 'Dr. Sarah Johnson',
            nurse: careTeam?.find(t => t.role === 'nurse')?.full_name || 'Mike Chen, PT',
            physical_therapist: careTeam?.find(t => t.role === 'physical_therapist')?.full_name || 'PT Williams'
          },
          current_medications: [],
          current_exercises: [],
          risk_factors: [],
          preferences: {
            communication_time: 'morning',
            reminder_frequency: 'medium',
            preferred_language: 'en',
            emergency_contacts: []
          },
          care_team: careTeam || [],
          patient_name: patient.profiles.full_name || patient.profiles.first_name + ' ' + patient.profiles.last_name
        };

        const currentDay = patientContext.current_day;
        const recoveryDays = await generateRecoveryDays(patient.surgery_date, currentDay, patient.id);

        setState(prev => ({
          ...prev,
          currentDay,
          selectedDay: currentDay,
          recoveryDays,
          patientContext,
          loading: false
        }));

        // Load real messages for current day
        await loadMessagesForDay(currentDay);

      } catch (error) {
        console.error('Error initializing chat:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to initialize chat interface' 
        }));
      }
    };

    initializeChat();
  }, [user, patientId, calculateRecoveryDay, generateRecoveryDays]);

  // Load real messages for specific day from Supabase
  const loadMessagesForDay = async (day: number) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Get or create conversation for this patient
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('patient_id', state.patientContext?.patient_id)
        .single();

      if (!conversation) {
        setState(prev => ({ ...prev, messages: [], loading: false }));
        return;
      }

      setConversationId(conversation.id);

      // Fetch real messages for this day with provider info
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          provider:providers!provider_id(
            id,
            user:users!user_id(
              full_name,
              email
            )
          )
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error('Failed to load messages');
      }

      const chatMessages: ChatMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        session_id: `session-day-${day}`,
        patient_id: msg.patient_id,
        sender_id: msg.sender_id,
        sender_type: msg.sender_type,
        source: msg.source,
        provider_id: msg.provider_id,
        provider_name: msg.provider?.user?.full_name,
        content: msg.content,
        message_type: msg.message_type || 'text',
        priority: msg.priority,
        recovery_day: day,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at,
        metadata: msg.metadata
      }));

      setState(prev => ({ 
        ...prev, 
        messages: chatMessages, 
        loading: false 
      }));

    } catch (error) {
      console.error('Error loading messages:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load messages' 
      }));
    }
  };

  // Handle day selection
  const handleDaySelect = async (day: number) => {
    setState(prev => ({ ...prev, selectedDay: day }));
    await loadMessagesForDay(day);
  };

  // Return to today
  const handleReturnToToday = async () => {
    setState(prev => ({ ...prev, selectedDay: prev.currentDay }));
    await loadMessagesForDay(state.currentDay);
  };

  // Send message to real Supabase
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSubmitting || !state.patientContext) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSubmitting(true);

    try {
      // Get or create conversation
      let conversationData: { id: string };
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('patient_id', state.patientContext.patient_id)
        .single();

      if (!existingConv) {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            patient_id: state.patientContext.patient_id,
            tenant_id: state.patientContext.tenant_id,
            type: 'patient_support',
            status: 'active'
          })
          .select()
          .single();
        
        if (error || !newConv) throw new Error('Failed to create conversation');
        conversationData = newConv;
      } else {
        conversationData = existingConv;
      }

      // Add user message to database
      const { data: userMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationData.id,
          sender_id: user?.id,
          sender_type: 'patient',
          source: 'patient',
          content: messageContent,
          message_type: 'text',
          priority: 'normal',
          metadata: {}
        })
        .select()
        .single();

      if (messageError || !userMessage) throw new Error('Failed to send message');

      // Add to UI immediately
      const chatMessage: ChatMessage = {
        id: userMessage.id,
        conversation_id: conversationData.id,
        session_id: `session-day-${state.selectedDay}`,
        patient_id: state.patientContext.patient_id,
        sender_id: user?.id || '',
        sender_type: 'patient',
        content: messageContent,
        message_type: 'text',
        recovery_day: state.selectedDay,
        created_at: userMessage.created_at,
        updated_at: userMessage.updated_at
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, chatMessage],
        typing: true
      }));

      // Call AI API for response
      const response = await fetch('/api/chat/ai-response-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          conversation_id: conversationData.id,
          patient_context: state.patientContext,
          recovery_day: state.selectedDay
        })
      });

      if (response.ok) {
        const aiData = await response.json();
        
        // Add AI response to database
        await supabase.from('chat_messages').insert({
          conversation_id: conversationData.id,
          sender_id: 'ai-assistant',
          sender_type: 'ai_assistant',
          source: 'ai',
          content: aiData.content || 'Thank you for sharing that with me.',
          message_type: 'text',
          priority: 'normal',
          metadata: aiData.metadata || {}
        });

        // Reload messages to show AI response
        await loadMessagesForDay(state.selectedDay);
      }

      setState(prev => ({ ...prev, typing: false }));

    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({ 
        ...prev, 
        typing: false, 
        error: 'Failed to send message' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Auto-focus input
  useEffect(() => {
    if (!state.loading) {
      inputRef.current?.focus();
    }
  }, [state.loading, state.selectedDay]);

  // Handle input changes with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Send typing indicator
    if (conversationId && e.target.value.length > 0) {
      realtimeChat.sendTypingIndicator(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        realtimeChat.sendTypingIndicator(false);
      }, 3000);
    } else if (conversationId && e.target.value.length === 0) {
      realtimeChat.sendTypingIndicator(false);
    }
  };

  // Mark messages as read when viewing
  useEffect(() => {
    if (state.messages.length > 0) {
      const unreadMessages = state.messages.filter(
        msg => !msg.read_at && msg.sender_id !== user?.id
      );
      unreadMessages.forEach(msg => {
        realtimeChat.markMessageAsRead(msg.id);
      });
    }
  }, [state.messages, user?.id]);

  // Function to request urgent provider help
  const requestProviderHelp = async () => {
    if (!state.patientContext || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await handleSendMessage();
      // The message "I need urgent help from a provider" will be sent
      setInputValue("I need urgent help from a provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.loading && !state.patientContext) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#006DB1' }} />
          <p className="text-gray-600 font-medium">Loading your recovery chat...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gray-50 flex ${className}`}>
        {/* 280px Sidebar - Recovery Timeline Navigation */}
        <div className="w-[280px] bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#006DB1' }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Recovery Timeline</h2>
                <p className="text-xs" style={{ color: '#C8DBE9' }}>
                  Day {state.currentDay}
                </p>
              </div>
            </div>
          </div>

          {/* Current Day Section */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider">CURRENT DAY</h3>
            <button
              onClick={() => handleDaySelect(state.currentDay)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                state.currentDay === state.selectedDay
                  ? 'text-white shadow-md'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              style={state.currentDay === state.selectedDay ? { backgroundColor: '#006DB1' } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Day {state.currentDay}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div className="text-xs text-slate-300">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </button>
          </div>

          {/* Days with Missed Tasks Section */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider">DAYS WITH MISSED TASKS</h3>
            <div className="space-y-2">
              {state.recoveryDays.filter(day => day.task_summary.missed > 0).slice(0, 3).map((dayInfo) => (
                <button
                  key={dayInfo.day}
                  onClick={() => handleDaySelect(dayInfo.day)}
                  className="w-full p-3 rounded-lg text-left transition-all duration-200 bg-slate-700 hover:bg-slate-600 text-slate-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Day {dayInfo.day}</span>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <span className="text-xs text-red-400">{dayInfo.task_summary.missed} missed</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(dayInfo.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recovery Days List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {state.recoveryDays.map((dayInfo) => (
                <Tooltip key={dayInfo.day}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleDaySelect(dayInfo.day)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 ${
                        dayInfo.day === state.selectedDay
                          ? 'text-white shadow-md'
                          : dayInfo.day === state.currentDay
                          ? 'border-2'
                          : 'bg-white border border-gray-100'
                      }`}
                      style={
                        dayInfo.day === state.selectedDay
                          ? { backgroundColor: '#006DB1' }
                          : dayInfo.day === state.currentDay
                          ? { backgroundColor: '#E3F2FC', borderColor: '#006DB1' }
                          : {}
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium">
                            Day {dayInfo.day >= 0 ? '+' : ''}{dayInfo.day}
                          </span>
                          {dayInfo.has_messages && (
                            <MessageSquare className="h-3 w-3 opacity-60" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {dayInfo.task_summary.completed > 0 && (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          )}
                          {dayInfo.task_summary.missed > 0 && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          {dayInfo.task_summary.pending > 0 && (
                            <Circle className="h-3 w-3" style={{ color: '#006DB1' }} />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs opacity-70 mb-1">
                        {new Date(dayInfo.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          dayInfo.status_indicator === 'success' ? 'bg-emerald-500' :
                          dayInfo.status_indicator === 'warning' ? 'bg-yellow-500' :
                          dayInfo.status_indicator === 'error' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`} />
                        <span className="text-xs opacity-60">
                          {dayInfo.task_summary.total} tasks
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                    <div className="space-y-2">
                      <p className="font-medium">Day {dayInfo.day} Summary</p>
                      <div className="space-y-1 text-xs">
                        <div>✅ {dayInfo.task_summary.completed} completed</div>
                        <div>⚠️ {dayInfo.task_summary.missed} missed</div>
                        <div>🔵 {dayInfo.task_summary.pending} pending</div>
                      </div>
                      <p className="text-xs text-gray-300">
                        Phase: {dayInfo.phase.replace('_', ' ')}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>

          {/* Care Team Section */}
          <div className="mt-auto">
            <div className="p-4 border-t border-slate-700">
              <h3 className="text-white font-semibold text-xs mb-3 tracking-wider">YOUR CARE TEAM</h3>
              <div className="space-y-3">
                {/* Surgeon */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006DB1' }}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {state.patientContext?.provider_team.surgeon || 'Dr. Sarah Johnson'}
                    </div>
                    <div className="text-xs text-slate-400">Orthopedic Surgeon</div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                
                {/* Physical Therapist */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {state.patientContext?.provider_team.physical_therapist || 'Mike Chen, PT'}
                    </div>
                    <div className="text-xs text-slate-400">Physical Therapist</div>
                  </div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area - 800px max-width, centered */}
        <div className="flex-1 flex flex-col max-w-[800px] mx-auto w-full">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#006DB1' }}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">
                    {state.patientContext?.patient_name || 'Recovery Assistant'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Today • Day {state.selectedDay} • {state.patientContext?.provider_team.surgeon || "Dr. Johnson's Team"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Next Check-in
                  <span className="ml-1" style={{ color: '#006DB1' }}>2:00 PM</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  💊 Medications
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
              {state.error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{state.error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {state.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {state.typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider typing indicators */}
              {typingUsers.filter(u => u.user_type === 'provider').map((typingUser) => (
                <div key={typingUser.user_id} className="flex justify-start">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm text-purple-700">
                        {typingUser.user_name || 'Provider'} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-2xl mx-auto">
              {/* Quick Action Buttons */}
              <div className="flex justify-center space-x-2 mb-3">
                <Button size="sm" variant="outline" className="text-xs">
                  I&apos;m doing well
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  I need help
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Question about medication
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => {
                    setInputValue("I need urgent help from a provider");
                    handleSendMessage();
                  }}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Request Provider Help
                </Button>
              </div>
              
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={
                      state.selectedDay === state.currentDay
                        ? "Type your message..."
                        : "Viewing past conversation"
                    }
                    disabled={state.selectedDay !== state.currentDay || isSubmitting}
                    className="resize-none border-2 border-gray-200 focus:border-blue-600 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || state.selectedDay !== state.currentDay || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                {state.selectedDay !== state.currentDay && (
                  <p className="text-xs text-gray-500">
                    You are viewing a past conversation. Return to today to continue chatting.
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500 ml-auto">
                  <span>Your care team is notified of important health concerns</span>
                  <Button size="sm" variant="ghost" className="text-xs p-1">
                    📋 Medical records
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isPatient = message.sender_type === 'patient';
  const isAI = message.source === 'ai' || message.sender_type === 'ai_assistant';
  const isProvider = message.source === 'provider' || message.sender_type === 'provider';
  const isUrgent = message.priority === 'urgent' || message.priority === 'emergency';

  return (
    <div className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-lg ${isPatient ? 'order-2' : 'order-1'}`}>
        {/* Sender info for non-patient messages */}
        {!isPatient && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isAI ? 'bg-emerald-500' :
              isProvider ? 'bg-purple-600' :
              'bg-blue-600'
            }`}>
              {isAI ? (
                <Bot className="h-3 w-3 text-white" />
              ) : isProvider ? (
                <Shield className="h-3 w-3 text-white" />
              ) : (
                <User className="h-3 w-3 text-white" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {isAI ? 'Recovery Assistant' :
               isProvider ? (message.provider_name || 'Healthcare Provider') :
               'System'}
            </span>
            {isProvider && (
              <span className="text-xs text-purple-600 font-medium">
                • Provider Response
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
            {message.delivered_at && !message.read_at && (
              <span className="text-xs text-gray-400">✓</span>
            )}
            {message.read_at && (
              <span className="text-xs text-blue-600">✓✓</span>
            )}
          </div>
        )}

        {/* Urgent indicator */}
        {isUrgent && !isPatient && (
          <div className="flex items-center space-x-1 mb-2 px-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-600">
              {message.priority === 'emergency' ? 'EMERGENCY' : 'URGENT'}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isPatient
              ? 'bg-blue-600 text-white'
              : isProvider
              ? 'bg-purple-50 border-2 border-purple-200 text-gray-900'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          {/* Provider badge inside message */}
          {isProvider && (
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-purple-100">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">
                Personal message from your care team
              </span>
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Message metadata - buttons, tasks, etc. */}
          {message.metadata?.buttons && (
            <div className="mt-3 space-y-2">
              {message.metadata.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.style === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full text-xs"
                  disabled={button.disabled}
                >
                  {button.text}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp for patient messages */}
        {isPatient && (
          <div className="text-xs text-gray-400 mt-1 text-right px-1">
            {new Date(message.created_at).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
};