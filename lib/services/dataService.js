import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Comprehensive data service for all database operations
 * Handles tenant isolation, performance optimization, and real-time subscriptions
 */
export class DataService {
  
  // ===== TENANT MANAGEMENT =====
  static async getTenantHierarchy(tenantId) {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        parent:tenants!parent_tenant_id(*),
        children:tenants!parent_tenant_id(*),
        profiles!profiles_tenant_id_fkey(count),
        patients!patients_tenant_id_fkey(count)
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
        patients!patients_tenant_id_fkey(*),
        recovery_protocols!recovery_protocols_tenant_id_fkey(*)
      `)
      .eq('id', practiceId)
      .eq('tenant_type', 'practice')
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllPractices() {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        clinics:tenants!parent_tenant_id(count),
        patients!patients_tenant_id_fkey(count),
        profiles!profiles_tenant_id_fkey(count)
      `)
      .eq('tenant_type', 'practice')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createPractice(practiceData) {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        ...practiceData,
        tenant_type: 'practice',
        created_at: new Date().toISOString()
      })
      .select()
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
        profiles!patients_user_id_fkey(first_name, last_name, email, full_name),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name, full_name),
        nurse:profiles!patients_primary_nurse_id_fkey(first_name, last_name, full_name),
        pt:profiles!patients_physical_therapist_id_fkey(first_name, last_name, full_name),
        recovery_protocols!patients_recovery_protocol_id_fkey(name, description),
        conversations!conversations_patient_id_fkey(count),
        patient_tasks!patient_tasks_patient_id_fkey(count)
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
        recovery_protocols!patients_recovery_protocol_id_fkey(*),
        conversations!conversations_patient_id_fkey(*),
        patient_tasks!patient_tasks_patient_id_fkey(
          *,
          exercises!patient_tasks_exercise_id_fkey(*),
          forms!patient_tasks_form_id_fkey(*)
        ),
        form_responses!form_responses_patient_id_fkey(*),
        exercise_completions!exercise_completions_patient_id_fkey(*)
      `)
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getPatientByUserId(userId, tenantId) {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(*),
        surgeon:profiles!patients_surgeon_id_fkey(*),
        nurse:profiles!patients_primary_nurse_id_fkey(*),
        pt:profiles!patients_physical_therapist_id_fkey(*),
        recovery_protocols!patients_recovery_protocol_id_fkey(*),
        conversations!conversations_patient_id_fkey(*),
        patient_tasks!patient_tasks_patient_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createPatient(patientData) {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        created_at: new Date().toISOString(),
        current_recovery_day: this.calculateRecoveryDay(patientData.surgery_date)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePatient(patientId, updates) {
    const { data, error } = await supabase
      .from('patients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select()
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
        created_by_profile:profiles!recovery_protocols_created_by_fkey(first_name, last_name, full_name),
        patients!patients_recovery_protocol_id_fkey(count)
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
      .insert({
        ...protocolData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRecoveryProtocol(protocolId, updates) {
    const { data, error } = await supabase
      .from('recovery_protocols')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', protocolId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async generatePatientTasks(patientId, protocolId, tenantId) {
    // Get protocol timeline
    const { data: protocol } = await supabase
      .from('recovery_protocols')
      .select('timeline_data, name')
      .eq('id', protocolId)
      .single();

    if (!protocol) throw new Error('Protocol not found');

    // Generate tasks based on timeline
    const tasks = [];
    if (protocol.timeline_data && typeof protocol.timeline_data === 'object') {
      Object.entries(protocol.timeline_data).forEach(([day, dayTasks]) => {
        if (Array.isArray(dayTasks)) {
          dayTasks.forEach(task => {
            tasks.push({
              patient_id: patientId,
              tenant_id: tenantId,
              title: task.name || task.title,
              description: task.description || '',
              task_type: task.type,
              exercise_id: task.type === 'exercise' ? task.id : null,
              form_id: task.type === 'form' ? task.id : null,
              assigned_date: parseInt(day),
              status: 'assigned',
              created_at: new Date().toISOString()
            });
          });
        }
      });
    }

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
          profiles!patients_user_id_fkey(first_name, last_name, full_name)
        ),
        messages!messages_conversation_id_fkey(count)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getConversationMessages(conversationId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse(); // Return in chronological order
  }

  static async createMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        sent_at: new Date().toISOString()
      })
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

  static async createConversation(conversationData) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        ...conversationData,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
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

  static async getFormById(formId) {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) throw error;
    return data;
  }

  static async submitFormResponse(responseData) {
    const { data, error } = await supabase
      .from('form_responses')
      .insert({
        ...responseData,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getFormResponses(patientId, formId = null) {
    let query = supabase
      .from('form_responses')
      .select(`
        *,
        forms!form_responses_form_id_fkey(name, form_type)
      `)
      .eq('patient_id', patientId);

    if (formId) {
      query = query.eq('form_id', formId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });
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

  static async getExerciseById(exerciseId) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) throw error;
    return data;
  }

  static async recordExerciseCompletion(completionData) {
    const { data, error } = await supabase
      .from('exercise_completions')
      .insert({
        ...completionData,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getExerciseCompletions(patientId, exerciseId = null) {
    let query = supabase
      .from('exercise_completions')
      .select(`
        *,
        exercises!exercise_completions_exercise_id_fkey(name, exercise_type)
      `)
      .eq('patient_id', patientId);

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query.order('completed_at', { ascending: false });
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
      .update({ 
        [providerField]: providerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== TASK MANAGEMENT =====
  static async getPatientTasks(patientId, status = null, assignedDate = null) {
    let query = supabase
      .from('patient_tasks')
      .select(`
        *,
        exercises!patient_tasks_exercise_id_fkey(*),
        forms!patient_tasks_form_id_fkey(*)
      `)
      .eq('patient_id', patientId);

    if (status) {
      query = query.eq('status', status);
    }
    if (assignedDate !== null) {
      query = query.eq('assigned_date', assignedDate);
    }

    const { data, error } = await query.order('assigned_date');
    if (error) throw error;
    return data;
  }

  static async updateTaskStatus(taskId, status, completionData = {}) {
    const { data, error } = await supabase
      .from('patient_tasks')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        completion_data: completionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
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

    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const totalTasks = tasks?.length || 0;

    return {
      totalTasks,
      completedTasks,
      totalConversations: conversations?.length || 0,
      formsCompleted: formResponses?.length || 0,
      exercisesCompleted: exerciseCompletions?.length || 0,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
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

  static async getPlatformMetrics() {
    const [
      { data: totalPractices },
      { data: totalPatients },
      { data: activeConversations },
      { data: completedTasks }
    ] = await Promise.all([
      supabase.from('tenants').select('id', { count: 'exact' }).eq('tenant_type', 'practice'),
      supabase.from('patients').select('id', { count: 'exact' }),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('patient_tasks').select('id', { count: 'exact' }).eq('status', 'completed')
    ]);

    return {
      totalPractices: totalPractices?.length || 0,
      totalPatients: totalPatients?.length || 0,
      activeConversations: activeConversations?.length || 0,
      completedTasks: completedTasks?.length || 0
    };
  }

  // ===== ALERTS & NOTIFICATIONS =====
  static async createAlert(alertData) {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alertData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAlerts(tenantId, status = 'active') {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        patients!alerts_patient_id_fkey(
          *,
          profiles!patients_user_id_fkey(first_name, last_name, full_name)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateAlertStatus(alertId, status) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  static subscribeToTenantAlerts(tenantId, callback) {
    return supabase
      .channel(`alerts-${tenantId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `tenant_id=eq.${tenantId}`
      }, callback)
      .subscribe();
  }

  static subscribeToTenantMessages(tenantId, callback) {
    return supabase
      .channel(`messages-${tenantId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `tenant_id=eq.${tenantId}`
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

    if (patients && patients.length > 0) {
      const updates = patients.map(patient => ({
        id: patient.id,
        current_recovery_day: this.calculateRecoveryDay(patient.surgery_date),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('patients').upsert(updates);
      if (error) throw error;
    }
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getSurgeryTypeName(type) {
    const types = {
      'TKA': 'Total Knee Replacement',
      'THA': 'Total Hip Replacement',
      'TSA': 'Total Shoulder Replacement',
      'UKA': 'Partial Knee Replacement',
      'revision': 'Revision Surgery'
    };
    return types[type] || type;
  }

  static getRecoveryPhase(recoveryDay) {
    if (recoveryDay < 0) return 'Pre-Surgery';
    if (recoveryDay <= 7) return 'Early Recovery (0-7 days)';
    if (recoveryDay <= 30) return 'Active Recovery (1-4 weeks)';
    if (recoveryDay <= 90) return 'Late Recovery (1-3 months)';
    return 'Long-term Recovery (3+ months)';
  }

  // ===== ADDITIONAL MISSING METHODS =====
  static async getProvidersByRole(tenantId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('role', role)
      .eq('is_active', true)
      .order('last_name');
    
    if (error) throw error;
    return data;
  }

  static async createProvider(providerData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...providerData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProvider(providerId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createClinic(clinicData) {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        ...clinicData,
        tenant_type: 'clinic',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getClinics(practiceId) {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        patients!patients_tenant_id_fkey(count),
        profiles!profiles_tenant_id_fkey(count)
      `)
      .eq('parent_tenant_id', practiceId)
      .eq('tenant_type', 'clinic')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getRecentActivity(tenantId, limit = 10) {
    // This would typically come from an audit_logs table
    // For now, we'll generate some sample activity based on recent data changes
    const [
      { data: recentPatients },
      { data: recentTasks },
      { data: recentConversations }
    ] = await Promise.all([
      supabase.from('patients')
        .select('*, profiles!patients_user_id_fkey(first_name, last_name)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('patient_tasks')
        .select('*, patients!patient_tasks_patient_id_fkey(profiles!patients_user_id_fkey(first_name, last_name))')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase.from('conversations')
        .select('*, patients!conversations_patient_id_fkey(profiles!patients_user_id_fkey(first_name, last_name))')
        .eq('tenant_id', tenantId)
        .order('last_message_at', { ascending: false })
        .limit(5)
    ]);

    const activity = [];

    // Add recent patient registrations
    recentPatients?.forEach(patient => {
      activity.push({
        id: `patient_${patient.id}`,
        description: `New patient ${patient.profiles?.first_name} ${patient.profiles?.last_name} registered`,
        timestamp: this.formatDateTime(patient.created_at),
        type: 'patient_registered',
        created_at: patient.created_at
      });
    });

    // Add recent task completions
    recentTasks?.forEach(task => {
      activity.push({
        id: `task_${task.id}`,
        description: `${task.patients?.profiles?.first_name || 'Patient'} completed task: ${task.title}`,
        timestamp: this.formatDateTime(task.completed_at),
        type: 'task_completed',
        created_at: task.completed_at
      });
    });

    // Add recent conversations
    recentConversations?.forEach(conv => {
      activity.push({
        id: `conv_${conv.id}`,
        description: `New conversation started with ${conv.patients?.profiles?.first_name || 'patient'}`,
        timestamp: this.formatDateTime(conv.created_at),
        type: 'conversation_started',
        created_at: conv.created_at
      });
    });

    // Sort by recency and return limited results
    return activity
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  static async assignProtocolToPatient(patientId, protocolId, tenantId) {
    // Update patient with protocol
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .update({ 
        recovery_protocol_id: protocolId,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select()
      .single();

    if (patientError) throw patientError;

    // Generate tasks for this patient based on the protocol
    await this.generatePatientTasks(patientId, protocolId, tenantId);

    return patient;
  }

  static async getPatientsByProvider(providerId, providerRole, tenantId) {
    let query = supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(first_name, last_name, email, full_name),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name),
        nurse:profiles!patients_primary_nurse_id_fkey(first_name, last_name),
        pt:profiles!patients_physical_therapist_id_fkey(first_name, last_name),
        recovery_protocols!patients_recovery_protocol_id_fkey(name),
        conversations!conversations_patient_id_fkey(count),
        patient_tasks!patient_tasks_patient_id_fkey(count)
      `)
      .eq('tenant_id', tenantId);

    // Filter by provider role
    switch (providerRole) {
      case 'surgeon':
        query = query.eq('surgeon_id', providerId);
        break;
      case 'nurse':
        query = query.eq('primary_nurse_id', providerId);
        break;
      case 'physical_therapist':
        query = query.eq('physical_therapist_id', providerId);
        break;
      default:
        // For practice_admin and clinic_admin, show all patients
        break;
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // ===== IMPROVED FORMATTING AND UTILITIES =====
  static formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  static getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  static calculateCompletionRate(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }

  // ===== AUDIT LOGGING SYSTEM =====
  static async logAction(action, details, userId, userRole, userName, tenantId) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          user_role: userRole,
          user_name: userName,
          action,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString(),
          ip_address: 'system', // Would get real IP in production
          user_agent: 'healthcare-app'
        });

      if (error) {
        console.error('Error logging audit action:', error);
      }
      return data;
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit logging shouldn't break main functionality
    }
  }

  static async logPatientAssignment(patientId, providerId, providerRole, assignedBy, tenantId) {
    await this.logAction('assign_provider', {
      patient_id: patientId,
      provider_id: providerId,
      provider_role: providerRole,
      assigned_by_name: assignedBy.name,
      assigned_by_role: assignedBy.role,
      assigned_by_id: assignedBy.id
    }, assignedBy.id, assignedBy.role, assignedBy.name, tenantId);
  }

  static async logProtocolAssignment(patientId, protocolId, assignedBy, tenantId) {
    await this.logAction('assign_protocol', {
      patient_id: patientId,
      protocol_id: protocolId,
      assigned_by_name: assignedBy.name,
      assigned_by_role: assignedBy.role,
      assigned_by_id: assignedBy.id
    }, assignedBy.id, assignedBy.role, assignedBy.name, tenantId);
  }

  static async logTaskCompletion(taskId, patientId, completedBy, tenantId) {
    await this.logAction('complete_task', {
      task_id: taskId,
      patient_id: patientId,
      completed_by_name: completedBy.name,
      completed_by_role: completedBy.role,
      completed_by_id: completedBy.id
    }, completedBy.id, completedBy.role, completedBy.name, tenantId);
  }

  static async logProviderIntervention(patientId, interventionType, message, provider, tenantId) {
    await this.logAction('provider_intervention', {
      patient_id: patientId,
      intervention_type: interventionType,
      message: message,
      provider_name: provider.name,
      provider_role: provider.role,
      provider_id: provider.id
    }, provider.id, provider.role, provider.name, tenantId);
  }

  // ===== PERFORMANCE OPTIMIZATION =====
  static async getOptimizedPatientsForTenant(tenantId, limit = 50, offset = 0) {
    // Optimized query for large datasets
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        mrn,
        surgery_type,
        surgery_date,
        current_recovery_day,
        status,
        created_at,
        profiles!patients_user_id_fkey(first_name, last_name, email),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name),
        recovery_protocols!patients_recovery_protocol_id_fkey(name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  static async searchPatients(tenantId, searchTerm, filters = {}) {
    let query = supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_user_id_fkey(first_name, last_name, email, full_name),
        surgeon:profiles!patients_surgeon_id_fkey(first_name, last_name),
        recovery_protocols!patients_recovery_protocol_id_fkey(name)
      `)
      .eq('tenant_id', tenantId);

    // Search across patient name, email, MRN
    if (searchTerm) {
      query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,mrn.ilike.%${searchTerm}%`);
    }

    // Apply additional filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.surgery_type) query = query.eq('surgery_type', filters.surgery_type);
    if (filters.surgeon_id) query = query.eq('surgeon_id', filters.surgeon_id);

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100); // Reasonable limit for search results

    if (error) throw error;
    return data;
  }

  static async getTenantMetricsOptimized(tenantId) {
    // Use parallel queries for better performance
    const queries = await Promise.allSettled([
      supabase.from('patients').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      supabase.from('conversations').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('status', 'active'),
      supabase.from('patient_tasks').select('id', { count: 'exact' }).eq('status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('tenant_id', tenantId).neq('role', 'patient')
    ]);

    const [patients, activeConversations, completedTasks, providers] = queries;

    return {
      totalPatients: patients.status === 'fulfilled' ? patients.value.data?.length || 0 : 0,
      activeConversations: activeConversations.status === 'fulfilled' ? activeConversations.value.data?.length || 0 : 0,
      completedTasks: completedTasks.status === 'fulfilled' ? completedTasks.value.data?.length || 0 : 0,
      totalProviders: providers.status === 'fulfilled' ? providers.value.data?.length || 0 : 0
    };
  }

  static async cacheFrequentlyAccessedData(tenantId) {
    // Cache frequently accessed data in localStorage for performance
    try {
      const [protocols, providers, forms, exercises] = await Promise.all([
        this.getRecoveryProtocols(tenantId),
        this.getProviders(tenantId),
        this.getForms(tenantId),
        this.getExercises(tenantId)
      ]);

      const cacheData = {
        protocols,
        providers,
        forms,
        exercises,
        cached_at: new Date().toISOString()
      };

      localStorage.setItem(`tenant_cache_${tenantId}`, JSON.stringify(cacheData));
      return cacheData;
    } catch (error) {
      console.error('Error caching data:', error);
      return null;
    }
  }

  static getCachedTenantData(tenantId) {
    try {
      const cached = localStorage.getItem(`tenant_cache_${tenantId}`);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(data.cached_at).getTime();
      
      // Cache expires after 5 minutes
      if (cacheAge > 5 * 60 * 1000) {
        localStorage.removeItem(`tenant_cache_${tenantId}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  // ===== PATIENT DATA AGGREGATION =====
  static async getLatestPainLevel(patientId) {
    try {
      // First try to get from latest completed tasks with pain assessment
      const { data: tasks, error: tasksError } = await supabase
        .from('patient_tasks')
        .select('completion_data, updated_at')
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .not('completion_data', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!tasksError && tasks) {
        // Look for pain level in completion data
        for (const task of tasks) {
          if (task.completion_data && typeof task.completion_data === 'object') {
            const painLevel = task.completion_data.pain_level || 
                            task.completion_data.painLevel ||
                            task.completion_data.pain;
            if (painLevel !== undefined && painLevel !== null) {
              return parseInt(painLevel);
            }
          }
        }
      }

      // Try to get from form responses
      const { data: formResponses, error: formError } = await supabase
        .from('form_responses')
        .select('response_data, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!formError && formResponses) {
        for (const response of formResponses) {
          if (response.response_data && typeof response.response_data === 'object') {
            const painLevel = response.response_data.pain_level || 
                            response.response_data.painLevel ||
                            response.response_data.pain;
            if (painLevel !== undefined && painLevel !== null) {
              return parseInt(painLevel);
            }
          }
        }
      }

      // Try patient assessments
      const { data: assessments, error: assessError } = await supabase
        .from('patient_assessments')
        .select('assessment_data, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!assessError && assessments && assessments.length > 0) {
        const assessment = assessments[0];
        if (assessment.assessment_data && typeof assessment.assessment_data === 'object') {
          const painLevel = assessment.assessment_data.pain_level || 
                          assessment.assessment_data.painLevel ||
                          assessment.assessment_data.pain;
          if (painLevel !== undefined && painLevel !== null) {
            return parseInt(painLevel);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting latest pain level:', error);
      return null;
    }
  }

  static async getLatestPatientMessage(patientId) {
    try {
      // Get latest message from conversations
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', patientId)
        .single();

      if (!convError && conversation) {
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conversation.id)
          .eq('sender_type', 'patient')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!msgError && messages && messages.length > 0) {
          return messages[0].content;
        }
      }

      // Try to get from alerts
      const { data: alerts, error: alertError } = await supabase
        .from('alerts')
        .select('description, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!alertError && alerts && alerts.length > 0) {
        return alerts[0].description;
      }

      // Try to get from recent activity
      const { data: activities, error: actError } = await supabase
        .from('activity_logs')
        .select('description')
        .eq('patient_id', patientId)
        .like('type', '%patient%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!actError && activities && activities.length > 0) {
        return activities[0].description;
      }

      return null;
    } catch (error) {
      console.error('Error getting latest patient message:', error);
      return null;
    }
  }

  // ===== ERROR HANDLING =====
  static handleError(error) {
    console.error('DataService Error:', error);
    
    if (error.code === 'PGRST301') {
      throw new Error('Record not found');
    }
    if (error.code === 'PGRST204') {
      throw new Error('No data returned');
    }
    if (error.code === '23505') {
      throw new Error('Duplicate record');
    }
    if (error.code === '23503') {
      throw new Error('Referenced record not found');
    }
    
    throw error;
  }
}

export default DataService;