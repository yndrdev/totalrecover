#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create patient profiles and records for test users in Supabase
 * This handles the actual database relationships properly
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

async function setupPatientProfiles() {
  console.log('🔧 Setting up patient profiles and records...\n');

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
      console.log(`\n📋 Processing ${user.email}...`);
      
      // 1. Create/Update Profile
      const profileData = {
        id: user.id,
        user_id: user.id,
        tenant_id: DEFAULT_TENANT_ID,
        email: user.email,
        first_name: user.user_metadata?.first_name || user.email.split('.')[0],
        last_name: user.user_metadata?.last_name || user.email.split('@')[0].split('.')[1],
        role: 'patient',
        accessible_tenants: [DEFAULT_TENANT_ID],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile:`, profileError.message);
        continue;
      } else {
        console.log(`✅ Profile created/updated`);
      }

      // 2. Create Patient Record
      // First check if patient already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingPatient) {
        console.log(`✅ Patient record already exists`);
        continue;
      }

      // Create patient record with specific data
      let patientData = {
        user_id: user.id,
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
        patientData.surgery_date = '2025-01-11'; // 5 days ago from Jan 16
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

      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (patientError) {
        console.error(`❌ Error creating patient record:`, patientError.message);
      } else {
        console.log(`✅ Patient record created`);
        console.log(`   MRN: ${newPatient.mrn}`);
        console.log(`   Surgery: ${newPatient.surgery_type} on ${newPatient.surgery_date}`);
      }
    }

    console.log('\n\n🎉 Patient profile setup complete!');
    console.log('\nYou can now log in as:');
    testUsers.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password: testpass123`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
setupPatientProfiles().catch(console.error);