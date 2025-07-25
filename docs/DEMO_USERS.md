# Demo Users - EXACT SPECIFICATIONS

## Authentication Users (Supabase Auth)

### 1. Patient User
- **Email**: sarah.johnson@example.com
- **Password**: testpass123
- **Role**: Patient
- **First Name**: Sarah
- **Last Name**: Johnson
- **Patient Details**:
  - Surgery Type: TKA (Total Knee Arthroplasty)
  - Surgery Date: 2025-02-15 (5 days post-op)
  - Age: 50 years old
  - Phone: +1-555-0101

### 2. Provider User
- **Email**: michael.chen@example.com
- **Password**: testpass123
- **Role**: Provider (Orthopedic Surgeon)
- **First Name**: Michael
- **Last Name**: Chen
- **Provider Details**:
  - Specialty: Orthopedic Surgery
  - Years of Experience: 15
  - Phone: +1-555-0102

### 3. Admin User
- **Email**: emily.rodriguez@example.com
- **Password**: testpass123
- **Role**: Admin (Clinic Administrator)
- **First Name**: Emily
- **Last Name**: Rodriguez
- **Admin Details**:
  - Access Level: Clinic Admin
  - Phone: +1-555-0103

## Patient Records Requirements
### Direct ID Linking Pattern
```
patients.id = auth.users.id
```
- Use auth.users.id directly as patients.id
- NO separate user_id field
- 1:1 relationship enforced
- Application code uses user.id as patient_id

### Required Patient Fields
- `id`: UUID (same as auth.users.id)
- `tenant_id`: UUID (use default tenant)
- `first_name`: TEXT
- `last_name`: TEXT
- `email`: TEXT
- `surgery_date`: DATE
- `surgery_type`: TEXT
- Additional fields as per schema

## Demo Conversation Data
### Sarah Johnson's Chat
- Initial AI greeting: "Hello Sarah! I see you're 5 days post-op from your knee replacement. How is your pain level today on a scale of 0-10?"
- Focus on:
  - Pain management
  - Physical therapy exercises
  - Medication reminders
  - Activity tracking

## Testing Scenarios
### Patient Login Flow
1. Login as sarah.johnson@example.com
2. Redirect to patient chat
3. AI speaks first with personalized greeting
4. Patient can respond via text or voice
5. Real-time message updates

### Provider Access
1. Login as michael.chen@example.com
2. Access provider dashboard
3. View patient list
4. Monitor conversations
5. Intervene when needed

### Admin Functions
1. Login as emily.rodriguez@example.com
2. Access admin dashboard
3. View clinic statistics
4. Manage users
5. Configure settings

## Multi-Tenant Structure
### Default Tenant
- ID: 00000000-0000-0000-0000-000000000000
- Name: Default Healthcare Platform
- Type: clinic
- All demo users belong to this tenant

## DO NOT:
- Change demo user emails
- Modify password requirements
- Create additional test users without documentation
- Use different ID patterns
- Skip user creation steps