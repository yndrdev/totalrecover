import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ProtocolTemplate {
  name: string
  description: string
  surgery_types: string[]
  duration_days: number
  phases: any[]
  is_active: boolean
  is_draft: boolean
  version: string
  tasks: {
    name: string
    description: string
    type: 'exercise' | 'assessment' | 'medication' | 'education' | 'message' | 'video' | 'form'
    day: number
    duration_minutes: number
    is_required: boolean
    instructions: string
    content?: any
  }[]
}

const protocols: ProtocolTemplate[] = [
  {
    name: 'TJV Standard Recovery Protocol',
    description: 'Comprehensive recovery protocol for total joint replacement surgeries. Includes pre-operative preparation, immediate post-operative care, and long-term recovery phases.',
    surgery_types: ['TKA', 'THA'],
    duration_days: 180,
    phases: [
      { name: 'Pre-operative', start_day: -30, end_day: -1 },
      { name: 'Immediate Post-op', start_day: 0, end_day: 7 },
      { name: 'Early Recovery', start_day: 8, end_day: 30 },
      { name: 'Mid Recovery', start_day: 31, end_day: 90 },
      { name: 'Late Recovery', start_day: 91, end_day: 180 }
    ],
    is_active: true,
    is_draft: false,
    version: '2.3',
    tasks: [
      // Pre-operative tasks
      {
        name: 'Pre-Surgery Education',
        description: 'Watch educational video about your upcoming surgery',
        type: 'video',
        day: -14,
        duration_minutes: 30,
        is_required: true,
        instructions: 'Watch the entire video and take notes on important points'
      },
      {
        name: 'Pre-Op Health Assessment',
        description: 'Complete pre-operative health questionnaire',
        type: 'form',
        day: -7,
        duration_minutes: 20,
        is_required: true,
        instructions: 'Answer all questions honestly and completely'
      },
      {
        name: 'Pre-Op Exercises',
        description: 'Strengthen muscles before surgery',
        type: 'exercise',
        day: -7,
        duration_minutes: 15,
        is_required: true,
        instructions: 'Perform 3 sets of 10 repetitions for each exercise'
      },
      // Day 0 - Surgery day
      {
        name: 'Post-Surgery Check-in',
        description: 'Initial post-operative assessment',
        type: 'assessment',
        day: 0,
        duration_minutes: 10,
        is_required: true,
        instructions: 'Rate your pain level and report any concerns'
      },
      // Week 1
      {
        name: 'Ankle Pumps',
        description: 'Move your foot up and down at the ankle joint',
        type: 'exercise',
        day: 1,
        duration_minutes: 5,
        is_required: true,
        instructions: 'Perform 10-15 repetitions every hour while awake'
      },
      {
        name: 'Daily Pain Assessment',
        description: 'Rate your pain level from 0-10',
        type: 'assessment',
        day: 1,
        duration_minutes: 5,
        is_required: true,
        instructions: 'Record pain level before and after exercises'
      },
      {
        name: 'Quad Sets',
        description: 'Tighten thigh muscles while leg is straight',
        type: 'exercise',
        day: 2,
        duration_minutes: 10,
        is_required: true,
        instructions: 'Hold for 5 seconds, repeat 10 times, 3 sets per day'
      },
      {
        name: 'Heel Slides',
        description: 'Slide heel toward buttocks to bend knee',
        type: 'exercise',
        day: 3,
        duration_minutes: 10,
        is_required: true,
        instructions: 'Slide slowly and hold for 5 seconds, 10 repetitions'
      },
      {
        name: 'Walking Practice',
        description: 'Short distance walking with assistance',
        type: 'exercise',
        day: 3,
        duration_minutes: 20,
        is_required: true,
        instructions: 'Start with 50 feet, gradually increase distance'
      },
      // Week 2-4
      {
        name: 'Range of Motion Exercises',
        description: 'Improve knee flexibility',
        type: 'exercise',
        day: 8,
        duration_minutes: 20,
        is_required: true,
        instructions: 'Perform gentle bending and straightening exercises'
      },
      {
        name: 'Strength Training',
        description: 'Progressive resistance exercises',
        type: 'exercise',
        day: 14,
        duration_minutes: 30,
        is_required: true,
        instructions: 'Use resistance bands as prescribed by therapist'
      },
      // Month 2-3
      {
        name: 'Advanced Mobility',
        description: 'Stairs and balance training',
        type: 'exercise',
        day: 31,
        duration_minutes: 30,
        is_required: true,
        instructions: 'Practice stair climbing and single-leg balance'
      },
      {
        name: 'Monthly Progress Assessment',
        description: 'Comprehensive recovery evaluation',
        type: 'assessment',
        day: 30,
        duration_minutes: 20,
        is_required: true,
        instructions: 'Complete all sections of the progress form'
      }
    ]
  },
  {
    name: 'Accelerated Recovery Protocol',
    description: 'Fast-track recovery protocol designed for younger, healthier patients with good pre-operative fitness levels.',
    surgery_types: ['TKA', 'THA'],
    duration_days: 120,
    phases: [
      { name: 'Pre-operative', start_day: -14, end_day: -1 },
      { name: 'Immediate Post-op', start_day: 0, end_day: 3 },
      { name: 'Early Recovery', start_day: 4, end_day: 21 },
      { name: 'Active Recovery', start_day: 22, end_day: 60 },
      { name: 'Return to Activity', start_day: 61, end_day: 120 }
    ],
    is_active: true,
    is_draft: false,
    version: '1.5',
    tasks: [
      {
        name: 'Pre-Op Conditioning',
        description: 'High-intensity preparation exercises',
        type: 'exercise',
        day: -14,
        duration_minutes: 30,
        is_required: true,
        instructions: 'Complete full workout routine daily'
      },
      {
        name: 'Immediate Mobilization',
        description: 'Begin walking within hours of surgery',
        type: 'exercise',
        day: 0,
        duration_minutes: 15,
        is_required: true,
        instructions: 'Walk with assistance as soon as cleared by medical team'
      },
      {
        name: 'Aggressive ROM',
        description: 'Intensive range of motion exercises',
        type: 'exercise',
        day: 2,
        duration_minutes: 25,
        is_required: true,
        instructions: 'Push to comfortable limits, 4 times daily'
      },
      {
        name: 'Functional Training',
        description: 'Sport-specific movement patterns',
        type: 'exercise',
        day: 21,
        duration_minutes: 45,
        is_required: true,
        instructions: 'Begin sport-specific drills as tolerated'
      }
    ]
  },
  {
    name: 'Complex Case Protocol',
    description: 'Extended protocol for patients with comorbidities, complications, or revision surgeries requiring careful monitoring.',
    surgery_types: ['TKA', 'THA', 'TSA'],
    duration_days: 240,
    phases: [
      { name: 'Extended Pre-op', start_day: -45, end_day: -1 },
      { name: 'Careful Post-op', start_day: 0, end_day: 14 },
      { name: 'Gradual Recovery', start_day: 15, end_day: 60 },
      { name: 'Sustained Recovery', start_day: 61, end_day: 150 },
      { name: 'Long-term Management', start_day: 151, end_day: 240 }
    ],
    is_active: true,
    is_draft: false,
    version: '1.2',
    tasks: [
      {
        name: 'Medical Optimization',
        description: 'Prepare medical conditions for surgery',
        type: 'assessment',
        day: -30,
        duration_minutes: 30,
        is_required: true,
        instructions: 'Work with medical team to optimize health status'
      },
      {
        name: 'Gentle Activation',
        description: 'Very gentle initial movements',
        type: 'exercise',
        day: 2,
        duration_minutes: 10,
        is_required: true,
        instructions: 'Move only as directed by therapist'
      },
      {
        name: 'Complication Monitoring',
        description: 'Daily assessment for complications',
        type: 'assessment',
        day: 1,
        duration_minutes: 15,
        is_required: true,
        instructions: 'Report any unusual symptoms immediately'
      }
    ]
  },
  {
    name: 'Shoulder Recovery Protocol',
    description: 'Specialized protocol for total shoulder arthroplasty patients with focus on protecting the repair while restoring function.',
    surgery_types: ['TSA'],
    duration_days: 150,
    phases: [
      { name: 'Pre-operative', start_day: -21, end_day: -1 },
      { name: 'Protection Phase', start_day: 0, end_day: 28 },
      { name: 'Active ROM Phase', start_day: 29, end_day: 84 },
      { name: 'Strengthening Phase', start_day: 85, end_day: 150 }
    ],
    is_active: true,
    is_draft: false,
    version: '3.0',
    tasks: [
      {
        name: 'Pendulum Exercises',
        description: 'Gentle passive shoulder movement',
        type: 'exercise',
        day: 7,
        duration_minutes: 10,
        is_required: true,
        instructions: 'Let arm hang and swing gently in circles'
      },
      {
        name: 'Sling Management',
        description: 'Proper sling use and positioning',
        type: 'education',
        day: 1,
        duration_minutes: 15,
        is_required: true,
        instructions: 'Wear sling as directed, remove only for exercises'
      },
      {
        name: 'Scapular Stabilization',
        description: 'Strengthen shoulder blade muscles',
        type: 'exercise',
        day: 28,
        duration_minutes: 20,
        is_required: true,
        instructions: 'Focus on proper shoulder blade positioning'
      }
    ]
  }
]

