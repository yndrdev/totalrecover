import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { protocolIntegrationService } from '@/lib/services/protocol-patient-integration-server'

/**
 * POST /api/protocols/sync
 * Sync protocol builder tasks to patient timeline
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { protocolTasks, patientId, protocolMetadata } = body

    if (!protocolTasks || !patientId || !protocolMetadata) {
      return NextResponse.json(
        { error: 'Protocol tasks, patient ID, and protocol metadata are required' },
        { status: 400 }
      )
    }

    // Validate protocol tasks structure
    if (!Array.isArray(protocolTasks)) {
      return NextResponse.json(
        { error: 'Protocol tasks must be an array' },
        { status: 400 }
      )
    }

    // Add user context to protocol metadata
    const enhancedMetadata = {
      ...protocolMetadata,
      created_by: user.id,
      tenant_id: protocolMetadata.tenant_id || 'default'
    }

    // Create a protocol from the tasks
    const protocol = {
      id: `protocol_${Date.now()}`,
      tasks: protocolTasks,
      ...enhancedMetadata
    }

    // First save the protocol
    const { error: saveError } = await supabase
      .from('protocols')
      .insert({
        id: protocol.id,
        title: protocol.title,
        description: protocol.description,
        surgery_type: protocol.surgery_type,
        tasks: protocol.tasks,
        created_by: protocol.created_by,
        tenant_id: protocol.tenant_id
      })

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save protocol' },
        { status: 400 }
      )
    }

    // Then assign it to the patient
    const result = await protocolIntegrationService.assignProtocolToPatient(
      protocol.id,
      patientId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tasksCreated: result.tasksCreated,
      message: `Protocol synchronized successfully. ${result.tasksCreated} tasks created in patient timeline.`
    })

  } catch (error) {
    console.error('Protocol sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/protocols/sync?patientId={id}
 * Get patient's protocol progress and assignments
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // Get patient's protocol assignments and progress
    const { data: assignments, error } = await supabase
      .from('protocol_assignments')
      .select(`
        *,
        protocol:protocols (
          id,
          title,
          description,
          surgery_type
        ),
        patient_tasks (
          id,
          status,
          scheduled_date,
          completed_at,
          task:tasks (
            title,
            task_type,
            phase
          )
        )
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching protocol progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch protocol progress' },
        { status: 500 }
      )
    }

    // Calculate progress statistics
    const progressStats = assignments?.map(assignment => {
      const tasks = assignment.patient_tasks || []
      const totalTasks = tasks.length
      const completedTasks = tasks.filter((task: any) => task.status === 'completed').length
      const pendingTasks = tasks.filter((task: any) => task.status === 'pending').length
      const overdueTasks = tasks.filter((task: any) =>
        task.status === 'pending' &&
        new Date(task.scheduled_date) < new Date()
      ).length

      return {
        assignmentId: assignment.id,
        protocol: assignment.protocol,
        assignedDate: assignment.assigned_date,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    }) || []

    return NextResponse.json({
      success: true,
      assignments: progressStats
    })

  } catch (error) {
    console.error('Protocol progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}