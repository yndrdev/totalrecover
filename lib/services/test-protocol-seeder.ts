import { createClient } from "@/lib/supabase/server";
import { allTimelineTasks, completeTimelineData, timelineStats } from "@/lib/data/tjv-real-timeline-data";
import crypto from 'crypto';

export interface TestSeedingResult {
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

export class TestProtocolSeeder {
  async seedTJVProtocolForTesting(testTenantId: string): Promise<TestSeedingResult> {
    try {
      const supabase = await createClient();
      
      console.log('Test seeding started for tenant:', testTenantId);
      
      // Check if protocol already exists
      const { data: existingProtocol, error: checkError } = await supabase
        .from("protocols")
        .select("id, name")
        .eq("name", "Standard TJV Recovery Protocol")
        .eq("tenant_id", testTenantId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing protocol:", checkError);
      }

      if (existingProtocol) {
        return {
          success: false,
          error: "Standard TJV Recovery Protocol already exists for this tenant"
        };
      }

      // Generate a valid UUID for created_by
      const testUserId = crypto.randomUUID();
      
      // Create the main protocol with test tenant ID
      const protocolData = {
        name: "Standard TJV Recovery Protocol",
        description: "Complete evidence-based recovery protocol from TJV clinical data. Covers Day -45 (enrollment) through Day +200 (long-term recovery) with phase-specific tasks, exercises, education, and outcome assessments.",
        surgery_types: ["TKA", "THA"],
        timeline_start: -45,
        timeline_end: 200,
        is_active: true,
        created_by: testUserId,
        tenant_id: testTenantId
      };
      
      console.log('Creating protocol with data:', protocolData);
      
      const { data: protocol, error: protocolError } = await supabase
        .from("protocols")
        .insert(protocolData)
        .select()
        .single();
      if (protocolError || !protocol) {
        console.error("Protocol creation error:", protocolError);
        return {
          success: false,
          error: `Failed to create protocol: ${protocolError?.message || 'Unknown error'}`
        };
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
          tenant_id: testTenantId
        };
      });

      // Insert all tasks in bulk
      const { data: insertedTasks, error: tasksError } = await supabase
        .from("protocol_tasks")
        .insert(tasksToInsert)
        .select();

      if (tasksError) {
        console.error("Tasks insertion error:", tasksError);
        // Rollback - delete the protocol
        await supabase
          .from("protocols")
          .delete()
          .eq("id", protocol.id);
        
        return { success: false, error: "Failed to create protocol tasks" };
      }

      // Log the seeding action (skip if audit_logs doesn't require user_id)
      try {
        await supabase
          .from("audit_logs")
          .insert({
            action: "test_seed_tjv_protocol",
            details: {
              protocol_id: protocol.id,
              protocol_name: protocol.name,
              tasks_created: insertedTasks?.length || 0,
              created_by: 'test-seeder',
              timeline_stats: timelineStats
            },
            user_id: testUserId,
            tenant_id: testTenantId
          });
      } catch (auditError) {
        console.log('Audit log creation skipped (non-critical):', auditError);
      }

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
}