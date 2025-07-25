import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key for migrations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST() {
  try {
    // First, add phone_number column to patients table if it doesn't exist
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE patients 
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
      `
    });

    if (alterError && !alterError.message.includes('already exists')) {
      console.error('Error adding phone_number column:', alterError);
    }

    // Update the handle_new_user function
    const { error: functionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        DECLARE
          default_tenant_id UUID := 'c1234567-89ab-cdef-0123-456789abcdef';
        BEGIN
          -- Create profile for the new user
          INSERT INTO profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            tenant_id,
            created_at,
            updated_at
          ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
            COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, default_tenant_id),
            NOW(),
            NOW()
          );

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('Error updating handle_new_user function:', functionError);
    }

    // Create provider creation function
    const { error: providerFuncError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_provider_record(
          p_profile_id UUID,
          p_tenant_id UUID,
          p_department VARCHAR,
          p_provider_role VARCHAR DEFAULT NULL
        )
        RETURNS VOID AS $$
        BEGIN
          INSERT INTO providers (
            profile_id,
            tenant_id,
            department,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            p_profile_id,
            p_tenant_id,
            COALESCE(p_department, p_provider_role, 'General'),
            true,
            NOW(),
            NOW()
          )
          ON CONFLICT (profile_id) DO UPDATE
          SET 
            department = EXCLUDED.department,
            updated_at = NOW();
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (providerFuncError) {
      console.error('Error creating provider function:', providerFuncError);
    }

    // Create index for phone number lookups
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON patients(phone_number);
      `
    });

    if (indexError) {
      console.error('Error creating phone_number index:', indexError);
    }

    // Create test users
    const testUsers = [
      {
        email: 'surgeon@tjv.com',
        password: 'demo123!',
        metadata: {
          role: 'provider',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
          provider_role: 'Surgeon'
        }
      },
      {
        email: 'nurse@tjv.com',
        password: 'demo123!',
        metadata: {
          role: 'provider',
          first_name: 'Nancy',
          last_name: 'Williams',
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
          provider_role: 'Nurse'
        }
      },
      {
        email: 'pt@tjv.com',
        password: 'demo123!',
        metadata: {
          role: 'provider',
          first_name: 'Mike',
          last_name: 'Thompson',
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef',
          provider_role: 'Physical Therapist'
        }
      },
      {
        email: 'patient@tjv.com',
        password: 'demo123!',
        metadata: {
          role: 'patient',
          first_name: 'John',
          last_name: 'Smith',
          tenant_id: 'c1234567-89ab-cdef-0123-456789abcdef'
        }
      }
    ];

    const createdUsers = [];
    
    for (const user of testUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: user.metadata
        });

        if (authError) {
          if (authError.message.includes('already been registered')) {
            createdUsers.push({ email: user.email, status: 'Already exists' });
            continue;
          }
          throw authError;
        }

        if (authData.user) {
          // Wait for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 500));

          // Create provider record if it's a provider
          if (user.metadata.role === 'provider') {
            await supabaseAdmin
              .from('providers')
              .insert({
                profile_id: authData.user.id,
                tenant_id: user.metadata.tenant_id,
                department: user.metadata.provider_role || 'General',
                is_active: true
              });
          } else {
            // Create patient record
            await supabaseAdmin
              .from('patients')
              .insert({
                profile_id: authData.user.id,
                tenant_id: user.metadata.tenant_id,
                mrn: 'MRN123456',
                surgery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                surgery_type: 'TKA',
                phone_number: '5551234567',
                status: 'active'
              });
          }

          createdUsers.push({ email: user.email, status: 'Created successfully' });
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        createdUsers.push({ 
          email: user.email, 
          status: error instanceof Error ? error.message : 'Failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      testUsers: createdUsers
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 });
  }
}