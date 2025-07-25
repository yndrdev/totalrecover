import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function reenableRLS() {
  try {
    console.log('Re-enabling RLS for all tables...')
    
    const tables = [
      'profiles',
      'patients', 
      'conversations',
      'messages',
      'tasks',
      'patient_tasks',
      'recovery_protocols',
      'user_profiles',
      'practices',
      'providers'
    ]

    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      })
      
      if (error) {
        console.error(`Error enabling RLS for ${table}:`, error)
      } else {
        console.log(`✓ Enabled RLS for ${table}`)
      }
    }

    console.log('\nRLS re-enabled successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

reenableRLS()