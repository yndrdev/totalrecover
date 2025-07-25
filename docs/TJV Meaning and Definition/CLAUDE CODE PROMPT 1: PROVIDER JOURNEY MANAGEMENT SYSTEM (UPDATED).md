# CLAUDE CODE PROMPT 1: PROVIDER JOURNEY MANAGEMENT SYSTEM (UPDATED)

## 🎯 **OBJECTIVE**
Build the provider-side journey management system where practice admins create recovery templates and clinic staff manage patient assignments. **IMPORTANT: All provider roles (practice_admin, clinic_admin, surgeon, nurse) have identical abilities - role distinction is ONLY for audit trail tracking.**

## 📋 **REQUIREMENTS OVERVIEW**

### **Core Functionality:**
- Practice admins create ONE main recovery template (-60 to +200 days from surgery)
- Template includes forms, exercises, videos assigned to specific days
- Clinic staff can assign patients to journeys and customize per patient
- **Universal provider interface** - all roles have same capabilities
- **Audit trail tracking** - record who performed each action
- Real-time patient progress tracking

### **Role Clarification:**
- **practice_admin, clinic_admin, surgeon, nurse** = **SAME INTERFACE & ABILITIES**
- Role field is used ONLY for:
  - Audit trail ("Dr. Smith assigned patient to protocol")
  - Assignment tracking ("Patient's surgeon is Dr. Jones")
  - Data analytics ("How many tasks did nurses complete?")
- **NO role-based permissions or different interfaces**

### **Database Tables to Use:**
- `tenants` (practice/clinic hierarchy)
- `profiles` (all users including providers - role field for audit only)
- `patients` (patient records with surgery dates)
- `recovery_protocols` (the journey templates)
- `patient_tasks` (assigned tasks per patient)
- `exercises`, `forms`, `conversations`, `messages`
- `audit_logs` (track who did what for compliance)

## 🏗️ **IMPLEMENTATION TASKS**

### **TASK 1: Universal Provider Dashboard (45 minutes)**

