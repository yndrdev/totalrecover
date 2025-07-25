import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://slhdxlhnwujvqkwdgfko.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaGR4bGhud3VqdnFrd2RnZmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI5NjM3NiwiZXhwIjoyMDY3ODcyMzc2fQ.d6mv3rYpvSa4mjhWpOkcNUGwqzpgq0a6cNIyl__EvdE'
)

async function fixSarahPatientRecord() {
  try {
    console.log('🔍 Checking Sarah Johnson\'s records...')
    
    // Get Sarah's user record
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError
    
    const sarah = users.find(u => u.email === 'sarah.johnson@email.com')
    if (!sarah) {
      console.log('❌ Sarah Johnson user not found')
      return
    }
    
    console.log('✓ Found Sarah user:', sarah.id)
    
    // Check if patient record exists
    const { data: existingPatient, error: patientCheckError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', sarah.id)
      .single()
    
    if (existingPatient) {
      console.log('✓ Patient record already exists:', existingPatient.id)
      return
    }
    
    console.log('⚠️ No patient record found, creating one...')
    
    // Create patient record
    const surgeryDate = new Date()
    surgeryDate.setDate(surgeryDate.getDate() - 7) // 7 days post-surgery
    
    const { data: newPatient, error: createError } = await supabase
      .from('patients')
      .insert({
        user_id: sarah.id,
        tenant_id: 'acme-health',
        surgery_type: 'TKA',
        surgery_date: surgeryDate.toISOString().split('T')[0],
        risk_level: 'low',
        provider_id: null,
        first_name: 'Sarah',
        last_name: 'Johnson',
        date_of_birth: '1965-05-15',
        phone_number: '+1234567890',
        emergency_contact_name: 'John Johnson',
        emergency_contact_phone: '+1234567891',
        medical_record_number: 'MRN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating patient record:', createError)
      throw createError
    }
    
    console.log('✅ Patient record created successfully:', newPatient.id)
    
    // Now assign the TJV protocol and tasks to Sarah
    console.log('\n📋 Assigning TJV Recovery Protocol...')
    
    // Get the TJV protocol
    const { data: protocol, error: protocolError } = await supabase
      .from('recovery_protocols')
      .select('*')
      .eq('tenant_id', 'acme-health')
      .eq('name', 'TJV Recovery Protocol - TKA')
      .single()
    
    if (protocolError || !protocol) {
      console.error('❌ TJV Recovery Protocol not found')
      return
    }
    
    console.log('✓ Found protocol:', protocol.id)
    
    // Get all protocol tasks
    const { data: protocolTasks, error: tasksError } = await supabase
      .from('protocol_tasks')
      .select('*, task:tasks(*)')
      .eq('protocol_id', protocol.id)
      .order('day', { ascending: true })
    
    if (tasksError || !protocolTasks) {
      console.error('❌ Error fetching protocol tasks:', tasksError)
      return
    }
    
    console.log(`✓ Found ${protocolTasks.length} tasks to assign`)
    
    // Create patient tasks
    const patientTasks = protocolTasks.map(pt => {
      const scheduledDate = new Date(surgeryDate)
      scheduledDate.setDate(scheduledDate.getDate() + pt.day)
      
      return {
        patient_id: newPatient.id,
        task_id: pt.task_id,
        tenant_id: 'acme-health',
        status: pt.day < 0 ? 'completed' : pt.day <= 7 ? 'pending' : 'scheduled',
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        completed_at: pt.day < 0 ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
    
    const { error: insertTasksError } = await supabase
      .from('patient_tasks')
      .insert(patientTasks)
    
    if (insertTasksError) {
      console.error('❌ Error assigning tasks:', insertTasksError)
      throw insertTasksError
    }
    
    console.log(`✅ Successfully assigned ${patientTasks.length} tasks to Sarah`)
    
    // Create an initial conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        patient_id: newPatient.id,
        tenant_id: 'acme-health',
        status: 'active',
        metadata: {
          surgery_type: 'TKA',
          recovery_day: 7
        }
      })
      .select()
      .single()
    
    if (convError) {
      console.error('❌ Error creating conversation:', convError)
    } else {
      console.log('✅ Conversation created:', conversation.id)
      
      // Add a welcome message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: 'ai-assistant',
        content: 'Hello Sarah! Welcome to your TJV Recovery journey. I\'m here to help guide you through your recovery after your Total Knee Arthroplasty. How are you feeling today on Day 7 of your recovery?',
        sender_type: 'ai',
        tenant_id: 'acme-health'
      })
    }
    
    console.log('\n✅ Sarah Johnson is now fully set up in the system!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixSarahPatientRecord()