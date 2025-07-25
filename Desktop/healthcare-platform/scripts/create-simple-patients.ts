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

const defaultTenantId = 'c1234567-89ab-cdef-0123-456789abcdef';

async function createSimplePatients() {
  console.log('🚀 Creating simple patient records...\n');

  // Get profiles that are patients
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'patient');
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }
  
  console.log(`Found ${profiles?.length || 0} patient profiles`);
  
  // Create patient records for existing patient profiles
  for (const profile of profiles || []) {
    console.log(`\n📋 Creating patient record for ${profile.email}...`);
    
    const surgeryDate = new Date();
    surgeryDate.setDate(surgeryDate.getDate() + Math.floor(Math.random() * 60) - 30); // Random date within 30 days
    
    const patientData = {
      profile_id: profile.id,
      tenant_id: profile.tenant_id || defaultTenantId,
      mrn: 'MRN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      surgery_type: ['TKA', 'THA', 'TSA'][Math.floor(Math.random() * 3)],
      surgery_date: surgeryDate.toISOString().split('T')[0],
      phone_number: profile.phone || '555-' + Math.floor(1000 + Math.random() * 9000),
      status: 'active'
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select();
      
    if (error) {
      if (error.code === '23505') {
        console.log('✅ Patient record already exists');
      } else {
        console.error('❌ Error:', error);
      }
    } else {
      console.log('✅ Created patient:', data);
    }
  }
  
  // Also create some simulated patient data for demo purposes
  console.log('\n📋 Creating simulated patient data...');
  
  // Get all profiles to ensure we have providers
  const { data: allProfiles, error: allProfilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (allProfilesError) {
    console.error('Error fetching all profiles:', allProfilesError);
    return;
  }
  
  // Create fake patient profiles if we need more patients
  const fakePatients = [
    { name: 'Sarah Connor', mrn: 'MRN-SC-001', surgeryType: 'TKA', daysAgo: 45 },
    { name: 'Michael Jordan', mrn: 'MRN-MJ-023', surgeryType: 'THA', daysAgo: 30 },
    { name: 'Emma Stone', mrn: 'MRN-ES-456', surgeryType: 'TSA', daysAgo: 15 },
    { name: 'Robert Smith', mrn: 'MRN-RS-789', surgeryType: 'TKA', daysAgo: 7 },
    { name: 'Lisa Johnson', mrn: 'MRN-LJ-012', surgeryType: 'THA', daysAgo: -7 } // Future surgery
  ];
  
  // For demo purposes, we'll associate these with the first provider profile we find
  const providerProfile = allProfiles?.find(p => p.role === 'provider');
  
  if (providerProfile) {
    for (const fakePatient of fakePatients) {
      const surgeryDate = new Date();
      surgeryDate.setDate(surgeryDate.getDate() - fakePatient.daysAgo);
      
      // Create a fake profile ID (not ideal for production, but works for demo)
      const fakeProfileId = '00000000-0000-4000-8000-' + Date.now().toString().slice(-12).padStart(12, '0');
      
      const patientData = {
        profile_id: fakeProfileId,
        tenant_id: providerProfile.tenant_id || defaultTenantId,
        mrn: fakePatient.mrn,
        surgery_type: fakePatient.surgeryType,
        surgery_date: surgeryDate.toISOString().split('T')[0],
        phone_number: '555-' + Math.floor(1000 + Math.random() * 9000),
        status: 'active'
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select();
        
      if (error) {
        console.error(`❌ Error creating ${fakePatient.name}:`, error.message);
      } else {
        console.log(`✅ Created simulated patient: ${fakePatient.name}`);
      }
    }
  }
  
  // Display summary
  console.log('\n📊 Summary:');
  const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  console.log(`✅ Total patients: ${patientCount || 0}`);
  
  console.log('\n✅ Patient creation complete!');
}

// Run the creation
createSimplePatients().catch(console.error);