# Healthcare Platform - Test User Credentials

## 🏥 Test Environment Configuration

- **Base URL**: http://localhost:3000
- **Tenant ID**: 11111111-1111-1111-1111-111111111111
- **Email Verification**: Auto-confirmed (no email verification required)
- **Login Methods**: Email/Password or Magic Links

---

## 👥 Test User Accounts

### 🏥 PATIENT ACCOUNTS

#### Pre-Operative Patient (Emily Thompson)
- **Email**: `preop.patient@healthcare-test.com`
- **Password**: `TestPatient123!`
- **Role**: Patient
- **Status**: Pre-operative (surgery scheduled in 14 days)
- **Surgery Type**: Total Knee Replacement (TKR)
- **MRN**: MRN-PRE-001
- **Recovery Day**: -14 (14 days before surgery)

**Access URLs**:
- Login: http://localhost:3000/auth/patient-access
- Dashboard: http://localhost:3000/patient/dashboard
- Chat: http://localhost:3000/patient/chat

---

#### Post-Operative Patient (Robert Johnson)
- **Email**: `postop.patient@healthcare-test.com`
- **Password**: `TestPatient123!`
- **Role**: Patient
- **Status**: Post-operative (30 days after surgery)
- **Surgery Type**: Total Hip Replacement (THR)
- **MRN**: MRN-POST-001
- **Recovery Day**: 30

**Access URLs**:
- Login: http://localhost:3000/auth/patient-access
- Dashboard: http://localhost:3000/patient/dashboard
- Chat: http://localhost:3000/patient/chat

---

### 👨‍⚕️ PROVIDER ACCOUNTS

#### Surgeon (Dr. Michael Chen)
- **Email**: `surgeon@healthcare-test.com`
- **Password**: `TestProvider123!`
- **Role**: surgeon
- **Department**: Orthopedic Surgery
- **Specialization**: Joint Replacement
- **License**: MD123456

**Access URLs**:
- Login: http://localhost:3000/auth/login
- Dashboard: http://localhost:3000/provider/dashboard
- Patient Management: http://localhost:3000/provider/patients
- Protocols: http://localhost:3000/provider/protocols
- Schedule: http://localhost:3000/provider/schedule

---

#### Physical Therapist (Jennifer Martinez)
- **Email**: `physicaltherapist@healthcare-test.com`
- **Password**: `TestProvider123!`
- **Role**: physical_therapist
- **Department**: Rehabilitation Services
- **Specialization**: Post-Surgical Rehabilitation
- **License**: PT789012

**Access URLs**:
- Login: http://localhost:3000/auth/login
- Dashboard: http://localhost:3000/provider/dashboard
- Patient Management: http://localhost:3000/provider/patients
- Exercise Library: http://localhost:3000/provider/content/exercises

---

#### Nurse (Patricia Williams)
- **Email**: `nurse@healthcare-test.com`
- **Password**: `TestProvider123!`
- **Role**: nurse
- **Department**: Post-Surgical Care
- **Specialization**: Orthopedic Nursing
- **License**: RN345678

**Access URLs**:
- Login: http://localhost:3000/auth/login
- Dashboard: http://localhost:3000/provider/dashboard
- Patient Management: http://localhost:3000/provider/patients
- Chat Monitor: http://localhost:3000/provider/chat-monitor

---

## 📱 Patient Invitation System

### Testing Patient Invitations

Providers can send invitations to new patients through:
- **URL**: http://localhost:3000/provider/patients/new
- **API Endpoint**: POST http://localhost:3000/api/invitations/send

### Required Configuration

**SMS (Twilio)**:
- Account SID: `SKf4e17c02855d5caccc7b6f084317123`
- Phone Number: `4706915270`
- Status: Configured in .env.local

**Email (Resend)**:
- API Key: Configured in .env.local
- From Email: `noreply@yourdomain.com`
- Status: Configured

### Sample Invitation Request

```bash
curl -X POST http://localhost:3000/api/invitations/send \
  -H "Authorization: Bearer [surgeon_auth_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newpatient@example.com",
    "phone": "+15551234567",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1980-01-15",
    "surgeryType": "Total Knee Replacement",
    "surgeryDate": "2025-08-15",
    "customMessage": "Welcome to your recovery journey!"
  }'
```

### Batch Invitations

```bash
curl -X POST http://localhost:3000/api/invitations/send \
  -H "Authorization: Bearer [surgeon_auth_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "invitations": [
      {
        "email": "patient1@example.com",
        "phone": "+15551234570",
        "firstName": "Patient",
        "lastName": "One",
        "surgeryType": "TKR"
      },
      {
        "email": "patient2@example.com",
        "phone": "+15551234571",
        "firstName": "Patient",
        "lastName": "Two",
        "surgeryType": "THR"
      }
    ]
  }'
```

---

## 🔐 Authentication Methods

### 1. Email/Password Login
Use the credentials above at the respective login pages.

### 2. Magic Link Login
1. Enter email at login page
2. Click "Send Magic Link"
3. Check console logs in development for the link
4. Click the link to login

### 3. API Authentication
For API calls, first obtain an auth token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "surgeon@healthcare-test.com",
    "password": "TestProvider123!"
  }'
```

Then use the token in subsequent requests:
```bash
-H "Authorization: Bearer [your_auth_token]"
```

---

## 🚨 Important Notes

1. **Database Records**: Auth users are created successfully. Profile/patient/provider records may need manual creation if schema errors occur.

2. **Tenant Isolation**: All users belong to tenant ID `11111111-1111-1111-1111-111111111111`

3. **Development Environment**: 
   - Email notifications will log to console
   - SMS notifications require valid Twilio credentials
   - Magic links appear in browser console

4. **Role-Based Access**:
   - Patients: Limited to their own data and chat
   - Providers: Can view/manage multiple patients
   - Surgeons: Full protocol and patient management
   - Nurses: Patient monitoring and chat oversight
   - PTs: Exercise and rehabilitation focus

---

## 🛠️ Troubleshooting

### Login Issues
1. Check browser console for errors
2. Verify email is correctly typed
3. Ensure password is `TestPatient123!` or `TestProvider123!`
4. Check that the dev server is running on port 3000

### Profile/Data Issues
If user can login but profile data is missing:
1. Check Supabase Dashboard → Table Editor → profiles
2. Manually create profile record if needed
3. Ensure profile.id matches auth.users.id

### Invitation Issues
1. Check Twilio/Resend credentials in .env.local
2. Verify phone numbers are in E.164 format (+1XXXXXXXXXX)
3. Check console logs for delivery status

---

## 📞 Support

For issues with test accounts:
1. Check the browser console for detailed errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Restart the development server if needed

---

**Last Updated**: July 24, 2025
**Created By**: Healthcare Platform Setup Script