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

async function fixProviderPatientAccess() {
  console.log('🚀 Fixing provider-patient access for demo...\n')

  try {
    // 1. Get all providers
    console.log('1️⃣ Fetching all providers...')
    const { data: providers, error: providerError } = await supabase
      .from('providers')
      .select(`
        id,
        profile_id,
        tenant_id,
        profile:profiles!profile_id(
          email,
          first_name,
          last_name
        )
      `)
    
    if (providerError) {
      console.error('Error fetching providers:', providerError)
      return
    }
    
    console.log(`Found ${providers?.length || 0} providers`)
    providers?.forEach(p => {
      console.log(`  - ${p.profile?.email} (${p.profile?.first_name} ${p.profile?.last_name})`)
    })

    // 2. Get all patients
    console.log('\n2️⃣ Fetching all patients...')
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select(`
        id,
        profile_id,
        tenant_id,
        mrn,
        profile:profiles!profile_id(
          email,
          first_name,
          last_name
        )
      `)
    
    if (patientError) {
      console.error('Error fetching patients:', patientError)
      return
    }
    
    console.log(`Found ${patients?.length || 0} patients`)
    patients?.forEach(p => {
      console.log(`  - ${p.profile?.first_name} ${p.profile?.last_name} (MRN: ${p.mrn})`)
    })

    // 3. Clear existing assignments
    console.log('\n3️⃣ Clearing existing provider-patient assignments...')
    const { error: deleteError } = await supabase
      .from('provider_patient_assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error clearing assignments:', deleteError)
    }

    // 4. Create assignments for all providers to all patients
    console.log('\n4️⃣ Creating provider-patient assignments...')
    let assignmentCount = 0
    
    for (const provider of providers || []) {
      for (const patient of patients || []) {
        // Only assign if same tenant
        if (provider.tenant_id === patient.tenant_id) {
          const { error: assignError } = await supabase
            .from('provider_patient_assignments')
            .insert({
              provider_id: provider.id,
              patient_id: patient.id,
              tenant_id: provider.tenant_id,
              assignment_type: 'primary',
              status: 'active',
              assigned_by: provider.profile_id // Self-assigned for demo
            })
          
          if (assignError) {
            console.error(`Failed to assign ${provider.profile?.email} to ${patient.profile?.first_name}:`, assignError.message)
          } else {
            assignmentCount++
          }
        }
      }
    }
    
    console.log(`✅ Created ${assignmentCount} provider-patient assignments`)

    // 5. Create conversations between providers and patients
    console.log('\n5️⃣ Ensuring chat conversations exist...')
    let conversationCount = 0
    
    for (const provider of providers || []) {
      for (const patient of patients || []) {
        if (provider.tenant_id === patient.tenant_id) {
          // Check if conversation already exists
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('provider_id', provider.id)
            .eq('patient_id', patient.id)
            .single()
          
          if (!existingConv) {
            const { error: convError } = await supabase
              .from('conversations')
              .insert({
                tenant_id: provider.tenant_id,
                provider_id: provider.id,
                patient_id: patient.id,
                status: 'active'
              })
            
            if (!convError) {
              conversationCount++
            }
          }
        }
      }
    }
    
    console.log(`✅ Created ${conversationCount} new conversations`)

    // 6. Verify assignments
    console.log('\n6️⃣ Verifying assignments...')
    const { data: verifyData, count } = await supabase
      .from('provider_patient_assignments')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Total assignments in database: ${count}`)

    console.log('\n✨ Provider-patient access fixed successfully!')
    console.log('\n📋 Summary:')
    console.log(`- ${providers?.length || 0} providers can now access`)
    console.log(`- ${patients?.length || 0} patients in their list`)
    console.log(`- All providers have been assigned to all patients in their tenant`)
    console.log('\nProviders should now be able to see all patients at /provider/patients')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixProviderPatientAccess().catch(console.error)