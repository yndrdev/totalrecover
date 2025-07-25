# Database Migration Plan for TJV Recovery Platform

## Overview
This migration plan will guide you through applying the complete database restructure to fix all schema mismatches and foreign key issues.

## Prerequisites
- Access to Supabase Dashboard
- Database credentials
- Backup of any important data (if needed)

## Migration Steps

### Step 1: Backup Current Data (Optional)
If you have any data you want to preserve, export it first:
```sql
-- Export any important data you want to keep
-- This is optional since we're doing a clean restructure
```

### Step 2: Apply the Database Restructure
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `complete-db-restructure.sql`
3. Paste and execute the script
4. The script will:
   - Drop all existing tables and policies
   - Create new tables with proper structure
   - Set up correct foreign key relationships
   - Create comprehensive RLS policies
   - Add performance indexes
   - Create helper functions for tenant isolation

### Step 3: Clear Auth Users
1. Go to Supabase Dashboard → Authentication → Users
2. Delete all existing users
3. This ensures a clean slate for authentication

### Step 4: Update Environment Variables
Ensure your `.env.local` file has the correct Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Register New Test Users
After the migration, register new test users through the application:

#### Provider Account (Dr. Christopher)
- Email: doctorchris@email.com
- Password: demo123!
- Role: Provider/Surgeon

#### Patient Account (Sarah Johnson)
- Email: sarah.johnson@email.com
- Password: demo123!
- Role: Patient

### Step 6: Seed Test Data
Use the seeding functions in the application to populate test data:
1. Login as Dr. Christopher
2. Go to Protocol Builder
3. Click "Seed Database" to populate TJV recovery protocol data

## Verification Checklist
- [ ] All tables created successfully
- [ ] No foreign key errors
- [ ] RLS policies active
- [ ] Can register new users
- [ ] Can login with new users
- [ ] Provider can access protocol builder
- [ ] Patient can access chat interface
- [ ] Messages can be sent/received
- [ ] Tasks display correctly

## Key Improvements in New Schema

### 1. Proper Foreign Key Relationships
- `profiles.id` references `auth.users(id)` 
- `patients.user_id` references `profiles(id)`
- `providers.user_id` references `profiles(id)`
- All tenant_id references are consistent

### 2. Enhanced Security
- Comprehensive RLS policies for all tables
- Helper functions for tenant isolation
- Proper role-based access control

### 3. Better Data Structure
- Clear separation of concerns
- Proper audit logging support
- Metadata fields for extensibility
- Status enums with constraints

### 4. Performance Optimizations
- Indexes on all foreign keys
- Indexes on commonly queried fields
- Optimized for multi-tenant queries

## Troubleshooting

### If you encounter errors:
1. Check Supabase logs for detailed error messages
2. Ensure all old tables are dropped before creating new ones
3. Verify auth.users table exists (it's created by Supabase)
4. Check that service role key has proper permissions

### Common Issues:
- **Foreign key violation**: Clear auth.users table first
- **Permission denied**: Use service role key for migration
- **Table already exists**: Run the DROP commands separately first

## Next Steps
After successful migration:
1. Implement the provider journey management system
2. Set up audit logging
3. Configure real-time subscriptions
4. Test all user flows end-to-end