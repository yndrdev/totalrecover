import { Database } from './database-types'

type UserRole = Database['public']['Tables']['users']['Row']['role']

interface RouteConfig {
  defaultRoute: string
  allowedRoutes: string[]
  redirectOnUnauthorized: string
}

/**
 * Role-based routing configuration
 */
export const roleRoutes: Record<UserRole, RouteConfig> = {
  patient: {
    defaultRoute: '/patient', // Will be dynamically appended with profile ID
    allowedRoutes: ['/patient'],
    redirectOnUnauthorized: '/patient'
  },
  provider: {
    defaultRoute: '/provider/patients',
    allowedRoutes: ['/provider'],
    redirectOnUnauthorized: '/provider/patients'
  },
  nurse: {
    defaultRoute: '/provider/patients',
    allowedRoutes: ['/provider'],
    redirectOnUnauthorized: '/provider/patients'
  },
  admin: {
    defaultRoute: '/practice/protocols',
    allowedRoutes: ['/practice', '/provider'],
    redirectOnUnauthorized: '/practice/protocols'
  },
  super_admin: {
    defaultRoute: '/saasadmin/protocols',
    allowedRoutes: ['/saasadmin', '/practice', '/provider'],
    redirectOnUnauthorized: '/saasadmin/protocols'
  }
}

/**
 * Get the default route for a user role
 * @param role - The user's role
 * @param userId - Optional user ID for dynamic routes (e.g., patient routes)
 */
export function getDefaultRoute(role: UserRole, userId?: string): string {
  const defaultRoute = roleRoutes[role]?.defaultRoute || '/patient'
  
  // For patient role, append the user ID if provided
  if (role === 'patient' && userId) {
    return `${defaultRoute}/${userId}`
  }
  
  return defaultRoute
}

/**
 * Check if a user role has access to a specific route
 */
export function hasRouteAccess(role: UserRole, path: string): boolean {
  const config = roleRoutes[role]
  if (!config) return false
  
  // Check if the path starts with any of the allowed routes
  return config.allowedRoutes.some(route => path.startsWith(route))
}

/**
 * Get redirect route for unauthorized access
 */
export function getUnauthorizedRedirect(role: UserRole): string {
  return roleRoutes[role]?.redirectOnUnauthorized || '/'
}

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  '/',
  '/auth/callback',
  '/auth/login',
  '/auth/signup',
  '/auth/magic-link',
  '/login',
  '/register',
  '/signup'
]

/**
 * API routes that should be accessible without authentication
 */
export const publicApiRoutes = [
  '/api/auth',
  '/api/test'
]

/**
 * Demo routes (require auth but accessible to all roles)
 */
export const demoRoutes = [
  '/demo'
]

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path === route || path.startsWith(route))
}

/**
 * Check if a route is a public API route
 */
export function isPublicApiRoute(path: string): boolean {
  return publicApiRoutes.some(route => path.startsWith(route))
}

/**
 * Check if a route is a demo route
 */
export function isDemoRoute(path: string): boolean {
  return path.startsWith('/demo')
}

/**
 * Get route display name for breadcrumbs or navigation
 */
export function getRouteDisplayName(path: string): string {
  const routeNames: Record<string, string> = {
    '/patient': 'Patient Portal',
    '/patient/recovery': 'Recovery Timeline',
    '/patient/messages': 'Messages',
    '/patient/appointments': 'Appointments',
    '/patient/documents': 'Documents',
    '/patient/profile': 'Profile',
    
    '/provider/patients': 'Patients',
    '/provider/protocols': 'Protocols',
    '/provider/schedule': 'Schedule',
    '/provider/messages': 'Messages',
    '/provider/content': 'Content Library',
    '/provider/chat-monitor': 'Chat Monitor',
    
    '/practice/protocols': 'Protocols',
    '/practice/protocols/builder': 'Protocol Builder',
    '/practice/staff': 'Staff Management',
    '/practice/patients': 'Patient Management',
    '/practice/analytics': 'Analytics',
    '/practice/settings': 'Settings',
    
    '/saasadmin/protocols': 'Global Protocols',
    '/saasadmin/protocols/builder': 'Protocol Builder',
    '/saasadmin/tenants': 'Tenant Management',
    '/saasadmin/analytics': 'Platform Analytics',
    '/saasadmin/settings': 'Platform Settings'
  }
  
  return routeNames[path] || path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    patient: 'Patient',
    provider: 'Healthcare Provider',
    nurse: 'Nurse',
    admin: 'Practice Administrator',
    super_admin: 'Platform Administrator'
  }
  
  return roleNames[role] || 'User'
}

/**
 * Get role badge color for UI consistency
 */
export function getRoleBadgeColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    patient: 'bg-blue-100 text-blue-800',
    provider: 'bg-purple-100 text-purple-800',
    nurse: 'bg-green-100 text-green-800',
    admin: 'bg-orange-100 text-orange-800',
    super_admin: 'bg-red-100 text-red-800'
  }
  
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(role: UserRole) {
  switch (role) {
    case 'patient':
      return [
        { label: 'Chat', href: '/patient', icon: 'MessageCircle' },
        { label: 'Recovery Timeline', href: '/patient/recovery', icon: 'Calendar' },
        { label: 'Appointments', href: '/patient/appointments', icon: 'Clock' },
        { label: 'Documents', href: '/patient/documents', icon: 'FileText' },
        { label: 'Profile', href: '/patient/profile', icon: 'User' }
      ]
    
    case 'provider':
    case 'nurse':
      return [
        { label: 'Patients', href: '/provider/patients', icon: 'Users' },
        { label: 'Protocols', href: '/provider/protocols', icon: 'FileText' },
        { label: 'Schedule', href: '/provider/schedule', icon: 'Calendar' },
        { label: 'Messages', href: '/provider/messages', icon: 'MessageCircle' },
        { label: 'Content Library', href: '/provider/content', icon: 'Library' },
        { label: 'Chat Monitor', href: '/provider/chat-monitor', icon: 'Monitor' }
      ]
    
    case 'admin':
      return [
        { label: 'Protocols', href: '/practice/protocols', icon: 'FileText' },
        { label: 'Protocol Builder', href: '/practice/protocols/builder', icon: 'Edit' },
        { label: 'Staff', href: '/practice/staff', icon: 'Users' },
        { label: 'Patients', href: '/practice/patients', icon: 'UserCheck' },
        { label: 'Analytics', href: '/practice/analytics', icon: 'BarChart' },
        { label: 'Settings', href: '/practice/settings', icon: 'Settings' }
      ]
    
    case 'super_admin':
      return [
        { label: 'Global Protocols', href: '/saasadmin/protocols', icon: 'FileText' },
        { label: 'Protocol Builder', href: '/saasadmin/protocols/builder', icon: 'Edit' },
        { label: 'Tenants', href: '/saasadmin/tenants', icon: 'Building' },
        { label: 'Analytics', href: '/saasadmin/analytics', icon: 'BarChart' },
        { label: 'Settings', href: '/saasadmin/settings', icon: 'Settings' }
      ]
    
    default:
      return []
  }
}