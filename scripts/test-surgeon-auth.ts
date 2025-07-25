import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSurgeonAuth() {
  console.log('Testing authentication with surgeon@tjv.com...')
  
  try {
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'surgeon@tjv.com',
      password: 'demo123!'
    })

    if (authError) {
      console.error('Authentication error:', authError)
      return
    }

    console.log('✅ Authentication successful!')
    console.log('User ID:', authData.user?.id)
    console.log('Email:', authData.user?.email)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user!.id)
      .single()

    if (profileError) {
      console.error('❌ Profile not found:', profileError)
      
      // Create profile if it doesn't exist
      console.log('Creating profile...')
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: authData.user!.email,
          first_name: 'Demo',
          last_name: 'Surgeon',
          role: 'provider',
          tenant_id: 'demo-tenant-001'
        })
      
      if (createError) {
        console.error('Failed to create profile:', createError)
      } else {
        console.log('✅ Profile created successfully!')
      }
    } else {
      console.log('✅ Profile exists:', profile)
    }

    // Check for patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .eq('tenant_id', profile?.tenant_id || 'demo-tenant-001')

    if (patientsError) {
      console.error('Error fetching patients:', patientsError)
    } else {
      console.log(`\n📊 Found ${patients?.length || 0} patients`)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testSurgeonAuth()