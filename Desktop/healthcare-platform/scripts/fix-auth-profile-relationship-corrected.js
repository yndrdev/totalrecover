#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Corrected Script to Fix Auth-Profile Relationship Issues
 * 
 * This script addresses:
 * 1. Missing profiles for auth users
 * 2. Duplicate or orphaned profiles
 * 3. Missing patient records for patient profiles
 * 4. Ensures proper 1:1 relationship between auth users and profiles
 * 
 * IMPORTANT: Patients table does NOT have first_name/last_name columns!
 * Names are retrieved from the linked profile via user_id.
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

// Default tenant ID (we'll get this from the database)
let defaultTenantId;

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

async function analyzeCurrentState() {
  console.log('\n🔍 ANALYZING CURRENT STATE');
  console.log('=' .repeat(50));

  // Get auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log(`📊 Auth users: ${authUsers.users.length}`);

  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*');
  console.log(`📊 Profiles: ${profiles?.length || 0}`);

  // Get patients
  const { data: patients } = await supabase
    .from('patients')
    .select('*');
  console.log(`📊 Patients: ${patients?.length || 0}`);

  // Check for missing profiles
  const authUserIds = authUsers.users.map(u => u.id);
  const profileIds = profiles?.map(p => p.id) || [];
  const missingProfiles = authUserIds.filter(id => !profileIds.includes(id));
  
  console.log(`🔍 Missing profiles: ${missingProfiles.length}`);
  if (missingProfiles.length > 0) {
    console.log('Missing profile IDs:', missingProfiles.slice(0, 5).join(', ') + (missingProfiles.length > 5 ? '...' : ''));
  }

  // Check for orphaned profiles
  const orphanedProfiles = profileIds.filter(id => !authUserIds.includes(id));
  console.log(`🔍 Orphaned profiles: ${orphanedProfiles.length}`);
  if (orphanedProfiles.length > 0) {
    console.log('Orphaned profile IDs:', orphanedProfiles.join(', '));
  }

  return {
    authUsers: authUsers.users,
    profiles: profiles || [],
    patients: patients || [],
    missingProfiles,
    orphanedProfiles
  };
}

async function cleanupOrphanedProfiles(orphanedProfiles) {
  if (orphanedProfiles.length === 0) return;

  console.log('\n🧹 CLEANING UP ORPHANED PROFILES');
  console.log('=' .repeat(50));

  for (const profileId of orphanedProfiles) {
    console.log(`🗑️  Removing orphaned profile: ${profileId}`);
    
    // First remove any patients linked to this profile
    const { error: patientsError } = await supabase
      .from('patients')
      .delete()
      .eq('user_id', profileId);
    
    if (patientsError) {
      console.log(`❌ Error removing patients for profile ${profileId}:`, patientsError.message);
    }

    // Then remove the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);
    
    if (profileError) {
      console.log(`❌ Error removing profile ${profileId}:`, profileError.message);
    } else {
      console.log(`✅ Removed orphaned profile: ${profileId}`);
    }
  }
}

