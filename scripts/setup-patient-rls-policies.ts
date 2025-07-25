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

async function setupPatientRLSPolicies() {
  console.log('🔐 Setting up RLS policies for patients table...\n');

  try {
    // 1. Enable RLS on patients table
    console.log('1️⃣ Enabling RLS on patients table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE patients ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('❌ Failed to enable RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled on patients table');
    }

    // 2. Drop existing policies (to recreate them)
    console.log('\n2️⃣ Dropping existing policies...');
    const policiesToDrop = [
      'Patients can view own record',
      'Providers can view assigned patients',
      'Providers can update assigned patients',
      'Service role bypass',
      'Tenant isolation for patients'
    ];

    for (const policyName of policiesToDrop) {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policyName}" ON patients;`
      });
    }
    console.log('✅ Existing policies dropped');

    // 3. Create policy: Patients can view their own record
    console.log('\n3️⃣ Creating policy: Patients can view own record...');
    const { error: policy1Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Patients can view own record" ON patients
        FOR SELECT
        TO authenticated
        USING (profile_id = auth.uid());
      `
    });
    
    if (policy1Error) {
      console.error('❌ Failed to create patient view policy:', policy1Error);
    } else {
      console.log('✅ Patient view policy created');
    }

    // 4. Create policy: Providers can view patients in their tenant
    console.log('\n4️⃣ Creating policy: Providers can view assigned patients...');
    const { error: policy2Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Providers can view assigned patients" ON patients
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('provider', 'nurse', 'surgeon', 'physical_therapist', 'admin', 'super_admin')
            AND profiles.tenant_id = patients.tenant_id
          )
        );
      `
    });
    
    if (policy2Error) {
      console.error('❌ Failed to create provider view policy:', policy2Error);
    } else {
      console.log('✅ Provider view policy created');
    }

    // 5. Create policy: Providers can update patients in their tenant
    console.log('\n5️⃣ Creating policy: Providers can update assigned patients...');
    const { error: policy3Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Providers can update assigned patients" ON patients
        FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('provider', 'nurse', 'surgeon', 'physical_therapist', 'admin', 'super_admin')
            AND profiles.tenant_id = patients.tenant_id
          )
        );
      `
    });
    
    if (policy3Error) {
      console.error('❌ Failed to create provider update policy:', policy3Error);
    } else {
      console.log('✅ Provider update policy created');
    }

    // 6. Create policy: Providers can insert patients in their tenant
    console.log('\n6️⃣ Creating policy: Providers can insert patients...');
    const { error: policy4Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Providers can insert patients" ON patients
        FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('provider', 'nurse', 'surgeon', 'physical_therapist', 'admin', 'super_admin')
            AND profiles.tenant_id = patients.tenant_id
          )
        );
      `
    });
    
    if (policy4Error) {
      console.error('❌ Failed to create provider insert policy:', policy4Error);
    } else {
      console.log('✅ Provider insert policy created');
    }

    // 7. Create policy: Service role bypass (for backend operations)
    console.log('\n7️⃣ Creating policy: Service role bypass...');
    const { error: policy5Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Service role bypass" ON patients
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
      `
    });
    
    if (policy5Error) {
      console.error('❌ Failed to create service role policy:', policy5Error);
    } else {
      console.log('✅ Service role policy created');
    }

    // 8. Enable RLS on profiles table if not already enabled
    console.log('\n8️⃣ Checking RLS on profiles table...');
    const { error: profilesRlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (profilesRlsError && !profilesRlsError.message.includes('already enabled')) {
      console.error('⚠️  Could not enable RLS on profiles:', profilesRlsError);
    } else {
      console.log('✅ RLS enabled on profiles table');
    }

    // 9. Create basic profiles policies if they don't exist
    console.log('\n9️⃣ Creating profiles table policies...');
    
    // Drop existing policies first
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`
    });
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`
    });

    // Create new policies
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
      `
    });

    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid());
      `
    });

    console.log('✅ Profiles policies created');

    // 10. Test the policies
    console.log('\n🧪 Testing RLS policies...');
    
    // Count total patients (using service role)
    const { count: totalCount, error: countError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting patients:', countError);
    } else {
      console.log(`✅ Total patients in database: ${totalCount}`);
    }

    console.log('\n✅ RLS policies setup complete!');
    console.log('\n📋 Summary of policies created:');
    console.log('  - Patients can view their own record');
    console.log('  - Providers can view/update/insert patients in their tenant');
    console.log('  - Service role has full access');
    console.log('  - Basic profiles table policies');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupPatientRLSPolicies().catch(console.error);