# Database Migration Quick Checklist

## 🚀 Migration Steps

### 1. Open Supabase Dashboard
- [ ] Go to your Supabase project dashboard
- [ ] Navigate to SQL Editor

### 2. Apply Migration
- [ ] Create new query in SQL Editor
- [ ] Copy contents from: `supabase/migrations/20240120_complete_db_restructure.sql`
- [ ] Paste and run the migration
- [ ] Confirm successful execution (no errors)

### 3. Verify Migration
- [ ] Create another query
- [ ] Copy contents from: `supabase/migrations/verify-migration.sql`
- [ ] Run verification script
- [ ] Check all items show ✅ status

### 4. Clear Auth Users
- [ ] Go to Authentication → Users
- [ ] Select and delete all existing users

### 5. Create Test Accounts
- [ ] Register provider account:
  - Email: `doctorchris@email.com`
  - Password: `demo123!`
  - Role: provider

- [ ] Register patient account:
  - Email: `patientjohn@email.com`
  - Password: `demo123!`
  - Role: patient

### 6. Restart Dev Server
- [ ] Stop current dev server (Ctrl+C)
- [ ] Run: `npm run dev`

## 🧪 Testing Checklist

Once migration is complete, we'll test:

1. **Login System**
   - [ ] Provider login works
   - [ ] Patient login works
   - [ ] Correct routing after login

2. **Protocol Builder**
   - [ ] Loads without errors
   - [ ] Can create new protocol
   - [ ] "Seed Database" button works

3. **Chat System**
   - [ ] Provider can see patient list
   - [ ] Patient can access chat
   - [ ] Messages send/receive properly
   - [ ] Real-time updates work

4. **Database Integrity**
   - [ ] No foreign key errors
   - [ ] RLS policies working
   - [ ] Audit logs recording

---

**Ready to start?** Let me know when you're at the Supabase SQL Editor!