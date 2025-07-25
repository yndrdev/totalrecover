#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create patient records for test users in Supabase
 * This is needed for the patient chat functionality
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

async function setupTestPatients() {
  console.log('🔧 Setting up test patients...\n');

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
    
    console.log(`Found ${testUsers.length} test users to process\n`);

    for (const user of testUsers) {
      // Check if patient record already exists
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error(`❌ Error checking patient for ${user.email}:`, checkError.message);
        continue;
      }

      if (existingPatient) {
        console.log(`✅ Patient record already exists for ${user.email}`);
        console.log(`   ID: ${existingPatient.id}`);
        continue;
      }

      // Create patient record matching ACTUAL database schema
      // Based on verification: patients table has user_id field (not direct ID linking)
      let patientData = {
        user_id: user.id, // Foreign key to auth.users.id
        tenant_id: DEFAULT_TENANT_ID,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add specific patient data based on email
      if (user.email === 'sarah.johnson@example.com') {
        patientData.mrn = 'MRN-SJ-001';
        patientData.date_of_birth = '1975-03-15';
        patientData.surgery_type = 'TKA';
        patientData.surgery_date = '2025-02-15';
        patientData.risk_factors = {
          diabetes: false,
          hypertension: false,
          obesity: false
        };
      } else if (user.email === 'michael.chen@example.com') {
        patientData.mrn = 'MRN-MC-001';
        patientData.date_of_birth = '1968-08-22';
        patientData.surgery_type = 'THA';
        patientData.surgery_date = '2025-03-01';
        patientData.risk_factors = {
          diabetes: false,
          hypertension: true,
          obesity: false
        };
      } else if (user.email === 'emily.rodriguez@example.com') {
        patientData.mrn = 'MRN-ER-001';
        patientData.date_of_birth = '1980-11-30';
        patientData.surgery_type = 'TSA';
        patientData.surgery_date = '2025-02-20';
        patientData.risk_factors = {
          diabetes: false,
          hypertension: false,
          obesity: false
        };
      }

      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (createError) {
        console.error(`❌ Error creating patient for ${user.email}:`, createError.message);
      } else {
        console.log(`✅ Patient record created for ${user.email}`);
        console.log(`   ID: ${newPatient.id}`);
        console.log(`   DOB: ${newPatient.date_of_birth || 'Not set'}`);
        console.log(`   Gender: ${newPatient.gender || 'Not set'}`);
      }
    }

    console.log('\n🎉 Test patient setup complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
setupTestPatients().catch(console.error);