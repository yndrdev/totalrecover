"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DataService } from '@/lib/services/dataService';
import { 
  Building, 
  Users, 
  UserPlus,
  MessageCircle, 
  Activity,
  TrendingUp,
  Search,
  Plus,
  Settings,
  Eye,
  Calendar,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Video,
  Target,
  Sparkles,
  Play,
  Upload,
  Link,
  Edit,
  Trash2,
  RotateCcw,
  Save,
  Repeat,
  Zap,
  Send,
  Bot,
  User
} from 'lucide-react';
import EnhancedPatientTable from './EnhancedPatientTable';

interface PracticeAdminDashboardProps {
  user: any;
  profile: any;
  practice: any;
}

// Protocol Builder Constants
const TASK_TYPES = [
  { 
    type: 'video', 
    label: 'Exercise Video', 
    icon: Video, 
    color: 'bg-red-500',
    brandColor: 'bg-red-600 hover:bg-red-700',
    description: 'Video demonstrations with instructions'
  },
  { 
    type: 'form', 
    label: 'Assessment Form', 
    icon: FileText, 
    color: 'bg-blue-500',
    brandColor: 'bg-blue-600 hover:bg-blue-700',
    description: 'Patient questionnaires and evaluations'
  },
  { 
    type: 'exercise', 
    label: 'Exercise Instructions', 
    icon: Activity, 
    color: 'bg-green-500',
    brandColor: 'bg-emerald-600 hover:bg-emerald-700',
    description: 'Step-by-step exercise guidance'
  },
  { 
    type: 'message', 
    label: 'Provider Message', 
    icon: Sparkles, 
    color: 'bg-teal-500',
    brandColor: 'bg-teal-600 hover:bg-teal-700',
    description: 'Direct communication from care team'
  },
  { 
    type: 'appointment', 
    label: 'Appointment', 
    icon: Calendar, 
    color: 'bg-orange-500',
    brandColor: 'bg-orange-600 hover:bg-orange-700',
    description: 'Scheduled visits and consultations'
  }
];

// Mock content library options (in real app, these would come from the Content Library)
const VIDEO_RESOURCE_OPTIONS = [
  { id: 'video-1', title: 'Post-Surgery Knee Bending', url: 'https://youtube.com/watch?v=example1' },
  { id: 'video-2', title: 'Walking Techniques', url: 'https://youtube.com/watch?v=example2' },
  { id: 'video-3', title: 'Pain Management Techniques', url: 'https://youtube.com/watch?v=example3' }
];

const FORM_OPTIONS = [
  { id: 'form-1', title: 'Pain Assessment Form', type: 'assessment' },
  { id: 'form-2', title: 'Mobility Check Form', type: 'assessment' },
  { id: 'form-3', title: 'Daily Progress Form', type: 'progress' }
];

const EXERCISE_OPTIONS = [
  { id: 'exercise-1', title: 'Basic Range of Motion', category: 'mobility' },
  { id: 'exercise-2', title: 'Strengthening Exercises', category: 'strength' },
  { id: 'exercise-3', title: 'Balance Training', category: 'balance' }
];

const RECURRING_PATTERNS = [
  { 
    value: 'daily', 
    label: 'Every Day', 
    description: 'Task repeats daily throughout recovery',
    icon: '📅',
    examples: 'Pain assessment every day at 9:00 AM'
  },
  { 
    value: 'every_other_day', 
    label: 'Every Other Day', 
    description: 'Task repeats every 2 days',
    icon: '📆',
    examples: 'Exercise video every other day'
  },
  { 
    value: 'twice_weekly', 
    label: 'Twice Weekly', 
    description: 'Task repeats twice per week',
    icon: '📋',
    examples: 'Physical therapy sessions'
  },
  { 
    value: 'weekly', 
    label: 'Weekly', 
    description: 'Task repeats once per week',
    icon: '🗓️',
    examples: 'Check-in with surgeon'
  },
  { 
    value: 'monthly', 
    label: 'Monthly', 
    description: 'Task repeats once per month',
    icon: '📅',
    examples: 'Progress review appointment'
  },
  { 
    value: 'milestone', 
    label: 'Recovery Milestones', 
    description: 'Task appears at specific recovery milestones',
    icon: '🎯',
    examples: 'Day 7, Day 30, Day 90 assessments'
  },
  { 
    value: 'one_time', 
    label: 'One Time', 
    description: 'Task appears once during recovery',
    icon: '⭐',
    examples: 'Pre-surgery preparation checklist'
  }
];