async function seedProtocols() {
  console.log('Starting protocol seeding...')
  
  try {
    // First, check if recovery_protocols table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('recovery_protocols')
      .select('id')
      .limit(1)
    
    console.log('Protocol table check:', { tableCheck, tableError })
    // Get a demo provider to assign as creator
    const { data: providers, error: providerError } = await supabase
      .from('profiles')
      .select('id, tenant_id')
      .eq('role', 'provider')
      .limit(1)
    
    if (providerError || !providers || providers.length === 0) {
      console.error('No provider found to assign as protocol creator')
      console.error('Provider error:', providerError)
      return
    }
    
    const providerId = providers[0].id
    const tenantId = providers[0].tenant_id
    console.log(`Using provider ${providerId} with tenant ${tenantId} as protocol creator`)
    
    for (const protocolTemplate of protocols) {
      console.log(`\nCreating protocol: ${protocolTemplate.name}`)
      
      // Create the protocol
      const protocolData = {
        tenant_id: tenantId,
        name: protocolTemplate.name,
        description: protocolTemplate.description,
        surgery_types: protocolTemplate.surgery_types,
        timeline_start: -45,
        timeline_end: protocolTemplate.duration_days,
        created_by: providerId,
        is_active: protocolTemplate.is_active
      }
      
      console.log('Inserting protocol data:', JSON.stringify(protocolData, null, 2))
      
      const { data: protocol, error: protocolError } = await supabase
        .from('recovery_protocols')
        .insert(protocolData)
        .select()
        .single()
      
      if (protocolError || !protocol) {
        console.error(`Error creating protocol ${protocolTemplate.name}:`, protocolError)
        console.error('Response data:', protocol)
        continue
      }
      
      console.log(`Protocol created with ID: ${protocol.id}`)
      
      // Create tasks for the protocol
      const tasksToInsert = protocolTemplate.tasks.map((task, index) => ({
        protocol_id: protocol.id,
        tenant_id: tenantId,
        day: task.day,
        task_type: task.type === 'assessment' ? 'form' : 
                   task.type === 'education' ? 'message' : 
                   task.type === 'medication' ? 'message' : task.type, // Map to valid types
        title: task.name,
        description: task.description,
        content_data: {
          instructions: task.instructions,
          duration_minutes: task.duration_minutes,
          content: task.content
        },
        required: task.is_required,
        metadata: {
          sort_order: index,
          original_type: task.type
        }
      }))
      
      console.log(`Inserting ${tasksToInsert.length} tasks...`)
      
      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
      
      if (tasksError) {
        console.error(`Error creating tasks for protocol ${protocolTemplate.name}:`, tasksError)
      } else {
        console.log(`Created ${tasksToInsert.length} tasks for protocol`)
      }
    }
    
    console.log('\nProtocol seeding completed!')
    
    // Display summary
    const { data: protocolCount } = await supabase
      .from('recovery_protocols')
      .select('id', { count: 'exact' })
    
    const { data: taskCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
    
    console.log(`\nSummary:`)
    console.log(`- Total protocols: ${protocolCount?.length || 0}`)
    console.log(`- Total tasks: ${taskCount?.length || 0}`)
    
  } catch (error) {
    console.error('Error seeding protocols:', error)
  }
}

// Run the seeding
seedProtocols()