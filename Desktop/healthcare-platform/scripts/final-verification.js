#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Final Verification Script for Auth-Profile Relationships
 * This script provides comprehensive verification of the fixes
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

async function finalVerification() {
  console.log('🔍 FINAL VERIFICATION OF AUTH-PROFILE RELATIONSHIPS');
  console.log('=' .repeat(60));

  try {
    // Get all auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log(`📊 Total auth users: ${authUsers.users.length}`);

    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    console.log(`📊 Total profiles: ${profiles?.length || 0}`);

    // Get all patients
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    console.log(`📊 Total patients: ${patients?.length || 0}`);

    // Check relationship integrity
    console.log('\n🔗 RELATIONSHIP INTEGRITY CHECK');
    console.log('=' .repeat(60));

    const authUserIds = authUsers.users.map(u => u.id);
    const profileIds = profiles?.map(p => p.id) || [];
    const patientUserIds = patients?.map(p => p.user_id) || [];

    // Check for missing profiles
    const missingProfiles = authUserIds.filter(id => !profileIds.includes(id));
    console.log(`❌ Auth users missing profiles: ${missingProfiles.length}`);
    if (missingProfiles.length > 0) {
      console.log('Missing profiles for:', missingProfiles.slice(0, 5).map(id => {
        const user = authUsers.users.find(u => u.id === id);
        return user?.email || id;
      }).join(', '));
    }

    // Check for orphaned profiles  
    const orphanedProfiles = profileIds.filter(id => !authUserIds.includes(id));
    console.log(`❌ Orphaned profiles: ${orphanedProfiles.length}`);

    // Check patient-profile relationships
    const patientProfiles = profiles?.filter(p => p.role === 'patient') || [];
    const patientsWithoutRecords = patientProfiles.filter(p => !patientUserIds.includes(p.id));
    console.log(`❌ Patient profiles without patient records: ${patientsWithoutRecords.length}`);

    // Test specific demo users
    console.log('\n👥 DEMO USER VERIFICATION');
    console.log('=' .repeat(60));

    const demoUsers = [
      'admin@demo.com',
      'surgeon@demo.com', 
      'nurse@demo.com',
      'patient@demo.com',
      'sarah.johnson@demo.com',
      'pt@demo.com'
    ];

    for (const email of demoUsers) {
      console.log(`\n🔍 Testing: ${email}`);
      
      // Find auth user
      const authUser = authUsers.users.find(u => u.email === email);
      if (!authUser) {
        console.log(`   ❌ No auth user found`);
        continue;
      }
      console.log(`   ✅ Auth user found: ${authUser.id}`);

      // Find profile
      const profile = profiles?.find(p => p.id === authUser.id);
      if (!profile) {
        console.log(`   ❌ No profile found`);
        continue;
      }
      console.log(`   ✅ Profile found: ${profile.full_name} (${profile.role})`);

      // Check patient record if applicable
      if (profile.role === 'patient') {
        const patient = patients?.find(p => p.user_id === profile.id);
        if (!patient) {
          console.log(`   ❌ No patient record found`);
          continue;
        }
        console.log(`   ✅ Patient record found: ${patient.mrn}`);
      }

      // Test login
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'demo123!'
        });
        
        if (error) {
          console.log(`   ❌ Login failed: ${error.message}`);
        } else {
          console.log(`   ✅ Login successful`);
          await supabase.auth.signOut();
        }
      } catch (loginError) {
        console.log(`   ❌ Login error: ${loginError.message}`);
      }
    }

    // Summary
    console.log('\n📋 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Auth users: ${authUsers.users.length}`);
    console.log(`✅ Profiles: ${profiles?.length || 0}`);
    console.log(`✅ Patients: ${patients?.length || 0}`);
    console.log(`${missingProfiles.length === 0 ? '✅' : '❌'} Missing profiles: ${missingProfiles.length}`);
    console.log(`${orphanedProfiles.length === 0 ? '✅' : '❌'} Orphaned profiles: ${orphanedProfiles.length}`);
    console.log(`${patientsWithoutRecords.length === 0 ? '✅' : '❌'} Patient profiles missing records: ${patientsWithoutRecords.length}`);

    if (missingProfiles.length === 0 && orphanedProfiles.length === 0 && patientsWithoutRecords.length === 0) {
      console.log('\n🎉 ALL RELATIONSHIPS ARE PROPERLY FIXED!');
    } else {
      console.log('\n⚠️  Some issues remain. Run the fix script again.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
finalVerification();