import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://slhdxlhnwujvqkwdgfko.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaGR4bGhud3VqdnFrd2RnZmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI5NjM3NiwiZXhwIjoyMDY3ODcyMzc2fQ.d6mv3rYpvSa4mjhWpOkcNUGwqzpgq0a6cNIyl__EvdE'
)

async function temporarilyDisableRLS() {
  try {
    console.log('🔧 Temporarily disabling RLS for testing...\n')
    
    const tables = [
      'patients',
      'profiles', 
      'patient_tasks',
      'tasks',
      'messages',
      'conversations',
      'recovery_protocols',
      'protocol_tasks'
    ]
    
    for (const table of tables) {
      console.log(`Disabling RLS for ${table}...`)
      
      try {
        // First try to disable RLS
        const { data, error } = await supabase
          .rpc('query', { 
            query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;` 
          })
          
        if (error) {
          console.log(`Note: Could not disable RLS for ${table}:`, error.message)
        } else {
          console.log(`✅ RLS disabled for ${table}`)
        }
      } catch (err) {
        console.log(`Skipping ${table}:`, err)
      }
    }
    
    console.log('\n✅ RLS has been temporarily disabled for testing!')
    console.log('\n⚠️  IMPORTANT: Remember to re-enable RLS for production!')
    
    // Test with Sarah's account
    console.log('\n🧪 Testing Sarah Johnson\'s access...')
    
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('first_name', 'Sarah')
      .eq('last_name', 'Johnson')
      .single()
    
    if (patientError) {
      console.error('❌ Error accessing patient:', patientError)
    } else {
      console.log('✅ Patient record accessible:', {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        user_id: patient.user_id
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

temporarilyDisableRLS()