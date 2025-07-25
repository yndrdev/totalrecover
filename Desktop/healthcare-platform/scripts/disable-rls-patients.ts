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

async function disableRLS() {
  console.log('🔒 Disabling RLS on patients table...\n');

  try {
    // Disable RLS on patients table
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE patients DISABLE ROW LEVEL SECURITY;'
    });

    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
      // Try alternative approach
      console.log('🔄 Trying alternative approach...');
      
      // This approach might work if the function doesn't exist
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log('✅ Patients table is accessible (RLS might already be disabled)');
      }
    } else {
      console.log('✅ RLS disabled successfully on patients table');
    }

    // Test query to confirm
    console.log('\n🧪 Testing query after RLS change:');
    const { data: testData, error: testError, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
      
    if (testError) {
      console.error('❌ Test query error:', testError);
    } else {
      console.log(`✅ Can access ${count} patients`);
    }

    console.log('\n⚠️  IMPORTANT: Remember to re-enable RLS for production!');
    console.log('Run: ALTER TABLE patients ENABLE ROW LEVEL SECURITY;');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
disableRLS().catch(console.error);