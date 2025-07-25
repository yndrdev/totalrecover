# AUTHENTICATION & SECURITY FIX FOR TJV RECOVERY PLATFORM

## 🚨 CRITICAL SECURITY ISSUES IDENTIFIED

1. **Unauthorized App Access**: Users can access the app without proper authentication
2. **Logout Failure**: Users cannot log out properly
3. **Session Management**: Improper session handling on local and staging

## 🎯 IMMEDIATE FIXES REQUIRED

### **ISSUE 1: AUTHENTICATION BYPASS**

#### **Problem**: App allows access without proper authentication
#### **Risk**: HIPAA violation, unauthorized patient data access

---

## 🔒 AUTHENTICATION GUARD IMPLEMENTATION

### **1. Create Authentication Context**

Create `src/contexts/AuthContext.tsx`:
```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Session error:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // Force redirect to login
      router.push('/login');
      router.refresh();
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if error
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user && !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### **2. Create Authentication Guard Component**

Create `src/components/AuthGuard.tsx`:
```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      console.log('AuthGuard: Redirecting unauthenticated user to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if authentication required but user not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
}
```

### **3. Create Route Protection Middleware**

Create `src/middleware.ts`:
```tsx
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get session
  const { data: { session }, error } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/chat',
    '/patients',
    '/protocols',
    '/admin',
    '/provider',
    '/patient'
  ];

  // Define public routes
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/'
  ];

  const { pathname } = req.nextUrl;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && (!session || error)) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from login page to dashboard
  if (pathname === '/login' && session && !error) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### **4. Update Root Layout**

Update `src/app/layout.tsx`:
```tsx
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **5. Protect App Routes**

Update your main app pages to use AuthGuard:

**`src/app/dashboard/layout.tsx`:**
```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
```

**`src/app/chat/layout.tsx`:**
```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}
```

---

## 🚪 LOGOUT FUNCTIONALITY FIX

### **1. Create Logout Component**

Create `src/components/LogoutButton.tsx`:
```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if error
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoggingOut ? 'Signing out...' : (children || 'Sign Out')}
    </button>
  );
}
```

### **2. Add Logout to Navigation**

Update your navigation component:
```tsx
import { LogoutButton } from '@/components/LogoutButton';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              TJV Recovery Platform
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
            <LogoutButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Sign Out
            </LogoutButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

## 🔧 ENVIRONMENT-SPECIFIC FIXES

### **1. Local Development Security**

Update your `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Security Settings
NEXTAUTH_SECRET=your_secure_secret_key
NEXTAUTH_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
```

### **2. Staging Environment Security**

Update your staging environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_anon_key

# Security Settings
NEXTAUTH_SECRET=your_secure_staging_secret
NEXTAUTH_URL=https://your-staging-domain.com

# Production Settings
NODE_ENV=production
```

### **3. Supabase RLS Policies**

Ensure your Supabase RLS policies are properly configured:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for patients table
CREATE POLICY "Users can only access their own practice data" ON patients
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM providers 
    WHERE practice_id = patients.practice_id
  )
);

-- Example RLS policy for messages table
CREATE POLICY "Users can only access messages in their practice" ON messages
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM providers 
    WHERE practice_id = (
      SELECT practice_id FROM patients 
      WHERE id = messages.patient_id
    )
  )
);
```

---

## 🚨 IMMEDIATE ACTION PLAN

### **Step 1: Implement Authentication (15 minutes)**
1. Create `AuthContext.tsx`
2. Create `AuthGuard.tsx`
3. Update `layout.tsx` with AuthProvider
4. Add AuthGuard to protected routes

### **Step 2: Fix Logout (5 minutes)**
1. Create `LogoutButton.tsx`
2. Add to navigation component
3. Test logout functionality

### **Step 3: Add Route Protection (10 minutes)**
1. Create `middleware.ts`
2. Configure protected routes
3. Test route protection

### **Step 4: Verify Security (10 minutes)**
1. Test unauthenticated access (should redirect to login)
2. Test logout functionality (should redirect to login)
3. Test protected routes (should require authentication)
4. Test session persistence

---

## ✅ VERIFICATION CHECKLIST

### **Authentication Security:**
- [ ] Cannot access `/dashboard` without login
- [ ] Cannot access `/chat` without login
- [ ] Cannot access `/patients` without login
- [ ] Redirected to login when accessing protected routes
- [ ] Redirected to dashboard after successful login

### **Logout Functionality:**
- [ ] Logout button visible when authenticated
- [ ] Clicking logout clears session
- [ ] Redirected to login page after logout
- [ ] Cannot access protected routes after logout
- [ ] Must login again to access app

### **Session Management:**
- [ ] Session persists across browser refresh
- [ ] Session expires appropriately
- [ ] Multiple tabs handle auth state correctly
- [ ] Works correctly on both local and staging

---

## 🛡️ SECURITY BEST PRACTICES

### **1. Session Security**
- Sessions expire after inactivity
- Secure cookie settings
- CSRF protection enabled

### **2. Route Protection**
- All sensitive routes protected
- Middleware validates every request
- Proper error handling

### **3. Data Protection**
- RLS policies enforced
- Multi-tenant isolation
- Audit logging enabled

### **4. HIPAA Compliance**
- Secure authentication
- Session management
- Access logging
- Data encryption

**This comprehensive fix will secure your TJV Recovery Platform and ensure proper authentication and logout functionality on both local and staging environments.**

