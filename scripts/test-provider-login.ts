import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProviderLogin() {
  console.log('🔍 Testing Provider Login...\n');

  const testCredentials = [
    { email: 'demo@tjv.com', password: 'demo123', name: 'Demo Provider' },
    { email: 'provider@tjv.com', password: 'provider123', name: 'Test Provider' },
    { email: 'surgeon@tjv.com', password: 'surgeon123', name: 'Dr. Sarah Johnson' }
  ];

  for (const creds of testCredentials) {
    console.log(`\nTesting login for ${creds.name} (${creds.email})...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });

      if (error) {
        console.log(`❌ Failed: ${error.message}`);
      } else if (data.user) {
        console.log(`✅ Success! User ID: ${data.user.id}`);
        
        // Get profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profile) {
          console.log(`   Role: ${profile.role}`);
          console.log(`   Tenant: ${profile.tenant_id}`);
        }
        
        // Sign out after test
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ Error: ${err}`);
    }
  }

  console.log('\n\n📝 If all logins failed, you may need to reset the passwords.');
  console.log('Use the script: npx tsx scripts/setup-provider-account.ts');
}

// Run the test
testProviderLogin();