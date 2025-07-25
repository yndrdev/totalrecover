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

async function checkProvidersTable() {
  console.log('🔍 Checking providers table structure...\n');

  // Try to get a sample provider record
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error accessing providers table:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Providers table accessible');
    console.log('📋 Provider columns:', Object.keys(data[0]));
    console.log('📋 Sample data:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️  No providers found in table');
    
    // Try a minimal insert to see what columns exist
    console.log('\n🧪 Testing minimal provider creation...');
    const { data: testData, error: testError } = await supabase
      .from('providers')
      .insert({
        profile_id: '00000000-0000-0000-0000-000000000000',
        tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
        specialty: 'Test'
      })
      .select();
      
    if (testError) {
      console.error('❌ Test insert error:', testError);
    } else {
      console.log('✅ Test insert successful:', testData);
      // Clean up test record
      if (testData && testData[0]) {
        await supabase
          .from('providers')
          .delete()
          .eq('id', testData[0].id);
      }
    }
  }
}

// Run the check
checkProvidersTable().catch(console.error);