import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { getTasksForDay, getPhaseForDay } from '@/lib/data/tjv-real-timeline-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface RequestData {
  message: string
  patientId: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export async function POST(request: Request) {
  try {
    const data: RequestData = await request.json()
    const { message, patientId, conversationHistory = [] } = data

    // Get patient information including surgery date
    const supabase = await createClient()
    const { data: patient, error: patientError } = await supabase
      .from('demo_patients')
      .select('id, name, surgery_date, surgery_type, recovery_day')
      .eq('id', patientId)
      .single()

    if (patientError || !patient) {
      console.error('Patient not found:', patientError)
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Calculate recovery day
    const surgeryDate = patient.surgery_date ? new Date(patient.surgery_date) : null
    const today = new Date()
    const recoveryDay = surgeryDate 
      ? Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Get protocol tasks for current day and upcoming week
    const todayTasks = getTasksForDay(recoveryDay)
    const upcomingTasks = []
    for (let i = 1; i <= 7; i++) {
      const dayTasks = getTasksForDay(recoveryDay + i)
      if (dayTasks.length > 0) {
        upcomingTasks.push({ day: recoveryDay + i, tasks: dayTasks })
      }
    }

    // Get current recovery phase
    const currentPhase = getPhaseForDay(recoveryDay)

    // Get task completion status for today
    const { data: taskStatuses } = await supabase
      .from('patient_tasks')
      .select('task_title, status')
      .eq('patient_id', patientId)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .lte('scheduled_date', new Date().toISOString().split('T')[0])

    const taskStatusMap = new Map(
      taskStatuses?.map((t: any) => [t.task_title, t.status]) || []
    )

    // Build protocol context
    const protocolContext = {
      recoveryDay,
      phase: currentPhase,
      todayTasks: todayTasks.map(task => ({
        ...task,
        status: taskStatusMap.get(task.title) || 'pending'
      })),
      upcomingTasks: upcomingTasks.slice(0, 3), // Next 3 days with tasks
      completedToday: taskStatuses?.filter((t: any) => t.status === 'completed').length || 0,
      pendingToday: taskStatuses?.filter((t: any) => t.status === 'pending').length || 0
    }

    // Build enhanced system prompt
    const systemPrompt = `You are a recovery assistant for ${patient.name}, who is on day ${recoveryDay} following ${patient.surgery_type || 'knee surgery'}.

Current Recovery Phase: ${protocolContext.phase}

Today's Tasks (Day ${recoveryDay}):
${protocolContext.todayTasks.map(task => 
  `- ${task.title} (${task.type}) - Status: ${task.status}`
).join('\n')}

Tasks Completed Today: ${protocolContext.completedToday}/${protocolContext.todayTasks.length}

Upcoming Tasks:
${protocolContext.upcomingTasks.map(({ day, tasks }) => 
  `Day ${day}: ${tasks.map(t => t.title).join(', ')}`
).join('\n')}

Guidelines:
1. Be supportive and encouraging about their recovery progress
2. Reference specific tasks when relevant to the conversation
3. Remind about pending tasks if appropriate
4. Celebrate completed tasks and progress
5. Provide guidance based on their current recovery phase
6. If they report concerning symptoms, suggest they contact their care team
7. Keep responses concise and focused on their recovery

Respond naturally to their message while being aware of their recovery context and scheduled tasks.`

    // Check for action intents in the message
    const actionChecks = {
      taskCompletion: /\b(completed?|done|finished?|did)\b.*\b(exercise|form|video|task)/i,
      concern: /\b(pain|hurt|swelling|concern|worried|problem|issue)\b/i,
      question: /\?|how|what|when|why|should/i
    }

    let aiResponse = ''
    const detectedActions: Array<{ type: string; confidence: number; taskHint?: string; reason?: string }> = []

    // Generate AI response using OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-4).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })

      aiResponse = completion.choices[0]?.message?.content || ''

      // Detect actions based on context
      if (actionChecks.taskCompletion.test(message)) {
        detectedActions.push({
          type: 'task_completion',
          confidence: 0.8,
          taskHint: message.match(/\b(exercise|form|video|task)\b/i)?.[0]
        })
      }

      if (actionChecks.concern.test(message)) {
        detectedActions.push({
          type: 'escalation',
          confidence: 0.9,
          reason: 'Patient reported potential concern'
        })
      }

    } catch (openAIError) {
      console.error('OpenAI error:', openAIError)
      
      // Fallback response based on protocol context
      if (protocolContext.pendingToday > 0) {
        aiResponse = `I see you have ${protocolContext.pendingToday} task${protocolContext.pendingToday > 1 ? 's' : ''} remaining today. ${
          protocolContext.todayTasks.find(t => t.status === 'pending')?.title
        } is one of them. How can I help you with your recovery today?`
      } else if (protocolContext.completedToday === protocolContext.todayTasks.length && protocolContext.todayTasks.length > 0) {
        aiResponse = `Great job completing all your tasks for today! You're making excellent progress in your recovery. Tomorrow you have ${
          protocolContext.upcomingTasks[0]?.tasks.length || 0
        } tasks scheduled. Is there anything else I can help you with?`
      } else {
        aiResponse = `You're on day ${recoveryDay} of your recovery. How are you feeling today? Let me know if you need any help with your recovery tasks or have any questions.`
      }
    }

    // Add task suggestions if no pending tasks mentioned
    if (!actionChecks.taskCompletion.test(message) && protocolContext.pendingToday > 0) {
      const pendingTask = protocolContext.todayTasks.find(t => t.status === 'pending')
      if (pendingTask && Math.random() > 0.7) { // 30% chance to remind
        aiResponse += `\n\nBy the way, don't forget about your "${pendingTask.title}" ${pendingTask.type} for today!`
      }
    }

    return NextResponse.json({
      response: aiResponse,
      context: {
        recoveryDay,
        phase: protocolContext.phase,
        tasksToday: protocolContext.todayTasks.length,
        completedToday: protocolContext.completedToday,
        detectedActions
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in protocol-ai-response:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}