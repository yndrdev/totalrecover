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

async function setupProviderAccount() {
  console.log('🔍 Setting up provider account...\n');

  const email = 'provider@tjv.com';
  const password = 'test123';

  // Check if user exists in auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    console.log(`✅ Auth user already exists: ${email}`);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', existingUser.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
    } else if (!profile) {
      console.log('⚠️  No profile found, creating one...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: existingUser.id,
          email: email,
          first_name: 'Test',
          last_name: 'Provider',
          role: 'provider',
          tenant_id: defaultTenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
      } else {
        console.log('✅ Profile created successfully');
      }
    } else {
      console.log('✅ Profile exists:', profile);
    }
  } else {
    console.log(`📝 Creating new provider account: ${email}`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }
    
    console.log('✅ Auth user created');
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        email: email,
        first_name: 'Test',
        last_name: 'Provider',
        role: 'provider',
        tenant_id: defaultTenantId
      });
      
    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
    } else {
      console.log('✅ Profile created successfully');
    }
  }
  
  console.log('\n📊 Account Summary:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Tenant ID: ${defaultTenantId}`);
  
  // Verify we can query patients with this tenant
  console.log('\n🔍 Testing patient query with tenant ID...');
  const { data: patients, error: patientError, count } = await supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .eq('tenant_id', defaultTenantId);
    
  if (patientError) {
    console.error('❌ Error querying patients:', patientError);
  } else {
    console.log(`✅ Found ${count} patients in tenant ${defaultTenantId}`);
  }
}

// Run the setup
setupProviderAccount().catch(console.error);