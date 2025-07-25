"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ManusStyleChatInterface from '@/components/chat/ManusStyleChatInterface';
import EnhancedProviderChatMonitor from '@/components/provider/EnhancedProviderChatMonitor';
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  Heart,
  Activity
} from 'lucide-react';

export default function ChatTestPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [testStatus, setTestStatus] = useState({
    database: { status: 'pending', message: '' },
    realtime: { status: 'pending', message: '' },
    assignments: { status: 'pending', message: '' }
  });

  // Test users
  const [testPatientId, setTestPatientId] = useState<string>('');
  const [testProviderId, setTestProviderId] = useState<string>('');

  useEffect(() => {
    runSystemTests();
  }, []);

  const runSystemTests = async () => {
    // Test 1: Database connectivity
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id')
        .limit(1);

      if (error) throw error;
      
      setTestStatus(prev => ({
        ...prev,
        database: { status: 'success', message: 'Database connection successful' }
      }));
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        database: { status: 'error', message: 'Database connection failed' }
      }));
    }

    // Test 2: Real-time subscriptions
    try {
      const channel = supabase.channel('test-channel');
      await channel.subscribe();
      
      setTestStatus(prev => ({
        ...prev,
        realtime: { status: 'success', message: 'Real-time subscriptions working' }
      }));
      
      await channel.unsubscribe();
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        realtime: { status: 'error', message: 'Real-time subscriptions failed' }
      }));
    }

    // Test 3: Provider assignments
    try {
      const { data, error } = await supabase
        .from('provider_patient_assignments')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      setTestStatus(prev => ({
        ...prev,
        assignments: { status: 'success', message: 'Assignment system ready' }
      }));
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        assignments: { status: 'error', message: 'Assignment system error' }
      }));
    }

    // Get test users
    await loadTestUsers();
  };

  const loadTestUsers = async () => {
    try {
      // Get a test patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id, user_id')
        .limit(1)
        .single();

      if (patient) {
        setTestPatientId(patient.user_id);
      }

      // Get a test provider
      const { data: provider } = await supabase
        .from('providers')
        .select('id, user_id')
        .limit(1)
        .single();

      if (provider) {
        setTestProviderId(provider.id);
      }
    } catch (error) {
      console.error('Error loading test users:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Patient-Provider Communication Test
        </h1>
        <p className="text-gray-600">
          Test and verify the real-time messaging system between patients and providers
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(testStatus).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium capitalize">{key.replace('_', ' ')}</h3>
                {getStatusIcon(value.status)}
              </div>
              <Badge className={getStatusColor(value.status)}>
                {value.status === 'pending' ? 'Testing...' : value.status}
              </Badge>
              {value.message && (
                <p className="text-sm text-gray-600 mt-2">{value.message}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">Real-time Updates</h3>
            <p className="text-sm text-blue-700 mt-1">
              Instant message delivery
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-900">Provider Tracking</h3>
            <p className="text-sm text-purple-700 mt-1">
              Know who&apos;s responding
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Typing Indicators</h3>
            <p className="text-sm text-green-700 mt-1">
              See when others type
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-900">Read Receipts</h3>
            <p className="text-sm text-orange-700 mt-1">
              Message delivery status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Testing Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient-view">Patient View</TabsTrigger>
          <TabsTrigger value="provider-view">Provider View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Flow Overview</CardTitle>
              <CardDescription>
                Understanding the patient-provider messaging system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Key Features:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">For Patients:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Send messages to care team</li>
                      <li>• Request urgent provider help</li>
                      <li>• See when providers are typing</li>
                      <li>• Know when messages are read</li>
                      <li>• Distinguished provider responses</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">For Providers:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Monitor all patient conversations</li>
                      <li>• Filter by urgency or unread</li>
                      <li>• Quick response templates</li>
                      <li>• Patient context sidebar</li>
                      <li>• Assignment management</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Testing Instructions:</strong> Use the Patient View and Provider View tabs
                  to simulate a real conversation. Open them in separate browser windows for the 
                  best testing experience.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patient-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Chat Interface
              </CardTitle>
              <CardDescription>
                Experience the chat from a patient&apos;s perspective
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] overflow-hidden">
                {testPatientId ? (
                  <ManusStyleChatInterface
                    patientId={testPatientId}
                    mode="patient"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading patient interface...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Provider Chat Monitor
              </CardTitle>
              <CardDescription>
                Monitor and respond to patient messages as a provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testProviderId ? (
                <EnhancedProviderChatMonitor
                  providerId={testProviderId}
                  providerName="Test Provider"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading provider interface...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Testing Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Real-time Testing:</strong> Messages should appear instantly in both interfaces.
              Typing indicators should show within 1-2 seconds.
            </p>
            <p>
              <strong>Message Status:</strong> Single checkmark (✓) = delivered, 
              Double checkmark (✓✓) = read. Provider messages appear with purple styling.
            </p>
            <p>
              <strong>Urgent Messages:</strong> Use the &quot;Request Provider Help&quot; button in the
              patient view to send an urgent message that will be highlighted in the provider view.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}