"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/design-system/Button';
import { Input } from '@/components/ui/design-system/Input';
import { Card } from '@/components/ui/design-system/Card';
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { colors, spacing } from '@/lib/design-system/constants';

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
  status: 'pending' | 'completed' | 'skipped';
  day: number;
}

interface ManusStyleChatProps {
  patientId?: string;
  conversationId?: string;
  isProvider?: boolean;
  tenantId?: string;
}

export default function ManusStyleChat({ 
  patientId, 
  conversationId, 
  isProvider = false, 
  tenantId 
}: ManusStyleChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [recoveryDay, setRecoveryDay] = useState(0);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (currentConversationId) {
      loadConversation();
      setupRealtime();
    } else if (patientId) {
      initializeConversation();
    }
  }, [currentConversationId, patientId]);

  const getCurrentRecoveryDay = (surgeryDate?: string) => {
    if (!surgeryDate) return 1;
    const today = new Date();
    const surgery = new Date(surgeryDate);
    const diffTime = Math.abs(today.getTime() - surgery.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const loadConversation = async () => {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at');
      
      setMessages(messages || []);
      checkPendingTasks();
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const initializeConversation = async () => {
    try {
      // Get patient info first
      const { data: patient } = await supabase
        .from('patients')
        .select('*, profiles(*)')
        .eq('user_id', patientId)
        .single();

      if (!patient) return;

      setPatientInfo(patient);
      const daysSinceSurgery = getCurrentRecoveryDay(patient.surgery_date);
      setRecoveryDay(daysSinceSurgery);

      // Load today's tasks
      loadTodaysTasks(patient.id, daysSinceSurgery);

      // Create new conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          patient_id: patient.id,
          tenant_id: tenantId || patient.tenant_id,
          title: 'Daily Check-in',
          conversation_type: 'general',
          status: 'active'
        })
        .select()
        .single();

      if (conversation) {
        setCurrentConversationId(conversation.id);
        
        // Start with welcome message
        await sendSystemMessage(
          `👋 Hi ${patient.profiles?.first_name || 'there'}! Ready to start your check-in for day ${daysSinceSurgery}?`,
          'system',
          {
            buttons: [
              { text: "Yes, let's start!", action: 'start_checkin' },
              { text: "Not right now", action: 'postpone' }
            ]
          }
        );
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const loadTodaysTasks = async (patientId: string, recoveryDay: number) => {
    // Mock tasks for demo - in production, these would come from the database
    const mockTasks: Task[] = [
      { id: '1', title: 'Pain Assessment', type: 'form', status: 'pending', day: recoveryDay },
      { id: '2', title: 'Ankle Pumps Exercise', type: 'exercise', status: 'pending', day: recoveryDay },
      { id: '3', title: 'Walking Exercise', type: 'exercise', status: 'pending', day: recoveryDay },
      { id: '4', title: 'Recovery Tips Video', type: 'video', status: 'pending', day: recoveryDay }
    ];
    setTodaysTasks(mockTasks);
  };

  const checkPendingTasks = async () => {
    if (!patientId) return;

    try {
      const { data: tasks } = await supabase
        .from('patient_tasks')
        .select(`
          *,
          exercises(*),
          forms(*)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'assigned')
        .limit(1);

      if (tasks && tasks.length > 0) {
        setCurrentTask(tasks[0]);
      }
    } catch (error) {
      console.error('Error checking pending tasks:', error);
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

  const sendMessage = async (content: string, messageType: string = 'user', metadata: any = {}) => {
    if (!currentConversationId) return;

    const message = {
      conversation_id: currentConversationId,
      patient_id: patientId,
      tenant_id: tenantId,
      content,
      message_type: messageType,
      sender_type: messageType,
      metadata,
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      // If user message and not provider, trigger AI response
      if (messageType === 'user' && !isProvider) {
        handleAIResponse(content);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendSystemMessage = async (content: string, messageType: string = 'system', metadata: any = {}) => {
    return await sendMessage(content, messageType, metadata);
  };

  const handleAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const context = {
        recoveryDay,
        patientId,
        recentMessages: messages.slice(-5)
      };
      
      const response = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context,
          patientId,
          currentTask
        })
      });

      if (!response.ok) {
        throw new Error('AI API error');
      }

      const { reply, actions } = await response.json();
      
      await sendSystemMessage(reply, 'ai', { actions });
      
      if (actions) {
        handleAIActions(actions);
      }
      
    } catch (error) {
      console.error('AI response error:', error);
      await sendSystemMessage(
        "I'm having trouble responding right now. A care team member will be with you shortly.",
        'system'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleAIActions = async (actions: any[]) => {
    for (const action of actions) {
      switch (action.type) {
        case 'escalate_to_provider':
          await escalateToProvider(action.reason, action.data);
          break;
        case 'complete_task':
          await completeTask(action.taskId);
          break;
        default:
          console.log('Unknown action:', action);
      }
    }
  };

  const escalateToProvider = async (reason: string, data: any) => {
    try {
      await supabase
        .from('alerts')
        .insert({
          patient_id: patientId,
          tenant_id: tenantId,
          alert_type: reason,
          severity: 'high',
          message: `Patient needs attention: ${reason}`,
          metadata: data,
          status: 'active'
        });
    } catch (error) {
      console.error('Error escalating to provider:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      await supabase
        .from('patient_tasks')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', taskId);

      // Update local tasks
      setTodaysTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: 'completed' as const } : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleButtonClick = async (action: string, data: any = {}) => {
    await sendMessage(`Selected: ${data.text || action}`, 'user');

    switch (action) {
      case 'start_checkin':
        await startDailyCheckin();
        break;
      case 'complete_exercise':
        await handleExerciseCompletion(data);
        break;
      case 'fill_form':
        setShowInlineForm(true);
        setFormData({ formId: data.formId, fields: data.fields });
        break;
      case 'report_pain':
        await handlePainReport(data);
        break;
      case 'request_help':
        await requestProviderHelp();
        break;
      case 'postpone':
        await sendSystemMessage(
          "No problem! I'll check back with you later. Feel free to start whenever you're ready.",
          'system'
        );
        break;
      default:
        await handleAIResponse(action);
    }
  };

  const startDailyCheckin = async () => {
    await sendSystemMessage(
      "Great! Let's start with your pain level. On a scale of 1-10, how would you rate your pain today?",
      'system',
      {
        buttons: Array.from({length: 10}, (_, i) => ({
          text: `${i + 1}`,
          action: 'report_pain',
          painLevel: i + 1
        }))
      }
    );
  };

  const handlePainReport = async (data: any) => {
    const painLevel = data.painLevel;
    
    try {
      await supabase
        .from('pain_reports')
        .insert({
          patient_id: patientId,
          tenant_id: tenantId,
          pain_level: painLevel,
          reported_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing pain report:', error);
    }

    if (painLevel >= 8) {
      await sendSystemMessage(
        `I see you're experiencing significant pain (${painLevel}/10). I'm alerting your care team right away. In the meantime, is this pain different from what you've been experiencing?`,
        'system',
        {
          buttons: [
            { text: "Yes, it's different", action: 'describe_pain_change' },
            { text: "No, same as usual", action: 'usual_pain' },
            { text: "I need help now", action: 'emergency_help' }
          ]
        }
      );
      
      await escalateToProvider('high_pain_level', { painLevel });
    } else if (painLevel >= 6) {
      await sendSystemMessage(
        `Thanks for reporting your pain level (${painLevel}/10). Let me check on your exercises for today. Have you completed your ankle pumps?`,
        'system',
        {
          buttons: [
            { text: "Yes, completed", action: 'complete_exercise', exerciseId: '2' },
            { text: "Not yet", action: 'exercise_reminder' },
            { text: "Having trouble", action: 'exercise_help' }
          ]
        }
      );
    } else {
      await sendSystemMessage(
        `That's great that your pain is manageable (${painLevel}/10)! Let's continue with your exercises. Have you done your ankle pumps today?`,
        'system',
        {
          buttons: [
            { text: "Yes, completed", action: 'complete_exercise', exerciseId: '2' },
            { text: "Not yet", action: 'exercise_reminder' },
            { text: "I'll do them now", action: 'start_exercise' }
          ]
        }
      );
    }
  };

  const handleExerciseCompletion = async (data: any) => {
    const exerciseId = data.exerciseId;
    
    // Mark task as completed
    setTodaysTasks(prev => 
      prev.map(task => 
        task.id === exerciseId ? { ...task, status: 'completed' as const } : task
      )
    );

    await sendSystemMessage(
      "Excellent work! Regular exercises are crucial for your recovery. How did you feel during the exercise?",
      'system',
      {
        buttons: [
          { text: "Felt good", action: 'exercise_good' },
          { text: "Some discomfort", action: 'exercise_discomfort' },
          { text: "Too painful", action: 'exercise_painful' }
        ]
      }
    );
  };

  const requestProviderHelp = async () => {
    await sendSystemMessage(
      "I'm connecting you with a care team member. They'll be able to help you shortly. Is this urgent?",
      'system',
      {
        buttons: [
          { text: "Yes, urgent", action: 'urgent_help' },
          { text: "No, can wait", action: 'routine_help' }
        ]
      }
    );
    
    await escalateToProvider('patient_requested_help', { timestamp: new Date().toISOString() });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), isProvider ? 'provider' : 'user');
      setInputValue('');
    }
  };

  {/* <thinking>
  Visual Design: Manus-style chat with 280px sidebar using new design system colors
  Healthcare Context: Recovery journey management with real-time chat support
  UX Design: Clean three-panel layout with task tracking and conversation
  </thinking> */}

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar - 280px */}
      <div className="w-[280px] bg-white border-r border-gray-300 flex flex-col">
        {/* Patient/User Info */}
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-600">
              <AvatarFallback className="text-white">
                {patientInfo?.profiles?.first_name?.[0] || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {patientInfo?.profiles?.first_name || 'Patient'} {patientInfo?.profiles?.last_name || ''}
              </h3>
              <p className="text-sm text-gray-600">Day {recoveryDay} Post-Op</p>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Today&apos;s Tasks</h4>
            <div className="space-y-2">
              {todaysTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    task.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.type === 'form' && <FileText className="h-4 w-4 text-blue-600" />}
                      {task.type === 'exercise' && <Activity className="h-4 w-4 text-blue-600" />}
                      {task.type === 'video' && <Calendar className="h-4 w-4 text-blue-600" />}
                      {task.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    </div>
                    {task.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recovery Progress</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pain Trend</span>
                <Badge variant="outline" className="bg-green-50">Improving</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Exercises</span>
                <span className="text-sm font-medium">3/4 today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Next Check-in</span>
                <span className="text-sm font-medium">Tomorrow 9AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Actions (if provider view) */}
        {isProvider && (
          <div className="p-4 border-t border-gray-300">
            <Button 
              className="w-full"
              variant="primary"
              onClick={() => escalateToProvider('provider_escalation', {})}
            >
              Escalate to Specialist
            </Button>
          </div>
        )}
      </div>

      {/* Main Chat Area - 800px centered */}
      <div className="flex-1 flex justify-center bg-gray-50">
        <div className="w-[800px] bg-white flex flex-col shadow-sm">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-300 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    TJV Recovery Assistant
                  </h2>
                  <p className="text-sm text-gray-600">
                    Always here to help with your recovery
                  </p>
                </div>
              </div>
              {isProvider && (
                <Badge className="bg-green-100 text-green-800">
                  Provider View
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
                  isProvider={isProvider}
                  onButtonClick={handleButtonClick}
                />
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Inline Form */}
          {showInlineForm && (
            <div className="border-t border-gray-300 p-4 bg-gray-50 flex-shrink-0">
              <InlineForm 
                formData={formData}
                onSubmit={(responses) => {
                  // Handle form submission
                  setShowInlineForm(false);
                  sendSystemMessage("Thank you for completing the assessment. Your responses have been recorded.", 'system');
                }}
                onCancel={() => setShowInlineForm(false)}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-300 p-4 flex-shrink-0">
            <div className="flex space-x-3">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={showInlineForm}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || showInlineForm}
                size="sm"
                variant="primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
const MessageBubble = ({ message, isProvider, onButtonClick }: {
  message: Message;
  isProvider: boolean;
  onButtonClick: (action: string, data: any) => void;
}) => {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system' || message.message_type === 'ai';
  const isProviderMessage = message.message_type === 'provider';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <Avatar className={`h-8 w-8 ${isUser ? 'bg-gray-500' : 'bg-blue-600'}`}>
          <AvatarFallback className="text-white text-xs">
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser ? 'bg-blue-600 text-white' :
            isProviderMessage ? 'bg-green-100 text-green-900 border border-green-200' :
            'bg-gray-100 text-gray-900'
          }`}>
            {isProviderMessage && (
              <div className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Care Team Member
              </div>
            )}
            
            <div className="text-sm leading-relaxed">{message.content}</div>
            
            {/* Action Buttons */}
            {message.metadata?.buttons && (
              <div className="mt-3 space-y-2">
                {message.metadata.buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => onButtonClick(button.action, button)}
                    className="block w-full text-left px-3 py-2 text-xs bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
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

// Inline Form Component
const InlineForm = ({ formData, onSubmit, onCancel }: {
  formData: any;
  onSubmit: (responses: any) => void;
  onCancel: () => void;
}) => {
  const [responses, setResponses] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
  };

  // Mock form fields for demo
  const mockFields = [
    { name: 'pain_location', label: 'Where is your pain located?', type: 'select', 
      options: ['Surgical site', 'Knee', 'Hip', 'Back', 'Other'], required: true },
    { name: 'pain_quality', label: 'How would you describe your pain?', type: 'select', 
      options: ['Sharp', 'Dull', 'Throbbing', 'Burning', 'Aching'], required: true },
    { name: 'notes', label: 'Any additional notes?', type: 'text', required: false }
  ];

  return (
    <Card className="border-blue-200">
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-4">Pain Assessment</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mockFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'text' && (
                <Input
                  type="text"
                  value={responses[field.name] || ''}
                  onChange={(e) => setResponses((prev: any) => ({
                    ...prev,
                    [field.name]: e.target.value
                  }))}
                  required={field.required}
                />
              )}
              
              {field.type === 'select' && (
                <select
                  value={responses[field.name] || ''}
                  onChange={(e) => setResponses((prev: any) => ({
                    ...prev,
                    [field.name]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
          
          <div className="flex space-x-3 pt-4">
            <Button type="submit" variant="primary">
              Submit
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};