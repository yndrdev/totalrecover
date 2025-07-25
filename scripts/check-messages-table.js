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

async function checkMessagesTable() {
  console.log('\n=== Checking Messages Table ===\n');

  // Try to insert a simple message without completion_status
  const testMessage = {
    conversation_id: '699268d7-6ae1-4804-8e9a-4ff19eefa185',
    sender_type: 'ai',
    content: 'Hello! This is a test message to check table structure.',
    created_at: new Date().toISOString()
  };

  console.log('Attempting to insert message without completion_status...');
  const { data, error } = await supabase
    .from('messages')
    .insert(testMessage)
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    
    // Try even simpler
    console.log('\nTrying minimal message...');
    const minimalMessage = {
      conversation_id: '699268d7-6ae1-4804-8e9a-4ff19eefa185',
      sender_type: 'ai',
      content: 'Test'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('messages')
      .insert(minimalMessage)
      .select()
      .single();
    
    if (error2) {
      console.error('Minimal message also failed:', error2);
    } else {
      console.log('Minimal message succeeded:', data2);
      
      // Delete it
      await supabase
        .from('messages')
        .delete()
        .eq('id', data2.id);
    }
  } else {
    console.log('Message inserted successfully:', data);
    
    // Delete the test message
    await supabase
      .from('messages')
      .delete()
      .eq('id', data.id);
    
    console.log('Test message deleted');
  }

  // Get actual table columns by selecting with limit 0
  console.log('\nChecking table structure...');
  const { data: sampleData, error: sampleError } = await supabase
    .from('messages')
    .select('*')
    .limit(1);

  if (!sampleError) {
    if (sampleData && sampleData.length > 0) {
      console.log('Message table columns:', Object.keys(sampleData[0]));
    } else {
      // Create a dummy query to see structure
      const { data: emptyData } = await supabase
        .from('messages')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      console.log('Table exists but is empty');
    }
  }
}

checkMessagesTable().catch(console.error);