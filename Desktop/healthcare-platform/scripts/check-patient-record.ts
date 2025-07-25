import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkPatientRecord() {
  try {
    // First check if Sarah exists
    const { data: userData } = await supabase.auth.admin.listUsers()
    const sarah = userData?.users.find(u => u.email === 'sarah.johnson@email.com')
    
    if (!sarah) {
      console.log('❌ Sarah Johnson user not found')
      return
    }
    
    console.log('✅ Sarah user found:', sarah.id)
    
    // Check patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', sarah.id)
      .single()
      
    if (patientError) {
      console.log('❌ Patient record error:', patientError.message)
      console.log('Full error:', patientError)
      return
    }
    
    console.log('✅ Patient record found:', patient)
    
    // Check if tenant exists
    if (patient?.tenant_id) {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', patient.tenant_id)
        .single()
        
      if (tenantError) {
        console.log('❌ Tenant not found:', tenantError.message)
      } else {
        console.log('✅ Tenant found:', tenant.name)
      }
    }
    
    // Check conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('patient_id', patient?.id)
      
    if (convError) {
      console.log('❌ Conversation error:', convError.message)
    } else {
      console.log(`✅ Found ${conversations?.length || 0} conversations`)
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkPatientRecord()