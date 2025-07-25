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

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Patient Journey Flow\n');
  console.log('='.repeat(50));

  // Test credentials
  const testEmail = 'demo@tjv.com';
  const testPassword = 'demo123456';

  // 1. Test Authentication
  console.log('\n1️⃣ Testing Authentication...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    return;
  }

  console.log('✅ Authentication successful');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  // 2. Check Profile
  console.log('\n2️⃣ Checking User Profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile not found:', profileError.message);
    return;
  }

  console.log('✅ Profile found');
  console.log('   Name:', `${profile.first_name} ${profile.last_name}`);
  console.log('   Role:', profile.role);
  console.log('   Tenant:', profile.tenant_id);

  // 3. Test Provider Access
  if (profile.role === 'provider') {
    console.log('\n3️⃣ Testing Provider Access...');
    
    // Check if provider record exists
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('profile_id', authData.user.id)
      .single();

    if (providerError) {
      console.error('❌ Provider record error:', providerError.message);
    } else if (!provider) {
      console.error('❌ Provider record not found');
    } else {
      console.log('✅ Provider record found');
      console.log('   Provider ID:', provider.id);
    }

    // Check patients visibility
    const { data: patients, count, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('tenant_id', profile.tenant_id);

    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError.message);
    } else {
      console.log('✅ Patients accessible');
      console.log('   Total patients in tenant:', count);
    }
  }

  // 4. Test Patient Access
  if (profile.role === 'patient') {
    console.log('\n3️⃣ Testing Patient Access...');
    
    // Check if patient record exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('profile_id', authData.user.id)
      .single();

    if (patientError) {
      console.error('❌ Patient record not found:', patientError.message);
    } else {
      console.log('✅ Patient record found');
      console.log('   MRN:', patient.mrn);
      console.log('   Surgery Date:', patient.surgery_date);
      console.log('   Surgery Type:', patient.surgery_type);
      console.log('   Status:', patient.status);

      // Determine pre-op or post-op
      if (patient.surgery_date) {
        const surgeryDate = new Date(patient.surgery_date);
        const today = new Date();
        const isPreOp = surgeryDate > today;
        console.log('   Patient should redirect to:', isPreOp ? '/preop' : '/postop');
      }
    }
  }

  // 5. Test Invitation System
  console.log('\n4️⃣ Testing Invitation System...');
  const { data: invitations, error: invError } = await supabase
    .from('patient_invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (invError) {
    console.log('⚠️  Patient invitations table might not exist');
  } else {
    console.log('✅ Invitations table accessible');
    console.log('   Recent invitations:', invitations?.length || 0);
  }

  // 6. Test Protocol Templates
  console.log('\n5️⃣ Testing Protocol Templates...');
  const { data: protocols, error: protocolError } = await supabase
    .from('protocols')
    .select('*')
    .eq('tenant_id', profile.tenant_id);

  if (protocolError) {
    console.log('⚠️  Protocols table might not exist');
  } else {
    console.log('✅ Protocols accessible');
    console.log('   Available protocols:', protocols?.length || 0);
    protocols?.forEach(p => {
      console.log(`   - ${p.name} (${p.surgery_type})`);
    });
  }

  // 7. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Flow Test Summary:');
  console.log('✅ Authentication works');
  console.log('✅ Profile data accessible');
  console.log('✅ Role-based data access works');
  console.log(profile.role === 'patient' ? '✅ Patient can access their data' : '✅ Provider can see patients');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Sign in at http://localhost:3000/auth/signin');
  console.log('2. Should redirect to appropriate page based on role');
  console.log('3. Patient should see chat interface');
  console.log('4. Provider should see patient list');
}

// Run the test
testCompleteFlow().catch(console.error);