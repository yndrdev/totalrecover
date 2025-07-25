-- =====================================================
-- FIX SCHEMA AND CREATE DEMO DATA
-- Run this in Supabase SQL Editor to fix schema issues and create demo data
-- =====================================================

-- First, add missing columns to existing tables
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subdomain TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Ensure profiles has proper constraints
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Fix tenants table with required schema
INSERT INTO tenants (id, name, subdomain, tenant_type, created_at, updated_at) VALUES
('demo-tenant-001', 'TJV Demo Practice', 'tjv-demo', 'practice', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  subdomain = EXCLUDED.subdomain,
  tenant_type = EXCLUDED.tenant_type,
  updated_at = NOW();

-- Create demo user profiles with correct schema
INSERT INTO profiles (
  id, 
  user_id,
  tenant_id, 
  email, 
  first_name, 
  last_name, 
  full_name,
  role, 
  created_at, 
  updated_at
) VALUES
-- Patient: Sarah Johnson (matches screenshot)
('patient-sarah-001', 'patient-sarah-001', 'demo-tenant-001', 'sarah.johnson@tjvdemo.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'patient', NOW(), NOW()),

-- Provider: Dr. Smith
('provider-drsmith-001', 'provider-drsmith-001', 'demo-tenant-001', 'dr.smith@tjvdemo.com', 'Michael', 'Smith', 'Dr. Michael Smith', 'provider', NOW(), NOW()),

-- Care Team Member: Mike Chen, PT  
('provider-mikechen-001', 'provider-mikechen-001', 'demo-tenant-001', 'mike.chen@tjvdemo.com', 'Mike', 'Chen', 'Mike Chen, PT', 'provider', NOW(), NOW()),

-- Admin Account
('admin-demo-001', 'admin-demo-001', 'demo-tenant-001', 'admin@tjvdemo.com', 'Admin', 'User', 'Admin User', 'admin', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Check if patients table exists and has required columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
    -- Create patients table if it doesn't exist
    CREATE TABLE patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT REFERENCES profiles(user_id),
      tenant_id UUID REFERENCES tenants(id),
      surgery_type TEXT,
      surgery_date DATE,
      surgery_side TEXT,
      surgeon_name TEXT,
      phone_number TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id TEXT;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS tenant_id UUID;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_type TEXT;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_date DATE;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgery_side TEXT;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS surgeon_name TEXT;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone_number TEXT;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create patient record for Sarah Johnson 
-- Surgery date 4 days ago to match screenshot "Day 4"
INSERT INTO patients (
  id,
  user_id, 
  tenant_id,
  surgery_type,
  surgery_date,
  surgery_side,
  surgeon_name,
  phone_number,
  status,
  created_at,
  updated_at
) VALUES
('patient-sarah-rec-001', 'patient-sarah-001', 'demo-tenant-001', 'TKA', (CURRENT_DATE - INTERVAL '4 days'), 'Right', 'Dr. Michael Smith', '5551234567', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  surgery_date = (CURRENT_DATE - INTERVAL '4 days'),
  updated_at = NOW();

-- Check if conversations table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
    -- Create conversations table if it doesn't exist
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES patients(id),
      tenant_id UUID REFERENCES tenants(id),
      title TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS patient_id UUID;
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tenant_id UUID;
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Check if messages table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    -- Create messages table if it doesn't exist
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id),
      tenant_id UUID REFERENCES tenants(id),
      patient_id UUID,
      sender_id TEXT,
      sender_type TEXT,
      content TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS tenant_id UUID;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS patient_id UUID;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_type TEXT;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS content TEXT;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create conversation for Sarah Johnson
INSERT INTO conversations (
  id,
  patient_id,
  tenant_id,
  title,
  status,
  created_at,
  updated_at
) VALUES
('conv-sarah-001', 'patient-sarah-rec-001', 'demo-tenant-001', 'Recovery Chat - Sarah Johnson', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create sample messages for conversation
INSERT INTO messages (
  id,
  conversation_id,
  tenant_id,
  patient_id,
  sender_type,
  content,
  created_at,
  updated_at,
  metadata
) VALUES
-- AI greeting message (matches screenshot content)
('msg-001', 'conv-sarah-001', 'demo-tenant-001', 'patient-sarah-rec-001', 'ai', 'Good morning! I''m your TJV Recovery Assistant. How are you feeling today on Day 4 of your recovery?', (NOW() - INTERVAL '2 hours'), NOW(), '{}'),

-- Sample patient response 
('msg-002', 'conv-sarah-001', 'demo-tenant-001', 'patient-sarah-rec-001', 'patient', 'Good morning! I''m feeling better today. The pain is more manageable.', (NOW() - INTERVAL '1 hour 50 minutes'), NOW(), '{}'),

-- AI response with task reminder
('msg-003', 'conv-sarah-001', 'demo-tenant-001', 'patient-sarah-rec-001', 'ai', 'That''s wonderful to hear! It sounds like you''re making great progress. Don''t forget to complete your morning medication and knee bending exercises. How is your mobility feeling today?', (NOW() - INTERVAL '1 hour 45 minutes'), NOW(), '{}')

ON CONFLICT (id) DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Display success message
SELECT 
  'Schema fixed and demo accounts created successfully!' as status,
  'Patient: sarah.johnson@tjvdemo.com (Password: DemoPass123!)' as patient_login,
  'Provider: dr.smith@tjvdemo.com (Password: DemoPass123!)' as provider_login,
  'Surgery Date: ' || (CURRENT_DATE - INTERVAL '4 days')::text as surgery_info,
  'Current Recovery Day: 4' as recovery_day;