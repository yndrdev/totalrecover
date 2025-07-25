import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔍 Testing Authentication Flow...\n');
console.log('Environment:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Has Anon Key:', !!supabaseAnonKey);
console.log('- Key Length:', supabaseAnonKey?.length);

// Create client similar to browser
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBrowserAuth() {
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
    } else {
      console.log('✅ Connection successful');
    }

    // Test 2: Sign in
    console.log('\n2️⃣ Testing sign in with lauren@email.com...');
    const startTime = Date.now();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lauren@email.com',
      password: 'Yonder0901!'
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Sign in took ${duration}ms`);

    if (authError) {
      console.error('❌ Sign in failed:', {
        message: authError.message,
        status: authError.status,
        code: authError.code
      });
    } else if (authData.user) {
      console.log('✅ Sign in successful!');
      console.log('   User ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      console.log('   Session:', !!authData.session);
      console.log('   Access Token:', authData.session?.access_token?.substring(0, 20) + '...');
    }

    // Test 3: Get session
    console.log('\n3️⃣ Testing getSession...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Get session failed:', sessionError);
    } else {
      console.log('✅ Session retrieved:', !!session);
    }

    // Test 4: Sign out
    console.log('\n4️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError);
    } else {
      console.log('✅ Signed out successfully');
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the test
testBrowserAuth();