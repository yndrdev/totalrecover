# CLAUDE CODE PROMPT 1: PROVIDER JOURNEY MANAGEMENT SYSTEM

## 🎯 **OBJECTIVE**
Build the provider-side journey management system where practice admins create recovery templates and clinic staff manage patient assignments. This is the foundation that feeds the chat system.

## 📋 **REQUIREMENTS OVERVIEW**

### **Core Functionality:**
- Practice admins create ONE main recovery template (-60 to +200 days from surgery)
- Template includes forms, exercises, videos assigned to specific days
- Clinic staff can assign patients to journeys and customize per patient
- Provider assignment system (surgeon, nurse, PT)
- Real-time patient progress tracking

### **Database Tables to Use:**
- `tenants` (practice/clinic hierarchy)
- `profiles` (all users including providers)
- `patients` (patient records with surgery dates)
- `recovery_protocols` (the journey templates)
- `patient_tasks` (assigned tasks per patient)
- `exercises`, `forms`, `conversations`, `messages`

## 🏗️ **IMPLEMENTATION TASKS**

### **TASK 1: Create Recovery Protocol Builder (45 minutes)**

#### **Page: `/provider/protocols/builder`**
```jsx
// Build a visual timeline builder for recovery protocols
// REQUIREMENTS:
// - Timeline from -60 to +200 days
// - Drag and drop interface for adding tasks
// - Task types: forms, exercises, videos, check-ins
// - Save as template for practice

// EXACT IMPLEMENTATION:
export default function ProtocolBuilder() {
  const [protocol, setProtocol] = useState({
    name: '',
    description: '',
    surgery_type: 'TKA', // or THA
    timeline: {} // day: [tasks]
  });

  // Fetch available forms, exercises from database
  const { data: forms } = useQuery('forms', () => 
    supabase.from('forms').select('*').eq('tenant_id', tenantId)
  );
  
  const { data: exercises } = useQuery('exercises', () => 
    supabase.from('exercises').select('*').eq('tenant_id', tenantId)
  );

  return (
    <DashboardLayout title="Recovery Protocol Builder">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Available Tasks */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold mb-4">Available Tasks</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Forms</h4>
                {forms?.map(form => (
                  <div 
                    key={form.id}
                    draggable
                    className="p-2 bg-blue-50 rounded cursor-move mb-2"
                    onDragStart={(e) => e.dataTransfer.setData('task', JSON.stringify({
                      type: 'form',
                      id: form.id,
                      name: form.name
                    }))}
                  >
                    📋 {form.name}
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises</h4>
                {exercises?.map(exercise => (
                  <div 
                    key={exercise.id}
                    draggable
                    className="p-2 bg-green-50 rounded cursor-move mb-2"
                    onDragStart={(e) => e.dataTransfer.setData('task', JSON.stringify({
                      type: 'exercise',
                      id: exercise.id,
                      name: exercise.name
                    }))}
                  >
                    🏃‍♂️ {exercise.name}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Timeline */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Recovery Timeline</h3>
              <Button onClick={saveProtocol}>Save Protocol</Button>
            </div>
            
            {/* Timeline Grid */}
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {Array.from({length: 261}, (_, i) => i - 60).map(day => (
                  <div 
                    key={day}
                    className="min-w-[120px] border rounded-lg p-3"
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="text-center mb-2">
                      <span className={`text-sm font-medium ${
                        day < 0 ? 'text-orange-600' : 
                        day === 0 ? 'text-red-600' : 
                        'text-green-600'
                      }`}>
                        Day {day}
                      </span>
                      {day === 0 && <div className="text-xs text-red-500">Surgery</div>}
                    </div>
                    
                    {/* Tasks for this day */}
                    <div className="space-y-2">
                      {protocol.timeline[day]?.map((task, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-gray-100 rounded text-xs"
                        >
                          {task.type === 'form' && '📋'}
                          {task.type === 'exercise' && '🏃‍♂️'}
                          {task.type === 'video' && '📹'}
                          {task.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// CRITICAL: Save to recovery_protocols table
const saveProtocol = async () => {
  const { data, error } = await supabase
    .from('recovery_protocols')
    .insert({
      tenant_id: tenantId,
      name: protocol.name,
      description: protocol.description,
      surgery_type: protocol.surgery_type,
      timeline_data: protocol.timeline,
      created_by: userId,
      is_active: true
    });
};
```

### **TASK 2: Patient Assignment Dashboard (30 minutes)**

#### **Page: `/provider/patients`**
```jsx
// Patient management with journey assignment
export default function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [protocols, setProtocols] = useState([]);

  // Fetch patients and protocols
  useEffect(() => {
    fetchPatients();
    fetchProtocols();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(first_name, last_name, email),
        recovery_protocols(name)
      `)
      .eq('tenant_id', tenantId);
    setPatients(data);
  };

  return (
    <DashboardLayout title="Patient Management">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Recovery</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {patients.filter(p => p.surgery_date && new Date(p.surgery_date) > new Date()).length}
              </div>
              <div className="text-sm text-gray-600">Pre-Surgery</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {patients.filter(p => p.surgery_date && new Date(p.surgery_date) < new Date()).length}
              </div>
              <div className="text-sm text-gray-600">Post-Surgery</div>
            </div>
          </Card>
        </div>

        {/* Patient Table */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Patient List</h3>
            <Button onClick={() => setShowAddPatient(true)}>Add Patient</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Patient</th>
                  <th className="text-left p-3">Surgery Date</th>
                  <th className="text-left p-3">Recovery Day</th>
                  <th className="text-left p-3">Protocol</th>
                  <th className="text-left p-3">Surgeon</th>
                  <th className="text-left p-3">Nurse</th>
                  <th className="text-left p-3">PT</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">
                          {patient.profiles?.first_name} {patient.profiles?.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{patient.profiles?.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {patient.surgery_date ? 
                        new Date(patient.surgery_date).toLocaleDateString() : 
                        'Not Set'
                      }
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.current_recovery_day < 0 ? 'bg-orange-100 text-orange-800' :
                        patient.current_recovery_day === 0 ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        Day {patient.current_recovery_day}
                      </span>
                    </td>
                    <td className="p-3">
                      <select 
                        value={patient.protocol_id || ''}
                        onChange={(e) => assignProtocol(patient.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">Select Protocol</option>
                        {protocols.map(protocol => (
                          <option key={protocol.id} value={protocol.id}>
                            {protocol.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.surgeon_id}
                        role="surgeon"
                        onChange={(id) => assignProvider(patient.id, 'surgeon_id', id)}
                      />
                    </td>
                    <td className="p-3">
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.primary_nurse_id}
                        role="nurse"
                        onChange={(id) => assignProvider(patient.id, 'primary_nurse_id', id)}
                      />
                    </td>
                    <td className="p-3">
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.physical_therapist_id}
                        role="physical_therapist"
                        onChange={(id) => assignProvider(patient.id, 'physical_therapist_id', id)}
                      />
                    </td>
                    <td className="p-3">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => viewPatientDetails(patient.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// CRITICAL: Provider assignment functions
const assignProtocol = async (patientId, protocolId) => {
  await supabase
    .from('patients')
    .update({ protocol_id: protocolId })
    .eq('id', patientId);
  
  // Generate patient tasks based on protocol
  generatePatientTasks(patientId, protocolId);
};

const assignProvider = async (patientId, field, providerId) => {
  await supabase
    .from('patients')
    .update({ [field]: providerId })
    .eq('id', patientId);
};
```

### **TASK 3: Patient Detail View with Journey Customization (30 minutes)**

#### **Page: `/provider/patients/[id]`**
```jsx
// Individual patient management with journey customization
export default function PatientDetail({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    // Fetch patient with all related data
    const { data: patientData } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(*),
        recovery_protocols(*),
        surgeon:profiles!patients_surgeon_id_fkey(*),
        nurse:profiles!patients_primary_nurse_id_fkey(*),
        pt:profiles!patients_physical_therapist_id_fkey(*)
      `)
      .eq('id', patientId)
      .single();

    // Fetch patient tasks
    const { data: tasksData } = await supabase
      .from('patient_tasks')
      .select(`
        *,
        exercises(*),
        forms(*)
      `)
      .eq('patient_id', patientId)
      .order('assigned_date');

    // Fetch conversations
    const { data: conversationsData } = await supabase
      .from('conversations')
      .select(`
        *,
        messages(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    setPatient(patientData);
    setTasks(tasksData);
    setConversations(conversationsData);
  };

  return (
    <DashboardLayout 
      title={`${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`}
      subtitle={`Day ${patient?.current_recovery_day} of Recovery`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Progress */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Recovery Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round((patient?.current_recovery_day + 60) / 260 * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.round((patient?.current_recovery_day + 60) / 260 * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {tasks.filter(t => t.status === 'assigned').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {conversations.length}
                  </div>
                  <div className="text-sm text-gray-600">Conversations</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Journey Timeline */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Journey Timeline</h3>
              <Button onClick={() => setShowCustomizeModal(true)}>
                Customize Journey
              </Button>
            </div>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-4 border rounded-lg ${
                    task.status === 'completed' ? 'bg-green-50 border-green-200' :
                    task.status === 'assigned' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600">{task.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Day {task.assigned_date} • {task.task_type}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => modifyTask(task.id)}
                      >
                        Modify
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Surgery Type</label>
                <div className="text-sm">{patient?.surgery_type}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Surgery Date</label>
                <div className="text-sm">
                  {patient?.surgery_date ? 
                    new Date(patient.surgery_date).toLocaleDateString() : 
                    'Not Set'
                  }
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Activity Level</label>
                <div className="text-sm">{patient?.activity_level}</div>
              </div>
            </div>
          </Card>

          {/* Care Team */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Care Team</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Surgeon</label>
                <div className="text-sm">
                  {patient?.surgeon ? 
                    `${patient.surgeon.first_name} ${patient.surgeon.last_name}` : 
                    'Not Assigned'
                  }
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Primary Nurse</label>
                <div className="text-sm">
                  {patient?.nurse ? 
                    `${patient.nurse.first_name} ${patient.nurse.last_name}` : 
                    'Not Assigned'
                  }
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Physical Therapist</label>
                <div className="text-sm">
                  {patient?.pt ? 
                    `${patient.pt.first_name} ${patient.pt.last_name}` : 
                    'Not Assigned'
                  }
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => startConversation(patient.id)}
              >
                Start Chat Session
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => viewConversations(patient.id)}
              >
                View All Conversations
              </Button>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => generateReport(patient.id)}
              >
                Generate Progress Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

## 🔗 **DATA INTEGRATION REQUIREMENTS**

### **Critical Database Operations:**
```javascript
// 1. Generate patient tasks from protocol
const generatePatientTasks = async (patientId, protocolId) => {
  const { data: protocol } = await supabase
    .from('recovery_protocols')
    .select('timeline_data')
    .eq('id', protocolId)
    .single();

  const tasks = [];
  Object.entries(protocol.timeline_data).forEach(([day, dayTasks]) => {
    dayTasks.forEach(task => {
      tasks.push({
        patient_id: patientId,
        title: task.name,
        description: task.description,
        task_type: task.type,
        exercise_id: task.type === 'exercise' ? task.id : null,
        form_id: task.type === 'form' ? task.id : null,
        assigned_date: day,
        status: 'assigned',
        assigned_by: userId
      });
    });
  });

  await supabase.from('patient_tasks').insert(tasks);
};

// 2. Calculate recovery day based on surgery date
const calculateRecoveryDay = (surgeryDate) => {
  const today = new Date();
  const surgery = new Date(surgeryDate);
  const diffTime = today - surgery;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 3. Update patient recovery day daily
const updatePatientRecoveryDays = async () => {
  const { data: patients } = await supabase
    .from('patients')
    .select('id, surgery_date')
    .not('surgery_date', 'is', null);

  const updates = patients.map(patient => ({
    id: patient.id,
    current_recovery_day: calculateRecoveryDay(patient.surgery_date)
  }));

  await supabase.from('patients').upsert(updates);
};
```

## ✅ **COMPLETION CHECKLIST**

### **Provider Journey Management:**
- [ ] Recovery protocol builder with timeline
- [ ] Patient assignment dashboard
- [ ] Individual patient detail views
- [ ] Provider assignment system
- [ ] Journey customization capabilities
- [ ] Real-time progress tracking
- [ ] Database integration with all tables

### **Next Phase Ready:**
- [ ] Patient task generation working
- [ ] Recovery day calculation accurate
- [ ] Provider assignments functional
- [ ] Ready for chat system integration

**ESTIMATED TIME: 1 hour 45 minutes**
**PRIORITY: CRITICAL - This feeds the chat system**

