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

async function fixDemoPatientRecords() {
  console.log('🚀 Fixing demo patient records...\n')

  try {
    // Get the demo tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', 'tjv')
      .single()
    
    if (!tenant) {
      console.error('Demo tenant not found!')
      return
    }

    const tenantId = tenant.id
    console.log(`✅ Found demo tenant: ${tenantId}\n`)

    // Check for patient profiles without patient records
    console.log('Checking for patient profiles without patient records...')
    const { data: patientProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .eq('tenant_id', tenantId)

    console.log(`Found ${patientProfiles?.length || 0} patient profiles`)

    for (const profile of patientProfiles || []) {
      // Check if patient record exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', profile.id)
        .single()

      if (!existingPatient) {
        console.log(`Creating patient record for ${profile.email}...`)
        
        const surgeryDate = profile.first_name === 'John'
          ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
          : new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago

        const { error } = await supabase
          .from('patients')
          .insert({
            profile_id: profile.id,
            tenant_id: tenantId,
            mrn: `MRN-DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date_of_birth: profile.first_name === 'John' ? '1960-05-15' : '1955-08-22',
            surgery_date: surgeryDate,
            surgery_type: profile.first_name === 'John' 
              ? 'Total Knee Replacement - Right'
              : 'Total Hip Replacement - Left',
            status: 'active',
            phone_number: profile.phone
          })

        if (error) {
          console.error(`Failed to create patient record for ${profile.email}:`, error.message)
        } else {
          console.log(`✅ Created patient record for ${profile.email}`)
        }
      } else {
        console.log(`Patient record already exists for ${profile.email}`)
      }
    }

    console.log('\n✨ Demo patient records fixed!')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixDemoPatientRecords().catch(console.error)