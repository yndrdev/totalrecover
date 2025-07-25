# CLAUDE CODE PROMPT 2: MANUS-STYLE CHAT SYSTEM

## 🎯 **OBJECTIVE**
Build the core chat system that works like Manus - centered interface, starts with structured check-ins, transitions to conversational AI, with provider monitoring and real-time capabilities.

## 📋 **REQUIREMENTS OVERVIEW**

### **Chat Flow:**
1. **Auto-initiate** based on patient's recovery day and assigned tasks
2. **Structured start** - "Ready to start your check-in?" 
3. **Task-based questions** - forms, exercises, pain levels
4. **Transition to conversational** - OpenAI integration for follow-up
5. **Provider monitoring** - live view and intervention capabilities

### **Visual Design:**
- **Centered chat interface** like Manus
- **Input at bottom** with send button
- **Inline forms** for complex inputs (medications, etc.)
- **Button selections** that show as chat bubbles
- **Typing indicators** and real-time updates

## 🏗️ **IMPLEMENTATION TASKS**

### **TASK 1: Core Chat Interface Component (45 minutes)**

#### **Component: `/components/chat/ChatInterface.jsx`**
```jsx
import { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function ChatInterface({ patientId, conversationId, isProvider = false }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState({});
  
  const messagesEndRef = useRef(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and set up real-time
  useEffect(() => {
    if (conversationId) {
      loadConversation();
      setupRealtime();
    } else {
      initializeConversation();
    }
  }, [conversationId, patientId]);

  const loadConversation = async () => {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at');
    
    setMessages(messages || []);
    
    // Check if there's a pending task
    checkPendingTasks();
  };

  const initializeConversation = async () => {
    // Create new conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        patient_id: patientId,
        tenant_id: user.user_metadata.tenant_id,
        title: 'Daily Check-in',
        conversation_type: 'daily_checkin',
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (conversation) {
      // Start with welcome message
      await sendSystemMessage(
        "👋 Hi! Ready to start your check-in for today?",
        'welcome',
        {
          buttons: [
            { text: "Yes, let's start!", action: 'start_checkin' },
            { text: "Not right now", action: 'postpone' }
          ]
        }
      );
    }
  };

  const checkPendingTasks = async () => {
    // Get today's tasks for this patient
    const { data: tasks } = await supabase
      .from('patient_tasks')
      .select(`
        *,
        exercises(*),
        forms(*)
      `)
      .eq('patient_id', patientId)
      .eq('assigned_date', getCurrentRecoveryDay())
      .eq('status', 'assigned');

    if (tasks && tasks.length > 0) {
      setCurrentTask(tasks[0]);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content, messageType = 'user', metadata = {}) => {
    const message = {
      conversation_id: conversationId,
      patient_id: patientId,
      content,
      message_type: messageType,
      metadata,
      sent_at: new Date().toISOString()
    };

    const { data } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    // If user message, trigger AI response
    if (messageType === 'user' && !isProvider) {
      handleAIResponse(content);
    }

    return data;
  };

  const sendSystemMessage = async (content, messageType = 'system', metadata = {}) => {
    return await sendMessage(content, messageType, metadata);
  };

  const handleAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      // Get conversation context
      const context = await buildConversationContext();
      
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

      const { reply, actions } = await response.json();
      
      // Send AI response
      await sendSystemMessage(reply, 'ai', { actions });
      
      // Handle any actions (complete tasks, trigger forms, etc.)
      if (actions) {
        handleAIActions(actions);
      }
      
    } catch (error) {
      console.error('AI response error:', error);
      await sendSystemMessage(
        "I'm having trouble responding right now. A care team member will be with you shortly.",
        'error'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleButtonClick = async (action, data = {}) => {
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
      default:
        await handleAIResponse(action);
    }
  };

  const startDailyCheckin = async () => {
    if (currentTask) {
      if (currentTask.task_type === 'form') {
        await sendSystemMessage(
          `Let's start with your ${currentTask.forms.name}. I'll ask you a few questions.`,
          'system',
          {
            buttons: [
              { text: "Let's do it!", action: 'fill_form', formId: currentTask.forms.id }
            ]
          }
        );
      } else if (currentTask.task_type === 'exercise') {
        await sendSystemMessage(
          `Time for your ${currentTask.exercises.name}! Have you completed this exercise today?`,
          'system',
          {
            buttons: [
              { text: "Yes, completed", action: 'complete_exercise', exerciseId: currentTask.exercises.id },
              { text: "Not yet", action: 'exercise_reminder' },
              { text: "Having trouble", action: 'exercise_help' }
            ]
          }
        );
      }
    } else {
      await sendSystemMessage(
        "Great! How are you feeling today? Let's start with your pain level.",
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

  const handleInlineFormSubmit = async (formResponses) => {
    // Save form responses
    await supabase
      .from('form_responses')
      .insert({
        patient_id: patientId,
        form_id: formData.formId,
        responses: formResponses,
        status: 'completed',
        started_at: new Date().toISOString()
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
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isProvider ? 'Patient Chat Monitor' : 'Your Recovery Assistant'}
            </h2>
            <p className="text-sm text-gray-600">
              {isProvider ? 'Monitoring conversation' : `Day ${getCurrentRecoveryDay()} Check-in`}
            </p>
          </div>
          {isProvider && (
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => joinConversation()}
              >
                Join Conversation
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => escalateToProvider()}
              >
                Escalate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
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
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <InlineForm 
            formData={formData}
            onSubmit={handleInlineFormSubmit}
            onCancel={() => setShowInlineForm(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isProvider ? "Type a message to the patient..." : "Type your message..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={showInlineForm}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || showInlineForm}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );

  function handleSendMessage() {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim(), isProvider ? 'provider' : 'user');
      setInputValue('');
    }
  }
}

// Message Bubble Component
const MessageBubble = ({ message, isProvider, onButtonClick }) => {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system' || message.message_type === 'ai';
  const isProviderMessage = message.message_type === 'provider';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser ? 'bg-blue-600 text-white' :
        isProviderMessage ? 'bg-green-100 text-green-900 border border-green-200' :
        'bg-gray-100 text-gray-900'
      }`}>
        {isProviderMessage && (
          <div className="text-xs font-medium text-green-700 mb-1">
            Care Team Member
          </div>
        )}
        
        <div className="text-sm">{message.content}</div>
        
        {/* Action Buttons */}
        {message.metadata?.buttons && (
          <div className="mt-3 space-y-2">
            {message.metadata.buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => onButtonClick(button.action, button)}
                className="block w-full text-left px-3 py-2 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
        
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.sent_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Inline Form Component
const InlineForm = ({ formData, onSubmit, onCancel }) => {
  const [responses, setResponses] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(responses);
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-medium mb-4">Please fill out this form:</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.fields?.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={responses[field.name] || ''}
                onChange={(e) => setResponses(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required={field.required}
              >
                <option value="">Select...</option>
                {field.options?.map((option, i) => (
                  <option key={i} value={option}>{option}</option>
                ))}
              </select>
            )}
            {field.type === 'scale' && (
              <div className="flex space-x-2">
                {Array.from({length: field.max - field.min + 1}, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setResponses(prev => ({
                      ...prev,
                      [field.name]: field.min + i
                    }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      responses[field.name] === field.min + i
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-600'
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
          <Button type="submit" variant="primary">Submit</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};
```

### **TASK 2: AI Response API Endpoint (30 minutes)**

#### **API Route: `/pages/api/chat/ai-response.js`**
```javascript
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, patientId, currentTask } = req.body;

  try {
    // Build system prompt based on context
    const systemPrompt = buildSystemPrompt(context, currentTask);
    
    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiReply = completion.choices[0].message.content;
    
    // Determine next actions based on response
    const actions = determineActions(aiReply, currentTask, context);
    
    res.status(200).json({
      reply: aiReply,
      actions
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      reply: "I'm having trouble responding right now. Let me connect you with a care team member."
    });
  }
}

function buildSystemPrompt(context, currentTask) {
  const basePrompt = `You are a helpful recovery assistant for TJV Recovery Platform, helping patients through their joint replacement recovery journey.

CONTEXT:
- Patient is on day ${context.recoveryDay} of their ${context.surgeryType} recovery
- Current pain level: ${context.lastPainLevel || 'unknown'}
- Recent progress: ${context.recentProgress || 'none reported'}

GUIDELINES:
- Be encouraging and supportive
- Ask follow-up questions about pain, mobility, and concerns
- Suggest when to contact care team for serious issues
- Keep responses conversational but professional
- If patient reports severe pain (8+) or concerning symptoms, recommend immediate care team contact

CURRENT TASK: ${currentTask ? `Patient should complete: ${currentTask.title}` : 'No specific task'}

Respond naturally and helpfully to the patient's message.`;

  return basePrompt;
}

function determineActions(aiReply, currentTask, context) {
  const actions = [];
  
  // Check for pain level mentions
  const painMatch = aiReply.match(/pain level.*?(\d+)/i);
  if (painMatch) {
    const painLevel = parseInt(painMatch[1]);
    if (painLevel >= 8) {
      actions.push({
        type: 'escalate_to_provider',
        reason: 'high_pain_level',
        data: { painLevel }
      });
    }
  }
  
  // Check for concerning keywords
  const concerningKeywords = ['emergency', 'severe', 'can\'t move', 'infection', 'fever'];
  if (concerningKeywords.some(keyword => aiReply.toLowerCase().includes(keyword))) {
    actions.push({
      type: 'escalate_to_provider',
      reason: 'concerning_symptoms'
    });
  }
  
  // Check if task should be marked complete
  if (currentTask && aiReply.toLowerCase().includes('completed')) {
    actions.push({
      type: 'complete_task',
      taskId: currentTask.id
    });
  }
  
  return actions;
}
```

### **TASK 3: Provider Chat Monitoring Dashboard (30 minutes)**

#### **Page: `/provider/chat-monitor`**
```jsx
export default function ChatMonitor() {
  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchActiveConversations();
    fetchAlerts();
    setupRealtime();
  }, []);

  const fetchActiveConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        patients!conversations_patient_id_fkey(
          *,
          profiles!patients_user_id_fkey(first_name, last_name)
        ),
        messages(*)
      `)
      .eq('status', 'active')
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false });

    setActiveConversations(data || []);
  };

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select(`
        *,
        patients!alerts_patient_id_fkey(
          *,
          profiles!patients_user_id_fkey(first_name, last_name)
        )
      `)
      .eq('status', 'active')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    setAlerts(data || []);
  };

  return (
    <DashboardLayout title="Chat Monitor" subtitle="Real-time patient conversations">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-red-600">🚨 Active Alerts</h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100"
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="font-medium text-red-900">
                    {alert.patients.profiles.first_name} {alert.patients.profiles.last_name}
                  </div>
                  <div className="text-sm text-red-700">{alert.alert_type}</div>
                  <div className="text-xs text-red-600">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No active alerts
                </div>
              )}
            </div>
          </Card>

          {/* Active Conversations */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold mb-4">💬 Active Conversations</h3>
            <div className="space-y-2">
              {activeConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-100 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="font-medium">
                    {conversation.patients.profiles.first_name} {conversation.patients.profiles.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Day {conversation.patients.current_recovery_day}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last message: {new Date(conversation.last_message_at).toLocaleTimeString()}
                  </div>
                  {conversation.is_urgent && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mt-1">
                      Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px]">
              <ChatInterface 
                patientId={selectedConversation.patient_id}
                conversationId={selectedConversation.id}
                isProvider={true}
              />
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium">Select a conversation to monitor</div>
                <div className="text-sm">Choose from active conversations or alerts</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## 🔗 **CRITICAL INTEGRATIONS**

### **Real-time Setup:**
```javascript
// Supabase real-time for live chat
const setupChatRealtime = (conversationId) => {
  return supabase
    .channel(`conversation-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, handleNewMessage)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'alerts'
    }, handleNewAlert)
    .subscribe();
};

// Auto-initiate conversations based on recovery day
const checkForAutoInitiation = async () => {
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('status', 'active');

  for (const patient of patients) {
    const recoveryDay = calculateRecoveryDay(patient.surgery_date);
    
    // Check if patient has tasks for today
    const { data: tasks } = await supabase
      .from('patient_tasks')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('assigned_date', recoveryDay)
      .eq('status', 'assigned');

    if (tasks.length > 0) {
      // Check if conversation already exists for today
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('patient_id', patient.id)
        .gte('started_at', new Date().toDateString());

      if (!existingConversation.length) {
        // Auto-initiate conversation
        await initiateConversation(patient.id);
      }
    }
  }
};
```

## ✅ **COMPLETION CHECKLIST**

### **Chat System Core:**
- [ ] Centered chat interface like Manus
- [ ] Auto-initiation based on recovery day
- [ ] Structured check-in flow
- [ ] OpenAI integration for responses
- [ ] Real-time messaging
- [ ] Provider monitoring dashboard

### **Interactive Elements:**
- [ ] Button selections in chat
- [ ] Inline forms for complex inputs
- [ ] Pain level scales
- [ ] Typing indicators
- [ ] Message timestamps

### **Provider Features:**
- [ ] Live conversation monitoring
- [ ] Alert system for urgent issues
- [ ] Provider intervention capabilities
- [ ] Escalation workflows

**ESTIMATED TIME: 1 hour 45 minutes**
**PRIORITY: CRITICAL - Core user experience**

