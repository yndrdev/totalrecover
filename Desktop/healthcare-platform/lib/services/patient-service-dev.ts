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
  profile?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export class PatientServiceDev {
  private supabase: any;
  private useServiceRole: boolean;

  constructor() {
    // In development with BYPASS_AUTH, use service role for full access
    this.useServiceRole = process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV !== 'production';
    
    if (this.useServiceRole && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('[PatientServiceDev] Using service role for development');
      this.supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      console.log('[PatientServiceDev] Using standard client');
      this.supabase = createClient();
    }
  }

  /**
   * Get all patients - with development mode support
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
    console.log('[PatientServiceDev] getPatients called with:', { page, limit, search, status });
    
    try {
      let query = this.supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!profile_id(
            id,
            email,
            first_name,
            last_name
          )
        `, { count: 'exact' });

      // In dev mode with service role, we might want to see all patients
      // In production or without service role, tenant filtering will be applied by RLS
      if (!this.useServiceRole) {
        // Check if we have a user context
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
          // Get user's tenant
          const { data: profile } = await this.supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();
            
          if (profile?.tenant_id) {
            query = query.eq('tenant_id', profile.tenant_id);
          }
        }
      }

      // Apply search filter
      if (search) {
        query = query.or(`mrn.ilike.%${search}%`);
      }

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('[PatientServiceDev] Query error:', error);
        throw error;
      }

      console.log('[PatientServiceDev] Query successful:', {
        dataLength: data?.length || 0,
        totalCount: count || 0,
        useServiceRole: this.useServiceRole
      });

      return {
        patients: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error: any) {
      console.error('[PatientServiceDev] Error:', error);
      throw error;
    }
  }

  /**
   * Get patient's active protocol
   */
  async getPatientCurrentProtocol(patientId: string) {
    try {
      const { data, error } = await this.supabase
        .from('patient_protocols')
        .select(`
          *,
          protocol:protocols(name, description)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[PatientServiceDev] Error fetching protocol:', error);
      }
      
      return data || null;
    } catch (error) {
      console.error('[PatientServiceDev] Error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const patientServiceDev = new PatientServiceDev();