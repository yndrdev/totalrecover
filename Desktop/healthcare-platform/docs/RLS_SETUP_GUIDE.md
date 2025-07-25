# Row Level Security (RLS) Setup Guide

## Overview
This guide provides the SQL commands needed to properly configure Row Level Security (RLS) for the TJV Recovery healthcare platform. These commands must be run directly in the Supabase SQL Editor.

## Current Issue
The application is experiencing RLS policy violations when trying to create messages. The error:
```
new row violates row-level security policy for table "messages"
```

## Quick Fix for Development (Temporary)
To quickly get the application working for testing, you can temporarily disable RLS:

```sql
-- DEVELOPMENT ONLY - Disable RLS
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING**: This is only for development/testing. Never disable RLS in production!

## Proper RLS Configuration

### Step 1: Enable RLS on Tables
```sql
-- Enable RLS on all relevant tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Step 2: Drop Existing Policies (Clean Slate)
```sql
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON messages;
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
```

### Step 3: Create Conversation Policies
```sql
-- Allow authenticated users to create conversations
CREATE POLICY "Authenticated users can create conversations" 
ON conversations FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view conversations where they are the patient
CREATE POLICY "Users can view their conversations" 
ON conversations FOR SELECT 
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Allow users to update their own conversations
CREATE POLICY "Users can update their conversations" 
ON conversations FOR UPDATE 
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);
```

### Step 4: Create Message Policies
```sql
-- Allow authenticated users to create messages (both patients and AI)
CREATE POLICY "Authenticated users can create messages" 
ON messages FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
TO authenticated
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
);

-- Allow service role to create AI messages
CREATE POLICY "Service role can manage messages" 
ON messages FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
```

### Step 5: Create Patient Policies
```sql
-- Allow users to view their own patient record
CREATE POLICY "Users can view own patient record" 
ON patients FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow service role full access to patients
CREATE POLICY "Service role can manage patients" 
ON patients FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
```

### Step 6: Create Profile Policies
```sql
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Allow service role full access
CREATE POLICY "Service role can manage profiles" 
ON profiles FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
```

## Verification
After running these commands, test the application:

1. Log in as a patient (sarah.johnson@example.com / testpass123)
2. The chat interface should load with an initial greeting
3. You should be able to send messages and receive AI responses

## Re-enabling RLS After Testing
If you disabled RLS for testing, re-enable it with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Then run all the policies from Steps 3-6 above
```

## Troubleshooting

### If messages still fail to send:
1. Check that the user has a valid patient record
2. Verify the conversation exists and belongs to the patient
3. Check Supabase logs for detailed error messages

### Common Issues:
- Missing patient record for the user
- Conversation doesn't exist or has wrong patient_id
- Authentication token issues
- Service role key not being used for server-side operations

## Production Considerations
- Always use proper RLS policies in production
- Regularly audit your RLS policies
- Test all user scenarios thoroughly
- Consider using Supabase's built-in logging for security monitoring