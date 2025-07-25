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

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables...\n');

  // Query to get all tables
  const { data: tables, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (error) {
    console.error('❌ Error fetching tables:', error);
    
    // Try a different approach - check specific tables
    console.log('\n🔍 Checking specific tables...');
    
    const tablesToCheck = [
      'profiles',
      'users',
      'patients',
      'providers',
      'tenants',
      'practices',
      'protocols',
      'patient_protocols',
      'content_videos',
      'content_forms',
      'content_exercises'
    ];
    
    for (const table of tablesToCheck) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      if (tableError) {
        console.log(`❌ ${table}: Does not exist or no access`);
      } else {
        console.log(`✅ ${table}: Exists`);
      }
    }
  } else {
    console.log('📋 Available tables:');
    tables?.forEach(t => console.log(`  - ${t.tablename}`));
  }
  
  // Check if we should use profiles instead of users
  console.log('\n🔍 Checking profiles table structure...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (!profileError && profile) {
    console.log('✅ Profiles table exists with columns:', Object.keys(profile[0] || {}));
  }
}

// Run the check
checkDatabaseTables().catch(console.error);