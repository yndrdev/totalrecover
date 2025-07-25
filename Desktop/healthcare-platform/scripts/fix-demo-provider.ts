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

async function fixDemoProvider() {
  console.log('🔧 Creating provider record for demo user...\n');

  const demoUserId = '7ddef269-aba2-41e6-883e-9e9bdc6b31e0';
  const tenantId = 'c1234567-89ab-cdef-0123-456789abcdef';

  // Check if provider record already exists
  const { data: existing, error: checkError } = await supabase
    .from('providers')
    .select('*')
    .eq('profile_id', demoUserId)
    .single();

  if (existing && !checkError) {
    console.log('✅ Provider record already exists');
    return;
  }

  // Create provider record
  const { data, error } = await supabase
    .from('providers')
    .insert({
      profile_id: demoUserId,
      tenant_id: tenantId,
      specialties: ['General Practice'],
      department: 'Surgery',
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating provider record:', error);
  } else {
    console.log('✅ Provider record created successfully');
    console.log('   Provider ID:', data.id);
  }
}

// Run the fix
fixDemoProvider().catch(console.error);