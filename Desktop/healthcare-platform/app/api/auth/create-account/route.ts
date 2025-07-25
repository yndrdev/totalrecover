import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, accountType, staffRole } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !accountType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate account type
    if (!['patient', 'staff'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    // Validate staff role if staff account
    if (accountType === 'staff' && !['surgeon', 'nurse', 'physical_therapist'].includes(staffRole)) {
      return NextResponse.json(
        { error: 'Invalid staff role' },
        { status: 400 }
      )
    }

    // Determine the actual role for the profile
    const profileRole = accountType === 'patient' ? 'patient' : staffRole

    const supabase = createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: profileRole
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Get a default tenant (in production, this would be determined by organization)
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single()

    const tenantId = tenantData?.id || null

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: profileRole,
        tenant_id: tenantId,
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // The database triggers will automatically create patient or provider records
    // based on the role we set in the profile

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: authData.user.id,
      email: authData.user.email,
      role: profileRole
    })

  } catch (error: any) {
    console.error('Create account error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}