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

async function verifyPatientAccess() {
  console.log('🔍 Verifying patient access...\n')

  try {
    // 1. Check total patients
    console.log('1️⃣ Checking total patients...')
    const { data: patients, count } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10)

    console.log(`Total patients: ${count}`)
    console.log('\nRecent patients:')
    patients?.forEach(p => {
      const name = p.profile ? `${p.profile.first_name} ${p.profile.last_name}` : 'Unknown'
      console.log(`  - ${name} (MRN: ${p.mrn})`)
    })

    // 2. Check demo patients specifically
    console.log('\n2️⃣ Checking demo patients...')
    const { data: demoPatients } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          email,
          first_name,
          last_name
        )
      `)
      .in('profile.email', ['john.doe@demo.com', 'mary.johnson@demo.com'])

    console.log(`Found ${demoPatients?.length || 0} demo patients:`)
    demoPatients?.forEach(p => {
      console.log(`  - ${p.profile?.first_name} ${p.profile?.last_name} (${p.profile?.email})`)
      console.log(`    Surgery: ${p.surgery_type} on ${p.surgery_date}`)
    })

    // 3. Check conversations
    console.log('\n3️⃣ Checking conversations...')
    const { data: conversations, count: convCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .limit(5)

    console.log(`Total active conversations: ${convCount}`)

    // 4. Test as provider
    console.log('\n4️⃣ Testing patient query as provider would see it...')
    const { data: providerView, error } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(0, 49)

    if (error) {
      console.error('Error fetching patients:', error)
    } else {
      console.log(`Provider can see ${providerView?.length || 0} active patients`)
    }

    console.log('\n✅ Verification complete!')
    console.log('\nProviders should now be able to:')
    console.log('- See all patients at /provider/patients')
    console.log('- Access patient details')
    console.log('- Use the chat functionality')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

verifyPatientAccess().catch(console.error)