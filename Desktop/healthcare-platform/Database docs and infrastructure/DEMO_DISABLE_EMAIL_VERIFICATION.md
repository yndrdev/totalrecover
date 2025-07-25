# 🔧 DISABLE EMAIL VERIFICATION FOR DEMO

## **CRITICAL: FOR DEMO ONLY - DISABLE EMAIL VERIFICATION**

To make testing easier for your demo tomorrow, temporarily disable email verification:

### **Step 1: Supabase Dashboard Settings**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication → Settings**
3. Scroll down to **"Email"** section
4. **Turn OFF** "Enable email confirmations"
5. **Save changes**

### **Step 2: Alternative - Update Auth Settings via SQL**

If you prefer to use SQL, run this in your Supabase SQL Editor:

```sql
-- Temporarily disable email confirmation requirement
-- WARNING: This is for demo purposes only!

UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- This confirms all existing users immediately
```

### **Step 3: Test Registration Flow**

After disabling email verification:

1. **Register new user** at `/register`
2. **Login immediately** at `/login` (no email verification needed)
3. **Should redirect** to appropriate dashboard

### **Step 4: Re-enable After Demo**

**IMPORTANT:** After your demo, re-enable email verification:

1. Go back to **Supabase Dashboard → Authentication → Settings**
2. **Turn ON** "Enable email confirmations"
3. **Save changes**

## **DEMO TESTING SEQUENCE**

### **1. Clean Database** (Run DEMO_RESET_SCRIPT.sql)
### **2. Disable Email Verification** (Follow steps above)
### **3. Create Test Users** (Use credentials from DEMO_SETUP_GUIDE.md)
### **4. Test Login Flow** (All users should work immediately)

## **BACKUP PLAN: Manual User Creation**

If registration still has issues, you can create users manually in Supabase:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add user"**
3. Create each test user with:
   - Email from the guide
   - Password: `Demo123!`
   - Email confirmed: **YES**
   - User metadata: `{"firstName": "Name", "lastName": "Surname", "userType": "patient"}`

This ensures you have working test accounts for your demo tomorrow!

## **PRODUCTION NOTES**

- ✅ Email verification disabled = immediate login for demo
- ✅ All test users will work instantly
- ✅ No email dependency for testing
- ⚠️ **MUST re-enable for production use**
- ⚠️ **Delete demo users before going live**