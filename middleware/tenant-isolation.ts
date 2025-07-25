import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Middleware to ensure tenant isolation
 * Validates that users can only access data from their own tenant
 */
export async function withTenantIsolation(
  request: NextRequest,
  handler: (request: NextRequest, tenantId: string) => Promise<NextResponse>
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's tenant ID from profiles table
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.tenant_id) {
      return NextResponse.json(
        { error: 'User tenant not found' },
        { status: 403 }
      )
    }

    // For SaaS admins, allow cross-tenant access if needed
    if (userData.role === 'saas_admin') {
      const requestedTenantId = request.headers.get('X-Tenant-ID') || userData.tenant_id
      return handler(request, requestedTenantId)
    }

    // For all other users, enforce tenant isolation
    return handler(request, userData.tenant_id)
  } catch (error) {
    console.error('Tenant isolation middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Validate that a resource belongs to the user's tenant
 */
export function validateTenantAccess(
  resourceTenantId: string,
  userTenantId: string,
  userRole: string
): boolean {
  // SaaS admins can access any tenant's resources
  if (userRole === 'saas_admin') {
    return true
  }

  // Other users can only access their own tenant's resources
  return resourceTenantId === userTenantId
}

/**
 * Add tenant_id to query filters
 */
export function addTenantFilter(
  query: any,
  tenantId: string,
  userRole: string
) {
  // SaaS admins can query across tenants
  if (userRole === 'saas_admin') {
    return query
  }

  // Other users are restricted to their tenant
  return query.eq('tenant_id', tenantId)
}

/**
 * Log audit events
 */
export async function logAuditEvent({
  userId,
  tenantId,
  action,
  resourceType,
  resourceId,
  metadata
}: {
  userId: string
  tenantId: string
  action: string
  resourceType: string
  resourceId?: string
  metadata?: any
}) {
  try {
    const supabase = await createClient()
    
    await supabase.from('audit_logs').insert({
      user_id: userId,
      tenant_id: tenantId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}