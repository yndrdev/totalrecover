"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Send, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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

interface ChatInterfaceProps {
  patientId?: string;
  conversationId?: string;
  isProvider?: boolean;
  tenantId?: string;
}

export default function ChatInterface({ 
  patientId, 
  conversationId, 
  isProvider = false, 
  tenantId 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [recoveryDay, setRecoveryDay] = useState(0);
  
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
      
      // Check if there's a pending task
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

      const daysSinceSurgery = getCurrentRecoveryDay(patient.surgery_date);
      setRecoveryDay(daysSinceSurgery);

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

  const checkPendingTasks = async () => {
    if (!patientId) return;

    try {
      // Get today's tasks for this patient
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
      // Get conversation context
      const context = {
        recoveryDay,
        patientId,
        recentMessages: messages.slice(-5)
      };
      
      // Call OpenAI API
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
      
      // Send AI response
      await sendSystemMessage(reply, 'ai', { actions });
      
      // Handle any actions
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
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleButtonClick = async (action: string, data: any = {}) => {
    // Show user's selection as a message
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
    if (currentTask) {
      if (currentTask.task_type === 'form') {
        await sendSystemMessage(
          `Let's start with your ${currentTask.forms?.name || 'daily assessment'}. I'll ask you a few questions.`,
          'system',
          {
            buttons: [
              { text: "Let's do it!", action: 'fill_form', formId: currentTask.forms?.id }
            ]
          }
        );
      } else if (currentTask.task_type === 'exercise') {
        await sendSystemMessage(
          `Time for your ${currentTask.exercises?.name || 'exercise'}! Have you completed this exercise today?`,
          'system',
          {
            buttons: [
              { text: "Yes, completed", action: 'complete_exercise', exerciseId: currentTask.exercises?.id },
              { text: "Not yet", action: 'exercise_reminder' },
              { text: "Having trouble", action: 'exercise_help' }
            ]
          }
        );
      }
    } else {
      await sendSystemMessage(
        "Great! How are you feeling today? Let's start with your pain level on a scale of 1-10.",
        'system',
        {
          buttons: Array.from({length: 10}, (_, i) => ({
            text: `${i + 1}`,
            action: 'report_pain',
            painLevel: i + 1
          }))
        }
      );
    }
  };

  const handlePainReport = async (data: any) => {
    const painLevel = data.painLevel;
    
    // Store pain report
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
      
      // Auto-escalate high pain levels
      await escalateToProvider('high_pain_level', { painLevel });
    } else if (painLevel >= 6) {
      await sendSystemMessage(
        `Thanks for reporting your pain level (${painLevel}/10). How is your mobility today? Are you able to do your exercises?`,
        'system',
        {
          buttons: [
            { text: "Yes, doing well", action: 'mobility_good' },
            { text: "Some difficulty", action: 'mobility_issues' },
            { text: "Need help", action: 'request_help' }
          ]
        }
      );
    } else {
      await sendSystemMessage(
        `That's great that your pain is manageable (${painLevel}/10)! How are you feeling about your recovery progress?`,
        'system',
        {
          buttons: [
            { text: "Very positive", action: 'positive_progress' },
            { text: "Okay, some concerns", action: 'mild_concerns' },
            { text: "I have questions", action: 'ask_questions' }
          ]
        }
      );
    }
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

  const handleInlineFormSubmit = async (formResponses: any) => {
    try {
      // Save form responses
      await supabase
        .from('form_responses')
        .insert({
          patient_id: patientId,
          form_id: formData.formId,
          responses: formResponses,
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      // Mark task as completed
      if (currentTask && currentTask.form_id === formData.formId) {
        await supabase
          .from('patient_tasks')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', currentTask.id);
      }

      setShowInlineForm(false);
      setFormData({});

      await sendSystemMessage(
        "Perfect! I've recorded your responses. Is there anything else you'd like to discuss about your recovery?",
        'system',
        {
          buttons: [
            { text: "I have questions", action: 'ask_questions' },
            { text: "I'm doing well", action: 'positive_update' },
            { text: "I'm having issues", action: 'report_issues' }
          ]
        }
      );
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), isProvider ? 'provider' : 'user');
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isProvider ? 'Patient Chat Monitor' : 'Your Recovery Assistant'}
            </h2>
            <p className="text-sm text-gray-600">
              {isProvider ? 'Monitoring conversation' : `Day ${recoveryDay} Check-in`}
            </p>
          </div>
          {isProvider && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendMessage("Care team member has joined the conversation", 'system')}
              >
                Join Conversation
              </Button>
              <Button 
                size="sm"
                onClick={() => escalateToProvider('provider_escalation', {})}
              >
                Escalate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
            <div className="bg-white rounded-2xl p-4 max-w-xs shadow-sm border">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Form */}
      {showInlineForm && (
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <InlineForm 
            formData={formData}
            onSubmit={handleInlineFormSubmit}
            onCancel={() => setShowInlineForm(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-3">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isProvider ? "Type a message to the patient..." : "Type your message..."}
            className="flex-1"
            disabled={showInlineForm}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || showInlineForm}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
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
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        isUser ? 'bg-blue-600 text-white' :
        isProviderMessage ? 'bg-green-100 text-green-900 border border-green-200' :
        'bg-white text-gray-900 shadow-sm border'
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
                className="block w-full text-left px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-2 flex items-center gap-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <Clock className="h-3 w-3" />
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
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
    { name: 'pain_level', label: 'Current Pain Level (1-10)', type: 'scale', min: 1, max: 10, required: true },
    { name: 'mobility', label: 'How is your mobility today?', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
    { name: 'notes', label: 'Any additional notes?', type: 'text', required: false }
  ];

  return (
    <Card>
      <CardHeader>
        <h4 className="font-medium">Please fill out this assessment:</h4>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mockFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'text' && (
                <Input
                  type="text"
                  value={responses[field.name] || ''}
                  onChange={(e) => setResponses(prev => ({
                    ...prev,
                    [field.name]: e.target.value
                  }))}
                  className="w-full"
                  required={field.required}
                />
              )}
              
              {field.type === 'select' && (
                <select
                  value={responses[field.name] || ''}
                  onChange={(e) => setResponses(prev => ({
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
              
              {field.type === 'scale' && (
                <div className="flex space-x-2 flex-wrap">
                  {Array.from({length: field.max - field.min + 1}, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setResponses(prev => ({
                        ...prev,
                        [field.name]: field.min + i
                      }))}
                      className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                        responses[field.name] === field.min + i
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {field.min + i}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex space-x-3 pt-4">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};