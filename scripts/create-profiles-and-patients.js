#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create profiles and patient records for test users
 * Matches the actual database schema relationships
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

async function createProfilesAndPatients() {
  console.log('🔧 Creating profiles and patient records...\n');

  try {
    // Get all test users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    // Filter for our test users
    const testEmails = [
      'sarah.johnson@example.com',
      'michael.chen@example.com', 
      'emily.rodriguez@example.com'
    ];
    
    const testUsers = users.filter(user => testEmails.includes(user.email));
    
    console.log(`Found ${testUsers.length} test users\n`);

    for (const user of testUsers) {
      console.log(`\n📋 Processing ${user.email}...`);
      
      // 1. First create profile (using actual schema fields)
      const profileData = {
        user_id: user.id,
        tenant_id: DEFAULT_TENANT_ID,
        first_name: user.user_metadata?.first_name || user.email.split('.')[0],
        last_name: user.user_metadata?.last_name || user.email.split('@')[0].split('.')[1],
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Error creating profile:`, profileError.message);
          continue;
        }
        console.log(`✅ Profile created`);
      } else {
        console.log(`✅ Profile already exists`);
      }
      
      // 2. Now create patient record
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingPatient) {
        console.log(`✅ Patient record already exists`);
        console.log(`   MRN: ${existingPatient.mrn}`);
        continue;
      }

      // Create patient record
      let patientData = {
        user_id: user.id,
        tenant_id: DEFAULT_TENANT_ID,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add specific data based on user
      if (user.email === 'sarah.johnson@example.com') {
        patientData.mrn = 'SJ001';
        patientData.date_of_birth = '1975-03-15';
        patientData.surgery_type = 'TKA';
        patientData.surgery_date = '2025-01-11'; // 5 days ago
      } else if (user.email === 'michael.chen@example.com') {
        patientData.mrn = 'MC001';
        patientData.date_of_birth = '1968-08-22';
        patientData.surgery_type = 'THA';
        patientData.surgery_date = '2025-03-01';
      } else if (user.email === 'emily.rodriguez@example.com') {
        patientData.mrn = 'ER001';
        patientData.date_of_birth = '1980-11-30';
        patientData.surgery_type = 'TSA';
        patientData.surgery_date = '2025-02-20';
      }

      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (patientError) {
        console.error(`❌ Error creating patient:`, patientError.message);
      } else {
        console.log(`✅ Patient record created!`);
        console.log(`   MRN: ${newPatient.mrn}`);
        console.log(`   Surgery: ${newPatient.surgery_type} on ${newPatient.surgery_date}`);
      }
    }

    console.log('\n\n🎉 Setup complete!');
    console.log('\nTest the patient chat by logging in as:');
    console.log('📧 sarah.johnson@example.com (5 days post-op from knee replacement)');
    console.log('🔑 Password: testpass123');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

// Run the script
createProfilesAndPatients().catch(console.error);