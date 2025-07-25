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

async function checkTableSchema() {
  console.log('🔍 Checking table schemas...\n');

  // Check profiles table
  console.log('📋 Profiles table:');
  const { data: profileSample, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (profileError) {
    console.error('Error:', profileError);
  } else if (profileSample && profileSample.length > 0) {
    console.log('Columns:', Object.keys(profileSample[0]));
  } else {
    // Try to insert a dummy record to see the schema error
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ dummy: 'test' });
    console.log('Schema error:', insertError);
  }

  // Check patients table  
  console.log('\n📋 Patients table:');
  const { data: patientSample, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .limit(1);
    
  if (patientError) {
    console.error('Error:', patientError);
  } else if (patientSample && patientSample.length > 0) {
    console.log('Columns:', Object.keys(patientSample[0]));
  } else {
    // Try to insert a dummy record to see the schema error
    const { error: insertError } = await supabase
      .from('patients')
      .insert({ dummy: 'test' });
    console.log('Schema error:', insertError);
  }

  // Check providers table
  console.log('\n📋 Providers table:');
  const { data: providerSample, error: providerError } = await supabase
    .from('providers')
    .select('*')
    .limit(1);
    
  if (providerError) {
    console.error('Error:', providerError);
  } else if (providerSample && providerSample.length > 0) {
    console.log('Columns:', Object.keys(providerSample[0]));
  } else {
    console.log('No data in providers table');
  }

  // Get the schema from information_schema
  console.log('\n📋 Getting schema from information_schema...');
  
  const { data: profilesSchema, error: profilesSchemaError } = await supabase
    .rpc('get_table_columns', { table_name: 'profiles' });
    
  if (!profilesSchemaError && profilesSchema) {
    console.log('\nProfiles table columns:', profilesSchema);
  }

  const { data: patientsSchema, error: patientsSchemaError } = await supabase
    .rpc('get_table_columns', { table_name: 'patients' });
    
  if (!patientsSchemaError && patientsSchema) {
    console.log('\nPatients table columns:', patientsSchema);
  }
}

// Run the check
checkTableSchema().catch(console.error);