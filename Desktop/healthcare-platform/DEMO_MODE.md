# Demo Mode Instructions

This application now has a demo mode that bypasses Supabase authentication and uses mock data.

## Quick Start

1. The `.env.local` file has been created with `NEXT_PUBLIC_BYPASS_AUTH=true`
2. Run the application: `npm run dev`
3. You can now log in with any of these demo accounts:

### Demo Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Patient | patient@demo.com | any | Patient with upcoming surgery |
| Surgeon | surgeon@demo.com | any | Orthopedic surgeon |
| Nurse | nurse@demo.com | any | Surgical nurse |
| Physical Therapist | pt@demo.com | any | PT specialist |
| Admin | admin@demo.com | any | Practice administrator |

**Note**: In demo mode, any password will work. The email determines which mock user is loaded.

## Features in Demo Mode

- ✅ Login/Logout
- ✅ Role-based routing
- ✅ Consistent user data across pages
- ✅ Mock patient/provider records
- ✅ No Supabase connection required

## Switching Back to Real Auth

To switch back to real Supabase authentication:

1. Edit `.env.local` and set:
   ```
   NEXT_PUBLIC_BYPASS_AUTH=false
   BYPASS_AUTH=false
   ```
2. Add your real Supabase credentials
3. Restart the development server

## How It Works

- Mock data is stored in `/lib/mock-data/mock-auth.ts`
- Mock Supabase client in `/lib/mock-data/mock-supabase-client.ts`
- The mock client intercepts all Supabase calls when bypass is enabled
- User sessions are stored in localStorage
- All pages will see consistent mock data