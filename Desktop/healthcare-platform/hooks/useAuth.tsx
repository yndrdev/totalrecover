'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database-types'

type UserRecord = Database['public']['Tables']['users']['Row']
type PatientRecord = Database['public']['Tables']['patients']['Row']
type ProviderRecord = Database['public']['Tables']['providers']['Row']

interface AuthState {
  user: User | null
  userRecord: UserRecord | null
  patientRecord: PatientRecord | null
  providerRecord: ProviderRecord | null
  loading: boolean
  initialized: boolean
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: SignUpData) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signInWithMagicLink: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<UserRecord>) => Promise<AuthResult>
}

interface SignUpData {
  full_name: string
  role: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
  tenant_id?: string
  phone?: string
  date_of_birth?: string
  gender?: string
}

interface AuthResult {
  success: boolean
  error?: string
  user?: User
  requiresEmailConfirmation?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userRecord: null,
    patientRecord: null,
    providerRecord: null,
    loading: true,
    initialized: false
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile and related records
  const fetchUserData = async (user: User): Promise<{
    userRecord: UserRecord | null
    patientRecord: PatientRecord | null
    providerRecord: ProviderRecord | null
  }> => {
    try {
      // Fetch user record
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user record:', userError)
        return { userRecord: null, patientRecord: null, providerRecord: null }
      }

      let patientRecord = null
      let providerRecord = null

      // Fetch role-specific records
      if (userRecord?.role === 'patient') {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (!error) patientRecord = data
      } else if (['provider', 'nurse', 'admin', 'super_admin'].includes(userRecord?.role || '')) {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (!error) providerRecord = data
      }

      return { userRecord, patientRecord, providerRecord }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      return { userRecord: null, patientRecord: null, providerRecord: null }
    }
  }

  // Create user profile after signup
  const createUserProfile = async (user: User, userData: SignUpData): Promise<boolean> => {
    try {
      // Default tenant for demo
      const defaultTenantId = 'demo-tenant-001'
      
      // Insert user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: userData.full_name,
          role: userData.role,
          tenant_id: userData.tenant_id || defaultTenantId,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          gender: userData.gender,
          is_active: true
        })

      if (userError) {
        console.error('Error creating user record:', userError)
        return false
      }

      // Create role-specific records
      if (userData.role === 'patient') {
        const [firstName, ...lastNameParts] = userData.full_name.split(' ')
        const lastName = lastNameParts.join(' ') || 'Unknown'
        
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            tenant_id: userData.tenant_id || defaultTenantId,
            mrn: `PAT-${Date.now()}`, // Generate MRN
            first_name: userData.full_name.split(' ')[0],
            last_name: userData.full_name.split(' ').slice(1).join(' ') || 'Unknown',
            date_of_birth: userData.date_of_birth || '',
            phone: userData.phone,
            email: user.email,
            address: {},
            emergency_contact: {},
            medical_history: {},
            insurance_info: {},
            preferred_language: 'en',
            status: 'active'
          })

        if (patientError) {
          console.error('Error creating patient record:', patientError)
          return false
        }
      } else if (['provider', 'nurse', 'admin', 'super_admin'].includes(userData.role)) {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: user.id,
            tenant_id: userData.tenant_id || defaultTenantId,
            specialty: userData.role === 'provider' ? 'General' : userData.role,
            credentials: [],
            is_primary_surgeon: userData.role === 'provider'
          })

        if (providerError) {
          console.error('Error creating provider record:', providerError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return false
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: SignUpData): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Only create profile if we have a session (email confirmation disabled)
        // Otherwise, profile will be created after email confirmation in auth callback
        if (data.session) {
          const profileCreated = await createUserProfile(data.user, userData)
          if (!profileCreated) {
            return { success: false, error: 'Failed to create user profile' }
          }
        }

        return {
          success: true,
          user: data.user,
          requiresEmailConfirmation: !data.session
        }
      }

      return { success: false, error: 'Failed to create user' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Update last sign in
        await supabase
          .from('users')
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq('id', data.user.id)

        return { success: true, user: data.user }
      }

      return { success: false, error: 'Failed to sign in' }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with magic link
  const signInWithMagicLink = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to send magic link' }
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        userRecord: null,
        patientRecord: null,
        providerRecord: null,
        loading: false,
        initialized: true
      })
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const userData = await fetchUserData(user)
        setState(prev => ({
          ...prev,
          user,
          ...userData,
          loading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          userRecord: null,
          patientRecord: null,
          providerRecord: null,
          loading: false
        }))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserRecord>): Promise<AuthResult> => {
    try {
      if (!state.user) {
        return { success: false, error: 'No user logged in' }
      }

      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', state.user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh user data
      await refreshUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      console.log('[Auth] Starting initialization...')
      console.log('[Auth] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[Auth] Supabase key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      try {
        console.log('[Auth] Creating supabase client...')
        const testClient = createClient()
        console.log('[Auth] Supabase client created:', !!testClient)
        
        console.log('[Auth] Getting current user...')
        // Add timeout to prevent hanging - increased to 10 seconds
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        )
        
        const authPromise = supabase.auth.getUser()
        
        const result = await Promise.race([authPromise, timeoutPromise])
        const { data: { user }, error: authError } = result as any
        
        if (authError) {
          console.error('[Auth] Error getting user:', authError)
        }
        
        console.log('[Auth] Current user:', user?.id || 'none')
        
        if (mounted) {
          if (user) {
            console.log('[Auth] User found, fetching user data...')
            const userData = await fetchUserData(user)
            console.log('[Auth] User data fetched:', userData)
            setState({
              user,
              ...userData,
              loading: false,
              initialized: true
            })
          } else {
            console.log('[Auth] No user found, setting unauthenticated state')
            setState({
              user: null,
              userRecord: null,
              patientRecord: null,
              providerRecord: null,
              loading: false,
              initialized: true
            })
          }
        }
      } catch (error) {
        console.error('[Auth] Critical error in initialization:', error)
        if (mounted) {
          // Set loading to false even on error to prevent infinite loading
          setState({
            user: null,
            userRecord: null,
            patientRecord: null,
            providerRecord: null,
            loading: false,
            initialized: true
          })
        }
      }
    }

    // Run initialization immediately
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event, session?.user?.id || 'no user')
        if (mounted) {
          if (session?.user) {
            console.log('[Auth] Session user detected, fetching data...')
            const userData = await fetchUserData(session.user)
            setState({
              user: session.user,
              ...userData,
              loading: false,
              initialized: true
            })
          } else {
            console.log('[Auth] No session, clearing auth state')
            setState({
              user: null,
              userRecord: null,
              patientRecord: null,
              providerRecord: null,
              loading: false,
              initialized: true
            })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    refreshUser,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based route helpers
export function getDefaultRoute(role: string): string {
  switch (role.toLowerCase()) {
    case 'patient':
      return '/patient/dashboard'
    case 'provider':
      return '/provider/patients'
    case 'nurse':
      return '/provider/patients'
    case 'admin':
      return '/practice/protocols'
    case 'super_admin':
      return '/saasadmin/protocols'
    default:
      return '/patient/dashboard'
  }
}

// Route permissions helper
export function canAccessRoute(userRole: string, routePath: string): boolean {
  const role = userRole.toLowerCase()
  
  // Admin and super_admin can access everything
  if (['admin', 'super_admin'].includes(role)) {
    return true
  }
  
  // Patient routes
  if (routePath.startsWith('/patient/')) {
    return role === 'patient'
  }
  
  // Provider routes (for providers, nurses)
  if (routePath.startsWith('/provider/')) {
    return ['provider', 'nurse'].includes(role)
  }
  
  // Practice admin routes
  if (routePath.startsWith('/practice/')) {
    return ['admin', 'super_admin'].includes(role)
  }
  
  // SaaS admin routes
  if (routePath.startsWith('/saasadmin/')) {
    return role === 'super_admin'
  }
  
  // Demo routes (accessible to all authenticated users)
  if (routePath.startsWith('/demo/')) {
    return true
  }
  
  return false
}