import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';

async function populateTestData() {
  console.log('🚀 Populating test data...\n');

  // Get all auth users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  // Test users to set up
  const testUsers = [
    { email: 'surgeon@tjv.com', firstName: 'Dr. Sarah', lastName: 'Johnson', role: 'provider' },
    { email: 'nurse@tjv.com', firstName: 'Nancy', lastName: 'Williams', role: 'provider' },
    { email: 'pt@tjv.com', firstName: 'Mike', lastName: 'Thompson', role: 'provider' },
    { email: 'patient@tjv.com', firstName: 'John', lastName: 'Smith', role: 'patient' }
  ];
  
  // Create profiles for all test users
  for (const testUser of testUsers) {
    const authUser = authUsers?.find(u => u.email === testUser.email);
    
    if (authUser) {
      console.log(`📋 Setting up ${testUser.email}...`);
      
      // Upsert profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          role: testUser.role,
          tenant_id: defaultTenantId,
          phone: '555-' + Math.floor(1000 + Math.random() * 9000)
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Profile created/updated');
        
        // If it's a provider, create provider record
        if (testUser.role === 'provider') {
          const { error: providerError } = await supabase
            .from('providers')
            .upsert({
              profile_id: authUser.id,
              tenant_id: defaultTenantId,
              department: testUser.email.includes('surgeon') ? 'Surgery' : 
                          testUser.email.includes('nurse') ? 'Nursing' : 'Physical Therapy',
              is_active: true
            });
            
          if (providerError && providerError.code !== '23505') {
            console.error('❌ Provider error:', providerError);
          } else {
            console.log('✅ Provider record created/updated');
          }
        }
      }
    }
  }

  // Create additional test patients
  console.log('\n📋 Creating test patients...');
  
  const testPatients = [
    { firstName: 'Alice', lastName: 'Johnson', surgeryType: 'TKA', daysFromNow: -30 },
    { firstName: 'Bob', lastName: 'Williams', surgeryType: 'THA', daysFromNow: -15 },
    { firstName: 'Carol', lastName: 'Davis', surgeryType: 'TSA', daysFromNow: 7 },
    { firstName: 'David', lastName: 'Brown', surgeryType: 'TKA', daysFromNow: -60 },
    { firstName: 'Emma', lastName: 'Wilson', surgeryType: 'THA', daysFromNow: -45 }
  ];
  
  for (const patient of testPatients) {
    const email = `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@example.com`;
    
    // Check if auth user exists
    let authUser = authUsers?.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`\n🔧 Creating auth user for ${email}...`);
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'demo123!',
        email_confirm: true,
        user_metadata: {
          first_name: patient.firstName,
          last_name: patient.lastName,
          role: 'patient',
          tenant_id: defaultTenantId
        }
      });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        continue;
      }
      
      authUser = newAuthUser.user;
    }
    
    if (authUser) {
      // Create/update profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          first_name: patient.firstName,
          last_name: patient.lastName,
          role: 'patient',
          tenant_id: defaultTenantId,
          phone: '555-' + Math.floor(1000 + Math.random() * 9000)
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
        continue;
      }
      
      // Calculate surgery date
      const surgeryDate = new Date();
      surgeryDate.setDate(surgeryDate.getDate() + patient.daysFromNow);
      
      // Create patient record using profile_id instead of user_id
      const { data: patientRecord, error: patientError } = await supabase
        .from('patients')
        .upsert({
          profile_id: authUser.id,
          tenant_id: defaultTenantId,
          mrn: 'MRN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          first_name: patient.firstName,
          last_name: patient.lastName,
          date_of_birth: '1970-' + (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0') + '-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
          phone_number: '555-' + Math.floor(1000 + Math.random() * 9000),
          surgery_type: patient.surgeryType,
          surgery_date: surgeryDate.toISOString().split('T')[0],
          status: 'active'
        })
        .select()
        .single();
        
      if (patientError) {
        console.error('❌ Patient error:', patientError);
      } else {
        console.log(`✅ Created patient: ${patient.firstName} ${patient.lastName} (Surgery: ${patient.surgeryType}, Date: ${surgeryDate.toISOString().split('T')[0]})`);
      }
    }
  }
  
  // Also create a patient record for patient@tjv.com
  const patientAuthUser = authUsers?.find(u => u.email === 'patient@tjv.com');
  if (patientAuthUser) {
    console.log('\n📋 Creating patient record for patient@tjv.com...');
    
    const { error: patientError } = await supabase
      .from('patients')
      .upsert({
        profile_id: patientAuthUser.id,
        tenant_id: defaultTenantId,
        mrn: 'MRN-TEST-001',
        first_name: 'John',
        last_name: 'Smith',
        date_of_birth: '1980-01-15',
        phone_number: '555-0100',
        surgery_type: 'TKA',
        surgery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      });
      
    if (patientError && patientError.code !== '23505') {
      console.error('❌ Patient error:', patientError);
    } else {
      console.log('✅ Patient record created for patient@tjv.com');
    }
  }
  
  // Display summary
  console.log('\n📊 Summary:');
  const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  const { count: providerCount } = await supabase.from('providers').select('*', { count: 'exact', head: true });
  
  console.log(`✅ Profiles: ${profileCount || 0}`);
  console.log(`✅ Patients: ${patientCount || 0}`);
  console.log(`✅ Providers: ${providerCount || 0}`);
  
  console.log('\n✅ Test data population complete!');
}

// Run the population
populateTestData().catch(console.error);