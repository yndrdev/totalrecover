#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify the profiles table structure
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

async function verifyProfilesStructure() {
  console.log('🔍 Verifying Profiles Table Structure...\n');

  try {
    // Try to get one row to see the structure
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log(`❌ Error accessing profiles table: ${profileError.message}`);
      
      // Try to insert empty record to see required fields
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({});
      
      if (insertError) {
        console.log('\n📋 Based on error, required fields might include:');
        console.log(insertError.message);
      }
    } else {
      if (profileSample && profileSample.length > 0) {
        console.log('✅ Profiles table exists with columns:');
        console.log('================================');
        Object.keys(profileSample[0]).forEach(column => {
          const value = profileSample[0][column];
          const type = value === null ? 'null' : typeof value;
          console.log(`  - ${column}: ${type}`);
        });
        console.log('\nSample data:');
        console.log(JSON.stringify(profileSample[0], null, 2));
      } else {
        console.log('📊 Profiles table exists but is empty');
        console.log('Attempting to understand structure...');
        
        // Try minimal insert to understand required fields
        const testData = {
          user_id: '00000000-0000-0000-0000-000000000000',
          tenant_id: '00000000-0000-0000-0000-000000000000'
        };
        
        const { error: testError } = await supabase
          .from('profiles')
          .insert(testData);
        
        if (testError) {
          console.log('\nRequired fields based on error:');
          console.log(testError.message);
        }
      }
    }
    
    // Also check if there are any existing profiles
    const { data: allProfiles, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (count !== null) {
      console.log(`\n📊 Total profiles in database: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the verification
verifyProfilesStructure().catch(console.error);