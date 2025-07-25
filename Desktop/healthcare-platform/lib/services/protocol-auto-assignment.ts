import { createClient } from '@/lib/supabase/client';
import { protocolService } from './protocol-service';
import { protocolSeeder } from './protocol-seeder';
import { patientChatService } from './patient-chat-service';

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

      // First priority: Find standard practice protocols for the surgery type
      const standardPracticeProtocols = await protocolService.getProtocols({
        isActive: true,
        surgeryType: surgeryType,
        isStandardPractice: true
      });

      let protocolToAssign = standardPracticeProtocols[0]; // Take the first standard practice protocol

      // Second priority: Find any standard practice protocol (regardless of surgery type)
      if (!protocolToAssign) {
        const allStandardPractice = await protocolService.getProtocols({
          isActive: true,
          isStandardPractice: true
        });
        
        protocolToAssign = allStandardPractice[0]; // Take the first standard practice protocol
      }

      // Third priority: Fall back to template protocols (original logic)
      if (!protocolToAssign) {
        const protocols = await protocolService.getProtocols({
          isActive: true,
          surgeryType: surgeryType,
          isTemplate: true
        });

        protocolToAssign = protocols[0]; // Take the first template protocol

        // If no specific protocol found, try to find a generic template
        if (!protocolToAssign) {
          const genericProtocols = await protocolService.getProtocols({
            isActive: true,
            isTemplate: true
          });
          
          protocolToAssign = genericProtocols.find(p =>
            p.name.includes('Standard') || p.name.includes('TJV')
          ) || genericProtocols[0]; // Take first generic template or fallback to first available
        }
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

      // If this is a standard practice protocol, trigger chat interface setup
      if (protocolToAssign.is_standard_practice) {
        try {
          // Check if patient should receive tasks immediately (surgery date is today or past)
          const surgeryDateObj = new Date(surgeryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          surgeryDateObj.setHours(0, 0, 0, 0);

          if (surgeryDateObj <= today) {
            // Surgery has happened, deliver tasks via chat
            await patientChatService.checkAndDeliverPendingTasks(patientId);
          }
        } catch (chatError) {
          console.error('Failed to initialize chat for standard practice protocol:', chatError);
          // Don't fail the entire assignment if chat setup fails
        }
      }

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
      const existingProtocols = await protocolService.getProtocols({
        isActive: true,
        isTemplate: true
      });

      if (existingProtocols.length > 0) {
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