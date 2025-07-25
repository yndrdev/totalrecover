#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to manage test users in Supabase
 * This will check for existing test users or create them
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test users data
const testUsers = [
  {
    email: 'sarah.johnson@example.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'patient'
    }
  },
  {
    email: 'michael.chen@example.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'Michael',
      last_name: 'Chen',
      role: 'patient'
    }
  },
  {
    email: 'emily.rodriguez@example.com',
    password: 'testpass123',
    user_metadata: {
      first_name: 'Emily',
      last_name: 'Rodriguez',
      role: 'patient'
    }
  }
];

async function checkAndCreateUsers() {
  console.log('🔍 Checking for existing test users...\n');

  for (const userData of testUsers) {
    try {
      // Check if user exists
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`❌ Error listing users:`, listError.message);
        continue;
      }
      
      const existingUser = users.find(user => user.email === userData.email);
      
      if (existingUser) {
        console.log(`✅ User already exists: ${userData.email}`);
        console.log(`   ID: ${existingUser.id}`);
      } else {
        // Create user
        console.log(`📝 Creating user: ${userData.email}`);
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: userData.user_metadata
        });

        if (error) {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        } else {
          console.log(`✅ User created: ${userData.email}`);
          console.log(`   ID: ${newUser.user.id}`);
          
          // Create profile entry if needed
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: newUser.user.id,
              user_id: newUser.user.id,
              tenant_id: 'default',
              first_name: userData.user_metadata.first_name,
              last_name: userData.user_metadata.last_name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (profileError) {
            console.error(`   ⚠️  Profile creation failed:`, profileError.message);
          } else {
            console.log(`   ✅ Profile created`);
          }
        }
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Test user management complete!');
  console.log('\nYou can now log in with:');
  testUsers.forEach(user => {
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${user.password}`);
    console.log('---');
  });
}

// Run the script
checkAndCreateUsers().catch(console.error);