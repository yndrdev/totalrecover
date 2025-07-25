import { createClient } from '@/lib/supabase/server'

export type UserRole = 
  | 'patient'
  | 'nurse' 
  | 'surgeon'
  | 'physical_therapist'
  | 'practice_admin'
  | 'saas_admin'

interface Permission {
  resource: string
  actions: string[]
}

// Define role-based permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  patient: [
    { resource: 'own_profile', actions: ['read', 'update'] },
    { resource: 'own_tasks', actions: ['read', 'update'] },
    { resource: 'own_messages', actions: ['read', 'create'] },
    { resource: 'content', actions: ['read'] }
  ],
  nurse: [
    { resource: 'patients', actions: ['read', 'update'] },
    { resource: 'patient_tasks', actions: ['read', 'update'] },
    { resource: 'protocols', actions: ['read'] },
    { resource: 'messages', actions: ['read', 'create'] },
    { resource: 'content', actions: ['read'] }
  ],
  surgeon: [
    { resource: 'patients', actions: ['read', 'create', 'update'] },
    { resource: 'protocols', actions: ['read', 'create', 'update'] },
    { resource: 'patient_tasks', actions: ['read', 'update'] },
    { resource: 'schedule', actions: ['read', 'update'] },
    { resource: 'content', actions: ['read', 'create', 'update'] }
  ],
  physical_therapist: [
    { resource: 'patients', actions: ['read', 'update'] },
    { resource: 'patient_tasks', actions: ['read', 'update'] },
    { resource: 'protocols', actions: ['read'] },
    { resource: 'exercises', actions: ['read', 'create', 'update'] },
    { resource: 'content', actions: ['read'] }
  ],
  practice_admin: [
    { resource: 'practice_settings', actions: ['read', 'update'] },
    { resource: 'staff', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'patients', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'protocols', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'billing', actions: ['read', 'update'] }
  ],
  saas_admin: [
    { resource: '*', actions: ['*'] } // Full access to everything
  ]
}

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const permissions = rolePermissions[userRole]
  
  if (!permissions) return false

  // Check for wildcard permissions (SaaS admin)
  const wildcardPermission = permissions.find(p => p.resource === '*')
  if (wildcardPermission && wildcardPermission.actions.includes('*')) {
    return true
  }

  // Check specific resource permissions
  const resourcePermission = permissions.find(p => p.resource === resource)
  if (!resourcePermission) return false

  return resourcePermission.actions.includes(action) || 
         resourcePermission.actions.includes('*')
}

/**
 * Middleware to check permissions for API routes
 */
export async function checkPermission(
  resource: string,
  action: string
) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { allowed: false, error: 'Unauthorized' }
  }

  // Get user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData?.role) {
    return { allowed: false, error: 'User role not found' }
  }

  const allowed = hasPermission(userData.role as UserRole, resource, action)
  
  return { 
    allowed, 
    error: allowed ? null : 'Insufficient permissions',
    userRole: userData.role 
  }
}

/**
 * Filter data based on user's role and permissions
 */
export function filterDataByRole(
  data: any[],
  userRole: UserRole,
  userId: string,
  resourceType: string
): any[] {
  switch (resourceType) {
    case 'patients':
      // Patients can only see their own data
      if (userRole === 'patient') {
        return data.filter(item => item.user_id === userId)
      }
      return data

    case 'tasks':
      // Patients can only see their own tasks
      if (userRole === 'patient') {
        return data.filter(item => item.patient_id === userId)
      }
      return data

    case 'messages':
      // Filter messages based on role
      if (userRole === 'patient') {
        return data.filter(item => 
          item.sender_id === userId || 
          item.recipient_id === userId
        )
      }
      return data

    default:
      return data
  }
}

/**
 * Sanitize data based on user's role
 * Remove sensitive fields that the user shouldn't see
 */
export function sanitizeDataByRole(
  data: any,
  userRole: UserRole,
  resourceType: string
): any {
  const sensitiveFields: Record<string, string[]> = {
    patients: ['ssn', 'insurance_details'],
    users: ['password_hash', 'auth_token'],
    protocols: ['internal_notes'],
    billing: ['payment_details', 'credit_card_info']
  }

  // SaaS admins can see everything
  if (userRole === 'saas_admin') {
    return data
  }

  const fieldsToRemove = sensitiveFields[resourceType] || []
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item, fieldsToRemove))
  } else {
    return sanitizeObject(data, fieldsToRemove)
  }
}

function sanitizeObject(obj: any, fieldsToRemove: string[]): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized = { ...obj }
  fieldsToRemove.forEach(field => {
    delete sanitized[field]
  })
  
  return sanitized
}

/**
 * Get accessible tenant IDs for a user
 */
export async function getAccessibleTenants(
  userId: string,
  userRole: UserRole
): Promise<string[]> {
  const supabase = await createClient()

  // SaaS admins can access all tenants
  if (userRole === 'saas_admin') {
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id')
    
    return tenants?.map(t => t.id) || []
  }

  // Other users can only access their own tenant
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', userId)
    .single()

  return userData?.tenant_id ? [userData.tenant_id] : []
}