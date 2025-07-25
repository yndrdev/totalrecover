# Post-Migration Common Operations Guide

## Quick Reference for Common Tasks

### 1. Creating a New Provider
```typescript
// In your registration flow
const { data: authUser, error: authError } = await supabase.auth.signUp({
  email: 'provider@example.com',
  password: 'securepassword',
  options: {
    data: {
      role: 'provider',
      full_name: 'Dr. John Smith'
    }
  }
})

// Profile is created automatically via database trigger
// Then create provider record
const { data: provider, error } = await supabase
  .from('providers')
  .insert({
    user_id: authUser.user.id,
    tenant_id: '00000000-0000-0000-0000-000000000000',
    first_name: 'John',
    last_name: 'Smith',
    specialty: 'Orthopedic Surgery',
    license_number: 'OS12345'
  })
```

### 2. Creating a New Patient (Provider Action)
```typescript
// First create auth user
const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
  email: 'patient@example.com',
  password: 'temporarypassword',
  email_confirm: true,
  user_metadata: {
    role: 'patient',
    full_name: 'Jane Doe'
  }
})

// Then create patient record
const { data: patient, error } = await supabase
  .from('patients')
  .insert({
    user_id: user.id,
    tenant_id: userTenantId,
    first_name: 'Jane',
    last_name: 'Doe',
    surgeon_id: currentProviderId,
    surgery_type: 'TKA',
    surgery_date: '2024-02-15'
  })
```

### 3. Assigning a Protocol to Patient
```typescript
// Get protocol
const { data: protocol } = await supabase
  .from('recovery_protocols')
  .select('*')
  .eq('name', 'TJV Recovery Protocol')
  .single()

// Get all tasks for protocol
const { data: protocolTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('protocol_id', protocol.id)

// Create patient tasks based on surgery date
const patientTasks = protocolTasks.map(task => ({
  tenant_id: userTenantId,
  patient_id: patientId,
  task_id: task.id,
  protocol_id: protocol.id,
  scheduled_date: addDays(surgeryDate, task.day_offset),
  status: 'pending'
}))

const { error } = await supabase
  .from('patient_tasks')
  .insert(patientTasks)

// Log the action
await auditLogger.logProtocolAssignment({
  tenant_id: userTenantId,
  user_id: currentUserId,
  patient_id: patientId,
  protocol_id: protocol.id
})
```

### 4. Creating a Conversation for Patient
```typescript
// Check if conversation exists
const { data: existingConv } = await supabase
  .from('conversations')
  .select('*')
  .eq('patient_id', patientId)
  .single()

if (!existingConv) {
  const { data: conversation } = await supabase
    .from('conversations')
    .insert({
      tenant_id: userTenantId,
      patient_id: patientId,
      title: 'Recovery Support Chat'
    })
    .select()
    .single()
    
  // Send welcome message
  await supabase
    .from('messages')
    .insert({
      tenant_id: userTenantId,
      conversation_id: conversation.id,
      sender_type: 'system',
      content: 'Welcome to your recovery support chat! Your care team is here to help you throughout your recovery journey.'
    })
}
```

### 5. Sending a Message (Patient or Provider)
```typescript
const { data: message, error } = await supabase
  .from('messages')
  .insert({
    tenant_id: userTenantId,
    conversation_id: conversationId,
    sender_id: currentUserId,
    sender_type: userRole, // 'patient' or 'provider'
    content: messageText
  })
  .select()
  .single()

// Update conversation last activity
await supabase
  .from('conversations')
  .update({ last_activity_at: new Date().toISOString() })
  .eq('id', conversationId)
```

### 6. Completing a Task (Patient Action)
```typescript
const { error } = await supabase
  .from('patient_tasks')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    completion_data: {
      // Task-specific completion data
      form_responses: { /* ... */ },
      exercise_reps: 10,
      video_watched: true
    }
  })
  .eq('id', taskId)

// Log completion
await auditLogger.logTaskCompletion({
  tenant_id: userTenantId,
  user_id: currentUserId,
  task_id: taskId,
  patient_id: patientId
})
```

### 7. Real-time Subscriptions
```typescript
// Subscribe to messages for a conversation
const messageSubscription = supabase
  .channel(`messages:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI with new message
    }
  )
  .subscribe()

// Subscribe to task updates for a patient
const taskSubscription = supabase
  .channel(`tasks:${patientId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'patient_tasks',
      filter: `patient_id=eq.${patientId}`
    },
    (payload) => {
      console.log('Task updated:', payload.new)
      // Update UI with task changes
    }
  )
  .subscribe()
```

### 8. Common Queries

#### Get Patient with Profile and Current Tasks
```typescript
const { data: patient } = await supabase
  .from('patients')
  .select(`
    *,
    profile:profiles!patients_user_id_fkey(*),
    tasks:patient_tasks(
      *,
      task:tasks(*)
    )
  `)
  .eq('id', patientId)
  .eq('tasks.scheduled_date', today)
  .single()
```

#### Get Provider's Assigned Patients
```typescript
const { data: patients } = await supabase
  .from('patients')
  .select(`
    *,
    profile:profiles!patients_user_id_fkey(*),
    last_message:conversations(
      messages(content, created_at)
    )
  `)
  .eq('surgeon_id', providerId)
  .eq('status', 'active')
  .order('last_name')
```

#### Get Conversation with Recent Messages
```typescript
const { data: conversation } = await supabase
  .from('conversations')
  .select(`
    *,
    patient:patients(
      *,
      profile:profiles!patients_user_id_fkey(*)
    ),
    messages(
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    )
  `)
  .eq('id', conversationId)
  .order('messages.created_at', { ascending: false })
  .limit('messages', 50)
  .single()
```

## Troubleshooting Common Issues

### Foreign Key Errors
If you get foreign key constraint errors, ensure:
1. Parent record exists before creating child
2. tenant_id matches across related records
3. User has proper permissions via RLS

### RLS Policy Denials
If operations are denied by RLS:
1. Check user's role in profiles table
2. Verify tenant_id matches
3. Use service role key for admin operations

### Real-time Not Working
If subscriptions don't receive updates:
1. Enable realtime for the table in Supabase dashboard
2. Check filter syntax matches exactly
3. Verify RLS policies allow SELECT on the table

## Best Practices

1. **Always include tenant_id** in all inserts for multi-tenant isolation
2. **Use transactions** for operations that modify multiple tables
3. **Log all provider actions** using the AuditLogger
4. **Handle errors gracefully** with user-friendly messages
5. **Clean up subscriptions** when components unmount
6. **Use proper TypeScript types** for all database operations