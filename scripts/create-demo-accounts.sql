-- TJV Recovery Platform Demo Account Setup
-- Creates realistic test data for platform testing
-- Run this in Supabase SQL Editor

-- First, let's create a demo tenant
INSERT INTO tenants (id, name, created_at, updated_at) VALUES
('demo-tenant-001', 'TJV Demo Practice', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create demo user profiles (these will be linked to Supabase auth users)
INSERT INTO profiles (
  id, 
  tenant_id, 
  email, 
  first_name, 
  last_name, 
  full_name, 
  role, 
  is_active, 
  email_verified,
  created_at, 
  updated_at
) VALUES
-- Patient: Sarah Johnson (matches screenshot)
('patient-sarah-001', 'demo-tenant-001', 'sarah.johnson@tjvdemo.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'patient', true, true, NOW(), NOW()),

-- Provider: Dr. Smith
('provider-drsmith-001', 'demo-tenant-001', 'dr.smith@tjvdemo.com', 'Michael', 'Smith', 'Dr. Michael Smith', 'provider', true, true, NOW(), NOW()),

-- Care Team Member: Mike Chen, PT  
('provider-mikechen-001', 'demo-tenant-001', 'mike.chen@tjvdemo.com', 'Mike', 'Chen', 'Mike Chen, PT', 'provider', true, true, NOW(), NOW()),

-- Admin Account
('admin-demo-001', 'demo-tenant-001', 'admin@tjvdemo.com', 'Admin', 'User', 'Admin User', 'admin', true, true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

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
  created_at,
  updated_at
) VALUES
('patient-sarah-rec-001', 'patient-sarah-001', 'demo-tenant-001', 'TKA', (CURRENT_DATE - INTERVAL '4 days'), 'Right', 'Dr. Michael Smith', '5551234567', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  surgery_date = (CURRENT_DATE - INTERVAL '4 days'),
  updated_at = NOW();

-- Create provider records
INSERT INTO providers (
  id,
  profile_id,
  tenant_id,
  department,
  is_active,
  created_at,
  updated_at
) VALUES
('prov-drsmith-001', 'provider-drsmith-001', 'demo-tenant-001', 'Orthopedic Surgery', true, NOW(), NOW()),
('prov-mikechen-001', 'provider-mikechen-001', 'demo-tenant-001', 'Physical Therapy', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create a recovery protocol for TKA
INSERT INTO recovery_protocols (
  id,
  tenant_id,
  name,
  surgery_type,
  timeline_data,
  is_active,
  created_at,
  updated_at
) VALUES
('protocol-tka-standard', 'demo-tenant-001', 'Standard TKA Recovery Protocol', 'TKA', '{"phases": ["pre_surgery", "immediate_post_op", "early_recovery", "active_recovery", "maintenance"]}', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create tasks for different recovery days
INSERT INTO tasks (
  id,
  tenant_id,
  protocol_id,
  title,
  description,
  task_type,
  recovery_day,
  created_at,
  updated_at
) VALUES
-- Day 1 tasks
('task-day1-1', 'demo-tenant-001', 'protocol-tka-standard', 'Take morning medication', 'Take prescribed pain medication as directed', 'medication', 1, NOW(), NOW()),
('task-day1-2', 'demo-tenant-001', 'protocol-tka-standard', 'Ankle pumps exercise', 'Perform 10 ankle pumps every hour while awake', 'exercise', 1, NOW(), NOW()),

-- Day 2 tasks  
('task-day2-1', 'demo-tenant-001', 'protocol-tka-standard', 'Take morning medication', 'Take prescribed pain medication as directed', 'medication', 2, NOW(), NOW()),
('task-day2-2', 'demo-tenant-001', 'protocol-tka-standard', 'Ankle pumps exercise', 'Perform 10 ankle pumps every hour while awake', 'exercise', 2, NOW(), NOW()),
('task-day2-3', 'demo-tenant-001', 'protocol-tka-standard', 'Walk with assistance', 'Walk 10 feet with walker or assistance', 'exercise', 2, NOW(), NOW()),

-- Day 3 tasks
('task-day3-1', 'demo-tenant-001', 'protocol-tka-standard', 'Take morning medication', 'Take prescribed pain medication as directed', 'medication', 3, NOW(), NOW()),
('task-day3-2', 'demo-tenant-001', 'protocol-tka-standard', 'Quad sets exercise', 'Perform 10 quad sets, 3 times daily', 'exercise', 3, NOW(), NOW()),
('task-day3-3', 'demo-tenant-001', 'protocol-tka-standard', 'Ice therapy', 'Apply ice for 15-20 minutes, 4 times daily', 'treatment', 3, NOW(), NOW()),

-- Day 4 tasks (current day)
('task-day4-1', 'demo-tenant-001', 'protocol-tka-standard', 'Take morning medication', 'Take prescribed pain medication as directed', 'medication', 4, NOW(), NOW()),
('task-day4-2', 'demo-tenant-001', 'protocol-tka-standard', 'Knee bending exercise', 'Gently bend knee to comfortable range', 'exercise', 4, NOW(), NOW()),
('task-day4-3', 'demo-tenant-001', 'protocol-tka-standard', 'Pain assessment', 'Complete pain scale assessment', 'assessment', 4, NOW(), NOW()),
('task-day4-4', 'demo-tenant-001', 'protocol-tka-standard', 'Walking practice', 'Walk 25 feet with walker', 'exercise', 4, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create patient-specific task assignments
INSERT INTO patient_tasks (
  id,
  patient_id,
  task_id,
  status,
  scheduled_date,
  created_at,
  updated_at
) VALUES
-- Day 1 tasks (completed)
('pt-sarah-day1-1', 'patient-sarah-rec-001', 'task-day1-1', 'completed', (CURRENT_DATE - INTERVAL '3 days'), NOW(), NOW()),
('pt-sarah-day1-2', 'patient-sarah-rec-001', 'task-day1-2', 'completed', (CURRENT_DATE - INTERVAL '3 days'), NOW(), NOW()),

-- Day 2 tasks (1 missed for "DAYS WITH MISSED TASKS" section)
('pt-sarah-day2-1', 'patient-sarah-rec-001', 'task-day2-1', 'completed', (CURRENT_DATE - INTERVAL '2 days'), NOW(), NOW()),
('pt-sarah-day2-2', 'patient-sarah-rec-001', 'task-day2-2', 'missed', (CURRENT_DATE - INTERVAL '2 days'), NOW(), NOW()),
('pt-sarah-day2-3', 'patient-sarah-rec-001', 'task-day2-3', 'completed', (CURRENT_DATE - INTERVAL '2 days'), NOW(), NOW()),

-- Day 3 tasks (1 missed for "DAYS WITH MISSED TASKS" section)  
('pt-sarah-day3-1', 'patient-sarah-rec-001', 'task-day3-1', 'completed', (CURRENT_DATE - INTERVAL '1 days'), NOW(), NOW()),
('pt-sarah-day3-2', 'patient-sarah-rec-001', 'task-day3-2', 'missed', (CURRENT_DATE - INTERVAL '1 days'), NOW(), NOW()),
('pt-sarah-day3-3', 'patient-sarah-rec-001', 'task-day3-3', 'completed', (CURRENT_DATE - INTERVAL '1 days'), NOW(), NOW()),

-- Day 4 tasks (current day - pending)
('pt-sarah-day4-1', 'patient-sarah-rec-001', 'task-day4-1', 'pending', CURRENT_DATE, NOW(), NOW()),
('pt-sarah-day4-2', 'patient-sarah-rec-001', 'task-day4-2', 'pending', CURRENT_DATE, NOW(), NOW()),
('pt-sarah-day4-3', 'patient-sarah-rec-001', 'task-day4-3', 'pending', CURRENT_DATE, NOW(), NOW()),
('pt-sarah-day4-4', 'patient-sarah-rec-001', 'task-day4-4', 'pending', CURRENT_DATE, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  scheduled_date = EXCLUDED.scheduled_date,
  updated_at = NOW();

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
  'Demo accounts created successfully!' as status,
  'Patient: sarah.johnson@tjvdemo.com (Password: DemoPass123!)' as patient_login,
  'Provider: dr.smith@tjvdemo.com (Password: DemoPass123!)' as provider_login,
  'Surgery Date: ' || (CURRENT_DATE - INTERVAL '4 days')::text as surgery_info,
  'Current Recovery Day: 4' as recovery_day,
  'Missed Tasks: Day 2 & Day 3 (for testing)' as missed_tasks_info;