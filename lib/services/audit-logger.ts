import { createClient } from "@/lib/supabase/client";

export interface AuditLogEntry {
  id?: string;
  tenant_id?: string;
  user_id: string;
  user_role?: string;
  user_name?: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private supabase = createClient();

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log a general action
   */
  async logAction(
    action: string,
    details: Record<string, any>,
    options?: {
      resourceType?: string;
      resourceId?: string;
    }
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      // Get user profile for additional info
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("first_name, last_name, role, tenant_id")
        .eq("id", user.id)
        .single();

      const entry: AuditLogEntry = {
        user_id: user.id,
        user_role: profile?.role,
        user_name: profile ? `${profile.first_name} ${profile.last_name}` : user.email || "Unknown",
        tenant_id: profile?.tenant_id,
        action,
        details,
        timestamp: new Date().toISOString(),
        resource_type: options?.resourceType,
        resource_id: options?.resourceId,
      };

      // Try to get client info (works in browser)
      if (typeof window !== "undefined") {
        entry.user_agent = navigator.userAgent;
        // IP address would need to be set server-side
      }

      const { error } = await this.supabase
        .from("audit_logs")
        .insert(entry);

      if (error) {
        console.error("Error logging audit entry:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }
    } catch (error) {
      console.error("Error in audit logger:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Log patient-related actions
   */
  async logPatientAction(
    action: string,
    patientId: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.logAction(action, { patient_id: patientId, ...details }, {
      resourceType: "patient",
      resourceId: patientId,
    });
  }

  /**
   * Log provider assignment
   */
  async logProviderAssignment(
    patientId: string,
    providerField: string,
    providerId: string | null,
    providerName?: string
  ): Promise<void> {
    await this.logAction("assign_provider", {
      patient_id: patientId,
      provider_field: providerField,
      provider_id: providerId,
      provider_name: providerName,
      action: providerId ? "assigned" : "unassigned",
    }, {
      resourceType: "patient",
      resourceId: patientId,
    });
  }

  /**
   * Log protocol assignment
   */
  async logProtocolAssignment(
    patientId: string,
    protocolId: string,
    protocolName?: string
  ): Promise<void> {
    await this.logAction("assign_protocol", {
      patient_id: patientId,
      protocol_id: protocolId,
      protocol_name: protocolName,
    }, {
      resourceType: "patient",
      resourceId: patientId,
    });
  }

  /**
   * Log task completion
   */
  async logTaskCompletion(
    taskId: string,
    patientId: string,
    taskDetails?: Record<string, any>
  ): Promise<void> {
    await this.logAction("complete_task", {
      task_id: taskId,
      patient_id: patientId,
      ...taskDetails,
    }, {
      resourceType: "task",
      resourceId: taskId,
    });
  }

  /**
   * Log form submission
   */
  async logFormSubmission(
    formId: string,
    patientId: string,
    formName?: string
  ): Promise<void> {
    await this.logAction("submit_form", {
      form_id: formId,
      patient_id: patientId,
      form_name: formName,
    }, {
      resourceType: "form",
      resourceId: formId,
    });
  }

  /**
   * Log chat interaction
   */
  async logChatInteraction(
    patientId: string,
    messageType: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction("chat_interaction", {
      patient_id: patientId,
      message_type: messageType,
      ...details,
    }, {
      resourceType: "chat",
      resourceId: patientId,
    });
  }

  /**
   * Log protocol creation/modification
   */
  async logProtocolChange(
    protocolId: string,
    action: "create" | "update" | "delete",
    protocolName?: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logAction(`protocol_${action}`, {
      protocol_id: protocolId,
      protocol_name: protocolName,
      changes,
    }, {
      resourceType: "protocol",
      resourceId: protocolId,
    });
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    event: "login" | "logout" | "password_change" | "profile_update",
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAction(`auth_${event}`, details || {});
  }

  /**
   * Log data export events
   */
  async logDataExport(
    exportType: string,
    filters: Record<string, any>,
    recordCount: number
  ): Promise<void> {
    await this.logAction("data_export", {
      export_type: exportType,
      filters,
      record_count: recordCount,
    });
  }

  /**
   * Log system errors
   */
  async logError(
    errorType: string,
    errorMessage: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.logAction("system_error", {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();