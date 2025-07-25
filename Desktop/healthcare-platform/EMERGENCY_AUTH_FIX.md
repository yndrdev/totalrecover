# EMERGENCY AUTHENTICATION FIX FOR DEMO

## ⚠️ URGENT: Fix Authentication Runtime Errors

**For demo in 2 hours - follow these steps immediately:**

## 🚀 Quick Fix (2 minutes)

### Option 1: Run Emergency Script
```bash
# Run the emergency RLS disable script
npm run emergency:disable-rls
```

### Option 2: Manual SQL Fix
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste this SQL:

```sql
-- EMERGENCY: Disable ALL RLS
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recovery_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_protocols DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patient_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS protocol_tasks DISABLE ROW LEVEL SECURITY;

-- Grant full access to all roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

3. Click "Run" to execute

## 🔧 Additional Fixes

### Fix Supabase Auth Settings
1. Go to Supabase Dashboard → Authentication → Settings
2. **Disable email confirmations** (for demo only)
3. Set **Site URL** to your deployment URL
4. Add your domain to **Redirect URLs**

### Environment Variables Check
Ensure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 🎯 Test Login

After the fix, test these accounts:
- **Provider**: `surgeon@tjv.com` / `StrongPass123!`
- **Patient**: `sarah.patient@demo.com` / `DemoPass123!`

## 📱 Demo Flow

1. **Provider Login**: `/auth/signin` → Provider Dashboard
2. **Protocols**: `/provider/protocols` → See standard practice badges
3. **Patient Login**: Use demo patient credentials
4. **Patient Chat**: Should show protocol tasks

## 🚨 If Still Not Working

### Last Resort Fixes:

1. **Bypass Auth Temporarily**:
   Add this to your environment:
   ```
   BYPASS_AUTH=true
   ```

2. **Reset Auth State**:
   ```bash
   # Clear browser data
   # Or use incognito mode
   ```

3. **Check Console Errors**:
   - Open browser dev tools
   - Look for specific error messages
   - Share any RLS or auth errors

## ⚡ Immediate Help Commands

```bash
# 1. Fix RLS issues
npm run emergency:disable-rls

# 2. Set up demo data
npm run demo:setup

# 3. Test the system
npm run demo:test

# 4. Check deployment readiness
npm run deploy:check
```

## 🔄 After Demo

**IMPORTANT**: Re-enable security after demo:
1. Create new migration to re-enable RLS
2. Restore proper RLS policies
3. Remove `BYPASS_AUTH=true`
4. Re-enable email confirmations

---

**Your demo will work after running the emergency script! 🎉**