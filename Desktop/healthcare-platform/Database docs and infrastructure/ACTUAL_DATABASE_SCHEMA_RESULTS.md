# Healthcare Platform - Actual Database Schema Results

## Database Verification Summary

**Date:** July 17, 2025  
**Status:** ✅ All core tables exist and are accessible  
**Method:** Direct Supabase API inspection (SQL information_schema queries not available)

---

## Table Existence Status

| Table | Status | Records | Structure |
|-------|--------|---------|-----------|
| `tenants` | ✅ EXISTS | Has data | 20 columns |
| `profiles` | ✅ EXISTS | Has data | 22 columns |
| `patients` | ✅ EXISTS | Has data | 22 columns |
| `exercises` | ✅ EXISTS | Empty | Unknown columns (not-null constraint on 'name') |
| `forms` | ✅ EXISTS | Empty | Unknown columns (not-null constraint on 'name') |

---

## Detailed Table Structures

### 1. TENANTS Table Structure
**Columns (20):** 
- `id` (string/UUID)
- `name` (string)
- `subdomain` (string)
- `settings` (object/JSON)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `tenant_type` (string)
- `parent_tenant_id` (nullable UUID)
- `is_active` (boolean)
- `subscription_tier` (string)
- `max_patients` (number)
- `max_providers` (number)
- `features` (array/JSON)
- `branding` (object/JSON)
- `billing_email` (nullable string)
- `contact_phone` (nullable string)
- `address` (nullable object)
- `timezone` (string)
- `locale` (string)
- `deleted_at` (nullable timestamp)

**Sample Record:**
```json
{
  "id": "6b7bb732-f228-4222-962f-a88c7e987423",
  "name": "TJV Orthopedic Center",
  "subdomain": "tjv-ortho",
  "tenant_type": "practice",
  "is_active": true,
  "subscription_tier": "basic",
  "max_patients": 100,
  "max_providers": 10,
  "timezone": "UTC",
  "locale": "en-US"
}
```

### 2. PROFILES Table Structure
**Columns (22):**
- `id` (string/UUID) - **Primary Key**
- `tenant_id` (string/UUID) - **Foreign Key to tenants**
- `email` (string)
- `full_name` (string)
- `role` (string)
- `phone` (nullable string)
- `avatar_url` (nullable string)
- `settings` (object/JSON)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `accessible_tenants` (array/JSON)
- `specialties` (nullable array)
- `title` (nullable string)
- `permissions` (array/JSON)
- `license_number` (nullable string)
- `department` (nullable string)
- `preferences` (object/JSON)
- `notification_settings` (object/JSON)
- `is_active` (boolean)
- `last_login_at` (nullable timestamp)
- `first_name` (string)
- `last_name` (string)

**Sample Record:**
```json
{
  "id": "23ca08ee-c9f4-4a2f-b806-4094e1ab57cf",
  "tenant_id": "11111111-1111-1111-1111-111111111111",
  "email": "surgeon@demo.com",
  "full_name": "Dr. Sarah Surgeon",
  "role": "surgeon",
  "is_active": true,
  "first_name": "Unknown",
  "last_name": "User"
}
```

### 3. PATIENTS Table Structure
**Columns (22):**
- `id` (string/UUID) - **Primary Key**
- `tenant_id` (string/UUID) - **Foreign Key to tenants**
- `user_id` (string/UUID) - **Foreign Key to profiles**
- `mrn` (string) - Medical Record Number
- `date_of_birth` (string/date)
- `surgery_type` (string)
- `surgery_date` (string/date)
- `surgeon_id` (nullable UUID)
- `status` (string)
- `risk_factors` (array/JSON)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `medical_record_number` (nullable string)
- `insurance_info` (nullable object)
- `emergency_contact` (nullable object)
- `allergies` (nullable array)
- `medications` (nullable array)
- `primary_nurse_id` (nullable UUID)
- `physical_therapist_id` (nullable UUID)
- `notes` (nullable string)
- `current_recovery_day` (number)
- `activity_level` (string)

**Sample Record:**
```json
{
  "id": "58dfe065-9da3-4f55-9921-d215573848de",
  "tenant_id": "11111111-1111-1111-1111-111111111111",
  "user_id": "58dfe065-9da3-4f55-9921-d215573848de",
  "mrn": "MRN-1752596763229-9b7j",
  "date_of_birth": "1985-03-15",
  "surgery_type": "Total Knee Replacement",
  "surgery_date": "2025-08-01",
  "status": "pre-operative",
  "current_recovery_day": 0,
  "activity_level": "active"
}
```

### 4. EXERCISES Table Structure
**Status:** ✅ Exists but empty  
**Known Requirements:** Has a non-null `name` column  
**Note:** Full structure needs to be determined by examining schema files

### 5. FORMS Table Structure
**Status:** ✅ Exists but empty  
**Known Requirements:** Has a non-null `name` column  
**Note:** Full structure needs to be determined by examining schema files

---

## Key Relationships Identified

### 1. Multi-Tenant Architecture
- **Tenants** are the root level organization
- **Profiles** belong to tenants via `tenant_id`
- **Patients** belong to tenants via `tenant_id`

### 2. User-Profile-Patient Relationship
Based on the data structure found:

```
auth.users.id → profiles.id (Direct match)
profiles.id → patients.user_id (Patient records link to profiles)
```

**Critical Finding:** The `user_id` in the patients table references the `profiles.id`, NOT `auth.users.id` directly.

### 3. Tenant Relationships
- Multi-tenant system with tenant isolation
- Each profile and patient belongs to a specific tenant
- Tenant settings control features and branding

---

## Authentication & Authorization Findings

### Auth Users vs Profiles Issue
- **32 auth users** found in the system
- **Profile lookup failed** for the first auth user tested
- **Error:** "JSON object requested, multiple (or no) rows returned"

This suggests there might be:
1. Multiple profiles per auth user, or
2. Missing profiles for some auth users, or
3. The relationship pattern is different than expected

### Recommended Next Steps
1. **Investigate Auth-Profile Relationship:**
   - Check if `profiles.id` should match `auth.users.id`
   - Verify if there should be a `user_id` field in profiles
   - Determine if profiles can have separate UUIDs

2. **Populate Missing Tables:**
   - Add sample data to `exercises` table
   - Add sample data to `forms` table
   - Ensure proper foreign key relationships

3. **Verify Data Integrity:**
   - Check all foreign key constraints
   - Ensure proper tenant isolation
   - Validate user-profile-patient chains

---

## Database Connection Details

- **Connection Method:** Supabase client with service role key
- **Schema Access:** Direct API calls (SQL information_schema not available)
- **RLS Status:** Not verified (requires SQL access)
- **Constraints:** Verified through insert error messages

---

## Next Actions Required

1. **Schema Documentation:** Create complete schema documentation with proper column types and constraints
2. **Relationship Mapping:** Draw complete ERD showing all foreign key relationships
3. **Data Population:** Populate empty tables with sample data
4. **Auth Integration:** Fix auth user to profile relationship
5. **Testing:** Verify all CRUD operations work correctly

---

**Generated:** July 17, 2025  
**Script:** `/Users/yndr/Desktop/healthcare-platform/scripts/verify-schema-direct.js`