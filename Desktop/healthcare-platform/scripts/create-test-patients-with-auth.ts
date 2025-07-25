import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestPatientsWithAuth() {
  console.log('🔧 Creating Test Patients with Auth...\n');

  const testTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
  const firstNames = ['Bucky', 'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 
                      'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
                      'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Donald', 'Sandra',
                      'Steven', 'Donna', 'Kenneth', 'Carol', 'Joshua', 'Ruth', 'Kevin', 'Sharon', 'Brian', 'Michelle',
                      'George', 'Laura', 'Timothy', 'Kimberly', 'Ronald', 'Deborah', 'Edward', 'Dorothy', 'Jason', 'Amy'];
  
  const lastNames = ['Thomas', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                     'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Martin',
                     'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
                     'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                     'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  let createdCount = 0;

  try {
    for (let i = 0; i < Math.min(51, firstNames.length); i++) { // Create up to 51 patients
      const firstName = firstNames[i];
      const lastName = lastNames[i % lastNames.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i === 0 ? '' : i}@example.com`;
      
      console.log(`Creating patient ${i + 1}: ${firstName} ${lastName}...`);
      
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: 'TestPassword123!',
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName
          }
        });

        if (authError) {
          console.error(`❌ Error creating auth user for ${firstName} ${lastName}:`, authError.message);
          continue;
        }

        if (authData?.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              role: 'patient',
              tenant_id: testTenantId
            });

          if (profileError) {
            console.error(`❌ Error creating profile for ${firstName} ${lastName}:`, profileError.message);
            continue;
          }

          // Create patient record
          const surgeryDaysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
          const surgeryTypes = ['knee-replacement', 'hip-replacement', 'shoulder-surgery'];
          
          const { error: patientError } = await supabase
            .from('patients')
            .insert({
              profile_id: authData.user.id,
              tenant_id: testTenantId,
              mrn: `MRN-${Date.now()}-${i}`,
              status: 'active',
              surgery_date: new Date(Date.now() + (surgeryDaysOffset * 24 * 60 * 60 * 1000)).toISOString(),
              surgery_type: surgeryTypes[i % surgeryTypes.length],
              phone_number: `555-${String(1000 + i).padStart(4, '0')}`
            });

          if (patientError) {
            console.error(`❌ Error creating patient record for ${firstName} ${lastName}:`, patientError.message);
          } else {
            console.log(`✅ Created patient ${createdCount + 1}: ${firstName} ${lastName}`);
            createdCount++;
          }
        }
      } else {
        console.log(`⏭️ Skipping ${firstName} ${lastName} - already exists`);
      }
    }
    
    console.log(`\n✅ Successfully created ${createdCount} new test patients`);
    
    // Final count
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Total patients in database: ${totalPatients}`);

  } catch (error) {
    console.error('❌ Error creating test patients:', error);
  }
}

// Run the script
createTestPatientsWithAuth();