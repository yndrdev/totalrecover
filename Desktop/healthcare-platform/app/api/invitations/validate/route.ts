import { NextRequest, NextResponse } from 'next/server'
import { invitationService } from '@/lib/services/invitation-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const result = await invitationService.validateInvitation(token)

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: result.error || 'Invalid invitation' 
        }, 
        { status: 400 }
      )
    }

    // Return minimal information for security
    return NextResponse.json({
      valid: true,
      invitation: {
        email: result.invitation?.email,
        first_name: result.invitation?.first_name,
        last_name: result.invitation?.last_name,
        surgery_type: result.invitation?.surgery_type,
        surgery_date: result.invitation?.surgery_date,
        expires_at: result.invitation?.expires_at
      }
    })
  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}