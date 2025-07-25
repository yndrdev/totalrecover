import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInvitationsAndMore() {
  console.log('🔍 Checking Invitations and Additional Patient Data...\n');

  try {
    // 1. Check patient_invitations table
    console.log('1️⃣ Checking patient invitations...');
    
    const { data: invitations, error: invError } = await supabase
      .from('patient_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!invError && invitations) {
      console.log(`\nFound ${invitations.length} invitations:`);
      invitations.forEach((inv, index) => {
        console.log(`\n${index + 1}. ${inv.first_name} ${inv.last_name}`);
        console.log(`   Email: ${inv.email}`);
        console.log(`   Status: ${inv.status}`);
        console.log(`   Invited by: ${inv.provider_id}`);
        console.log(`   Created: ${inv.created_at}`);
      });
    } else if (invError) {
      console.log('❌ Error fetching invitations:', invError.message);
    }

    // 2. Create 50 test patients for pagination testing
    console.log('\n\n2️⃣ Creating test patients for pagination...');
    
    const testPatients = [];
    const testTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';
    
    // First, create profiles
    for (let i = 1; i <= 50; i++) {
      const firstName = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'][i % 10];
      const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10];
      const email = `patient${i}@example.com`;
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (!existingProfile) {
        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
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
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert({
              profile_id: newProfile.id,
              tenant_id: testTenantId,
              mrn: `MRN-TEST-${Date.now()}-${i}`,
              status: 'active',
              surgery_date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString(), // Stagger surgery dates
              surgery_type: ['knee-replacement', 'hip-replacement', 'shoulder-surgery'][i % 3],
              phone_number: `555-${String(i).padStart(4, '0')}`
            })
            .select();
          
          if (newPatient && !patientError) {
            testPatients.push(newPatient);
            console.log(`✅ Created patient ${i}: ${firstName} ${lastName}`);
          }
        }
      } else {
        console.log(`⏭️ Skipping ${email} - already exists`);
      }
    }
    
    console.log(`\n✅ Created ${testPatients.length} new test patients`);
    
    // 3. Final count
    console.log('\n\n3️⃣ Final patient count...');
    
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nTotal patients in database: ${totalPatients}`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkInvitationsAndMore();