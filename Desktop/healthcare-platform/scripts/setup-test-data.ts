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

async function setupTestData() {
  console.log('🚀 Setting up test data...\n');

  // First, ensure tenant exists
  console.log('📋 Checking tenant...');
  const { data: existingTenant, error: tenantCheckError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', defaultTenantId)
    .single();

  if (tenantCheckError || !existingTenant) {
    console.log('🔧 Creating default tenant...');
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: defaultTenantId,
        name: 'TJV Healthcare',
        domain: 'tjv.com',
        settings: {},
        created_at: new Date().toISOString()
      });
      
    if (tenantError) {
      console.error('❌ Error creating tenant:', tenantError);
    } else {
      console.log('✅ Tenant created');
    }
  } else {
    console.log('✅ Tenant already exists');
  }

  // Get all auth users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  // Test users to set up
  const testEmails = ['surgeon@tjv.com', 'nurse@tjv.com', 'pt@tjv.com', 'patient@tjv.com'];
  
  for (const email of testEmails) {
    const authUser = authUsers?.find(u => u.email === email);
    
    if (authUser) {
      console.log(`\n📋 Processing ${email}...`);
      
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (profileCheckError || !existingProfile) {
        console.log('🔧 Creating profile...');
        
        const metadata = authUser.user_metadata;
        const profileData = {
          id: authUser.id,
          email: authUser.email,
          full_name: `${metadata?.first_name || email.split('@')[0]} ${metadata?.last_name || 'User'}`,
          first_name: metadata?.first_name || email.split('@')[0],
          last_name: metadata?.last_name || 'User',
          role: metadata?.role || (email === 'patient@tjv.com' ? 'patient' : 'provider'),
          tenant_id: metadata?.tenant_id || defaultTenantId,
          phone: '555-' + Math.floor(1000 + Math.random() * 9000),
          created_at: new Date().toISOString()
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);
          
        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
        } else {
          console.log('✅ Profile created');
        }
      } else {
        console.log('✅ Profile already exists');
      }
      
      // If it's a provider, create provider record
      if (email !== 'patient@tjv.com') {
        const { data: existingProvider, error: providerCheckError } = await supabase
          .from('providers')
          .select('*')
          .eq('profile_id', authUser.id)
          .single();
          
        if (providerCheckError || !existingProvider) {
          console.log('🔧 Creating provider record...');
          
          const providerData = {
            profile_id: authUser.id,
            tenant_id: defaultTenantId,
            department: authUser.user_metadata?.provider_role || 'General',
            is_active: true,
            created_at: new Date().toISOString()
          };
          
          const { error: providerError } = await supabase
            .from('providers')
            .insert(providerData);
            
          if (providerError) {
            console.error('❌ Error creating provider:', providerError);
          } else {
            console.log('✅ Provider record created');
          }
        } else {
          console.log('✅ Provider record already exists');
        }
      }
      
      // If it's a patient, create patient record
      if (email === 'patient@tjv.com') {
        const { data: existingPatient, error: patientCheckError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
          
        if (patientCheckError || !existingPatient) {
          console.log('🔧 Creating patient record...');
          
          const patientData = {
            user_id: authUser.id,
            tenant_id: defaultTenantId,
            mrn: 'MRN-' + Date.now(),
            first_name: authUser.user_metadata?.first_name || 'John',
            last_name: authUser.user_metadata?.last_name || 'Smith',
            date_of_birth: '1980-01-01',
            phone: '555-' + Math.floor(1000 + Math.random() * 9000),
            email: authUser.email,
            status: 'active',
            created_at: new Date().toISOString()
          };
          
          const { error: patientError } = await supabase
            .from('patients')
            .insert(patientData);
            
          if (patientError) {
            console.error('❌ Error creating patient:', patientError);
          } else {
            console.log('✅ Patient record created');
          }
        } else {
          console.log('✅ Patient record already exists');
        }
      }
    } else {
      console.log(`\n⚠️  Auth user not found for ${email}`);
    }
  }
  
  // Create some additional test patients
  console.log('\n📋 Creating additional test patients...');
  
  const additionalPatients = [
    { first_name: 'Alice', last_name: 'Johnson', surgery_type: 'TKA' },
    { first_name: 'Bob', last_name: 'Williams', surgery_type: 'THA' },
    { first_name: 'Carol', last_name: 'Davis', surgery_type: 'TSA' }
  ];
  
  for (const patient of additionalPatients) {
    const email = `${patient.first_name.toLowerCase()}.${patient.last_name.toLowerCase()}@example.com`;
    
    // Check if auth user exists
    let authUser = authUsers?.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`\n🔧 Creating auth user for ${email}...`);
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'demo123!',
        email_confirm: true,
        user_metadata: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          role: 'patient',
          tenant_id: defaultTenantId
        }
      });
      
      if (authError) {
        console.error('❌ Error creating auth user:', authError);
        continue;
      }
      
      authUser = newAuthUser.user;
    }
    
    if (authUser) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: `${patient.first_name} ${patient.last_name}`,
          first_name: patient.first_name,
          last_name: patient.last_name,
          role: 'patient',
          tenant_id: defaultTenantId,
          phone: '555-' + Math.floor(1000 + Math.random() * 9000),
          created_at: new Date().toISOString()
        });
        
      if (profileError && profileError.code !== '23505') {
        console.error('❌ Error creating profile:', profileError);
      }
      
      // Create patient record
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authUser.id,
          tenant_id: defaultTenantId,
          mrn: 'MRN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: '1970-' + (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0') + '-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
          phone: '555-' + Math.floor(1000 + Math.random() * 9000),
          email: authUser.email,
          surgery_type: patient.surgery_type,
          surgery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          created_at: new Date().toISOString()
        });
        
      if (patientError && patientError.code !== '23505') {
        console.error('❌ Error creating patient:', patientError);
      } else if (!patientError) {
        console.log(`✅ Created patient: ${patient.first_name} ${patient.last_name}`);
      }
    }
  }
  
  console.log('\n✅ Test data setup complete!');
}

// Run the setup
setupTestData().catch(console.error);