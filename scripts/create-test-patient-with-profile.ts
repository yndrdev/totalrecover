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

async function createTestPatient() {
  console.log('🧪 Creating Test Patient with Profile\n');
  console.log('='.repeat(50));

  const testEmail = 'testpatient1@example.com';
  const testPassword = 'testpatient123';
  const tenantId = 'c1234567-89ab-cdef-0123-456789abcdef';

  // 1. Create auth user
  console.log('\n1️⃣ Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('⚠️  User already exists, getting existing user...');
      
      // Get existing user
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('❌ Error listing users:', listError);
        return;
      }
      
      const existingUser = users.find(u => u.email === testEmail);
      if (!existingUser) {
        console.error('❌ Could not find existing user');
        return;
      }
      
      console.log('✅ Found existing user');
      console.log('   User ID:', existingUser.id);
      
      // Check if patient already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('profile_id', existingUser.id)
        .single();
        
      if (existingPatient) {
        console.log('\n✅ Test patient already exists:');
        console.log('   Patient ID:', existingPatient.id);
        console.log('   MRN:', existingPatient.mrn);
        console.log('   Surgery Date:', existingPatient.surgery_date);
        return;
      }
      
      // Continue with existing user ID
      authData = { user: existingUser };
    } else {
      console.error('❌ Error creating user:', authError);
      return;
    }
  } else {
    console.log('✅ Auth user created');
    console.log('   User ID:', authData.user.id);
  }

  // 2. Create profile
  console.log('\n2️⃣ Creating profile...');
  
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  if (existingProfile) {
    console.log('⚠️  Profile already exists');
  } else {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: testEmail,
        first_name: 'Test',
        last_name: 'Patient',
        role: 'patient',
        tenant_id: tenantId
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created');
  }

  // 3. Get provider
  console.log('\n3️⃣ Getting provider...');
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('tenant_id', tenantId)
    .limit(1)
    .single();

  if (!provider) {
    console.error('❌ No provider found in tenant');
    return;
  }

  console.log('✅ Found provider:', provider.id);

  // 4. Create patient
  console.log('\n4️⃣ Creating patient record...');
  
  const surgeryDate = new Date();
  surgeryDate.setDate(surgeryDate.getDate() + 7); // Surgery in 7 days

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert({
      profile_id: authData.user.id,
      mrn: `MRN-TEST-${Date.now()}`,
      tenant_id: tenantId,
      date_of_birth: '1980-01-15',
      surgery_type: 'total-knee-replacement',
      surgery_date: surgeryDate.toISOString().split('T')[0],
      surgeon_id: provider.id,
      primary_provider_id: provider.id,
      phone_number: '+1234567890',
      status: 'active',
      emergency_contact: {
        name: 'Emergency Contact',
        phone: '+1234567891',
        relationship: 'Spouse'
      },
      medical_history: {
        conditions: [],
        medications: [],
        allergies: []
      }
    })
    .select()
    .single();

  if (patientError) {
    console.error('❌ Error creating patient:', patientError);
    return;
  }

  console.log('✅ Patient created successfully!');
  console.log('   Patient ID:', patient.id);
  console.log('   MRN:', patient.mrn);
  console.log('   Surgery Date:', patient.surgery_date);

  // 5. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Patient Creation Summary:');
  console.log('✅ Email:', testEmail);
  console.log('✅ Password:', testPassword);
  console.log('✅ User ID:', authData.user.id);
  console.log('✅ Patient ID:', patient.id);
  console.log('✅ MRN:', patient.mrn);
  console.log('\n📝 Next Steps:');
  console.log('1. Provider can now send invitation to this patient');
  console.log('2. Patient can sign in with these credentials');
  console.log('3. Patient should be redirected to /preop (surgery in 7 days)');
}

// Run the creation
createTestPatient().catch(console.error);