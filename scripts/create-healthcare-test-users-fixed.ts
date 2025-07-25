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

// Use actual tenant ID from the database
const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

interface TestUser {
  email: string;
  password: string;
  metadata: {
    role: string;
    first_name: string;
    last_name: string;
    tenant_id: string;
    provider_role?: string;
  };
  additionalData?: any;
}

const testUsers: TestUser[] = [
  // Pre-op patient (surgery scheduled in future)
  {
    email: 'preop.patient@healthcare-test.com',
    password: 'TestPatient123!',
    metadata: {
      role: 'patient',
      first_name: 'Emily',
      last_name: 'Thompson',
      tenant_id: DEFAULT_TENANT_ID
    },
    additionalData: {
      mrn: 'MRN-PRE-001',
      surgery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      surgery_type: 'Total Knee Replacement',
      status: 'pre-operative',
      date_of_birth: '1975-03-15',
      emergency_contact: {
        name: 'John Thompson',
        phone: '+15551234101',
        relationship: 'Spouse'
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield',
        policy_number: 'BC123456789'
      },
      notes: 'Pre-operative patient scheduled for TKR in 2 weeks',
      current_recovery_day: -14,
      activity_level: 'active'
    }
  },
  // Post-op patient (surgery completed)
  {
    email: 'postop.patient@healthcare-test.com',
    password: 'TestPatient123!',
    metadata: {
      role: 'patient',
      first_name: 'Robert',
      last_name: 'Johnson',
      tenant_id: DEFAULT_TENANT_ID
    },
    additionalData: {
      mrn: 'MRN-POST-001',
      surgery_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      surgery_type: 'Total Hip Replacement',
      status: 'post-operative',
      date_of_birth: '1968-08-22',
      emergency_contact: {
        name: 'Sarah Johnson',
        phone: '+15551234102',
        relationship: 'Spouse'
      },
      insurance_info: {
        provider: 'Aetna',
        policy_number: 'AET987654321'
      },
      notes: 'Post-operative patient, 30 days post THR, progressing well',
      current_recovery_day: 30,
      activity_level: 'active'
    }
  },
  // Surgeon (provider role)
  {
    email: 'surgeon@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'surgeon',
      first_name: 'Dr. Michael',
      last_name: 'Chen',
      tenant_id: DEFAULT_TENANT_ID,
      provider_role: 'Surgeon'
    },
    additionalData: {
      department: 'Orthopedic Surgery',
      specialization: 'Joint Replacement',
      license_number: 'MD123456',
      phone: '+15551234501',
      title: 'Orthopedic Surgeon',
      is_active: true
    }
  },
  // Physical Therapist (provider role)
  {
    email: 'physicaltherapist@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'physical_therapist',
      first_name: 'Jennifer',
      last_name: 'Martinez',
      tenant_id: DEFAULT_TENANT_ID,
      provider_role: 'Physical Therapist'
    },
    additionalData: {
      department: 'Rehabilitation Services',
      specialization: 'Post-Surgical Rehabilitation',
      license_number: 'PT789012',
      phone: '+15551234502',
      title: 'Physical Therapist',
      is_active: true
    }
  },
  // Nurse (provider role)
  {
    email: 'nurse@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'nurse',
      first_name: 'Patricia',
      last_name: 'Williams',
      tenant_id: DEFAULT_TENANT_ID,
      provider_role: 'Nurse'
    },
    additionalData: {
      department: 'Post-Surgical Care',
      specialization: 'Orthopedic Nursing',
      license_number: 'RN345678',
      phone: '+15551234503',
      title: 'Registered Nurse',
      is_active: true
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating Healthcare Platform Test Users (Fixed Version)...\n');
  console.log('===============================================\n');

  const createdUsers: any[] = [];

  for (const user of testUsers) {
    try {
      console.log(`Creating ${user.metadata.first_name} ${user.metadata.last_name} (${user.metadata.role})...`);

      // Create user using Supabase auth
      let userData: any = null;
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`⚠️  User ${user.email} already exists in auth`);
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users.find(u => u.email === user.email);
          if (existingUser) {
            // Use existing user ID for creating profile/patient records
            userData = { user: existingUser };
          } else {
            continue;
          }
        } else {
          console.error(`❌ Error creating ${user.email}:`, error.message);
          continue;
        }
      } else {
        console.log(`✅ Created auth user: ${user.email}`);
        userData = data;
      }

      // Create profile record (not users table)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user!.id,
          email: user.email,
          first_name: user.metadata.first_name,
          last_name: user.metadata.last_name,
          full_name: `${user.metadata.first_name} ${user.metadata.last_name}`,
          role: user.metadata.role,
          tenant_id: user.metadata.tenant_id,
          phone: user.additionalData?.phone || null,
          department: user.additionalData?.department || null,
          license_number: user.additionalData?.license_number || null,
          title: user.additionalData?.title || null,
          is_active: true,
          settings: {},
          permissions: [],
          preferences: {},
          notification_settings: {}
        });

      if (profileError) {
        console.error(`   ⚠️  Error creating profile record:`, profileError.message);
      } else {
        console.log(`   ✅ Created/updated profile record`);
      }

      // Create provider record if it's a provider
      if (['surgeon', 'nurse', 'physical_therapist'].includes(user.metadata.role) && userData.user) {
        const { error: providerError } = await supabase
          .from('providers')
          .upsert({
            id: userData.user.id,
            user_id: userData.user.id,
            profile_id: userData.user.id,
            tenant_id: user.metadata.tenant_id,
            department: user.additionalData.department,
            is_active: true,
            npi: null,
            specialty: user.additionalData.specialization || user.metadata.role,
            credentials: [],
            is_primary_surgeon: user.metadata.role === 'surgeon'
          });

        if (providerError) {
          console.error(`   ⚠️  Error creating provider record:`, providerError.message);
        } else {
          console.log(`   ✅ Created/updated provider record`);
        }
      }

      // Create patient record if it's a patient
      if (user.metadata.role === 'patient' && userData.user) {
        const { error: patientError } = await supabase
          .from('patients')
          .upsert({
            id: userData.user.id, // patients.id should match auth.users.id
            user_id: userData.user.id, // Also reference profile id
            tenant_id: user.metadata.tenant_id,
            mrn: user.additionalData.mrn,
            date_of_birth: user.additionalData.date_of_birth,
            surgery_date: user.additionalData.surgery_date,
            surgery_type: user.additionalData.surgery_type,
            emergency_contact: user.additionalData.emergency_contact,
            insurance_info: user.additionalData.insurance_info,
            status: user.additionalData.status,
            notes: user.additionalData.notes,
            current_recovery_day: user.additionalData.current_recovery_day,
            activity_level: user.additionalData.activity_level,
            risk_factors: []
          });

        if (patientError) {
          console.error(`   ⚠️  Error creating patient record:`, patientError.message);
        } else {
          console.log(`   ✅ Created/updated patient record`);
        }
      }

      createdUsers.push({
        email: user.email,
        password: user.password,
        role: user.metadata.role,
        name: `${user.metadata.first_name} ${user.metadata.last_name}`,
        additionalInfo: user.additionalData
      });

      console.log('');
    } catch (err) {
      console.error(`❌ Unexpected error creating ${user.email}:`, err);
    }
  }

  console.log('\n===============================================');
  console.log('✅ TEST USER CREATION COMPLETE!');
  console.log('===============================================\n');

  console.log('📋 TEST USER CREDENTIALS:\n');
  console.log('PATIENTS:');
  console.log('─────────');
  console.log('Pre-op Patient:');
  console.log('  Email: preop.patient@healthcare-test.com');
  console.log('  Password: TestPatient123!');
  console.log('  Status: Scheduled for surgery in 14 days');
  console.log('  Surgery Type: Total Knee Replacement');
  console.log('  MRN: MRN-PRE-001\n');

  console.log('Post-op Patient:');
  console.log('  Email: postop.patient@healthcare-test.com');
  console.log('  Password: TestPatient123!');
  console.log('  Status: 30 days post-surgery');
  console.log('  Surgery Type: Total Hip Replacement');
  console.log('  MRN: MRN-POST-001\n');

  console.log('PROVIDERS:');
  console.log('──────────');
  console.log('Surgeon:');
  console.log('  Email: surgeon@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Dr. Michael Chen');
  console.log('  Role: surgeon');
  console.log('  Department: Orthopedic Surgery\n');

  console.log('Physical Therapist:');
  console.log('  Email: physicaltherapist@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Jennifer Martinez');
  console.log('  Role: physical_therapist');
  console.log('  Department: Rehabilitation Services\n');

  console.log('Nurse:');
  console.log('  Email: nurse@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Patricia Williams');
  console.log('  Role: nurse');
  console.log('  Department: Post-Surgical Care\n');

  console.log('===============================================');
  console.log('🔐 AUTHENTICATION NOTES:');
  console.log('===============================================');
  console.log('- All users have email verification enabled');
  console.log('- Users can login with email/password or magic links');
  console.log('- Default tenant ID:', DEFAULT_TENANT_ID);
  console.log('- Base URL: http://localhost:3000\n');

  console.log('📱 PATIENT ACCESS URLS:');
  console.log('─────────────────────');
  console.log('- Patient Login: http://localhost:3000/auth/patient-access');
  console.log('- Patient Dashboard: http://localhost:3000/patient/dashboard');
  console.log('- Patient Chat: http://localhost:3000/patient/chat\n');

  console.log('👨‍⚕️ PROVIDER ACCESS URLS:');
  console.log('──────────────────────');
  console.log('- Provider Login: http://localhost:3000/auth/login');
  console.log('- Provider Dashboard: http://localhost:3000/provider/dashboard');
  console.log('- Patient Management: http://localhost:3000/provider/patients');
  console.log('- Send Invitations: http://localhost:3000/provider/patients/new\n');

  return createdUsers;
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('\n✅ All test users created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });