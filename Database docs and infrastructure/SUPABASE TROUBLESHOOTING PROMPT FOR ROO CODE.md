# SUPABASE TROUBLESHOOTING PROMPT FOR ROO CODE

## COMMON SUPABASE LOGIN & 404 ISSUES - DIAGNOSTIC & FIX PROMPT

Use this prompt with Roo Code to diagnose and fix Supabase authentication and routing issues in your local environment.

---

## PROMPT FOR ROO CODE

```
SUPABASE AUTHENTICATION & ROUTING TROUBLESHOOTING

Mode: healthcare-platform
Task: Diagnose and fix Supabase authentication and 404 routing issues in local development

CURRENT ISSUES:
- Supabase authentication not working in local environment
- Getting 404 errors on auth routes
- Login/logout functionality failing
- Possible routing or configuration issues

DIAGNOSTIC CHECKLIST - Please verify and fix:

1. ENVIRONMENT CONFIGURATION:
   - Check .env.local file exists and has correct Supabase variables
   - Verify NEXT_PUBLIC_SUPABASE_URL is correct
   - Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
   - Ensure no trailing slashes in URLs
   - Check if environment variables are being loaded properly

2. SUPABASE CLIENT CONFIGURATION:
   - Verify createClient() is properly configured
   - Check if client is using correct URL and key
   - Ensure client is properly exported and imported
   - Verify auth configuration options

3. NEXTJS ROUTING ISSUES:
   - Check if auth callback routes exist (/auth/callback)
   - Verify route handlers are in correct App Router structure
   - Check for missing route.ts files
   - Ensure proper file naming conventions

4. AUTHENTICATION FLOW:
   - Verify signIn/signOut functions are properly implemented
   - Check redirect URLs in Supabase dashboard
   - Ensure auth state management is working
   - Check for proper error handling

5. MIDDLEWARE CONFIGURATION:
   - Verify middleware.ts exists and is properly configured
   - Check if auth middleware is protecting routes correctly
   - Ensure middleware is not blocking auth routes

SPECIFIC FILES TO CHECK AND FIX:
- .env.local
- lib/supabase.ts (or similar client file)
- app/auth/callback/route.ts
- middleware.ts
- Any auth-related components

EXPECTED FIXES:
1. Correct environment variable configuration
2. Proper Supabase client setup
3. Working auth callback route
4. Functional login/logout flow
5. Proper route protection

Please search the codebase first to understand current implementation, then provide specific fixes for any issues found.
```

---

## MOST COMMON SUPABASE ISSUES & SOLUTIONS

### **1. Environment Variables Issues**

**Common Mistakes:**
- Missing `.env.local` file
- Incorrect variable names
- Trailing slashes in URLs
- Using wrong Supabase project URL/keys

**Quick Fix:**
```bash
# .env.local should look like this:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **2. Supabase Client Configuration**

**Common Mistakes:**
- Incorrect client initialization
- Missing auth configuration
- Wrong import/export structure

**Quick Fix:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### **3. Missing Auth Callback Route (404 Error)**

**Common Mistake:**
- Missing `/auth/callback` route handler

**Quick Fix:**
```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or home page
  return NextResponse.redirect(requestUrl.origin)
}
```

### **4. Middleware Configuration Issues**

**Common Mistakes:**
- Missing middleware.ts
- Incorrect auth middleware setup
- Blocking auth routes

**Quick Fix:**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow auth routes to pass through
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  // Redirect to login if no session
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### **5. Redirect URL Configuration**

**Common Mistakes:**
- Wrong redirect URLs in Supabase dashboard
- Localhost vs production URL issues

**Quick Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add these redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

---

## SPECIFIC ROO CODE PROMPTS FOR DIFFERENT ISSUES

### **For Environment Variable Issues:**
```
Mode: healthcare-platform
Task: Check and fix Supabase environment variable configuration

Search the codebase for environment variable usage and verify:
1. .env.local file exists with correct Supabase variables
2. Variables are properly loaded in components
3. No hardcoded URLs or keys
4. Proper variable naming conventions

Fix any issues found and ensure environment variables are correctly configured.
```

### **For 404 Auth Callback Errors:**
```
Mode: healthcare-platform
Task: Fix missing auth callback route causing 404 errors

Search for existing auth routes and:
1. Create missing /auth/callback route handler if it doesn't exist
2. Ensure proper App Router structure (app/auth/callback/route.ts)
3. Implement proper code exchange for session
4. Add proper redirect after authentication
5. Test the auth flow end-to-end

Ensure the route follows NextJS 14 App Router conventions.
```

### **For Login/Logout Functionality:**
```
Mode: healthcare-platform
Task: Fix Supabase authentication login/logout functionality

Search for existing auth functions and:
1. Verify signIn function is properly implemented
2. Check signOut function clears session correctly
3. Ensure proper error handling for auth failures
4. Verify auth state management across components
5. Test redirect flows after login/logout

Make sure authentication works seamlessly in local development.
```

### **For Middleware Issues:**
```
Mode: healthcare-platform
Task: Fix middleware configuration for Supabase auth

Search for existing middleware and:
1. Verify middleware.ts exists and is properly configured
2. Check if auth routes are properly excluded
3. Ensure protected routes redirect to login when not authenticated
4. Fix any route protection issues
5. Test middleware behavior with different auth states

Ensure middleware doesn't interfere with auth flow while protecting routes.
```

---

## DEBUGGING STEPS FOR ROO CODE

### **Step 1: Environment Diagnosis**
```
Search the codebase for environment variable usage and show me:
1. How Supabase client is configured
2. What environment variables are being used
3. Any hardcoded URLs or configuration issues
```

### **Step 2: Route Structure Analysis**
```
Search for auth-related routes and show me:
1. Current auth route structure
2. Missing route handlers
3. Proper App Router file organization
4. Any routing configuration issues
```

### **Step 3: Authentication Flow Review**
```
Search for authentication functions and show me:
1. How login/logout is implemented
2. Session management patterns
3. Error handling for auth failures
4. Redirect logic after authentication
```

---

## VALIDATION CHECKLIST

After Roo Code fixes the issues, verify:

### **✅ Environment Setup:**
- [ ] `.env.local` exists with correct Supabase variables
- [ ] No console errors about missing environment variables
- [ ] Supabase client initializes without errors

### **✅ Auth Routes:**
- [ ] `/auth/callback` route exists and works
- [ ] No 404 errors on auth routes
- [ ] Proper App Router structure

### **✅ Authentication Flow:**
- [ ] Login redirects to correct page
- [ ] Logout clears session properly
- [ ] Auth state persists across page refreshes
- [ ] Protected routes work correctly

### **✅ Local Development:**
- [ ] `npm run dev` starts without errors
- [ ] Authentication works in localhost:3000
- [ ] No console errors in browser
- [ ] Smooth auth flow from login to dashboard

This comprehensive approach should resolve most Supabase authentication and routing issues in your local development environment!

