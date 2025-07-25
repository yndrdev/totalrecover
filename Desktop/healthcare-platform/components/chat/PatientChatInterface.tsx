"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/design-system/Button';
import { Input } from '@/components/ui/design-system/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/design-system/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Calendar,
  FileText,
  Heart,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  User,
  Bot,
  Loader2,
  Bell,
  Circle,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';

{/* <thinking>
Healthcare Context: Patient chat interface for recovery communication
- Update all old TJV colors to new design system
- Maintain HIPAA-compliant communication channel
- Clear visual hierarchy for recovery timeline
- Professional medical interface appearance
- Accessibility for patient interaction
</thinking> */}

interface Message {
  id: string;
  conversation_id: string;
  patient_id?: string;
  content: string;
  message_type: 'user' | 'ai' | 'system' | 'provider';
  metadata?: {
    buttons?: Array<{
      text: string;
      action: string;
      [key: string]: any;
    }>;
    actions?: Array<{
      type: string;
      [key: string]: any;
    }>;
  };
  created_at: string;
  sender_type?: string;
}

interface Task {
  id: string;
  title: string;
  type: 'form' | 'exercise' | 'video' | 'message';
  status: 'pending' | 'completed' | 'skipped' | 'ready';
  day: number;
  description?: string;
  isAvailable: boolean;
  hasNotification?: boolean;
}

interface DayInfo {
  day: number;
  date: Date;
  hasCompletedTasks: boolean;
  hasPendingTasks: boolean;
  hasMissedTasks: boolean;
  hasNotifications: boolean;
  taskCount: {
    total: number;
    completed: number;
    pending: number;
    missed: number;
  };
}

interface WeekInfo {
  weekNumber: number;
  startDay: number;
  endDay: number;
  days: DayInfo[];
  hasNotifications: boolean;
}

interface PatientChatInterfaceProps {
  patientId?: string;
  conversationId?: string;
  tenantId?: string;
}

