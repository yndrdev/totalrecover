#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify exact table structures and relationships
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

async function executeQuery(query, description) {
  console.log(`\n📊 ${description}:`);
  console.log('=' .repeat(60));
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: query
    }).single();
    
    if (error) {
      // Try direct query if RPC doesn't exist
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .limit(0);
      
      console.log('❌ Cannot execute direct SQL query. Using table introspection instead.');
      return false;
    }
    
    if (data && data.rows) {
      data.rows.forEach(row => {
        console.log(JSON.stringify(row, null, 2));
      });
    }
    return true;
  } catch (err) {
    console.log('❌ Query execution failed:', err.message);
    return false;
  }
}

async function verifyTableStructures() {
  console.log('🔍 VERIFYING EXACT TABLE STRUCTURES AND RELATIONSHIPS');
  console.log('=' .repeat(60));
  
  // First try SQL information schema queries
  const canExecuteSQL = await executeQuery(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns 
     WHERE table_name = 'profiles' 
     AND table_schema = 'public'
     ORDER BY ordinal_position`,
    'Profiles Table Structure (SQL)'
  );
  
  // If SQL queries don't work, use Supabase API introspection
  if (!canExecuteSQL) {
    console.log('\n🔄 Using Supabase API for table introspection...\n');
    
    // Check profiles table
    console.log('📋 PROFILES TABLE STRUCTURE:');
    console.log('=' .repeat(60));
    
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!profileError && profileSample) {
      const columns = profileSample.length > 0 ? Object.keys(profileSample[0]) : [];
      console.log('Columns found:', columns.join(', '));
      
      if (profileSample.length > 0) {
        console.log('\nSample record:');
        console.log(JSON.stringify(profileSample[0], null, 2));
      }
    } else {
      console.log('Error:', profileError?.message);
    }
    
    // Check patients table
    console.log('\n🏥 PATIENTS TABLE STRUCTURE:');
    console.log('=' .repeat(60));
    
    const { data: patientSample, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);
    
    if (!patientError && patientSample) {
      const columns = patientSample.length > 0 ? Object.keys(patientSample[0]) : [];
      console.log('Columns found:', columns.join(', '));
      
      if (patientSample.length > 0) {
        console.log('\nSample record:');
        console.log(JSON.stringify(patientSample[0], null, 2));
      }
    } else if (patientError) {
      console.log('Error:', patientError.message);
      
      // Try to understand structure from insert error
      const { error: insertError } = await supabase
        .from('patients')
        .insert({});
      
      if (insertError) {
        console.log('\nRequired fields from insert error:');
        console.log(insertError.message);
      }
    }
  }
  
  // Check relationship between auth users and profiles
  console.log('\n🔗 RELATIONSHIP ANALYSIS:');
  console.log('=' .repeat(60));
  
  // Get auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const testUser = authUsers.users.find(u => u.email === 'sarah.johnson@example.com');
  
  if (testUser) {
    console.log(`\nTest User (Sarah Johnson):`);
    console.log(`  Auth ID: ${testUser.id}`);
    console.log(`  Email: ${testUser.email}`);
    
    // Check if profile exists with same ID
    const { data: profileById } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();
    
    if (profileById) {
      console.log('\n✅ Profile found with ID = Auth User ID');
      console.log('  This confirms: profiles.id = auth.users.id pattern');
      console.log(`  Profile ID: ${profileById.id}`);
      console.log(`  Profile Email: ${profileById.email}`);
    } else {
      console.log('\n❌ No profile found with ID = Auth User ID');
      
      // Check by email
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', testUser.email)
        .single();
      
      if (profileByEmail) {
        console.log('\n📧 Profile found by email:');
        console.log(`  Profile ID: ${profileByEmail.id}`);
        console.log(`  Profile Email: ${profileByEmail.email}`);
        console.log('  This suggests profiles might have separate ID');
      }
    }
    
    // Check if patient exists for this user
    if (profileById || profileByEmail) {
      const profileId = profileById?.id || profileByEmail?.id;
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', profileId)
        .single();
      
      if (patient) {
        console.log('\n✅ Patient record found:');
        console.log(`  Patient user_id: ${patient.user_id}`);
        console.log(`  Matches profile ID: ${patient.user_id === profileId}`);
      } else {
        console.log('\n❌ No patient record found for this profile');
      }
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(60));
  console.log('Based on the analysis, we need to determine:');
  console.log('1. Whether profiles.id = auth.users.id (Pattern A)');
  console.log('2. Or profiles has separate user_id field (Pattern B)');
  console.log('3. How patients.user_id references profiles');
  console.log('\nNext step: Create appropriate demo data based on findings');
}

// Run verification
verifyTableStructures()
  .then(() => {
    console.log('\n✅ Verification complete');
  })
  .catch(error => {
    console.error('\n❌ Error during verification:', error);
  });