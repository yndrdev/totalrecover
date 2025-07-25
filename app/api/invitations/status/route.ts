import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invitationService } from '@/lib/services/invitation-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')?.split(',') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get invitations with filters
    const result = await invitationService.getProviderInvitations(provider.id, {
      status,
      limit,
      offset,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    })

    // Get statistics
    const stats = await invitationService.getInvitationStats(provider.id)

    return NextResponse.json({
      invitations: result.invitations,
      total: result.total,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    })
  } catch (error) {
    console.error('Error getting invitation status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update invitation status (e.g., resend, cancel)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 403 })
    }

    const body = await request.json()
    const { invitationId, action } = body

    if (!invitationId || !action) {
      return NextResponse.json(
        { error: 'Invitation ID and action are required' },
        { status: 400 }
      )
    }

    // Verify the invitation belongs to this provider
    const { data: invitation } = await supabase
      .from('patient_invitations')
      .select('provider_id')
      .eq('id', invitationId)
      .single()

    if (!invitation || invitation.provider_id !== provider.id) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    let result;
    
    switch (action) {
      case 'resend':
        result = await invitationService.resendInvitation(invitationId)
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || 'Failed to resend invitation' },
            { status: 400 }
          )
        }
        
        // Re-send notification
        if (result.invitation) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()

          const { data: practiceInfo } = await supabase
            .from('practices')
            .select('name')
            .eq('id', result.invitation.practice_id || '')
            .single()

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const invitationLink = `${baseUrl}/auth/invite/${result.invitation.invitation_token}`
          const shortLink = await notificationService.createShortLink(invitationLink)

          await notificationService.sendInvitation({
            email: result.invitation.email,
            phone: result.invitation.phone || undefined,
            patientName: `${result.invitation.first_name} ${result.invitation.last_name}`,
            providerName: userRecord?.full_name || 'Your Provider',
            practiceName: practiceInfo?.name || 'Healthcare Team',
            invitationLink,
            shortLink,
            customMessage: result.invitation.custom_message || undefined,
            surgeryType: result.invitation.surgery_type || undefined,
            surgeryDate: result.invitation.surgery_date || undefined
          })
        }
        
        return NextResponse.json({
          success: true,
          message: 'Invitation resent successfully',
          invitation: result.invitation
        })
        
      case 'cancel':
        const cancelled = await invitationService.cancelInvitation(invitationId)
        if (!cancelled) {
          return NextResponse.json(
            { error: 'Failed to cancel invitation' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Invitation cancelled successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error updating invitation status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add missing import
import { notificationService } from '@/lib/services/notification-service'