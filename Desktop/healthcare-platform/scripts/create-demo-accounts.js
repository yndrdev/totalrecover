#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create demo accounts for TJV Recovery Platform
 * Creates all demo users with proper roles and patient records
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

// Demo accounts data
const demoAccounts = [
  {
    email: 'postop.recovery@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'patient',
    full_name: 'Post-Op Recovery Patient',
    first_name: 'Recovery',
    last_name: 'Patient',
    surgery_type: 'TKA',
    surgery_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    activity_level: 'active'
  },
  {
    email: 'dr.smith@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'provider',
    full_name: 'Dr. James Smith, MD',
    first_name: 'James',
    last_name: 'Smith',
    license_number: 'MD123456',
    specialties: ['Orthopedic Surgery', 'Joint Replacement']
  },
  {
    email: 'nurse.johnson@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'provider',
    full_name: 'Nurse Patricia Johnson, RN',
    first_name: 'Patricia',
    last_name: 'Johnson',
    license_number: 'RN789012',
    specialties: ['Post-Op Care', 'Patient Education']
  },
  {
    email: 'pt.williams@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'provider',
    full_name: 'Physical Therapist Mark Williams, PT',
    first_name: 'Mark',
    last_name: 'Williams',
    license_number: 'PT345678',
    specialties: ['Orthopedic Rehabilitation', 'Joint Recovery']
  },
  {
    email: 'admin.davis@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'admin',
    full_name: 'Administrator Sarah Davis',
    first_name: 'Sarah',
    last_name: 'Davis'
  },
  {
    email: 'owner.admin@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'admin',
    full_name: 'System Administrator',
    first_name: 'System',
    last_name: 'Admin'
  },
  {
    email: 'recovery.patient@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'patient',
    full_name: 'Jane Recovery Patient',
    first_name: 'Jane',
    last_name: 'Recovery',
    surgery_type: 'THA',
    surgery_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
    activity_level: 'sedentary'
  },
  {
    email: 'dr.wilson@demo.tjvrecovery.com',
    password: 'DemoPass123!',
    role: 'provider',
    full_name: 'Dr. Michael Wilson, MD',
    first_name: 'Michael',
    last_name: 'Wilson',
    license_number: 'MD567890',
    specialties: ['Hip Surgery', 'Sports Medicine']
  }
];

async function ensureDefaultTenant() {
  console.log('🔧 Ensuring default tenant exists...\n');

  try {
    // Check if tenant already exists
    const { data: existingTenant, error: checkError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', DEFAULT_TENANT_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('❌ Error checking for existing tenant:', checkError.message);
      throw checkError;
    }

    if (existingTenant) {
      console.log('✅ Default tenant already exists');
      console.log(`   ID: ${existingTenant.id}`);
      console.log(`   Name: ${existingTenant.name}\n`);
      return existingTenant;
    }

    // Create default tenant
    const { data: newTenant, error: createError } = await supabase
      .from('tenants')
      .insert({
        id: DEFAULT_TENANT_ID,
        name: 'TJV Recovery Demo',
        subdomain: 'tjv-demo',
        tenant_type: 'practice',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating default tenant:', createError.message);
      throw createError;
    }

    console.log('✅ Default tenant created successfully!');
    console.log(`   ID: ${newTenant.id}`);
    console.log(`   Name: ${newTenant.name}\n`);
    return newTenant;

  } catch (error) {
    console.error('❌ Error with tenant setup:', error.message);
    throw error;
  }
}

async function createDemoAccount(accountData) {
  console.log(`📝 Processing account: ${accountData.email}`);
  
  try {
    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error(`❌ Error listing users:`, listError.message);
      return { success: false, error: listError.message };
    }
    
    const existingUser = users.find(user => user.email === accountData.email);
    
    if (existingUser) {
      console.log(`   ✅ User already exists: ${accountData.email}`);
      console.log(`   ID: ${existingUser.id}`);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();
        
      if (!existingProfile) {
        console.log(`   📝 Creating profile for existing user...`);
        await createProfile(existingUser.id, accountData);
      } else {
        console.log(`   ✅ Profile already exists`);
      }
      
      return { success: true, user: existingUser, profile: existingProfile };
    }

    // Create user with email confirmation
    console.log(`   📝 Creating user...`);
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: accountData.email,
      password: accountData.password,
      email_confirm: true,
      user_metadata: {
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        role: accountData.role,
        full_name: accountData.full_name
      }
    });

    if (userError) {
      console.error(`   ❌ Error creating user: ${userError.message}`);
      return { success: false, error: userError.message };
    }

    console.log(`   ✅ User created: ${newUser.user.id}`);

    // Create profile
    const profile = await createProfile(newUser.user.id, accountData);
    
    // Create patient record if role is patient
    if (accountData.role === 'patient') {
      await createPatientRecord(newUser.user.id, accountData);
    }

    return { success: true, user: newUser.user, profile };

  } catch (error) {
    console.error(`   ❌ Error processing ${accountData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createProfile(userId, accountData) {
  console.log(`   📝 Creating profile...`);
  
  const profileData = {
    id: userId,
    user_id: userId, // Fix the user_id issue
    tenant_id: DEFAULT_TENANT_ID,
    email: accountData.email,
    full_name: accountData.full_name,
    first_name: accountData.first_name,
    last_name: accountData.last_name,
    role: accountData.role,
    is_active: true,
    email_verified: true,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Note: license_number and specialties are not in the current schema
  // These would need to be added to the database schema if needed

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single();

  if (profileError) {
    console.error(`   ❌ Profile creation failed:`, profileError.message);
    throw profileError;
  }

  console.log(`   ✅ Profile created`);
  return profile;
}

async function createPatientRecord(userId, accountData) {
  console.log(`   📝 Creating patient record...`);
  
  // Generate UUID using a simple method that works in all Node versions
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  const patientData = {
    id: generateUUID(),
    tenant_id: DEFAULT_TENANT_ID,
    user_id: userId,
    patient_number: `DEMO${Date.now().toString().slice(-6)}`,
    surgery_type: accountData.surgery_type,
    surgery_date: accountData.surgery_date,
    activity_level: accountData.activity_level,
    status: 'post_op',
    enrollment_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (patientError) {
    console.error(`   ❌ Patient record creation failed:`, patientError.message);
    throw patientError;
  }

  console.log(`   ✅ Patient record created`);
  return patient;
}

async function createDemoAccounts() {
  console.log('🏥 TJV Recovery Platform - Demo Account Creation\n');
  console.log('Creating demo accounts for testing and demonstration...\n');

  try {
    // Ensure default tenant exists
    await ensureDefaultTenant();

    const results = [];
    
    // Create each demo account
    for (const accountData of demoAccounts) {
      const result = await createDemoAccount(accountData);
      results.push({ ...accountData, ...result });
      console.log(''); // Add spacing between accounts
    }

    // Summary
    console.log('\n🎉 Demo Account Creation Complete!\n');
    console.log('SUMMARY:');
    console.log('========\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successfully created/verified: ${successful.length} accounts`);
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.length} accounts`);
    }

    console.log('\nLOGIN CREDENTIALS:');
    console.log('==================\n');

    successful.forEach(account => {
      console.log(`📧 ${account.email}`);
      console.log(`🔑 ${account.password}`);
      console.log(`👤 Role: ${account.role}`);
      console.log(`📝 Name: ${account.full_name}`);
      console.log('---');
    });

    if (failed.length > 0) {
      console.log('\nFAILED ACCOUNTS:');
      console.log('================\n');
      failed.forEach(account => {
        console.log(`❌ ${account.email}: ${account.error}`);
      });
    }

    console.log('\n✨ Demo environment is ready for testing!');
    console.log('You can now log in to the platform with any of the above credentials.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
createDemoAccounts().catch(console.error);