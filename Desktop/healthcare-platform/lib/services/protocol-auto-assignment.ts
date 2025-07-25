import { createClient } from '@/lib/supabase/client';
import { protocolService } from './protocol-service';
import { protocolSeeder } from './protocol-seeder';

interface AutoAssignmentResult {
  success: boolean;
  protocolId?: string;
  patientProtocolId?: string;
  error?: string;
  details?: {
    protocolName: string;
    tasksCreated: number;
  };
}

export class ProtocolAutoAssignmentService {
  private supabase = createClient();

  /**
   * Automatically assign appropriate protocol to a patient based on their surgery type
   */
  async autoAssignProtocolToPatient(
    patientId: string,
    surgeryType: string,
    surgeryDate: string,
    tenantId: string
  ): Promise<AutoAssignmentResult> {
    try {
      // First, check if patient already has an active protocol
      const { data: existingProtocol } = await this.supabase
        .from('patient_protocols')
        .select('id, protocol_id, status')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();

      if (existingProtocol) {
        return {
          success: false,
          error: 'Patient already has an active protocol assigned',
        };
      }

      // Find appropriate protocol template for the surgery type
      const protocols = await protocolService.getProtocols({
        isActive: true,
        surgeryType: surgeryType,
      });

      let protocolToAssign = protocols.find(p => p.is_template);

      // If no specific protocol found, try to find a generic template
      if (!protocolToAssign) {
        const genericProtocols = await protocolService.getProtocols({
          isActive: true,
        });
        
        protocolToAssign = genericProtocols.find(p => 
          p.is_template && 
          (p.name.includes('Standard') || p.name.includes('TJV'))
        );
      }

      if (!protocolToAssign) {
        return {
          success: false,
          error: `No suitable protocol template found for surgery type: ${surgeryType}`,
        };
      }

      // Assign the protocol to the patient
      const assignment = await protocolService.assignProtocolToPatient({
        patientId,
        protocolId: protocolToAssign.id,
        surgeryDate,
        surgeryType,
      });

      // Log the automatic assignment
      await this.supabase
        .from('audit_logs')
        .insert({
          action: 'auto_protocol_assignment',
          details: {
            patient_id: patientId,
            protocol_id: protocolToAssign.id,
            protocol_name: protocolToAssign.name,
            surgery_type: surgeryType,
            surgery_date: surgeryDate,
          },
          user_id: 'system',
          tenant_id: tenantId,
        });

      return {
        success: true,
        protocolId: protocolToAssign.id,
        patientProtocolId: assignment.id,
        details: {
          protocolName: protocolToAssign.name,
          tasksCreated: protocolToAssign.tasks?.length || 0,
        },
      };
    } catch (error) {
      console.error('Error in auto protocol assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Ensure tenant has standard protocols seeded
   */
  async ensureTenantProtocolsSeeded(tenantId: string): Promise<{
    success: boolean;
    protocolsCreated: number;
    error?: string;
  }> {
    try {
      // Check if tenant already has protocols
      const { data: existingProtocols } = await this.supabase
        .from('recovery_protocols')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('is_template', true);

      if (existingProtocols && existingProtocols.length > 0) {
        return {
          success: true,
          protocolsCreated: 0, // Already has protocols
        };
      }

      // Seed standard protocols for the tenant
      const seedResult = await protocolSeeder.seedTJVProtocol();

      if (!seedResult.success) {
        return {
          success: false,
          protocolsCreated: 0,
          error: seedResult.error,
        };
      }

      return {
        success: true,
        protocolsCreated: 1,
      };
    } catch (error) {
      console.error('Error ensuring tenant protocols:', error);
      return {
        success: false,
        protocolsCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Handle patient invitation acceptance with automatic protocol assignment
   */
  async handleInvitationAcceptance(
    invitationId: string,
    patientId: string
  ): Promise<AutoAssignmentResult> {
    try {
      // Get invitation details
      const { data: invitation, error: invError } = await this.supabase
        .from('patient_invitations')
        .select('surgery_type, surgery_date, tenant_id')
        .eq('id', invitationId)
        .single();

      if (invError || !invitation) {
        return {
          success: false,
          error: 'Invitation not found',
        };
      }

      if (!invitation.surgery_type || !invitation.surgery_date) {
        return {
          success: false,
          error: 'Invitation missing surgery details',
        };
      }

      // Auto-assign protocol based on invitation details
      return await this.autoAssignProtocolToPatient(
        patientId,
        invitation.surgery_type,
        invitation.surgery_date,
        invitation.tenant_id
      );
    } catch (error) {
      console.error('Error handling invitation acceptance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Handle batch patient import with automatic protocol assignment
   */
  async handleBatchPatientImport(
    patients: Array<{
      id: string;
      surgery_type: string;
      surgery_date: string;
      tenant_id: string;
    }>
  ): Promise<{
    successful: number;
    failed: number;
    results: AutoAssignmentResult[];
  }> {
    const results: AutoAssignmentResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const patient of patients) {
      const result = await this.autoAssignProtocolToPatient(
        patient.id,
        patient.surgery_type,
        patient.surgery_date,
        patient.tenant_id
      );

      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      successful,
      failed,
      results,
    };
  }

  /**
   * Check if automatic protocol assignment is enabled for tenant
   */
  async isAutoAssignmentEnabled(tenantId: string): Promise<boolean> {
    try {
      const { data: tenant } = await this.supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single();

      return tenant?.settings?.automatic_protocol_assignment === true;
    } catch (error) {
      console.error('Error checking auto assignment setting:', error);
      return false; // Default to false if error
    }
  }
}

// Export singleton instance
export const protocolAutoAssignmentService = new ProtocolAutoAssignmentService();