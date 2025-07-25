import { createClient } from '@/lib/supabase-browser'
import { Database } from '@/lib/database-types'
import { User } from '@supabase/supabase-js'

type UserRecord = Database['public']['Tables']['users']['Row']
type TenantRecord = Database['public']['Tables']['tenants']['Row']

export interface AuthError {
  message: string
  code?: string
  details?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format authentication errors for user display
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unknown error occurred'
  
  // Handle Supabase auth errors
  if (error.message) {
    switch (error.message.toLowerCase()) {
      case 'invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.'
      case 'user not found':
        return 'No account found with this email address.'
      case 'invalid email':
        return 'Please enter a valid email address.'
      case 'weak password':
        return 'Password is too weak. Please choose a stronger password.'
      case 'email already registered':
      case 'user already registered':
        return 'An account with this email already exists. Try signing in instead.'
      case 'signup disabled':
        return 'New account registration is currently disabled.'
      case 'email rate limit exceeded':
        return 'Too many email requests. Please wait a few minutes before trying again.'
      default:
        return error.message
    }
  }
  
  // Handle database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return 'An account with this information already exists.'
      case '23503': // Foreign key violation
        return 'Invalid account information provided.'
      case '42501': // Insufficient privileges
        return 'You do not have permission to perform this action.'
      default:
        return 'A database error occurred. Please try again.'
    }
  }
  
  return typeof error === 'string' ? error : 'An unexpected error occurred'
}

/**
 * Get or create default tenant for demo purposes
 */
export async function getOrCreateDefaultTenant(): Promise<string> {
  const supabase = createClient()
  const defaultTenantId = 'demo-tenant-001'
  
  try {
    // Check if default tenant exists
    const { data: existingTenant, error: fetchError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', defaultTenantId)
      .single()
    
    if (existingTenant && !fetchError) {
      return existingTenant.id
    }
    
    // Create default tenant if it doesn't exist
    const { data: newTenant, error: createError } = await supabase
      .from('tenants')
      .insert({
        id: defaultTenantId,
        name: 'TJV Recovery Demo',
        slug: 'tjv-recovery-demo',
        settings: {
          features: {
            magic_links: true,
            email_notifications: true,
            sms_notifications: false
          },
          branding: {
            logo_url: null,
            primary_color: '#006DB1',
            secondary_color: '#0EA5E9'
          }
        },
        subscription_plan: 'trial',
        subscription_status: 'active'
      })
      .select('id')
      .single()
    
    if (createError) {
      console.error('Error creating default tenant:', createError)
      return defaultTenantId // Return default ID even if creation fails
    }
    
    return newTenant?.id || defaultTenantId
  } catch (error) {
    console.error('Error in getOrCreateDefaultTenant:', error)
    return defaultTenantId
  }
}

/**
 * Create user profile after successful authentication
 */
export async function createUserProfile(
  user: User,
  profileData: {
    full_name: string
    role: 'patient' | 'provider' | 'nurse' | 'admin' | 'super_admin'
    tenant_id?: string
    phone?: string
    date_of_birth?: string
    gender?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const tenantId = profileData.tenant_id || await getOrCreateDefaultTenant()
    
    // Create user record
    const { error: userError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        first_name: profileData.full_name.split(' ')[0],
        last_name: profileData.full_name.split(' ').slice(1).join(' ') || '',
        role: profileData.role,
        tenant_id: tenantId
      })
    
    if (userError) {
      return { success: false, error: formatAuthError(userError) }
    }
    
    // Create role-specific records
    if (profileData.role === 'patient') {
      const [firstName, ...lastNameParts] = profileData.full_name.split(' ')
      const lastName = lastNameParts.join(' ') || 'Unknown'
      
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          profile_id: user.id,
          tenant_id: tenantId,
          mrn: `PAT-${Date.now()}`,
          date_of_birth: profileData.date_of_birth || null,
          phone_number: profileData.phone || null,
          emergency_contact: {},
          medical_history: {},
          insurance_info: {},
          preferred_language: 'en',
          status: 'active'
        })
      
      if (patientError) {
        return { success: false, error: formatAuthError(patientError) }
      }
    } else if (['provider', 'nurse', 'admin', 'super_admin'].includes(profileData.role)) {
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          profile_id: user.id,
          tenant_id: tenantId,
          specialty: profileData.role === 'provider' ? 'General Practice' : profileData.role,
          credentials: [],
          is_primary_surgeon: profileData.role === 'provider'
        })
      
      if (providerError) {
        return { success: false, error: formatAuthError(providerError) }
      }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: formatAuthError(error) }
  }
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(userId: string): Promise<{
  completed: boolean
  missingFields: string[]
}> {
  const supabase = createClient()
  
  try {
    const { data: userRecord, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !userRecord) {
      return { completed: false, missingFields: ['user_profile'] }
    }
    
    const missingFields: string[] = []
    
    if (!userRecord.first_name || !userRecord.last_name) missingFields.push('name')
    if (userRecord.role === 'patient') {
      // Check patient-specific fields
      const { data: patient } = await supabase
        .from('patients')
        .select('date_of_birth, phone_number')
        .eq('profile_id', userId)
        .single()
      
      if (!patient?.date_of_birth) missingFields.push('date_of_birth')
      if (!patient?.phone_number) missingFields.push('phone')
    }
    
    return {
      completed: missingFields.length === 0,
      missingFields
    }
  } catch (error) {
    return { completed: false, missingFields: ['error'] }
  }
}

/**
 * Rate limiting for authentication attempts
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): {
  allowed: boolean
  remainingAttempts: number
  resetTime?: number
} {
  const now = Date.now()
  const attempts = authAttempts.get(identifier)
  
  if (!attempts || now - attempts.lastAttempt > windowMs) {
    // Reset or initialize attempts
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }
  
  if (attempts.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: attempts.lastAttempt + windowMs
    }
  }
  
  // Increment attempts
  attempts.count++
  attempts.lastAttempt = now
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempts.count
  }
}

/**
 * Clear rate limit for an identifier (useful after successful auth)
 */
export function clearRateLimit(identifier: string): void {
  authAttempts.delete(identifier)
}

/**
 * Generate secure password reset token
 */
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 255) // Limit length
}

/**
 * Log authentication events for audit purposes
 */
export async function logAuthEvent(
  userId: string | null,
  event: string,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = createClient()
  
  try {
    // Get user's tenant_id if user exists
    let tenantId = await getOrCreateDefaultTenant()
    
    if (userId) {
      const { data: userRecord } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single()
      
      if (userRecord) {
        tenantId = userRecord.tenant_id
      }
    }
    
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        action: event,
        resource_type: 'authentication',
        resource_id: userId,
        metadata: metadata || {},
        ip_address: ipAddress,
        user_agent: userAgent
      })
  } catch (error) {
    console.error('Error logging auth event:', error)
    // Don't throw - logging failures shouldn't break auth flow
  }
}

/**
 * Extract user's IP address from request headers
 */
export function getClientIP(headers: Record<string, string | string[] | undefined>): string | undefined {
  const forwarded = headers['x-forwarded-for']
  const realIP = headers['x-real-ip']
  const clientIP = headers['x-client-ip']
  
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded
    return ips.split(',')[0].trim()
  }
  
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP
  }
  
  if (clientIP) {
    return Array.isArray(clientIP) ? clientIP[0] : clientIP
  }
  
  return undefined
}

/**
 * Check if user session is still valid
 */
export async function validateSession(): Promise<{
  valid: boolean
  user?: User
  error?: string
}> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { valid: false, error: formatAuthError(error) }
    }
    
    if (!user) {
      return { valid: false, error: 'No active session' }
    }
    
    // Check if user exists in our database
    const { data: userRecord, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (dbError || !userRecord) {
      return { valid: false, error: 'User profile not found' }
    }
    
    return { valid: true, user }
  } catch (error) {
    return { valid: false, error: formatAuthError(error) }
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      return { success: false, error: formatAuthError(error) }
    }
    
    return { success: true, user: data.user || undefined }
  } catch (error) {
    return { success: false, error: formatAuthError(error) }
  }
}