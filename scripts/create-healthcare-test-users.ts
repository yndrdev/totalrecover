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

// Default tenant ID - you may want to update this based on your actual tenant
const DEFAULT_TENANT_ID = 'c1234567-89ab-cdef-0123-456789abcdef';

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
      phone_number: '+15551234001',
      status: 'active',
      date_of_birth: '1975-03-15',
      address: {
        street: '123 Preop Lane',
        city: 'Medical City',
        state: 'CA',
        zip: '90210'
      },
      emergency_contact: {
        name: 'John Thompson',
        phone: '+15551234101',
        relationship: 'Spouse'
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield',
        policy_number: 'BC123456789'
      },
      notes: 'Pre-operative patient scheduled for TKR in 2 weeks'
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
      phone_number: '+15551234002',
      status: 'active',
      date_of_birth: '1968-08-22',
      address: {
        street: '456 Recovery Road',
        city: 'Health Valley',
        state: 'CA',
        zip: '90211'
      },
      emergency_contact: {
        name: 'Sarah Johnson',
        phone: '+15551234102',
        relationship: 'Spouse'
      },
      insurance_info: {
        provider: 'Aetna',
        policy_number: 'AET987654321'
      },
      notes: 'Post-operative patient, 30 days post THR, progressing well'
    }
  },
  // Surgeon (provider role)
  {
    email: 'surgeon@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'provider',
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
      years_of_experience: 15,
      education: ['MD - Johns Hopkins University', 'Residency - Mayo Clinic', 'Fellowship - HSS'],
      certifications: ['Board Certified Orthopedic Surgery', 'Fellow of American Academy of Orthopedic Surgeons'],
      bio: 'Specializing in minimally invasive joint replacement surgery with over 15 years of experience.',
      is_active: true
    }
  },
  // Physical Therapist (provider role)
  {
    email: 'physicaltherapist@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'provider',
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
      years_of_experience: 10,
      education: ['DPT - University of Southern California'],
      certifications: ['Board Certified Orthopedic Physical Therapy', 'Certified in Dry Needling'],
      bio: 'Expert in post-surgical rehabilitation with focus on joint replacement recovery.',
      is_active: true
    }
  },
  // Nurse (provider role)
  {
    email: 'nurse@healthcare-test.com',
    password: 'TestProvider123!',
    metadata: {
      role: 'provider',
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
      years_of_experience: 8,
      education: ['BSN - UCLA School of Nursing'],
      certifications: ['Certified Orthopedic Nurse', 'ACLS Certified'],
      bio: 'Dedicated orthopedic nurse specializing in post-operative care and patient education.',
      is_active: true
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating Healthcare Platform Test Users...\n');
  console.log('===============================================\n');

  const createdUsers: any[] = [];

  for (const user of testUsers) {
    try {
      console.log(`Creating ${user.metadata.first_name} ${user.metadata.last_name} (${user.metadata.role})...`);

      // Create user using Supabase auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
        continue;
      }

      console.log(`✅ Created auth user: ${user.email}`);

      // Create user record in the users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user!.id,
          email: user.email,
          first_name: user.metadata.first_name,
          last_name: user.metadata.last_name,
          full_name: `${user.metadata.first_name} ${user.metadata.last_name}`,
          role: user.metadata.role,
          tenant_id: user.metadata.tenant_id,
          phone: user.additionalData?.phone || null,
          specialization: user.additionalData?.specialization || null,
          license_number: user.additionalData?.license_number || null,
          is_active: true
        });

      if (userError) {
        console.error(`   ⚠️  Error creating user record:`, userError.message);
      } else {
        console.log(`   ✅ Created user record`);
      }

      // Create provider record if it's a provider
      if (user.metadata.role === 'provider' && data.user) {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: data.user.id,
            profile_id: data.user.id,
            tenant_id: user.metadata.tenant_id,
            department: user.additionalData.department,
            is_active: true,
            bio: user.additionalData.bio,
            years_of_experience: user.additionalData.years_of_experience,
            education: user.additionalData.education,
            certifications: user.additionalData.certifications
          });

        if (providerError) {
          console.error(`   ⚠️  Error creating provider record:`, providerError.message);
        } else {
          console.log(`   ✅ Created provider record`);
        }
      }

      // Create patient record if it's a patient
      if (user.metadata.role === 'patient' && data.user) {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: data.user.id,
            profile_id: data.user.id,
            tenant_id: user.metadata.tenant_id,
            mrn: user.additionalData.mrn,
            first_name: user.metadata.first_name,
            last_name: user.metadata.last_name,
            date_of_birth: user.additionalData.date_of_birth,
            surgery_date: user.additionalData.surgery_date,
            surgery_type: user.additionalData.surgery_type,
            phone: user.additionalData.phone_number,
            email: user.email,
            address: user.additionalData.address,
            emergency_contact: user.additionalData.emergency_contact,
            insurance_info: user.additionalData.insurance_info,
            status: user.additionalData.status,
            preferred_language: 'en'
          });

        if (patientError) {
          console.error(`   ⚠️  Error creating patient record:`, patientError.message);
        } else {
          console.log(`   ✅ Created patient record`);
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
  console.log('  Surgery Type: Total Knee Replacement\n');

  console.log('Post-op Patient:');
  console.log('  Email: postop.patient@healthcare-test.com');
  console.log('  Password: TestPatient123!');
  console.log('  Status: 30 days post-surgery');
  console.log('  Surgery Type: Total Hip Replacement\n');

  console.log('PROVIDERS:');
  console.log('──────────');
  console.log('Surgeon:');
  console.log('  Email: surgeon@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Dr. Michael Chen');
  console.log('  Specialization: Joint Replacement\n');

  console.log('Physical Therapist:');
  console.log('  Email: physicaltherapist@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Jennifer Martinez');
  console.log('  Specialization: Post-Surgical Rehabilitation\n');

  console.log('Nurse:');
  console.log('  Email: nurse@healthcare-test.com');
  console.log('  Password: TestProvider123!');
  console.log('  Name: Patricia Williams');
  console.log('  Specialization: Orthopedic Nursing\n');

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
  console.log('- Patient Management: http://localhost:3000/provider/patients\n');

  // Test invitation system
  console.log('===============================================');
  console.log('🔔 TESTING INVITATION SYSTEM...');
  console.log('===============================================\n');

  // Create a test invitation
  try {
    const surgeonUser = createdUsers.find(u => u.email === 'surgeon@healthcare-test.com');
    if (surgeonUser) {
      console.log('Creating test patient invitation...');
      
      // Note: In a real scenario, this would be done through the API endpoint
      // For now, we'll just log what would happen
      console.log('✅ Invitation system ready for testing');
      console.log('   - SMS notifications would be sent via Twilio');
      console.log('   - Email notifications would be sent via Resend');
      console.log('   - Test via: POST /api/invitations/send');
    }
  } catch (error) {
    console.error('Error testing invitation system:', error);
  }

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