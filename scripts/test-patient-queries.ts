import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with anon key (like the app would)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPatientQueries() {
  console.log('🔍 Testing patient queries as they would run in the app...\n');

  // 1. Check current user
  console.log('1️⃣ Checking current user...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.log('❌ No authenticated user. Testing with service role...\n');
    
    // Create service client for testing
    const serviceClient = createClient(
      supabaseUrl, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Test the patient service query
    console.log('2️⃣ Testing patient service query pattern...');
    const { data, error, count } = await serviceClient
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
      .range(0, 9);
      
    if (error) {
      console.error('❌ Query error:', error);
    } else {
      console.log('✅ Query successful');
      console.log(`📊 Results: ${data?.length} patients out of ${count} total`);
      if (data && data.length > 0) {
        console.log('\n📋 First patient:', JSON.stringify(data[0], null, 2));
      }
    }
    
    // Check for any tenant issues
    console.log('\n3️⃣ Checking tenant distribution...');
    const tenantGroups: Record<string, number> = {};
    if (data) {
      data.forEach(patient => {
        const tenantId = patient.tenant_id || 'no-tenant';
        tenantGroups[tenantId] = (tenantGroups[tenantId] || 0) + 1;
      });
      console.log('📊 Patients by tenant:', tenantGroups);
    }
    
  } else {
    console.log('✅ Authenticated as:', user.email);
    
    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      console.log('👤 User profile:', {
        role: profile.role,
        tenant_id: profile.tenant_id,
        name: `${profile.first_name} ${profile.last_name}`
      });
    }
    
    // Test the patient query
    console.log('\n2️⃣ Testing patient query...');
    const { data, error, count } = await supabase
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
      .range(0, 9);
      
    if (error) {
      console.error('❌ Query error:', error);
    } else {
      console.log('✅ Query successful');
      console.log(`📊 Results: ${data?.length} patients out of ${count} total`);
    }
  }
  
  // Test with different tenant IDs
  console.log('\n4️⃣ Testing queries with specific tenant filters...');
  const testTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
  
  const serviceClient = createClient(
    supabaseUrl, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const { data: tenantData, count: tenantCount } = await serviceClient
    .from('patients')
    .select('*', { count: 'exact' })
    .eq('tenant_id', testTenantId);
    
  console.log(`📊 Patients in tenant ${testTenantId}: ${tenantCount}`);
  
  // Check if there's a mismatch in foreign key names
  console.log('\n5️⃣ Testing different foreign key patterns...');
  
  // Test 1: Using explicit foreign key name
  const { error: fkError1 } = await serviceClient
    .from('patients')
    .select(`
      *,
      profile:profiles!patients_profile_id_fkey(*)
    `)
    .limit(1);
  console.log('Foreign key "patients_profile_id_fkey":', fkError1 ? '❌ Failed' : '✅ Success');
  
  // Test 2: Using just profile_id
  const { error: fkError2 } = await serviceClient
    .from('patients')
    .select(`
      *,
      profile:profiles!profile_id(*)
    `)
    .limit(1);
  console.log('Foreign key "profile_id":', fkError2 ? '❌ Failed' : '✅ Success');
}

// Run the test
testPatientQueries().catch(console.error);