async function createMissingProfiles(authUsers, missingProfiles) {
  if (missingProfiles.length === 0) return;

  console.log('\n🔨 CREATING MISSING PROFILES');
  console.log('=' .repeat(50));

  const authUserMap = new Map(authUsers.map(u => [u.id, u]));

  for (const userId of missingProfiles) {
    const authUser = authUserMap.get(userId);
    if (!authUser) continue;

    console.log(`➕ Creating profile for: ${authUser.email}`);

    // Parse name from email or use default
    const emailParts = authUser.email.split('@')[0].split('.');
    const firstName = emailParts[0]?.charAt(0).toUpperCase() + emailParts[0]?.slice(1) || 'Unknown';
    const lastName = emailParts[1]?.charAt(0).toUpperCase() + emailParts[1]?.slice(1) || 'User';
    const fullName = `${firstName} ${lastName}`;

    // Determine role based on email
    let role = 'patient';
    if (authUser.email.includes('dr.') || authUser.email.includes('surgeon')) {
      role = 'surgeon';
    } else if (authUser.email.includes('nurse')) {
      role = 'nurse';
    } else if (authUser.email.includes('admin')) {
      role = 'admin';
    }

    const profileData = {
      id: userId, // Use auth user ID directly
      tenant_id: defaultTenantId,
      email: authUser.email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      role: role,
      settings: {},
      accessible_tenants: [],
      permissions: [],
      preferences: {},
      notification_settings: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .insert(profileData);

    if (error) {
      console.log(`❌ Error creating profile for ${authUser.email}:`, error.message);
    } else {
      console.log(`✅ Created profile for: ${authUser.email} (${role})`);
    }
  }
}

async function createDemoPatients() {
  console.log('\n👥 CREATING DEMO PATIENTS');
  console.log('=' .repeat(50));

  // Get profiles with patient role that don't have patient records
  const { data: patientProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient');

  if (!patientProfiles || patientProfiles.length === 0) {
    console.log('📝 No patient profiles found');
    return;
  }

  // Check which profiles don't have patient records
  const { data: existingPatients } = await supabase
    .from('patients')
    .select('user_id');

  const existingPatientUserIds = existingPatients?.map(p => p.user_id) || [];
  const profilesNeedingPatients = patientProfiles.filter(p => !existingPatientUserIds.includes(p.id));

  if (profilesNeedingPatients.length === 0) {
    console.log('✅ All patient profiles already have patient records');
    return;
  }

  // Get a surgeon for assignment
  const { data: surgeonProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'surgeon')
    .limit(1);

  const surgeonId = surgeonProfile?.[0]?.id;

  // Create patient records - NOTE: No first_name/last_name columns in patients table!
  for (const profile of profilesNeedingPatients) {
    const patientData = {
      tenant_id: defaultTenantId,
      user_id: profile.id, // This links to the profile
      mrn: `MRN-${profile.id.slice(-8).toUpperCase()}`,
      date_of_birth: '1990-01-01',
      surgery_type: 'knee_replacement',
      surgery_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date in last 30 days
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

    const { error } = await supabase
      .from('patients')
      .insert(patientData);

    if (error) {
      console.log(`❌ Error creating patient for ${profile.email}:`, error.message);
    } else {
      console.log(`✅ Created patient record for: ${profile.first_name} ${profile.last_name}`);
    }
  }
}

async function verifyFix() {
  console.log('\n✅ VERIFYING FIX');
  console.log('=' .repeat(50));

  // Test the relationship for demo users
  const testEmails = [
    'sarah.johnson@example.com',
    'sarah.johnson@demo.com',
    'pt@demo.com',
    'surgeon@demo.com',
    'nurse@demo.com'
  ];

  for (const email of testEmails) {
    console.log(`\n🔍 Testing: ${email}`);
    
    // Get auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`❌ No auth user found for ${email}`);
      continue;
    }

    // Get profile by ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      console.log(`❌ No profile found for ${email}`);
      continue;
    }

    console.log(`✅ Profile found: ${profile.full_name} (${profile.role})`);

    // If patient, check for patient record
    if (profile.role === 'patient') {
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (patient) {
        console.log(`✅ Patient record found: MRN ${patient.mrn}, Status: ${patient.status}`);
      } else {
        console.log(`❌ No patient record found for ${email}`);
      }
    }
  }
}

async function testSpecificLogin() {
  console.log('\n🔐 TESTING SPECIFIC LOGIN SCENARIOS');
  console.log('=' .repeat(50));

  // Test login with demo credentials
  const testCredentials = [
    { email: 'sarah.johnson@example.com', password: 'demo123!' },
    { email: 'pt@demo.com', password: 'demo123!' },
    { email: 'surgeon@demo.com', password: 'demo123!' }
  ];

  for (const cred of testCredentials) {
    console.log(`\n🔓 Testing login for: ${cred.email}`);
    
    try {
      // Test auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (authError) {
        console.log(`❌ Auth login failed: ${authError.message}`);
        continue;
      }

      if (authData?.user) {
        console.log(`✅ Auth login successful: ${authData.user.id}`);
        
        // Test profile lookup
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.log(`❌ Profile lookup failed: ${profileError.message}`);
        } else {
          console.log(`✅ Profile lookup successful: ${profile.full_name} (${profile.role})`);
        }

        // Sign out to clean up
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`❌ Login test failed: ${error.message}`);
    }
  }
}

async function main() {
  try {
    console.log('🚀 AUTH-PROFILE RELATIONSHIP FIX SCRIPT (CORRECTED)');
    console.log('=' .repeat(50));

    // Get default tenant
    await getDefaultTenant();

    // Analyze current state
    const state = await analyzeCurrentState();

    // Clean up orphaned profiles
    await cleanupOrphanedProfiles(state.orphanedProfiles);

    // Create missing profiles
    await createMissingProfiles(state.authUsers, state.missingProfiles);

    // Create demo patients (no first_name/last_name columns)
    await createDemoPatients();

    // Verify the fix
    await verifyFix();

    // Test specific login scenarios
    await testSpecificLogin();

    console.log('\n🎉 AUTH-PROFILE RELATIONSHIP FIX COMPLETE');
    console.log('=' .repeat(50));
    console.log('✅ All auth users should now have profiles');
    console.log('✅ All patient profiles should have patient records');
    console.log('✅ All relationships should be properly established');
    console.log('✅ Login with demo123! should work for all users');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);