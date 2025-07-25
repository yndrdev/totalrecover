import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testLaurenLogin() {
  console.log('🔍 Testing login for lauren@email.com...\n');

  // First check if the user exists
  console.log('1️⃣ Checking if user exists in auth.users...');
  const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (usersError) {
    console.error('❌ Error listing users:', usersError);
    return;
  }

  const laurenUser = users.users.find(u => u.email === 'lauren@email.com');
  if (laurenUser) {
    console.log('✅ User found in auth.users');
    console.log('   ID:', laurenUser.id);
    console.log('   Email:', laurenUser.email);
    console.log('   Created:', laurenUser.created_at);
    console.log('   Confirmed:', laurenUser.email_confirmed_at ? 'Yes' : 'No');
  } else {
    console.log('❌ User NOT found in auth.users');
    console.log('\n🔧 Creating user account...');
    
    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'lauren@email.com',
      password: 'Yonder0901!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Lauren',
        last_name: 'User'
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('   ID:', newUser.user.id);
  }

  // Check if profile exists
  console.log('\n2️⃣ Checking if profile exists...');
  const userId = laurenUser?.id || (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === 'lauren@email.com')?.id;
  
  if (userId) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      console.log('✅ Profile found');
      console.log('   Name:', profile.first_name, profile.last_name);
      console.log('   Role:', profile.role);
      console.log('   Tenant:', profile.tenant_id);
    } else {
      console.log('❌ Profile NOT found');
      console.log('\n🔧 Creating profile...');
      
      // Create profile
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: 'lauren@email.com',
          first_name: 'Lauren',
          last_name: 'User',
          role: 'provider', // Assuming provider role
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
        });

      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
      } else {
        console.log('✅ Profile created successfully!');
      }
    }
  }

  // Test the login
  console.log('\n3️⃣ Testing login...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'lauren@email.com',
      password: 'Yonder0901!'
    });

    if (error) {
      console.log('❌ Login failed:', error.message);
      
      // Try to update the password
      console.log('\n🔧 Attempting to reset password...');
      if (userId) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: 'Yonder0901!',
          email_confirm: true
        });

        if (updateError) {
          console.error('❌ Failed to update password:', updateError);
        } else {
          console.log('✅ Password updated successfully!');
        }
      }
    } else if (data.user) {
      console.log('✅ Login successful!');
      console.log('   User ID:', data.user.id);
      console.log('   Email:', data.user.email);
      
      // Sign out after test
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.log('❌ Error during login:', err);
  }

  console.log('\n\n📝 Summary:');
  console.log('Email: lauren@email.com');
  console.log('Password: Yonder0901!');
  console.log('Role: provider (if newly created)');
  console.log('\nYou should now be able to login at /auth/signin?role=provider');
}

// Run the test
testLaurenLogin();