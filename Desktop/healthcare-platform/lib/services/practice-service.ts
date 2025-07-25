import { createClient } from '@/lib/supabase/client';

interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: string;
  phone?: string;
  specialization?: string;
  license_number?: string;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface PracticeSettings {
  id: string;
  tenant_id: string;
  practice_name: string;
  practice_type: string;
  address: any;
  phone: string;
  email: string;
  business_hours: any;
  appointment_duration: number;
  buffer_time: number;
  max_daily_patients: number;
  specialties: string[];
  insurance_accepted: string[];
  created_at: string;
  updated_at: string;
}

export class PracticeService {
  private supabase = createClient();

  /**
   * Get all staff members for the current tenant
   */
  async getStaffMembers() {
    try {
      // Get current user's tenant
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Fetch staff members
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .neq('role', 'patient')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching staff members:', error);
      throw error;
    }
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(staffData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    specialization?: string;
    license_number?: string;
  }) {
    try {
      // Get current user's tenant
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: staffData.email,
        password: staffData.password,
        options: {
          data: {
            first_name: staffData.first_name,
            last_name: staffData.last_name,
            full_name: `${staffData.first_name} ${staffData.last_name}`,
            role: staffData.role,
            tenant_id: userData.tenant_id,
          }
        }
      });

      if (authError) throw authError;

      // Create user record
      const { data, error } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: staffData.email,
          first_name: staffData.first_name,
          last_name: staffData.last_name,
          full_name: `${staffData.first_name} ${staffData.last_name}`,
          role: staffData.role,
          tenant_id: userData.tenant_id,
          phone: staffData.phone,
          specialization: staffData.specialization,
          license_number: staffData.license_number,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  }

  /**
   * Update a staff member
   */
  async updateStaffMember(staffId: string, updates: Partial<StaffMember>) {
    try {
      // Don't allow updating certain fields
      const { id, email, tenant_id, created_at, ...safeUpdates } = updates;

      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...safeUpdates,
          full_name: updates.first_name && updates.last_name 
            ? `${updates.first_name} ${updates.last_name}` 
            : undefined
        })
        .eq('id', staffId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  }

  /**
   * Toggle staff member active status
   */
  async toggleStaffStatus(staffId: string, isActive: boolean) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', staffId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling staff status:', error);
      throw error;
    }
  }

  /**
   * Get practice settings
   */
  async getPracticeSettings() {
    try {
      // Get current user's tenant
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Fetch practice settings
      const { data, error } = await this.supabase
        .from('practice_settings')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      
      // If no settings exist, return defaults
      if (!data) {
        return {
          practice_name: '',
          practice_type: 'orthopedic',
          address: {},
          phone: '',
          email: '',
          business_hours: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { closed: true },
            sunday: { closed: true }
          },
          appointment_duration: 30,
          buffer_time: 10,
          max_daily_patients: 20,
          specialties: [],
          insurance_accepted: []
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching practice settings:', error);
      throw error;
    }
  }

  /**
   * Update practice settings
   */
  async updatePracticeSettings(settings: Partial<PracticeSettings>) {
    try {
      // Get current user's tenant
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Check if settings exist
      const { data: existing } = await this.supabase
        .from('practice_settings')
        .select('id')
        .eq('tenant_id', userData.tenant_id)
        .single();

      let result;
      if (existing) {
        // Update existing settings
        const { data, error } = await this.supabase
          .from('practice_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('tenant_id', userData.tenant_id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new settings
        const { data, error } = await this.supabase
          .from('practice_settings')
          .insert({
            ...settings,
            tenant_id: userData.tenant_id
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating practice settings:', error);
      throw error;
    }
  }

  /**
   * Get practice statistics
   */
  async getPracticeStats() {
    try {
      // Get current user's tenant
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userData } = await this.supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userData?.tenant_id) throw new Error('No tenant found');

      // Get various stats
      const [staffResult, patientsResult, protocolsResult] = await Promise.all([
        this.supabase
          .from('profiles')
          .select('role', { count: 'exact' })
          .eq('tenant_id', userData.tenant_id)
          .neq('role', 'patient'),
        this.supabase
          .from('patients')
          .select('status', { count: 'exact' })
          .eq('tenant_id', userData.tenant_id),
        this.supabase
          .from('protocols')
          .select('status', { count: 'exact' })
          .eq('tenant_id', userData.tenant_id)
      ]);

      const staffByRole = staffResult.data?.reduce((acc: any, staff: any) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1;
        return acc;
      }, {}) || {};

      const patientsByStatus = patientsResult.data?.reduce((acc: any, patient: any) => {
        acc[patient.status] = (acc[patient.status] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalStaff: staffResult.count || 0,
        staffByRole,
        totalPatients: patientsResult.count || 0,
        activePatients: patientsByStatus.active || 0,
        totalProtocols: protocolsResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching practice stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const practiceService = new PracticeService();