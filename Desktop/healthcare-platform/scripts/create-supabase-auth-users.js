// Create Supabase Auth Users for Demo Accounts
// Run this with: node scripts/create-supabase-auth-users.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create admin client (can create users)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  {
    id: 'patient-sarah-001',
    email: 'sarah.johnson@tjvdemo.com',
    password: 'DemoPass123!',
    user_metadata: {
      role: 'patient',
      first_name: 'Sarah',
      last_name: 'Johnson',
      full_name: 'Sarah Johnson',
      tenant_id: 'demo-tenant-001'
    },
    email_confirm: true
  },
  {
    id: 'provider-drsmith-001', 
    email: 'dr.smith@tjvdemo.com',
    password: 'DemoPass123!',
    user_metadata: {
      role: 'provider',
      first_name: 'Michael',
      last_name: 'Smith', 
      full_name: 'Dr. Michael Smith',
      tenant_id: 'demo-tenant-001',
      department: 'Orthopedic Surgery'
    },
    email_confirm: true
  },
  {
    id: 'provider-mikechen-001',
    email: 'mike.chen@tjvdemo.com', 
    password: 'DemoPass123!',
    user_metadata: {
      role: 'provider',
      first_name: 'Mike',
      last_name: 'Chen',
      full_name: 'Mike Chen, PT', 
      tenant_id: 'demo-tenant-001',
      department: 'Physical Therapy'
    },
    email_confirm: true
  },
  {
    id: 'admin-demo-001',
    email: 'admin@tjvdemo.com',
    password: 'DemoPass123!',
    user_metadata: {
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
      tenant_id: 'demo-tenant-001'
    },
    email_confirm: true
  }
]

async function createDemoUsers() {
  console.log('🚀 Creating demo users in Supabase Auth...\n')
  
  for (const userData of demoUsers) {
    try {
      console.log(`Creating user: ${userData.email}`)
      
      // Create the auth user with specific ID
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: userData.email_confirm,
        user_id: userData.id // This ensures the auth.users.id matches our profiles.id
      })

      if (error) {
        // If user already exists, try to update instead
        if (error.message.includes('already registered')) {
          console.log(`  ⚠️  User already exists, attempting to update...`)
          
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            userData.id,
            {
              password: userData.password,
              user_metadata: userData.user_metadata,
              email_confirm: true
            }
          )
          
          if (updateError) {
            console.error(`  ❌ Failed to update user: ${updateError.message}`)
          } else {
            console.log(`  ✅ Updated user: ${userData.email}`)
          }
        } else {
          console.error(`  ❌ Failed to create user: ${error.message}`)
        }
      } else {
        console.log(`  ✅ Created user: ${userData.email}`)
        
        // Also update the profile to ensure consistency
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userData.id,
            user_id: userData.id, // Add user_id field
            tenant_id: userData.user_metadata.tenant_id,
            email: userData.email,
            first_name: userData.user_metadata.first_name,
            last_name: userData.user_metadata.last_name, 
            full_name: userData.user_metadata.full_name,
            role: userData.user_metadata.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.error(`  ⚠️  Profile sync warning: ${profileError.message}`)
        } else {
          console.log(`  ✅ Profile synced`)
        }
      }
      
    } catch (err) {
      console.error(`  ❌ Unexpected error creating ${userData.email}:`, err.message)
    }
    
    console.log() // Empty line for readability
  }
  
  console.log('🎉 Demo user creation complete!')
  console.log('\n📋 Demo Login Credentials:')
  console.log('================================')
  demoUsers.forEach(user => {
    console.log(`${user.user_metadata.role.toUpperCase()}: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Role: ${user.user_metadata.role}`)
    console.log('---')
  })
  
  console.log('\n🌐 Login at: http://localhost:3000/login')
  console.log('\n💡 Patient Chat URL: http://localhost:3000/chat')
  console.log('💡 Provider Dashboard: http://localhost:3000/provider')
  console.log('💡 Admin Dashboard: http://localhost:3000/admin')
}

// Run the script
createDemoUsers().catch(console.error)