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

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema and data access...\n');

  // 1. Check if patients table exists and get a sample
  console.log('1️⃣ Checking patients table structure...');
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .limit(1);
    
  if (patientsError) {
    console.error('❌ Error accessing patients table:', patientsError);
  } else if (patients && patients.length > 0) {
    console.log('✅ Patients table accessible');
    console.log('📋 Patient columns:', Object.keys(patients[0]));
    console.log('📋 Sample patient:', JSON.stringify(patients[0], null, 2));
    
    // Check which ID field exists
    const hasUserId = 'user_id' in patients[0];
    const hasProfileId = 'profile_id' in patients[0];
    console.log(`\n🔑 ID Fields: user_id=${hasUserId}, profile_id=${hasProfileId}`);
  } else {
    console.log('⚠️  No patients found in table');
  }

  // 2. Check profiles table structure
  console.log('\n2️⃣ Checking profiles table structure...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (profilesError) {
    console.error('❌ Error accessing profiles table:', profilesError);
  } else if (profiles && profiles.length > 0) {
    console.log('✅ Profiles table accessible');
    console.log('📋 Profile columns:', Object.keys(profiles[0]));
  }

  // 3. Test patient query with profile join
  console.log('\n3️⃣ Testing patient query with profile join...');
  
  // First try with profile_id
  console.log('   Trying with profile_id join...');
  const { data: withProfileId, error: profileIdError } = await supabase
    .from('patients')
    .select(`
      *,
      profile:profiles!profile_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .limit(1);
    
  if (profileIdError) {
    console.log('   ❌ profile_id join failed:', profileIdError.message);
  } else {
    console.log('   ✅ profile_id join succeeded');
  }

  // Try with explicit foreign key
  console.log('   Trying with explicit foreign key...');
  const { data: withFKey, error: fkeyError } = await supabase
    .from('patients')
    .select(`
      *,
      profile:profiles!patients_profile_id_fkey(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .limit(1);
    
  if (fkeyError) {
    console.log('   ❌ Foreign key join failed:', fkeyError.message);
  } else {
    console.log('   ✅ Foreign key join succeeded');
    if (withFKey && withFKey.length > 0) {
      console.log('   📋 Patient with profile:', JSON.stringify(withFKey[0], null, 2));
    }
  }

  // 4. Check RLS status
  console.log('\n4️⃣ Checking RLS status...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('query_system_info', {
      query_text: `
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('patients', 'profiles', 'tenants')
      `
    }).single();
    
  if (tablesError) {
    // Try alternative approach
    console.log('   Using alternative RLS check...');
    const { data: rlsCheck, error: rlsError } = await supabase
      .from('patients')
      .select('id')
      .limit(0);
      
    if (rlsError && rlsError.message.includes('row-level')) {
      console.log('   ⚠️  RLS appears to be enabled');
    } else {
      console.log('   ℹ️  RLS status unclear');
    }
  } else {
    console.log('   RLS Status:', tables);
  }

  // 5. Count total patients
  console.log('\n5️⃣ Counting total patients...');
  const { count, error: countError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ Error counting patients:', countError);
  } else {
    console.log(`✅ Total patients in database: ${count}`);
  }

  // 6. Test tenant isolation
  console.log('\n6️⃣ Checking tenant data...');
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, name')
    .limit(5);
    
  if (tenantsError) {
    console.error('❌ Error accessing tenants:', tenantsError);
  } else if (tenants && tenants.length > 0) {
    console.log('✅ Tenants found:');
    tenants.forEach(t => console.log(`   - ${t.id}: ${t.name}`));
    
    // Check patients per tenant
    for (const tenant of tenants) {
      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);
      console.log(`   Patients in tenant ${tenant.name}: ${count}`);
    }
  }

  // 7. Test patient_protocols table
  console.log('\n7️⃣ Checking patient_protocols table...');
  const { data: protocols, error: protocolsError } = await supabase
    .from('patient_protocols')
    .select('*')
    .limit(1);
    
  if (protocolsError) {
    console.error('❌ Error accessing patient_protocols:', protocolsError);
  } else {
    console.log('✅ patient_protocols table accessible');
    if (protocols && protocols.length > 0) {
      console.log('📋 Protocol columns:', Object.keys(protocols[0]));
    }
  }
}

// Run the test
testDatabaseSchema().catch(console.error);