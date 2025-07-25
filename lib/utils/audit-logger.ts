import { createClient } from '@/lib/supabase/client'

export interface AuditLogEntry {
  tenant_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
}

export interface AuditMetadata {
  user_name: string
  user_role: string
  [key: string]: any
}

export class AuditLogger {
  private static instance: AuditLogger
  private supabase = createClient()

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  async log(
    action: string,
    resourceType: string,
    details: {
      tenant_id: string
      user_id: string
      resource_id?: string
      changes?: Record<string, any>
      metadata?: AuditMetadata
    }
  ): Promise<void> {
    try {
      const entry: AuditLogEntry = {
        tenant_id: details.tenant_id,
        user_id: details.user_id,
        action,
        resource_type: resourceType,
        resource_id: details.resource_id,
        changes: {
          ...details.changes,
          ...details.metadata,
        },
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      }

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(entry)

      if (error) {
        console.error('Failed to create audit log:', error)
      }
    } catch (err) {
      console.error('Audit logging error:', err)
    }
  }

  // Convenience methods for common actions
  async logPatientAssignment(
    details: {
      tenant_id: string
      user_id: string
      patient_id: string
      provider_id: string
      provider_role: string
      assigned_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('assign_provider', 'patient', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.patient_id,
      changes: {
        provider_id: details.provider_id,
        provider_role: details.provider_role,
      },
      metadata: details.assigned_by,
    })
  }

  async logProtocolAssignment(
    details: {
      tenant_id: string
      user_id: string
      patient_id: string
      protocol_id: string
      assigned_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('assign_protocol', 'patient', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.patient_id,
      changes: {
        protocol_id: details.protocol_id,
      },
      metadata: details.assigned_by,
    })
  }

  async logProtocolCreation(
    details: {
      tenant_id: string
      user_id: string
      protocol_id: string
      protocol_name: string
      created_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('create_protocol', 'protocol', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.protocol_id,
      changes: {
        protocol_name: details.protocol_name,
      },
      metadata: details.created_by,
    })
  }

  async logPatientCreation(
    details: {
      tenant_id: string
      user_id: string
      patient_id: string
      patient_name: string
      created_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('create_patient', 'patient', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.patient_id,
      changes: {
        patient_name: details.patient_name,
      },
      metadata: details.created_by,
    })
  }

  async logTaskCompletion(
    details: {
      tenant_id: string
      user_id: string
      task_id: string
      patient_id: string
      completed_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('complete_task', 'task', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.task_id,
      changes: {
        patient_id: details.patient_id,
        status: 'completed',
      },
      metadata: details.completed_by,
    })
  }

  async logMessageSent(
    details: {
      tenant_id: string
      user_id: string
      message_id: string
      patient_id: string
      sent_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('send_message', 'message', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.message_id,
      changes: {
        patient_id: details.patient_id,
      },
      metadata: details.sent_by,
    })
  }

  async logDataExport(
    details: {
      tenant_id: string
      user_id: string
      export_type: string
      resource_ids?: string[]
      exported_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log('export_data', 'export', {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      changes: {
        export_type: details.export_type,
        resource_ids: details.resource_ids,
      },
      metadata: details.exported_by,
    })
  }

  async logAccessAttempt(
    details: {
      tenant_id: string
      user_id: string
      resource_type: string
      resource_id: string
      action: 'view' | 'edit' | 'delete'
      success: boolean
      attempted_by: AuditMetadata
    }
  ): Promise<void> {
    return this.log(`access_${details.action}`, details.resource_type, {
      tenant_id: details.tenant_id,
      user_id: details.user_id,
      resource_id: details.resource_id,
      changes: {
        success: details.success,
      },
      metadata: details.attempted_by,
    })
  }

  // Query methods for retrieving audit logs
  async getRecentActivity(
    tenant_id: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }

    return data || []
  }

  async getUserActivity(
    user_id: string,
    tenant_id: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch user audit logs:', error)
      return []
    }

    return data || []
  }

  async getResourceHistory(
    resource_type: string,
    resource_id: string,
    tenant_id: string
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('resource_type', resource_type)
      .eq('resource_id', resource_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch resource audit logs:', error)
      return []
    }

    return data || []
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()