export default function PracticeAdminDashboard({ user, profile, practice }: PracticeAdminDashboardProps) {
  const [clinics, setClinics] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignProtocol, setShowAssignProtocol] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Protocol Builder states
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [assignedPatient, setAssignedPatient] = useState('John Miller - TKA Recovery Day 4');
  const [builderProtocol, setBuilderProtocol] = useState<{
    name: string;
    surgery_type: string;
    description: string;
    tasks: any[];
  }>({
    name: 'Standard TKA Recovery Protocol',
    surgery_type: 'TKA',
    description: 'Comprehensive total knee replacement recovery program',
    tasks: []
  });
  const [newTask, setNewTask] = useState<{
    title: string;
    type: string;
    description: string;
    recurring: {
      pattern: string;
      frequency: number;
      time: string;
      duration_weeks: number;
      milestone_days: number[];
      specific_date: string | null;
    };
    content: any;
    triggers: {
      pain_level: number | null;
      mobility_level: number | null;
      completion_dependencies: string[];
    };
    videoUrl?: string;
    formType?: string;
    exerciseCategory?: string;
  }>({
    title: '',
    type: 'video',
    description: '',
    recurring: {
      pattern: 'daily',
      frequency: 1,
      time: '09:00',
      duration_weeks: 12,
      milestone_days: [],
      specific_date: null
    },
    content: {},
    triggers: {
      pain_level: null,
      mobility_level: null,
      completion_dependencies: []
    }
  });

  useEffect(() => {
    loadPracticeData();
  }, [practice.id]);

  const loadPracticeData = async () => {
    try {
      // Load practice with clinics
      const practiceData = await DataService.getPracticeWithClinics(practice.id);
      setClinics(practiceData.clinics || []);

      // Load all patients in this practice
      const patientsData = await DataService.getPatientsWithDetails(practice.id);
      setPatients(patientsData);

      // Load providers
      const providersData = await DataService.getProviders(practice.id);
      setProviders(providersData);

      // Load recovery protocols
      const protocolsData = await DataService.getRecoveryProtocols(practice.id);
      setProtocols(protocolsData);

      // Load practice metrics
      const practiceMetrics = await DataService.getTenantMetrics(practice.id);
      setMetrics(practiceMetrics);

      // Load alerts (generate sample alerts for now since getAlerts might not exist in DB)
      const alertsData = await DataService.getRecentActivity(practice.id, 5);
      setAlerts(alertsData.map(activity => ({
        id: activity.id,
        message: activity.description,
        severity: activity.type === 'task_completed' ? 'low' : 'medium',
        created_at: activity.created_at,
        patients: { profiles: { full_name: 'Sample Patient' } }
      })));

    } catch (error) {
      console.error('Error loading practice data:', error);
      // Set default values to prevent crashes
      setClinics([]);
      setPatients([]);
      setProviders([]);
      setProtocols([]);
      setMetrics({
        totalPatients: 0,
        activeConversations: 0,
        completedTasks: 0,
        totalProviders: 0
      });
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const assignProtocolToPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setSelectedPatientId(patientId);
    setShowAssignProtocol(true);
  };

  const viewPatientDetails = (patientId: string) => {
    // Navigate to patient detail page
    window.open(`/provider/patients/${patientId}`, '_blank');
  };

  const handleProtocolAssignment = async (protocolId: string) => {
    if (!selectedPatientId) return;

    try {
      await DataService.assignProtocolToPatient(selectedPatientId, protocolId, practice.id);
      
      // Log the assignment for audit trail
      await DataService.logProtocolAssignment(
        selectedPatientId,
        protocolId,
        {
          id: profile.id,
          name: profile.full_name,
          role: profile.role
        },
        practice.id
      );

      // Refresh patient data
      await loadPracticeData();
      setShowAssignProtocol(false);
      setSelectedPatientId(null);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Error assigning protocol:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Protocol Builder Functions
  const handleCreateTask = () => {
    const task = {
      ...newTask,
      id: Date.now().toString()
    }
    setBuilderProtocol(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }))
    setNewTask({
      title: '',
      type: 'video',
      description: '',
      recurring: {
        pattern: 'daily',
        frequency: 1,
        time: '09:00',
        duration_weeks: 12,
        milestone_days: [],
        specific_date: null
      },
      content: {},
      triggers: {
        pain_level: null,
        mobility_level: null,
        completion_dependencies: []
      },
      videoUrl: undefined,
      formType: undefined,
      exerciseCategory: undefined
    })
    setShowTaskCreator(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setBuilderProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.filter((t: any) => t.id !== taskId)
    }))
  }

  const getTaskIcon = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.type === type)
    return taskType ? taskType.icon : FileText
  }

  const getTaskColor = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.type === type)
    return taskType ? taskType.color : 'bg-gray-500'
  }

  const renderRecurring = (recurring: any) => {
    const pattern = RECURRING_PATTERNS.find(p => p.value === recurring.pattern)
    const patternLabel = pattern ? pattern.label : recurring.pattern
    
    let timeInfo = ''
    if (recurring.time) timeInfo = ` at ${recurring.time}`
    if (recurring.duration_weeks) timeInfo += ` (${recurring.duration_weeks} weeks)`
    
    const colorClassMap: { [key: string]: string } = {
      'daily': 'bg-green-100 text-green-800',
      'every_other_day': 'bg-blue-100 text-blue-800',
      'twice_weekly': 'bg-purple-100 text-purple-800',
      'weekly': 'bg-orange-100 text-orange-800',
      'monthly': 'bg-red-100 text-red-800',
      'milestone': 'bg-yellow-100 text-yellow-800',
      'one_time': 'bg-gray-100 text-gray-800'
    }
    const colorClass = colorClassMap[recurring.pattern] || 'bg-gray-100 text-gray-800'
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
        {patternLabel}{timeInfo}
      </span>
    )
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{practice.name}</h1>
        <p className="text-gray-600">Practice Administration Dashboard</p>
      </div>

      {/* Practice Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600">{clinics.length}</div>
                <div className="text-sm text-gray-600">Clinics</div>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-green-600">{metrics.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-purple-600">{providers.length}</div>
                <div className="text-sm text-gray-600">Providers</div>
              </div>
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-600">{metrics.activeConversations}</div>
                <div className="text-sm text-gray-600">Active Chats</div>
              </div>
              <MessageCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinics">Clinics</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="builder">Protocol Builder</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{alert.message}</div>
                        <div className="text-xs text-gray-600">
                          {alert.patients?.profiles?.full_name} • {DataService.formatDateTime(alert.created_at)}
                        </div>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                      <div className="text-sm">No active alerts</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Practice Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Practice Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Patients</span>
                    <span className="text-2xl font-bold text-green-600">
                      {patients.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed Recoveries</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {patients.filter(p => p.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Protocols</span>
                    <span className="text-2xl font-bold text-purple-600">{protocols.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasks Completed</span>
                    <span className="text-2xl font-bold text-orange-600">{metrics.completedTasks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Clinics Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Clinic
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinics.map(clinic => (
                  <div key={clinic.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                      <Badge variant={clinic.is_active ? "default" : "secondary"}>
                        {clinic.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Address: {clinic.settings?.address || 'Not set'}</div>
                      <div>Phone: {clinic.settings?.phone || 'Not set'}</div>
                      <div>Patients: {clinic.patients?.length || 0}</div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
                {clinics.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div className="text-lg font-medium">No clinics found</div>
                    <div className="text-sm">Add your first clinic to get started</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
                  <p className="text-gray-600">Manage and monitor all your patients in one place</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Filter Patients"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <Bot className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedPatientTable
                patients={filteredPatients}
                onViewDetails={viewPatientDetails}
                onAssignProtocol={assignProtocolToPatient}
                onOpenChat={(patientId) => window.open(`/provider/chat-monitor?patient=${patientId}`, '_blank')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Provider Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(provider => (
                  <div key={provider.id} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {provider.first_name?.[0]}{provider.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {provider.first_name} {provider.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{provider.role}</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{provider.email}</div>
                      <div>{provider.phone || 'No phone'}</div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recovery Protocols</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Protocol
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {protocols.map(protocol => (
                  <div key={protocol.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
                      <Badge variant={protocol.is_active ? "default" : "secondary"}>
                        {protocol.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>{protocol.description}</div>
                      <div>Duration: {protocol.duration_weeks} weeks</div>
                      <div>Patients using: {protocol.patients?.length || 0}</div>
                      <div>Created: {DataService.formatDate(protocol.created_at)}</div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {protocols.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div className="text-lg font-medium">No protocols found</div>
                    <div className="text-sm">Create your first recovery protocol</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocol Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6">
            {/* Protocol Builder Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Protocol Builder</h2>
                    <p className="text-sm text-blue-600 font-medium">TJV Recovery Platform</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Build comprehensive recovery protocols with smart scheduling and content management</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Patient View
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Save className="h-4 w-4 mr-2" />
                  Save Protocol
                </Button>
              </div>
            </div>

            <div className="flex space-x-6">
              {/* Main Protocol Editor */}
              <div className="flex-1">
                {/* Protocol Info */}
                <Card className="mb-6 border-blue-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg text-blue-900">Protocol Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Protocol Name</label>
                        <Input 
                          value={builderProtocol.name} 
                          onChange={(e) => setBuilderProtocol(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Type</label>
                        <select 
                          value={builderProtocol.surgery_type}
                          onChange={(e) => setBuilderProtocol(prev => ({ ...prev, surgery_type: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="TKA">Total Knee Replacement (TKA)</option>
                          <option value="THA">Total Hip Replacement (THA)</option>
                          <option value="TSA">Total Shoulder Replacement (TSA)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea 
                        value={builderProtocol.description}
                        onChange={(e) => setBuilderProtocol(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks List */}
                <Card className="border-gray-200 shadow-md">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg text-gray-900">Recovery Tasks ({builderProtocol.tasks.length})</CardTitle>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600">
                          Assigned to: <span className="font-medium text-blue-600">{assignedPatient}</span>
                        </div>
                        <Button 
                          onClick={() => setShowTaskCreator(true)}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {builderProtocol.tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <div className="text-lg font-medium">No tasks created yet</div>
                          <div className="text-sm">Add your first task to get started</div>
                        </div>
                      ) : (
                        builderProtocol.tasks.map((task: any, index: number) => {
                          const TaskIcon = getTaskIcon(task.type)
                          const taskType = TASK_TYPES.find(t => t.type === task.type)
                          return (
                            <div 
                              key={task.id} 
                              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-300 group"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                  <div className={`w-12 h-12 ${taskType?.brandColor || getTaskColor(task.type)} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                                    <TaskIcon className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                                        {task.type}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                                    <div className="flex items-center space-x-3">
                                      {renderRecurring(task.recurring)}
                                      <div className="flex items-center text-xs text-gray-500">
                                        <Repeat className="h-3 w-3 mr-1" />
                                        <span>Recurring Task</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task Creator Sidebar */}
              {showTaskCreator && (
                <div className="w-96 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
                      <p className="text-sm text-gray-600">Configure content and scheduling</p>
                    </div>
                    <Button variant="ghost" onClick={() => setShowTaskCreator(false)} className="text-gray-400 hover:text-gray-600">
                      ×
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Task Type Selection */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-4">Choose Task Type</label>
                      <div className="grid grid-cols-1 gap-3">
                        {TASK_TYPES.map((taskType) => {
                          const Icon = taskType.icon
                          return (
                            <button
                              key={taskType.type}
                              onClick={() => setNewTask(prev => ({ ...prev, type: taskType.type }))}
                              className={`p-4 border rounded-xl text-left transition-all duration-200 ${
                                newTask.type === taskType.type
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-200 shadow-md'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 ${taskType.brandColor} rounded-xl flex items-center justify-center shadow-sm`}>
                                  <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{taskType.label}</div>
                                  <p className="text-xs text-gray-600 mt-1">{taskType.description}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                        <Input 
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter task title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <Textarea 
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Task description for patients"
                          rows={3}
                        />
                      </div>

                      {/* Content Library Integration */}
                      {newTask.type === 'video' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Video from Library</label>
                          <select 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => {
                              const selected = VIDEO_RESOURCE_OPTIONS.find(v => v.id === e.target.value);
                              if (selected) {
                                setNewTask(prev => ({ 
                                  ...prev, 
                                  title: selected.title,
                                  videoUrl: selected.url
                                }));
                              }
                            }}
                          >
                            <option value="">Choose from video library...</option>
                            {VIDEO_RESOURCE_OPTIONS.map(video => (
                              <option key={video.id} value={video.id}>{video.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {newTask.type === 'form' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Form from Library</label>
                          <select 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => {
                              const selected = FORM_OPTIONS.find(f => f.id === e.target.value);
                              if (selected) {
                                setNewTask(prev => ({ 
                                  ...prev, 
                                  title: selected.title,
                                  formType: selected.type
                                }));
                              }
                            }}
                          >
                            <option value="">Choose from form library...</option>
                            {FORM_OPTIONS.map(form => (
                              <option key={form.id} value={form.id}>{form.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {newTask.type === 'exercise' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Exercise from Library</label>
                          <select 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => {
                              const selected = EXERCISE_OPTIONS.find(ex => ex.id === e.target.value);
                              if (selected) {
                                setNewTask(prev => ({ 
                                  ...prev, 
                                  title: selected.title,
                                  exerciseCategory: selected.category
                                }));
                              }
                            }}
                          >
                            <option value="">Choose from exercise library...</option>
                            {EXERCISE_OPTIONS.map(exercise => (
                              <option key={exercise.id} value={exercise.id}>{exercise.title} ({exercise.category})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Recurring Configuration */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-4">Recurring Pattern</label>
                      <div className="grid grid-cols-1 gap-2">
                        {RECURRING_PATTERNS.map((pattern) => (
                          <button
                            key={pattern.value}
                            onClick={() => setNewTask(prev => ({ 
                              ...prev, 
                              recurring: { ...prev.recurring, pattern: pattern.value }
                            }))}
                            className={`p-3 border rounded-xl text-left transition-all duration-200 ${
                              newTask.recurring.pattern === pattern.value
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-200 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="text-lg">{pattern.icon}</div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{pattern.label}</div>
                                <p className="text-sm text-gray-600">{pattern.description}</p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                              {pattern.examples}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Pattern Configuration */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Time (Optional)</label>
                            <Input 
                              type="time"
                              value={newTask.recurring.time}
                              onChange={(e) => setNewTask(prev => ({
                                ...prev,
                                recurring: { ...prev.recurring, time: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Duration (Weeks)</label>
                            <Input 
                              type="number"
                              value={newTask.recurring.duration_weeks}
                              onChange={(e) => setNewTask(prev => ({
                                ...prev,
                                recurring: { ...prev.recurring, duration_weeks: parseInt(e.target.value) }
                              }))}
                              min="1"
                              max="52"
                              placeholder="12"
                            />
                          </div>
                        </div>
                        
                        {newTask.recurring.pattern === 'milestone' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Recovery Milestones (Days)</label>
                            <Input 
                              placeholder="e.g. 7, 30, 90"
                              onChange={(e) => {
                                const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                                setNewTask(prev => ({
                                  ...prev,
                                  recurring: { ...prev.recurring, milestone_days: days }
                                }))
                              }}
                            />
                          </div>
                        )}
                        
                        {newTask.recurring.pattern === 'one_time' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specific Date (Optional)</label>
                            <Input 
                              type="date"
                              onChange={(e) => setNewTask(prev => ({
                                ...prev,
                                recurring: { ...prev.recurring, specific_date: e.target.value }
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Configuration (Simple) */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Task Content</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {newTask.type === 'video' && (
                          <div className="space-y-2">
                            <Input placeholder="YouTube URL or video link" />
                            <Textarea placeholder="Instructions for patient..." rows={2} />
                          </div>
                        )}
                        
                        {newTask.type === 'form' && (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">Form fields will be configured after creation</div>
                            <Textarea placeholder="Form instructions..." rows={2} />
                          </div>
                        )}
                        
                        {newTask.type === 'exercise' && (
                          <div className="space-y-2">
                            <Input placeholder="Exercise video URL (optional)" />
                            <Textarea placeholder="Exercise instructions..." rows={3} />
                          </div>
                        )}
                        
                        {newTask.type === 'message' && (
                          <Textarea placeholder="Message content for patient..." rows={3} />
                        )}
                        
                        {newTask.type === 'appointment' && (
                          <Textarea placeholder="Appointment instructions..." rows={2} />
                        )}
                      </div>
                    </div>

                    {/* Create Task Button */}
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={handleCreateTask}
                        disabled={!newTask.title.trim()}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Protocol Assignment Modal */}
      {showAssignProtocol && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Assign Protocol</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignProtocol(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">
                Assign recovery protocol to {selectedPatient.profiles?.full_name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recovery Protocol
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {protocols.map(protocol => (
                      <div
                        key={protocol.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleProtocolAssignment(protocol.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{protocol.name}</div>
                            <div className="text-sm text-gray-600">{protocol.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {protocol.surgery_type} • {protocol.duration_weeks} weeks
                            </div>
                          </div>
                          <Badge variant={protocol.is_active ? "default" : "secondary"}>
                            {protocol.is_active ? 'Active' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {protocols.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-sm">No protocols available</div>
                      <div className="text-xs">Create a protocol first</div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignProtocol(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => window.open('/protocol/builder', '_blank')}
                    className="flex-1"
                  >
                    Create New Protocol
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Protocol Preview Modal - Chat Interface */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Protocol Preview - Patient Chat Interface</h3>
                  <p className="text-sm text-gray-600">How patients will see and interact with this protocol</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Interface Preview */}
            <div className="h-full flex bg-gray-50">
              {/* Sidebar - Recovery Timeline (Simplified) */}
              <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">Recovery Timeline</h4>
                      <p className="text-blue-300 text-xs">Day 4</p>
                    </div>
                  </div>
                </div>

                {/* Current Day */}
                <div className="p-4">
                  <h5 className="text-white font-semibold text-xs mb-2 tracking-wider">TODAY</h5>
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">Day 4</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    <div className="text-xs text-blue-200">Jan 21</div>
                    <div className="text-xs text-blue-200 mt-1">
                      {builderProtocol.tasks.length} tasks scheduled
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">TJV Recovery Assistant</h4>
                        <p className="text-xs text-emerald-600">Online • Ready to help</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{assignedPatient}</div>
                      <div className="text-xs text-gray-500">{builderProtocol.surgery_type} Recovery</div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Welcome Message */}
                  <div className="flex justify-start">
                    <div className="max-w-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">TJV Recovery Assistant</span>
                        <span className="text-xs text-gray-400">Just now</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <p className="text-sm text-gray-900 mb-2">
                          Good morning! I&apos;m here to guide you through your recovery journey.
                          Today you have {builderProtocol.tasks.length} activities planned to support your healing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task Messages */}
                  {builderProtocol.tasks.map((task, index) => {
                    const taskIcon = getTaskIcon(task.type);
                    const TaskIconComponent = taskIcon;

                    return (
                      <div key={index} className="flex justify-start">
                        <div className="max-w-lg">
                          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${getTaskColor(task.type)}`}>
                                <TaskIconComponent className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{task.title}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                            
                            {/* Task Type Specific Content */}
                            {task.type === 'video' && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                                    <Play className="h-2 w-2 text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">Exercise Video</span>
                                </div>
                                <div className="bg-gray-200 rounded aspect-video flex items-center justify-center">
                                  <Play className="h-8 w-8 text-gray-500" />
                                </div>
                                <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-xs">
                                  Mark as Watched
                                </Button>
                              </div>
                            )}

                            {task.type === 'form' && (
                              <div className="bg-blue-50 rounded-lg p-3 mt-2 border border-blue-200">
                                <h5 className="font-medium text-blue-900 mb-2">Daily Assessment Form</h5>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-xs font-medium text-blue-800">Pain Level (0-10)</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-blue-700">0</span>
                                      <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        className="flex-1 h-2 bg-blue-200 rounded-lg"
                                        disabled
                                      />
                                      <span className="text-xs text-blue-700">10</span>
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs">
                                  Complete Assessment
                                </Button>
                              </div>
                            )}

                            {task.type === 'exercise' && (
                              <div className="bg-green-50 rounded-lg p-3 mt-2 border border-green-200">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Target className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-900">Exercise Instructions</span>
                                </div>
                                <p className="text-xs text-green-800 mb-2">Follow the guided movements carefully</p>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                                  Start Exercise
                                </Button>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                {renderRecurring(task.recurring)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {builderProtocol.tasks.length === 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-lg">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                          <p className="text-sm text-gray-600">
                            Add tasks to your protocol to see how they will appear to patients in their chat interface.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input (Preview Only) */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Ask questions or report progress..."
                        className="border-2 border-gray-200 rounded-xl"
                        disabled
                      />
                    </div>
                    <Button disabled className="bg-blue-600 text-white px-4 py-2 rounded-xl">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500">Preview mode - Chat input disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}