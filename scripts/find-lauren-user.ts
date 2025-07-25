import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findLaurenUser() {
  console.log('🔍 Searching for lauren@email.com...\n');

  try {
    // Search in profiles table
    console.log('1️⃣ Searching in profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'lauren@email.com');

    if (profiles && profiles.length > 0) {
      console.log('✅ Found in profiles:');
      profiles.forEach(profile => {
        console.log('   ID:', profile.id);
        console.log('   Name:', profile.first_name, profile.last_name);
        console.log('   Role:', profile.role);
        console.log('   Tenant:', profile.tenant_id);
        console.log('   Created:', profile.created_at);
      });

      // Now update the password for this user
      const userId = profiles[0].id;
      console.log('\n2️⃣ Updating password...');
      
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: 'Yonder0901!',
        email_confirm: true
      });

      if (updateError) {
        console.error('❌ Failed to update password:', updateError.message);
      } else {
        console.log('✅ Password updated successfully!');
      }

    } else {
      console.log('❌ Not found in profiles table');
      
      // Try to find by searching all users
      console.log('\n2️⃣ Searching through all auth users...');
      let page = 1;
      let found = false;
      
      while (!found) {
        const { data: users, error } = await supabase.auth.admin.listUsers({
          page: page,
          perPage: 50
        });

        if (error || !users.users || users.users.length === 0) break;

        const laurenUser = users.users.find(u => u.email === 'lauren@email.com');
        if (laurenUser) {
          console.log('✅ Found in auth.users:');
          console.log('   ID:', laurenUser.id);
          console.log('   Email:', laurenUser.email);
          console.log('   Created:', laurenUser.created_at);
          
          // Create profile if missing
          console.log('\n3️⃣ Creating profile...');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: laurenUser.id,
              email: 'lauren@email.com',
              first_name: 'Lauren',
              last_name: 'User',
              role: 'provider',
              tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
            });

          if (createError) {
            console.error('❌ Error creating profile:', createError.message);
          } else {
            console.log('✅ Profile created!');
          }

          // Update password
          console.log('\n4️⃣ Updating password...');
          const { error: updateError } = await supabase.auth.admin.updateUserById(laurenUser.id, {
            password: 'Yonder0901!',
            email_confirm: true
          });

          if (updateError) {
            console.error('❌ Failed to update password:', updateError.message);
          } else {
            console.log('✅ Password updated!');
          }
          
          found = true;
          break;
        }
        
        page++;
        if (page > 10) break; // Safety limit
      }

      if (!found) {
        console.log('❌ User not found in auth.users either');
      }
    }

    // Test the login
    console.log('\n5️⃣ Testing login with regular client...');
    const regularClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: loginData, error: loginError } = await regularClient.auth.signInWithPassword({
      email: 'lauren@email.com',
      password: 'Yonder0901!'
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
      console.log('   Error code:', loginError.code);
      console.log('   Status:', loginError.status);
    } else if (loginData.user) {
      console.log('✅ Login test successful!');
      console.log('   User ID:', loginData.user.id);
      await regularClient.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the search
findLaurenUser();