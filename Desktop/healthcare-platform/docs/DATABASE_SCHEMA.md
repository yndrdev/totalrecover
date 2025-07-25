# Database Schema - COMPREHENSIVE & FINAL

## CRITICAL: DO NOT SIMPLIFY OR MODIFY
The database schema is comprehensive and production-ready. 
DO NOT create simplified versions or modify existing structure.

## Tables (Use As-Is)

### 1. tenants
- **Purpose**: Multi-tenant hierarchy (super admin → practice → clinic)
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `name` (TEXT) - Organization name
  - `subdomain` (TEXT) - Unique subdomain
  - `tenant_type` (ENUM) - 'super_admin' | 'practice' | 'clinic'
  - `parent_tenant_id` (UUID) - References parent tenant
  - `settings` (JSONB) - Configuration options
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 2. profiles
- **Purpose**: User management with multi-tenant access
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `tenant_id` (UUID) - Primary tenant association
  - `user_id` (UUID) - References auth.users.id
  - `email` (TEXT)
  - `first_name` (TEXT)
  - `last_name` (TEXT)
  - `role` (ENUM) - 'patient' | 'provider' | 'admin' | 'nurse'
  - `accessible_tenants` (UUID[]) - Array of accessible tenant IDs
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 3. patients
- **Purpose**: Patient-specific recovery data
- **Key Fields**:
  - `id` (UUID) - PRIMARY KEY = auth.users.id (DIRECT LINKING)
  - `tenant_id` (UUID) - References tenants.id
  - `first_name` (TEXT)
  - `last_name` (TEXT)
  - `email` (TEXT)
  - `phone` (TEXT)
  - `date_of_birth` (DATE)
  - `surgery_date` (DATE)
  - `surgery_type` (TEXT) - e.g., 'TKA', 'THA', 'TSA'
  - `medical_record_number` (TEXT)
  - `insurance_info` (JSONB)
  - `emergency_contact` (JSONB)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 4. conversations
- **Purpose**: Chat session tracking with analytics
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `patient_id` (UUID) - References patients.id
  - `tenant_id` (UUID) - References tenants.id
  - `status` (ENUM) - 'active' | 'completed' | 'nurse_intervention' | 'archived'
  - `total_messages` (INTEGER) - Message count
  - `last_activity_at` (TIMESTAMPTZ)
  - `conversation_metadata` (JSONB) - Analytics data
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

### 5. messages
- **Purpose**: Real-time messaging with completion tracking
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `conversation_id` (UUID) - References conversations.id
  - `sender_type` (ENUM) - 'patient' | 'ai' | 'nurse' | 'system'
  - `content` (TEXT) - Message content
  - `metadata` (JSONB) - Additional data (voice, attachments, etc.)
  - `completion_status` (ENUM) - 'pending' | 'completed' | 'failed'
  - `created_at` (TIMESTAMPTZ)

### 6. conversation_activities
- **Purpose**: Track forms, videos, exercises in chat context
- **Key Fields**:
  - `id` (UUID) - Primary key
  - `conversation_id` (UUID) - References conversations.id
  - `activity_type` (ENUM) - 'form_completed' | 'video_watched' | 'exercise_logged' | 'medication_taken' | 'appointment_scheduled'
  - `activity_data` (JSONB) - Activity-specific data
  - `created_at` (TIMESTAMPTZ)

## Patient ID Pattern (CRITICAL)
```
patients.id = auth.users.id (direct UUID linking)
```
- Application code uses `user.id` directly as `patient_id`
- NO separate `user_id` field in patients table
- 1:1 relationship between auth users and patient records
- RLS policies use `auth.uid() = id`

## Row Level Security (RLS)
- All tables have RLS enabled
- Patients see only their own data
- Providers see patients in their accessible_tenants
- Multi-tenant isolation enforced at database level

## DO NOT:
- Create simplified versions of these tables
- Remove fields to make it "simpler"
- Change the patient ID linking pattern
- Modify existing table structures
- Create workarounds instead of using existing schema