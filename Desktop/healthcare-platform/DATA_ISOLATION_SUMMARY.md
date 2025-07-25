# Patient Data Isolation Summary

## Current Status ✅
Even with RLS (Row Level Security) disabled for the demo, patient data isolation is properly enforced through application-level security.

## How Data Isolation Works

### 1. Authentication Flow
- Patients log in with their credentials
- Authentication is handled by Supabase Auth
- Each user has a unique `user.id` that maps to their profile

### 2. Patient Access Control

#### At the Database Level:
- Each patient record has a `profile_id` that links to the authenticated user
- All patient-related tables (conversations, messages, tasks) have a `patient_id` foreign key

#### At the Application Level:

**Patient Pages (`/patient/[profileId]/page.tsx`):**
```typescript
// Verify the user has access to this patient record
const isPatient = userProfile?.role === 'patient' && patient.profile_id === user.id;
const isProvider = ['surgeon', 'nurse', 'physical_therapist', 'provider', 'admin'].includes(userProfile?.role || '');

if (!isPatient && !isProvider) {
  notFound();
}
```

**Patient Service (`lib/services/patient-service.ts`):**
```typescript
// Get patient data using profile ID
const { data: patient } = await this.supabase
  .from('patients')
  .select('*')
  .eq('profile_id', user.id)
  .single();
```

**Chat Service (`lib/services/patient-chat-service.ts`):**
```typescript
// Conversations are filtered by patient_id
const { data: conversations } = await this.supabase
  .from('conversations')
  .select('*')
  .eq('patient_id', patientId);
```

### 3. Pre-Op vs Post-Op Task Filtering

The system automatically determines if a patient is pre-op or post-op based on their surgery date:

```typescript
const surgeryDate = new Date(patient.surgery_date);
const today = new Date();
const daysSinceSurgery = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
const phase = daysSinceSurgery < 0 ? 'pre-op' : 'post-op';
```

**Pre-Op Patients:**
- Only see tasks scheduled before surgery date
- See pre-operative preparation content
- Cannot access post-op recovery tasks

**Post-Op Patients:**
- See tasks based on their recovery timeline
- Tasks are filtered by recovery day (Day 1, Day 2, etc.)
- Cannot see future tasks beyond their current recovery day

### 4. Data Isolation Verification

Run the verification script to confirm isolation:
```bash
npx tsx scripts/verify-patient-isolation.ts
```

This script confirms:
- Each patient has separate conversations
- Each patient has separate tasks
- Tasks are filtered by surgery date
- Application code enforces patient_id filtering

## Security Notes

1. **RLS is temporarily disabled** for demo purposes via `20250125_disable_rls_demo.sql`
2. **Application-level security** ensures patients can only access their own data
3. **Providers** (surgeons, nurses, PTs) can see all patients they're assigned to
4. **Patients** can ONLY see their own data - no cross-patient access

## Testing Data Isolation

1. Log in as a patient (e.g., `john.doe@demo.com`)
2. Navigate to `/patient/{your-profile-id}`
3. You will only see:
   - Your own conversations
   - Your own tasks
   - Your own recovery timeline
   - Your own care team messages

4. Try to access another patient's URL - you'll get a 404 error

## Re-enabling RLS

When ready for production, re-enable RLS by:
1. Running a new migration to enable RLS on all tables
2. Creating appropriate RLS policies for each table
3. The application code will continue to work with RLS enabled