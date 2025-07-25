import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invitationService } from '@/lib/services/invitation-service'
import { notificationService } from '@/lib/services/notification-service'

export async function POST(request: NextRequest) {
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
      .select('id, profile_id')
      .eq('profile_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 403 })
    }

    // Get user's tenant and practice info
    const { data: userRecord, error: userError } = await supabase
      .from('profiles')
      .select('tenant_id, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 })
    }

    // Get practice details
    const { data: practiceInfo } = await supabase
      .from('practices')
      .select('id, name')
      .eq('tenant_id', userRecord.tenant_id)
      .single()

    const body = await request.json()
    const {
      invitations, // Array for batch invitations
      email,
      phone,
      firstName,
      lastName,
      dateOfBirth,
      surgeryType,
      surgeryDate,
      customMessage
    } = body

    // Handle batch invitations
    if (invitations && Array.isArray(invitations)) {
      const results = await invitationService.createBatchInvitations({
        invitations: invitations.map(inv => ({
          email: inv.email,
          phone: inv.phone,
          firstName: inv.firstName,
          lastName: inv.lastName,
          dateOfBirth: inv.dateOfBirth ? new Date(inv.dateOfBirth) : undefined,
          surgeryType: inv.surgeryType,
          surgeryDate: inv.surgeryDate ? new Date(inv.surgeryDate) : undefined,
          customMessage: inv.customMessage
        })),
        providerId: provider.id,
        tenantId: userRecord.tenant_id,
        practiceId: practiceInfo?.id
      })

      // Send notifications for successful invitations
      for (const result of results.successful) {
        if (result.invitation) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const invitationLink = `${baseUrl}/auth/invite/${result.invitation.invitation_token}`
          const shortLink = await notificationService.createShortLink(invitationLink)

          const notificationResult = await notificationService.sendInvitation({
            email: result.invitation.email,
            phone: result.invitation.phone || undefined,
            patientName: `${result.invitation.first_name} ${result.invitation.last_name}`,
            providerName: `${userRecord.first_name || ''} ${userRecord.last_name || ''}`.trim() || 'Your Provider',
            practiceName: practiceInfo?.name || 'Healthcare Team',
            invitationLink,
            shortLink,
            customMessage: result.invitation.custom_message || undefined,
            surgeryType: result.invitation.surgery_type || undefined,
            surgeryDate: result.invitation.surgery_date || undefined
          })

          // Update invitation with notification status
          const sentVia = []
          if (notificationResult.email?.success) sentVia.push('email')
          if (notificationResult.sms?.success) sentVia.push('sms')

          await invitationService.updateInvitationStatus(
            result.invitation.id,
            'sent',
            {
              sent_via: sentVia,
              email_delivery_status: notificationResult.email || {},
              sms_delivery_status: notificationResult.sms || {}
            }
          )
        }
      }

      return NextResponse.json({
        success: true,
        results
      })
    }

    // Handle single invitation
    const invitationData = {
      email,
      phone,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      surgeryType,
      surgeryDate: surgeryDate ? new Date(surgeryDate) : undefined,
      customMessage
    }

    const result = await invitationService.createInvitation(
      invitationData,
      provider.id,
      userRecord.tenant_id,
      practiceInfo?.id
    )

    if (!result.success || !result.invitation) {
      return NextResponse.json(
        { error: result.error || 'Failed to create invitation' },
        { status: 400 }
      )
    }

    // Send notification
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/auth/invite/${result.invitation.invitation_token}`
    const shortLink = await notificationService.createShortLink(invitationLink)

    const notificationResult = await notificationService.sendInvitation({
      email: result.invitation.email,
      phone: result.invitation.phone || undefined,
      patientName: `${result.invitation.first_name} ${result.invitation.last_name}`,
      providerName: userRecord.full_name || 'Your Provider',
      practiceName: practiceInfo?.name || 'Healthcare Team',
      invitationLink,
      shortLink,
      customMessage: result.invitation.custom_message || undefined,
      surgeryType: result.invitation.surgery_type || undefined,
      surgeryDate: result.invitation.surgery_date || undefined
    })

    // Update invitation with notification status
    const sentVia = []
    if (notificationResult.email?.success) sentVia.push('email')
    if (notificationResult.sms?.success) sentVia.push('sms')

    await invitationService.updateInvitationStatus(
      result.invitation.id,
      'sent',
      {
        sent_via: sentVia,
        email_delivery_status: notificationResult.email || {},
        sms_delivery_status: notificationResult.sms || {}
      }
    )

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      notificationResult
    })
  } catch (error) {
    console.error('Error in invitation send endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}