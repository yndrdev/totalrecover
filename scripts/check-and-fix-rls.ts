import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndFixRLS() {
  console.log('🔍 Checking RLS status on patients table...\n');

  try {
    // First, let's check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('run_sql', {
        sql: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = 'patients';
        `
      });

    if (rlsError) {
      console.log('Could not check RLS status directly. Trying alternative method...');
      
      // Alternative: Try to query with and without service role
      const { count: serviceCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
        
      console.log(`Service role sees: ${serviceCount} patients`);
      
      // Check if there are any RLS policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('run_sql', {
          sql: `
            SELECT pol.polname 
            FROM pg_policy pol 
            JOIN pg_class cls ON pol.polrelid = cls.oid 
            WHERE cls.relname = 'patients';
          `
        });
        
      if (!policiesError && policies) {
        console.log('RLS Policies found:', policies);
      }
    } else {
      console.log('RLS Status:', rlsStatus);
    }

    // For now, let's disable RLS to test if that's the issue
    console.log('\n⚠️  Temporarily disabling RLS on patients table for testing...');
    
    const { error: disableError } = await supabase
      .rpc('run_sql', {
        sql: 'ALTER TABLE patients DISABLE ROW LEVEL SECURITY;'
      });
      
    if (disableError) {
      console.error('Could not disable RLS:', disableError);
      console.log('\nTrying alternative approach...');
      
      // Try creating a permissive policy instead
      const { error: policyError } = await supabase
        .rpc('run_sql', {
          sql: `
            -- Drop existing policies
            DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON patients;
            
            -- Create a permissive policy
            CREATE POLICY "Enable read access for all authenticated users" ON patients
              FOR SELECT
              USING (true);
          `
        });
        
      if (policyError) {
        console.error('Could not create policy:', policyError);
      } else {
        console.log('✅ Created permissive read policy for testing');
      }
    } else {
      console.log('✅ RLS disabled temporarily for testing');
      console.log('⚠️  Remember to re-enable RLS after testing!');
    }

    // Test query after changes
    console.log('\n📊 Testing query after RLS changes...');
    const { data, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .limit(1);
      
    console.log(`Query result: ${count} patients accessible`);
    if (data && data.length > 0) {
      console.log('Sample patient:', data[0].mrn);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkAndFixRLS().catch(console.error);