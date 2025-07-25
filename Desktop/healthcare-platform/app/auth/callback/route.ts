import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createUserProfile, logAuthEvent, getClientIP } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle authentication errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (!code) {
    console.error('No authorization code provided')
    return NextResponse.redirect(`${origin}/?error=Authentication failed - no code provided`)
  }

  try {
    const supabase = await createServerClient()
    
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Authentication failed')}`)
    }

    if (!data.user) {
      console.error('No user data after code exchange')
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Authentication failed')}`)
    }

    const user = data.user
    console.log('User authenticated via callback:', user.email)

    // Check if user profile exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let redirectPath = '/patient/dashboard' // Default redirect

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create profile
      console.log('Creating new user profile for:', user.email)
      
      const metadata = user.user_metadata || {}
      const userRole = metadata.role || 'patient'
      const fullName = metadata.full_name || user.email?.split('@')[0] || 'User'
      
      // Create user profile using helper function
      const profileResult = await createUserProfile(user, {
        full_name: fullName,
        role: userRole,
        phone: metadata.phone,
        date_of_birth: metadata.date_of_birth,
        gender: metadata.gender
      })

      if (!profileResult.success) {
        console.error('Failed to create user profile:', profileResult.error)
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Account setup failed')}`)
      }

      // Set redirect based on role
      switch (userRole) {
        case 'patient':
          // For patients, check surgery date to determine pre-op or post-op
          const { data: patient } = await supabase
            .from('patients')
            .select('surgery_date')
            .eq('profile_id', user.id)
            .single()

          if (patient && patient.surgery_date) {
            const surgeryDate = new Date(patient.surgery_date)
            const today = new Date()
            redirectPath = surgeryDate > today ? '/preop' : '/postop'
          } else {
            redirectPath = '/preop' // Default to preop if no surgery date
          }
          break
        case 'provider':
        case 'nurse':
          redirectPath = '/provider/patients'
          break
        case 'admin':
          redirectPath = '/practice/protocols'
          break
        case 'super_admin':
          redirectPath = '/saasadmin/protocols'
          break
        default:
          redirectPath = '/preop'
      }

      // Log successful signup
      await logAuthEvent(
        user.id,
        'user_signup_completed',
        { 
          method: 'magic_link',
          role: userRole,
          email: user.email 
        },
        getClientIP(Object.fromEntries(request.headers.entries())),
        request.headers.get('user-agent') || undefined
      )
    } else if (existingUser) {
      // Existing user - update last sign in
      await supabase
        .from('profiles')
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq('id', user.id)

      // Set redirect based on existing user role
      switch (existingUser.role) {
        case 'patient':
          // For patients, check surgery date to determine pre-op or post-op
          const { data: patient } = await supabase
            .from('patients')
            .select('surgery_date')
            .eq('profile_id', user.id)
            .single()

          if (patient && patient.surgery_date) {
            const surgeryDate = new Date(patient.surgery_date)
            const today = new Date()
            redirectPath = surgeryDate > today ? '/preop' : '/postop'
          } else {
            redirectPath = '/preop' // Default to preop if no surgery date
          }
          break
        case 'provider':
        case 'nurse':
          redirectPath = '/provider/patients'
          break
        case 'admin':
          redirectPath = '/practice/protocols'
          break
        case 'super_admin':
          redirectPath = '/saasadmin/protocols'
          break
        default:
          redirectPath = '/preop'
      }

      // Log successful login
      await logAuthEvent(
        user.id,
        'user_login_success',
        { 
          method: 'magic_link',
          role: existingUser.role,
          email: user.email 
        },
        getClientIP(Object.fromEntries(request.headers.entries())),
        request.headers.get('user-agent') || undefined
      )
    } else {
      console.error('Error fetching user:', userError)
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Database error')}`)
    }

    console.log('Redirecting user to:', redirectPath)
    return NextResponse.redirect(`${origin}${redirectPath}`)

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    
    // Log the error
    await logAuthEvent(
      null,
      'auth_callback_error',
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: code?.substring(0, 10) + '...' // Log partial code for debugging
      },
      getClientIP(Object.fromEntries(request.headers.entries())),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Authentication failed')}`)
  }
}