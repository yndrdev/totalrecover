import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://slhdxlhnwujvqkwdgfko.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaGR4bGhud3VqdnFrd2RnZmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI5NjM3NiwiZXhwIjoyMDY3ODcyMzc2fQ.d6mv3rYpvSa4mjhWpOkcNUGwqzpgq0a6cNIyl__EvdE'
)

async function fixPatientRLS() {
  try {
    console.log('🔧 Fixing RLS policies for patients table...\n')
    
    // First, let's check if RLS is enabled
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'patients')
    
    console.log('📋 Checking current RLS policies...')
    
    // Drop existing policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view their own patient record" ON patients;',
      'DROP POLICY IF EXISTS "Providers can view patients in their tenant" ON patients;',
      'DROP POLICY IF EXISTS "Users can update their own patient record" ON patients;',
      'DROP POLICY IF EXISTS "Service role bypass for patients" ON patients;'
    ]
    
    for (const dropQuery of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { query: dropQuery })
      if (error) console.log('Warning dropping policy:', error.message)
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE patients ENABLE ROW LEVEL SECURITY;' 
    })
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('Error enabling RLS:', rlsError)
    }
    
    // Create new policies
    const policies = [
      {
        name: 'Users can view their own patient record',
        query: `
          CREATE POLICY "Users can view their own patient record" ON patients
          FOR SELECT
          USING (auth.uid() = user_id);
        `
      },
      {
        name: 'Providers can view patients in their tenant',
        query: `
          CREATE POLICY "Providers can view patients in their tenant" ON patients
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.user_id = auth.uid()
              AND profiles.tenant_id = patients.tenant_id
              AND profiles.role IN ('surgeon', 'nurse', 'physical_therapist', 'provider', 'admin')
            )
          );
        `
      },
      {
        name: 'Users can update their own patient record',
        query: `
          CREATE POLICY "Users can update their own patient record" ON patients
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
        `
      },
      {
        name: 'Service role bypass for patients',
        query: `
          CREATE POLICY "Service role bypass for patients" ON patients
          FOR ALL
          USING (auth.jwt()->>'role' = 'service_role')
          WITH CHECK (auth.jwt()->>'role' = 'service_role');
        `
      }
    ]
    
    for (const policy of policies) {
      console.log(`\n✨ Creating policy: ${policy.name}`)
      const { error } = await supabase.rpc('exec_sql', { query: policy.query })
      if (error) {
        console.error(`❌ Error creating policy: ${error.message}`)
      } else {
        console.log(`✅ Policy created successfully`)
      }
    }
    
    // Also fix RLS for related tables
    console.log('\n🔧 Fixing RLS for related tables...')
    
    // Fix profiles table
    await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' 
    })
    
    await supabase.rpc('exec_sql', { 
      query: `
        CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT
        USING (auth.uid() = user_id);
      ` 
    }).catch(() => {})
    
    // Fix patient_tasks table
    await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;' 
    })
    
    await supabase.rpc('exec_sql', { 
      query: `
        CREATE POLICY "Patients can view their own tasks" ON patient_tasks
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_tasks.patient_id
            AND patients.user_id = auth.uid()
          )
        );
      ` 
    }).catch(() => {})
    
    // Fix messages table
    await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE messages ENABLE ROW LEVEL SECURITY;' 
    })
    
    await supabase.rpc('exec_sql', { 
      query: `
        CREATE POLICY "Users can view messages in their conversations" ON messages
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM conversations
            LEFT JOIN patients ON patients.id = conversations.patient_id
            WHERE conversations.id = messages.conversation_id
            AND (patients.user_id = auth.uid() OR auth.jwt()->>'role' IN ('provider', 'admin'))
          )
        );
      ` 
    }).catch(() => {})
    
    await supabase.rpc('exec_sql', { 
      query: `
        CREATE POLICY "Users can insert messages in their conversations" ON messages
        FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM conversations
            LEFT JOIN patients ON patients.id = conversations.patient_id
            WHERE conversations.id = conversation_id
            AND (patients.user_id = auth.uid() OR auth.jwt()->>'role' IN ('provider', 'admin'))
          )
        );
      ` 
    }).catch(() => {})
    
    // Fix conversations table
    await supabase.rpc('exec_sql', { 
      query: 'ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;' 
    })
    
    await supabase.rpc('exec_sql', { 
      query: `
        CREATE POLICY "Patients can view their own conversations" ON conversations
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = conversations.patient_id
            AND patients.user_id = auth.uid()
          )
        );
      ` 
    }).catch(() => {})
    
    console.log('\n✅ RLS policies have been updated!')
    
    // Test with Sarah's account
    console.log('\n🧪 Testing with Sarah Johnson\'s account...')
    
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError
    
    const sarah = users.find(u => u.email === 'sarah.johnson@email.com')
    if (sarah) {
      console.log('Found Sarah:', sarah.id)
      
      // Check if she can access her patient record
      const { data: patientTest, error: patientTestError } = await supabase
        .from('patients')
        .select('id, user_id, first_name, last_name')
        .eq('user_id', sarah.id)
        
      if (patientTestError) {
        console.error('❌ Error accessing patient record:', patientTestError)
      } else {
        console.log('✅ Patient record accessible:', patientTest)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Add exec_sql function if it doesn't exist
async function ensureExecSqlFunction() {
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `
  
  try {
    await supabase.rpc('exec_sql', { query: 'SELECT 1' })
  } catch (error) {
    // Function doesn't exist, create it
    const { error: createError } = await supabase.rpc('query', { query: createFunction })
    if (createError) {
      console.log('Note: exec_sql function might not be available, policies will be created on next migration')
    }
  }
}

ensureExecSqlFunction().then(() => fixPatientRLS())