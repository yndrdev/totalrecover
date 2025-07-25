# Healthcare Platform - Test Environment Setup

## Overview
This guide will help you set up test data in your Supabase database to test all the functionality we've implemented.

## Prerequisites
1. Supabase project set up and running
2. Database migrations applied
3. Row Level Security policies applied

## Quick Test Data Setup

### 1. Create Test Tenant
Run this SQL in Supabase SQL editor:

```sql
-- Create a test practice tenant
INSERT INTO public.tenants (name, tenant_type, subscription_status, subscription_tier, settings)
VALUES (
  'Test Medical Practice',
  'practice',
  'active',
  'professional',
  '{"primary_color": "#1e40af", "logo_url": "https://example.com/logo.png"}'::jsonb
) RETURNING id;

-- Save the returned tenant_id for next steps
```

### 2. Create Test Users
Use Supabase Auth dashboard to create users with these roles:

**Practice Admin:**
- Email: admin@testpractice.com
- Password: Test123!
- Metadata: `{"role": "practice_admin", "tenant_id": "[YOUR_TENANT_ID]"}`

**Surgeon:**
- Email: surgeon@testpractice.com
- Password: Test123!
- Metadata: `{"role": "surgeon", "tenant_id": "[YOUR_TENANT_ID]"}`

**Nurse:**
- Email: nurse@testpractice.com
- Password: Test123!
- Metadata: `{"role": "nurse", "tenant_id": "[YOUR_TENANT_ID]"}`

**Patient:**
- Email: patient@testpractice.com
- Password: Test123!
- Metadata: `{"role": "patient", "tenant_id": "[YOUR_TENANT_ID]"}`

### 3. Create User Records
After creating auth users, create corresponding user records:

```sql
-- Replace user IDs with actual auth user IDs from Supabase Auth
INSERT INTO public.users (id, email, first_name, last_name, full_name, role, tenant_id, is_active)
VALUES 
  ('[ADMIN_USER_ID]', 'admin@testpractice.com', 'Admin', 'User', 'Admin User', 'practice_admin', '[TENANT_ID]', true),
  ('[SURGEON_USER_ID]', 'surgeon@testpractice.com', 'Dr. John', 'Smith', 'Dr. John Smith', 'surgeon', '[TENANT_ID]', true),
  ('[NURSE_USER_ID]', 'nurse@testpractice.com', 'Jane', 'Doe', 'Jane Doe', 'nurse', '[TENANT_ID]', true),
  ('[PATIENT_USER_ID]', 'patient@testpractice.com', 'Test', 'Patient', 'Test Patient', 'patient', '[TENANT_ID]', true);
```

### 4. Create Test Patient Record
```sql
INSERT INTO public.patients (
  user_id, tenant_id, mrn, first_name, last_name, 
  date_of_birth, phone, email, status, surgery_date, surgery_type
)
VALUES (
  '[PATIENT_USER_ID]',
  '[TENANT_ID]',
  'MRN-TEST-001',
  'Test',
  'Patient',
  '1980-01-01',
  '555-0123',
  'patient@testpractice.com',
  'active',
  CURRENT_DATE + INTERVAL '7 days',
  'TKR'
) RETURNING id;
```

### 5. Create Test Protocol
```sql
INSERT INTO public.protocols (
  title, description, surgery_type, created_by, tenant_id, 
  is_template, is_public, status, tasks
)
VALUES (
  'Test TKR Recovery Protocol',
  'A test protocol for Total Knee Replacement recovery',
  'TKR',
  '[SURGEON_USER_ID]',
  '[TENANT_ID]',
  true,
  false,
  'active',
  '[
    {
      "id": "task-1",
      "title": "Daily Knee Exercises",
      "description": "Perform prescribed knee exercises",
      "task_type": "exercise",
      "phase": "Week 1-2",
      "day_offset": 1,
      "frequency": {"repeat": true, "type": "daily"}
    },
    {
      "id": "task-2",
      "title": "Pain Assessment",
      "description": "Complete daily pain assessment form",
      "task_type": "form",
      "phase": "Week 1-2",
      "day_offset": 1,
      "frequency": {"repeat": true, "type": "daily"}
    }
  ]'::jsonb
) RETURNING id;
```

