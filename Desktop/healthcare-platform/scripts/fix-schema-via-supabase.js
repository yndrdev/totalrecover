// Fix Supabase schema and create demo data using real connection
// Run with: node scripts/fix-schema-via-supabase.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndFixSchema() {
  console.log('🔍 Checking current database schema...\n')
  
  try {
    // Check tenants table structure
    console.log('📊 Checking tenants table...')
    const { data: tenantsColumns, error: tenantsError } = await supabase
      .rpc('get_table_columns', { table_name: 'tenants' })
    
    if (tenantsError) {
      console.log('⚠️  Could not get tenants columns, table might not exist')
      console.log('Creating tenants table with minimal schema...')
      
      await supabase.rpc('exec', {
        sql: `
        CREATE TABLE IF NOT EXISTS tenants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          subdomain TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );`
      })
      console.log('✅ Created tenants table')
    }
    
    // Check profiles table structure
    console.log('📊 Checking profiles table...')
    const { data: profilesColumns, error: profilesError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
    
    if (profilesError) {
      console.log('⚠️  Could not get profiles columns')
    }
    
    // Use direct SQL to add columns safely
    console.log('🔧 Adding missing columns...')
    
    const schemaFixes = [
      'ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subdomain TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id TEXT;',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;',
      `CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        tenant_id UUID,
        surgery_type TEXT,
        surgery_date DATE,
        surgery_side TEXT,
        surgeon_name TEXT,
        phone_number TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID,
        tenant_id UUID,
        title TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID,
        tenant_id UUID,
        patient_id UUID,
        sender_id TEXT,
        sender_type TEXT,
        content TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`
    ]
    
    for (const sql of schemaFixes) {
      try {
        const { error } = await supabase.rpc('exec', { sql })
        if (error) {
          console.log(`⚠️  SQL: ${sql.substring(0, 50)}... - ${error.message}`)
        }
      } catch (err) {
        console.log(`⚠️  SQL error: ${err.message}`)
      }
    }
    
    console.log('✅ Schema fixes applied')
    
    // Now create demo data with simplified approach
    console.log('\n📝 Creating demo data...')
    
    // Create tenant
    const { error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: 'demo-tenant-001',
        name: 'TJV Demo Practice',
        subdomain: 'tjv-demo'
      })
    
    if (tenantError) {
      console.log('⚠️  Tenant creation error:', tenantError.message)
    } else {
      console.log('✅ Created demo tenant')
    }
    
    // Create profiles
    const profiles = [
      {
        id: 'patient-sarah-001',
        user_id: 'patient-sarah-001',
        tenant_id: 'demo-tenant-001',
        email: 'sarah.johnson@tjvdemo.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        full_name: 'Sarah Johnson',
        role: 'patient'
      },
      {
        id: 'provider-drsmith-001',
        user_id: 'provider-drsmith-001',
        tenant_id: 'demo-tenant-001',
        email: 'dr.smith@tjvdemo.com',
        first_name: 'Michael',
        last_name: 'Smith',
        full_name: 'Dr. Michael Smith',
        role: 'provider'
      },
      {
        id: 'provider-mikechen-001',
        user_id: 'provider-mikechen-001',
        tenant_id: 'demo-tenant-001',
        email: 'mike.chen@tjvdemo.com',
        first_name: 'Mike',
        last_name: 'Chen',
        full_name: 'Mike Chen, PT',
        role: 'provider'
      }
    ]
    
    for (const profile of profiles) {
      const { error } = await supabase.from('profiles').upsert(profile)
      if (error) {
        console.log(`⚠️  Profile error for ${profile.email}:`, error.message)
      } else {
        console.log(`✅ Created profile: ${profile.email}`)
      }
    }
    
    // Create patient record
    const surgeryDate = new Date()
    surgeryDate.setDate(surgeryDate.getDate() - 4) // 4 days ago for "Day 4"
    
    const { error: patientError } = await supabase
      .from('patients')
      .upsert({
        id: 'patient-sarah-rec-001',
        user_id: 'patient-sarah-001',
        tenant_id: 'demo-tenant-001',
        surgery_type: 'TKA',
        surgery_date: surgeryDate.toISOString().split('T')[0],
        surgery_side: 'Right',
        surgeon_name: 'Dr. Michael Smith',
        phone_number: '5551234567',
        status: 'active'
      })
    
    if (patientError) {
      console.log('⚠️  Patient creation error:', patientError.message)
    } else {
      console.log('✅ Created patient record for Sarah Johnson')
    }
    
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert({
        id: 'conv-sarah-001',
        patient_id: 'patient-sarah-rec-001',
        tenant_id: 'demo-tenant-001',
        title: 'Recovery Chat - Sarah Johnson',
        status: 'active'
      })
      .select()
    
    if (convError) {
      console.log('⚠️  Conversation creation error:', convError.message)
    } else {
      console.log('✅ Created conversation')
    }
    
    // Create sample messages
    const messages = [
      {
        id: 'msg-001',
        conversation_id: 'conv-sarah-001',
        tenant_id: 'demo-tenant-001',
        patient_id: 'patient-sarah-rec-001',
        sender_type: 'ai',
        content: 'Good morning! I\'m your TJV Recovery Assistant. How are you feeling today on Day 4 of your recovery?'
      },
      {
        id: 'msg-002',
        conversation_id: 'conv-sarah-001',
        tenant_id: 'demo-tenant-001',
        patient_id: 'patient-sarah-rec-001',
        sender_type: 'patient',
        content: 'Good morning! I\'m feeling better today. The pain is more manageable.'
      }
    ]
    
    for (const message of messages) {
      const { error } = await supabase.from('messages').upsert(message)
      if (error) {
        console.log('⚠️  Message error:', error.message)
      } else {
        console.log('✅ Created message')
      }
    }
    
    console.log('\n🎉 Demo data creation complete!')
    console.log('\n📋 Demo Login Credentials:')
    console.log('================================')
    console.log('Patient: sarah.johnson@tjvdemo.com')
    console.log('Provider: dr.smith@tjvdemo.com')
    console.log('Password: DemoPass123!')
    console.log('\n💡 Next: Run the auth user creation script')
    console.log('💡 Then test at: http://localhost:3000/demo/patient-chat')
    
  } catch (error) {
    console.error('❌ Schema check/fix error:', error)
  }
}

// Run the script
checkAndFixSchema().catch(console.error)