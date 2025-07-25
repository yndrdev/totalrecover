#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to fix tenants table structure and create demo tenant hierarchy
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

async function fixTenantsTable() {
  console.log('🔧 Fixing Tenants Table Structure...\n');

  try {
    // Step 1: Check current table structure
    console.log('📊 Current tenants table structure:');
    const { data: currentTenants, error: checkError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking tenants table:', checkError.message);
      return;
    }

    if (currentTenants && currentTenants.length > 0) {
      console.log('Existing columns:', Object.keys(currentTenants[0]).join(', '));
    } else {
      console.log('Table exists but is empty');
    }

    // Step 2: Try to add tenant_type column
    console.log('\n🔧 Adding tenant_type column...');
    
    // Since we can't run direct SQL, we'll try to update a record with the new column
    // If it fails, we know the column doesn't exist
    const { error: typeCheckError } = await supabase
      .from('tenants')
      .insert({
        name: 'Test Tenant Type',
        tenant_type: 'clinic'
      });

    if (typeCheckError && typeCheckError.message.includes('tenant_type')) {
      console.log('❌ Cannot add tenant_type column via Supabase client.');
      console.log('⚠️  This column needs to be added directly in the Supabase dashboard:');
      console.log('\n📝 SQL to run in Supabase SQL Editor:');
      console.log('=====================================');
      console.log(`
-- Add missing tenant_type column
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tenant_type TEXT NOT NULL DEFAULT 'clinic' 
CHECK (tenant_type IN ('super_admin', 'practice', 'clinic'));

-- Add parent_tenant_id if missing
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES tenants(id);

-- Update existing records to have tenant_type
UPDATE tenants SET tenant_type = 'clinic' WHERE tenant_type IS NULL;
      `);
      console.log('=====================================\n');
      console.log('Please run this SQL in Supabase dashboard, then re-run this script.');
      return;
    }

    // Step 3: Create demo tenants if table structure is correct
    console.log('\n🏢 Creating demo tenant hierarchy...');

    // Check if we already have tenants
    const { data: existingTenants, count } = await supabase
      .from('tenants')
      .select('*', { count: 'exact' });

    if (count && count > 0) {
      console.log(`\n📊 Found ${count} existing tenants:`);
      existingTenants.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.tenant_type || 'no type'})`);
      });

      // Use first tenant as default
      const defaultTenant = existingTenants[0];
      console.log(`\n✅ Using existing tenant: ${defaultTenant.name} (ID: ${defaultTenant.id})`);
      return defaultTenant.id;
    }

    // Create new demo tenants
    console.log('\n📝 Creating new demo tenants...');

    // 1. Create Super Admin
    const { data: superAdmin, error: superAdminError } = await supabase
      .from('tenants')
      .insert({
        name: 'TJV Recovery Super Admin',
        subdomain: 'super-admin',
        tenant_type: 'super_admin'
      })
      .select()
      .single();

    if (superAdminError) {
      console.error('❌ Error creating super admin:', superAdminError.message);
      return;
    }
    console.log('✅ Created Super Admin tenant');

    // 2. Create Practice
    const { data: practice, error: practiceError } = await supabase
      .from('tenants')
      .insert({
        name: 'Demo Orthopedic Practice',
        subdomain: 'demo-practice',
        tenant_type: 'practice',
        parent_tenant_id: superAdmin.id
      })
      .select()
      .single();

    if (practiceError) {
      console.error('❌ Error creating practice:', practiceError.message);
      return;
    }
    console.log('✅ Created Practice tenant');

    // 3. Create Clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('tenants')
      .insert({
        name: 'Demo Surgery Center',
        subdomain: 'demo-clinic',
        tenant_type: 'clinic',
        parent_tenant_id: practice.id
      })
      .select()
      .single();

    if (clinicError) {
      console.error('❌ Error creating clinic:', clinicError.message);
      return;
    }
    console.log('✅ Created Clinic tenant');

    // Verify hierarchy
    console.log('\n📊 Tenant Hierarchy Created:');
    console.log('=============================');
    console.log(`Super Admin: ${superAdmin.name}`);
    console.log(`  └─ Practice: ${practice.name}`);
    console.log(`      └─ Clinic: ${clinic.name}`);

    console.log('\n✅ Tenant hierarchy setup complete!');
    console.log(`🏥 Default clinic tenant ID: ${clinic.id}`);

    return clinic.id;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the fix
fixTenantsTable()
  .then(tenantId => {
    if (tenantId) {
      console.log(`\n✅ Ready to create profiles and patients with tenant ID: ${tenantId}`);
    }
  })
  .catch(console.error);