### 6. Create Test Content

```sql
-- Test Form
INSERT INTO public.content_forms (
  title, description, category, fields, tenant_id, created_by, is_active
)
VALUES (
  'Pain Assessment Form',
  'Daily pain level tracking',
  'assessment',
  '[
    {"name": "pain_level", "type": "slider", "label": "Pain Level (0-10)", "required": true},
    {"name": "location", "type": "text", "label": "Pain Location", "required": true},
    {"name": "notes", "type": "textarea", "label": "Additional Notes", "required": false}
  ]'::jsonb,
  '[TENANT_ID]',
  '[SURGEON_USER_ID]',
  true
);

-- Test Video
INSERT INTO public.content_videos (
  title, description, category, url, duration, tenant_id, created_by
)
VALUES (
  'Knee Exercise Tutorial',
  'How to perform daily knee exercises',
  'exercise',
  'https://youtube.com/watch?v=example',
  10,
  '[TENANT_ID]',
  '[SURGEON_USER_ID]'
);

-- Test Exercise
INSERT INTO public.content_exercises (
  title, description, category, difficulty, instructions, 
  sets, reps, equipment, tenant_id, created_by
)
VALUES (
  'Knee Flexion',
  'Basic knee flexion exercise',
  'flexibility',
  'beginner',
  '["Lie on your back", "Slowly bend your knee", "Hold for 5 seconds", "Return to starting position"]'::jsonb,
  3,
  10,
  'None',
  '[TENANT_ID]',
  '[SURGEON_USER_ID]'
);
```

## Testing Each Feature

### 1. Provider Login
- Navigate to `/login`
- Login as surgeon@testpractice.com
- You should see the provider dashboard

### 2. Patient Management
- Navigate to `/provider/patients`
- Create a new patient
- Edit patient details
- View patient profile

### 3. Protocol Builder
- Navigate to `/provider/protocols/builder`
- Create a new protocol
- Add tasks with different types
- Save the protocol

### 4. Content Management
- Navigate to `/provider/content`
- Create forms, videos, and exercises
- Edit existing content
- Search and filter content

### 5. Practice Admin
- Login as admin@testpractice.com
- Navigate to `/practice/staff`
- Add new staff members
- Navigate to `/practice/settings`
- Update practice settings

### 6. Patient Protocol Assignment
- As a provider, navigate to a patient detail page
- Click "Assign Protocol"
- Select a protocol and assign it
- Verify tasks are generated

### 7. SaaS Admin (if applicable)
- Create a SaaS admin user with role 'saas_admin'
- Navigate to `/saasadmin`
- View tenant management
- Manage global protocols

## Verification Checklist

- [ ] All user roles can login successfully
- [ ] Tenant isolation is working (users only see their tenant's data)
- [ ] CRUD operations work for all entities
- [ ] Protocol assignment generates tasks correctly
- [ ] Content library items are accessible
- [ ] Practice settings can be updated
- [ ] Security policies prevent unauthorized access

## Troubleshooting

### Common Issues:

1. **Login fails**: Check user metadata in Supabase Auth
2. **No data visible**: Verify tenant_id matches across records
3. **Permission denied**: Check RLS policies are applied
4. **API errors**: Check browser console and Supabase logs

### Debug SQL Queries:

```sql
-- Check tenant data
SELECT * FROM tenants;

-- Check users and their roles
SELECT id, email, role, tenant_id FROM users;

-- Check patient-protocol assignments
SELECT pa.*, p.title as protocol_title 
FROM protocol_assignments pa
JOIN protocols p ON pa.protocol_id = p.id;

-- Check generated tasks
SELECT * FROM patient_tasks 
WHERE patient_id = '[PATIENT_ID]'
ORDER BY scheduled_date;
```

## Next Steps

1. Test each feature thoroughly
2. Verify multi-tenant isolation
3. Test error handling and edge cases
4. Performance test with larger datasets
5. Security audit of all endpoints