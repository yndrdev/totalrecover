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

async function checkPatientsStructure() {
  console.log('🔍 Checking patients table structure...\n');

  // Get a sample patient to see column structure
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error accessing patients table:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Patients table accessible');
    console.log('📋 Patient columns:', Object.keys(data[0]));
    console.log('\n📋 Sample data:');
    const patient = data[0];
    Object.entries(patient).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  } else {
    console.log('⚠️  No patients found in table');
  }
}

// Run the check
checkPatientsStructure().catch(console.error);