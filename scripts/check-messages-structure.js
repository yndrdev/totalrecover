import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMessagesStructure() {
  console.log('\n=== Checking Messages Table Structure ===\n');

  // Try different approaches to understand the table structure
  
  // 1. Try to insert a minimal message
  console.log('Testing minimal message insert...');
  const testConversationId = '699268d7-6ae1-4804-8e9a-4ff19eefa185'; // from earlier debug
  
  const minimalMessage = {
    conversation_id: testConversationId,
    sender_type: 'ai',
    content: 'Test message'
  };
  
  const { data: msg1, error: err1 } = await supabase
    .from('messages')
    .insert(minimalMessage)
    .select()
    .single();
    
  if (err1) {
    console.log('Minimal message failed:', err1.message);
    console.log('Error details:', err1);
  } else {
    console.log('Minimal message succeeded!');
    console.log('Message structure:', Object.keys(msg1));
    console.log('Full message:', msg1);
    
    // Delete the test message
    await supabase.from('messages').delete().eq('id', msg1.id);
    console.log('Test message deleted');
  }
  
  // 2. Try to get column info by selecting with specific columns
  console.log('\n\nTrying to select specific columns...');
  
  const columnsToTest = [
    'id',
    'conversation_id', 
    'patient_id',
    'sender_type',
    'sender_id',
    'content',
    'metadata',
    'created_at',
    'updated_at',
    'completion_status'
  ];
  
  for (const col of columnsToTest) {
    const { data, error } = await supabase
      .from('messages')
      .select(col)
      .limit(1);
      
    if (!error) {
      console.log(`✅ Column '${col}' exists`);
    } else {
      console.log(`❌ Column '${col}' does not exist`);
    }
  }
  
  // 3. Try to get any existing messages to see their structure
  console.log('\n\nChecking for any existing messages...');
  const { data: existingMessages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .limit(5);
    
  if (msgError) {
    console.log('Error fetching messages:', msgError);
  } else if (existingMessages && existingMessages.length > 0) {
    console.log(`Found ${existingMessages.length} messages`);
    console.log('Message structure:', Object.keys(existingMessages[0]));
    console.log('Sample message:', existingMessages[0]);
  } else {
    console.log('No messages found in table');
  }
}

checkMessagesStructure().catch(console.error);