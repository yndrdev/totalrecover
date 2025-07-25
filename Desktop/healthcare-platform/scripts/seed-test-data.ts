import { createClient } from '@/lib/supabase/server'
import { faker } from '@faker-js/faker'

/**
 * Seed script to populate the database with test data
 * Run with: npx tsx scripts/seed-test-data.ts
 */

async function seedTestData() {
  console.log('🌱 Starting test data seeding...')
  
  const supabase = await createClient()
  
  try {
    // 1. Create test tenants
    console.log('Creating test tenants...')
    const tenants = await createTenants(supabase)
    
    // 2. Create test users for each tenant
    console.log('Creating test users...')
    const users = await createUsers(supabase, tenants)
    
    // 3. Create test patients
    console.log('Creating test patients...')
    const patients = await createPatients(supabase, tenants)
    
    // 4. Create test protocols
    console.log('Creating test protocols...')
    const protocols = await createProtocols(supabase, tenants, users)
    
    // 5. Create test content
    console.log('Creating test content...')
    await createContent(supabase, tenants, users)
    
    // 6. Create protocol assignments
    console.log('Creating protocol assignments...')
    await createProtocolAssignments(supabase, protocols, patients)
    
    console.log('✅ Test data seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

async function createTenants(supabase: any) {
  const tenants = [
    {
      name: 'City General Hospital',
      tenant_type: 'hospital',
      subscription_status: 'active',
      subscription_tier: 'enterprise',
      settings: {
        primary_color: '#1e40af',
        logo_url: 'https://example.com/logo1.png'
      }
    },
    {
      name: 'Riverside Orthopedic Practice',
      tenant_type: 'practice',
      subscription_status: 'active',
      subscription_tier: 'professional',
      settings: {
        primary_color: '#059669',
        logo_url: 'https://example.com/logo2.png'
      }
    },
    {
      name: 'Sports Medicine Clinic',
      tenant_type: 'clinic',
      subscription_status: 'trial',
      subscription_tier: 'starter',
      settings: {
        primary_color: '#dc2626',
        logo_url: 'https://example.com/logo3.png'
      }
    }
  ]
  
  const { data, error } = await supabase
    .from('tenants')
    .insert(tenants)
    .select()
  
  if (error) throw error
  return data
}

async function createUsers(supabase: any, tenants: any[]) {
  const users = []
  
  for (const tenant of tenants) {
    // Create practice admin
    const adminUser = await createUser(supabase, {
      email: `admin@${tenant.name.toLowerCase().replace(/\s+/g, '')}.com`,
      password: 'Test123!',
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: 'practice_admin',
      tenant_id: tenant.id
    })
    users.push(adminUser)
    
    // Create surgeons
    for (let i = 0; i < 2; i++) {
      const surgeon = await createUser(supabase, {
        email: faker.internet.email(),
        password: 'Test123!',
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'surgeon',
        tenant_id: tenant.id,
        specialization: faker.helpers.arrayElement(['Orthopedic Surgery', 'Sports Medicine', 'Joint Replacement']),
        license_number: `MD${faker.number.int({ min: 100000, max: 999999 })}`
      })
      users.push(surgeon)
    }
    
    // Create nurses
    for (let i = 0; i < 3; i++) {
      const nurse = await createUser(supabase, {
        email: faker.internet.email(),
        password: 'Test123!',
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'nurse',
        tenant_id: tenant.id,
        license_number: `RN${faker.number.int({ min: 100000, max: 999999 })}`
      })
      users.push(nurse)
    }
    
    // Create physical therapists
    for (let i = 0; i < 2; i++) {
      const pt = await createUser(supabase, {
        email: faker.internet.email(),
        password: 'Test123!',
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'physical_therapist',
        tenant_id: tenant.id,
        specialization: 'Physical Therapy',
        license_number: `PT${faker.number.int({ min: 100000, max: 999999 })}`
      })
      users.push(pt)
    }
  }
  
  return users
}

async function createUser(supabase: any, userData: any) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      tenant_id: userData.tenant_id
    }
  })
  
  if (authError) throw authError
  
  // Create user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      full_name: `${userData.first_name} ${userData.last_name}`,
      role: userData.role,
      tenant_id: userData.tenant_id,
      phone: faker.phone.number(),
      specialization: userData.specialization,
      license_number: userData.license_number,
      is_active: true
    })
    .select()
    .single()
  
  if (userError) throw userError
  return user
}

