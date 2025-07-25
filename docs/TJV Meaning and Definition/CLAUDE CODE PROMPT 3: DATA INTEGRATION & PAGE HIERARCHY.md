# CLAUDE CODE PROMPT 3: DATA INTEGRATION & PAGE HIERARCHY

## 🎯 **OBJECTIVE**
Build the complete page hierarchy (SaaS → Practice → Clinic → Patient) with real data connections, ensuring all components work together seamlessly with the database we created.

## 📋 **REQUIREMENTS OVERVIEW**

### **Page Hierarchy:**
1. **SaaS Admin Dashboard** - Manage practice clients
2. **Practice Admin Dashboard** - Manage clinics and protocols
3. **Clinic Dashboard** - Manage patients and providers
4. **Patient Dashboard** - Recovery journey and chat
5. **Provider Tools** - Chat monitoring and patient management

### **Data Flow:**
- All data comes from Supabase tables we created
- Real-time updates across all interfaces
- Proper tenant isolation and security
- Performance optimization for large datasets

## 🏗️ **IMPLEMENTATION TASKS**

### **TASK 1: SaaS Admin Dashboard (30 minutes)**

#### **Page: `/saas/dashboard`**
```jsx
// SaaS-level management for TJV Recovery platform
export default function SaaSDashboard() {
  const [practices, setPractices] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchPractices();
    fetchMetrics();
    fetchRecentActivity();
  }, []);

  const fetchPractices = async () => {
    const { data } = await supabase
      .from('tenants')
      .select(`
        *,
        clinics:tenants!parent_tenant_id(*),
        patients(count),
        profiles(count)
      `)
      .eq('tenant_type', 'practice')
      .order('created_at', { ascending: false });

    setPractices(data || []);
  };

  const fetchMetrics = async () => {
    // Get platform-wide metrics
    const { data: totalPatients } = await supabase
      .from('patients')
      .select('id', { count: 'exact' });

    const { data: activeConversations } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const { data: completedTasks } = await supabase
      .from('patient_tasks')
      .select('id', { count: 'exact' })
      .eq('status', 'completed');

    setMetrics({
      totalPatients: totalPatients.length,
      activeConversations: activeConversations.length,
      completedTasks: completedTasks.length,
      totalPractices: practices.length
    });
  };

  return (
    <DashboardLayout title="TJV Recovery Platform" subtitle="SaaS Administration">
      <div className="space-y-8">
        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{practices.length}</div>
              <div className="text-sm text-gray-600">Active Practices</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.totalPatients}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.activeConversations}</div>
              <div className="text-sm text-gray-600">Active Conversations</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{metrics.completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed Today</div>
            </div>
          </Card>
        </div>

        {/* Practice Management */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Practice Management</h3>
            <Button onClick={() => setShowAddPractice(true)}>Add New Practice</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Practice Name</th>
                  <th className="text-left p-4">Clinics</th>
                  <th className="text-left p-4">Patients</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Subscription</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {practices.map(practice => (
                  <tr key={practice.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{practice.name}</div>
                        <div className="text-sm text-gray-600">{practice.subdomain}.tjvrecovery.com</div>
                      </div>
                    </td>
                    <td className="p-4">{practice.clinics?.length || 0}</td>
                    <td className="p-4">{practice.patients?.length || 0}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        practice.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {practice.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {practice.subscription_tier || 'Basic'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => viewPracticeDetails(practice.id)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => managePractice(practice.id)}
                        >
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.description}</div>
                    <div className="text-xs text-gray-600">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Performance</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Response Time</span>
                <span className="text-green-600 font-medium">125ms avg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <span className="text-blue-600 font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">System Uptime</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### **TASK 2: Complete Data Integration Layer (45 minutes)**

#### **Service: `/lib/dataService.js`**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Data service for all database operations
export class DataService {
  
  // ===== TENANT MANAGEMENT =====
  static async getTenantHierarchy(tenantId) {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        parent:tenants!parent_tenant_id(*),
        children:tenants!parent_tenant_id(*),
        profiles(count),
        patients(count)
      `)
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getPracticeWithClinics(practiceId) {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        clinics:tenants!parent_tenant_id(*),
        patients(*),
        recovery_protocols(*)
      `)
      .eq('id', practiceId)
      .eq('tenant_type', 'practice')
      .single();

    if (error) throw error;
    return data;
  }

  // ===== PATIENT MANAGEMENT =====
  static async getPatientsWithDetails(tenantId, filters = {}) {
    let query = supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(first_name, last_name, email),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name),
        nurse:profiles!patients_primary_nurse_id_fkey(first_name, last_name),
        pt:profiles!patients_physical_therapist_id_fkey(first_name, last_name),
        recovery_protocols(name),
        conversations(count),
        patient_tasks(count)
      `)
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.surgeryType) {
      query = query.eq('surgery_type', filters.surgeryType);
    }
    if (filters.recoveryPhase) {
      if (filters.recoveryPhase === 'pre_surgery') {
        query = query.lt('current_recovery_day', 0);
      } else if (filters.recoveryPhase === 'post_surgery') {
        query = query.gte('current_recovery_day', 0);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getPatientDetails(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(*),
        surgeon:profiles!patients_surgeon_id_fkey(*),
        nurse:profiles!patients_primary_nurse_id_fkey(*),
        pt:profiles!patients_physical_therapist_id_fkey(*),
        recovery_protocols(*),
        conversations(*),
        patient_tasks(
          *,
          exercises(*),
          forms(*)
        ),
        form_responses(*),
        exercise_completions(*)
      `)
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return data;
  }

  // ===== RECOVERY PROTOCOLS =====
  static async getRecoveryProtocols(tenantId) {
    const { data, error } = await supabase
      .from('recovery_protocols')
      .select(`
        *,
        created_by_profile:profiles!recovery_protocols_created_by_fkey(first_name, last_name),
        patients(count)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createRecoveryProtocol(protocolData) {
    const { data, error } = await supabase
      .from('recovery_protocols')
      .insert(protocolData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async generatePatientTasks(patientId, protocolId) {
    // Get protocol timeline
    const { data: protocol } = await supabase
      .from('recovery_protocols')
      .select('timeline_data')
      .eq('id', protocolId)
      .single();

    if (!protocol) throw new Error('Protocol not found');

    // Generate tasks based on timeline
    const tasks = [];
    Object.entries(protocol.timeline_data).forEach(([day, dayTasks]) => {
      dayTasks.forEach(task => {
        tasks.push({
          patient_id: patientId,
          title: task.name,
          description: task.description || '',
          task_type: task.type,
          exercise_id: task.type === 'exercise' ? task.id : null,
          form_id: task.type === 'form' ? task.id : null,
          assigned_date: parseInt(day),
          status: 'assigned',
          created_at: new Date().toISOString()
        });
      });
    });

    const { data, error } = await supabase
      .from('patient_tasks')
      .insert(tasks)
      .select();

    if (error) throw error;
    return data;
  }

  // ===== CONVERSATIONS & MESSAGES =====
  static async getActiveConversations(tenantId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        patients!conversations_patient_id_fkey(
          *,
          profiles!patients_user_id_fkey(first_name, last_name)
        ),
        messages(count),
        latest_message:messages(content, sent_at, message_type)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getConversationMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at');

    if (error) throw error;
    return data;
  }

  static async createMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id);

    return data;
  }

  // ===== FORMS & RESPONSES =====
  static async getForms(tenantId, formType = null) {
    let query = supabase
      .from('forms')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (formType) {
      query = query.eq('form_type', formType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async submitFormResponse(responseData) {
    const { data, error } = await supabase
      .from('form_responses')
      .insert(responseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== EXERCISES & COMPLETIONS =====
  static async getExercises(tenantId, exerciseType = null) {
    let query = supabase
      .from('exercises')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async recordExerciseCompletion(completionData) {
    const { data, error } = await supabase
      .from('exercise_completions')
      .insert(completionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== PROVIDER MANAGEMENT =====
  static async getProviders(tenantId, role = null) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('role', ['surgeon', 'nurse', 'physical_therapist', 'practice_admin', 'clinic_admin']);

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query.order('last_name');
    if (error) throw error;
    return data;
  }

  static async assignProvider(patientId, providerField, providerId) {
    const { data, error } = await supabase
      .from('patients')
      .update({ [providerField]: providerId })
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== ANALYTICS & METRICS =====
  static async getPatientMetrics(patientId) {
    const [
      { data: tasks },
      { data: conversations },
      { data: formResponses },
      { data: exerciseCompletions }
    ] = await Promise.all([
      supabase.from('patient_tasks').select('*').eq('patient_id', patientId),
      supabase.from('conversations').select('*').eq('patient_id', patientId),
      supabase.from('form_responses').select('*').eq('patient_id', patientId),
      supabase.from('exercise_completions').select('*').eq('patient_id', patientId)
    ]);

    return {
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
      totalConversations: conversations?.length || 0,
      formsCompleted: formResponses?.length || 0,
      exercisesCompleted: exerciseCompletions?.length || 0,
      completionRate: tasks?.length ? 
        Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };
  }

  static async getTenantMetrics(tenantId) {
    const [
      { data: patients },
      { data: activeConversations },
      { data: completedTasks },
      { data: providers }
    ] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('status', 'active'),
      supabase.from('patient_tasks').select('id', { count: 'exact' }).eq('status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('tenant_id', tenantId).neq('role', 'patient')
    ]);

    return {
      totalPatients: patients?.length || 0,
      activeConversations: activeConversations?.length || 0,
      completedTasks: completedTasks?.length || 0,
      totalProviders: providers?.length || 0
    };
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====
  static subscribeToConversation(conversationId, callback) {
    return supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  }

  static subscribeToPatientUpdates(patientId, callback) {
    return supabase
      .channel(`patient-${patientId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'patients',
        filter: `id=eq.${patientId}`
      }, callback)
      .subscribe();
  }

  // ===== UTILITY FUNCTIONS =====
  static calculateRecoveryDay(surgeryDate) {
    if (!surgeryDate) return 0;
    const today = new Date();
    const surgery = new Date(surgeryDate);
    const diffTime = today - surgery;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  static async updatePatientRecoveryDays() {
    const { data: patients } = await supabase
      .from('patients')
      .select('id, surgery_date')
      .not('surgery_date', 'is', null);

    if (patients) {
      const updates = patients.map(patient => ({
        id: patient.id,
        current_recovery_day: this.calculateRecoveryDay(patient.surgery_date)
      }));

      await supabase.from('patients').upsert(updates);
    }
  }
}
```

### **TASK 3: Patient Dashboard with Real Data (30 minutes)**

#### **Page: `/patient/dashboard`**
```jsx
import { DataService } from '@/lib/dataService';
import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useUser();

  useEffect(() => {
    if (user) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    try {
      // Get patient details
      const patientData = await DataService.getPatientDetails(user.id);
      setPatient(patientData);

      // Get today's tasks
      const tasks = patientData.patient_tasks.filter(
        task => task.assigned_date === patientData.current_recovery_day
      );
      setTodaysTasks(tasks);

      // Get metrics
      const patientMetrics = await DataService.getPatientMetrics(user.id);
      setMetrics(patientMetrics);

      // Get recent conversations
      const conversations = patientData.conversations
        .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
        .slice(0, 3);
      setRecentConversations(conversations);

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (task) => {
    if (task.task_type === 'form') {
      // Navigate to form
      router.push(`/patient/forms/${task.form_id}`);
    } else if (task.task_type === 'exercise') {
      // Navigate to exercise
      router.push(`/patient/exercises/${task.exercise_id}`);
    } else if (task.task_type === 'chat') {
      // Start chat conversation
      router.push('/patient/chat');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`Welcome back, ${patient?.profiles?.first_name}!`}
      subtitle={`Day ${patient?.current_recovery_day} of your ${patient?.surgery_type} recovery journey`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recovery Progress */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recovery Progress</h2>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{metrics.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.completionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.completedTasks} of {metrics.totalTasks} tasks completed
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {patient?.current_recovery_day}
                  </div>
                  <div className="text-sm text-blue-700">Recovery Day</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.exercisesCompleted}
                  </div>
                  <div className="text-sm text-green-700">Exercises Done</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.formsCompleted}
                  </div>
                  <div className="text-sm text-purple-700">Check-ins Complete</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Tasks</h2>
            {todaysTasks.length > 0 ? (
              <div className="space-y-4">
                {todaysTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      task.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-600">{task.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {task.task_type === 'form' && '📋 Form'}
                            {task.task_type === 'exercise' && '🏃‍♂️ Exercise'}
                            {task.task_type === 'chat' && '💬 Check-in'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {task.status === 'completed' ? (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        ) : (
                          <Button 
                            onClick={() => startTask(task)}
                            size="sm"
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-lg font-medium">All tasks completed for today!</div>
                <div className="text-sm">Great job on your recovery progress.</div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => router.push('/patient/chat')}
              >
                💬 Start Daily Check-in
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => router.push('/patient/exercises')}
              >
                🏃‍♂️ View Exercise Library
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => router.push('/patient/progress')}
              >
                📊 View Progress Report
              </Button>
            </div>
          </Card>

          {/* Care Team */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Care Team</h3>
            <div className="space-y-3">
              {patient?.surgeon && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {patient.surgeon.first_name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      Dr. {patient.surgeon.first_name} {patient.surgeon.last_name}
                    </div>
                    <div className="text-sm text-gray-600">Surgeon</div>
                  </div>
                </div>
              )}
              
              {patient?.nurse && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">
                      {patient.nurse.first_name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {patient.nurse.first_name} {patient.nurse.last_name}
                    </div>
                    <div className="text-sm text-gray-600">Primary Nurse</div>
                  </div>
                </div>
              )}
              
              {patient?.pt && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {patient.pt.first_name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {patient.pt.first_name} {patient.pt.last_name}
                    </div>
                    <div className="text-sm text-gray-600">Physical Therapist</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentConversations.map(conversation => (
                <div key={conversation.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{conversation.title}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(conversation.last_message_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## 🔗 **CRITICAL PERFORMANCE OPTIMIZATIONS**

### **Database Query Optimization:**
```javascript
// Use proper indexing and selective queries
const optimizedPatientQuery = `
  SELECT 
    p.*,
    pr.first_name, pr.last_name, pr.email,
    s.first_name as surgeon_first_name, s.last_name as surgeon_last_name,
    COUNT(pt.id) as total_tasks,
    COUNT(CASE WHEN pt.status = 'completed' THEN 1 END) as completed_tasks
  FROM patients p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN profiles s ON p.surgeon_id = s.id
  LEFT JOIN patient_tasks pt ON p.id = pt.patient_id
  WHERE p.tenant_id = $1
  GROUP BY p.id, pr.id, s.id
  ORDER BY p.created_at DESC
`;

// Real-time subscriptions with filters
const setupOptimizedRealtime = (tenantId) => {
  return supabase
    .channel(`tenant-${tenantId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `tenant_id=eq.${tenantId}`
    }, handleMessage)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public', 
      table: 'patient_tasks',
      filter: `tenant_id=eq.${tenantId}`
    }, handleTaskUpdate)
    .subscribe();
};
```

## ✅ **COMPLETION CHECKLIST**

### **Data Integration:**
- [ ] Complete DataService with all CRUD operations
- [ ] Real-time subscriptions for live updates
- [ ] Proper error handling and loading states
- [ ] Performance optimization with selective queries

### **Page Hierarchy:**
- [ ] SaaS admin dashboard
- [ ] Practice management interface
- [ ] Clinic patient management
- [ ] Patient recovery dashboard
- [ ] Provider monitoring tools

### **Real Data Connections:**
- [ ] All components use Supabase data
- [ ] No hardcoded data anywhere
- [ ] Proper tenant isolation
- [ ] Security policies enforced

**ESTIMATED TIME: 1 hour 45 minutes**
**PRIORITY: CRITICAL - Brings everything together**

