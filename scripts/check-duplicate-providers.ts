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

async function checkDuplicateProviders() {
  console.log('🔍 Checking for duplicate provider records...\n');

  const demoUserId = '7ddef269-aba2-41e6-883e-9e9bdc6b31e0';

  // Check all provider records for demo user
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('profile_id', demoUserId);

  if (error) {
    console.error('❌ Error checking providers:', error);
  } else {
    console.log(`Found ${data?.length || 0} provider records for demo user`);
    if (data && data.length > 0) {
      data.forEach((provider, index) => {
        console.log(`\nProvider ${index + 1}:`);
        console.log('  ID:', provider.id);
        console.log('  Created:', provider.created_at);
        console.log('  Department:', provider.department);
        console.log('  Active:', provider.is_active);
      });

      if (data.length > 1) {
        console.log('\n⚠️  Multiple provider records found! Cleaning up...');
        
        // Keep the newest one
        const sorted = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);

        for (const provider of toDelete) {
          const { error: deleteError } = await supabase
            .from('providers')
            .delete()
            .eq('id', provider.id);
          
          if (deleteError) {
            console.error(`❌ Error deleting provider ${provider.id}:`, deleteError);
          } else {
            console.log(`✅ Deleted duplicate provider ${provider.id}`);
          }
        }
        
        console.log(`✅ Kept provider ${toKeep.id} (newest)`);
      }
    }
  }
}

// Run the check
checkDuplicateProviders().catch(console.error);