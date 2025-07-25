import { createClient } from "@/lib/supabase/client";
import { allTimelineTasks, completeTimelineData, timelineStats } from "@/lib/data/tjv-real-timeline-data";

export interface SeedingResult {
  success: boolean;
  protocolId?: string;
  tasksCreated?: number;
  error?: string;
  details?: {
    protocolName: string;
    totalDays: number;
    phasesCreated: number;
    tasksByType: {
      forms: number;
      exercises: number;
      videos: number;
      messages: number;
    };
  };
}

export class ProtocolSeeder {
  private supabase = createClient();
  
  async seedTJVProtocol(): Promise<SeedingResult> {
    try {
      // Get current user for tenant isolation
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Get user profile for tenant_id
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("tenant_id, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return { success: false, error: "Failed to get user profile" };
      }

      // Check if protocol already exists
      const { data: existingProtocol } = await this.supabase
        .from("recovery_protocols")
        .select("id, name")
        .eq("name", "Standard TJV Recovery Protocol")
        .eq("tenant_id", profile.tenant_id)
        .single();

      if (existingProtocol) {
        return { 
          success: false, 
          error: "Standard TJV Recovery Protocol already exists for this tenant" 
        };
      }

      // Create the main protocol
      const { data: protocol, error: protocolError } = await this.supabase
        .from("recovery_protocols")
        .insert({
          name: "Standard TJV Recovery Protocol",
          description: "Complete evidence-based recovery protocol from TJV clinical data. Covers Day -45 (enrollment) through Day +200 (long-term recovery) with phase-specific tasks, exercises, education, and outcome assessments.",
          surgery_type: "TKA", // Note: singular, not plural per schema
          activity_level: "active",
          total_days: 245,
          protocol_schema: {
            phases: completeTimelineData.map(phase => ({
              name: phase.name,
              startDay: phase.startDay,
              endDay: phase.endDay,
              taskCount: phase.tasks.length
            }))
          },
          created_by: user.id,
          tenant_id: profile.tenant_id,
          is_template: true,
          is_active: true
        })
        .select()
        .single();

      if (protocolError || !protocol) {
        console.error("Protocol creation error:", protocolError);
        return { success: false, error: "Failed to create protocol" };
      }

      // Prepare all tasks for bulk insert
      const tasksToInsert = allTimelineTasks.map((task) => {
        // Convert day to number if it's enrollment
        const dayNumber = typeof task.day === 'string' ? -45 : task.day;
        
        // Determine frequency settings
        const frequencyStartDay = dayNumber;
        let frequencyStopDay = dayNumber;
        let frequencyRepeat = false;
        
        // Handle tasks with frequency settings
        if (task.frequency?.repeat) {
          // For repeating tasks, set a reasonable stop day if not specified
          frequencyRepeat = true;
          if (dayNumber === -5) frequencyStopDay = -1; // Pre-op skin wash
          else if (dayNumber === 1) frequencyStopDay = 7; // Daily recovery check
          else if (dayNumber === 10) frequencyStopDay = 30; // Range of motion
          else if (dayNumber === 15) frequencyStopDay = 30; // Walking program
        }

        return {
          protocol_id: protocol.id,
          day: dayNumber,
          type: task.type,
          title: task.title,
          description: task.description || task.content,
          content: task.content,
          required: task.required,
          form_questions: task.questions ? JSON.stringify(task.questions) : null,
          exercise_instructions: task.instructions || null,
          video_url: task.url || null,
          video_duration: task.duration || null,
          message_content: task.type === 'message' ? task.content : null,
          frequency_start_day: frequencyStartDay,
          frequency_stop_day: frequencyStopDay,
          frequency_repeat: frequencyRepeat,
          frequency_type: task.frequency?.type || null,
          tenant_id: profile.tenant_id
        };
      });

      // Insert all tasks in bulk
      const { data: insertedTasks, error: tasksError } = await this.supabase
        .from("tasks")
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        console.error("Tasks insertion error:", tasksError);
        // Rollback - delete the protocol
        await this.supabase
          .from("recovery_protocols")
          .delete()
          .eq("id", protocol.id);
        
        return { success: false, error: "Failed to create protocol tasks" };
      }

      // Log the seeding action
      await this.supabase
        .from("audit_logs")
        .insert({
          action: "seed_tjv_protocol",
          details: {
            protocol_id: protocol.id,
            protocol_name: protocol.name,
            tasks_created: insertedTasks?.length || 0,
            created_by: `${profile.first_name} ${profile.last_name}`,
            timeline_stats: timelineStats
          },
          user_id: user.id,
          tenant_id: profile.tenant_id
        });

      return {
        success: true,
        protocolId: protocol.id,
        tasksCreated: insertedTasks?.length || 0,
        details: {
          protocolName: protocol.name,
          totalDays: timelineStats.totalDays,
          phasesCreated: completeTimelineData.length,
          tasksByType: timelineStats.taskTypes
        }
      };

    } catch (error) {
      console.error("Seeding error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  // Method to validate the seeded data
  async validateSeededProtocol(protocolId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Get the protocol
      const { data: protocol, error: protocolError } = await this.supabase
        .from("recovery_protocols")
        .select("*")
        .eq("id", protocolId)
        .single();

      if (protocolError || !protocol) {
        issues.push("Protocol not found");
        return { isValid: false, issues };
      }

      // Get all tasks
      const { data: tasks, error: tasksError } = await this.supabase
        .from("tasks")
        .select("*")
        .eq("protocol_id", protocolId)
        .order("day");

      if (tasksError || !tasks) {
        issues.push("Failed to retrieve tasks");
        return { isValid: false, issues };
      }

      // Validate task count
      if (tasks.length !== allTimelineTasks.length) {
        issues.push(`Task count mismatch: expected ${allTimelineTasks.length}, got ${tasks.length}`);
      }

      // Validate task types
      const taskTypeCounts = {
        form: tasks.filter(t => t.type === 'form').length,
        exercise: tasks.filter(t => t.type === 'exercise').length,
        video: tasks.filter(t => t.type === 'video').length,
        message: tasks.filter(t => t.type === 'message').length
      };

      if (taskTypeCounts.form !== timelineStats.taskTypes.forms) {
        issues.push(`Form count mismatch: expected ${timelineStats.taskTypes.forms}, got ${taskTypeCounts.form}`);
      }
      if (taskTypeCounts.exercise !== timelineStats.taskTypes.exercises) {
        issues.push(`Exercise count mismatch: expected ${timelineStats.taskTypes.exercises}, got ${taskTypeCounts.exercise}`);
      }
      if (taskTypeCounts.video !== timelineStats.taskTypes.videos) {
        issues.push(`Video count mismatch: expected ${timelineStats.taskTypes.videos}, got ${taskTypeCounts.video}`);
      }
      if (taskTypeCounts.message !== timelineStats.taskTypes.messages) {
        issues.push(`Message count mismatch: expected ${timelineStats.taskTypes.messages}, got ${taskTypeCounts.message}`);
      }

      // Validate day range
      const minDay = Math.min(...tasks.map(t => t.day));
      const maxDay = Math.max(...tasks.map(t => t.day));
      
      if (minDay !== -45) {
        issues.push(`Minimum day mismatch: expected -45, got ${minDay}`);
      }
      if (maxDay !== 200) {
        issues.push(`Maximum day mismatch: expected 200, got ${maxDay}`);
      }

      // Check for critical tasks
      const criticalTasks = [
        { day: -45, title: "Welcome to TJV Recovery" },
        { day: 0, title: "Welcome to Recovery" },
        { day: 14, title: "Two-Week Milestone Assessment" },
        { day: 45, title: "6-Week Milestone Assessment" },
        { day: 90, title: "3-Month Comprehensive Assessment" },
        { day: 180, title: "6-Month Milestone" }
      ];

      for (const critical of criticalTasks) {
        const found = tasks.find(t => t.day === critical.day && t.title === critical.title);
        if (!found) {
          issues.push(`Missing critical task: "${critical.title}" on day ${critical.day}`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues };
    }
  }

  // Method to assign protocol to a patient
  async assignProtocolToPatient(protocolId: string, patientId: string, surgeryDate: Date): Promise<{
    success: boolean;
    assignmentId?: string;
    error?: string;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      // Get user profile for tenant_id
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return { success: false, error: "Failed to get user profile" };
      }

      // Create patient protocol assignment
      const { data: assignment, error: assignmentError } = await this.supabase
        .from("patient_protocols")
        .insert({
          patient_id: patientId,
          protocol_id: protocolId,
          surgery_date: surgeryDate.toISOString(),
          assigned_by: user.id,
          status: 'active',
          tenant_id: profile.tenant_id
        })
        .select()
        .single();

      if (assignmentError || !assignment) {
        console.error("Assignment error:", assignmentError);
        return { success: false, error: "Failed to assign protocol to patient" };
      }

      // Create chat session for the patient
      const { data: chatSession, error: chatError } = await this.supabase
        .from("chat_sessions")
        .insert({
          patient_id: patientId,
          patient_protocol_id: assignment.id,
          status: 'active',
          metadata: {
            protocol_name: "Standard TJV Recovery Protocol",
            surgery_date: surgeryDate.toISOString(),
            start_date: new Date().toISOString()
          },
          tenant_id: profile.tenant_id
        })
        .select()
        .single();

      if (chatError) {
        console.error("Chat session creation error:", chatError);
      }

      // Log the assignment
      await this.supabase
        .from("audit_logs")
        .insert({
          action: "assign_protocol_to_patient",
          details: {
            protocol_id: protocolId,
            patient_id: patientId,
            assignment_id: assignment.id,
            surgery_date: surgeryDate.toISOString(),
            chat_session_id: chatSession?.id
          },
          user_id: user.id,
          tenant_id: profile.tenant_id
        });

      return {
        success: true,
        assignmentId: assignment.id
      };

    } catch (error) {
      console.error("Protocol assignment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  // Method to get seeding status
  async getSeedingStatus(): Promise<{
    isSeeded: boolean;
    protocolId?: string;
    details?: any;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { isSeeded: false };
      }

      const { data: profile } = await this.supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        return { isSeeded: false };
      }

      const { data: protocol } = await this.supabase
        .from("recovery_protocols")
        .select("id, created_at, name")
        .eq("name", "Standard TJV Recovery Protocol")
        .eq("tenant_id", profile.tenant_id)
        .single();

      if (protocol) {
        // Get task count
        const { count } = await this.supabase
          .from("tasks")
          .select("*", { count: 'exact', head: true })
          .eq("protocol_id", protocol.id);

        return {
          isSeeded: true,
          protocolId: protocol.id,
          details: {
            createdAt: protocol.created_at,
            taskCount: count || 0
          }
        };
      }

      return { isSeeded: false };

    } catch (error) {
      console.error("Status check error:", error);
      return { isSeeded: false };
    }
  }
}

// Export singleton instance
export const protocolSeeder = new ProtocolSeeder();