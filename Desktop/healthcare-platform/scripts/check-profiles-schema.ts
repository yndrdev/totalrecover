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

async function checkProfilesSchema() {
  console.log('🔍 Checking profiles table schema...\n');

  // Get a sample profile to see its structure
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error fetching profiles:', error);
    return;
  }

  if (profiles && profiles.length > 0) {
    console.log('📋 Profile columns:');
    console.log(Object.keys(profiles[0]));
    console.log('\n📄 Sample profile:');
    console.log(JSON.stringify(profiles[0], null, 2));
  }

  // Check specifically for patient profiles
  console.log('\n🏥 Checking patient profiles:');
  const { data: patientProfiles, error: patientError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient')
    .limit(3);
    
  if (patientError) {
    console.error('❌ Error fetching patient profiles:', patientError);
  } else {
    console.log(`✅ Found ${patientProfiles?.length || 0} patient profiles`);
    if (patientProfiles && patientProfiles.length > 0) {
      console.log('\nSample patient profile:');
      console.log(JSON.stringify(patientProfiles[0], null, 2));
    }
  }
}

// Run the check
checkProfilesSchema().catch(console.error);