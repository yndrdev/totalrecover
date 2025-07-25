-- =====================================================
-- SIMPLE DEMO DATA - NO FOREIGN KEY CONFLICTS
-- This works with your existing complex database structure
-- =====================================================

-- =====================================================
-- 1. SIMPLE TENANT DATA
-- =====================================================

-- Only add tenants if they don't exist
INSERT INTO tenants (id, name, subdomain, tenant_type, is_active) 
SELECT '00000000-0000-0000-0000-000000000001', 'Demo Practice', 'demo-practice', 'practice', true
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001');

-- =====================================================
-- 2. SIMPLE EXERCISE DATA
-- =====================================================

-- Add basic exercises if the table exists and is empty
INSERT INTO exercises (id, tenant_id, name, description, instructions, exercise_type, difficulty_level, is_active)
SELECT 
  '40000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Ankle Pumps',
  'Basic circulation exercise for post-surgery recovery',
  'Flex and point your foot up and down slowly',
  'flexibility',
  'beginner',
  true
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercises')
  AND NOT EXISTS (SELECT 1 FROM exercises WHERE id = '40000000-0000-0000-0000-000000000001');

INSERT INTO exercises (id, tenant_id, name, description, instructions, exercise_type, difficulty_level, is_active)
SELECT 
  '40000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Quad Sets',
  'Strengthen thigh muscles',
  'Tighten your thigh muscle and hold for 5 seconds',
  'strength',
  'beginner',
  true
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercises')
  AND NOT EXISTS (SELECT 1 FROM exercises WHERE id = '40000000-0000-0000-0000-000000000002');

-- =====================================================
-- 3. SIMPLE FORM DATA
-- =====================================================

-- Add a basic form if the table exists
INSERT INTO forms (id, tenant_id, name, description, form_type, fields, is_active)
SELECT 
  '50000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Daily Check-in',
  'Simple daily recovery assessment',
  'daily_assessment',
  '{"pain_level": {"type": "scale", "min": 0, "max": 10}}'::jsonb,
  true
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forms')
  AND NOT EXISTS (SELECT 1 FROM forms WHERE id = '50000000-0000-0000-0000-000000000001');

-- =====================================================
-- 4. SIMPLE CONVERSATION DATA (if table exists)
-- =====================================================

-- Add basic conversation if table exists
INSERT INTO conversations (id, tenant_id, title, conversation_type, status)
SELECT 
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Demo Conversation',
  'general',
  'active'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
  AND NOT EXISTS (SELECT 1 FROM conversations WHERE id = '30000000-0000-0000-0000-000000000001');

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Show what we've added
SELECT 'Demo data added successfully!' as message;

-- Show table counts
SELECT 
  'tenants' as table_name, 
  COUNT(*) as row_count 
FROM tenants
UNION ALL
SELECT 'exercises', COUNT(*) FROM exercises WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercises')
UNION ALL
SELECT 'forms', COUNT(*) FROM forms WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forms')
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations');

-- Show what tables you have
SELECT 'Your existing tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

