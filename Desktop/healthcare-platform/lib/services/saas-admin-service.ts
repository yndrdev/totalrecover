import { createClient } from '@/lib/supabase/client';

interface Tenant {
  id: string;
  name: string;
  tenant_type: 'practice' | 'hospital' | 'clinic';
  settings: any;
  subscription_tier: string;
  subscription_status: 'active' | 'inactive' | 'trial' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface TenantStats {
  total_users: number;
  total_patients: number;
  total_protocols: number;
  active_protocols: number;
  storage_used: number;
}

interface GlobalProtocol {
  id: string;
  title: string;
  description: string;
  surgery_type: string;
  is_template: boolean;
  is_public: boolean;
  created_by: string;
  tenant_id: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export class SaasAdminService {
  private supabase = createClient();

  /**
   * Get all tenants (practices)
   */
  async getTenants({
    page = 1,
    limit = 10,
    search = '',
    status = 'all'
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'trial' | 'suspended' | 'all';
  }) {
    try {
      let query = this.supabase
        .from('tenants')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('subscription_status', status);
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        tenants: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(tenantId: string): Promise<TenantStats> {
    try {
      const [usersResult, patientsResult, protocolsResult, storageResult] = await Promise.all([
        this.supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
        this.supabase
          .from('patients')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId),
        this.supabase
          .from('protocols')
          .select('status', { count: 'exact' })
          .eq('tenant_id', tenantId),
        this.supabase
          .from('storage.objects')
          .select('metadata->size', { count: 'exact' })
          .eq('bucket_id', tenantId)
      ]);

      const activeProtocols = protocolsResult.data?.filter(p => p.status === 'active').length || 0;

      return {
        total_users: usersResult.count || 0,
        total_patients: patientsResult.count || 0,
        total_protocols: protocolsResult.count || 0,
        active_protocols: activeProtocols,
        storage_used: 0 // Calculate from storage result
      };
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      throw error;
    }
  }

  /**
   * Update tenant settings
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>) {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  /**
   * Suspend or activate tenant
   */
  async updateTenantStatus(tenantId: string, status: 'active' | 'suspended') {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tenant status:', error);
      throw error;
    }
  }

  /**
   * Get global protocols (templates available across tenants)
   */
  async getGlobalProtocols({
    page = 1,
    limit = 10,
    search = '',
    surgeryType = 'all'
  }: {
    page?: number;
    limit?: number;
    search?: string;
    surgeryType?: string;
  }) {
    try {
      let query = this.supabase
        .from('protocols')
        .select(`
          *,
          tenant:tenants(name),
          creator:users(full_name)
        `, { count: 'exact' })
        .eq('is_template', true)
        .eq('is_public', true);

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply surgery type filter
      if (surgeryType !== 'all') {
        query = query.eq('surgery_type', surgeryType);
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await query
        .order('usage_count', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        protocols: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching global protocols:', error);
      throw error;
    }
  }

  /**
   * Promote a protocol to global template
   */
  async promoteProtocolToGlobal(protocolId: string) {
    try {
      const { data, error } = await this.supabase
        .from('protocols')
        .update({
          is_template: true,
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', protocolId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error promoting protocol:', error);
      throw error;
    }
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats() {
    try {
      const [tenantsResult, usersResult, patientsResult, protocolsResult] = await Promise.all([
        this.supabase
          .from('tenants')
          .select('subscription_status', { count: 'exact' }),
        this.supabase
          .from('profiles')
          .select('role', { count: 'exact' }),
        this.supabase
          .from('patients')
          .select('status', { count: 'exact' }),
        this.supabase
          .from('protocols')
          .select('is_template', { count: 'exact' })
      ]);

      const activeTenants = tenantsResult.data?.filter(t => t.subscription_status === 'active').length || 0;
      const trialTenants = tenantsResult.data?.filter(t => t.subscription_status === 'trial').length || 0;
      const activePatients = patientsResult.data?.filter(p => p.status === 'active').length || 0;
      const globalProtocols = protocolsResult.data?.filter(p => p.is_template).length || 0;

      return {
        totalTenants: tenantsResult.count || 0,
        activeTenants,
        trialTenants,
        totalUsers: usersResult.count || 0,
        totalPatients: patientsResult.count || 0,
        activePatients,
        totalProtocols: protocolsResult.count || 0,
        globalProtocols
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  /**
   * Get content library statistics
   */
  async getContentStats() {
    try {
      const [formsResult, videosResult, exercisesResult] = await Promise.all([
        this.supabase
          .from('content_forms')
          .select('id', { count: 'exact' }),
        this.supabase
          .from('content_videos')
          .select('id', { count: 'exact' }),
        this.supabase
          .from('content_exercises')
          .select('id', { count: 'exact' })
      ]);

      return {
        totalForms: formsResult.count || 0,
        totalVideos: videosResult.count || 0,
        totalExercises: exercisesResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(tenantData: {
    name: string;
    tenant_type: 'practice' | 'hospital' | 'clinic';
    settings?: any;
    subscription_tier?: string;
    admin_email: string;
    admin_password: string;
  }) {
    try {
      // Create tenant
      const { data: tenant, error: tenantError } = await this.supabase
        .from('tenants')
        .insert({
          name: tenantData.name,
          tenant_type: tenantData.tenant_type,
          settings: tenantData.settings || {},
          subscription_tier: tenantData.subscription_tier || 'trial',
          subscription_status: 'trial'
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create admin user for the tenant
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: tenantData.admin_email,
        password: tenantData.admin_password,
        options: {
          data: {
            role: 'practice_admin',
            tenant_id: tenant.id,
            full_name: `Admin - ${tenantData.name}`
          }
        }
      });

      if (authError) throw authError;

      // Create user record
      const { error: userError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: tenantData.admin_email,
          full_name: `Admin - ${tenantData.name}`,
          role: 'practice_admin',
          tenant_id: tenant.id,
          is_active: true
        });

      if (userError) throw userError;

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs({
    tenantId,
    page = 1,
    limit = 50
  }: {
    tenantId?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(full_name, email),
          tenant:tenants(name)
        `, { count: 'exact' });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        logs: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const saasAdminService = new SaasAdminService();