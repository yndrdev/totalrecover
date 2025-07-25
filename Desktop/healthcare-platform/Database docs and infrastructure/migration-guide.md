# TJV Recovery Platform Database Migration Guide

## Overview
This guide walks through the complete database restructure process to fix all schema issues and ensure proper functionality of the chat system and other features.

## Prerequisites
- Access to Supabase Dashboard
- Backup of any important data (if needed)
- Development environment running

## Migration Steps

### Step 1: Backup Current Data (Optional)
If you have any important test data to preserve:

```sql
-- Export current data if needed
-- This is optional for development environments
```

### Step 2: Execute Database Restructure
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `complete-db-restructure.sql`
4. Execute the script

**Note:** This script will:
- Drop all existing tables and policies
- Create new tables with proper structure
- Set up correct foreign key relationships
- Enable Row Level Security (RLS)
- Create helper functions for tenant isolation
- Insert default tenant data

### Step 3: Clear Auth Users
1. In Supabase Dashboard, go to Authentication → Users
2. Select all existing users
3. Delete all users
4. This ensures clean user-profile relationships

### Step 4: Re-create Test Users

#### 4.1 Create Provider Account
1. Navigate to `/auth/register`
2. Register with:
   - Email: `doctorchris@email.com`
   - Password: `demo123!`
   - Role: Provider
   - Complete provider registration form

#### 4.2 Create Patient Account
1. Use the provider dashboard to create patient
2. Navigate to `/provider/patients/new`
3. Create patient:
   - First Name: Sarah
   - Last Name: Johnson
   - Email: `sarah.johnson@email.com`
   - Password: `demo123!`
   - Surgery Type: TKA
   - Surgery Date: (set appropriate date)

### Step 5: Seed Protocol Data
1. Navigate to `/protocol-builder`
2. Click "Seed Database" button
3. This will populate:
   - TJV Recovery Protocol
   - 245 days of recovery tasks
   - All phases from pre-op to long-term recovery

### Step 6: Assign Protocol to Patient
1. In provider dashboard (`/provider/dashboard`)
2. Find Sarah Johnson in patient list
3. Assign "TJV Recovery Protocol" to her
4. This will create all scheduled tasks

### Step 7: Verify Chat System
1. Keep provider logged in one browser/tab
2. In another browser/incognito, login as patient
3. Navigate to `/patient/chat`
4. Verify chat interface loads without errors
5. Test sending messages both ways

## Post-Migration Checklist

- [ ] Database restructure executed successfully
- [ ] All auth users cleared
- [ ] Provider account created
- [ ] Patient account created via provider dashboard
- [ ] Protocol seeded with TJV data
- [ ] Protocol assigned to patient
- [ ] Patient tasks generated
- [ ] Chat system working bidirectionally
- [ ] No 400 errors in console
- [ ] Real-time subscriptions working

## Troubleshooting

### If you see 400 errors:
1. Check browser console for specific error messages
2. Verify all foreign key relationships are correct
3. Ensure user has proper tenant_id in profiles table

### If chat doesn't load:
1. Verify patient has an active conversation
2. Check that profiles table has correct data
3. Ensure RLS policies are allowing access

### If real-time doesn't work:
1. Check Supabase Realtime is enabled for tables
2. Verify subscription channels are correct
3. Check browser console for WebSocket errors

## Important Notes

1. **Tenant Isolation**: All users are automatically assigned to the default tenant (ID: 00000000-0000-0000-0000-000000000000)

2. **Role Management**: The system supports multiple provider roles (surgeon, nurse, etc.) but all have identical capabilities per the universal provider interface design

3. **Audit Logging**: All provider actions are automatically logged for HIPAA compliance

4. **Chat System**: Each patient gets one conversation that persists throughout their recovery journey

## Next Steps After Migration

1. Test all provider dashboard features
2. Verify patient can complete tasks
3. Test chat communication thoroughly
4. Check audit logs are being created
5. Verify all navigation works correctly

## Support

If you encounter issues during migration:
1. Check Supabase logs for SQL errors
2. Verify all steps were completed in order
3. Ensure no cached data is interfering (clear browser cache if needed)