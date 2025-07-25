import { patientService } from '../lib/services/patient-service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testPatientService() {
  console.log('🔍 Testing patient service...\n');

  try {
    // Test getPatients method
    console.log('📋 Testing getPatients():');
    const result = await patientService.getPatients({
      page: 1,
      limit: 10,
      status: 'all'
    });
    
    console.log(`✅ Total patients: ${result.totalCount}`);
    console.log(`📄 Patients returned: ${result.patients.length}`);
    console.log(`📑 Total pages: ${result.totalPages}`);
    
    if (result.patients.length > 0) {
      console.log('\n👤 First patient:');
      console.log(JSON.stringify(result.patients[0], null, 2));
    }
  } catch (error: any) {
    console.error('❌ Error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      error
    });
  }
}

// Run the test
testPatientService().catch(console.error);