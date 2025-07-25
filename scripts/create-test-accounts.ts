import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test account credentials
const TEST_ACCOUNTS = {
  provider: {
    email: 'test-provider@example.com',
    password: 'TJVDemo2024!',
    firstName: 'Michael',
    lastName: 'Chen',
    title: 'Dr.',
    role: 'provider',
    specialty: 'Orthopedic Surgery',
    npi: '1234567890',
    credentials: ['MD', 'FAAOS']
  },
  preOpPatient: {
    email: 'test-preop@example.com',
    password: 'TJVDemo2024!',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1970-05-15',
    phone: '555-0101',
    surgeryType: 'Total Knee Replacement',
    protocolName: 'TJV Total Knee Replacement Protocol',
    daysUntilSurgery: 7
  },
  postOpPatient: {
    email: 'test-postop@example.com',
    password: 'TJVDemo2024!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1968-08-22',
    phone: '555-0102',
    surgeryType: 'Total Hip Replacement',
    protocolName: 'TJV Total Hip Replacement Protocol',
    daysSinceSurgery: 7
  }
};

// Default tenant for test accounts
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

async function createTestAccounts() {
  try {
    console.log('🚀 Starting test account creation...\n');

    // Step 1: Ensure tenant exists
    await ensureTenant();

    // Step 2: Create provider account
    const providerId = await createProviderAccount();

    // Step 3: Create patient accounts
    const preOpPatientId = await createPatientAccount('preOp', providerId);
    const postOpPatientId = await createPatientAccount('postOp', providerId);

    // Step 4: Create or find protocols
    const { kneeProtocolId, hipProtocolId } = await ensureProtocols();

    // Step 5: Assign protocols to patients
    await assignProtocolToPatient(preOpPatientId, kneeProtocolId, 'preOp');
    await assignProtocolToPatient(postOpPatientId, hipProtocolId, 'postOp');

    // Step 6: Create initial chat conversations
    await createChatConversations(preOpPatientId, 'preOp');
    await createChatConversations(postOpPatientId, 'postOp');

    // Step 7: Mark some tasks as completed for post-op patient
    await markPostOpTasksCompleted(postOpPatientId);

    console.log('\n✅ Test accounts created successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('================================');
    console.log('\nProvider Account:');
    console.log(`Email: ${TEST_ACCOUNTS.provider.email}`);
    console.log(`Password: ${TEST_ACCOUNTS.provider.password}`);
    console.log('\nPre-Op Patient Account:');
    console.log(`Email: ${TEST_ACCOUNTS.preOpPatient.email}`);
    console.log(`Password: ${TEST_ACCOUNTS.preOpPatient.password}`);
    console.log('\nPost-Op Patient Account:');
    console.log(`Email: ${TEST_ACCOUNTS.postOpPatient.email}`);
    console.log(`Password: ${TEST_ACCOUNTS.postOpPatient.password}`);
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    process.exit(1);
  }
}

async function ensureTenant() {
  // Check/create tenant
  const { data: existingTenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', DEFAULT_TENANT_ID)
    .single();

  if (!existingTenant) {
    console.log('Creating default tenant...');
    const { error } = await supabase
      .from('tenants')
      .insert({
        id: DEFAULT_TENANT_ID,
        name: 'TJV Medical Center',
        slug: 'default',
        settings: {
          branding: {
            primary_color: '#006DB1',
            secondary_color: '#002238'
          }
        }
      });

    if (error) {
      console.error('Tenant creation error details:', error);
      throw new Error(`Failed to create tenant: ${JSON.stringify(error)}`);
    }
  }
}

async function createProviderAccount(): Promise<string> {
  console.log('Creating provider account...');
  
  const { provider } = TEST_ACCOUNTS;

  // Delete existing user if any
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === provider.email);
  
  if (existingUser) {
    console.log('Deleting existing provider account...');
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // Create auth user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: provider.email,
    password: provider.password,
    email_confirm: true,
    user_metadata: {
      userType: 'provider',
      firstName: provider.firstName,
      lastName: provider.lastName,
      title: provider.title
    }
  });

  if (userError || !userData.user) {
    throw new Error(`Failed to create provider auth user: ${userError?.message}`);
  }

  // Create user record
  const { error: userRecordError } = await supabase
    .from('users')
    .insert({
      id: userData.user.id,
      tenant_id: DEFAULT_TENANT_ID,
      email: provider.email,
      full_name: `${provider.title} ${provider.firstName} ${provider.lastName}`,
      role: provider.role,
      phone: '412-555-0101',
      is_active: true
    });

  if (userRecordError) {
    console.error('User record creation error:', userRecordError);
    throw new Error(`Failed to create provider user record: ${JSON.stringify(userRecordError)}`);
  }

  // Create provider record
  const { error: providerError } = await supabase
    .from('providers')
    .insert({
      user_id: userData.user.id,
      tenant_id: DEFAULT_TENANT_ID,
      npi: provider.npi,
      specialty: provider.specialty,
      credentials: provider.credentials,
      is_primary_surgeon: true
    });

  if (providerError) {
    throw new Error(`Failed to create provider record: ${providerError.message}`);
  }

  console.log(`✓ Provider account created: ${provider.email}`);
  return userData.user.id;
}

async function createPatientAccount(type: 'preOp' | 'postOp', providerId: string): Promise<string> {
  const patient = type === 'preOp' ? TEST_ACCOUNTS.preOpPatient : TEST_ACCOUNTS.postOpPatient;
  console.log(`Creating ${type} patient account...`);

  // Delete existing user if any
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === patient.email);
  
  if (existingUser) {
    console.log(`Deleting existing ${type} patient account...`);
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // Create auth user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: patient.email,
    password: patient.password,
    email_confirm: true,
    user_metadata: {
      userType: 'patient',
      firstName: patient.firstName,
      lastName: patient.lastName
    }
  });

  if (userError || !userData.user) {
    throw new Error(`Failed to create ${type} patient auth user: ${userError?.message}`);
  }

  // Create user record
  const { error: userRecordError } = await supabase
    .from('users')
    .insert({
      id: userData.user.id,
      tenant_id: DEFAULT_TENANT_ID,
      email: patient.email,
      full_name: `${patient.firstName} ${patient.lastName}`,
      role: 'patient',
      phone: patient.phone,
      date_of_birth: patient.dateOfBirth,
      is_active: true
    });

  if (userRecordError) {
    console.error(`Patient user record creation error for ${type}:`, userRecordError);
    throw new Error(`Failed to create ${type} patient user record: ${JSON.stringify(userRecordError)}`);
  }

  // Calculate surgery date
  const surgeryDate = new Date();
  if (type === 'preOp') {
    surgeryDate.setDate(surgeryDate.getDate() + TEST_ACCOUNTS.preOpPatient.daysUntilSurgery);
  } else {
    surgeryDate.setDate(surgeryDate.getDate() - TEST_ACCOUNTS.postOpPatient.daysSinceSurgery);
  }

  // Create patient record
  const { error: patientError } = await supabase
    .from('patients')
    .insert({
      user_id: userData.user.id,
      tenant_id: DEFAULT_TENANT_ID,
      mrn: `MRN-${type.toUpperCase()}-${Date.now()}`,
      first_name: patient.firstName,
      last_name: patient.lastName,
      date_of_birth: patient.dateOfBirth,
      phone: patient.phone,
      email: patient.email,
      address: {
        street: '456 Oak Street',
        city: 'Pittsburgh',
        state: 'PA',
        zip: '15201'
      },
      emergency_contact: {
        name: 'Emergency Contact',
        phone: '555-0911',
        relationship: 'Spouse'
      },
      medical_history: {
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        medications: ['Metformin', 'Lisinopril'],
        allergies: ['Penicillin']
      },
      insurance_info: {
        provider: 'Blue Cross Blue Shield',
        policy_number: 'TEST123456',
        group_number: 'GRP789'
      },
      status: 'active'
    });

  if (patientError) {
    throw new Error(`Failed to create ${type} patient record: ${patientError.message}`);
  }

  // Create surgeon assignment
  const { data: patientData } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userData.user.id)
    .single();

  if (patientData) {
    // Update patient with surgeon assignment
    await supabase
      .from('patients')
      .update({
        metadata: {
          surgeon_id: providerId,
          surgery_date: surgeryDate.toISOString(),
          surgery_type: patient.surgeryType
        }
      })
      .eq('id', patientData.id);
  }

  console.log(`✓ ${type} patient account created: ${patient.email}`);
  return userData.user.id;
}

async function ensureProtocols() {
  console.log('Ensuring protocols exist...');

  // Create or find Total Knee Replacement Protocol
  let { data: kneeProtocol } = await supabase
    .from('protocols')
    .select('id')
    .eq('name', TEST_ACCOUNTS.preOpPatient.protocolName)
    .eq('tenant_id', DEFAULT_TENANT_ID)
    .single();

  if (!kneeProtocol) {
    const { data, error } = await supabase
      .from('protocols')
      .insert({
        tenant_id: DEFAULT_TENANT_ID,
        name: TEST_ACCOUNTS.preOpPatient.protocolName,
        description: 'Comprehensive recovery protocol for total knee replacement surgery',
        surgery_types: ['TKR', 'TKA'],
        activity_levels: ['active', 'sedentary'],
        timeline_start: -14,
        timeline_end: 90,
        is_active: true,
        is_draft: false,
        created_by: DEFAULT_TENANT_ID // Using tenant ID as placeholder
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create knee protocol: ${error.message}`);
    kneeProtocol = data;
  }

  // Create or find Total Hip Replacement Protocol
  let { data: hipProtocol } = await supabase
    .from('protocols')
    .select('id')
    .eq('name', TEST_ACCOUNTS.postOpPatient.protocolName)
    .eq('tenant_id', DEFAULT_TENANT_ID)
    .single();

  if (!hipProtocol) {
    const { data, error } = await supabase
      .from('protocols')
      .insert({
        tenant_id: DEFAULT_TENANT_ID,
        name: TEST_ACCOUNTS.postOpPatient.protocolName,
        description: 'Comprehensive recovery protocol for total hip replacement surgery',
        surgery_types: ['THR', 'THA'],
        activity_levels: ['active', 'sedentary'],
        timeline_start: -14,
        timeline_end: 90,
        is_active: true,
        is_draft: false,
        created_by: DEFAULT_TENANT_ID // Using tenant ID as placeholder
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create hip protocol: ${error.message}`);
    hipProtocol = data;
  }

  // Create protocol tasks for both protocols
  await createProtocolTasks(kneeProtocol.id, 'knee');
  await createProtocolTasks(hipProtocol.id, 'hip');

  console.log('✓ Protocols created/verified');
  return { kneeProtocolId: kneeProtocol.id, hipProtocolId: hipProtocol.id };
}

async function createProtocolTasks(protocolId: string, type: 'knee' | 'hip') {
  // Check if tasks already exist
  const { data: existingTasks } = await supabase
    .from('protocol_tasks')
    .select('id')
    .eq('protocol_id', protocolId)
    .limit(1);

  if (existingTasks && existingTasks.length > 0) return;

  const tasks = [
    // Pre-op tasks
    { day: -7, type: 'form', title: 'Pre-Surgery Health Assessment', content: 'Complete your pre-surgery health questionnaire', phase: 'pre-op' },
    { day: -7, type: 'video', title: 'Preparing for Your Surgery', content: 'Watch this video to learn what to expect', phase: 'pre-op' },
    { day: -5, type: 'exercise', title: 'Pre-Surgery Strengthening', content: 'Gentle exercises to prepare your body', phase: 'pre-op' },
    { day: -3, type: 'form', title: 'Pre-Admission Checklist', content: 'Confirm your pre-surgery preparations', phase: 'pre-op' },
    { day: -1, type: 'message', title: 'Surgery Day Reminder', content: 'Important reminders for tomorrow', phase: 'pre-op' },
    
    // Post-op tasks
    { day: 0, type: 'form', title: 'Post-Surgery Check-In', content: 'How are you feeling after surgery?', phase: 'post-op' },
    { day: 1, type: 'exercise', title: type === 'knee' ? 'Ankle Pumps' : 'Gentle Hip Flexion', content: 'Begin gentle movements', phase: 'post-op' },
    { day: 2, type: 'form', title: 'Pain Assessment', content: 'Rate your pain levels', phase: 'post-op' },
    { day: 3, type: 'video', title: 'Early Recovery Exercises', content: 'Learn your first set of recovery exercises', phase: 'post-op' },
    { day: 5, type: 'exercise', title: type === 'knee' ? 'Knee Flexion' : 'Hip Abduction', content: 'Progress to more active exercises', phase: 'post-op' },
    { day: 7, type: 'form', title: 'Week 1 Progress Check', content: 'Assess your recovery progress', phase: 'post-op' },
    { day: 10, type: 'exercise', title: 'Walking Practice', content: 'Practice walking with support', phase: 'post-op' },
    { day: 14, type: 'form', title: 'Two Week Follow-Up', content: 'Comprehensive recovery assessment', phase: 'post-op' }
  ];

  const taskInserts = tasks.map(task => ({
    protocol_id: protocolId,
    ...task,
    description: `${task.content} for ${type} replacement recovery`,
    required: true,
    duration: task.type === 'exercise' ? '15-20 minutes' : '5-10 minutes',
    difficulty: task.type === 'exercise' ? 'easy' : null,
    frequency: task.type === 'exercise' ? { type: 'daily', repeat: true } : { repeat: false }
  }));

  const { error } = await supabase
    .from('protocol_tasks')
    .insert(taskInserts);

  if (error) {
    console.error(`Error creating tasks for ${type} protocol:`, error);
  }
}

async function assignProtocolToPatient(patientUserId: string, protocolId: string, type: 'preOp' | 'postOp') {
  console.log(`Assigning protocol to ${type} patient...`);

  // Get patient record
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', patientUserId)
    .single();

  if (patientError || !patient) {
    throw new Error(`Failed to find patient: ${patientError?.message}`);
  }

  // Get provider ID from users table
  const { data: provider } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_ACCOUNTS.provider.email)
    .single();

  const providerId = provider?.id || DEFAULT_TENANT_ID;

  // Calculate surgery date
  const surgeryDate = new Date();
  if (type === 'preOp') {
    surgeryDate.setDate(surgeryDate.getDate() + TEST_ACCOUNTS.preOpPatient.daysUntilSurgery);
  } else {
    surgeryDate.setDate(surgeryDate.getDate() - TEST_ACCOUNTS.postOpPatient.daysSinceSurgery);
  }

  // Create patient protocol assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from('patient_protocols')
    .insert({
      patient_id: patient.id,
      protocol_id: protocolId,
      surgery_date: surgeryDate.toISOString().split('T')[0],
      surgery_type: type === 'preOp' ? 'TKR' : 'THR',
      assigned_by: providerId,
      status: 'active'
    })
    .select()
    .single();

  if (assignmentError || !assignment) {
    throw new Error(`Failed to assign protocol: ${assignmentError?.message}`);
  }

  // Generate patient tasks based on protocol tasks
  const { data: protocolTasks } = await supabase
    .from('protocol_tasks')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('day');

  if (protocolTasks && protocolTasks.length > 0) {
    const patientTasks = protocolTasks.map(task => {
      const scheduledDate = new Date(surgeryDate);
      scheduledDate.setDate(scheduledDate.getDate() + task.day);

      return {
        patient_protocol_id: assignment.id,
        protocol_task_id: task.id,
        patient_id: patient.id,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        due_date: scheduledDate.toISOString().split('T')[0],
        status: 'pending'
      };
    });

    const { error: tasksError } = await supabase
      .from('patient_tasks')
      .insert(patientTasks);

    if (tasksError) {
      console.error('Error creating patient tasks:', tasksError);
    } else {
      console.log(`✓ Created ${patientTasks.length} tasks for ${type} patient`);
    }
  }
}

async function createChatConversations(patientUserId: string, type: 'preOp' | 'postOp') {
  console.log(`Creating chat conversations for ${type} patient...`);

  // Get patient record
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) return;

  // Create main conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      patient_id: patient.id,
      tenant_id: DEFAULT_TENANT_ID,
      title: `${type === 'preOp' ? 'Pre-Surgery' : 'Post-Surgery'} Support`,
      status: 'active',
      metadata: {
        type: 'patient_support',
        phase: type === 'preOp' ? 'pre-operative' : 'post-operative'
      }
    })
    .select()
    .single();

  if (convError || !conversation) {
    console.error('Error creating conversation:', convError);
    return;
  }

  // Add welcome messages
  const messages = type === 'preOp' ? [
    {
      conversation_id: conversation.id,
      sender_id: DEFAULT_TENANT_ID,
      sender_type: 'ai',
      content: `Hello ${TEST_ACCOUNTS.preOpPatient.firstName}! I'm your AI care assistant. I'm here to help you prepare for your upcoming knee replacement surgery. How are you feeling about the surgery?`,
      metadata: { type: 'welcome' }
    },
    {
      conversation_id: conversation.id,
      sender_id: patientUserId,
      sender_type: 'patient',
      content: "I'm a bit nervous but trying to stay positive. What should I be doing to prepare?",
      metadata: { type: 'patient_response' }
    },
    {
      conversation_id: conversation.id,
      sender_id: DEFAULT_TENANT_ID,
      sender_type: 'ai',
      content: "It's completely normal to feel nervous before surgery. Let me help you feel more prepared. I've scheduled some tasks for you including a pre-surgery health assessment and an educational video about what to expect. Would you like to start with the video or the assessment form?",
      metadata: { type: 'ai_response' }
    }
  ] : [
    {
      conversation_id: conversation.id,
      sender_id: DEFAULT_TENANT_ID,
      sender_type: 'ai',
      content: `Welcome back ${TEST_ACCOUNTS.postOpPatient.firstName}! Congratulations on completing your hip replacement surgery. I'm here to support you through your recovery journey. How are you feeling today?`,
      metadata: { type: 'welcome' }
    },
    {
      conversation_id: conversation.id,
      sender_id: patientUserId,
      sender_type: 'patient',
      content: "The pain is manageable but I'm having trouble sleeping. Is this normal?",
      metadata: { type: 'patient_response' }
    },
    {
      conversation_id: conversation.id,
      sender_id: DEFAULT_TENANT_ID,
      sender_type: 'ai',
      content: "Difficulty sleeping is very common after hip replacement surgery. It's often due to finding comfortable positions and some discomfort. Here are a few tips: try sleeping on your back with a pillow between your knees, use ice packs before bed, and take your pain medication as prescribed. Your sleep should improve over the next few days. How would you rate your pain on a scale of 1-10?",
      metadata: { type: 'ai_response' }
    },
    {
      conversation_id: conversation.id,
      sender_id: patientUserId,
      sender_type: 'patient',
      content: "It's about a 4 or 5 right now. The medication helps.",
      metadata: { type: 'patient_response' }
    },
    {
      conversation_id: conversation.id,
      sender_id: DEFAULT_TENANT_ID,
      sender_type: 'ai',
      content: "That's good progress for day 7! A pain level of 4-5 is within the expected range at this stage. Keep taking your medications as prescribed and continue with your prescribed exercises. I see you have some exercises scheduled - gentle movements will actually help reduce pain and stiffness. Would you like me to guide you through today's exercises?",
      metadata: { type: 'ai_response' }
    }
  ];

  const { error: msgError } = await supabase
    .from('messages')
    .insert(messages);

  if (msgError) {
    console.error('Error creating messages:', msgError);
  } else {
    console.log(`✓ Created ${messages.length} chat messages for ${type} patient`);
  }
}

async function markPostOpTasksCompleted(patientUserId: string) {
  console.log('Marking some post-op tasks as completed...');

  // Get patient record
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) return;

  // Get tasks for days 0-3
  const { data: tasks } = await supabase
    .from('patient_tasks')
    .select(`
      id,
      protocol_task:protocol_tasks!inner(
        day,
        type,
        title
      )
    `)
    .eq('patient_id', patient.id)
    .lte('protocol_task.day', 3)
    .gte('protocol_task.day', 0);

  if (!tasks || tasks.length === 0) return;

  // Mark tasks as completed
  const completedTasks = tasks.map(task => task.id);
  const completionData = {
    status: 'completed',
    completion_date: new Date().toISOString(),
    response_data: {
      completed_by: 'patient',
      feedback: 'Task completed successfully'
    }
  };

  const { error } = await supabase
    .from('patient_tasks')
    .update(completionData)
    .in('id', completedTasks);

  if (error) {
    console.error('Error marking tasks as completed:', error);
  } else {
    console.log(`✓ Marked ${completedTasks.length} tasks as completed for post-op patient`);
  }
}

// Run the script
createTestAccounts().catch(console.error);