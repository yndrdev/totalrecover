#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to set up Row Level Security (RLS) policies for conversations and messages
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setupRLSPolicies() {
  console.log('🔒 Setting up RLS Policies...\n');

  console.log('⚠️  RLS policies need to be created directly in Supabase dashboard.');
  console.log('Please run the following SQL commands in your Supabase SQL Editor:\n');

  const sqlCommands = `
-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table  
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Patients can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Patients can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can create messages in conversations" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages in conversations" ON messages;

-- Conversations policies
-- Allow patients to create conversations
CREATE POLICY "Patients can create their own conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Allow patients to view their own conversations
CREATE POLICY "Patients can view their own conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Allow patients to update their own conversations
CREATE POLICY "Patients can update their own conversations" ON conversations
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Messages policies
-- Allow authenticated users to create messages
CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Allow users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
      )
    )
  );

-- Allow system to update messages
CREATE POLICY "System can update messages" ON messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
  `;

  console.log('📋 SQL Commands to run:');
  console.log('=======================');
  console.log(sqlCommands);
  console.log('=======================\n');

  console.log('After running these commands, the RLS policies will be set up correctly.');
  console.log('\n✅ Alternative: Disable RLS temporarily for testing:');
  console.log('=====================================');
  console.log(`
-- Disable RLS on conversations and messages (for testing only)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
  `);
  console.log('=====================================\n');
  
  console.log('⚠️  Note: Disabling RLS is only recommended for development/testing.');
  console.log('For production, proper RLS policies should be implemented.');

  // Try to verify current RLS status
  try {
    // Check if we can query conversations
    const { data: testQuery, error: testError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42501') {
      console.log('\n❌ RLS is currently blocking access to conversations table.');
      console.log('   Please run the SQL commands above to fix this.');
    } else if (!testError) {
      console.log('\n✅ Conversations table is accessible.');
    }
  } catch (error) {
    console.log('\n❌ Error checking RLS status:', error.message);
  }
}

// Run the setup
setupRLSPolicies()
  .then(() => {
    console.log('\n✅ RLS policy setup instructions provided');
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
  });