"use client";

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ManusStyleChat from '@/components/chat/ManusStyleChat';
import RealTimeAlerts from '@/components/provider/RealTimeAlerts';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  useDebounce,
  useDebounceCallback,
  useThrottle,
  retryWithBackoff,
  PerformanceMonitor,
  RequestQueue
} from '@/lib/utils/performance';
import {
  AlertTriangle,
  MessageCircle,
  Search,
  Clock,
  User,
  Bell,
  Eye,
  Filter,
  RefreshCw,
  Activity,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
  MessageSquare,
  BarChart3,
  Stethoscope,
  Loader2
} from 'lucide-react';

interface ChatMonitorDashboardProps {
  profile: any;
  initialConversations: any[];
}

interface ProviderPresence {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: Date;
  activeConversations: number;
}

interface ConversationMetrics {
  totalActive: number;
  urgent: number;
  averageResponseTime: number;
  completionRate: number;
}

// Memoized metric card component
const MetricCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-brand-medium',
  trend 
}: {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
  trend?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && <p className="text-xs text-gray-500">{trend}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color} opacity-20`} />
      </div>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Memoized conversation item component
const ConversationItem = memo(({ 
  conversation, 
  isSelected, 
  onClick 
}: {
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
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
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
        isSelected
          ? 'bg-brand-light/20 border-brand-medium'
          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-brand-light text-brand-dark">
              {conversation.patient_name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">
              {conversation.patient_name}
            </div>
            <div className="text-xs text-gray-600">
              {conversation.patients.surgery_type} • Day {conversation.days_post_op || 0}
            </div>
          </div>
        </div>
        {conversation.status === 'nurse_intervention' && (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {conversation.message_count} messages
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(conversation.last_activity_at || conversation.created_at)}
        </span>
      </div>
    </div>
  );
});

ConversationItem.displayName = 'ConversationItem';

// Main optimized dashboard component
export default function OptimizedChatMonitorDashboard({
  profile,
  initialConversations
}: ChatMonitorDashboardProps) {
  const [activeConversations, setActiveConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [providerPresence, setProviderPresence] = useState<ProviderPresence[]>([]);
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalActive: 0,
    urgent: 0,
    averageResponseTime: 0,
    completionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const requestQueue = useMemo(() => new RequestQueue(5), []);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Throttled refresh function
  const throttledRefresh = useThrottle(async () => {
    setRefreshing(true);
    PerformanceMonitor.mark('refresh-start');
    
    try {
      await Promise.all([
        fetchConversations(),
        fetchRecentActivities(),
        updateMetrics()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
      PerformanceMonitor.measure('refresh-duration', 'refresh-start');
    }
  }, 2000);

  // Setup realtime subscriptions with error handling
  useEffect(() => {
    let channels: any[] = [];
    
    const setupRealtime = async () => {
      try {
        channels = await setupRealtimeSubscriptions();
        await fetchInitialData();
        updateProviderPresence();
      } catch (error) {
        console.error('Failed to setup realtime:', error);
        setError('Failed to connect to real-time updates');
      }
    };

    setupRealtime();

    // Periodic updates with performance monitoring
    const interval = setInterval(() => {
      PerformanceMonitor.mark('periodic-update-start');
      requestQueue.add(() => fetchConversations());
      requestQueue.add(() => updateMetrics());
      PerformanceMonitor.measure('periodic-update', 'periodic-update-start');
    }, 30000);

    const presenceInterval = setInterval(updateProviderPresence, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(presenceInterval);
      channels.forEach(channel => channel.unsubscribe());
      requestQueue.clear();
    };
  }, []);

  const setupRealtimeSubscriptions = async () => {
    const channels = [];

    // Conversation updates
    const conversationChannel = supabase
      .channel('monitor-conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, handleConversationChange)
      .subscribe();
    channels.push(conversationChannel);

    // New messages
    const messageChannel = supabase
      .channel('monitor-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, handleNewMessage)
      .subscribe();
    channels.push(messageChannel);

    // Activities
    const activityChannel = supabase
      .channel('monitor-activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_activities'
      }, handleNewActivity)
      .subscribe();
    channels.push(activityChannel);

    // Provider presence
    const presenceChannel = supabase
      .channel('provider-presence')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        updateProviderPresenceFromState(state);
      })
      .subscribe();
    
    // Track current provider
    presenceChannel.track({
      id: profile.id,
      name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
      status: 'online',
      activeConversations: selectedConversation ? 1 : 0,
      timestamp: new Date().toISOString()
    });
    
    channels.push(presenceChannel);

    return channels;
  };

  const handleConversationChange = useCallback(async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      await fetchConversations();
      showNotification('New conversation started', payload.new.title);
    } else if (payload.eventType === 'UPDATE') {
      setActiveConversations(prev => 
        prev.map(conv => 
          conv.id === payload.new.id ? { ...conv, ...payload.new } : conv
        )
      );
      
      if (selectedConversation?.id === payload.new.id) {
        setSelectedConversation((prev: any) => ({ ...prev, ...payload.new }));
      }
    }
  }, [selectedConversation]);

  const handleNewMessage = useCallback(async (payload: any) => {
    const { conversation_id, sender_type, content } = payload.new;
    
    setActiveConversations(prev => 
      prev.map(conv => 
        conv.id === conversation_id 
          ? { 
              ...conv, 
              last_activity_at: payload.new.created_at,
              message_count: (conv.message_count || 0) + 1
            }
          : conv
      )
    );

    if (sender_type === 'patient') {
      const conversation = activeConversations.find(c => c.id === conversation_id);
      if (conversation) {
        showNotification(
          'New patient message',
          `${conversation.patient_name}: ${content.substring(0, 50)}...`
        );
      }
    }

    addRecentActivity({
      type: 'message',
      sender_type,
      conversation_id,
      content: content.substring(0, 100),
      timestamp: payload.new.created_at
    });
  }, [activeConversations]);

  const handleNewActivity = useCallback((payload: any) => {
    addRecentActivity({
      type: payload.new.activity_type,
      conversation_id: payload.new.conversation_id,
      data: payload.new.activity_data,
      timestamp: payload.new.created_at
    });
  }, []);

  const updateProviderPresenceFromState = useCallback((state: any) => {
    const providers = Object.values(state).flatMap((presences: any) => 
      presences.map((presence: any) => ({
        id: presence.id,
        name: presence.name,
        status: presence.status,
        lastSeen: new Date(presence.timestamp),
        activeConversations: presence.activeConversations || 0
      }))
    );
    setProviderPresence(providers);
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchConversations(),
        fetchRecentActivities(),
        updateMetrics()
      ]);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          patients!inner(
            id,
            first_name,
            last_name,
            surgery_date,
            surgery_type
          ),
          messages(count)
        `)
        .eq('status', 'active')
        .order('last_activity_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      if (data) {
        const enrichedConversations = data.map(conv => ({
          ...conv,
          patient_name: `${conv.patients.first_name} ${conv.patients.last_name}`,
          message_count: conv.messages?.[0]?.count || 0,
          days_post_op: conv.patients.surgery_date 
            ? Math.floor((new Date().getTime() - new Date(conv.patients.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
            : null
        }));
        setActiveConversations(enrichedConversations);
      }
    }, {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        console.log(`Retrying fetchConversations (attempt ${attempt}):`, error);
      }
    });
  };

  const fetchRecentActivities = async () => {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('conversation_activities')
        .select(`
          *,
          conversations(
            title,
            patients(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setRecentActivities(data);
    });
  };

  const updateMetrics = async () => {
    const urgentCount = activeConversations.filter(c => c.status === 'nurse_intervention').length;
    const totalCount = activeConversations.length;
    
    const { data: responseData } = await supabase
      .from('messages')
      .select('conversation_id, created_at, sender_type')
      .in('conversation_id', activeConversations.map(c => c.id))
      .order('created_at', { ascending: true });

    let totalResponseTime = 0;
    let responseCount = 0;
    
    if (responseData) {
      const conversationMessages = responseData.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
        acc[msg.conversation_id].push(msg);
        return acc;
      }, {} as Record<string, any[]>);

      Object.values(conversationMessages).forEach(messages => {
        for (let i = 1; i < messages.length; i++) {
          if (messages[i].sender_type !== messages[i-1].sender_type) {
            const responseTime = new Date(messages[i].created_at).getTime() - 
                               new Date(messages[i-1].created_at).getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      });
    }

    const avgResponseTime = responseCount > 0 
      ? Math.floor(totalResponseTime / responseCount / 1000 / 60)
      : 0;

    const { data: completedData } = await supabase
      .from('conversations')
      .select('id')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const completionRate = totalCount > 0 
      ? Math.round((completedData?.length || 0) / (totalCount + (completedData?.length || 0)) * 100)
      : 0;

    setMetrics({
      totalActive: totalCount,
      urgent: urgentCount,
      averageResponseTime: avgResponseTime,
      completionRate
    });
  };

  const updateProviderPresence = () => {
    const channel = supabase.channel('provider-presence');
    channel.track({
      id: profile.id,
      name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
      status: 'online',
      activeConversations: selectedConversation ? 1 : 0,
      timestamp: new Date().toISOString()
    });
  };

  const addRecentActivity = useCallback((activity: any) => {
    setRecentActivities(prev => [activity, ...prev].slice(0, 20));
  }, []);

  const showNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });
      
      // Vibrate if supported (mobile devices)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    return activeConversations.filter(conversation => {
      const matchesSearch = conversation.patient_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || conversation.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || 
        (filterPriority === 'urgent' && conversation.status === 'nurse_intervention') ||
        (filterPriority === 'new' && conversation.message_count < 3);
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activeConversations, debouncedSearchTerm, filterStatus, filterPriority]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-medium" />
          <p className="text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Metrics */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Provider Monitor Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Real-time patient conversation monitoring and analytics
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={throttledRefresh}
                    disabled={refreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if ('Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission();
                      }
                    }}
                    className="gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="ml-auto"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
              
              {/* Metrics Cards with Error Boundaries */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ErrorBoundary fallback={<Card className="p-4">Error loading metric</Card>}>
                  <MetricCard
                    title="Active Conversations"
                    value={metrics.totalActive}
                    icon={MessageCircle}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<Card className="p-4">Error loading metric</Card>}>
                  <MetricCard
                    title="Urgent Cases"
                    value={metrics.urgent}
                    icon={AlertTriangle}
                    color="text-red-600"
                  />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<Card className="p-4">Error loading metric</Card>}>
                  <MetricCard
                    title="Avg Response Time"
                    value={`${metrics.averageResponseTime}m`}
                    icon={Clock}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary fallback={<Card className="p-4">Error loading metric</Card>}>
                  <MetricCard
                    title="Completion Rate"
                    value={`${metrics.completionRate}%`}
                    icon={TrendingUp}
                    color="text-green-600"
                  />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Provider Presence */}
              <ErrorBoundary>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {providerPresence.map(provider => (
                      <div key={provider.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {provider.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              provider.status === 'online' ? 'bg-green-500' :
                              provider.status === 'busy' ? 'bg-yellow-500' :
                              provider.status === 'away' ? 'bg-gray-500' : 'bg-gray-300'
                            }`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{provider.name}</div>
                            <div className="text-xs text-gray-500">
                              {provider.activeConversations} active
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </ErrorBoundary>

              {/* Conversations List */}
              <ErrorBoundary>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Conversations ({filteredConversations.length})
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
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="nurse_intervention">Urgent</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="urgent">Urgent Only</SelectItem>
                            <SelectItem value="new">New Patients</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-1 p-4">
                        {filteredConversations.map(conversation => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={selectedConversation?.id === conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </ErrorBoundary>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <ErrorBoundary>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat">Active Chat</TabsTrigger>
                    <TabsTrigger value="activities">Recent Activities</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat">
                    {selectedConversation ? (
                      <Card className="h-[700px]">
                        <CardHeader className="border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-brand-light text-brand-dark">
                                  {selectedConversation.patient_name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">
                                  {selectedConversation.patient_name}
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                  {selectedConversation.patients.surgery_type} • 
                                  Day {selectedConversation.days_post_op} Post-Op
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="capitalize"
                              >
                                {selectedConversation.status.replace(/_/g, ' ')}
                              </Badge>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Stethoscope className="h-3 w-3" />
                                Patient Details
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 h-full overflow-hidden">
                          <ErrorBoundary>
                            <ManusStyleChat
                              patientId={selectedConversation.patient_id}
                              isProvider={true}
                            />
                          </ErrorBoundary>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="h-[700px] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-10 w-10" />
                          </div>
                          <div className="text-lg font-medium mb-2">Select a conversation</div>
                          <div className="text-sm">Choose a patient conversation from the sidebar to begin monitoring</div>
                        </div>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="activities">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Recent Activities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[600px]">
                          <div className="space-y-3">
                            {recentActivities.map((activity, idx) => (
                              <ActivityItem key={idx} activity={activity} />
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="alerts">
                    <ErrorBoundary>
                      <RealTimeAlerts
                        tenantId={profile.tenant_id}
                        providerId={profile.id}
                      />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Memoized activity item component
const ActivityItem = memo(({ activity }: { activity: any }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'form_completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'video_watched': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'exercise_logged': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
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
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      {getActivityIcon(activity.type || activity.activity_type)}
      <div className="flex-1">
        <div className="text-sm font-medium capitalize">
          {(activity.type || activity.activity_type)?.replace(/_/g, ' ')}
        </div>
        <div className="text-xs text-gray-600">
          {activity.conversations?.patients?.first_name} {activity.conversations?.patients?.last_name}
          {activity.content && ` - ${activity.content}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatTimeAgo(activity.timestamp || activity.created_at)}
        </div>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';