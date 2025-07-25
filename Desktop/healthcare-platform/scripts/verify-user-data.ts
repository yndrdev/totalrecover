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

async function verifyUserData() {
  console.log('🔍 Verifying user data...\n');

  // Check auth users
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  console.log('📋 Auth Users Found:', authUsers?.length || 0);
  
  // Check users table
  const { data: usersTableData, error: usersError } = await supabase
    .from('users')
    .select('*');
    
  if (usersError) {
    console.error('❌ Error fetching users table:', usersError);
  } else {
    console.log('📋 Users Table Records:', usersTableData?.length || 0);
  }

  // Check patients table
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('*');
    
  if (patientsError) {
    console.error('❌ Error fetching patients:', patientsError);
  } else {
    console.log('📋 Patients Records:', patientsData?.length || 0);
  }

  // Check specific test user
  const testEmail = 'surgeon@tjv.com';
  const authUser = authUsers?.find(u => u.email === testEmail);
  
  if (authUser) {
    console.log(`\n✅ Found auth user: ${testEmail} (ID: ${authUser.id})`);
    
    // Check if user exists in users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
      
    if (userError) {
      console.error('❌ User not found in users table:', userError);
      
      // Create missing user record
      console.log('🔧 Creating missing user record...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || 'Dr. Sarah',
          last_name: authUser.user_metadata?.last_name || 'Johnson',
          full_name: `${authUser.user_metadata?.first_name || 'Dr. Sarah'} ${authUser.user_metadata?.last_name || 'Johnson'}`,
          role: authUser.user_metadata?.role || 'provider',
          tenant_id: authUser.user_metadata?.tenant_id || 'c1234567-89ab-cdef-0123-456789abcdef'
        });
        
      if (insertError) {
        console.error('❌ Error creating user record:', insertError);
      } else {
        console.log('✅ User record created successfully');
      }
    } else {
      console.log('✅ User record exists:', userRecord);
    }
  }
  
  // Check for all test users and ensure they have records
  const testEmails = ['surgeon@tjv.com', 'nurse@tjv.com', 'pt@tjv.com', 'patient@tjv.com'];
  
  for (const email of testEmails) {
    const authUser = authUsers?.find(u => u.email === email);
    if (authUser) {
      const { data: userRecord, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error) {
        console.log(`\n⚠️  Missing users table record for ${email}`);
        
        // Create the missing record
        const metadata = authUser.user_metadata;
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            first_name: metadata?.first_name || email.split('@')[0],
            last_name: metadata?.last_name || 'User',
            full_name: `${metadata?.first_name || email.split('@')[0]} ${metadata?.last_name || 'User'}`,
            role: metadata?.role || 'provider',
            tenant_id: metadata?.tenant_id || 'c1234567-89ab-cdef-0123-456789abcdef'
          });
          
        if (insertError) {
          console.error(`❌ Error creating user record for ${email}:`, insertError);
        } else {
          console.log(`✅ Created user record for ${email}`);
        }
      }
    }
  }
}

// Run the verification
verifyUserData().catch(console.error);