async function createPatients(supabase: any, tenants: any[]) {
  const patients = []
  
  for (const tenant of tenants) {
    // Create 15-20 patients per tenant
    const patientCount = faker.number.int({ min: 15, max: 20 })
    
    for (let i = 0; i < patientCount; i++) {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const email = faker.internet.email({ firstName, lastName })
      
      // Create auth user for patient
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'Test123!',
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: 'patient',
          tenant_id: tenant.id
        }
      })
      
      if (authError) continue
      
      // Create patient record
      const surgeryDate = faker.date.between({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)    // 30 days future
      })
      
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authData.user.id,
          tenant_id: tenant.id,
          mrn: `MRN-${faker.number.int({ min: 100000, max: 999999 })}`,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: faker.date.birthdate({ min: 18, max: 85, mode: 'age' }),
          phone: faker.phone.number(),
          email: email,
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            zip: faker.location.zipCode()
          },
          emergency_contact: {
            name: faker.person.fullName(),
            phone: faker.phone.number(),
            relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Child', 'Sibling', 'Friend'])
          },
          insurance_info: {
            provider: faker.helpers.arrayElement(['Blue Cross', 'Aetna', 'Cigna', 'United Health']),
            policy_number: faker.string.alphanumeric(10).toUpperCase()
          },
          surgery_date: surgeryDate,
          surgery_type: faker.helpers.arrayElement(['TKR', 'THR', 'ACL', 'Shoulder', 'Spine']),
          surgeon: faker.person.fullName(),
          status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive', 'discharged']),
          preferred_language: faker.helpers.arrayElement(['en', 'en', 'en', 'es', 'fr'])
        })
        .select()
        .single()
      
      if (!patientError) {
        patients.push(patient)
      }
    }
  }
  
  return patients
}

async function createProtocols(supabase: any, tenants: any[], users: any[]) {
  const protocols = []
  const protocolTemplates = [
    {
      title: 'Total Knee Replacement Recovery Protocol',
      description: 'Comprehensive 12-week recovery protocol for total knee replacement surgery',
      surgery_type: 'TKR',
      duration_weeks: 12
    },
    {
      title: 'Total Hip Replacement Protocol',
      description: 'Evidence-based recovery protocol for hip replacement patients',
      surgery_type: 'THR',
      duration_weeks: 10
    },
    {
      title: 'ACL Reconstruction Recovery',
      description: 'Sports medicine protocol for ACL reconstruction recovery',
      surgery_type: 'ACL',
      duration_weeks: 24
    },
    {
      title: 'Rotator Cuff Repair Protocol',
      description: 'Progressive rehabilitation for rotator cuff repair',
      surgery_type: 'Shoulder',
      duration_weeks: 16
    }
  ]
  
  for (const tenant of tenants) {
    const surgeons = users.filter(u => u.tenant_id === tenant.id && u.role === 'surgeon')
    
    for (const template of protocolTemplates) {
      const surgeon = faker.helpers.arrayElement(surgeons)
      
      // Create protocol tasks
      const tasks = []
      const phases = ['Pre-op', 'Week 1-2', 'Week 3-4', 'Week 5-8', 'Week 9-12']
      
      for (const phase of phases) {
        // Add various task types for each phase
        tasks.push(
          {
            id: faker.string.uuid(),
            title: `${phase} Exercise Routine`,
            description: `Complete prescribed exercises for ${phase}`,
            task_type: 'exercise',
            phase: phase,
            day_offset: phases.indexOf(phase) * 14,
            frequency: { repeat: true, type: 'daily' }
          },
          {
            id: faker.string.uuid(),
            title: `${phase} Pain Assessment`,
            description: 'Rate your pain level and mobility',
            task_type: 'form',
            phase: phase,
            day_offset: phases.indexOf(phase) * 14 + 1,
            frequency: { repeat: true, type: 'daily' }
          },
          {
            id: faker.string.uuid(),
            title: `${phase} Educational Video`,
            description: 'Watch educational content for this phase',
            task_type: 'video',
            phase: phase,
            day_offset: phases.indexOf(phase) * 14 + 2,
            frequency: { repeat: false }
          }
        )
      }
      
      const { data: protocol, error } = await supabase
        .from('protocols')
        .insert({
          title: template.title,
          description: template.description,
          surgery_type: template.surgery_type,
          tasks: tasks,
          created_by: surgeon.id,
          tenant_id: tenant.id,
          is_template: true,
          is_public: faker.datatype.boolean(),
          status: 'active',
          version: '1.0',
          metadata: {
            duration_weeks: template.duration_weeks,
            evidence_based: true,
            last_reviewed: faker.date.recent()
          }
        })
        .select()
        .single()
      
      if (!error) {
        protocols.push(protocol)
      }
    }
  }
  
  return protocols
}

async function createContent(supabase: any, tenants: any[], users: any[]) {
  for (const tenant of tenants) {
    const creators = users.filter(u => 
      u.tenant_id === tenant.id && 
      ['surgeon', 'physical_therapist', 'practice_admin'].includes(u.role)
    )
    
    // Create forms
    const forms = [
      { title: 'Daily Pain Assessment', category: 'assessment', description: 'Track your daily pain levels' },
      { title: 'Range of Motion Tracker', category: 'assessment', description: 'Record your joint mobility progress' },
      { title: 'Medication Log', category: 'tracking', description: 'Track your medication intake' },
      { title: 'Patient Satisfaction Survey', category: 'feedback', description: 'Help us improve your care' }
    ]
    
    for (const form of forms) {
      await supabase.from('content_forms').insert({
        ...form,
        fields: generateFormFields(form.category),
        tenant_id: tenant.id,
        created_by: faker.helpers.arrayElement(creators).id,
        is_active: true
      })
    }
    
    // Create videos
    const videos = [
      { title: 'Pre-Surgery Preparation', category: 'education', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
      { title: 'Post-Op Care Instructions', category: 'education', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
      { title: 'Home Exercise Guide', category: 'exercise', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
      { title: 'Mobility Aid Training', category: 'education', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }
    ]
    
    for (const video of videos) {
      await supabase.from('content_videos').insert({
        ...video,
        duration: faker.number.int({ min: 5, max: 20 }),
        thumbnail_url: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
        tenant_id: tenant.id,
        created_by: faker.helpers.arrayElement(creators).id
      })
    }
    
    // Create exercises
    const exercises = [
      { title: 'Quad Sets', category: 'strength', difficulty: 'beginner' },
      { title: 'Straight Leg Raises', category: 'strength', difficulty: 'beginner' },
      { title: 'Heel Slides', category: 'flexibility', difficulty: 'beginner' },
      { title: 'Standing Hip Abduction', category: 'strength', difficulty: 'intermediate' },
      { title: 'Wall Squats', category: 'strength', difficulty: 'advanced' }
    ]
    
    for (const exercise of exercises) {
      await supabase.from('content_exercises').insert({
        ...exercise,
        description: faker.lorem.paragraph(),
        instructions: faker.lorem.paragraphs(3).split('\n'),
        sets: faker.number.int({ min: 2, max: 4 }),
        reps: faker.number.int({ min: 10, max: 20 }),
        duration: faker.number.int({ min: 30, max: 60 }),
        equipment: faker.helpers.arrayElement(['None', 'Resistance Band', 'Light Weights']),
        image_url: `https://example.com/exercise-${faker.number.int({ min: 1, max: 10 })}.jpg`,
        video_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        tenant_id: tenant.id,
        created_by: faker.helpers.arrayElement(creators).id
      })
    }
  }
}

async function createProtocolAssignments(supabase: any, protocols: any[], patients: any[]) {
  for (const patient of patients) {
    // Find protocols from the same tenant
    const tenantProtocols = protocols.filter(p => p.tenant_id === patient.tenant_id)
    
    if (tenantProtocols.length > 0 && patient.surgery_date) {
      const protocol = faker.helpers.arrayElement(tenantProtocols)
      
      // Create protocol assignment
      const { data: assignment, error: assignError } = await supabase
        .from('protocol_assignments')
        .insert({
          patient_id: patient.id,
          protocol_id: protocol.id,
          assigned_date: patient.surgery_date,
          status: 'active',
          tenant_id: patient.tenant_id
        })
        .select()
        .single()
      
      if (!assignError && assignment) {
        // Create patient tasks based on protocol tasks
        const protocolTasks = protocol.tasks || []
        
        for (const task of protocolTasks) {
          // Create base task
          const { data: createdTask, error: taskError } = await supabase
            .from('tasks')
            .insert({
              title: task.title,
              description: task.description,
              task_type: task.task_type,
              tenant_id: patient.tenant_id,
              surgery_type: protocol.surgery_type,
              phase: task.phase,
              day_offset: task.day_offset,
              content: task.content,
              metadata: { protocol_id: protocol.id, frequency: task.frequency }
            })
            .select()
            .single()
          
          if (!taskError && createdTask) {
            // Calculate scheduled dates based on frequency
            const scheduledDates = calculateScheduledDates(
              new Date(patient.surgery_date),
              task.day_offset,
              task.frequency
            )
            
            // Create patient tasks for each scheduled date
            for (const scheduledDate of scheduledDates.slice(0, 10)) { // Limit to 10 for testing
              await supabase.from('patient_tasks').insert({
                patient_id: patient.id,
                task_id: createdTask.id,
                protocol_assignment_id: assignment.id,
                scheduled_date: scheduledDate.toISOString().split('T')[0],
                status: faker.helpers.arrayElement(['pending', 'completed', 'in_progress']),
                tenant_id: patient.tenant_id
              })
            }
          }
        }
      }
    }
  }
}

function generateFormFields(category: string) {
  switch (category) {
    case 'assessment':
      return [
        { name: 'pain_level', type: 'slider', label: 'Pain Level (0-10)', required: true },
        { name: 'mobility', type: 'select', label: 'Mobility Status', options: ['Bedridden', 'Walker', 'Cane', 'Independent'] },
        { name: 'swelling', type: 'checkbox', label: 'Any Swelling?', required: false },
        { name: 'notes', type: 'textarea', label: 'Additional Notes', required: false }
      ]
    case 'tracking':
      return [
        { name: 'medication_name', type: 'text', label: 'Medication Name', required: true },
        { name: 'dosage', type: 'text', label: 'Dosage', required: true },
        { name: 'time_taken', type: 'time', label: 'Time Taken', required: true },
        { name: 'side_effects', type: 'textarea', label: 'Side Effects', required: false }
      ]
    default:
      return [
        { name: 'field1', type: 'text', label: 'Field 1', required: true },
        { name: 'field2', type: 'textarea', label: 'Field 2', required: false }
      ]
  }
}

function calculateScheduledDates(surgeryDate: Date, dayOffset: number, frequency: any): Date[] {
  const dates: Date[] = []
  const startDate = new Date(surgeryDate)
  startDate.setDate(startDate.getDate() + dayOffset)
  
  if (!frequency.repeat) {
    dates.push(new Date(startDate))
    return dates
  }
  
  const endDate = new Date(surgeryDate)
  endDate.setDate(endDate.getDate() + 90) // 90 days for testing
  
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    
    switch (frequency.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'everyOtherDay':
        currentDate.setDate(currentDate.getDate() + 2)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      default:
        currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  
  return dates
}

// Run the seed script
seedTestData().catch(console.error)