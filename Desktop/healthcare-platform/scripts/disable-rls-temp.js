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

async function disableRLS() {
  console.log('\n=== Temporarily Disabling RLS for Testing ===\n');
  
  console.log('⚠️  WARNING: This is for development only!');
  console.log('⚠️  DO NOT use this in production!\n');

  const tables = ['conversations', 'messages'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.rpc('query', {
        query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });
      
      if (error) {
        console.log(`❌ Cannot disable RLS on ${table} via API`);
        console.log('   You need to run this SQL in Supabase dashboard:');
        console.log(`   ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
      } else {
        console.log(`✅ RLS disabled on ${table}`);
      }
    } catch (err) {
      console.log(`\nPlease run this SQL in your Supabase SQL Editor:`);
      console.log('=====================================');
      console.log(`ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;`);
      console.log(`ALTER TABLE messages DISABLE ROW LEVEL SECURITY;`);
      console.log('=====================================\n');
      break;
    }
  }
  
  console.log('\n📝 To re-enable RLS later, run:');
  console.log('=====================================');
  console.log(`ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;`);
  console.log(`ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`);
  console.log('=====================================\n');
}

disableRLS().catch(console.error);