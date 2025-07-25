import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPatientServiceData() {
  console.log('🧪 Testing Patient Service Data Loading...\n');

  try {
    // 1. Run the same query as the patient service
    console.log('1️⃣ Running patient service query...');
    
    const { data, error, count } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 9); // First 10 patients

    if (error) {
      console.error('Query error:', error);
      return;
    }

    console.log(`\n✅ Query successful!`);
    console.log(`Total patients: ${count}`);
    console.log(`Returned patients: ${data?.length || 0}\n`);

    // 2. Display the data structure
    console.log('2️⃣ First patient data structure:');
    if (data && data[0]) {
      console.log(JSON.stringify(data[0], null, 2));
    }

    // 3. Check all patients' profile data
    console.log('\n3️⃣ All patients profile check:');
    data?.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}:`);
      console.log(`  ID: ${patient.id}`);
      console.log(`  MRN: ${patient.mrn}`);
      console.log(`  Profile ID: ${patient.profile_id}`);
      console.log(`  Has profile object: ${!!patient.profile}`);
      if (patient.profile) {
        console.log(`  Profile name: ${patient.profile.first_name || 'NO FIRST NAME'} ${patient.profile.last_name || 'NO LAST NAME'}`);
        console.log(`  Profile email: ${patient.profile.email || 'NO EMAIL'}`);
      } else {
        console.log(`  ❌ NO PROFILE OBJECT`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPatientServiceData();