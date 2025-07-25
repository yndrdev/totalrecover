# TJV Recovery Platform - RLS Implementation Guide

## Overview
This guide provides comprehensive instructions for implementing Row Level Security (RLS) in the TJV Recovery Platform. RLS ensures multi-tenant data isolation and HIPAA compliance at the database level.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Security Model](#security-model)
3. [Implementation Steps](#implementation-steps)
4. [Testing Guide](#testing-guide)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

## Architecture Overview

### Multi-Tenant Hierarchy
```
SaaS Platform
  └── Practice (Healthcare Organization)
      └── Clinic (Physical Location)
          └── Provider (Doctor/Nurse/Admin)
              └── Patient
```

### Key Principles
- **Tenant Isolation**: Each practice's data is completely isolated
- **Role-Based Access**: Different permissions for patients, providers, and admins
- **Patient Privacy**: Patients can only access their own health data
- **Audit Trail**: All access attempts are logged

## Security Model

### User Roles
1. **Patient** (`role: 'patient'`)
   - Can only view/update their own data
   - Can create conversations and messages
   - Can submit form responses

2. **Provider** (`role: 'provider'`)
   - Can view all patients in their accessible tenants
   - Can manage protocols and tasks
   - Can respond to patient messages

3. **Admin** (`role: 'admin'`)
   - Can manage tenant settings
   - Can view audit logs
   - Can create/manage providers

4. **Nurse** (`role: 'nurse'`)
   - Similar to provider with limited admin capabilities
   - Can escalate conversations
   - Can view patient data in accessible tenants

### Key Tables and Relationships
```sql
-- profiles table links auth.users to our system
profiles.id = auth.users.id
profiles.tenant_id = primary tenant
profiles.accessible_tenants = array of accessible tenant IDs

-- patients table uses direct UUID linking
patients.id = auth.users.id (for patient users)
patients.tenant_id = the practice they belong to

-- All other tables reference tenant_id for isolation
```

## Implementation Steps

### Step 1: Apply RLS Policies

1. **Check Current Status**
   ```bash
   node scripts/apply-rls-policies.js --check
   ```

2. **Apply RLS SQL**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy contents of `scripts/setup-complete-rls.sql`
   - Execute the SQL

3. **Verify Implementation**
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   ```

### Step 2: Configure Supabase Client

1. **Frontend Client (Authenticated)**
   ```typescript
   // lib/supabase/client.ts
   import { createBrowserClient } from '@supabase/ssr'

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```

2. **Server Client (Service Role)**
   ```typescript
   // lib/supabase/server.ts
   import { createServerClient } from '@supabase/ssr'

   export function createServiceClient() {
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!,
       {
         auth: {
           autoRefreshToken: false,
           persistSession: false
         }
       }
     )
   }
   ```

### Step 3: Update Application Code

1. **Always Include Tenant Context**
   ```typescript
   // When creating records
   const { data, error } = await supabase
     .from('patients')
     .insert({
       ...patientData,
       tenant_id: userProfile.tenant_id // Always set tenant_id
     })
   ```

2. **Handle RLS Errors**
   ```typescript
   if (error?.code === '42501') {
     // RLS policy violation
     console.error('Access denied by RLS policy')
     return { error: 'You do not have permission to access this resource' }
   }
   ```

## Testing Guide

### 1. Create Test Users
```sql
-- Create test tenant
INSERT INTO tenants (id, name, subdomain, tenant_type)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test Practice', 'test', 'practice');

-- Create test users via Supabase Auth
-- Then create profiles for them
```

### 2. Test Patient Access
```typescript
// Login as patient
const { data: patientData } = await supabase
  .from('patients')
  .select('*')
// Should only return their own record

const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
// Should only return their own conversations
```

### 3. Test Provider Access
```typescript
// Login as provider
const { data: patients } = await supabase
  .from('patients')
  .select('*')
// Should return all patients in their accessible tenants

const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
// Should return all conversations in their tenants
```

### 4. Test Cross-Tenant Isolation
```typescript
// Try to access data from another tenant
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .eq('tenant_id', 'other-tenant-id')
// Should return empty or error
```

## Troubleshooting

### Common Issues

1. **"permission denied for table"**
   - RLS is working but user lacks access
   - Check user's role and tenant associations
   - Verify the RLS policy logic

2. **Can see all data (RLS not working)**
   - Verify RLS is enabled on the table
   - Check if using service role key (bypasses RLS)
   - Ensure using authenticated client

3. **Cannot create records**
   - Check INSERT policies
   - Ensure tenant_id is being set
   - Verify user has proper role

### Debug Queries
```sql
-- Check user's profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Check accessible tenants
SELECT accessible_tenants FROM profiles WHERE id = auth.uid();

-- Test RLS context
SELECT get_user_role();
SELECT get_user_tenant_ids();
SELECT get_user_primary_tenant_id();
```

### Temporarily Disable RLS (Dev Only)
```sql
-- NEVER do this in production!
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

## Best Practices

### 1. Always Use Typed Clients
```typescript
import { Database } from '@/types/supabase'

const supabase = createClient<Database>()
```

### 2. Handle Tenant Context Properly
```typescript
// Good: Explicit tenant context
const createPatient = async (data: PatientData, tenantId: string) => {
  return await supabase
    .from('patients')
    .insert({
      ...data,
      tenant_id: tenantId
    })
}

// Bad: Implicit tenant handling
const createPatient = async (data: PatientData) => {
  return await supabase
    .from('patients')
    .insert(data) // Missing tenant_id!
}
```

### 3. Use Service Role Sparingly
```typescript
// Only use service role for:
// - System operations (cron jobs, migrations)
// - Admin operations that need to bypass RLS
// - Initial setup and seeding

// Never expose service role key to frontend!
```

### 4. Monitor and Audit
```typescript
// Log all admin operations
const deletePatient = async (patientId: string) => {
  // Log the action first
  await auditLog.create({
    action: 'delete_patient',
    resource_id: patientId,
    user_id: currentUser.id,
    metadata: { reason: 'User requested deletion' }
  })
  
  // Then perform the action
  return await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
}
```

### 5. Test Thoroughly
- Create comprehensive test suites for each role
- Test edge cases and permission boundaries
- Regularly audit access patterns
- Use automated testing for RLS policies

## Security Checklist

Before going to production, ensure:

- [ ] RLS enabled on ALL tables
- [ ] Helper functions created and tested
- [ ] All policies thoroughly tested
- [ ] Service role key secured and not exposed
- [ ] Audit logging implemented
- [ ] Error handling for RLS violations
- [ ] Performance indexes created
- [ ] Documentation updated
- [ ] Team trained on RLS concepts
- [ ] Incident response plan in place

## HIPAA Compliance

Our RLS implementation supports HIPAA requirements:

1. **Access Controls** (§164.312(a)(1))
   - Role-based access control
   - Unique user identification
   - Automatic logoff capabilities

2. **Audit Controls** (§164.312(b))
   - Comprehensive audit logging
   - Access attempt tracking
   - Regular audit reviews

3. **Integrity** (§164.312(c)(1))
   - Data validation at database level
   - Consistent tenant isolation
   - Referential integrity

4. **Transmission Security** (§164.312(e)(1))
   - Encrypted connections (TLS)
   - Secure authentication
   - Session management

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Multi-tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review audit logs for access patterns
3. Contact the security team
4. File a security incident if needed