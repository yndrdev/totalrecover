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

async function inspectDatabase() {
  console.log('🔍 Inspecting database...\n');

  // Try a basic query on profiles
  console.log('📋 Testing profiles table...');
  const { data: profiles, error: profilesError, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  if (profilesError) {
    console.error('Profiles error:', profilesError);
  } else {
    console.log('Profiles count:', count);
  }

  // Try a basic query on patients
  console.log('\n📋 Testing patients table...');
  const { data: patients, error: patientsError, count: patientsCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });
    
  if (patientsError) {
    console.error('Patients error:', patientsError);
  } else {
    console.log('Patients count:', patientsCount);
  }

  // Test if we can get any data
  console.log('\n📋 Fetching actual profiles data...');
  const { data: profileData, error: profileDataError } = await supabase
    .from('profiles')
    .select('id, email, role, tenant_id')
    .limit(5);
    
  if (profileDataError) {
    console.error('Profile data error:', profileDataError);
  } else {
    console.log('Profile data:', profileData);
  }

  // Test if we can get any patient data
  console.log('\n📋 Fetching actual patients data...');
  const { data: patientData, error: patientDataError } = await supabase
    .from('patients')
    .select('id, user_id, mrn, first_name, last_name, tenant_id')
    .limit(5);
    
  if (patientDataError) {
    console.error('Patient data error:', patientDataError);
  } else {
    console.log('Patient data:', patientData);
  }

  // Check if we can insert minimal data
  console.log('\n📋 Testing minimal insert...');
  
  // First get an auth user
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error getting users:', usersError);
    return;
  }

  const testUser = users?.find(u => u.email === 'surgeon@tjv.com');
  if (testUser) {
    console.log('Found test user:', testUser.id);
    
    // Try inserting minimal profile
    const { data: newProfile, error: insertProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: testUser.id,
        email: testUser.email,
        role: 'provider',
        tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
      })
      .select();
      
    if (insertProfileError) {
      console.error('Profile insert error:', insertProfileError);
    } else {
      console.log('Profile inserted:', newProfile);
    }
  }
}

// Run the inspection
inspectDatabase().catch(console.error);