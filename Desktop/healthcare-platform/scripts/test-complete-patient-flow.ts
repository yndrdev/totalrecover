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

async function testCompletePatientFlow() {
  console.log('🧪 Testing Complete Patient Flow\n');
  console.log('='.repeat(60));
  
  let testResults = {
    patientCreation: false,
    patientListLoading: false,
    patientLogin: false,
    patientChatAccess: false,
    rlsPolicies: false
  };

  try {
    // 1. Test Patient Creation
    console.log('\n1️⃣ Testing Patient Creation...');
    
    // Create a test user account
    const testEmail = `test.patient.${Date.now()}@example.com`;
    const testPassword = 'testPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Patient',
          role: 'patient'
        }
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Failed to create user account:', authError);
    } else {
      console.log('✅ User account created:', authData.user.id);
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'Patient',
          role: 'patient',
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef' // Default tenant
        });

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
      } else {
        console.log('✅ Profile created');
        
        // Create patient record
        const surgeryDate = new Date();
        surgeryDate.setDate(surgeryDate.getDate() + 7);
        
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .insert({
            profile_id: authData.user.id,
            tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
            mrn: `MRN-TEST-${Date.now()}`,
            surgery_date: surgeryDate.toISOString(),
            surgery_type: 'TKA',
            status: 'active',
            phone_number: '+1234567890',
            medical_history: {},
            emergency_contact: {}
          })
          .select()
          .single();

        if (patientError || !patient) {
          console.error('❌ Failed to create patient:', patientError);
        } else {
          console.log('✅ Patient record created:', patient.id);
          testResults.patientCreation = true;
        }
      }
    }

    // 2. Test Patient List Loading
    console.log('\n2️⃣ Testing Patient List Loading...');
    
    // Sign in as a provider to test loading patients
    const { data: providerAuth } = await supabase.auth.signInWithPassword({
      email: 'demo@tjv.com',
      password: 'demo123456'
    });

    if (providerAuth?.user) {
      // Test using the patient service
      const { data: patients, error: listError } = await supabase
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
        .eq('tenant_id', 'c1234567-89ab-cdef-0123-456789abcdef')
        .limit(10);

      if (listError) {
        console.error('❌ Failed to load patient list:', listError);
      } else {
        console.log(`✅ Patient list loaded: ${patients?.length || 0} patients`);
        if (patients && patients.length > 0) {
          console.log('   Sample patient:', {
            id: patients[0].id,
            mrn: patients[0].mrn,
            profile: patients[0].profile ? 'Loaded' : 'Missing'
          });
        }
        testResults.patientListLoading = true;
      }
    }

    // 3. Test Patient Login
    console.log('\n3️⃣ Testing Patient Login...');
    
    // Sign in as the test patient
    const { data: patientAuth, error: patientAuthError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (patientAuthError || !patientAuth.user) {
      console.error('❌ Failed to sign in as patient:', patientAuthError);
    } else {
      console.log('✅ Patient logged in successfully:', patientAuth.user.id);
      testResults.patientLogin = true;

      // 4. Test Patient Chat Access
      console.log('\n4️⃣ Testing Patient Chat Access...');
      
      // Test getting patient record by profile_id
      const { data: patientByProfile, error: profileQueryError } = await supabase
        .from('patients')
        .select('id, profile_id, surgery_date, surgery_type')
        .eq('profile_id', patientAuth.user.id)
        .single();

      if (profileQueryError || !patientByProfile) {
        console.error('❌ Failed to get patient by profile_id:', profileQueryError);
      } else {
        console.log('✅ Patient record found by profile_id:', patientByProfile.id);
        testResults.patientChatAccess = true;
      }
    }

    // 5. Test RLS Policies
    console.log('\n5️⃣ Testing RLS Policies...');
    
    // Test as authenticated patient (using anon key to simulate client-side)
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false
      }
    });

    // Set the session for the anon client
    if (patientAuth?.session) {
      await anonClient.auth.setSession({
        access_token: patientAuth.session.access_token,
        refresh_token: patientAuth.session.refresh_token
      });

      // Test patient can see their own record
      const { data: ownRecord, error: ownRecordError } = await anonClient
        .from('patients')
        .select('*')
        .eq('profile_id', patientAuth.user.id)
        .single();

      if (ownRecordError) {
        console.error('❌ Patient cannot see own record:', ownRecordError);
      } else {
        console.log('✅ Patient can see own record');
        testResults.rlsPolicies = true;
      }

      // Test patient cannot see other records
      const { data: otherRecords, error: otherError } = await anonClient
        .from('patients')
        .select('*')
        .neq('profile_id', patientAuth.user.id);

      if (otherRecords && otherRecords.length > 0) {
        console.error('❌ RLS Policy Issue: Patient can see other patients!');
        testResults.rlsPolicies = false;
      } else {
        console.log('✅ Patient cannot see other patient records (RLS working)');
      }
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    if (authData?.user?.id) {
      await supabase.from('patients').delete().eq('profile_id', authData.user.id);
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:\n');
  
  const allPassed = Object.values(testResults).every(result => result);
  
  console.log(`Patient Creation:      ${testResults.patientCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Patient List Loading:  ${testResults.patientListLoading ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Patient Login:         ${testResults.patientLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Patient Chat Access:   ${testResults.patientChatAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`RLS Policies:          ${testResults.rlsPolicies ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n⚠️  Next Steps:');
    if (!testResults.patientCreation) {
      console.log('  - Check patient table structure and permissions');
    }
    if (!testResults.patientListLoading) {
      console.log('  - Verify profile foreign key relationship');
    }
    if (!testResults.patientLogin) {
      console.log('  - Check authentication configuration');
    }
    if (!testResults.patientChatAccess) {
      console.log('  - Ensure profile_id is used consistently');
    }
    if (!testResults.rlsPolicies) {
      console.log('  - Run setup-patient-rls-policies.ts script');
    }
  }
}

// Run the test
testCompletePatientFlow().catch(console.error);