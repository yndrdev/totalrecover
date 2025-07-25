import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestPatients() {
  console.log('🔧 Creating Test Patients...\n');

  const testTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 
                      'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
                      'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Donald', 'Sandra',
                      'Steven', 'Donna', 'Kenneth', 'Carol', 'Joshua', 'Ruth', 'Kevin', 'Sharon', 'Brian', 'Michelle',
                      'George', 'Laura', 'Timothy', 'Kimberly', 'Ronald', 'Deborah', 'Edward', 'Dorothy', 'Jason', 'Amy'];
  
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                     'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                     'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
                     'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                     'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

  let createdCount = 0;

  try {
    // Create Bucky Thomas first
    console.log('Creating Bucky Thomas...');
    const buckyEmail = 'bucky.thomas@example.com';
    
    // Check if Bucky already exists
    const { data: existingBucky } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', buckyEmail)
      .single();
    
    if (!existingBucky) {
      // Create Bucky's profile
      const buckyId = uuidv4();
      const { data: buckyProfile, error: buckyProfileError } = await supabase
        .from('profiles')
        .insert({
          id: buckyId,
          email: buckyEmail,
          first_name: 'Bucky',
          last_name: 'Thomas',
          role: 'patient',
          tenant_id: testTenantId
        })
        .select()
        .single();
      
      if (buckyProfile && !buckyProfileError) {
        // Create Bucky's patient record
        const { data: buckyPatient, error: buckyPatientError } = await supabase
          .from('patients')
          .insert({
            profile_id: buckyProfile.id,
            tenant_id: testTenantId,
            mrn: `MRN-BUCKY-${Date.now()}`,
            status: 'active',
            surgery_date: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // Surgery in 7 days
            surgery_type: 'knee-replacement',
            phone_number: '555-BUCKY'
          })
          .select();
        
        if (buckyPatient && !buckyPatientError) {
          console.log('✅ Created Bucky Thomas');
          createdCount++;
        }
      }
    } else {
      console.log('⏭️ Bucky Thomas already exists');
    }

    // Create additional test patients
    console.log('\nCreating additional test patients...');
    
    for (let i = 0; i < 43; i++) { // Create 43 more to reach ~50 total
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (!existingProfile) {
        // Create profile
        const profileId = uuidv4();
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: profileId,
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'patient',
            tenant_id: testTenantId
          })
          .select()
          .single();
        
        if (newProfile && !profileError) {
          // Create patient record
          const surgeryDaysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
          const surgeryTypes = ['knee-replacement', 'hip-replacement', 'shoulder-surgery'];
          
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert({
              profile_id: newProfile.id,
              tenant_id: testTenantId,
              mrn: `MRN-${Date.now()}-${i}`,
              status: 'active',
              surgery_date: new Date(Date.now() + (surgeryDaysOffset * 24 * 60 * 60 * 1000)).toISOString(),
              surgery_type: surgeryTypes[i % surgeryTypes.length],
              phone_number: `555-${String(1000 + i).padStart(4, '0')}`
            })
            .select();
          
          if (newPatient && !patientError) {
            console.log(`✅ Created patient ${createdCount + 1}: ${firstName} ${lastName}`);
            createdCount++;
          } else if (patientError) {
            console.error(`❌ Error creating patient record for ${firstName} ${lastName}:`, patientError.message);
          }
        } else if (profileError) {
          console.error(`❌ Error creating profile for ${firstName} ${lastName}:`, profileError.message);
        }
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
createTestPatients();