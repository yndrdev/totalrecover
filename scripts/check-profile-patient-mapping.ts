import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilePatientMapping() {
  console.log('🔍 Checking Profile-Patient Mapping...\n');

  try {
    // 1. Get all profiles with role='patient'
    console.log('1️⃣ Fetching all patient profiles...');
    
    const { data: patientProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient');

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    console.log(`Found ${patientProfiles?.length || 0} patient profiles`);

    // 2. Check each profile for corresponding patient record
    console.log('\n2️⃣ Checking patient records...');
    
    const profilesWithoutPatients: any[] = [];
    const profilesWithPatients: any[] = [];

    for (const profile of patientProfiles || []) {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error?.code === 'PGRST116') {
        // No patient record found
        profilesWithoutPatients.push(profile);
      } else if (patient) {
        profilesWithPatients.push({ profile, patient });
      } else if (error) {
        console.error(`Error checking patient for profile ${profile.id}:`, error);
      }
    }

    // 3. Report findings
    console.log('\n📊 Summary:');
    console.log(`✅ Profiles with patient records: ${profilesWithPatients.length}`);
    console.log(`❌ Profiles WITHOUT patient records: ${profilesWithoutPatients.length}`);

    if (profilesWithoutPatients.length > 0) {
      console.log('\n⚠️ Profiles missing patient records:');
      profilesWithoutPatients.forEach(profile => {
        console.log(`   - ${profile.email} (ID: ${profile.id})`);
        console.log(`     Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`     Created: ${profile.created_at}`);
      });
    }

    // 4. Check for orphaned patient records (no matching profile)
    console.log('\n3️⃣ Checking for orphaned patient records...');
    
    const { data: allPatients } = await supabase
      .from('patients')
      .select('*');

    const orphanedPatients: any[] = [];
    
    for (const patient of allPatients || []) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patient.profile_id)
        .single();

      if (!profile) {
        orphanedPatients.push(patient);
      }
    }

    console.log(`\n🔗 Orphaned patient records: ${orphanedPatients.length}`);
    if (orphanedPatients.length > 0) {
      console.log('⚠️ Patient records without profiles:');
      orphanedPatients.forEach(patient => {
        console.log(`   - Patient ID: ${patient.id}`);
        console.log(`     Profile ID: ${patient.profile_id}`);
        console.log(`     MRN: ${patient.mrn}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkProfilePatientMapping();