import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugPatients() {
  console.log('🔍 Starting patient data debugging...\n')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Check if profiles table exists and has data
    console.log('1️⃣ Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles`)
      if (profiles?.length) {
        console.log('Sample profile:', JSON.stringify(profiles[0], null, 2))
      }
    }

    // 2. Check if patients table exists and has data
    console.log('\n2️⃣ Checking patients table...')
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(5)
    
    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError)
    } else {
      console.log(`✅ Found ${patients?.length || 0} patients`)
      if (patients?.length) {
        console.log('Sample patient:', JSON.stringify(patients[0], null, 2))
      }
    }

    // 3. Check the relationship between patients and profiles
    console.log('\n3️⃣ Checking patient-profile relationship...')
    const { data: joinedData, error: joinError } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!patients_profile_id_fkey(
          id,
          email,
          first_name,
          last_name,
          full_name
        )
      `)
      .limit(5)
    
    if (joinError) {
      console.error('❌ Error with joined query:', joinError)
      
      // Try alternative join
      console.log('\n   Trying alternative join with profile_id...')
      const { data: altJoin, error: altError } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles(
            id,
            email,
            first_name,
            last_name,
            full_name
          )
        `)
        .eq('profile_id', 'profiles.id')
        .limit(5)
      
      if (altError) {
        console.error('❌ Alternative join also failed:', altError)
      } else {
        console.log('✅ Alternative join worked!')
        console.log('Data:', JSON.stringify(altJoin, null, 2))
      }
    } else {
      console.log('✅ Joined query successful!')
      console.log('Sample joined data:', JSON.stringify(joinedData?.[0], null, 2))
    }

    // 4. Check RLS policies
    console.log('\n4️⃣ Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'patients' })
      .single()
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status (function may not exist)')
    } else {
      console.log('RLS Status:', rlsStatus)
    }

    // 5. Check column names in patients table
    console.log('\n5️⃣ Checking patients table schema...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'patients' })
    
    if (columnsError) {
      console.log('⚠️  Could not fetch column info (using raw query)')
      // Try a different approach
      const { data: samplePatient } = await supabase
        .from('patients')
        .select('*')
        .limit(1)
        .single()
      
      if (samplePatient) {
        console.log('Patient columns:', Object.keys(samplePatient))
      }
    } else {
      console.log('Columns:', columns)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the debug script
debugPatients()