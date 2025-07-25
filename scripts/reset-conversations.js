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

async function resetConversations() {
  console.log('\n=== Resetting Conversations ===\n');

  // Delete all messages first
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
  } else {
    console.log('✅ All messages deleted');
  }

  // Delete all conversations
  const { error: conversationsError } = await supabase
    .from('conversations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (conversationsError) {
    console.error('Error deleting conversations:', conversationsError);
  } else {
    console.log('✅ All conversations deleted');
  }

  console.log('\n🎉 Reset complete! Next login will create a new conversation with greeting.');
}

resetConversations().catch(console.error);