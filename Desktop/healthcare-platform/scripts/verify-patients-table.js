import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPatientsTable() {
  console.log('\n=== Verifying Patients Table Structure ===\n');

  // Get table information from information_schema
  const { data: columns, error } = await supabase
    .rpc('get_table_columns', { table_name: 'patients' });

  if (error) {
    console.error('Error fetching table columns:', error);
    
    // Try a different approach - query the table with limit 0
    console.log('\nTrying alternative approach...');
    const { data: testData, error: testError } = await supabase
      .from('patients')
      .select('*')
      .limit(0);
    
    if (testError) {
      console.error('Alternative approach also failed:', testError);
    } else {
      console.log('Table exists but cannot determine structure');
    }
    return;
  }

  console.log('Patients table columns:', columns);

  // Also check if the table exists by trying to count rows
  const { count, error: countError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting patients:', countError);
  } else {
    console.log(`\nTotal patient records: ${count}`);
  }

  // Try to get all patient records to see structure
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .limit(5);

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
  } else {
    console.log('\nSample patient records:');
    console.log(JSON.stringify(patients, null, 2));
  }
}

verifyPatientsTable().catch(console.error);