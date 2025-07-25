import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  { 
    email: 'dr.chen@demo.tjv.com', 
    password: 'DemoPass123!',
    profile: {
      first_name: 'Sarah',
      last_name: 'Chen',
      role: 'provider',
      phone: '+1234567890'
    }
  },
  { 
    email: 'jane.smith@demo.tjv.com', 
    password: 'DemoPass123!',
    profile: {
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'provider',
      phone: '+1234567891'
    }
  },
  { 
    email: 'michael.rodriguez@demo.tjv.com', 
    password: 'DemoPass123!',
    profile: {
      first_name: 'Michael',
      last_name: 'Rodriguez',
      role: 'provider',
      phone: '+1234567892'
    }
  },
  { 
    email: 'john.doe@demo.com', 
    password: 'DemoPass123!',
    profile: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'patient',
      phone: '+1234567893'
    }
  },
  { 
    email: 'mary.johnson@demo.com', 
    password: 'DemoPass123!',
    profile: {
      first_name: 'Mary',
      last_name: 'Johnson',
      role: 'patient',
      phone: '+1234567895'
    }
  }
]

async function createDemoUsers() {
  console.log('🚀 Creating demo users in Supabase...\n')
  
  // First, get or create the demo tenant
  let tenantId: string
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('subdomain', 'tjv')
    .single()
    
  if (existingTenant) {
    tenantId = existingTenant.id
    console.log(`✅ Found existing tenant: ${tenantId}\n`)
  } else {
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Demo Healthcare Practice',
        subdomain: 'tjv',
        settings: {
          features: {
            chat_enabled: true,
            video_calls_enabled: true,
            ai_assistant_enabled: true
          },
          branding: {
            primary_color: '#2563eb',
            logo_url: '/logo.png',
            name: 'TJV Recovery Center'
          }
        }
      })
      .select()
      .single()
      
    if (tenantError || !newTenant) {
      console.error('Failed to create tenant:', tenantError)
      return
    }
    
    tenantId = newTenant.id
    console.log(`✅ Created new tenant: ${tenantId}\n`)
  }

  for (const demoUser of demoUsers) {
    console.log(`Creating ${demoUser.profile.first_name} ${demoUser.profile.last_name} (${demoUser.email})...`)
    
    try {
      // Check if user already exists
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existingUser = users.find(u => u.email === demoUser.email)
      
      let userId: string
      
      if (existingUser) {
        console.log(`  ⚠️  User already exists, updating password...`)
        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: demoUser.password }
        )
        if (updateError) {
          console.error(`  ❌ Failed to update password: ${updateError.message}`)
          continue
        }
        userId = existingUser.id
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: {
            first_name: demoUser.profile.first_name,
            last_name: demoUser.profile.last_name
          }
        })
        
        if (authError || !authData.user) {
          console.error(`  ❌ Failed to create auth user: ${authError?.message}`)
          continue
        }
        
        userId = authData.user.id
        console.log(`  ✅ Created auth user (ID: ${userId})`)
      }
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()
        
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...demoUser.profile,
            tenant_id: tenantId,
            email: demoUser.email
          })
          .eq('id', userId)
          
        if (updateError) {
          console.error(`  ❌ Failed to update profile: ${updateError.message}`)
        } else {
          console.log(`  ✅ Updated profile`)
        }
      } else {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...demoUser.profile,
            tenant_id: tenantId,
            email: demoUser.email
          })
          
        if (profileError) {
          console.error(`  ❌ Failed to create profile: ${profileError.message}`)
        } else {
          console.log(`  ✅ Created profile`)
        }
      }
      
      // For providers, create provider record
      if (demoUser.profile.role === 'provider') {
        const { data: existingProvider } = await supabase
          .from('providers')
          .select('id')
          .eq('profile_id', userId)
          .single()
          
        if (!existingProvider) {
          const specialties = demoUser.profile.first_name === 'Sarah' 
            ? ['Orthopedic Surgery', 'Joint Replacement']
            : demoUser.profile.first_name === 'Jane'
            ? ['Surgical Nursing', 'Patient Care'] 
            : ['Orthopedic Rehabilitation', 'Post-Surgical Recovery']
            
          const department = demoUser.profile.first_name === 'Sarah' 
            ? 'Orthopedics'
            : demoUser.profile.first_name === 'Jane'
            ? 'Nursing'
            : 'Physical Therapy'
            
          const { error: providerError } = await supabase
            .from('providers')
            .insert({
              profile_id: userId,
              tenant_id: tenantId,
              license_number: `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              specialties,
              department
            })
            
          if (providerError) {
            console.error(`  ❌ Failed to create provider record: ${providerError.message}`)
          } else {
            console.log(`  ✅ Created provider record`)
          }
        }
      }
      
      // For patients, create patient record
      if (demoUser.profile.role === 'patient') {
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', userId)
          .single()
          
        if (!existingPatient) {
          const surgeryDate = demoUser.profile.first_name === 'John'
            ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
            : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            
          const { error: patientError } = await supabase
            .from('patients')
            .insert({
              profile_id: userId,
              tenant_id: tenantId,
              mrn: `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              date_of_birth: demoUser.profile.first_name === 'John' ? '1960-05-15' : '1955-08-22',
              surgery_date: surgeryDate,
              surgery_type: demoUser.profile.first_name === 'John' 
                ? 'Total Knee Replacement - Right'
                : 'Total Hip Replacement - Left',
              patient_type: demoUser.profile.first_name === 'John' ? 'preop' : 'postop',
              status: 'active'
            })
            
          if (patientError) {
            console.error(`  ❌ Failed to create patient record: ${patientError.message}`)
          } else {
            console.log(`  ✅ Created patient record`)
          }
        }
      }
      
      console.log(`  ✅ User setup complete!\n`)
    } catch (error) {
      console.error(`  ❌ Unexpected error: ${error}\n`)
    }
  }
  
  console.log('\n✨ Demo user creation complete!')
  console.log('\n📋 Demo Credentials:')
  console.log('Provider accounts:')
  console.log('  - dr.chen@demo.tjv.com / DemoPass123!')
  console.log('  - jane.smith@demo.tjv.com / DemoPass123!')
  console.log('  - michael.rodriguez@demo.tjv.com / DemoPass123!')
  console.log('\nPatient accounts:')
  console.log('  - john.doe@demo.com / DemoPass123! (Pre-op)')
  console.log('  - mary.johnson@demo.com / DemoPass123! (Post-op)')
}

createDemoUsers().catch(console.error)