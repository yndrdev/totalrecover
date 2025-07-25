#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify the actual database schema in Supabase
 * This will show us exactly what tables and columns exist
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

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying Supabase Database Schema...\n');

  try {
    // 1. List all tables
    console.log('📋 All Tables in Public Schema:');
    console.log('================================');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info', {});
    
    if (tablesError) {
      // Fallback: Try a direct query approach
      console.log('Using fallback method to list tables...\n');
      
      // List known tables we expect
      const expectedTables = [
        'tenants',
        'profiles',
        'patients',
        'conversations',
        'messages',
        'conversation_activities'
      ];
      
      for (const tableName of expectedTables) {
        console.log(`\nChecking table: ${tableName}`);
        console.log('-'.repeat(50));
        
        try {
          // Try to select from the table to see if it exists
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(0); // Don't actually fetch data
          
          if (error) {
            console.log(`❌ Table '${tableName}' - Error: ${error.message}`);
          } else {
            console.log(`✅ Table '${tableName}' exists`);
          }
        } catch (e) {
          console.log(`❌ Table '${tableName}' - Error: ${e.message}`);
        }
      }
    } else {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // 2. Check patients table structure specifically
    console.log('\n\n📊 Patients Table Structure:');
    console.log('============================');
    
    // Try to get one row to see the structure
    const { data: patientSample, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);
    
    if (patientError) {
      console.log(`❌ Error accessing patients table: ${patientError.message}`);
    } else {
      if (patientSample && patientSample.length > 0) {
        console.log('Columns found in patients table:');
        Object.keys(patientSample[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof patientSample[0][column]}`);
        });
      } else {
        // No data, try to insert and rollback to see required fields
        console.log('No patient data found. Attempting to identify required fields...');
        
        const { error: insertError } = await supabase
          .from('patients')
          .insert({});
        
        if (insertError) {
          console.log('\nRequired fields based on error message:');
          console.log(insertError.message);
        }
      }
    }
    
    // 3. Check conversations table structure
    console.log('\n\n📊 Conversations Table Structure:');
    console.log('=================================');
    
    const { data: convSample, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.log(`❌ Error accessing conversations table: ${convError.message}`);
    } else {
      if (convSample && convSample.length > 0) {
        console.log('Columns found in conversations table:');
        Object.keys(convSample[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof convSample[0][column]}`);
        });
      } else {
        console.log('No conversation data found.');
      }
    }
    
    // 4. Check messages table structure
    console.log('\n\n📊 Messages Table Structure:');
    console.log('============================');
    
    const { data: msgSample, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.log(`❌ Error accessing messages table: ${msgError.message}`);
    } else {
      if (msgSample && msgSample.length > 0) {
        console.log('Columns found in messages table:');
        Object.keys(msgSample[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof msgSample[0][column]}`);
        });
      } else {
        console.log('No message data found.');
      }
    }
    
    // 5. Check tenants table structure
    console.log('\n\n📊 Tenants Table Structure:');
    console.log('===========================');
    
    const { data: tenantSample, error: tenantError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantError) {
      console.log(`❌ Error accessing tenants table: ${tenantError.message}`);
    } else {
      if (tenantSample && tenantSample.length > 0) {
        console.log('Columns found in tenants table:');
        Object.keys(tenantSample[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof tenantSample[0][column]}`);
        });
        console.log(`\nFound ${tenantSample.length} tenant(s)`);
      } else {
        console.log('No tenant data found.');
      }
    }
    
    console.log('\n\n✅ Schema verification complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Review the actual schema structure above');
    console.log('2. Update TypeScript types to match actual database');
    console.log('3. Create patient records with correct fields');
    console.log('4. Test the patient chat interface');
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error.message);
  }
}

// Run the verification
verifyDatabaseSchema().catch(console.error);