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

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testPatientLogin() {
  console.log('🧪 Testing Patient Login Flow\n');
  console.log('='.repeat(50));

  const testEmail = 'testpatient1@example.com';
  const testPassword = 'testpatient123';

  // 1. Test Authentication
  console.log('\n1️⃣ Testing patient authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (authError || !authData.user) {
    console.error('❌ Authentication failed:', authError?.message);
    return;
  }

  console.log('✅ Authentication successful');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  // 2. Check Profile
  console.log('\n2️⃣ Checking patient profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError?.message);
    return;
  }

  console.log('✅ Profile found');
  console.log('   Name:', `${profile.first_name} ${profile.last_name}`);
  console.log('   Role:', profile.role);
  console.log('   Tenant:', profile.tenant_id);

  // 3. Check Patient Record
  console.log('\n3️⃣ Checking patient record...');
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('profile_id', authData.user.id)
    .single();

  if (patientError || !patient) {
    console.error('❌ Patient record not found:', patientError?.message);
    return;
  }

  console.log('✅ Patient record found');
  console.log('   Patient ID:', patient.id);
  console.log('   MRN:', patient.mrn);
  console.log('   Surgery Date:', patient.surgery_date);
  console.log('   Surgery Type:', patient.surgery_type);
  console.log('   Status:', patient.status);

  // 4. Determine Pre-op or Post-op
  console.log('\n4️⃣ Determining patient journey phase...');
  
  if (patient.surgery_date) {
    const surgeryDate = new Date(patient.surgery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    surgeryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((surgeryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('   Today:', today.toISOString().split('T')[0]);
    console.log('   Surgery:', surgeryDate.toISOString().split('T')[0]);
    console.log('   Days until surgery:', daysDiff);
    
    if (daysDiff > 0) {
      console.log('✅ Patient is in PRE-OP phase');
      console.log('   Should redirect to: /preop');
    } else {
      console.log('✅ Patient is in POST-OP phase');
      console.log('   Days since surgery:', Math.abs(daysDiff));
      console.log('   Should redirect to: /postop');
    }
  }

  // 5. Test API Access
  console.log('\n5️⃣ Testing patient API access...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  try {
    // Test accessing patient data endpoint
    const response = await fetch(`${baseUrl}/api/patients/current`, {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Patient API access works');
      console.log('   Current phase:', data.patient?.recovery_phase || 'N/A');
    } else {
      console.log('⚠️  Patient API returned:', response.status);
    }
  } catch (error) {
    console.log('⚠️  Could not test API (server may not be running)');
  }

  // 6. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Patient Login Test Summary:');
  console.log('✅ Authentication works');
  console.log('✅ Profile data accessible');
  console.log('✅ Patient record found');
  console.log('✅ Journey phase determined');
  console.log('\n📝 Expected flow:');
  console.log('1. Patient signs in at /auth/signin');
  console.log('2. Middleware checks patient record');
  console.log('3. Patient redirected to /preop or /postop based on surgery date');
  console.log('4. Patient can access chat and recovery content');
}

// Run the test
testPatientLogin().catch(console.error);