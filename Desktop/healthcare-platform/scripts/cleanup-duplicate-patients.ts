import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicatePatients() {
  console.log('🧹 Cleaning up duplicate patient records...\n');

  try {
    // 1. Find all patient records grouped by profile_id
    console.log('1️⃣ Finding duplicate patient records...');
    
    const { data: allPatients, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    // Group by profile_id
    const patientsByProfile = new Map<string, any[]>();
    allPatients?.forEach(patient => {
      if (patient.profile_id) {
        const existing = patientsByProfile.get(patient.profile_id) || [];
        existing.push(patient);
        patientsByProfile.set(patient.profile_id, existing);
      }
    });

    // Find duplicates
    const duplicates = Array.from(patientsByProfile.entries())
      .filter(([_, patients]) => patients.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate patient records found!');
      return;
    }

    console.log(`⚠️ Found ${duplicates.length} profiles with duplicate patient records`);

    // 2. Clean up duplicates (keep the oldest one)
    for (const [profileId, patients] of duplicates) {
      console.log(`\n📋 Profile ${profileId} has ${patients.length} patient records`);
      
      // Sort by created_at to keep the oldest
      patients.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const keepPatient = patients[0];
      const deletePatients = patients.slice(1);

      console.log(`   Keeping: ${keepPatient.id} (created: ${keepPatient.created_at})`);
      
      for (const patient of deletePatients) {
        console.log(`   Deleting: ${patient.id} (created: ${patient.created_at})`);
        
        // Delete the duplicate
        const { error: deleteError } = await supabase
          .from('patients')
          .delete()
          .eq('id', patient.id);

        if (deleteError) {
          console.error(`   ❌ Error deleting patient ${patient.id}:`, deleteError);
        } else {
          console.log(`   ✅ Deleted patient ${patient.id}`);
        }
      }
    }

    console.log('\n✨ Cleanup complete!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Add a function to check current status
async function checkPatientStatus() {
  console.log('\n📊 Current patient record status:\n');

  const { data: counts } = await supabase
    .from('patients')
    .select('profile_id');

  const profileCounts = new Map<string, number>();
  counts?.forEach(row => {
    if (row.profile_id) {
      const count = profileCounts.get(row.profile_id) || 0;
      profileCounts.set(row.profile_id, count + 1);
    }
  });

  const duplicateCount = Array.from(profileCounts.values())
    .filter(count => count > 1).length;

  console.log(`Total patient records: ${counts?.length || 0}`);
  console.log(`Unique profiles: ${profileCounts.size}`);
  console.log(`Profiles with duplicates: ${duplicateCount}`);
}

// Run the cleanup
async function main() {
  await checkPatientStatus();
  await cleanupDuplicatePatients();
  await checkPatientStatus();
}

main();