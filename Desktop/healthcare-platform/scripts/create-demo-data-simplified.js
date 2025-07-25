#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to create demo profiles and patients with existing tenant structure
 * Works without tenant_type column
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

// Demo users data
const demoUsers = [
  {
    email: 'sarah.johnson@example.com',
    profile: {
      full_name: 'Sarah Johnson',
      role: 'patient'
    },
    patient: {
      date_of_birth: '1968-05-12',
      surgery_type: 'TKA',
      surgery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      status: 'post-operative',
      risk_factors: ['diabetes', 'obesity']
    }
  },
  {
    email: 'michael.chen@example.com', 
    profile: {
      full_name: 'Michael Chen',
      role: 'patient'
    },
    patient: {
      date_of_birth: '1975-09-23',
      surgery_type: 'THA',
      surgery_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      status: 'post-operative',
      risk_factors: ['hypertension']
    }
  },
  {
    email: 'emily.rodriguez@example.com',
    profile: {
      full_name: 'Emily Rodriguez',
      role: 'patient'
    },
    patient: {
      date_of_birth: '1980-12-08',
      surgery_type: 'TKA',
      surgery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'pre-operative',
      risk_factors: []
    }
  }
];

async function createDemoData() {
  console.log('🚀 Creating Demo Profiles and Patients (Simplified)...\n');

  try {
    // Get any existing tenant or create a default one
    let tenantId;
    
    // Check for existing tenants
    const { data: existingTenants, error: tenantCheckError } = await supabase
      .from('tenants')
      .select('*');

    if (tenantCheckError) {
      console.error('❌ Error checking tenants:', tenantCheckError.message);
      return;
    }

    if (existingTenants && existingTenants.length > 0) {
      // Use the first existing tenant
      tenantId = existingTenants[0].id;
      console.log(`✅ Using existing tenant: ${existingTenants[0].name} (ID: ${tenantId})`);
    } else {
      // Create a default tenant
      const { data: newTenant, error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Demo Surgery Center',
          subdomain: 'demo-clinic',
          settings: {}
        })
        .select()
        .single();

      if (createTenantError) {
        console.error('❌ Error creating tenant:', createTenantError.message);
        return;
      }

      tenantId = newTenant.id;
      console.log(`✅ Created tenant: ${newTenant.name} (ID: ${tenantId})`);
    }

    console.log('\n📝 Creating demo profiles and patients...\n');

    // Process each demo user
    for (const demoUser of demoUsers) {
      console.log(`📧 Processing ${demoUser.email}...`);

      // Get auth user
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers.users.find(u => u.email === demoUser.email);

      if (!authUser) {
        console.log(`  ❌ Auth user not found for ${demoUser.email}`);
        continue;
      }

      console.log(`  ✅ Found auth user: ${authUser.id}`);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log(`  ℹ️  Profile already exists`);
      } else {
        // Create profile with ID = auth user ID
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id, // Direct ID linking!
            tenant_id: tenantId,
            email: demoUser.email,
            full_name: demoUser.profile.full_name,
            role: demoUser.profile.role,
            settings: {}
          })
          .select()
          .single();

        if (profileError) {
          console.log(`  ❌ Error creating profile: ${profileError.message}`);
          continue;
        }

        console.log(`  ✅ Created profile`);
      }

      // Check if patient already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (existingPatient) {
        console.log(`  ℹ️  Patient record already exists`);
      } else {
        // Generate MRN
        const mrn = `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

        // Create patient record
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            tenant_id: tenantId,
            user_id: authUser.id, // References profiles.id
            mrn: mrn,
            date_of_birth: demoUser.patient.date_of_birth,
            surgery_type: demoUser.patient.surgery_type,
            surgery_date: demoUser.patient.surgery_date,
            status: demoUser.patient.status,
            risk_factors: demoUser.patient.risk_factors
          })
          .select()
          .single();

        if (patientError) {
          console.log(`  ❌ Error creating patient: ${patientError.message}`);
          continue;
        }

        console.log(`  ✅ Created patient record (MRN: ${mrn})`);
      }
    }

    console.log('\n✅ Demo data creation complete!\n');

    // Verify the data
    console.log('📊 Verification:');
    console.log('================');

    for (const demoUser of demoUsers) {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers.users.find(u => u.email === demoUser.email);

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const { data: patient } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        console.log(`\n${demoUser.email}:`);
        console.log(`  Auth ID: ${authUser.id}`);
        console.log(`  Profile: ${profile ? '✅' : '❌'}`);
        console.log(`  Patient: ${patient ? '✅' : '❌'}`);
        
        if (patient) {
          console.log(`  Surgery: ${patient.surgery_type} (${patient.status})`);
          console.log(`  MRN: ${patient.mrn}`);
        }
      }
    }

    console.log('\n✅ All demo users are ready for testing!');
    console.log('\n📝 Note: The tenants table is missing the tenant_type column.');
    console.log('    This should be added in Supabase dashboard for full functionality.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the creation
createDemoData().catch(console.error);