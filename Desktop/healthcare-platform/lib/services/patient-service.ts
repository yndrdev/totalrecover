import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@supabase/supabase-js';

interface PatientData {
  id: string;
  profile_id: string;
  tenant_id: string;
  practice_id?: string;
  mrn: string;
  date_of_birth?: string;
  surgery_date?: string;
  surgery_type?: string;
  surgeon_id?: string;
  primary_provider_id?: string;
  phone_number?: string;
  emergency_contact?: any;
  medical_history?: any;
  insurance_info?: any;
  preferred_language?: string;
  status: 'active' | 'inactive' | 'discharged';
  created_at?: string;
  updated_at?: string;
  // Profile data from join
  profile?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface PatientProtocol {
  id: string;
  patient_id: string;
  protocol_id: string;
  surgery_date: string;
  surgery_type: string;
  assigned_by: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  protocol?: {
    name: string;
    description?: string;
  };
}

export class PatientService {
  private supabase: any;
  private useServiceRole: boolean;

  constructor() {
    // In development with BYPASS_AUTH, use service role for full access
    this.useServiceRole = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                         (process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production');
    
    if (this.useServiceRole && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('[PatientService] Using standard client (dev mode)');
      // For now, use the regular client but log that we're in dev mode
      this.supabase = createClient();
    } else {
      this.supabase = createClient();
    }
  }

  /**
   * Get all patients for the current user's tenant with pagination
   */
  async getPatients({
    page = 1,
    limit = 10,
    search = '',
    status = 'all'
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'discharged' | 'all';
  }) {
    console.log('[PatientService] getPatients called with:', { page, limit, search, status });
    
    // Check authentication context
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    console.log('[PatientService] Auth context:', {
      isAuthenticated: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError
    });
    
    try {
      // Modified query to join with profiles table where role='patient'
      // This ensures we get all patient users even if they don't have a patients table entry yet
      let query = this.supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          date_of_birth,
          tenant_id,
          created_at,
          updated_at,
          patient:patients!profiles_id_fkey(
            id,
            mrn,
            surgery_date,
            surgery_type,
            surgeon_id,
            primary_provider_id,
            primary_nurse_id,
            physical_therapist_id,
            phone_number,
            emergency_contact,
            medical_history,
            insurance_info,
            preferred_language,
            status
          )
        `, { count: 'exact' })
        .eq('role', 'patient');

      // Apply search filter
      if (search) {
        query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      // Apply status filter (check in joined patient data)
      if (status !== 'all') {
        query = query.eq('patient.status', status);
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('[PatientService] Query error:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = data?.map(user => ({
        id: user.patient?.[0]?.id || user.id,
        profile_id: user.id,
        user_id: user.id,
        tenant_id: user.tenant_id,
        mrn: user.patient?.[0]?.mrn || user.email.split('@')[0],
        date_of_birth: user.date_of_birth,
        surgery_date: user.patient?.[0]?.surgery_date,
        surgery_type: user.patient?.[0]?.surgery_type,
        surgeon_id: user.patient?.[0]?.surgeon_id,
        primary_provider_id: user.patient?.[0]?.primary_provider_id,
        primary_nurse_id: user.patient?.[0]?.primary_nurse_id,
        physical_therapist_id: user.patient?.[0]?.physical_therapist_id,
        phone_number: user.patient?.[0]?.phone_number || user.phone,
        emergency_contact: user.patient?.[0]?.emergency_contact,
        medical_history: user.patient?.[0]?.medical_history,
        insurance_info: user.patient?.[0]?.insurance_info,
        preferred_language: user.patient?.[0]?.preferred_language,
        status: user.patient?.[0]?.status || 'active',
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      })) || [];

      console.log('[PatientService] Query successful:', {
        dataLength: transformedData.length,
        totalCount: count || 0,
        firstPatient: transformedData[0]
      });

      return {
        patients: transformedData,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error: any) {
      console.error('Error fetching patients:', {
        message: error?.message || 'Unknown error',
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        error
      });
      throw error;
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatientById(patientId: string) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!profile_id(
            id,
            email,
            first_name,
            last_name
          ),
          protocols:patient_protocols(
            id,
            protocol_id,
            surgery_date,
            surgery_type,
            status,
            protocol:protocols(name, description)
          )
        `)
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: Omit<PatientData, 'id' | 'created_at' | 'updated_at'> & {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    try {
      // First create a user account for the patient
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: patientData.email,
        password: Math.random().toString(36).slice(-8), // Generate temp password
        options: {
          data: {
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            role: 'patient'
          }
        }
      });

      if (authError) throw authError;

      // Get current user's tenant from profiles
      const { data: currentUser } = await this.supabase.auth.getUser();
      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', currentUser?.user?.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Create profile record
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: patientData.email,
          first_name: patientData.first_name,
          last_name: patientData.last_name,
          role: 'patient',
          tenant_id: userData.tenant_id,
          phone: patientData.phone
        });

      if (profileError) throw profileError;

      // Create patient record
      const { data, error } = await this.supabase
        .from('patients')
        .insert({
          profile_id: authData.user!.id,
          tenant_id: userData.tenant_id,
          mrn: patientData.mrn,
          date_of_birth: patientData.date_of_birth,
          surgery_date: patientData.surgery_date,
          surgery_type: patientData.surgery_type,
          phone_number: patientData.phone_number || patientData.phone,
          status: patientData.status || 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Update a patient
   */
  async updatePatient(patientId: string, updates: Partial<PatientData>) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  /**
   * Delete a patient (soft delete by setting status to inactive)
   */
  async deletePatient(patientId: string) {
    try {
      const { error } = await this.supabase
        .from('patients')
        .update({ status: 'inactive' })
        .eq('id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  /**
   * Get patient statistics for dashboard
   */
  async getPatientStats() {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: data?.filter(p => p.status === 'active').length || 0,
        inactive: data?.filter(p => p.status === 'inactive').length || 0,
        discharged: data?.filter(p => p.status === 'discharged').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  }

  /**
   * Search patients by name or MRN
   */
  async searchPatients(query: string) {
    try {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          id,
          mrn,
          profile:profiles!profile_id(
            first_name,
            last_name
          )
        `)
        .or(`mrn.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get patient's active protocol and current timeline position
   */
  async getPatientCurrentProtocol(patientId: string) {
    try {
      // Instead of using RPC, query directly
      const { data, error } = await this.supabase
        .from('patient_protocols')
        .select(`
          *,
          protocol:protocols(name, description)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching patient protocol:', error);
      }
      
      return data || null;
    } catch (error) {
      console.error('Error fetching patient protocol:', error);
      return null; // Return null instead of throwing
    }
  }

  /**
   * Get patient's timeline tasks
   */
  async getPatientTimelineTasks(
    patientId: string, 
    startDate?: string, 
    endDate?: string
  ) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_patient_timeline_tasks', {
          p_patient_id: patientId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient timeline:', error);
      throw error;
    }
  }

  /**
   * Get patient tasks with filters
   */
  async getPatientTasks(patientId: string, status?: string) {
    try {
      let query = this.supabase
        .from('patient_tasks')
        .select(`
          *,
          protocol_task:protocol_tasks(*)
        `)
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient tasks:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const patientService = new PatientService();