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

async function checkPatientsSchema() {
  console.log('🔍 Checking patients table schema...\n');

  // Try to insert a minimal record to see what columns exist
  const testData = {
    profile_id: 'test-id',
    tenant_id: 'test-tenant',
    mrn: 'TEST-MRN',
    surgery_type: 'TKA',
    surgery_date: '2024-01-01',
    phone_number: '555-0000',
    status: 'active'
  };

  console.log('📋 Testing with minimal data:', testData);
  
  const { data, error } = await supabase
    .from('patients')
    .insert(testData)
    .select();
    
  if (error) {
    console.error('Insert error:', error);
    
    // Try without certain fields
    console.log('\n📋 Trying without phone_number...');
    delete (testData as any).phone_number;
    
    const { data: data2, error: error2 } = await supabase
      .from('patients')
      .insert(testData)
      .select();
      
    if (error2) {
      console.error('Error:', error2);
    } else {
      console.log('Success!', data2);
    }
  } else {
    console.log('Success!', data);
  }
  
  // Try to get any existing patient data to see the structure
  console.log('\n📋 Fetching any existing patient data...');
  const { data: existingData, error: fetchError } = await supabase
    .from('patients')
    .select('*')
    .limit(1);
    
  if (fetchError) {
    console.error('Fetch error:', fetchError);
  } else if (existingData && existingData.length > 0) {
    console.log('Patient columns:', Object.keys(existingData[0]));
    console.log('Sample data:', existingData[0]);
  } else {
    console.log('No patient data found');
  }
}

// Run the check
checkPatientsSchema().catch(console.error);