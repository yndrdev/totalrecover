-- =====================================================
-- FIX EXISTING SCHEMA - ADD MISSING COLUMNS
-- Run this to update your existing tables to match our demo data
-- =====================================================

-- Add missing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tenant_type TEXT DEFAULT 'practice' CHECK (tenant_type IN ('super_admin', 'practice', 'clinic'));

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id);

-- Add missing columns to profiles table if needed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accessible_tenants UUID[] DEFAULT ARRAY[]::UUID[];

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add missing columns to patients table if needed
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS medical_record_number TEXT;

-- Update existing tenants to have proper tenant_type
UPDATE tenants SET tenant_type = 'practice' WHERE tenant_type IS NULL;

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('tenants', 'profiles', 'patients')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

