#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create a default tenant in Supabase
 * This is needed for the patient chat functionality
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

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

async function setupDefaultTenant() {
  console.log('🔧 Setting up default tenant...\n');

  try {
    // Check if tenant already exists
    const { data: existingTenant, error: checkError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', DEFAULT_TENANT_ID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('❌ Error checking for existing tenant:', checkError.message);
      return;
    }

    if (existingTenant) {
      console.log('✅ Default tenant already exists');
      console.log(`   ID: ${existingTenant.id}`);
      console.log(`   Name: ${existingTenant.name}`);
      return;
    }

    // Create default tenant
    const { data: newTenant, error: createError } = await supabase
      .from('tenants')
      .insert({
        id: DEFAULT_TENANT_ID,
        name: 'Default Healthcare Platform',
        subdomain: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating default tenant:', createError.message);
      return;
    }

    console.log('✅ Default tenant created successfully!');
    console.log(`   ID: ${newTenant.id}`);
    console.log(`   Name: ${newTenant.name}`);

    // Update existing profiles to use the default tenant
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tenant_id: DEFAULT_TENANT_ID })
      .eq('tenant_id', 'default');

    if (updateError) {
      console.log('⚠️  Warning: Could not update profiles:', updateError.message);
    } else {
      console.log('✅ Updated profiles to use the default tenant');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
setupDefaultTenant().catch(console.error);