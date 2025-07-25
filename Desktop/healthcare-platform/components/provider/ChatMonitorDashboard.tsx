"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ManusStyleChat from '@/components/chat/ManusStyleChat';
import { 
  AlertTriangle, 
  MessageCircle, 
  Search, 
  Clock, 
  User,
  Bell,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ChatMonitorDashboardProps {
  profile: any;
  initialConversations: any[];
  initialAlerts: any[];
}

export default function ChatMonitorDashboard({ 
  profile, 
  initialConversations, 
  initialAlerts 
}: ChatMonitorDashboardProps) {
  const [activeConversations, setActiveConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setupRealtime();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => {
      clearInterval(interval);
    };
  }, []);

  const setupRealtime = () => {
    // Listen for new conversations
    const conversationChannel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        handleConversationChange
      )
      .subscribe();

    // Listen for new alerts
    const alertChannel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        handleAlertChange
      )
      .subscribe();

    // Listen for new messages to update conversation activity
    const messageChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(alertChannel);
      supabase.removeChannel(messageChannel);
    };
  };

  const handleConversationChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      fetchActiveConversations();
    } else if (payload.eventType === 'UPDATE') {
      setActiveConversations(prev => 
        prev.map(conv => 
          conv.id === payload.new.id ? { ...conv, ...payload.new } : conv
        )
      );
    }
  };

  const handleAlertChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      fetchAlerts();
    } else if (payload.eventType === 'UPDATE') {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === payload.new.id ? { ...alert, ...payload.new } : alert
        )
      );
    }
  };

  const handleNewMessage = (payload: any) => {
    // Update last_message_at for the conversation
    setActiveConversations(prev => 
      prev.map(conv => 
        conv.id === payload.new.conversation_id 
          ? { ...conv, last_message_at: payload.new.created_at }
          : conv
      )
    );
  };

  const fetchData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchActiveConversations(),
      fetchAlerts()
    ]);
    setRefreshing(false);
  };

  const fetchActiveConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        patients!conversations_patient_id_fkey(
          *,
          profiles!patients_user_id_fkey(first_name, last_name, full_name)
        )
      `)
      .eq('status', 'active')
      .eq('tenant_id', profile.tenant_id)
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
          profiles!patients_user_id_fkey(first_name, last_name, full_name)
        )
      `)
      .eq('status', 'active')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    setAlerts(data || []);
  };

  const handleAlertClick = async (alert: any) => {
    // Find or create conversation for this patient
    let conversation = activeConversations.find(
      conv => conv.patient_id === alert.patient_id
    );

    if (!conversation) {
      // Create new conversation
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          patient_id: alert.patient_id,
          tenant_id: profile.tenant_id,
          title: 'Provider Alert Response',
          conversation_type: 'general',
          status: 'active',
          is_urgent: true
        })
        .select(`
          *,
          patients!conversations_patient_id_fkey(
            *,
            profiles!patients_user_id_fkey(first_name, last_name, full_name)
          )
        `)
        .single();

      if (newConversation) {
        conversation = newConversation;
        setActiveConversations(prev => [newConversation, ...prev]);
      }
    }

    if (conversation) {
      setSelectedConversation(conversation);
      
      // Mark alert as acknowledged
      await supabase
        .from('alerts')
        .update({ 
          status: 'acknowledged',
          acknowledged_by: profile.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alert.id);
    }
  };

  const filteredConversations = activeConversations.filter(conversation => {
    const patientName = conversation.patients?.profiles?.full_name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'urgent') {
      return matchesSearch && conversation.is_urgent;
    }
    
    return matchesSearch;
  });

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Monitor</h1>
              <p className="text-sm text-gray-600">
                Real-time patient conversations and alerts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="outline" className="gap-1">
                <Bell className="h-3 w-3" />
                {alerts.length} Active Alerts
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Alerts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors border ${getAlertSeverityColor(alert.severity)}`}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="font-medium">
                      {alert.patients?.profiles?.full_name || 'Unknown Patient'}
                    </div>
                    <div className="text-sm opacity-90 capitalize">
                      {alert.alert_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(alert.created_at)}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No active alerts</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversations List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Active Conversations ({filteredConversations.length})
                </CardTitle>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'urgent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('urgent')}
                    >
                      Urgent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {conversation.patients?.profiles?.full_name || 'Unknown Patient'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {conversation.conversation_type?.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      {conversation.is_urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last activity: {formatTimeAgo(conversation.last_message_at || conversation.created_at)}
                    </div>
                  </div>
                ))}
                {filteredConversations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No conversations found</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="h-[800px]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.patients?.profiles?.full_name || 'Unknown Patient'}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.conversation_type?.replace(/_/g, ' ')} • 
                        Started {formatTimeAgo(selectedConversation.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConversation.is_urgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Monitoring
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-full overflow-hidden">
                  <ManusStyleChat
                    patientId={selectedConversation.patient_id}
                    isProvider={true}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[800px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div className="text-lg font-medium mb-2">Select a conversation to monitor</div>
                  <div className="text-sm">Choose from active conversations or click on an alert</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}