#### **Page: `/provider/dashboard`**
```jsx
// Universal dashboard for ALL provider roles
// Same interface regardless of role (practice_admin, clinic_admin, surgeon, nurse)
export default function ProviderDashboard() {
  const [patients, setPatients] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const { user } = useUser();

  // Get user's role for audit trail only (not permissions)
  const userRole = user?.user_metadata?.role || 'provider';
  const userName = `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}`;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // All providers see ALL patients in their tenant
    const { data: patientsData } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(first_name, last_name, email),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name),
        nurse:profiles!patients_primary_nurse_id_fkey(first_name, last_name),
        pt:profiles!patients_physical_therapist_id_fkey(first_name, last_name),
        recovery_protocols(name),
        patient_tasks(count)
      `)
      .eq('tenant_id', user.user_metadata.tenant_id)
      .order('created_at', { ascending: false });

    setPatients(patientsData || []);

    // Fetch protocols
    const { data: protocolsData } = await supabase
      .from('recovery_protocols')
      .select('*')
      .eq('tenant_id', user.user_metadata.tenant_id)
      .eq('is_active', true);

    setProtocols(protocolsData || []);

    // Calculate metrics
    calculateMetrics(patientsData);
  };

  // Log all actions for audit trail
  const logAction = async (action, details) => {
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id: user.user_metadata.tenant_id,
        user_id: user.id,
        user_role: userRole,
        user_name: userName,
        action,
        details,
        timestamp: new Date().toISOString()
      });
  };

  const assignProtocol = async (patientId, protocolId) => {
    // Update patient
    await supabase
      .from('patients')
      .update({ protocol_id: protocolId })
      .eq('id', patientId);
    
    // Generate patient tasks
    await generatePatientTasks(patientId, protocolId);
    
    // Log action for audit trail
    await logAction('assign_protocol', {
      patient_id: patientId,
      protocol_id: protocolId,
      action_by: userName,
      action_by_role: userRole
    });
    
    // Refresh data
    fetchDashboardData();
  };

  const assignProvider = async (patientId, providerField, providerId, providerName) => {
    // Update patient assignment
    await supabase
      .from('patients')
      .update({ [providerField]: providerId })
      .eq('id', patientId);
    
    // Log action for audit trail
    await logAction('assign_provider', {
      patient_id: patientId,
      provider_field: providerField,
      provider_id: providerId,
      provider_name: providerName,
      assigned_by: userName,
      assigned_by_role: userRole
    });
    
    fetchDashboardData();
  };

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      subtitle={`Welcome ${userName} (${userRole})`}
    >
      <div className="space-y-8">
        {/* Universal Metrics - Same for all roles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Recovery</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {patients.filter(p => p.current_recovery_day < 0).length}
              </div>
              <div className="text-sm text-gray-600">Pre-Surgery</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {patients.filter(p => p.current_recovery_day >= 0).length}
              </div>
              <div className="text-sm text-gray-600">Post-Surgery</div>
            </div>
          </Card>
        </div>

        {/* Universal Patient Management - Same interface for all roles */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Patient Management</h3>
            <div className="flex space-x-3">
              <Button onClick={() => setShowAddPatient(true)}>Add Patient</Button>
              <Button 
                variant="secondary"
                onClick={() => router.push('/provider/protocols/builder')}
              >
                Create Protocol
              </Button>
            </div>
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
                      {/* All roles can assign protocols */}
                      <select 
                        value={patient.protocol_id || ''}
                        onChange={(e) => assignProtocol(patient.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
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
                      {/* All roles can assign surgeons */}
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.surgeon_id}
                        currentName={patient.surgeon ? `${patient.surgeon.first_name} ${patient.surgeon.last_name}` : ''}
                        role="surgeon"
                        onChange={(id, name) => assignProvider(patient.id, 'surgeon_id', id, name)}
                      />
                    </td>
                    <td className="p-3">
                      {/* All roles can assign nurses */}
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.primary_nurse_id}
                        currentName={patient.nurse ? `${patient.nurse.first_name} ${patient.nurse.last_name}` : ''}
                        role="nurse"
                        onChange={(id, name) => assignProvider(patient.id, 'primary_nurse_id', id, name)}
                      />
                    </td>
                    <td className="p-3">
                      {/* All roles can assign PTs */}
                      <ProviderSelect 
                        patientId={patient.id}
                        currentId={patient.physical_therapist_id}
                        currentName={patient.pt ? `${patient.pt.first_name} ${patient.pt.last_name}` : ''}
                        role="physical_therapist"
                        onChange={(id, name) => assignProvider(patient.id, 'physical_therapist_id', id, name)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => router.push(`/provider/patients/${patient.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => router.push(`/provider/chat-monitor?patient=${patient.id}`)}
                        >
                          Chat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity with Audit Trail */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{activity.description}</div>
                  <div className="text-xs text-gray-600">
                    by {activity.user_name} ({activity.user_role}) • {activity.timestamp}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activity.action_type === 'assign' ? 'bg-blue-100 text-blue-800' :
                  activity.action_type === 'complete' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.action_type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Provider Selection Component (used by all roles)
const ProviderSelect = ({ patientId, currentId, currentName, role, onChange }) => {
  const [providers, setProviders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [role]);

  const fetchProviders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('tenant_id', user.user_metadata.tenant_id)
      .eq('role', role)
      .eq('is_active', true)
      .order('last_name');

    setProviders(data || []);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-left w-full px-2 py-1 border rounded text-sm hover:bg-gray-50"
      >
        {currentName || 'Select...'}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-48 bg-white border rounded shadow-lg mt-1">
          <div className="max-h-40 overflow-y-auto">
            <button
              onClick={() => {
                onChange(null, '');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              Unassign
            </button>
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => {
                  onChange(provider.id, `${provider.first_name} ${provider.last_name}`);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                {provider.first_name} {provider.last_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### **TASK 2: Recovery Protocol Builder (45 minutes)**
*[Same as original - all roles can create protocols]*

### **TASK 3: Patient Detail View (30 minutes)**
*[Same as original - all roles have same capabilities]*

## 🔗 **CRITICAL AUDIT TRAIL IMPLEMENTATION**

### **Audit Logging System:**
```javascript
// Comprehensive audit trail for compliance
const AuditLogger = {
  async logAction(action, details, userId, userRole, userName) {
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id: getCurrentTenantId(),
        user_id: userId,
        user_role: userRole,
        user_name: userName,
        action,
        details: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });
  },

  // Log all critical actions
  async logPatientAssignment(patientId, providerId, providerRole, assignedBy) {
    await this.logAction('assign_provider', {
      patient_id: patientId,
      provider_id: providerId,
      provider_role: providerRole,
      assigned_by: assignedBy.name,
      assigned_by_role: assignedBy.role
    }, assignedBy.id, assignedBy.role, assignedBy.name);
  },

  async logProtocolAssignment(patientId, protocolId, assignedBy) {
    await this.logAction('assign_protocol', {
      patient_id: patientId,
      protocol_id: protocolId,
      assigned_by: assignedBy.name,
      assigned_by_role: assignedBy.role
    }, assignedBy.id, assignedBy.role, assignedBy.name);
  },

  async logTaskCompletion(taskId, patientId, completedBy) {
    await this.logAction('complete_task', {
      task_id: taskId,
      patient_id: patientId,
      completed_by: completedBy.name,
      completed_by_role: completedBy.role
    }, completedBy.id, completedBy.role, completedBy.name);
  }
};
```

## ✅ **COMPLETION CHECKLIST**

### **Universal Provider Interface:**
- [ ] All provider roles have identical interface and capabilities
- [ ] Role field used ONLY for audit trail tracking
- [ ] Comprehensive audit logging for all actions
- [ ] Provider assignment system with audit trail
- [ ] Protocol assignment with tracking

### **Audit Trail Features:**
- [ ] Log who assigned patients to providers
- [ ] Log who created/modified protocols
- [ ] Log who completed tasks
- [ ] Track all patient interactions
- [ ] Compliance-ready audit reports

**ESTIMATED TIME: 2 hours**
**PRIORITY: CRITICAL - Foundation with proper audit trail**

