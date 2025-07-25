#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify and fix demo accounts for TJV Recovery Platform
 * Checks all requested demo accounts and creates missing patient records
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

// Required demo accounts
const requiredDemoAccounts = [
  'postop.recovery@demo.tjvrecovery.com',
  'dr.smith@demo.tjvrecovery.com', 
  'nurse.johnson@demo.tjvrecovery.com',
  'pt.williams@demo.tjvrecovery.com',
  'admin.davis@demo.tjvrecovery.com',
  'owner.admin@demo.tjvrecovery.com',
  'recovery.patient@demo.tjvrecovery.com',
  'dr.wilson@demo.tjvrecovery.com'
];

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

async function fixProfileRoles() {
  console.log('🔧 Fixing profile roles for demo accounts...\n');
  
  const roleUpdates = [
    { email: 'dr.smith@demo.tjvrecovery.com', role: 'provider' },
    { email: 'nurse.johnson@demo.tjvrecovery.com', role: 'provider' },
    { email: 'pt.williams@demo.tjvrecovery.com', role: 'provider' },
    { email: 'dr.wilson@demo.tjvrecovery.com', role: 'provider' }
  ];
  
  for (const update of roleUpdates) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: update.role })
      .eq('email', update.email);
      
    if (error) {
      console.log(`❌ Failed to update role for ${update.email}:`, error.message);
    } else {
      console.log(`✅ Updated role for ${update.email} to ${update.role}`);
    }
  }
  console.log('');
}

async function createMissingPatientRecords() {
  console.log('🏥 Creating missing patient records...\n');
  
  const patientEmails = [
    'postop.recovery@demo.tjvrecovery.com',
    'recovery.patient@demo.tjvrecovery.com'
  ];
  
  for (const email of patientEmails) {
    try {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileError) {
        console.log(`❌ Profile not found for ${email}:`, profileError.message);
        continue;
      }
      
      // Check if patient record exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', profile.id)
        .single();
        
      if (existingPatient) {
        console.log(`✅ Patient record already exists for ${email}`);
        continue;
      }
      
      // Create patient record with actual schema
      const surgeryType = email.includes('recovery.patient') ? 'THA' : 'TKA';
      const surgeryDaysAgo = email.includes('recovery.patient') ? 14 : 7;
      const surgeryDate = new Date(Date.now() - surgeryDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const patientData = {
        id: generateUUID(),
        tenant_id: DEFAULT_TENANT_ID,
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        surgery_type: surgeryType,
        surgery_date: surgeryDate,
        status: 'post_op',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
        
      if (patientError) {
        console.log(`❌ Failed to create patient record for ${email}:`, patientError.message);
      } else {
        console.log(`✅ Created patient record for ${email}`);
        console.log(`   Surgery: ${newPatient.surgery_type} on ${newPatient.surgery_date}`);
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${email}:`, error.message);
    }
  }
  console.log('');
}

async function verifyAllAccounts() {
  console.log('📋 Verifying all demo accounts...\n');
  
  const accountStatus = [];
  
  for (const email of requiredDemoAccounts) {
    try {
      // Check auth user
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      const authUser = users.find(user => user.email === email);
      
      if (!authUser) {
        accountStatus.push({ email, status: 'MISSING_AUTH_USER', authUser: null, profile: null, patient: null });
        continue;
      }
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profileError) {
        accountStatus.push({ email, status: 'MISSING_PROFILE', authUser, profile: null, patient: null });
        continue;
      }
      
      // Check patient record if role is patient
      let patient = null;
      if (profile.role === 'patient') {
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', profile.id)
          .single();
        patient = patientData;
      }
      
      const status = (profile.role === 'patient' && !patient) ? 'MISSING_PATIENT_RECORD' : 'COMPLETE';
      accountStatus.push({ email, status, authUser, profile, patient });
      
    } catch (error) {
      accountStatus.push({ email, status: 'ERROR', error: error.message });
    }
  }
  
  return accountStatus;
}

async function main() {
  console.log('🏥 TJV Recovery Platform - Demo Account Verification\n');
  console.log('Verifying and fixing demo accounts...\n');
  
  try {
    // Fix roles first
    await fixProfileRoles();
    
    // Create missing patient records
    await createMissingPatientRecords();
    
    // Verify all accounts
    const accountStatus = await verifyAllAccounts();
    
    console.log('📊 DEMO ACCOUNT STATUS REPORT:');
    console.log('==============================\n');
    
    const complete = accountStatus.filter(a => a.status === 'COMPLETE');
    const issues = accountStatus.filter(a => a.status !== 'COMPLETE');
    
    console.log(`✅ WORKING ACCOUNTS (${complete.length}):`);
    complete.forEach(account => {
      console.log(`📧 ${account.email}`);
      console.log(`👤 Role: ${account.profile.role}`);
      console.log(`📝 Name: ${account.profile.full_name}`);
      if (account.patient) {
        console.log(`🏥 Surgery: ${account.patient.surgery_type} on ${account.patient.surgery_date}`);
      }
      console.log('---');
    });
    
    if (issues.length > 0) {
      console.log(`\n❌ ACCOUNTS WITH ISSUES (${issues.length}):`);
      issues.forEach(account => {
        console.log(`📧 ${account.email}`);
        console.log(`❌ Status: ${account.status}`);
        if (account.error) {
          console.log(`   Error: ${account.error}`);
        }
        console.log('---');
      });
    }
    
    console.log('\n🔑 LOGIN CREDENTIALS FOR WORKING ACCOUNTS:');
    console.log('==========================================\n');
    
    complete.forEach(account => {
      console.log(`📧 ${account.email}`);
      console.log(`🔑 DemoPass123!`);
      console.log(`👤 Role: ${account.profile.role}`);
      console.log('---');
    });
    
    console.log(`\n🎉 Demo verification complete!`);
    console.log(`✅ ${complete.length} accounts ready for use`);
    if (issues.length > 0) {
      console.log(`⚠️  ${issues.length} accounts need attention`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);