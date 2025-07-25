"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataService } from '@/lib/services/dataService';
import { 
  Users, 
  UserPlus,
  MessageCircle, 
  Activity,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  Stethoscope
} from 'lucide-react';

interface ClinicDashboardProps {
  user: any;
  profile: any;
  clinic: any;
}

export default function ClinicDashboard({ user, profile, clinic }: ClinicDashboardProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const router = useRouter();

  useEffect(() => {
    loadClinicData();
  }, [clinic.id]);

  const loadClinicData = async () => {
    try {
      // Load patients for this clinic
      const patientsData = await DataService.getPatientsWithDetails(clinic.id);
      setPatients(patientsData);

      // Load providers for this clinic
      const providersData = await DataService.getProviders(clinic.id);
      setProviders(providersData);

      // Load active conversations
      const conversationsData = await DataService.getActiveConversations(clinic.id);
      setActiveChats(conversationsData);

      // Load alerts
      const alertsData = await DataService.getAlerts(clinic.id);
      setAlerts(alertsData);

      // Load clinic metrics
      const clinicMetrics = await DataService.getTenantMetrics(clinic.id);
      setMetrics(clinicMetrics);

      // Generate today's "appointments" (patients with tasks today)
      const today = new Date();
      const todaysPatients = patientsData.filter((patient: any) => {
        const recoveryDay = patient.current_recovery_day || 0;
        return patient.patient_tasks?.some((task: any) => 
          task.assigned_date === recoveryDay && task.status !== 'completed'
        );
      });
      setTodaysAppointments(todaysPatients);

    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setLoading(false);
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

  const viewPatientDetails = (patientId: string) => {
    router.push(`/clinic/patients/${patientId}`);
  };

  const startChat = (patientId: string) => {
    router.push(`/provider/chat-monitor?patient=${patientId}`);
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
        <h1 className="text-3xl font-bold text-gray-900">{clinic.name}</h1>
        <p className="text-gray-600">Clinic Dashboard • {profile.role}</p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600">{metrics.totalPatients}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-green-600">{todaysAppointments.length}</div>
                <div className="text-sm text-gray-600">Today&apos;s Tasks</div>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-purple-600">{activeChats.length}</div>
                <div className="text-sm text-gray-600">Active Chats</div>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-3xl font-bold text-red-600">{alerts.length}</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="chats">Active Chats</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today&apos;s Priority Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysAppointments.slice(0, 5).map(patient => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {patient.profiles?.first_name?.[0] || 'P'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{patient.profiles?.full_name}</div>
                          <div className="text-xs text-gray-600">
                            Day {patient.current_recovery_day} • {DataService.getSurgeryTypeName(patient.surgery_type)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewPatientDetails(patient.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startChat(patient.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {todaysAppointments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                      <div className="text-sm">No priority patients today</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{alert.message}</div>
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
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Patient Management</CardTitle>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPatients.map(patient => (
                  <div key={patient.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {patient.profiles?.first_name?.[0] || 'P'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.profiles?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.profiles?.email}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Surgery:</span>
                        <span className="font-medium">
                          {DataService.getSurgeryTypeName(patient.surgery_type)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recovery Day:</span>
                        <span className="font-medium text-blue-600">
                          {patient.current_recovery_day || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium text-green-600">
                          {Math.round(((patient.patient_tasks?.filter((t: any) => t.status === 'completed').length || 0) / 
                                     Math.max(patient.patient_tasks?.length || 1, 1)) * 100)}%
                        </span>
                      </div>
                      {patient.surgeon && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Surgeon:</span>
                          <span className="font-medium">
                            Dr. {patient.surgeon.first_name} {patient.surgeon.last_name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => viewPatientDetails(patient.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startChat(patient.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <div className="text-lg font-medium">No patients found</div>
                  <div className="text-sm">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Add your first patient to get started'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Clinic Staff</CardTitle>
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
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {provider.first_name?.[0]}{provider.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {provider.role === 'surgeon' ? 'Dr. ' : ''}
                          {provider.first_name} {provider.last_name}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {provider.role.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{provider.email}</span>
                      </div>
                      {provider.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{provider.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last active: {DataService.formatDate(provider.last_sign_in_at || provider.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Chats Tab */}
        <TabsContent value="chats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Active Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChats.map(chat => (
                  <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {chat.patients?.profiles?.first_name?.[0] || 'P'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {chat.patients?.profiles?.full_name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {chat.title || 'Recovery Chat'} • 
                          Last message: {DataService.formatDateTime(chat.last_message_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Day {chat.patients?.current_recovery_day || 0} • 
                          {DataService.getSurgeryTypeName(chat.patients?.surgery_type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {chat.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startChat(chat.patient_id)}
                      >
                        Join Chat
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}

                {activeChats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <div className="text-lg font-medium">No active conversations</div>
                    <div className="text-sm">Conversations will appear here when patients start chatting</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}