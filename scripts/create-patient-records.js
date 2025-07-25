#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create patient records for test users in Supabase
 * Simplified version that matches actual database schema
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

async function createPatientRecords() {
  console.log('🔧 Creating patient records for test users...\n');

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
      console.log(`📋 Processing ${user.email}...`);
      
      // Check if patient already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingPatient) {
        console.log(`✅ Patient record already exists`);
        console.log(`   ID: ${existingPatient.id}`);
        console.log(`   MRN: ${existingPatient.mrn}`);
        continue;
      }

      // Create patient record based on email
      let patientData = {
        user_id: user.id,
        tenant_id: DEFAULT_TENANT_ID,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

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
        console.error('Details:', patientError);
      } else {
        console.log(`✅ Patient record created!`);
        console.log(`   ID: ${newPatient.id}`);
        console.log(`   MRN: ${newPatient.mrn}`);
        console.log(`   Surgery: ${newPatient.surgery_type} on ${newPatient.surgery_date}`);
      }
      console.log('');
    }

    console.log('\n🎉 Patient record creation complete!');
    console.log('\nTest the patient chat by logging in as:');
    console.log('📧 sarah.johnson@example.com (5 days post-op from knee replacement)');
    console.log('🔑 Password: testpass123');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

// Run the script
createPatientRecords().catch(console.error);