import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPatientNames() {
  console.log('🔍 Checking Patient Names in Database...\n');

  try {
    // 1. Get all patients with profile data
    console.log('1️⃣ Fetching all patients with profile data...');
    
    const { data: patients, error } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    console.log(`Found ${patients?.length || 0} patients\n`);

    // 2. Check each patient's name data
    console.log('2️⃣ Checking patient names...\n');
    
    let patientsWithNames = 0;
    let patientsWithoutNames = 0;

    patients?.forEach((patient, index) => {
      const hasFirstName = !!patient.profile?.first_name;
      const hasLastName = !!patient.profile?.last_name;
      const hasName = hasFirstName || hasLastName;

      console.log(`Patient ${index + 1}:`);
      console.log(`  ID: ${patient.id}`);
      console.log(`  MRN: ${patient.mrn}`);
      console.log(`  Profile ID: ${patient.profile_id}`);
      console.log(`  Profile First Name: ${patient.profile?.first_name || '❌ MISSING'}`);
      console.log(`  Profile Last Name: ${patient.profile?.last_name || '❌ MISSING'}`);
      console.log(`  Profile Email: ${patient.profile?.email || 'No email'}`);
      console.log(`  Status: ${patient.status}`);
      console.log('');

      if (hasName) {
        patientsWithNames++;
      } else {
        patientsWithoutNames++;
      }
    });

    // 3. Summary
    console.log('📊 Summary:');
    console.log(`✅ Patients with names: ${patientsWithNames}`);
    console.log(`❌ Patients without names: ${patientsWithoutNames}`);
    console.log(`📝 Total patients: ${patients?.length || 0}`);

    // 4. Check if profiles table has the names
    console.log('\n3️⃣ Checking profiles table directly...\n');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('role', 'patient');

    if (!profileError) {
      console.log(`Found ${profiles?.length || 0} patient profiles`);
      
      let profilesWithNames = 0;
      profiles?.forEach(profile => {
        if (profile.first_name || profile.last_name) {
          profilesWithNames++;
        }
      });
      
      console.log(`Profiles with names: ${profilesWithNames}`);
      console.log(`Profiles without names: ${profiles.length - profilesWithNames}`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkPatientNames();