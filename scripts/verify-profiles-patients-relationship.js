#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify the relationship between profiles and patients tables
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

async function verifyRelationship() {
  console.log('🔍 Verifying Profiles-Patients Relationship...\n');

  try {
    // Check auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    console.log('👥 Auth Users:');
    console.log('==============');
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    // Check profiles structure
    console.log('\n📋 Profiles Table:');
    console.log('==================');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profiles && profiles.length > 0) {
      console.log('Columns:', Object.keys(profiles[0]).join(', '));
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (ID: ${profile.id})`);
      });
    }

    // Check patients structure
    console.log('\n🏥 Patients Table:');
    console.log('==================');
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .limit(3);
    
    if (patients && patients.length > 0) {
      console.log('Columns:', Object.keys(patients[0]).join(', '));
      patients.forEach(patient => {
        console.log(`  - ${patient.first_name} ${patient.last_name} (user_id: ${patient.user_id})`);
      });
    } else {
      // Try to understand structure from error
      const { error } = await supabase
        .from('patients')
        .insert({});
      
      if (error) {
        console.log('Required fields from error:', error.message);
      }
    }

    // Check if auth user IDs match profile IDs
    console.log('\n🔗 Relationship Analysis:');
    console.log('========================');
    
    // Check Sarah Johnson specifically
    const sarahAuth = authUsers.users.find(u => u.email === 'sarah.johnson@example.com');
    if (sarahAuth) {
      console.log(`\nSarah Johnson Auth ID: ${sarahAuth.id}`);
      
      // Check if profile exists with this ID
      const { data: sarahProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sarahAuth.id)
        .single();
      
      if (sarahProfile) {
        console.log('✅ Profile found with auth ID as profile ID');
        console.log(`Profile: ${JSON.stringify(sarahProfile, null, 2)}`);
      } else {
        console.log('❌ No profile found with auth ID as profile ID');
        
        // Check by email
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'sarah.johnson@example.com')
          .single();
        
        if (profileByEmail) {
          console.log('📧 Profile found by email:', profileByEmail);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the verification
verifyRelationship().catch(console.error);