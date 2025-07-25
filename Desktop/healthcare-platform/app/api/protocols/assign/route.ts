import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { protocolIntegrationService } from '@/lib/services/protocol-patient-integration-server'

/**
 * POST /api/protocols/assign
 * Assign a protocol to a patient and generate timeline tasks
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
    const { protocolId, patientId, startDate } = body

    if (!protocolId || !patientId) {
      return NextResponse.json(
        { error: 'Protocol ID and Patient ID are required' },
        { status: 400 }
      )
    }

    const result = await protocolIntegrationService.assignProtocolToPatient(
      protocolId,
      patientId,
      startDate ? new Date(startDate) : undefined
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
      message: `Protocol assigned successfully. ${result.tasksCreated} tasks created.`
    })

  } catch (error) {
    console.error('Protocol assignment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}