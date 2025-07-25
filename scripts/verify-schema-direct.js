#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Direct Database Schema Verification Script
 * Uses Supabase API directly to inspect table structures
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

async function inspectTable(tableName) {
  console.log(`\n📊 ${tableName.toUpperCase()} TABLE INSPECTION:`);
  console.log('=' .repeat(80));
  
  try {
    // Try to get a sample record to understand structure
    const { data: sample, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log(`❌ Error accessing ${tableName}:`, sampleError.message);
      
      // Try to get structure from error by attempting an insert
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({});
      
      if (insertError) {
        console.log('📝 Structure hints from insert error:');
        console.log(insertError.message);
      }
      
      return null;
    }
    
    if (sample && sample.length > 0) {
      const columns = Object.keys(sample[0]);
      console.log(`✅ Table exists with ${columns.length} columns:`);
      console.log(`📋 Columns: ${columns.join(', ')}`);
      
      console.log('\n🔍 Sample record structure:');
      const sampleRecord = sample[0];
      Object.entries(sampleRecord).forEach(([key, value]) => {
        const type = typeof value;
        const displayValue = value === null ? 'null' : 
                           type === 'string' ? `"${value}"` : 
                           String(value);
        console.log(`  ${key}: ${displayValue} (${type})`);
      });
      
      return { columns, sample: sampleRecord };
    } else {
      console.log('✅ Table exists but is empty');
      
      // Try to get structure by examining the table directly
      const { data: insertResult, error: insertError } = await supabase
        .from(tableName)
        .insert({})
        .select();
      
      if (insertError) {
        console.log('📝 Required fields from insert error:');
        console.log(insertError.message);
      }
      
      return { columns: [], sample: null };
    }
  } catch (error) {
    console.log(`❌ Unexpected error with ${tableName}:`, error.message);
    return null;
  }
}

async function checkRelationships() {
  console.log('\n🔗 RELATIONSHIP ANALYSIS:');
  console.log('=' .repeat(80));
  
  try {
    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Cannot access auth users:', authError.message);
      return;
    }
    
    console.log(`📊 Found ${authUsers.users.length} auth users`);
    
    if (authUsers.users.length > 0) {
      const testUser = authUsers.users[0];
      console.log(`\nTesting with user: ${testUser.email} (ID: ${testUser.id})`);
      
      // Check if there's a profile for this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUser.id)
        .single();
      
      if (profile) {
        console.log('✅ Found profile with matching auth ID');
        console.log(`  Profile ID: ${profile.id}`);
        console.log(`  Profile structure: ${Object.keys(profile).join(', ')}`);
        
        // Check if there's a patient for this profile
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', profile.id)
          .single();
        
        if (patient) {
          console.log('✅ Found patient with matching profile ID');
          console.log(`  Patient structure: ${Object.keys(patient).join(', ')}`);
          console.log(`  Patient user_id: ${patient.user_id}`);
        } else {
          console.log('❌ No patient found for this profile');
          if (patientError) {
            console.log(`  Error: ${patientError.message}`);
          }
        }
      } else {
        console.log('❌ No profile found for this auth user');
        if (profileError) {
          console.log(`  Error: ${profileError.message}`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error in relationship analysis:', error.message);
  }
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error;
  } catch (error) {
    return false;
  }
}

async function verifyDirectSchema() {
  console.log('🔍 DIRECT DATABASE SCHEMA VERIFICATION');
  console.log('=' .repeat(80));
  console.log('Using Supabase API to inspect table structures directly');
  
  const tablesToCheck = ['tenants', 'profiles', 'patients', 'exercises', 'forms'];
  
  console.log('\n📋 TABLE EXISTENCE CHECK:');
  console.log('=' .repeat(80));
  
  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table);
    console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  }
  
  // Inspect each table that exists
  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table);
    if (exists) {
      await inspectTable(table);
    }
  }
  
  // Check relationships
  await checkRelationships();
  
  console.log('\n🎯 VERIFICATION COMPLETE');
  console.log('=' .repeat(80));
  console.log('Review the output above to understand:');
  console.log('1. Which tables exist in the database');
  console.log('2. Column names and sample data types');
  console.log('3. Relationships between auth users, profiles, and patients');
  console.log('4. Any error messages that reveal schema requirements');
}

// Run verification
verifyDirectSchema()
  .then(() => {
    console.log('\n✅ Direct schema verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error during direct verification:', error);
    process.exit(1);
  });