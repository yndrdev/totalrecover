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
  { email: 'dr.chen@demo.tjv.com', role: 'surgeon', name: 'Dr. Sarah Chen' },
  { email: 'jane.smith@demo.tjv.com', role: 'nurse', name: 'Jane Smith' },
  { email: 'michael.rodriguez@demo.tjv.com', role: 'physical_therapist', name: 'Michael Rodriguez' },
  { email: 'john.doe@demo.com', role: 'patient', name: 'John Doe' },
  { email: 'mary.johnson@demo.com', role: 'patient', name: 'Mary Johnson' }
]

async function verifyDemoUsers() {
  console.log('🔍 Verifying demo users in Supabase...\n')

  for (const demoUser of demoUsers) {
    console.log(`Checking ${demoUser.name} (${demoUser.email})...`)
    
    try {
      // Check if user exists in auth.users
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error(`  ❌ Error listing users: ${listError.message}`)
        continue
      }

      const authUser = users.find(u => u.email === demoUser.email)
      
      if (authUser) {
        console.log(`  ✅ Found in auth.users (ID: ${authUser.id})`)
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
          
        if (profileError) {
          console.log(`  ⚠️  No profile found: ${profileError.message}`)
        } else {
          console.log(`  ✅ Profile exists (Role: ${profile.role})`)
        }
        
        // Try to authenticate with default password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: demoUser.email,
          password: 'DemoPass123!'
        })
        
        if (authError) {
          console.log(`  ❌ Cannot authenticate: ${authError.message}`)
        } else {
          console.log(`  ✅ Authentication successful!`)
          await supabase.auth.signOut()
        }
      } else {
        console.log(`  ❌ NOT found in auth.users`)
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error: ${error}`)
    }
    
    console.log('')
  }
  
  console.log('\n📊 Summary:')
  console.log('- All demo users should have password: DemoPass123!')
  console.log('- If users are missing, run: npm run seed-demo-data')
  console.log('- If authentication fails, users may need password reset')
}

verifyDemoUsers().catch(console.error)