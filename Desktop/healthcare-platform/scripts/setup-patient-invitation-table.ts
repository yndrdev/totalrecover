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

async function setupPatientInvitationTable() {
  console.log('📧 Setting up patient_invitations table...\n');

  try {
    // 1. Create the patient_invitations table
    console.log('1️⃣ Creating patient_invitations table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.patient_invitations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          date_of_birth DATE,
          surgery_type VARCHAR(50),
          surgery_date DATE,
          invitation_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'cancelled')),
          sent_at TIMESTAMPTZ,
          accepted_at TIMESTAMPTZ,
          custom_message TEXT,
          provider_id UUID REFERENCES profiles(id),
          tenant_id UUID NOT NULL,
          practice_id UUID REFERENCES practices(id),
          sent_via TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          email_delivery_status JSONB,
          sms_delivery_status JSONB,
          patient_id UUID REFERENCES patients(id)
        );
      `
    });
    
    if (tableError) {
      if (tableError.message.includes('already exists')) {
        console.log('⚠️  Table already exists');
      } else {
        console.error('❌ Failed to create table:', tableError);
        return;
      }
    } else {
      console.log('✅ patient_invitations table created');
    }

    // 2. Create indexes for better performance
    console.log('\n2️⃣ Creating indexes...');
    
    const indexes = [
      {
        name: 'idx_patient_invitations_token',
        sql: 'CREATE INDEX IF NOT EXISTS idx_patient_invitations_token ON patient_invitations(invitation_token);'
      },
      {
        name: 'idx_patient_invitations_email',
        sql: 'CREATE INDEX IF NOT EXISTS idx_patient_invitations_email ON patient_invitations(email);'
      },
      {
        name: 'idx_patient_invitations_phone',
        sql: 'CREATE INDEX IF NOT EXISTS idx_patient_invitations_phone ON patient_invitations(phone);'
      },
      {
        name: 'idx_patient_invitations_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_patient_invitations_status ON patient_invitations(status);'
      },
      {
        name: 'idx_patient_invitations_provider',
        sql: 'CREATE INDEX IF NOT EXISTS idx_patient_invitations_provider ON patient_invitations(provider_id);'
      }
    ];

    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: index.sql });
      if (error) {
        console.error(`❌ Failed to create index ${index.name}:`, error);
      } else {
        console.log(`✅ Index ${index.name} created`);
      }
    }

    // 3. Enable RLS
    console.log('\n3️⃣ Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE patient_invitations ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.error('❌ Failed to enable RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled');
    }

    // 4. Create RLS policies
    console.log('\n4️⃣ Creating RLS policies...');
    
    // Drop existing policies first
    const policiesToDrop = [
      'Providers can view their invitations',
      'Providers can create invitations',
      'Providers can update their invitations',
      'Public can view invitation by token',
      'Service role bypass invitations'
    ];

    for (const policyName of policiesToDrop) {
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policyName}" ON patient_invitations;`
      });
    }

    // Create policies
    const policies = [
      {
        name: 'Providers can view their invitations',
        sql: `
          CREATE POLICY "Providers can view their invitations" ON patient_invitations
          FOR SELECT
          TO authenticated
          USING (
            provider_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'super_admin')
              AND profiles.tenant_id = patient_invitations.tenant_id
            )
          );
        `
      },
      {
        name: 'Providers can create invitations',
        sql: `
          CREATE POLICY "Providers can create invitations" ON patient_invitations
          FOR INSERT
          TO authenticated
          WITH CHECK (
            provider_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role IN ('provider', 'nurse', 'surgeon', 'physical_therapist', 'admin', 'super_admin')
              AND profiles.tenant_id = patient_invitations.tenant_id
            )
          );
        `
      },
      {
        name: 'Providers can update their invitations',
        sql: `
          CREATE POLICY "Providers can update their invitations" ON patient_invitations
          FOR UPDATE
          TO authenticated
          USING (
            provider_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'super_admin')
              AND profiles.tenant_id = patient_invitations.tenant_id
            )
          );
        `
      },
      {
        name: 'Public can view invitation by token',
        sql: `
          CREATE POLICY "Public can view invitation by token" ON patient_invitations
          FOR SELECT
          TO anon
          USING (status IN ('pending', 'sent'));
        `
      },
      {
        name: 'Service role bypass invitations',
        sql: `
          CREATE POLICY "Service role bypass invitations" ON patient_invitations
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
        `
      }
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.error(`❌ Failed to create policy "${policy.name}":`, error);
      } else {
        console.log(`✅ Policy "${policy.name}" created`);
      }
    }

    // 5. Create function to update updated_at timestamp
    console.log('\n5️⃣ Creating updated_at trigger...');
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (funcError) {
      console.log('⚠️  Function might already exist');
    }

    // Create trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_patient_invitations_updated_at ON patient_invitations;
        CREATE TRIGGER update_patient_invitations_updated_at
        BEFORE UPDATE ON patient_invitations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('❌ Failed to create trigger:', triggerError);
    } else {
      console.log('✅ Updated_at trigger created');
    }

    // 6. Test the table
    console.log('\n🧪 Testing table...');
    
    // Try to select from the table
    const { data, error: selectError } = await supabase
      .from('patient_invitations')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error selecting from table:', selectError);
    } else {
      console.log('✅ Table is accessible');
      console.log(`   Current invitation count: ${data?.length || 0}`);
    }

    console.log('\n✅ Patient invitations table setup complete!');
    console.log('\n📋 Summary:');
    console.log('  - Table created with all necessary columns');
    console.log('  - Indexes added for performance');
    console.log('  - RLS policies configured');
    console.log('  - Updated_at trigger installed');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupPatientInvitationTable().catch(console.error);