export default function PatientChatInterface({ 
  patientId, 
  conversationId, 
  tenantId 
}: PatientChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [recoveryDay, setRecoveryDay] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weeks, setWeeks] = useState<WeekInfo[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [showPreviousDays, setShowPreviousDays] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize patient data and weeks
  useEffect(() => {
    if (patientId) {
      initializePatientData();
    }
  }, [patientId]);

  // Initialize conversation on load
  useEffect(() => {
    if (currentConversationId && patientId) {
      loadConversation();
      setupRealtime();
    }
  }, [currentConversationId, patientId]);

  const initializePatientData = async () => {
    try {
      console.log('Starting initializePatientData for patientId:', patientId);
      setIsLoading(true);
      setError(null);
      
      // Get real patient data from database
      const { data: patient, error } = await supabase
        .from('patients')
        .select(`
          *,
          profiles:user_profiles!patients_user_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('user_id', patientId)
        .single();

      console.log('Patient query result:', { patient, error });

      if (error || !patient) {
        console.error('Error loading patient:', error);
        setError('Unable to load patient data. Please refresh the page or contact support.');
        setIsLoading(false);
        return;
      }

      setPatientInfo(patient);
      
      // Calculate recovery day from actual surgery date
      const surgeryDate = patient.surgery_date ? new Date(patient.surgery_date) : new Date();
      console.log('Surgery date:', surgeryDate);
      
      const today = new Date();
      const daysSinceSurgery = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
      const actualRecoveryDay = daysSinceSurgery + 45; // Recovery timeline starts at Day -45
      
      console.log('Days since surgery:', daysSinceSurgery, 'Recovery day:', actualRecoveryDay);
      setRecoveryDay(actualRecoveryDay);
      setSelectedDay(actualRecoveryDay);

      // Generate week structure (-45 to +200 days)
      const weeksData = await generateWeeks(surgeryDate, actualRecoveryDay, patient.id);
      console.log('Generated weeks:', weeksData.length);
      setWeeks(weeksData);

      // Find current week
      const currentWeek = weeksData.find(week =>
        week.startDay <= actualRecoveryDay && week.endDay >= actualRecoveryDay
      );
      if (currentWeek) {
        setSelectedWeek(currentWeek.weekNumber);
        console.log('Current week:', currentWeek.weekNumber);
      }

      // Check for existing conversation or create new one
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        console.log('Found existing conversation:', conversations[0].id);
        setCurrentConversationId(conversations[0].id);
      } else {
        // Create new conversation
        console.log('Creating new conversation');
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            patient_id: patient.id,
            tenant_id: patient.tenant_id,
            title: `Day ${actualRecoveryDay} Check-in`,
            conversation_type: 'general',
            status: 'active'
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          setError('Unable to create conversation. Please refresh the page.');
          setIsLoading(false);
          return;
        }

        if (newConversation) {
          console.log('Created new conversation:', newConversation.id);
          setCurrentConversationId(newConversation.id);
        }
      }

      // Load messages and tasks for selected day
      await loadDayData(actualRecoveryDay);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing patient data:', error);
      setError('An unexpected error occurred. Please refresh the page.');
      setIsLoading(false);
    }
  };

  const loadConversation = async () => {
    if (!currentConversationId) return;
    
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at');
      
      if (messages) {
        setMessages(messages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const setupRealtime = () => {
    if (!currentConversationId) return;

    const channel = supabase
      .channel(`conversation-${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const generateWeeks = async (surgeryDate: Date, currentDay: number, patientId: string): Promise<WeekInfo[]> => {
    try {
      // Fetch all tasks for the patient
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('task_date');

      if (error) throw error;

      // Create a map to track tasks by day
      const tasksByDay = new Map<number, {
        total: number;
        completed: number;
        pending: number;
        missed: number;
        hasNotifications: boolean;
      }>();

      // Process tasks to count by day
      tasks?.forEach(task => {
        const taskDate = new Date(task.task_date);
        const daysSince = Math.floor((taskDate.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!tasksByDay.has(daysSince)) {
          tasksByDay.set(daysSince, {
            total: 0,
            completed: 0,
            pending: 0,
            missed: 0,
            hasNotifications: false
          });
        }
        
        const dayTasks = tasksByDay.get(daysSince)!;
        dayTasks.total++;
        
        if (task.status === 'completed') {
          dayTasks.completed++;
        } else if (task.status === 'pending' && daysSince === currentDay) {
          dayTasks.pending++;
          dayTasks.hasNotifications = true;
        } else if (task.status === 'pending' && daysSince < currentDay) {
          dayTasks.missed++;
        }
      });

      const weeks: WeekInfo[] = [];
      let weekNumber = 1;

      // Pre-surgery weeks (-45 to -1)
      for (let startDay = -45; startDay < 0; startDay += 7) {
        const endDay = Math.min(startDay + 6, -1);
        const weekDays: DayInfo[] = [];

        for (let day = startDay; day <= endDay; day++) {
          const date = new Date(surgeryDate);
          date.setDate(date.getDate() + day);

          const dayTaskInfo = tasksByDay.get(day) || {
            total: 0,
            completed: 0,
            pending: 0,
            missed: 0,
            hasNotifications: false
          };

          weekDays.push({
            day,
            date,
            hasCompletedTasks: dayTaskInfo.completed > 0,
            hasPendingTasks: dayTaskInfo.pending > 0,
            hasMissedTasks: dayTaskInfo.missed > 0,
            hasNotifications: dayTaskInfo.hasNotifications && day <= currentDay,
            taskCount: dayTaskInfo
          });
        }

        weeks.push({
          weekNumber,
          startDay,
          endDay,
          days: weekDays,
          hasNotifications: weekDays.some(d => d.hasNotifications)
        });
        weekNumber++;
      }

      // Post-surgery weeks (0 to 200+)
      for (let startDay = 0; startDay <= 200; startDay += 7) {
        const endDay = Math.min(startDay + 6, 200);
        const weekDays: DayInfo[] = [];

        for (let day = startDay; day <= endDay; day++) {
          const date = new Date(surgeryDate);
          date.setDate(date.getDate() + day);

          const dayTaskInfo = tasksByDay.get(day) || {
            total: 0,
            completed: 0,
            pending: 0,
            missed: 0,
            hasNotifications: false
          };

          weekDays.push({
            day,
            date,
            hasCompletedTasks: dayTaskInfo.completed > 0,
            hasPendingTasks: dayTaskInfo.pending > 0,
            hasMissedTasks: dayTaskInfo.missed > 0,
            hasNotifications: dayTaskInfo.hasNotifications && day <= currentDay,
            taskCount: dayTaskInfo
          });
        }

        weeks.push({
          weekNumber,
          startDay,
          endDay,
          days: weekDays,
          hasNotifications: weekDays.some(d => d.hasNotifications)
        });
        weekNumber++;
      }

      return weeks;
    } catch (error) {
      console.error('Error generating weeks:', error);
      return [];
    }
  };

  const loadDayData = async (day: number) => {
    setSelectedDay(day);
    
    // Load tasks for the day
    const tasks = await generateTasksForDay(day, patientInfo?.id);
    setDayTasks(tasks);

    // Load messages for the day
    await loadMessagesForDay(day);
  };

  const generateTasksForDay = async (day: number, patientId?: string): Promise<Task[]> => {
    // Don't show future tasks
    if (day > recoveryDay || !patientId) {
      return [];
    }

    try {
      const surgeryDate = patientInfo?.surgery_date ? new Date(patientInfo.surgery_date) : new Date();
      const targetDate = new Date(surgeryDate);
      targetDate.setDate(targetDate.getDate() + day);
      
      // Fetch tasks for the specific day
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('task_date', targetDate.toISOString().split('T')[0])
        .order('created_at');

      if (error) throw error;

      // Map database tasks to UI format
      return tasks?.map((task, index) => {
        // Determine task type from content_data
        let type: 'form' | 'exercise' | 'video' | 'message' = 'message';
        if (task.task_type === 'form') type = 'form';
        else if (task.task_type === 'exercise') type = 'exercise';
        else if (task.task_type === 'video') type = 'video';
        
        // Determine status based on completion
        let status: 'pending' | 'completed' | 'skipped' | 'ready' = 'pending';
        if (task.status === 'completed') {
          status = 'completed';
        } else if (task.status === 'skipped') {
          status = 'skipped';
        } else if (day === recoveryDay && index === 0) {
          status = 'ready';
        }

        return {
          id: task.id,
          title: task.title || 'Recovery Task',
          type,
          status,
          day,
          description: task.content_data?.description || '',
          isAvailable: day <= recoveryDay,
          hasNotification: day === recoveryDay && index === 0 && status === 'ready'
        };
      }) || [];
    } catch (error) {
      console.error('Error loading tasks for day:', error);
      return [];
    }
  };

  const loadMessagesForDay = async (day: number) => {
    if (!currentConversationId || !patientInfo) return;
    
    try {
      const surgeryDate = new Date(patientInfo.surgery_date);
      const targetDate = new Date(surgeryDate);
      targetDate.setDate(targetDate.getDate() + day);
      
      // Get messages for the specific day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at');

      if (error) throw error;

      if (messages && messages.length > 0) {
        setMessages(messages);
      } else if (day === recoveryDay) {
        // If no messages for today, create initial greeting
        const welcomeMessage = {
          conversation_id: currentConversationId,
          patient_id: patientInfo.id,
          content: `Good morning! Ready to start your day ${day} recovery check-in?`,
          message_type: 'system',
          metadata: {
            buttons: [
              { text: "Yes, let's start!", action: 'start_checkin' },
              { text: "Give me a few minutes", action: 'postpone' }
            ]
          }
        };

        const { data: newMessage } = await supabase
          .from('messages')
          .insert(welcomeMessage)
          .select()
          .single();

        if (newMessage) {
          setMessages([newMessage]);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages for day:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && selectedDay === recoveryDay) {
      sendMessage(inputValue.trim(), 'user');
      setInputValue('');
    }
  };

  const sendMessage = async (content: string, messageType: string = 'user', metadata: any = {}) => {
    if (!currentConversationId || !patientInfo) return;

    try {
      // Save message to database
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          patient_id: patientInfo.id,
          content,
          message_type: messageType,
          sender_type: messageType,
          metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Add message to UI immediately (realtime will also add it)
      if (newMessage) {
        setMessages(prev => {
          // Avoid duplicates from realtime
          const exists = prev.some(m => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }

      // Get AI response for user messages
      if (messageType === 'user') {
        setIsTyping(true);
        
        try {
          // Get recent messages for context
          const recentMessages = messages.slice(-10);
          
          // Get patient's current tasks
          const currentTasks = dayTasks.filter(t => t.status === 'pending' || t.status === 'ready');
          
          const response = await fetch('/api/chat/ai-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: currentConversationId,
              messages: [...recentMessages, newMessage].map(m => ({
                role: m.message_type === 'user' ? 'user' : 'assistant',
                content: m.content
              })),
              patientContext: {
                daysSinceSurgery: recoveryDay,
                currentTasks: currentTasks.map(t => ({
                  title: t.title,
                  type: t.type,
                  status: t.status,
                  description: t.description
                })),
                patientName: `${patientInfo.profiles?.first_name || 'Patient'} ${patientInfo.profiles?.last_name || ''}`
              }
            })
          });

          if (!response.ok) throw new Error('AI response failed');

          const data = await response.json();
          
          // Save AI response to database
          const { data: aiMessage } = await supabase
            .from('messages')
            .insert({
              conversation_id: currentConversationId,
              patient_id: patientInfo.id,
              content: data.content,
              message_type: 'ai',
              sender_type: 'ai',
              metadata: data.metadata
            })
            .select()
            .single();

          if (aiMessage) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === aiMessage.id);
              return exists ? prev : [...prev, aiMessage];
            });
          }
        } catch (error) {
          console.error('Error getting AI response:', error);
          // Fallback response
          const fallbackResponse = {
            conversation_id: currentConversationId,
            patient_id: patientInfo.id,
            content: "I apologize, but I'm having trouble processing your message right now. Please try again or contact your care team if you need immediate assistance.",
            message_type: 'system',
            metadata: {}
          };
          
          const { data: fallbackMessage } = await supabase
            .from('messages')
            .insert(fallbackResponse)
            .select()
            .single();
            
          if (fallbackMessage) {
            setMessages(prev => [...prev, fallbackMessage]);
          }
        } finally {
          setIsTyping(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleButtonClick = async (action: string, data: any = {}) => {
    await sendMessage(`Selected: ${data.text || action}`, 'user');

    switch (action) {
      case 'start_checkin':
        await sendMessage(
          "Let's begin with your pain assessment. On a scale of 1-10, how would you rate your pain today?",
          'system',
          {
            buttons: Array.from({length: 10}, (_, i) => ({
              text: `${i + 1}`,
              action: 'report_pain',
              painLevel: i + 1
            }))
          }
        );
        break;
      
      case 'report_pain':
        const painLevel = data.painLevel;
        await sendMessage(
          `Thank you for reporting your pain level as ${painLevel}/10. ${
            painLevel <= 3 ? "That's great progress!" :
            painLevel <= 6 ? "Let's work on managing that discomfort." :
            "I understand you're experiencing significant pain. Let's discuss pain management strategies."
          } Now, let's review your exercises for today.`,
          'system'
        );
        
        // Update patient's pain level in database if needed
        if (patientInfo) {
          await supabase
            .from('patient_progress')
            .insert({
              patient_id: patientInfo.id,
              progress_date: new Date().toISOString(),
              pain_level: painLevel,
              progress_type: 'pain_assessment'
            });
        }
        break;
      
      case 'complete_exercise':
        // Mark task as completed in database
        const exerciseId = data.exerciseId;
        const taskToComplete = dayTasks.find(t =>
          t.title.toLowerCase().includes(exerciseId?.replace('-', ' ') || '')
        );
        
        if (taskToComplete && patientInfo) {
          // Update task status in database
          await supabase
            .from('tasks')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', taskToComplete.id);
          
          // Update local state
          setDayTasks(prev =>
            prev.map(task =>
              task.id === taskToComplete.id
                ? { ...task, status: 'completed' as const, hasNotification: false }
                : task
            )
          );
          
          await sendMessage("Excellent work! Regular exercises are key to your recovery. Keep up the great progress!", 'system');
        }
        break;
      
      case 'exercise_reminder':
        await sendMessage(
          "No problem! Would you like me to remind you in 30 minutes to complete your exercises?",
          'system',
          {
            buttons: [
              { text: "Yes, remind me in 30 minutes", action: 'set_reminder', duration: 30 },
              { text: "Remind me in 1 hour", action: 'set_reminder', duration: 60 },
              { text: "I'll do them now", action: 'start_exercises' }
            ]
          }
        );
        break;
        
      case 'exercise_help':
        await sendMessage(
          "I understand you're having difficulty with the exercises. What specific challenge are you facing?",
          'system',
          {
            buttons: [
              { text: "Too much pain", action: 'report_exercise_pain' },
              { text: "Don't understand the exercise", action: 'request_video_demo' },
              { text: "Physical limitation", action: 'report_limitation' }
            ]
          }
        );
        break;
      
      case 'postpone':
        await sendMessage(
          "No problem! I'll check back with you in a little while. Remember, consistency is key to your recovery. When you're ready, just let me know!",
          'system'
        );
        break;
      
      default:
        // Let AI handle other actions
        break;
    }
  };

  const togglePreviousDays = () => {
    setShowPreviousDays(!showPreviousDays);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your recovery chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <Card className="max-w-md p-6">
          <CardContent className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Chat</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-64px)] bg-gray-50">
        {/* Sidebar - 280px with week view */}
        <div className="w-[280px] bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-primary-navy">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary border-2 border-primary-light">
                <AvatarFallback className="text-white font-semibold">
                  {patientInfo?.profiles?.first_name?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">
                  {patientInfo?.profiles?.first_name || 'Patient'} {patientInfo?.profiles?.last_name || ''}
                </h3>
                <p className="text-sm text-primary-light">Day {recoveryDay} Recovery</p>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Recovery Timeline</h4>
              <Button
                size="sm"
                variant="secondary"
                onClick={togglePreviousDays}
                className="text-xs text-primary hover:bg-primary-light/10 transition-colors"
              >
                {showPreviousDays ? 'Hide' : 'View'} Previous Days
              </Button>
            </div>

            {/* Week Selector */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-900">
                  Week {selectedWeek}
                </p>
                <p className="text-xs text-gray-600">
                  {weeks[selectedWeek - 1] && (
                    `Day ${weeks[selectedWeek - 1].startDay} to ${weeks[selectedWeek - 1].endDay}`
                  )}
                </p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedWeek(Math.min(weeks.length, selectedWeek + 1))}
                disabled={selectedWeek === weeks.length}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Return to Current Day */}
            {selectedDay !== recoveryDay && (
              <Button
                size="sm"
                variant="primary"
                className="w-full"
                onClick={() => {
                  loadDayData(recoveryDay);
                  const currentWeek = weeks.find(w => 
                    w.startDay <= recoveryDay && w.endDay >= recoveryDay
                  );
                  if (currentWeek) {
                    setSelectedWeek(currentWeek.weekNumber);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Today
              </Button>
            )}
          </div>

          {/* Days in Week */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {weeks[selectedWeek - 1]?.days.map(dayInfo => {
                const isCurrentDay = dayInfo.day === recoveryDay;
                const isSelectedDay = dayInfo.day === selectedDay;
                const isFutureDay = dayInfo.day > recoveryDay;
                const canView = !isFutureDay || showPreviousDays;

                return (
                  <Tooltip key={dayInfo.day}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => canView && loadDayData(dayInfo.day)}
                        disabled={!canView}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isSelectedDay 
                            ? 'bg-primary text-white shadow-md' 
                            : isCurrentDay
                            ? 'bg-primary-light/10 border-2 border-primary'
                            : canView
                            ? 'bg-gray-50 hover:bg-primary-light/5 border border-gray-200'
                            : 'bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            Day {dayInfo.day}
                          </span>
                          <div className="flex items-center gap-1">
                            {dayInfo.hasNotifications && !isFutureDay && (
                              <div className="relative">
                                <Bell className="h-4 w-4 text-accent-orange animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-orange rounded-full" />
                              </div>
                            )}
                            {dayInfo.hasCompletedTasks && (
                              <CheckCircle className="h-4 w-4 text-secondary" />
                            )}
                            {dayInfo.hasMissedTasks && (
                              <AlertTriangle className="h-4 w-4 text-error" />
                            )}
                            {dayInfo.hasPendingTasks && !isFutureDay && (
                              <Circle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs opacity-70">
                          {dayInfo.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        {!isFutureDay && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-secondary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(dayInfo.taskCount.completed / dayInfo.taskCount.total) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {dayInfo.taskCount.completed}/{dayInfo.taskCount.total}
                            </span>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {isFutureDay ? (
                        <p>Future tasks not available</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">Day {dayInfo.day} Summary</p>
                          <p className="text-xs">✅ {dayInfo.taskCount.completed} completed</p>
                          <p className="text-xs">🔵 {dayInfo.taskCount.pending} pending</p>
                          {dayInfo.taskCount.missed > 0 && (
                            <p className="text-xs">❌ {dayInfo.taskCount.missed} missed</p>
                          )}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </ScrollArea>

          {/* Today's Tasks Summary */}
          {selectedDay === recoveryDay && (
            <div className="p-4 border-t border-gray-200 bg-primary-light/5">
              <h4 className="text-sm font-semibold text-primary-navy mb-3">Today&apos;s Tasks</h4>
              <div className="space-y-2">
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-xs">
                    {task.hasNotification && (
                      <div className="relative">
                        <Bell className="h-3 w-3 text-accent-orange animate-pulse" />
                      </div>
                    )}
                    <span className={`flex-1 ${
                      task.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.title}
                    </span>
                    {task.status === 'completed' && <Check className="h-3 w-3 text-secondary" />}
                    {task.status === 'ready' && <Circle className="h-3 w-3 text-primary fill-current" />}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-xs text-gray-500">+{dayTasks.length - 3} more tasks</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area - 800px centered */}
        <div className="flex-1 flex justify-center bg-gray-50">
          <div className="w-[800px] bg-white flex flex-col shadow-sm">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-primary-light">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      TJV Recovery Assistant
                    </h2>
                    <p className="text-sm text-gray-600">
                      Day {selectedDay} {selectedDay === recoveryDay ? '(Today)' : selectedDay < recoveryDay ? 'History' : 'Preview'}
                    </p>
                  </div>
                </div>
                {selectedDay !== recoveryDay && (
                  <Badge variant={selectedDay < recoveryDay ? 'secondary' : 'outline'}>
                    {selectedDay < recoveryDay ? 'Past Conversation' : 'Future - View Only'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageBubble 
                    key={message.id || index}
                    message={message}
                    onButtonClick={handleButtonClick}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={selectedDay === recoveryDay ? "Type your message..." : "Viewing past conversation"}
                  className="flex-1 border-gray-200 focus:border-primary"
                  disabled={selectedDay !== recoveryDay || showInlineForm}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || selectedDay !== recoveryDay || showInlineForm}
                  size="sm"
                  variant="primary"
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {selectedDay !== recoveryDay && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {selectedDay < recoveryDay 
                    ? "This is a past conversation. Return to today to continue chatting."
                    : "Future conversations are not available yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Message Bubble Component
const MessageBubble = ({ message, onButtonClick }: {
  message: Message;
  onButtonClick: (action: string, data: any) => void;
}) => {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system' || message.message_type === 'ai';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-primary-navy' : 'bg-primary'} border-2 ${isUser ? 'border-primary' : 'border-primary-light'}`}>
          <AvatarFallback className="text-white text-xs">
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser ? 'bg-primary text-white shadow-sm' : 'bg-primary-light/10 text-gray-900 border border-primary-light/30'
          }`}>
            <div className="text-sm leading-relaxed">{message.content}</div>
            
            {/* Action Buttons */}
            {message.metadata?.buttons && (
              <div className="mt-3 space-y-2">
                {message.metadata.buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => onButtonClick(button.action, button)}
                    className={`block w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                      isUser 
                        ? 'bg-white/20 backdrop-blur text-white hover:bg-white/30'
                        : 'bg-white border border-gray-200 hover:bg-primary-light/20 hover:border-primary'
                    }`}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            isUser ? 'text-right text-gray-500' : 'text-gray-500'
          }`}>
            <Clock className="h-3 w-3" />
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};