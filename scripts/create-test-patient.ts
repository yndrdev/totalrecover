import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function createTestPatient() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Create a test patient user
  const email = 'sarah.johnson@email.com';
  const password = 'demo123!';
  
  console.log('Creating Sarah Johnson patient account...');
  
  // First, delete existing user if any
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === email);
  
  if (existingUser) {
    console.log('Deleting existing Sarah Johnson account...');
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // Create new user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      userType: 'patient',
      firstName: 'Sarah',
      lastName: 'Johnson'
    }
  });

  if (userError) {
    console.error('Error creating user:', userError);
    return;
  }

  console.log('User created:', userData.user?.id);

  // Get or create tenant
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', tenantId)
    .single();

  if (!existingTenant) {
    await supabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: 'TJV Recovery Demo',
        subdomain: 'default',
        settings: {}
      });
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userData.user!.id,
      user_id: userData.user!.id,
      tenant_id: tenantId,
      email: email,
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'patient',
      full_name: 'Sarah Johnson',
      is_active: true,
      email_verified: true,
      onboarding_completed: true
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    return;
  }

  // Create patient record
  const { error: patientError } = await supabase
    .from('patients')
    .insert({
      user_id: userData.user!.id,
      tenant_id: tenantId,
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '555-0123',
      address: '456 Recovery Lane',
      city: 'Pittsburgh',
      state: 'PA',
      zip_code: '15201',
      date_of_birth: '1985-03-15',
      status: 'active'
    });

  if (patientError) {
    console.error('Error creating patient record:', patientError);
    return;
  }

  console.log(`
Sarah Johnson patient account created successfully!
Email: ${email}
Password: ${password}
`);
}

createTestPatient().catch(console.error);