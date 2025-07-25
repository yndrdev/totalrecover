/**
 * Database Relationships Debug Script
 * 
 * Run this script to test the database relationships and identify any issues
 * with the provider dashboard data fetching.
 * 
 * Usage: node debug-database-relationships.js
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabaseRelationships() {
  console.log('🔍 Starting database relationships debug...\n');

  try {
    // Test 1: Check if tables exist and basic structure
    console.log('📋 Test 1: Checking table structure...');
    
    const tables = ['profiles', 'patients', 'recovery_protocols', 'audit_logs'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table accessible`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }

    // Test 2: Check profiles table
    console.log('\n👤 Test 2: Checking profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, tenant_id')
      .limit(5);

    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.role}) [${profile.id}]`);
      });
    }

    // Test 3: Check patients table
    console.log('\n🏥 Test 3: Checking patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, user_id, tenant_id, surgery_type, status')
      .limit(5);

    if (patientsError) {
      console.log('❌ Patients error:', patientsError.message);
    } else {
      console.log(`✅ Found ${patients.length} patients`);
      patients.forEach(patient => {
        console.log(`   - ID: ${patient.id}, User ID: ${patient.user_id}, Surgery: ${patient.surgery_type}`);
      });
    }

    // Test 4: Check patient-profile relationships
    console.log('\n🔗 Test 4: Checking patient-profile relationships...');
    if (patients && patients.length > 0) {
      for (const patient of patients.slice(0, 3)) {
        if (patient.user_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', patient.user_id)
            .single();

          if (profileError) {
            console.log(`❌ Patient ${patient.id} -> Profile ${patient.user_id}: ${profileError.message}`);
          } else if (profile) {
            console.log(`✅ Patient ${patient.id} -> ${profile.first_name} ${profile.last_name} (${profile.email})`);
          } else {
            console.log(`⚠️  Patient ${patient.id} -> No profile found for user_id ${patient.user_id}`);
          }
        } else {
          console.log(`⚠️  Patient ${patient.id} has no user_id`);
        }
      }
    }

    // Test 5: Check protocols
    console.log('\n📋 Test 5: Checking recovery protocols...');
    const { data: protocols, error: protocolsError } = await supabase
      .from('recovery_protocols')
      .select('id, name, is_active, tenant_id')
      .limit(5);

    if (protocolsError) {
      console.log('❌ Protocols error:', protocolsError.message);
    } else {
      console.log(`✅ Found ${protocols.length} protocols`);
      protocols.forEach(protocol => {
        console.log(`   - ${protocol.name} (Active: ${protocol.is_active}) [${protocol.id}]`);
      });
    }

    // Test 6: Check tenant relationships
    console.log('\n🏢 Test 6: Checking tenant consistency...');
    if (profiles && profiles.length > 0) {
      const tenantIds = [...new Set(profiles.map(p => p.tenant_id).filter(Boolean))];
      console.log(`Found ${tenantIds.length} unique tenant IDs in profiles`);
      
      if (patients && patients.length > 0) {
        const patientTenantIds = [...new Set(patients.map(p => p.tenant_id).filter(Boolean))];
        console.log(`Found ${patientTenantIds.length} unique tenant IDs in patients`);
        
        const overlap = tenantIds.filter(id => patientTenantIds.includes(id));
        console.log(`${overlap.length} tenant IDs appear in both tables`);
      }
    }

    console.log('\n✅ Database relationships debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugDatabaseRelationships().catch(console.error);