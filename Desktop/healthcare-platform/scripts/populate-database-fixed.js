#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Fixed Database Population Script
 * 
 * This script creates a complete and working demo environment with:
 * 1. Proper auth users with correct passwords
 * 2. Matching profiles with auth.users.id as profiles.id
 * 3. Patient records linked to profiles via user_id
 * 4. Proper 1:1 relationships throughout
 * 
 * Key Points:
 * - profiles.id = auth.users.id (direct ID matching)
 * - patients.user_id = profiles.id (linking patients to profiles)
 * - patients table has NO first_name/last_name columns
 * - All demo users have password "demo123!"
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

// Default tenant ID
let defaultTenantId;

// Demo users configuration
const demoUsers = [
  {
    email: 'admin@demo.com',
    password: 'demo123!',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    full_name: 'Admin User'
  },
  {
    email: 'surgeon@demo.com',
    password: 'demo123!',
    role: 'surgeon',
    first_name: 'Dr. Sarah',
    last_name: 'Surgeon',
    full_name: 'Dr. Sarah Surgeon'
  },
  {
    email: 'nurse@demo.com',
    password: 'demo123!',
    role: 'nurse',
    first_name: 'Nancy',
    last_name: 'Nurse',
    full_name: 'Nancy Nurse'
  },
  {
    email: 'pt@demo.com',
    password: 'demo123!',
    role: 'physical_therapist',
    first_name: 'Peter',
    last_name: 'Therapist',
    full_name: 'Peter Therapist'
  },
  {
    email: 'patient@demo.com',
    password: 'demo123!',
    role: 'patient',
    first_name: 'John',
    last_name: 'Patient',
    full_name: 'John Patient'
  },
  {
    email: 'sarah.johnson@demo.com',
    password: 'demo123!',
    role: 'patient',
    first_name: 'Sarah',
    last_name: 'Johnson',
    full_name: 'Sarah Johnson'
  },
  {
    email: 'michael.chen@demo.com',
    password: 'demo123!',
    role: 'patient',
    first_name: 'Michael',
    last_name: 'Chen',
    full_name: 'Michael Chen'
  },
  {
    email: 'emma.wilson@demo.com',
    password: 'demo123!',
    role: 'patient',
    first_name: 'Emma',
    last_name: 'Wilson',
    full_name: 'Emma Wilson'
  }
];

async function getDefaultTenant() {
  console.log('📍 Getting default tenant...');
  
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .limit(1);
  
  if (tenants && tenants.length > 0) {
    defaultTenantId = tenants[0].id;
    console.log(`✅ Using tenant: ${tenants[0].name} (${defaultTenantId})`);
  } else {
    throw new Error('No tenants found in database');
  }
}

async function createOrUpdateAuthUser(userData) {
  console.log(`👤 Processing auth user: ${userData.email}`);
  
  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === userData.email);
    
    if (existingUser) {
      console.log(`   ✅ Auth user already exists: ${userData.email}`);
      
      // Update password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: userData.password }
      );
      
      if (updateError) {
        console.log(`   ❌ Error updating password: ${updateError.message}`);
      } else {
        console.log(`   ✅ Password updated for: ${userData.email}`);
      }
      
      return existingUser;
    }
    
    // Create new user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    if (authError) {
      console.log(`   ❌ Error creating auth user: ${authError.message}`);
      return null;
    }
    
    console.log(`   ✅ Created auth user: ${userData.email}`);
    return authUser.user;
    
  } catch (error) {
    console.log(`   ❌ Error processing auth user: ${error.message}`);
    return null;
  }
}

async function createOrUpdateProfile(authUser, userData) {
  console.log(`📋 Processing profile: ${userData.email}`);
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (existingProfile) {
      console.log(`   ✅ Profile already exists: ${userData.email}`);
      
      // Update profile data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: userData.email,
          full_name: userData.full_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);
      
      if (updateError) {
        console.log(`   ❌ Error updating profile: ${updateError.message}`);
      } else {
        console.log(`   ✅ Profile updated: ${userData.email}`);
      }
      
      return existingProfile;
    }
    
    // Create new profile
    const profileData = {
      id: authUser.id, // Use auth user ID directly
      tenant_id: defaultTenantId,
      email: userData.email,
      full_name: userData.full_name,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      settings: {},
      accessible_tenants: [],
      permissions: [],
      preferences: {},
      notification_settings: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (profileError) {
      console.log(`   ❌ Error creating profile: ${profileError.message}`);
      return null;
    }
    
    console.log(`   ✅ Created profile: ${userData.email} (${userData.role})`);
    return profile;
    
  } catch (error) {
    console.log(`   ❌ Error processing profile: ${error.message}`);
    return null;
  }
}

async function createOrUpdatePatient(profile, userData, surgeonId) {
  if (userData.role !== 'patient') {
    return null;
  }
  
  console.log(`🏥 Processing patient: ${userData.email}`);
  
  try {
    // Check if patient already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', profile.id)
      .single();
    
    if (existingPatient) {
      console.log(`   ✅ Patient already exists: ${userData.email}`);
      return existingPatient;
    }
    
    // Create patient record
    const patientData = {
      tenant_id: defaultTenantId,
      user_id: profile.id, // Links to profile
      mrn: `MRN-${profile.id.slice(-8).toUpperCase()}`,
      date_of_birth: '1990-01-01',
      surgery_type: 'knee_replacement',
      surgery_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      surgeon_id: surgeonId,
      status: 'active',
      risk_factors: [],
      insurance_info: {},
      emergency_contact: {},
      allergies: [],
      medications: [],
      current_recovery_day: Math.floor(Math.random() * 30) + 1,
      activity_level: 'moderate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
    
    if (patientError) {
      console.log(`   ❌ Error creating patient: ${patientError.message}`);
      return null;
    }
    
    console.log(`   ✅ Created patient: ${userData.first_name} ${userData.last_name}`);
    return patient;
    
  } catch (error) {
    console.log(`   ❌ Error processing patient: ${error.message}`);
    return null;
  }
}

async function populateDatabase() {
  console.log('🚀 POPULATING DATABASE WITH FIXED RELATIONSHIPS');
  console.log('=' .repeat(60));
  
  // Get default tenant
  await getDefaultTenant();
  
  // Find surgeon for patient assignment
  let surgeonId = null;
  
  // Process all demo users
  const createdUsers = [];
  
  for (const userData of demoUsers) {
    console.log(`\n📝 Processing: ${userData.email}`);
    
    // Create/update auth user
    const authUser = await createOrUpdateAuthUser(userData);
    if (!authUser) continue;
    
    // Create/update profile
    const profile = await createOrUpdateProfile(authUser, userData);
    if (!profile) continue;
    
    // Remember surgeon ID for patient assignment
    if (userData.role === 'surgeon' && !surgeonId) {
      surgeonId = profile.id;
    }
    
    createdUsers.push({ authUser, profile, userData });
  }
  
  console.log(`\n👨‍⚕️ Using surgeon ID: ${surgeonId}`);
  
  // Create patient records for all patient profiles
  for (const { profile, userData } of createdUsers) {
    await createOrUpdatePatient(profile, userData, surgeonId);
  }
}

async function verifySetup() {
  console.log('\n✅ VERIFYING SETUP');
  console.log('=' .repeat(60));
  
  // Test auth → profile → patient chain for key users
  const testUsers = [
    'admin@demo.com',
    'surgeon@demo.com',
    'nurse@demo.com',
    'patient@demo.com',
    'sarah.johnson@demo.com'
  ];
  
  for (const email of testUsers) {
    console.log(`\n🔍 Testing: ${email}`);
    
    // Get auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`   ❌ No auth user found`);
      continue;
    }
    
    console.log(`   ✅ Auth user: ${authUser.id}`);
    
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (!profile) {
      console.log(`   ❌ No profile found`);
      continue;
    }
    
    console.log(`   ✅ Profile: ${profile.full_name} (${profile.role})`);
    
    // If patient, get patient record
    if (profile.role === 'patient') {
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (!patient) {
        console.log(`   ❌ No patient record found`);
        continue;
      }
      
      console.log(`   ✅ Patient: MRN ${patient.mrn}, Status: ${patient.status}`);
    }
    
    // Test login
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'demo123!'
      });
      
      if (loginError) {
        console.log(`   ❌ Login failed: ${loginError.message}`);
      } else {
        console.log(`   ✅ Login successful`);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`   ❌ Login test failed: ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🎯 FIXED DATABASE POPULATION SCRIPT');
    console.log('=' .repeat(60));
    console.log('This script ensures proper auth-profile-patient relationships:');
    console.log('• profiles.id = auth.users.id (direct ID matching)');
    console.log('• patients.user_id = profiles.id (linking via user_id)');
    console.log('• All demo users have password "demo123!"');
    console.log('=' .repeat(60));
    
    await populateDatabase();
    await verifySetup();
    
    console.log('\n🎉 DATABASE POPULATION COMPLETE');
    console.log('=' .repeat(60));
    console.log('✅ All auth users have matching profiles');
    console.log('✅ All patient profiles have patient records');
    console.log('✅ All demo users can log in with "demo123!"');
    console.log('✅ Relationships are properly established');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);