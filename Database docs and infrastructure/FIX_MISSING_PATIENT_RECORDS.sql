-- QUICK FIX: Create missing patient records for existing users
-- Run this if you have users with profiles but no patient records

-- Find users with profiles but no patient records and create them
INSERT INTO patients (user_id, tenant_id, first_name, last_name, status, surgery_type, surgery_date)
SELECT 
  p.user_id,
  p.tenant_id,
  COALESCE(p.first_name, 'Unknown'),
  COALESCE(p.last_name, 'User'),
  'active',
  'TKA',
  CURRENT_DATE - INTERVAL '7 days'
FROM profiles p
LEFT JOIN patients pat ON p.user_id = pat.user_id
WHERE p.role = 'patient' 
  AND pat.id IS NULL;

-- Verify the fix
SELECT 
  'SUCCESS: Created missing patient records' as message,
  COUNT(*) as patients_created
FROM patients 
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Show all patients
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.status,
  p.surgery_type,
  p.surgery_date,
  prof.email
FROM patients p
JOIN profiles prof ON p.user_id = prof.user_id
ORDER BY p.created_at DESC;