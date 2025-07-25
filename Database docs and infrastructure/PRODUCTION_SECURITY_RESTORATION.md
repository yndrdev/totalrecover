# Production Security Restoration Guide

## Overview
This guide documents how to restore full production security after the demo/staging phase. The current setup has RLS bypassed for rapid development - this guide shows how to securely transition to production.

## Current Demo State ✅

### What's Currently Disabled for Demo:
- **Email Confirmation**: Accounts create immediately without email verification
- **Row Level Security**: RLS policies bypassed for database access
- **Tenant Isolation**: Relaxed security for multi-user testing

### What's Working:
- ✅ Full account creation (patients/providers)
- ✅ Database operations (profiles, conversations, messages)
- ✅ Chat system functionality
- ✅ Multi-user testing capability
- ✅ Vercel deployment ready

## Production Security Restoration Steps

### Phase 1: Re-enable Email Confirmation

#### 1.1 Update Signup Route
```typescript
// File: app/auth/signup/route.ts
// CHANGE: Remove immediate profile creation
// RESTORE: Email confirmation flow

const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${requestUrl.origin}/auth/callback`, // RESTORE this line
    data: {
      userType,
      firstName,
      lastName,
      specialty: specialty || null,
      practiceAffiliation: practiceAffiliation || null,
    },
  },
});

// REMOVE: Immediate profile creation block
// LET: auth/callback handle profile creation after email confirmation
```

#### 1.2 Update Success Message
```typescript
return NextResponse.redirect(
  `${requestUrl.origin}/login?message=Registration successful! Please check your email to confirm your account before logging in.`,
  { status: 301 }
);
```

### Phase 2: Enable Row Level Security

#### 2.1 Run RLS Enablement Script
```sql
-- Execute this in Supabase SQL Editor
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Create Core RLS Policies
```sql
-- Profiles: Users can only access their own data
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients: Users can only access their own patient records
CREATE POLICY "Users can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patient record" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers: Users can only access their own provider records
CREATE POLICY "Users can view their own provider record" ON providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider record" ON providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider record" ON providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations: Tenant-based access
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.user_id = auth.uid() 
      AND p.id = conversations.patient_id
    )
  );

CREATE POLICY "Providers can view conversations in their tenant" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      JOIN providers pv ON pr.id = pv.user_id
      WHERE pr.id = auth.uid()
      AND pr.tenant_id = conversations.tenant_id
      AND pr.role IN ('provider', 'surgeon', 'nurse')
    )
  );

-- Messages: Similar tenant-based access
CREATE POLICY "Patients can view their own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p 
      WHERE p.user_id = auth.uid() 
      AND p.id = messages.patient_id
    )
  );

CREATE POLICY "Providers can view messages in their tenant" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
      AND pr.tenant_id = messages.tenant_id
      AND pr.role IN ('provider', 'surgeon', 'nurse')
    )
  );
```

### Phase 3: Update Application Code for RLS

#### 3.1 Add Service Role for Server Operations
```typescript
// File: lib/supabase/service.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### 3.2 Update Server Components for RLS
```typescript
// Use service client for server-side operations that need to bypass RLS
// Use regular client for user-scoped operations
```

### Phase 4: Testing Checklist

#### 4.1 Email Confirmation Testing
- [ ] New user registers and receives email
- [ ] Email confirmation link works
- [ ] Profile creation happens after email confirmation
- [ ] Login works after email confirmation
- [ ] Failed confirmation handling works

#### 4.2 RLS Policy Testing
- [ ] Users can only see their own profiles
- [ ] Patients can only see their own conversations
- [ ] Providers can only see conversations in their tenant
- [ ] Cross-tenant access is blocked
- [ ] Unauthorized access returns proper errors

#### 4.3 Multi-Tenant Testing
- [ ] Tenant isolation works correctly
- [ ] Provider dashboard shows only tenant patients
- [ ] Chat system respects tenant boundaries
- [ ] Admin access controls work properly

### Phase 5: Production Deployment

#### 5.1 Environment Variables
```bash
# Ensure these are set in production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 5.2 Supabase Configuration
- [ ] Email templates configured
- [ ] SMTP settings configured
- [ ] RLS policies enabled
- [ ] Auth settings configured
- [ ] Custom domains set up (if needed)

## Rollback Plan

If issues arise, you can quickly disable RLS for debugging:

```sql
-- EMERGENCY ROLLBACK: Disable RLS temporarily
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

## Security Benefits of Production Mode

1. **Data Protection**: Users can only access their own data
2. **Tenant Isolation**: Healthcare organizations' data is isolated
3. **Role-Based Access**: Providers see appropriate patient data
4. **Email Verification**: Ensures valid email addresses
5. **Audit Trail**: All database access is logged and controlled
6. **HIPAA Compliance**: Proper access controls for healthcare data

## Migration Timeline

- **Demo/Staging**: Continue with current open access
- **Pre-Production**: Test with RLS enabled in staging environment
- **Production**: Full security implementation with email confirmation
- **Post-Launch**: Monitor and adjust policies as needed