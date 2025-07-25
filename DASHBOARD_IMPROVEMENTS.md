# Dashboard Data Fetching Improvements

## Overview

The provider dashboard has been significantly improved to properly handle the current database schema with better error handling and fallback mechanisms for missing relationships.

## Key Changes Made

### 1. Enhanced Error Handling

**Before:**
```typescript
const { data: userProfile } = await supabase
  .from("profiles")
  .select("role, first_name, last_name, tenant_id")
  .eq("id", user.id)
  .single();
```

**After:**
```typescript
const { data: userProfile, error: profileError } = await supabase
  .from("profiles")
  .select("role, first_name, last_name, tenant_id")
  .eq("id", user.id)
  .single();

if (profileError) {
  console.error("Profile fetch error:", profileError);
  throw new Error(`Failed to fetch user profile: ${profileError.message}`);
}

if (!userProfile) {
  throw new Error("User profile not found. Please contact support.");
}
```

### 2. Separated Data Enrichment Logic

Created a dedicated `enrichPatientsWithRelatedData` helper function that:
- Fetches patient profiles, provider profiles, and protocols separately
- Handles errors gracefully for each relationship
- Provides fallback values for missing relationships
- Returns patients with basic data if enrichment fails

### 3. Improved Relationship Handling

The dashboard now properly handles these database relationships:

```
auth.users.id → profiles.id (1:1 direct match)
profiles.id → patients.user_id (profile links to patient)
patients.surgeon_id → profiles.id (optional provider)
patients.protocol_id → recovery_protocols.id (optional protocol)
```

### 4. Better Assignment Functions

**Protocol Assignment:**
- Validates patient and protocol existence before updating
- Provides detailed error messages
- Handles null protocol assignment (unassignment)

**Provider Assignment:**
- Validates provider field names
- Checks provider existence before assignment
- Provides comprehensive error logging

### 5. Comprehensive Logging

Added detailed logging for debugging database issues:
```typescript
console.error("Error details:", {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint,
  user: user?.id,
  tenant: userProfile?.tenant_id
});
```

## Database Schema Relationships

### Core Tables Structure

1. **profiles** - User information
   - `id` (UUID) - Primary key = auth.users.id
   - `tenant_id` (UUID) - Organization reference
   - `role` (TEXT) - User role

2. **patients** - Patient records
   - `id` (UUID) - Primary key
   - `user_id` (UUID) - References profiles.id
   - `tenant_id` (UUID) - Organization reference
   - `surgeon_id` (UUID) - Optional reference to profiles.id
   - `protocol_id` (UUID) - Optional reference to recovery_protocols.id

3. **recovery_protocols** - Protocol templates
   - `id` (UUID) - Primary key
   - `tenant_id` (UUID) - Organization reference
   - `is_active` (BOOLEAN) - Active status

### Common Issues Addressed

1. **Missing Profile Records**
   - Dashboard gracefully handles users without complete profiles
   - Provides meaningful error messages for missing data

2. **Broken Foreign Key References**
   - Non-blocking warnings for missing referenced records
   - Fallback to null values instead of breaking the UI

3. **Tenant Isolation**
   - All queries properly filter by tenant_id
   - Prevents cross-tenant data leakage

4. **Performance Optimization**
   - Batch queries for related data
   - Efficient use of `in` clauses for multiple lookups

## Testing the Improvements

### Debug Script

Use the provided `debug-database-relationships.js` script to test database connectivity and relationships:

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Run the debug script
node debug-database-relationships.js
```

### Browser Console Debugging

The dashboard now provides comprehensive console logging:
- Profile fetch status
- Patient query results
- Relationship resolution
- Error details with context

## Error Recovery Strategies

### 1. Graceful Degradation
- Dashboard loads even if some data is missing
- Non-critical features fail silently with warnings
- User can still perform basic operations

### 2. Retry Mechanisms
- Failed audit logging doesn't break main functionality
- Individual relationship failures don't prevent data loading
- Background refresh attempts for failed queries

### 3. User Feedback
- Clear error messages for actionable issues
- Specific guidance for common problems
- Contact support prompts for unrecoverable errors

## Next Steps

1. **Monitor Console Logs** - Check browser console for relationship warnings
2. **Verify Data Integrity** - Use debug script to identify missing relationships
3. **Row Level Security** - Ensure RLS policies allow proper data access
4. **Sample Data** - Add test patients and protocols if tables are empty

## Common Troubleshooting

### "User profile not found"
- Check if profile exists for authenticated user
- Verify auth.users.id matches profiles.id

### "No patients found"
- Verify patients table has data for the tenant
- Check tenant_id filtering

### Missing Provider Names
- Check if provider IDs in patients table reference valid profiles
- Verify provider roles in profiles table

### Protocol Assignment Fails
- Ensure recovery_protocols table has active protocols
- Check tenant_id matching between user and protocols