import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPatientCreationFlow() {
  console.log('🧪 Testing Patient Creation Flow...\n');

  try {
    // 1. Check if we have any existing test patient
    const testEmail = 'test.patient@example.com';
    console.log(`1️⃣ Checking for existing test patient: ${testEmail}`);
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (existingProfile) {
      console.log('   Found existing profile:', existingProfile.id);
      
      // Check for patient record
      const { data: existingPatient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', existingProfile.id)
        .single();

      if (existingPatient) {
        console.log('   ✅ Patient record exists:', existingPatient.id);
      } else if (patientError?.code === 'PGRST116') {
        console.log('   ❌ No patient record found for this profile');
      } else {
        console.log('   ⚠️ Multiple patient records found - this is the issue!');
        
        // Get all patient records
        const { data: allPatients } = await supabase
          .from('patients')
          .select('*')
          .eq('profile_id', existingProfile.id);
          
        console.log('   Found patients:', allPatients?.length);
        allPatients?.forEach((p, i) => {
          console.log(`   Patient ${i + 1}:`, {
            id: p.id,
            profile_id: p.profile_id,
            created_at: p.created_at
          });
        });
      }
    }

    // 2. Check database structure
    console.log('\n2️⃣ Checking database structure...');
    
    // Check patients table columns
    const { data: tableInfo, error: tableError } = await supabase
      .from('patients')
      .select('*')
      .limit(0);

    if (!tableError) {
      console.log('   ✅ Patients table is accessible');
    } else {
      console.log('   ❌ Error accessing patients table:', tableError.message);
    }

    // 3. Test creating a new patient record
    console.log('\n3️⃣ Testing patient record creation...');
    
    const testProfileId = 'test-profile-' + Date.now();
    const testTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
    
    const { data: newPatient, error: createError } = await supabase
      .from('patients')
      .insert({
        profile_id: testProfileId,
        tenant_id: testTenantId,
        mrn: `MRN-TEST-${Date.now()}`,
        status: 'active',
        surgery_date: new Date().toISOString(),
        surgery_type: 'knee-replacement',
        phone_number: '555-1234'
      })
      .select()
      .single();

    if (newPatient) {
      console.log('   ✅ Successfully created test patient:', newPatient.id);
      
      // Clean up
      await supabase
        .from('patients')
        .delete()
        .eq('id', newPatient.id);
      
      console.log('   🧹 Cleaned up test patient');
    } else {
      console.log('   ❌ Failed to create patient:', createError?.message);
    }

    // 4. Check for duplicate patient records
    console.log('\n4️⃣ Checking for duplicate patient records...');
    
    const { data: duplicates } = await supabase
      .from('patients')
      .select('profile_id, count')
      .select('profile_id')
      .not('profile_id', 'is', null);

    // Group by profile_id to find duplicates
    const profileCounts = new Map();
    duplicates?.forEach(row => {
      const count = profileCounts.get(row.profile_id) || 0;
      profileCounts.set(row.profile_id, count + 1);
    });

    const duplicateProfiles = Array.from(profileCounts.entries())
      .filter(([_, count]) => count > 1);

    if (duplicateProfiles.length > 0) {
      console.log('   ⚠️ Found profiles with multiple patient records:');
      duplicateProfiles.forEach(([profileId, count]) => {
        console.log(`   Profile ${profileId}: ${count} patient records`);
      });
    } else {
      console.log('   ✅ No duplicate patient records found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPatientCreationFlow();