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

async function debugChatMessages() {
  console.log('\n=== Debugging Chat Messages ===\n');

  // First, get the user for Sarah Johnson
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }

  const sarahUser = authData.users.find(u => u.email === 'sarah.johnson@example.com');
  if (!sarahUser) {
    console.log('No user found with email sarah.johnson@example.com');
    return;
  }

  console.log('User found:', {
    id: sarahUser.id,
    email: sarahUser.email
  });

  // Get the patient record using user ID
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', sarahUser.id);

  if (patientError) {
    console.error('Error fetching patient:', patientError);
    return;
  }

  if (!patients || patients.length === 0) {
    console.log(`No patient record found for user ID: ${sarahUser.id}`);
    console.log('\nCreating patient record...');
    
    // Create patient record
    const { data: newPatient, error: createError } = await supabase
      .from('patients')
      .insert({
        user_id: sarahUser.id,
        tenant_id: 'ce229b66-3a87-4eb0-9f8f-41be1e3af7ad', // Default Healthcare Platform tenant
        mrn: 'SJ001',
        date_of_birth: '1975-03-15',
        surgery_type: 'TKA',
        surgery_date: '2025-01-11', // 5 days ago
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating patient record:', createError);
      return;
    }
    
    console.log('Patient record created successfully:', newPatient.id);
    patients = [newPatient];
  }

  const patient = patients[0];
  console.log('Patient found:', {
    id: patient.id,
    user_id: patient.user_id,
    mrn: patient.mrn,
    surgery_type: patient.surgery_type,
    surgery_date: patient.surgery_date
  });

  // Get conversations for this patient
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('patient_id', patient.id);

  if (convError) {
    console.error('Error fetching conversations:', convError);
    return;
  }

  console.log(`\nFound ${conversations?.length || 0} conversations for patient`);

  if (conversations && conversations.length > 0) {
    for (const conv of conversations) {
      console.log(`\nConversation ${conv.id}:`);
      console.log(`- Created: ${conv.created_at}`);
      console.log(`- Updated: ${conv.updated_at}`);

      // Get messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        continue;
      }

      console.log(`- Messages: ${messages?.length || 0}`);
      
      if (messages && messages.length > 0) {
        messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. [${msg.sender_type}] ${msg.content.substring(0, 100)}...`);
          console.log(`     Created: ${msg.created_at}`);
        });
      } else {
        console.log('  No messages in this conversation');
      }
    }
  }

  // Check if we can insert a test message
  console.log('\n=== Testing Message Insert ===');
  
  if (conversations && conversations.length > 0) {
    const testConvId = conversations[0].id;
    
    const { data: testMsg, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: testConvId,
        sender_type: 'ai',
        content: 'Test message from debug script',
        completion_status: 'completed'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting test message:', insertError);
    } else {
      console.log('Successfully inserted test message:', testMsg?.id);
      
      // Delete the test message
      await supabase
        .from('messages')
        .delete()
        .eq('id', testMsg.id);
      
      console.log('Test message deleted');
    }
  }

  // Check RLS policies on messages table
  console.log('\n=== Checking RLS Policies ===');
  
  const { data: policies, error: policyError } = await supabase
    .rpc('get_policies', { table_name: 'messages' });

  if (!policyError && policies) {
    console.log('RLS policies for messages table:', policies);
  }
}

debugChatMessages().catch(console.error);