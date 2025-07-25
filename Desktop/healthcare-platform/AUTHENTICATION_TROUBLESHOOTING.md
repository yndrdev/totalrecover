# Authentication Troubleshooting Guide

## Quick Fix for "No profile found" Error

If you're getting the error: `No profile found for user: "user-id-here"`, follow these steps:

### 1. Database Setup (Required)

Run the minimal database setup SQL script in your Supabase dashboard:

```sql
-- Go to your Supabase dashboard > SQL Editor and run:
-- Copy and paste the contents of: Database docs and infrastructure/minimal-setup.sql
```

This creates the essential tables: `tenants`, `profiles`, `patients`, `providers`

### 2. User Profile Auto-Creation

The dashboard now automatically creates missing profiles! When a user with no profile tries to access the dashboard, it will:

1. ✅ Check if user has a profile
2. ✅ If missing, create profile from user metadata
3. ✅ Create role-specific record (patient/provider)
4. ✅ Redirect to appropriate dashboard

### 3. Manual Profile Creation (if needed)

If automatic creation fails, you can manually create a profile via the API:

```bash
POST /api/setup-profile
# (This endpoint creates missing profiles for authenticated users)
```

### 4. Registration Flow

For new users, the registration flow is:

1. **Register** at `/register` → Choose Patient or Provider
2. **Email Verification** → Check email and click confirmation link
3. **Login** at `/login` → Use verified credentials
4. **Dashboard Access** → Auto-redirects based on role

### 5. Common Issues & Solutions

#### Issue: "Email not confirmed"
- **Solution**: Check email (including spam) and click verification link

#### Issue: "No profile found"
- **Solution**: Dashboard now auto-creates missing profiles
- **Backup**: Run the minimal-setup.sql script

#### Issue: "Invalid login credentials"
- **Solution**: Make sure email is verified first, then try login

#### Issue: Database tables don't exist
- **Solution**: Run the minimal-setup.sql script in Supabase

### 6. Role-Based Redirects

After successful login, users are redirected based on their role:

- **Patient** → `/chat`
- **Provider** → `/provider`  
- **Admin** → `/admin`

### 7. Development Notes

- The dashboard automatically handles missing profiles
- Default tenant is created if missing
- User metadata from registration is used to populate profiles
- RLS policies ensure data security

### 8. Files Modified

- ✅ `/app/dashboard/page.tsx` - Auto-creates missing profiles
- ✅ `/app/auth/signup/route.ts` - Enhanced registration with better error handling
- ✅ `/app/auth/login/route.ts` - Better error messages for email verification
- ✅ `/app/api/setup-profile/route.ts` - Manual profile creation endpoint
- ✅ `/Database docs and infrastructure/minimal-setup.sql` - Database setup script

### 9. Testing

1. Register new user at `/register`
2. Verify email
3. Login at `/login`
4. Should auto-redirect to appropriate dashboard

The system is now resilient and will handle missing profiles gracefully!