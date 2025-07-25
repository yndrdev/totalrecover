import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testPatientQueries() {
  console.log('🔍 Testing patient queries...\n');

  try {
    // Test the exact query used in patient service
    const query = supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' });

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(0, 9);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Query successful!`);
    console.log(`📊 Total count: ${count}`);
    console.log(`📄 Records returned: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n👤 First patient:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testPatientQueries().catch(console.error);