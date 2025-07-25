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

async function diagnosePatientQueries() {
  console.log('🔍 Diagnosing patient queries...\n');

  // 1. Basic patient query
  console.log('1️⃣ Basic patient query:');
  const { data: basicPatients, error: basicError } = await supabase
    .from('patients')
    .select('*')
    .limit(5);
    
  if (basicError) {
    console.error('❌ Basic query error:', basicError);
  } else {
    console.log(`✅ Found ${basicPatients?.length || 0} patients`);
    if (basicPatients?.length) {
      console.log('Sample patient:', JSON.stringify(basicPatients[0], null, 2));
    }
  }

  // 2. Patient with profile join
  console.log('\n2️⃣ Patient with profile join:');
  const { data: profilePatients, error: profileError } = await supabase
    .from('patients')
    .select(`
      *,
      profile:profiles!profile_id(
        id,
        email,
        full_name,
        first_name,
        last_name
      )
    `)
    .limit(5);
    
  if (profileError) {
    console.error('❌ Profile join error:', profileError);
  } else {
    console.log(`✅ Found ${profilePatients?.length || 0} patients with profiles`);
    if (profilePatients?.length) {
      console.log('Sample patient with profile:', JSON.stringify(profilePatients[0], null, 2));
    }
  }

  // 3. Full query as used in the service
  console.log('\n3️⃣ Full service query:');
  const { data: fullPatients, error: fullError, count } = await supabase
    .from('patients')
    .select(`
      *,
      practice:practices(name),
      profile:profiles!profile_id(
        id,
        email,
        full_name,
        first_name,
        last_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 9);
    
  if (fullError) {
    console.error('❌ Full query error:', fullError);
  } else {
    console.log(`✅ Full query successful - Count: ${count}, Data: ${fullPatients?.length || 0} records`);
  }

  // 4. Check if practices table exists
  console.log('\n4️⃣ Checking practices table:');
  const { data: practices, error: practicesError } = await supabase
    .from('practices')
    .select('*')
    .limit(1);
    
  if (practicesError) {
    console.error('❌ Practices table error:', practicesError);
  } else {
    console.log(`✅ Practices table accessible`);
  }

  // 5. Check profiles table
  console.log('\n5️⃣ Checking profiles table:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .limit(5);
    
  if (profilesError) {
    console.error('❌ Profiles table error:', profilesError);
  } else {
    console.log(`✅ Found ${profiles?.length || 0} patient profiles`);
  }

  // 6. Test a simplified query without the practices join
  console.log('\n6️⃣ Simplified query without practices:');
  const { data: simplePatients, error: simpleError } = await supabase
    .from('patients')
    .select(`
      *,
      profile:profiles!profile_id(
        id,
        email,
        full_name
      )
    `, { count: 'exact' });
    
  if (simpleError) {
    console.error('❌ Simplified query error:', simpleError);
  } else {
    console.log(`✅ Found ${simplePatients?.length || 0} patients in simplified query`);
  }

  console.log('\n✨ Diagnosis complete!');
}

// Run the diagnosis
diagnosePatientQueries().catch(console.error);