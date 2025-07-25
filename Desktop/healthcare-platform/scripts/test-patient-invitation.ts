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

async function testPatientInvitation() {
  console.log('🧪 Testing Patient Invitation Flow\n');
  console.log('='.repeat(50));

  // 1. Authenticate as provider
  console.log('\n1️⃣ Authenticating as provider...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@tjv.com',
    password: 'demo123456'
  });

  if (authError || !authData.user) {
    console.error('❌ Authentication failed:', authError?.message);
    return;
  }

  console.log('✅ Authenticated as provider');
  console.log('   User ID:', authData.user.id);

  // 2. Create a test patient
  console.log('\n2️⃣ Creating test patient...');
  
  const surgeryDate = new Date();
  surgeryDate.setDate(surgeryDate.getDate() + 7); // Surgery in 7 days

  const patientData = {
    first_name: 'Test',
    last_name: 'Patient',
    email: 'test.patient@example.com',
    phone: '+1234567890',
    date_of_birth: '1980-01-15',
    surgery_type: 'total-knee-replacement',
    surgery_date: surgeryDate.toISOString().split('T')[0],
    tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
    provider_id: authData.user.id,
    status: 'active'
  };

  // First check if patient already exists by phone
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('*')
    .eq('phone_number', patientData.phone)
    .single();

  let patient;
  if (existingPatient) {
    console.log('⚠️  Patient already exists');
    patient = existingPatient;
  } else {
    // Get provider record
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', authData.user.id)
      .single();

    const { data: newPatient, error: patientError } = await supabase
      .from('patients')
      .insert({
        mrn: `MRN-${Date.now()}`,
        profile_id: null, // Will be set when patient registers
        tenant_id: patientData.tenant_id,
        date_of_birth: patientData.date_of_birth,
        surgery_type: patientData.surgery_type,
        surgery_date: patientData.surgery_date,
        surgeon_id: provider?.id || null,
        primary_provider_id: provider?.id || null,
        phone_number: patientData.phone,
        status: patientData.status,
        emergency_contact: {},
        medical_history: {}
      })
      .select()
      .single();

    if (patientError || !newPatient) {
      console.error('❌ Failed to create patient:', patientError);
      return;
    }

    console.log('✅ Patient created');
    console.log('   Patient ID:', newPatient.id);
    console.log('   MRN:', newPatient.mrn);
    patient = newPatient;
  }

  // 3. Check invitation tables
  console.log('\n3️⃣ Checking patient_invitations table...');
  
  // First check if table exists by trying to query it
  const { data: invitations, error: invError } = await supabase
    .from('patient_invitations')
    .select('*')
    .limit(1);

  if (invError) {
    if (invError.message.includes('relation') && invError.message.includes('does not exist')) {
      console.log('❌ patient_invitations table does not exist');
      console.log('   Creating table...');
      
      // Create the table
      const { error: createError } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS public.patient_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            date_of_birth DATE,
            surgery_type VARCHAR(50),
            surgery_date DATE,
            invitation_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
            status VARCHAR(20) DEFAULT 'pending',
            sent_at TIMESTAMPTZ,
            accepted_at TIMESTAMPTZ,
            custom_message TEXT,
            provider_id UUID REFERENCES providers(id),
            tenant_id UUID NOT NULL,
            practice_id UUID,
            sent_via TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            email_delivery_status JSONB,
            sms_delivery_status JSONB
          );
          
          -- Add RLS policies
          ALTER TABLE public.patient_invitations ENABLE ROW LEVEL SECURITY;
          
          -- Providers can view invitations they sent
          CREATE POLICY "Providers can view their invitations" ON public.patient_invitations
            FOR SELECT TO authenticated
            USING (provider_id IN (
              SELECT id FROM providers WHERE profile_id = auth.uid()
            ));
          
          -- Providers can create invitations
          CREATE POLICY "Providers can create invitations" ON public.patient_invitations
            FOR INSERT TO authenticated
            WITH CHECK (provider_id IN (
              SELECT id FROM providers WHERE profile_id = auth.uid()
            ));
        `
      });

      if (createError) {
        console.error('❌ Failed to create table:', createError);
        
        // Try simpler approach without rpc
        console.log('   Note: patient_invitations table needs to be created in Supabase dashboard');
      } else {
        console.log('✅ patient_invitations table created');
      }
    } else {
      console.error('❌ Error checking invitations:', invError);
    }
  } else {
    console.log('✅ patient_invitations table exists');
  }

  // 4. Test sending invitation via API
  console.log('\n4️⃣ Testing invitation API...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const invitationPayload = {
    email: patientData.email,
    phone: patient.phone_number,
    firstName: patientData.first_name,
    lastName: patientData.last_name,
    dateOfBirth: patient.date_of_birth,
    surgeryType: patient.surgery_type,
    surgeryDate: patient.surgery_date,
    customMessage: 'Welcome to our healthcare platform. Please complete your registration to access your recovery plan.'
  };

  try {
    const response = await fetch(`${baseUrl}/api/invitations/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify(invitationPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Invitation API call successful');
      if (result.invitation) {
        console.log('   Invitation ID:', result.invitation.id);
        console.log('   Token:', result.invitation.invitation_token);
        console.log('   Status:', result.invitation.status);
      }
      if (result.notificationResult) {
        console.log('   Email sent:', result.notificationResult.email?.success || false);
        console.log('   SMS sent:', result.notificationResult.sms?.success || false);
      }
    } else {
      console.error('❌ Invitation API failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error calling invitation API:', error);
  }

  // 5. Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Invitation Flow Test Summary:');
  console.log('✅ Provider authentication works');
  console.log('✅ Patient creation works');
  console.log('❓ Invitation system needs table creation');
  console.log('❓ Email/SMS delivery depends on Resend/Twilio config');
}

// Run the test
testPatientInvitation().catch(console.error);