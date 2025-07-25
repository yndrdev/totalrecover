"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SidebarNavigation } from "@/components/admin/sidebar-navigation";
import { Button } from "@/components/ui/design-system/Button";
import { Input, Textarea } from "@/components/ui/design-system/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/design-system/Card";
import { StatusBadge, OnlineStatus } from "@/components/ui/design-system/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  FileText, 
  Video, 
  Dumbbell, 
  BarChart3, 
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  Send,
  Zap,
  Play,
  Pause,
  Edit2,
  Save,
  X,
  Users,
  Activity,
  Bell,
  Filter,
  Download,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { colors } from '@/lib/design-system/constants'

interface DashboardData {
  profile: any;
  patients: any[];
  conversations: any[];
  todayTasksCount: number;
  activePatients: number;
  alertsCount: number;
}

interface ProviderDashboardProps {
  data: DashboardData;
}

export function ProviderDashboard({ data }: ProviderDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(data.patients);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [interventionMessage, setInterventionMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskModifications, setTaskModifications] = useState<any>({});
  const [notifications, setNotifications] = useState(3);
  const realtimeChannelRef = useRef<any>(null);
  const supabase = createClient();

  // <thinking>
  // UX Design: Real-time message loading for provider monitoring
  // Healthcare Context: Providers need to monitor patient communications
  // Implementation: Using Supabase real-time subscriptions for live updates
  // </thinking>
  const loadLiveMessages = useCallback(async () => {
    if (!selectedPatient) return;
    
    // Find the conversation for this patient
    const conversation = data.conversations.find(c => c.patient_id === selectedPatient.id);
    if (!conversation) return;
    
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .eq("tenant_id", data.profile.tenant_id)
      .order("created_at", { ascending: true })
      .limit(50);
    
    if (error) {
      console.error("Error loading messages:", error);
    } else {
      setLiveMessages(messages || []);
    }
  }, [selectedPatient, data.conversations, data.profile.tenant_id, supabase]);
  
  const setupRealtimeSubscription = useCallback(() => {
    if (!selectedPatient) return;
    
    // Remove existing subscription if any
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }
    
    const conversation = data.conversations.find(c => c.patient_id === selectedPatient.id);
    if (!conversation) return;
    
    // Create new realtime channel for this conversation
    const channel = supabase
      .channel(`provider-monitor:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          const newMessage = payload.new;
          
          // Only add if it's for our tenant (security check)
          if (newMessage.tenant_id === data.profile.tenant_id) {
            setLiveMessages(prev => {
              // Check if message already exists to avoid duplicates
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (!exists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        console.log('Provider realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });
    
    realtimeChannelRef.current = channel;
  }, [selectedPatient, data.conversations, data.profile.tenant_id, supabase]);
  
  const handleSendIntervention = async () => {
    if (!interventionMessage.trim() || !selectedPatient) return;
    
    const conversation = data.conversations.find(c => c.patient_id === selectedPatient.id);
    if (!conversation) return;
    
    try {
      // Add provider intervention message to database
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        tenant_id: data.profile.tenant_id,
        sender_type: "provider",
        sender_id: data.profile.id,
        content: interventionMessage,
        metadata: {
          intervention: true,
          provider_role: data.profile.role,
          provider_name: data.profile.full_name
        },
        created_at: new Date().toISOString()
      });
      
      if (error) {
        console.error("Error sending intervention:", error);
      } else {
        // Log intervention for audit trail
        const { DataService } = await import('@/lib/services/dataService');
        await DataService.logProviderIntervention(
          selectedPatient.id,
          'manual_message',
          interventionMessage,
          {
            id: data.profile.id,
            name: data.profile.full_name,
            role: data.profile.role
          },
          data.profile.tenant_id
        );
        
        setInterventionMessage("");
        console.log("Intervention sent successfully");
      }
    } catch (error) {
      console.error("Error sending intervention:", error);
    }
  };
  
  const handleQuickIntervention = async (type: string) => {
    const interventions = {
      pain_check: "Hi! I'm checking in on your pain levels. How are you feeling right now? Please rate your pain from 1-10.",
      exercise_modify: "I've reviewed your progress and am adjusting your exercise plan. Please check your updated tasks.",
      urgent_call: "I need to speak with you urgently. Please call the clinic at your earliest convenience."
    };
    
    const message = interventions[type as keyof typeof interventions];
    if (message) {
      setInterventionMessage(message);
      // Auto-send the quick intervention
      setTimeout(() => {
        handleSendIntervention();
      }, 100);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.patients.filter(patient =>
        patient.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(data.patients);
    }
  }, [searchTerm, data.patients]);

  useEffect(() => {
    if (selectedPatient) {
      loadLiveMessages();
      setupRealtimeSubscription();
    }
    
    // Cleanup on unmount or patient change
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [selectedPatient, loadLiveMessages, setupRealtimeSubscription]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getActivityStatus = (patient: any) => {
    const daysSinceActivity = Math.floor((new Date().getTime() - new Date(patient.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity === 0) return { status: "✅ Completed daily tasks", color: "text-green-600" };
    if (daysSinceActivity === 1) return { status: "⚠️ Missed yesterday", color: "text-yellow-600" };
    if (daysSinceActivity >= 2) return { status: "🔴 High concern", color: "text-red-600" };
    return { status: "📋 No recent activity", color: "text-gray-600" };
  };

  const getSurgeryDay = (surgeryDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const roleMap: Record<string, string> = {
    surgeon: "Surgeon",
    nurse: "Nurse", 
    physical_therapist: "Physical Therapist"
  };
  const roleDisplay = roleMap[data.profile.role] || data.profile.role;

  if (selectedPatient) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <SidebarNavigation 
          userRole={data.profile.role}
          userName={data.profile.full_name}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedPatient(null)}
                  className="flex items-center gap-2"
                >
                  ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Patient Detail</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* <thinking>
              Visual Design: Patient header with clear information hierarchy
              Healthcare Context: Quick access to surgery info and recovery progress
              UX Design: Grid layout for better information organization
              </thinking> */}
              {/* Patient Header */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    👤 {selectedPatient.profiles?.full_name} - Day {getSurgeryDay(selectedPatient.surgery_date)} {selectedPatient.surgery_type} Recovery
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card variant="info" padding="sm">
                      <h3 className="font-semibold text-gray-900 mb-2">Surgery Info</h3>
                      <p className="text-sm text-gray-600">
                        {selectedPatient.surgery_type} - {selectedPatient.surgery_side || 'Right'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedPatient.surgery_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.profile.role === 'surgeon' ? 'You' : 'Dr. ' + (selectedPatient.assigned_surgeon || 'Smith')}
                      </p>
                    </Card>
                    
                    <Card variant="success" padding="sm">
                      <h3 className="font-semibold text-gray-900 mb-2">Progress</h3>
                      <p className="text-sm text-gray-600">
                        Day {getSurgeryDay(selectedPatient.surgery_date)}/84
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.round((getSurgeryDay(selectedPatient.surgery_date) / 84) * 100)}% Complete
                      </p>
                      <p className="text-sm text-green-600">On Track ✅</p>
                    </Card>
                    
                    <Card variant="info" padding="sm">
                      <h3 className="font-semibold text-gray-900 mb-2">Current Plan</h3>
                      <p className="text-sm text-gray-600">Daily Check-in</p>
                      <p className="text-sm text-gray-600">Knee Exercise</p>
                      <p className="text-sm text-gray-600">Pain Assessment</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* <thinking>
              UX Design: Live chat monitor for real-time intervention
              Healthcare Context: Providers need to monitor patient communications
              Visual Design: Clear status indicators and message organization
              </thinking> */}
              {/* Live Chat Monitor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">💬 LIVE CHAT MONITOR</h2>
                    <div className="flex items-center gap-2">
                      <OnlineStatus status={isConnected ? 'online' : 'offline'} showLabel />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3 mb-4">
                    {liveMessages.length > 0 ? (
                      liveMessages.map((message) => (
                        <div key={message.id} className={`flex items-start gap-3 ${message.sender_type === 'patient' ? 'justify-end' : ''}`}>
                          {message.sender_type === 'ai' && (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">🤖</span>
                            </div>
                          )}
                          <div className={`flex-1 ${message.sender_type === 'patient' ? 'text-right' : ''}`}>
                            <p className={`text-sm rounded-lg px-3 py-2 inline-block ${
                              message.sender_type === 'patient' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-800'
                            }`}>
                              {message.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          {message.sender_type === 'patient' && (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-sm">👤</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No active chat session</p>
                        <p className="text-xs mt-1">Messages will appear here in real-time</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Intervention Controls */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Send intervention message..."
                        value={interventionMessage}
                        onChange={(e) => setInterventionMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="primary"
                        onClick={handleSendIntervention}
                        disabled={!interventionMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleQuickIntervention('pain_check')}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Pain Check
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleQuickIntervention('exercise_modify')}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Modify Exercise
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleQuickIntervention('urgent_call')}
                      >
                        📞 Request Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Tasks & Interventions */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">📋 Current Tasks & Interventions</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Card variant="default" padding="sm" className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Knee Flexion Exercise</p>
                          <p className="text-sm text-gray-600">10 reps × 3 sets - 5 min duration</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="in_progress" />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsEditingTask(!isEditingTask)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                    
                    {isEditingTask && (
                      <Card variant="info" padding="md">
                        <h4 className="font-semibold text-blue-800 mb-3">🔧 Modify Exercise</h4>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="text-sm font-medium text-blue-700">Reps</label>
                            <Input
                              type="number"
                              defaultValue="10"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-blue-700">Sets</label>
                            <Input
                              type="number"
                              defaultValue="3"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-blue-700">Duration (min)</label>
                            <Input
                              type="number"
                              defaultValue="5"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setIsEditingTask(false)}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save Changes
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsEditingTask(false)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    )}
                    
                    <Card variant="default" padding="sm" className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Pain Assessment</p>
                          <p className="text-sm text-gray-600">Daily check-in (1-10 scale)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="pending" />
                        <Button variant="secondary" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarNavigation 
        userRole={data.profile.role}
        userName={data.profile.full_name}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <thinking>
        Visual Design: Clean header with new design system colors
        UX Design: Quick access to search and actions
        Healthcare Context: Provider-focused dashboard layout
        </thinking> */}
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {data.profile.full_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="secondary" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Patient
                </Button>
              </div>

              {/* Notifications */}
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Practice Overview</h2>
                <p className="text-sm text-gray-600">{formatDate()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 days
                </Button>
                <Button variant="secondary" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* <thinking>
            Visual Design: Overview cards with healthcare-specific metrics
            UX Design: Clear data visualization with trend indicators
            Healthcare Context: Key metrics for provider monitoring
            </thinking> */}
            {/* Practice Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Active Patients</h3>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{data.activePatients}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">8% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Completed Tasks Today</h3>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{data.todayTasksCount}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">12% from yesterday</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Alerts Requiring Attention</h3>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{data.alertsCount}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600">3 new alerts</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Patient Activity */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">📋 Recent Patient Activity</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredPatients.slice(0, 8).map((patient) => {
                    const activity = getActivityStatus(patient);
                    const surgeryDay = getSurgeryDay(patient.surgery_date);
                    
                    return (
                      <Card 
                        key={patient.id} 
                        variant="default"
                        padding="sm"
                        interactive
                        className="flex items-center justify-between"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-800 text-sm font-medium">
                              {patient.profiles?.full_name?.charAt(0) || 'P'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.profiles?.full_name || 'Unknown Patient'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Day {surgeryDay} {patient.surgery_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${activity.color}`}>
                            {activity.status}
                          </span>
                          <Button variant="secondary" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* <thinking>
            UX Design: Quick action buttons for common provider tasks
            Healthcare Context: Access to builder, exercises, forms, and analytics
            Visual Design: Icon-based design for quick recognition
            </thinking> */}
            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="secondary"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.location.href = "/builder"}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Access Builder</span>
                </Button>
                
                <Button
                  variant="secondary"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.location.href = "/provider/content/exercises"}
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Exercises</span>
                </Button>
                
                <Button
                  variant="secondary"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.location.href = "/provider/content/forms"}
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Forms</span>
                </Button>
                
                <Button
                  variant="secondary"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.location.href = "/provider/analytics"}
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Analytics</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}