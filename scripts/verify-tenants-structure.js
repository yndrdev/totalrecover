#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to verify tenants table structure and find default tenant
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

async function verifyTenants() {
  console.log('🔍 Verifying Tenants Table...\n');

  try {
    // Get all tenants
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*');

    if (error) {
      console.error('❌ Error accessing tenants table:', error.message);
      return;
    }

    if (tenants && tenants.length > 0) {
      console.log('✅ Tenants table structure:');
      console.log('Columns:', Object.keys(tenants[0]).join(', '));
      console.log('\n📊 All tenants:');
      console.log('================');
      
      tenants.forEach((tenant, index) => {
        console.log(`\nTenant ${index + 1}:`);
        console.log(JSON.stringify(tenant, null, 2));
      });

      // Look for default tenant (ID: 00000000-0000-0000-0000-000000000000)
      const defaultTenant = tenants.find(t => t.id === '00000000-0000-0000-0000-000000000000');
      if (defaultTenant) {
        console.log('\n✅ Default tenant found:');
        console.log(JSON.stringify(defaultTenant, null, 2));
      } else {
        console.log('\n⚠️  No default tenant with ID 00000000-0000-0000-0000-000000000000');
        console.log('Using first tenant:', tenants[0].id);
      }
    } else {
      console.log('❌ No tenants found in database');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run verification
verifyTenants().catch(console.error);