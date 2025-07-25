# Demo Authentication Setup

## Overview
This document describes the authentication setup for demo purposes and how to revert to production-ready security.

## Current Demo Configuration

### 1. Authentication Bypass
- **Environment Variable**: `BYPASS_AUTH=true` in `.env.local`
- **Effect**: Middleware bypasses authentication checks for all routes except `/auth/callback`
- **Location**: `middleware.ts` lines 12-19

### 2. Row Level Security (RLS) 
- **Status**: DISABLED via migration `20250125_disable_rls_demo.sql`
- **Effect**: All database tables have RLS disabled, allowing unrestricted access
- **Tables Affected**: All public schema tables

### 3. Demo Users Created
The following demo users have been created with password `DemoPass123!`:

#### Provider Accounts:
- **dr.chen@demo.tjv.com** - Surgeon
- **jane.smith@demo.tjv.com** - Nurse  
- **michael.rodriguez@demo.tjv.com** - Physical Therapist

#### Patient Accounts:
- **john.doe@demo.com** - Pre-op patient (surgery in 5 days)
- **mary.johnson@demo.com** - Post-op patient (surgery 10 days ago)

## Scripts Available

### Verify Demo Users
```bash
npx tsx scripts/verify-demo-users.ts
```
Checks if demo users exist and can authenticate.

### Create Demo Users
```bash
npx tsx scripts/create-demo-users.ts
```
Creates or updates demo users with correct passwords.

### Test Supabase Connection
```bash
npx tsx scripts/test-supabase-connection.ts
```
Tests direct connection to Supabase and authentication.

## Quick Access Pages

### Simple Login Page
**URL**: `/simple-login`
- Provides quick access buttons to different parts of the app
- Bypasses authentication completely (when BYPASS_AUTH=true)
- Good for demo purposes

### Test Authentication Page
**URL**: `/test-auth`
- Tests authentication directly with detailed logging
- Shows environment configuration
- Useful for debugging auth issues

## Reverting to Production Security

### 1. Re-enable Authentication
Remove or set to false in `.env.local`:
```
BYPASS_AUTH=false
```

### 2. Re-enable Row Level Security
Run this SQL migration:
```sql
-- Re-enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Add other tables as needed

-- Re-apply RLS policies from migration 20240724_security_policies.sql
```

### 3. Remove Temporary Middleware Bypass
In `middleware.ts`, remove lines 21-25:
```typescript
// TEMPORARY: Allow all provider routes without auth check
if (pathname.startsWith('/provider')) {
  console.log('[Middleware] Temporarily allowing provider routes')
  return supabaseResponse
}
```

### 4. Clean Up Demo Users (Optional)
To remove demo users from production:
```sql
DELETE FROM auth.users WHERE email IN (
  'dr.chen@demo.tjv.com',
  'jane.smith@demo.tjv.com', 
  'michael.rodriguez@demo.tjv.com',
  'john.doe@demo.com',
  'mary.johnson@demo.com'
);
```

## Security Considerations

⚠️ **WARNING**: The current configuration is NOT secure and should ONLY be used for demos.

- No authentication required for any routes
- No row-level security on database
- All users have full access to all data
- Demo passwords are publicly known

**DO NOT deploy this configuration to production!**