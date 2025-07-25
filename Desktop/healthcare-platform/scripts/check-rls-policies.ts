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
  },
  db: {
    schema: 'public'
  }
});

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies...\n');

  // Check if RLS is enabled on patients table
  const { data: tables, error: tablesError } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .eq('schemaname', 'public')
    .eq('tablename', 'patients')
    .single();

  if (tablesError) {
    console.error('❌ Error checking table security:', tablesError);
  } else {
    console.log(`📋 Patients table RLS enabled: ${tables?.rowsecurity || false}`);
  }

  // Check RLS policies
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies_for_table', { table_name: 'patients' });

  if (policiesError) {
    // Try alternative query
    const query = `
      SELECT 
        polname as policy_name,
        polcmd as command,
        pg_get_expr(polqual, polrelid) as using_expression,
        pg_get_expr(polwithcheck, polrelid) as with_check_expression,
        CASE 
          WHEN polroles = '{0}' THEN 'PUBLIC'
          ELSE array_to_string(
            ARRAY(
              SELECT rolname 
              FROM pg_roles 
              WHERE oid = ANY(polroles)
            ), ', '
          )
        END as roles
      FROM pg_policy
      WHERE polrelid = 'patients'::regclass;
    `;
    
    const { data: altPolicies, error: altError } = await supabase.rpc('query_policies', { query_text: query });
    
    if (altError) {
      console.log('⚠️  Could not fetch policies (this is normal if RLS is not enabled)');
    } else {
      console.log('\n📜 RLS Policies on patients table:', altPolicies);
    }
  } else {
    console.log('\n📜 RLS Policies on patients table:', policies);
  }

  // Test query as authenticated user vs service role
  console.log('\n🧪 Testing queries:');
  
  // Service role query (bypasses RLS)
  const { data: serviceData, error: serviceError, count: serviceCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });
    
  if (serviceError) {
    console.error('❌ Service role query error:', serviceError);
  } else {
    console.log(`✅ Service role can see: ${serviceCount} patients`);
  }

  // Try to simulate an authenticated user query
  // Note: This is still using service role, but we can check if there are any filters being applied
  const defaultTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
  const { data: tenantData, error: tenantError, count: tenantCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', defaultTenantId);
    
  if (tenantError) {
    console.error('❌ Tenant-filtered query error:', tenantError);
  } else {
    console.log(`✅ Tenant-filtered query sees: ${tenantCount} patients`);
  }
}

// Run the check
checkRLSPolicies().catch(console.error);