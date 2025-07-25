# TJV Recovery Platform - Database Migration Guide

## Overview
This guide walks you through applying the complete database restructure to fix all foreign key issues and establish a clean, consistent schema.

## Prerequisites
- Access to Supabase dashboard
- Admin privileges to run SQL migrations
- Backup of existing data (if any)

## Migration Steps

### Step 1: Backup Current Data (if needed)
If you have any existing data you want to preserve, export it first:
1. Go to Supabase Dashboard → Database → Backups
2. Create a new backup
3. Download the backup file

### Step 2: Apply the Migration
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire contents of `supabase/migrations/20240120_complete_db_restructure.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration

**Note:** This migration will DROP all existing tables and recreate them. All data will be lost.

### Step 3: Verify the Migration
1. In the SQL Editor, create a new query
2. Copy the contents of `supabase/migrations/verify-migration.sql`
3. Run the verification script
4. Check that all items show ✅ status

### Step 4: Clear Auth Users
Since we're starting fresh, clear all existing auth users:
1. Go to Supabase Dashboard → Authentication → Users
2. Select all users
3. Delete selected users

### Step 5: Register Test Accounts
Create the following test accounts for development:

#### Provider Account
- Email: `doctorchris@email.com`
- Password: `demo123!`
- Role: provider

#### Patient Account
- Email: `patientjohn@email.com`
- Password: `demo123!`
- Role: patient

### Step 6: Update Environment Variables
Ensure your `.env.local` file has the correct Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 7: Restart Development Server
```bash
npm run dev
```

## Post-Migration Checklist

- [ ] Migration script executed successfully
- [ ] Verification script shows all ✅ statuses
- [ ] Auth users cleared
- [ ] Test accounts created
- [ ] Environment variables updated
- [ ] Development server restarted
- [ ] Can login as provider (`doctorchris@email.com`)
- [ ] Can login as patient (`patientjohn@email.com`)
- [ ] Protocol builder loads without errors
- [ ] Chat interface works between provider and patient

## Troubleshooting

### Error: "relation already exists"
This means some tables weren't properly dropped. Run this first:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Error: "permission denied"
Make sure you're using the service role key for admin operations.

### Error: Foreign key constraint violations
The migration script handles all dependencies. If you still see errors, ensure you're running the complete script without modifications.

## Next Steps

After successful migration:
1. Use the "Seed Database" button in Protocol Builder to load TJV recovery data
2. Test the chat system between provider and patient
3. Verify all features work with the new schema

## Migration Benefits

✅ **Clean Schema**: All tables have consistent naming and relationships
✅ **Proper Foreign Keys**: No more profile_id vs user_id confusion
✅ **Multi-tenant Ready**: tenant_id properly cascades through all tables
✅ **RLS Enabled**: Row Level Security policies protect data access
✅ **Audit Trail**: Comprehensive audit_logs table for compliance
✅ **Performance**: Proper indexes on all foreign keys and common queries
✅ **Extensible**: Easy to add new features with clean foundation

## Important Notes

- This is a **destructive migration** - all existing data will be lost
- Always backup production data before running migrations
- Test thoroughly in development before applying to production
- The default tenant ID is: `c1234567-89ab-cdef-0123-456789abcdef`