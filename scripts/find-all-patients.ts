import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAllPatients() {
  console.log('🔍 Searching for ALL patients in Supabase...\n');

  try {
    // 1. Get all patients without any tenant filtering
    console.log('1️⃣ Fetching ALL patients (no tenant filter)...');
    
    const { data: allPatients, error: patientsError } = await supabase
      .from('patients')
      .select(`
        *,
        profile:profiles!profile_id(
          id,
          email,
          first_name,
          last_name,
          role,
          tenant_id
        )
      `)
      .order('created_at', { ascending: false });

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return;
    }

    console.log(`\n✅ Found ${allPatients?.length || 0} total patients in database\n`);

    // 2. Group by tenant
    const patientsByTenant = new Map<string, any[]>();
    allPatients?.forEach(patient => {
      const tenantId = patient.tenant_id || 'NO_TENANT';
      if (!patientsByTenant.has(tenantId)) {
        patientsByTenant.set(tenantId, []);
      }
      patientsByTenant.get(tenantId)!.push(patient);
    });

    console.log('2️⃣ Patients grouped by tenant:');
    patientsByTenant.forEach((patients, tenantId) => {
      console.log(`\nTenant: ${tenantId}`);
      console.log(`Patients: ${patients.length}`);
    });

    // 3. Look for specific patients
    console.log('\n3️⃣ Searching for specific patients...\n');
    
    // Search for Bucky Thomas
    const buckySearch = allPatients?.filter(p => 
      p.profile?.first_name?.toLowerCase().includes('bucky') ||
      p.profile?.last_name?.toLowerCase().includes('thomas')
    );
    
    if (buckySearch && buckySearch.length > 0) {
      console.log('🎯 Found Bucky Thomas:');
      buckySearch.forEach(p => {
        console.log(`  Name: ${p.profile?.first_name} ${p.profile?.last_name}`);
        console.log(`  Email: ${p.profile?.email}`);
        console.log(`  Tenant: ${p.tenant_id}`);
        console.log(`  MRN: ${p.mrn}`);
        console.log('');
      });
    } else {
      console.log('❌ Bucky Thomas not found in patient records');
    }

    // 4. List all patients with names
    console.log('\n4️⃣ All patients with details:\n');
    allPatients?.forEach((patient, index) => {
      const name = patient.profile ? 
        `${patient.profile.first_name || ''} ${patient.profile.last_name || ''}`.trim() || 'NO NAME' 
        : 'NO PROFILE';
      
      console.log(`Patient ${index + 1}:`);
      console.log(`  Name: ${name}`);
      console.log(`  Email: ${patient.profile?.email || 'NO EMAIL'}`);
      console.log(`  MRN: ${patient.mrn}`);
      console.log(`  Tenant ID: ${patient.tenant_id}`);
      console.log(`  Profile Tenant: ${patient.profile?.tenant_id || 'NO PROFILE TENANT'}`);
      console.log(`  Status: ${patient.status}`);
      console.log(`  Created: ${patient.created_at}`);
      console.log('');
    });

    // 5. Check profiles table directly for patients
    console.log('\n5️⃣ Checking profiles table for patient roles...\n');
    
    const { data: patientProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('created_at', { ascending: false });

    if (!profilesError) {
      console.log(`Found ${patientProfiles?.length || 0} profiles with role='patient'`);
      
      // Check if any patient profiles don't have patient records
      const profilesWithoutPatients: any[] = [];
      for (const profile of patientProfiles || []) {
        const hasPatientRecord = allPatients?.some(p => p.profile_id === profile.id);
        if (!hasPatientRecord) {
          profilesWithoutPatients.push(profile);
        }
      }
      
      if (profilesWithoutPatients.length > 0) {
        console.log(`\n⚠️ Found ${profilesWithoutPatients.length} patient profiles WITHOUT patient records:`);
        profilesWithoutPatients.forEach(profile => {
          console.log(`  ${profile.first_name} ${profile.last_name} (${profile.email}) - Tenant: ${profile.tenant_id}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

// Run the search
findAllPatients();