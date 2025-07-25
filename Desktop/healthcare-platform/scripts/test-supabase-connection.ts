import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 Testing Supabase Connection...\n')
console.log('URL:', supabaseUrl)
console.log('Has Anon Key:', !!supabaseAnonKey)
console.log('Anon Key Length:', supabaseAnonKey?.length)

async function testConnection() {
  try {
    // Test 1: Create client
    console.log('\n1️⃣ Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
    console.log('✅ Client created successfully')

    // Test 2: Simple query
    console.log('\n2️⃣ Testing database connection with simple query...')
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Database query failed:', error.message)
    } else {
      console.log('✅ Database connection successful')
    }

    // Test 3: Auth health check
    console.log('\n3️⃣ Testing auth endpoint...')
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: {
          'apikey': supabaseAnonKey
        }
      })
      console.log('Auth endpoint status:', response.status)
      if (response.ok) {
        console.log('✅ Auth endpoint is healthy')
      } else {
        console.log('❌ Auth endpoint returned:', response.status, response.statusText)
      }
    } catch (fetchError) {
      console.error('❌ Failed to reach auth endpoint:', fetchError)
    }

    // Test 4: Try to sign in with test credentials
    console.log('\n4️⃣ Testing authentication with demo user...')
    const startTime = Date.now()
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'dr.chen@demo.tjv.com',
        password: 'DemoPass123!'
      })
      
      const duration = Date.now() - startTime
      console.log(`Response time: ${duration}ms`)
      
      if (authError) {
        console.error('❌ Authentication failed:', authError.message)
      } else {
        console.log('✅ Authentication successful!')
        console.log('User ID:', authData.user?.id)
        await supabase.auth.signOut()
      }
    } catch (signInError) {
      const duration = Date.now() - startTime
      console.error(`❌ Sign in threw error after ${duration}ms:`, signInError)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run with timeout
const timeout = setTimeout(() => {
  console.error('\n⏱️ Test timed out after 30 seconds!')
  console.error('This suggests a network or configuration issue.')
  process.exit(1)
}, 30000)

testConnection()
  .then(() => {
    clearTimeout(timeout)
    console.log('\n✨ All tests completed')
  })
  .catch((error) => {
    clearTimeout(timeout)
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })