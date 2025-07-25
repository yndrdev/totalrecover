import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTenants() {
  console.log('🔍 Checking User Tenants and Patients...\n');

  try {
    // 1. Get all providers/users to see their tenants
    console.log('1️⃣ Checking provider users and their tenants...');
    
    const { data: providers, error: providersError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['provider', 'surgeon', 'nurse', 'admin'])
      .order('created_at', { ascending: false });

    if (!providersError && providers) {
      console.log(`\nFound ${providers.length} provider/admin users:`);
      providers.forEach(provider => {
        console.log(`\nProvider: ${provider.first_name} ${provider.last_name}`);
        console.log(`  Email: ${provider.email}`);
        console.log(`  Role: ${provider.role}`);
        console.log(`  Tenant ID: ${provider.tenant_id}`);
      });
    }

    // 2. Check all unique tenants
    console.log('\n\n2️⃣ Checking all unique tenant IDs...');
    
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('tenant_id')
      .not('tenant_id', 'is', null);

    const uniqueTenants = new Set<string>();
    allProfiles?.forEach(p => {
      if (p.tenant_id) uniqueTenants.add(p.tenant_id);
    });

    console.log(`\nFound ${uniqueTenants.size} unique tenants:`);
    uniqueTenants.forEach(tenantId => {
      console.log(`  - ${tenantId}`);
    });

    // 3. Check if there are patients in other tenants
    console.log('\n\n3️⃣ Checking patients by tenant...');
    
    for (const tenantId of uniqueTenants) {
      const { data: tenantPatients, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);
      
      console.log(`\nTenant ${tenantId}: ${count || 0} patients`);
    }

    // 4. Check if Bucky Thomas exists in profiles
    console.log('\n\n4️⃣ Searching for Bucky Thomas in profiles...');
    
    const { data: buckyProfiles } = await supabase
      .from('profiles')
      .select('*')
      .or('first_name.ilike.%bucky%,last_name.ilike.%thomas%,email.ilike.%bucky%,email.ilike.%thomas%');

    if (buckyProfiles && buckyProfiles.length > 0) {
      console.log('\n🎯 Found possible Bucky Thomas profiles:');
      buckyProfiles.forEach(profile => {
        console.log(`\nProfile: ${profile.first_name} ${profile.last_name}`);
        console.log(`  Email: ${profile.email}`);
        console.log(`  Role: ${profile.role}`);
        console.log(`  Tenant: ${profile.tenant_id}`);
        console.log(`  Created: ${profile.created_at}`);
      });
    } else {
      console.log('\n❌ No Bucky Thomas found in profiles');
    }

    // 5. Check for recent patient sign-ups
    console.log('\n\n5️⃣ Recent patient sign-ups (last 30 days)...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentPatients } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          first_name,
          last_name,
          email,
          created_at
        )
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentPatients && recentPatients.length > 0) {
      console.log(`\nFound ${recentPatients.length} recent patient sign-ups:`);
      recentPatients.forEach((patient, index) => {
        console.log(`\n${index + 1}. ${patient.profile?.first_name} ${patient.profile?.last_name}`);
        console.log(`   Email: ${patient.profile?.email}`);
        console.log(`   Created: ${patient.created_at}`);
        console.log(`   Tenant: ${patient.tenant_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkUserTenants();