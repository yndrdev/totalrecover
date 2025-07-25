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

const testUsers = [
  {
    email: 'surgeon@tjv.com',
    password: 'demo123!',
    metadata: {
      role: 'provider',
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      tenant_id: defaultTenantId,
      provider_role: 'Surgeon'
    }
  },
  {
    email: 'nurse@tjv.com',
    password: 'demo123!',
    metadata: {
      role: 'provider',
      first_name: 'Nancy',
      last_name: 'Williams',
      tenant_id: defaultTenantId,
      provider_role: 'Nurse'
    }
  },
  {
    email: 'pt@tjv.com',
    password: 'demo123!',
    metadata: {
      role: 'provider',
      first_name: 'Mike',
      last_name: 'Thompson',
      tenant_id: defaultTenantId,
      provider_role: 'Physical Therapist'
    }
  },
  {
    email: 'patient@tjv.com',
    password: 'demo123!',
    metadata: {
      role: 'patient',
      first_name: 'John',
      last_name: 'Smith',
      tenant_id: defaultTenantId
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  for (const user of testUsers) {
    try {
      // Create user using Supabase auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
        continue;
      }

      console.log(`✅ Created ${user.email}`);

      // Create provider record if it's a provider
      if (user.metadata.role === 'provider' && data.user) {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            profile_id: data.user.id,
            tenant_id: defaultTenantId,
            department: user.metadata.provider_role,
            is_active: true
          });

        if (providerError) {
          console.error(`   ⚠️  Error creating provider record:`, providerError.message);
        } else {
          console.log(`   ✅ Created provider record`);
        }
      }

      // Create patient record if it's a patient
      if (user.metadata.role === 'patient' && data.user) {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            profile_id: data.user.id,
            tenant_id: defaultTenantId,
            mrn: 'MRN123456',
            surgery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            surgery_type: 'TKA',
            phone_number: '5551234567',
            status: 'active'
          });

        if (patientError) {
          console.error(`   ⚠️  Error creating patient record:`, patientError.message);
        } else {
          console.log(`   ✅ Created patient record`);
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating ${user.email}:`, err);
    }
  }

  console.log('\n✅ Test user creation complete!');
  console.log('\n📝 Test Accounts:');
  console.log('- Surgeon: surgeon@tjv.com / demo123!');
  console.log('- Nurse: nurse@tjv.com / demo123!');
  console.log('- Physical Therapist: pt@tjv.com / demo123!');
  console.log('- Patient: patient@tjv.com / demo123!');
}

// Run the script
createTestUsers().catch(console.error);