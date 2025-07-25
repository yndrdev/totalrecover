import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test account credentials
const TEST_ACCOUNTS = [
  {
    email: 'test-provider@example.com',
    password: 'TJVDemo2024!',
    metadata: {
      full_name: 'Dr. Michael Chen',
      role: 'provider',
      userType: 'provider'
    }
  },
  {
    email: 'test-preop@example.com',
    password: 'TJVDemo2024!',
    metadata: {
      full_name: 'John Smith',
      role: 'patient',
      userType: 'patient',
      surgeryType: 'Total Knee Replacement',
      phase: 'pre-op'
    }
  },
  {
    email: 'test-postop@example.com',
    password: 'TJVDemo2024!',
    metadata: {
      full_name: 'Sarah Johnson',
      role: 'patient',
      userType: 'patient',
      surgeryType: 'Total Hip Replacement',
      phase: 'post-op'
    }
  }
];

async function createTestAuthAccounts() {
  console.log('🚀 Creating test authentication accounts...\n');

  const createdAccounts = [];

  for (const account of TEST_ACCOUNTS) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === account.email);
      
      if (existingUser) {
        console.log(`Deleting existing account: ${account.email}`);
        await supabase.auth.admin.deleteUser(existingUser.id);
      }

      // Create new auth user
      console.log(`Creating account: ${account.email}`);
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: account.metadata
      });

      if (userError) {
        console.error(`❌ Failed to create ${account.email}:`, userError);
        continue;
      }

      if (userData?.user) {
        createdAccounts.push({
          id: userData.user.id,
          email: account.email,
          password: account.password,
          role: account.metadata.role,
          name: account.metadata.full_name
        });
        console.log(`✅ Created: ${account.email} (ID: ${userData.user.id})`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error);
    }
  }

  console.log('\n========================================');
  console.log('TEST ACCOUNT CREATION SUMMARY');
  console.log('========================================\n');

  if (createdAccounts.length === 0) {
    console.log('❌ No accounts were created successfully.');
    return;
  }

  console.log(`✅ Successfully created ${createdAccounts.length} test accounts:\n`);

  createdAccounts.forEach(acc => {
    console.log(`${acc.role.toUpperCase()} ACCOUNT:`);
    console.log(`  Name: ${acc.name}`);
    console.log(`  Email: ${acc.email}`);
    console.log(`  Password: ${acc.password}`);
    console.log(`  User ID: ${acc.id}`);
    console.log('');
  });

  console.log('========================================\n');

  console.log('📝 NEXT STEPS:');
  console.log('1. These are basic auth accounts without profile/patient records');
  console.log('2. Profile and patient records need to be created separately');
  console.log('3. You can test login functionality with these credentials');
  console.log('4. Run the full setup script once database tables are confirmed\n');

  // Try to check if tables exist
  console.log('🔍 Checking database tables...\n');
  
  const tables = ['tenants', 'users', 'patients', 'providers', 'protocols'];
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}': Not accessible or doesn't exist`);
      } else {
        console.log(`✅ Table '${table}': Exists (${count || 0} records)`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}': Error checking`);
    }
  }

  console.log('\n========================================\n');
}

// Run the script
createTestAuthAccounts().catch(console.error);