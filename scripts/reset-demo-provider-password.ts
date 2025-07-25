import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetDemoProviderPassword() {
  console.log('🔧 Resetting Demo Provider Password...\n');

  try {
    // Get the demo provider
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demo@tjv.com')
      .single();

    if (profileError || !profile) {
      console.error('❌ Demo provider not found');
      return;
    }

    console.log('Found demo provider:', {
      id: profile.id,
      email: profile.email,
      name: `${profile.first_name} ${profile.last_name}`,
      role: profile.role
    });

    // Update the password
    const { data, error } = await supabase.auth.admin.updateUserById(
      profile.id,
      { 
        password: 'demo123',
        email_confirm: true
      }
    );

    if (error) {
      console.error('❌ Failed to update password:', error.message);
      return;
    }

    console.log('✅ Password reset successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: demo@tjv.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
resetDemoProviderPassword();