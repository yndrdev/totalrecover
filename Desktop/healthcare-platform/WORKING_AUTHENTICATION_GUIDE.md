# ✅ Working Authentication Guide - TJV Recovery Platform

## 🎯 **Current Working State**
- **Branch**: `working-auth-with-demo-accounts`
- **Commit**: `c2ae0a8` (on branch) / `929a107` (base)
- **Server**: Running on http://localhost:3000
- **Status**: ✅ LOGIN WORKING with demo accounts

## 🔑 **Working Demo Accounts**

All accounts use password: **`DemoPass123!`**

### Patient Accounts:
- `postop.recovery@demo.tjvrecovery.com` - 7-day post-op TKA patient
- `recovery.patient@demo.tjvrecovery.com` - 14-day post-op THA patient

### Provider Accounts:
- `dr.smith@demo.tjvrecovery.com` - Orthopedic Surgeon
- `nurse.johnson@demo.tjvrecovery.com` - Registered Nurse
- `pt.williams@demo.tjvrecovery.com` - Physical Therapist
- `dr.wilson@demo.tjvrecovery.com` - Hip Surgeon

### Admin Accounts:
- `admin.davis@demo.tjvrecovery.com` - Practice Administrator
- `owner.admin@demo.tjvrecovery.com` - System Administrator

## 🏗️ **Authentication Architecture**

### File Structure:
```
app/
├── auth/
│   ├── callback/route.ts    # OAuth callback handler
│   ├── login/route.ts       # Login API endpoint
│   ├── logout/route.ts      # Logout handler
│   └── signup/route.ts      # User registration
├── login/page.tsx           # Login page UI
├── register/page.tsx        # Registration page UI
└── dashboard/page.tsx       # Protected dashboard

lib/supabase/
├── client.ts               # Browser Supabase client
└── server.ts               # Server Supabase client

components/auth/
├── login-form.tsx          # Login form component
├── signup-form.tsx         # Registration form component
└── user-provider.tsx       # Auth context provider
```

### Key Components:

1. **Login Flow**: 
   - User enters credentials in `login-form.tsx`
   - Form submits to `/auth/login` API route
   - Server validates with Supabase and creates session
   - User redirected based on role

2. **Role-Based Routing**:
   - Patient → `/patient/chat`
   - Provider → `/provider/dashboard`
   - Admin → `/dashboard`

3. **Auto Profile Creation**:
   - New users automatically get profile records
   - Patient users also get patient table records
   - Proper tenant association

## 🔧 **Critical Environment Variables**

Ensure your `.env.local` has:
```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://slhdxlhnwujvqkwdgfko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (REQUIRED for chat)
OPENAI_API_KEY=sk-proj-...

# Other keys as needed...
```

## 🚨 **What Makes This Work**

### 1. **Proper Supabase Client Setup**:
- Browser client for frontend auth
- Server client with cookie handling for API routes
- Consistent session management

### 2. **Demo Accounts in Database**:
- All accounts exist in `auth.users` table
- Corresponding records in `profiles` table
- Patient accounts have `patients` table records
- Email confirmation enabled

### 3. **Environment Configuration**:
- Valid Supabase credentials
- Proper CORS settings
- Authentication settings correct

## 🧪 **Testing the Working State**

### Quick Test:
1. Go to http://localhost:3000/login
2. Use: `postop.recovery@demo.tjvrecovery.com` / `DemoPass123!`
3. Should redirect to patient chat interface

### Full Test Suite:
```bash
# Run verification script
node scripts/verify-demo-accounts.js
```

## 🛡️ **Protecting This Working State**

### Before Making Changes:
```bash
# Always create a feature branch
git checkout working-auth-with-demo-accounts
git checkout -b feature/your-new-feature

# Work on your feature...
# Test thoroughly...

# Only merge when authentication still works
git checkout working-auth-with-demo-accounts
git merge feature/your-new-feature
```

### Emergency Recovery:
```bash
# If anything breaks, immediately go back to working state
git checkout working-auth-with-demo-accounts
git reset --hard c2ae0a8
```

## 📋 **Development Workflow**

### ✅ **DO**:
1. Test login after EVERY change
2. Work on small features one at a time
3. Commit frequently with working states
4. Use feature branches
5. Keep demo accounts working

### ❌ **DON'T**:
1. Change authentication files without testing
2. Work on multiple features simultaneously
3. Commit broken authentication states
4. Delete or modify demo accounts
5. Change Supabase settings without backup

## 🔍 **Troubleshooting**

### If Login Stops Working:
1. Check demo accounts exist: `node scripts/verify-demo-accounts.js`
2. Verify environment variables are correct
3. Check Supabase dashboard for authentication settings
4. Look at browser console for errors
5. Reset to this working branch: `git checkout working-auth-with-demo-accounts`

### Common Issues:
- **Email not confirmed**: Check Supabase auth settings
- **User not found**: Verify demo accounts exist
- **Session issues**: Clear browser cookies and try again
- **Role errors**: Check profiles table has correct role data

## 📞 **Next Steps**

Now that you have working authentication:
1. Test with the demo accounts
2. Build new features on feature branches
3. Always test login after changes
4. Use this guide as reference for maintaining working state

**Remember**: This branch (`working-auth-with-demo-accounts`) is your safety net. Always come back here if anything breaks!