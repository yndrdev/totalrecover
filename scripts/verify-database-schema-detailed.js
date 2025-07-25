#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Detailed Database Schema Verification Script
 * Uses SQL information_schema queries to get exact table structures
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

async function executeSQL(query, description) {
  console.log(`\n📊 ${description}:`);
  console.log('=' .repeat(80));
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: query
    });
    
    if (error) {
      console.log('❌ Error executing SQL:', error.message);
      return null;
    }
    
    if (data && Array.isArray(data)) {
      if (data.length === 0) {
        console.log('📝 No results returned');
        return [];
      }
      
      console.log(`📋 Results (${data.length} rows):`);
      data.forEach((row, index) => {
        console.log(`\n${index + 1}. ${JSON.stringify(row, null, 2)}`);
      });
      return data;
    }
    
    return data;
  } catch (err) {
    console.log('❌ Query execution failed:', err.message);
    return null;
  }
}

async function verifyDetailedSchema() {
  console.log('🔍 DETAILED DATABASE SCHEMA VERIFICATION');
  console.log('=' .repeat(80));
  console.log('Using SQL information_schema queries to get exact table structures');
  
  // 1. Check tenants table structure
  await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'tenants' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'TENANTS TABLE STRUCTURE');
  
  // 2. Check profiles table structure
  await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'PROFILES TABLE STRUCTURE');
  
  // 3. Check patients table structure
  await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'PATIENTS TABLE STRUCTURE');
  
  // 4. Check exercises table structure
  await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'EXERCISES TABLE STRUCTURE');
  
  // 5. Check forms table structure
  await executeSQL(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'forms' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `, 'FORMS TABLE STRUCTURE');
  
  // 6. Check foreign key relationships
  await executeSQL(`
    SELECT 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('tenants', 'profiles', 'patients', 'exercises', 'forms');
  `, 'FOREIGN KEY RELATIONSHIPS');
  
  // 7. Check what tables actually exist
  await executeSQL(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `, 'ALL TABLES IN PUBLIC SCHEMA');
  
  // 8. Check if RLS is enabled
  await executeSQL(`
    SELECT schemaname, tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('tenants', 'profiles', 'patients', 'exercises', 'forms');
  `, 'ROW LEVEL SECURITY STATUS');
  
  console.log('\n🎯 VERIFICATION COMPLETE');
  console.log('=' .repeat(80));
  console.log('Review the output above to understand:');
  console.log('1. Exact column names and types for each table');
  console.log('2. Which columns are nullable/have defaults');
  console.log('3. Foreign key relationships between tables');
  console.log('4. Which tables actually exist in the database');
  console.log('5. RLS status for each table');
}

// Run verification
verifyDetailedSchema()
  .then(() => {
    console.log('\n✅ Detailed schema verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error during detailed verification:', error);
    process.exit(1);
  });