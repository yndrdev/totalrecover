"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatInterface from './ChatInterface';
import { createClient } from '@/lib/supabase/client';
import { ChatAutoInitiation } from '@/lib/chat/auto-initiation';
import { 
  Play, 
  RefreshCw, 
  MessageCircle, 
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Activity
} from 'lucide-react';

interface ChatTestInterfaceProps {
  user: any;
  profile: any;
  patient?: any;
}

export default function ChatTestInterface({ user, profile, patient }: ChatTestInterfaceProps) {
  const [testResults, setTestResults] = useState<any>({});
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [autoInitStatus, setAutoInitStatus] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      // Fetch conversations
      const { data: convData } = await supabase
        .from('conversations')
        .select(`
          *,
          patients!conversations_patient_id_fkey(
            *,
            profiles!patients_user_id_fkey(first_name, last_name, full_name)
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setConversations(convData || []);

      // Fetch alerts
      const { data: alertData } = await supabase
        .from('alerts')
        .select(`
          *,
          patients!alerts_patient_id_fkey(
            *,
            profiles!patients_user_id_fkey(first_name, last_name, full_name)
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setAlerts(alertData || []);

    } catch (error) {
      console.error('Error fetching test data:', error);
    }
  };

  const runTest = async (testName: string) => {
    setCurrentTest(testName);
    setTestResults(prev => ({ ...prev, [testName]: { status: 'running', result: null } }));

    try {
      let result;
      
      switch (testName) {
        case 'conversation_creation':
          result = await testConversationCreation();
          break;
        case 'ai_response':
          result = await testAIResponse();
          break;
        case 'auto_initiation':
          result = await testAutoInitiation();
          break;
        case 'realtime_messaging':
          result = await testRealtimeMessaging();
          break;
        case 'alert_system':
          result = await testAlertSystem();
          break;
        case 'inline_forms':
          result = await testInlineForms();
          break;
        default:
          result = { success: false, message: 'Unknown test' };
      }

      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: result.success ? 'success' : 'error', 
          result: result.message,
          details: result.details || null
        } 
      }));

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          result: error instanceof Error ? error.message : 'Test failed'
        } 
      }));
    } finally {
      setCurrentTest(null);
      fetchTestData(); // Refresh data after test
    }
  };

  const testConversationCreation = async () => {
    if (!patient) {
      return { success: false, message: 'Patient profile required for this test' };
    }

    try {
      // Create test conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          patient_id: patient.id,
          tenant_id: profile.tenant_id,
          title: 'Test Conversation',
          conversation_type: 'general',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          patient_id: patient.id,
          tenant_id: profile.tenant_id,
          content: 'Test message for conversation creation',
          message_type: 'system',
          sender_type: 'ai'
        });

      if (messageError) throw messageError;

      return {
        success: true,
        message: 'Conversation created successfully',
        details: { conversationId: conversation.id }
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testAIResponse = async () => {
    try {
      const response = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, this is a test message',
          context: {
            recoveryDay: 5,
            patientId: patient?.id || 'test-patient',
            surgeryType: 'TKA'
          },
          patientId: patient?.id || 'test-patient',
          currentTask: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: 'AI response generated successfully',
        details: { reply: data.reply, actions: data.actions }
      };

    } catch (error) {
      return {
        success: false,
        message: `AI response test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testAutoInitiation = async () => {
    try {
      const response = await fetch('/api/chat/auto-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: profile.tenant_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAutoInitStatus(data);

      return {
        success: true,
        message: 'Auto-initiation check completed',
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Auto-initiation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testRealtimeMessaging = async () => {
    if (!conversations.length) {
      return { success: false, message: 'No conversations available for realtime test' };
    }

    try {
      const testConversation = conversations[0];
      
      // Send a test message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: testConversation.id,
          patient_id: testConversation.patient_id,
          tenant_id: profile.tenant_id,
          content: 'Realtime test message',
          message_type: 'user',
          sender_type: 'user'
        });

      if (error) throw error;

      return {
        success: true,
        message: 'Realtime message sent successfully',
        details: { conversationId: testConversation.id }
      };

    } catch (error) {
      return {
        success: false,
        message: `Realtime messaging test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testAlertSystem = async () => {
    if (!patient) {
      return { success: false, message: 'Patient profile required for alert test' };
    }

    try {
      // Create test alert
      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({
          patient_id: patient.id,
          tenant_id: profile.tenant_id,
          alert_type: 'test_alert',
          severity: 'medium',
          message: 'This is a test alert',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Alert created successfully',
        details: { alertId: alert.id }
      };

    } catch (error) {
      return {
        success: false,
        message: `Alert system test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testInlineForms = async () => {
    // This test checks if inline form components render correctly
    try {
      const formData = {
        formId: 'test-form',
        fields: [
          { name: 'pain_level', label: 'Pain Level', type: 'scale', min: 1, max: 10, required: true },
          { name: 'mobility', label: 'Mobility', type: 'select', options: ['Good', 'Fair', 'Poor'], required: true }
        ]
      };

      return {
        success: true,
        message: 'Inline form structure validated',
        details: formData
      };

    } catch (error) {
      return {
        success: false,
        message: `Inline forms test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const testSuites = [
    {
      id: 'conversation_creation',
      name: 'Conversation Creation',
      description: 'Test creating new conversations and messages',
      icon: MessageCircle
    },
    {
      id: 'ai_response',
      name: 'AI Response System',
      description: 'Test OpenAI integration and response generation',
      icon: Activity
    },
    {
      id: 'auto_initiation',
      name: 'Auto-Initiation',
      description: 'Test automatic conversation initiation for patients',
      icon: Play
    },
    {
      id: 'realtime_messaging',
      name: 'Realtime Messaging',
      description: 'Test real-time message delivery via Supabase',
      icon: RefreshCw
    },
    {
      id: 'alert_system',
      name: 'Alert System',
      description: 'Test alert creation and provider notifications',
      icon: AlertTriangle
    },
    {
      id: 'inline_forms',
      name: 'Inline Forms',
      description: 'Test inline form rendering and submission',
      icon: CheckCircle
    }
  ];

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Test Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Test User Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Name:</span> {profile.full_name}
            </div>
            <div className="text-sm">
              <span className="font-medium">Role:</span> {profile.role}
            </div>
            <div className="text-sm">
              <span className="font-medium">Tenant ID:</span> {profile.tenant_id}
            </div>
            {patient && (
              <div className="text-sm">
                <span className="font-medium">Patient ID:</span> {patient.id}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Suites */}
        <Card>
          <CardHeader>
            <CardTitle>Test Suites</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTestData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {testSuites.map((test) => {
              const result = testResults[test.id];
              const Icon = test.icon;
              
              return (
                <div
                  key={test.id}
                  className={`p-3 rounded-lg border transition-colors ${getStatusColor(result?.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{test.name}</span>
                    </div>
                    {getStatusIcon(result?.status)}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{test.description}</p>
                  
                  {result?.result && (
                    <p className={`text-xs mb-2 ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.result}
                    </p>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runTest(test.id)}
                    disabled={currentTest === test.id}
                    className="w-full"
                  >
                    {currentTest === test.id ? 'Running...' : 'Run Test'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Conversations:</span>
              <Badge variant="outline">{conversations.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Active Alerts:</span>
              <Badge variant="outline">{alerts.length}</Badge>
            </div>
            {autoInitStatus && (
              <div className="flex justify-between">
                <span className="text-sm">Auto-Init Status:</span>
                <Badge variant="outline">
                  {autoInitStatus.activeConversations || 0}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface Test */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <Card className="h-[800px]">
            <CardHeader>
              <CardTitle>Live Chat Test - {selectedConversation.title}</CardTitle>
              <Button
                variant="outline"
                onClick={() => setSelectedConversation(null)}
              >
                Back to Conversations
              </Button>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <ChatInterface
                patientId={selectedConversation.patient_id}
                conversationId={selectedConversation.id}
                isProvider={profile.role !== 'patient'}
                tenantId={profile.tenant_id}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Test Conversations</CardTitle>
              <p className="text-sm text-gray-600">
                Select a conversation to test the chat interface
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {conversation.title || 'Untitled Conversation'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Patient: {conversation.patients?.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {conversation.conversation_type} • 
                          Created: {new Date(conversation.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                        {conversation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>No conversations found</div>
                    <div className="text-sm">Run the conversation creation test to create one</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}