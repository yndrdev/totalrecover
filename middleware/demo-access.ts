import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Demo user configurations
const DEMO_USERS = {
  '/provider': {
    email: 'surgeon@tjv.com',
    password: 'demo123!',
    role: 'provider'
  },
  '/practice': {
    email: 'admin@tjv.com',
    password: 'demo123!',
    role: 'practice'
  },
  '/patient': {
    email: 'patient1@tjv.com',
    password: 'demo123!',
    role: 'patient'
  },
  '/saasadmin': {
    email: 'superadmin@tjv.com',
    password: 'demo123!',
    role: 'super_admin'
  }
}

export async function handleDemoAccess(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is a demo route
  const demoRoute = Object.keys(DEMO_USERS).find(route => pathname.startsWith(route))
  
  if (demoRoute && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // For demo mode, we'll bypass authentication
    // In a real implementation, you would auto-login the demo user
    return NextResponse.next()
  }
  
  return null
}