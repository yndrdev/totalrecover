/**
 * Test Script for Simplified Dashboard
 * 
 * This script tests the simplified dashboard queries to ensure they work
 * with the current database schema without complex relationships.
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimplifiedDashboard() {
  console.log('🧪 Testing Simplified Dashboard Queries...\n');

  try {
    // Test 1: Check authentication (mock)
    console.log('📋 Test 1: Authentication check...');
    console.log('✅ Authentication check would happen in browser context');

    // Test 2: Optional profiles query
    console.log('\n👤 Test 2: Optional profiles query...');
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, tenant_id')
        .limit(1);

      if (profilesError) {
        console.log('⚠️ Profiles warning (non-blocking):', profilesError.message);
      } else {
        console.log(`✅ Profiles accessible - found ${profilesData.length} records`);
      }
    } catch (error) {
      console.log('⚠️ Profiles error (non-blocking):', error.message);
    }

    // Test 3: Main patients query (simplified)
    console.log('\n🏥 Test 3: Simplified patients query...');
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select(`
        id,
        first_name,
        last_name,
        surgery_date,
        surgery_type,
        current_recovery_day,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (patientsError) {
      console.log('❌ Patients error:', patientsError.message);
      console.log('Error details:', {
        code: patientsError.code,
        details: patientsError.details,
        hint: patientsError.hint
      });
    } else {
      console.log(`✅ Patients query successful - found ${patientsData.length} patients`);
      
      if (patientsData.length > 0) {
        console.log('\n📊 Sample patient data:');
        patientsData.slice(0, 3).forEach((patient, index) => {
          console.log(`   ${index + 1}. ${patient.first_name || 'Unknown'} ${patient.last_name || 'Patient'}`);
          console.log(`      Surgery: ${patient.surgery_type || 'Not specified'}`);
          console.log(`      Recovery Day: ${patient.current_recovery_day}`);
          console.log(`      Status: ${patient.status}`);
          console.log('');
        });

        // Test metrics calculation
        console.log('📈 Testing metrics calculation...');
        const metrics = {
          totalPatients: patientsData.length,
          activeRecovery: patientsData.filter(p => p.status === "active").length,
          preSurgery: patientsData.filter(p => p.current_recovery_day < 0).length,
          postSurgery: patientsData.filter(p => p.current_recovery_day >= 0).length,
        };
        console.log('✅ Metrics calculated:', metrics);
      }
    }

    // Test 4: Check for required columns
    console.log('\n🔍 Test 4: Checking required columns...');
    const requiredColumns = ['id', 'first_name', 'last_name', 'surgery_date', 'surgery_type', 'current_recovery_day', 'status', 'created_at'];
    
    if (patientsData && patientsData.length > 0) {
      const samplePatient = patientsData[0];
      const missingColumns = requiredColumns.filter(col => !(col in samplePatient));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns present');
      } else {
        console.log('⚠️ Missing columns:', missingColumns);
      }
    }

    // Test 5: Check table structure
    console.log('\n📋 Test 5: Checking table structure...');
    try {
      const { data: structureData, error: structureError } = await supabase
        .from('patients')
        .select('*')
        .limit(1);

      if (structureError) {
        console.log('❌ Structure check failed:', structureError.message);
      } else if (structureData && structureData.length > 0) {
        const columns = Object.keys(structureData[0]);
        console.log('✅ Available columns:', columns.join(', '));
      }
    } catch (error) {
      console.log('❌ Structure check error:', error.message);
    }

    console.log('\n🎉 Simplified dashboard test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSimplifiedDashboard().catch(console.error);