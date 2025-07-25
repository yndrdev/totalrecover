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

async function testPatientProfiles() {
  console.log('🔍 Testing patient profile joins...\n')

  try {
    // Test 1: Try with explicit foreign key name
    console.log('1️⃣ Testing with patients_profile_id_fkey...')
    try {
      const { data: test1, error: error1 } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!patients_profile_id_fkey(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .limit(3)
      
      if (error1) {
        console.log('❌ Failed:', error1.message)
      } else {
        console.log('✅ Success! First patient:', test1?.[0])
      }
    } catch (e) {
      console.log('❌ Exception:', e)
    }

    // Test 2: Try with just profile_id
    console.log('\n2️⃣ Testing with profile_id...')
    try {
      const { data: test2, error: error2 } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles!profile_id(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .limit(3)
      
      if (error2) {
        console.log('❌ Failed:', error2.message)
      } else {
        console.log('✅ Success! First patient:', test2?.[0])
      }
    } catch (e) {
      console.log('❌ Exception:', e)
    }

    // Test 3: Get profiles separately and match
    console.log('\n3️⃣ Manual join approach...')
    const { data: patients } = await supabase
      .from('patients')
      .select('*')
      .limit(3)
    
    console.log('Patients found:', patients?.length)
    
    if (patients && patients.length > 0) {
      const profileIds = patients.map(p => p.profile_id).filter(Boolean)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds)
      
      console.log('Profiles found:', profiles?.length)
      console.log('First profile:', profiles?.[0])
      
      // Match them up
      const patientsWithProfiles = patients.map(patient => {
        const profile = profiles?.find(p => p.id === patient.profile_id)
        return { ...patient, profile }
      })
      
      console.log('\nFirst patient with profile:')
      console.log('Name:', patientsWithProfiles[0]?.profile?.first_name, patientsWithProfiles[0]?.profile?.last_name)
      console.log('Email:', patientsWithProfiles[0]?.profile?.email)
    }

    // Test 4: Check if profiles table has the expected columns
    console.log('\n4️⃣ Checking profiles table structure...')
    const { data: profileSample } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profileSample && profileSample[0]) {
      console.log('Profile columns:', Object.keys(profileSample[0]))
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testPatientProfiles().catch(console.error)