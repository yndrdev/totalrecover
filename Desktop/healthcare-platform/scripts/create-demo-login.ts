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

async function createDemoAccess() {
  console.log('🔧 Setting up demo access for viewing patients...\n');

  const demoEmail = 'demo@tjv.com';
  const demoPassword = 'demo123456';
  const tenantId = 'c1234567-89ab-cdef-0123-456789abcdef';

  try {
    // 1. Check if demo user exists
    console.log('1️⃣ Checking for existing demo user...');
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', demoEmail)
      .single();

    if (existingProfile) {
      console.log('✅ Demo user already exists');
      console.log('📧 Email:', demoEmail);
      console.log('🔑 Password:', demoPassword);
      console.log('🏢 Tenant:', existingProfile.tenant_id);
      console.log('👤 Role:', existingProfile.role);
      return;
    }

    // 2. Create demo user
    console.log('\n2️⃣ Creating demo user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        role: 'provider',
        full_name: 'Demo Provider'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created');

    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: demoEmail,
        first_name: 'Demo',
        last_name: 'Provider',
        role: 'provider',
        tenant_id: tenantId
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created');

    // 4. Create provider record
    const { error: providerError } = await supabase
      .from('providers')
      .insert({
        profile_id: authData.user.id,
        tenant_id: tenantId,
        specialty: 'General Practice',
        credentials: ['MD'],
        is_primary_surgeon: false
      });

    if (providerError) {
      console.error('❌ Error creating provider record:', providerError);
      // Continue anyway - provider record might not be required
    } else {
      console.log('✅ Provider record created');
    }

    console.log('\n🎉 Demo access created successfully!');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    console.log('\n📝 Next steps:');
    console.log('1. Go to http://localhost:3000/auth/signin');
    console.log('2. Sign in with the demo credentials');
    console.log('3. Navigate to /provider/patients or /practice/patients');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the setup
createDemoAccess().catch(console.error);