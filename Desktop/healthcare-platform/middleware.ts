import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname
  console.log('[Middleware] Processing:', pathname)

  // Check if bypass auth is enabled for demo
  const bypassAuth = process.env.BYPASS_AUTH === 'true' || process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
  
  // If bypass auth is enabled, allow ALL routes (no authentication required)
  if (bypassAuth) {
    console.log('[Middleware] DEMO MODE - No authentication required for:', pathname)
    return supabaseResponse
  }

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required Supabase environment variables');
    // Return early without authentication check
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your server
  // vulnerable to CSRF attacks.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/callback',
    '/auth/login',
    '/auth/signin',
    '/auth/signup',
    '/auth/magic-link',
    '/auth/invite',
    '/auth/patient-access',
    '/login',
    '/register',
    '/signup'
  ]

  // API routes that should be accessible
  const publicApiRoutes = [
    '/api/auth',
    '/api/test'
  ]

  // Demo routes (require auth but accessible to all roles)
  const demoRoutes = [
    '/demo'
  ]

  // Admin migration routes (special case)
  const adminRoutes = [
    '/admin/migration'
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  const isDemoRoute = pathname.startsWith('/demo')
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Allow public routes without authentication
  if (isPublicRoute || isPublicApiRoute || isAdminRoute) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // For authenticated users, check role-based access
  try {
    // Fetch user record to get role information
    const { data: userRecord, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If user doesn't exist in our database, redirect to login
    if (error || !userRecord) {
      console.error('User not found in database:', error)
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'Account not found')
      return NextResponse.redirect(url)
    }

    const userRole = userRecord.role

    // Demo routes are accessible to all authenticated users
    if (isDemoRoute) {
      return supabaseResponse
    }

    // Role-based route protection
    const roleRouteMap = {
      'patient': ['/patient', '/preop', '/postop'], // Patients can access patient, preop, and postop routes
      'provider': ['/provider'],
      'nurse': ['/provider'],
      'admin': ['/practice', '/provider'], // Admins can access practice and provider routes
      'super_admin': ['/saasadmin', '/practice', '/provider'] // Super admins can access everything
    }

    const allowedRoutes = roleRouteMap[userRole as keyof typeof roleRouteMap] || []
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const url = request.nextUrl.clone()
      
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
            url.pathname = surgeryDate > today ? '/preop' : '/postop'
          } else {
            url.pathname = '/preop' // Default to preop
          }
          break
        case 'provider':
        case 'nurse':
          url.pathname = '/provider/patients'
          break
        case 'admin':
          url.pathname = '/practice/protocols'
          break
        case 'super_admin':
          url.pathname = '/saasadmin/protocols'
          break
        default:
          url.pathname = '/preop'
      }
      
      return NextResponse.redirect(url)
    }

    // If user is trying to access root authenticated paths, redirect to their default dashboard
    // Skip redirect for patient profile pages
    if ((pathname === '/patient' && !pathname.includes('/patient/')) || pathname === '/provider' || pathname === '/practice' || pathname === '/saasadmin') {
      const url = request.nextUrl.clone()
      
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
            url.pathname = surgeryDate > today ? '/preop' : '/postop'
          } else {
            url.pathname = '/preop' // Default to preop
          }
          break
        case 'provider':
        case 'nurse':
          url.pathname = '/provider/patients'
          break
        case 'admin':
          url.pathname = '/practice/protocols'
          break
        case 'super_admin':
          url.pathname = '/saasadmin/protocols'
          break
        default:
          url.pathname = '/preop'
      }
      
      return NextResponse.redirect(url)
    }

  } catch (error) {
    console.error('Error in middleware role check:', error)
    // On error, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('error', 'Authentication error')
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're trying to modify the response object (e.g. to add a custom header),
  // you must first copy the headers from supabaseResponse.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - files with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
}
