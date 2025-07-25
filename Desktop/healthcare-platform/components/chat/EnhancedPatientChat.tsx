'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusBadge, RecoveryDayBadge, OnlineStatus } from '@/components/ui/design-system/StatusIndicator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConversationalForm } from './conversational-form'
import { VideoMessage } from './video-message'
import { ProtocolDrivenChat } from './ProtocolDrivenChat'
import {
  Send,
  Mic,
  Calendar,
  Activity,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  Stethoscope,
  FileText,
  Play,
  PauseCircle,
  AlertTriangle,
  Circle,
  ChevronLeft,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Database } from '@/types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { colors } from '@/lib/design-system/constants'

// Date formatting utilities
const format = (date: Date, formatStr: string) => {
  if (formatStr === 'yyyy-MM-dd') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  if (formatStr === 'MMM d') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    return `${month} ${day}`
  }
  
  if (formatStr === 'h:mm a') {
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
  }
  
  return date.toLocaleString()
}

const differenceInDays = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Mock data for forms and videos based on task content
const getMockFormData = (taskTitle: string, taskType: string) => {
  if (taskTitle.toLowerCase().includes('pain') || taskTitle.toLowerCase().includes('assessment')) {
    return {
      id: 'pain-assessment-form',
      title: 'Pain Assessment',
      description: 'Help us understand your current pain levels and recovery progress',
      questions: [
        {
          id: 'pain-level',
          type: 'rating' as const,
          question: 'How would you rate your current pain level?',
          description: '1 = No pain, 5 = Severe pain',
          required: true,
          max: 5
        },
        {
          id: 'pain-location',
          type: 'multiple_choice' as const,
          question: 'Where is your pain located?',
          required: true,
          options: ['Knee joint', 'Above knee', 'Below knee', 'Behind knee', 'Multiple areas']
        },
        {
          id: 'pain-description',
          type: 'multiple_choice' as const,
          question: 'How would you describe your pain?',
          options: ['Sharp', 'Dull ache', 'Throbbing', 'Burning', 'Stiff']
        },
        {
          id: 'medication-taken',
          type: 'yes_no' as const,
          question: 'Have you taken pain medication today?',
          required: true
        }
      ]
    }
  } else if (taskTitle.toLowerCase().includes('pre-op') || taskTitle.toLowerCase().includes('preparation')) {
    return {
      id: 'pre-op-checklist',
      title: 'Pre-Surgery Preparation Checklist', 
      description: 'Please confirm you have completed these important pre-surgery steps',
      questions: [
        {
          id: 'fasting',
          type: 'yes_no' as const,
          question: 'Have you been fasting as instructed (no food or drink after midnight)?',
          required: true
        },
        {
          id: 'medications',
          type: 'yes_no' as const,
          question: 'Have you taken only approved medications as discussed with your surgical team?',
          required: true
        },
        {
          id: 'transport',
          type: 'yes_no' as const,
          question: 'Do you have reliable transportation arranged for after surgery?',
          required: true
        },
        {
          id: 'support-person',
          type: 'yes_no' as const,
          question: 'Will someone be staying with you for the first 24 hours after surgery?',
          required: true
        },
        {
          id: 'questions-concerns',
          type: 'textarea' as const,
          question: 'Do you have any questions or concerns about your upcoming surgery?',
          placeholder: 'Please share any questions or concerns...'
        }
      ]
    }
  } else {
    return {
      id: 'daily-progress',
      title: 'Daily Progress Check-in',
      description: 'Let us know how your recovery is going today',
      questions: [
        {
          id: 'mobility-level',
          type: 'rating' as const,
          question: 'How is your mobility today?',
          description: '1 = Very limited, 5 = Moving well',
          required: true,
          max: 5
        },
        {
          id: 'exercise-completed',
          type: 'yes_no' as const,
          question: 'Did you complete your prescribed exercises today?',
          required: true
        },
        {
          id: 'sleep-quality',
          type: 'rating' as const,
          question: 'How well did you sleep last night?',
          description: '1 = Very poor, 5 = Excellent',
          max: 5
        },
        {
          id: 'concerns',
          type: 'textarea' as const,
          question: 'Any concerns or issues you want to share with your care team?',
          placeholder: 'Optional - share any concerns...'
        }
      ]
    }
  }
}

const getMockVideoData = (taskTitle: string, taskType: string) => {
  if (taskTitle.toLowerCase().includes('knee') && taskTitle.toLowerCase().includes('bending')) {
    return {
      id: 'knee-bending-exercise',
      title: 'Post-Surgery Knee Bending Exercises',
      description: 'Learn proper knee bending techniques to improve flexibility and range of motion safely.',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Sample video
      type: 'exercise' as const,
      duration: 300
    }
  } else if (taskTitle.toLowerCase().includes('walking')) {
    return {
      id: 'walking-techniques',
      title: 'Safe Walking Techniques After Surgery',
      description: 'Step-by-step guidance on walking safely during your recovery period.',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', // Sample video
      type: 'demonstration' as const,
      duration: 420
    }
  } else if (taskTitle.toLowerCase().includes('pain') || taskTitle.toLowerCase().includes('management')) {
    return {
      id: 'pain-management',
      title: 'Pain Management Techniques',
      description: 'Learn effective techniques to manage your pain and discomfort during recovery.',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Sample video
      type: 'education' as const,
      duration: 480
    }
  } else {
    return {
      id: 'general-recovery-tips',
      title: 'Recovery Tips and Guidelines',
      description: 'General guidance for a successful recovery process.',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Sample video
      type: 'education' as const,
      duration: 360
    }
  }
}

type Patient = Database['public']['Tables']['patients']['Row'] & {
  profile?: Database['public']['Tables']['profiles']['Row']
}

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: Database['public']['Tables']['profiles']['Row']
}

type Task = Database['public']['Tables']['tasks']['Row'] & {
  patient_task?: {
    id: string
    status: string
    completed_at: string | null
  }
}

type DayStatus = {
  day: number
  date: Date
  hasCompletedTasks: boolean
  hasPendingTasks: boolean
  hasMissedTasks: boolean
  taskCount: number
  completedCount: number
}

interface EnhancedPatientChatProps {
  patientId: string
  providerId?: string
  isProvider?: boolean
}

export default function EnhancedPatientChat({
  patientId,
  providerId,
  isProvider = false
}: EnhancedPatientChatProps) {
  const supabase = createClient()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentDay, setCurrentDay] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayStatuses, setDayStatuses] = useState<Map<number, DayStatus>>(new Map())
  const [careTeam, setCareTeam] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    missedTasks: boolean
    completedTasks: boolean
  }>({
    missedTasks: false,
    completedTasks: false
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // <thinking>
  // UX Design Decision: Calculate current recovery day based on surgery date
  // This provides context-aware timeline navigation that's crucial for recovery tracking
  // Healthcare Context: Recovery day tracking is essential for monitoring patient progress
  // </thinking>
  // Calculate current recovery day
  const calculateRecoveryDay = useCallback((surgeryDate: string | null) => {
    if (!surgeryDate) return 0
    const surgery = new Date(surgeryDate)
    const today = new Date()
    return differenceInDays(today, surgery)
  }, [])

  // Load all day statuses for the timeline
  const loadDayStatuses = async (surgeryDate: string, tenantId: string) => {
    try {
      const startDay = -45
      const endDay = currentDay + 30
      const statuses = new Map<number, DayStatus>()

      // Batch load all patient tasks
      const { data: allTasks, error } = await supabase
        .from('patient_tasks')
        .select(`
          id,
          task_id,
          status,
          scheduled_date,
          completed_at,
          task:tasks(*)
        `)
        .eq('patient_id', patientId)
        .gte('scheduled_date', format(addDays(new Date(surgeryDate), startDay), 'yyyy-MM-dd'))
        .lte('scheduled_date', format(addDays(new Date(surgeryDate), endDay), 'yyyy-MM-dd'))

      if (error) throw error

      // Process tasks into day statuses
      for (let day = startDay; day <= endDay; day++) {
        const dayDate = addDays(new Date(surgeryDate), day)
        const dayDateStr = format(dayDate, 'yyyy-MM-dd')
        
        const dayTasks = (allTasks || []).filter(pt => pt.scheduled_date === dayDateStr)
        
        const status: DayStatus = {
          day,
          date: dayDate,
          hasCompletedTasks: dayTasks.some(t => t.status === 'completed'),
          hasPendingTasks: dayTasks.some(t => t.status === 'pending' && day >= currentDay),
          hasMissedTasks: dayTasks.some(t => t.status === 'pending' && day < currentDay),
          taskCount: dayTasks.length,
          completedCount: dayTasks.filter(t => t.status === 'completed').length
        }
        
        statuses.set(day, status)
      }

      setDayStatuses(statuses)
    } catch (error) {
      console.error('Error loading day statuses:', error)
    }
  }

  // Initialize patient data and conversation
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)

        // Get current user first
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Not authenticated')

        // Fetch patient data with profile
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', patientId)
          .single()

        if (patientError) {
          console.error('Patient fetch error:', patientError)
          throw patientError
        }
        
        setPatient(patientData as Patient)

        // Calculate current recovery day
        const recoveryDay = calculateRecoveryDay(patientData.surgery_date)
        setCurrentDay(recoveryDay)
        setSelectedDay(recoveryDay)

        // Load day statuses
        if (patientData.surgery_date && patientData.tenant_id) {
          await loadDayStatuses(patientData.surgery_date, patientData.tenant_id)
        }

        // Get or create conversation
        let conversationData = null

        // First try to get existing conversation
        const { data: existingConv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existingConv) {
          conversationData = existingConv
        } else {
          // Create new conversation
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
              patient_id: patientId,
              tenant_id: patientData.tenant_id,
              status: 'active',
              metadata: {
                surgery_type: patientData.surgery_type,
                recovery_day: recoveryDay
              }
            })
            .select()
            .single()

          if (createError) throw createError
          conversationData = newConv
        }

        setConversation(conversationData)

        // Load messages for the selected day
        await loadMessagesForDay(recoveryDay, conversationData.id)

        // Load tasks for selected day
        await loadTasksForDay(recoveryDay, patientData.tenant_id)

        // Load care team
        await loadCareTeam(patientData.tenant_id)

      } catch (error) {
        console.error('Error initializing chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [patientId, supabase, calculateRecoveryDay])

  // Load messages for a specific day
  const loadMessagesForDay = async (day: number, conversationId: string) => {
    try {
      if (!patient?.surgery_date) return

      const dayStart = new Date(patient.surgery_date)
      dayStart.setDate(dayStart.getDate() + day)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  // Load tasks for a specific day
  const loadTasksForDay = async (day: number, tenantId: string) => {
    try {
      if (!patient?.surgery_date) return

      const targetDate = format(addDays(new Date(patient.surgery_date), day), 'yyyy-MM-dd')

      const { data: patientTasksData, error } = await supabase
        .from('patient_tasks')
        .select(`
          id,
          status,
          scheduled_date,
          completed_at,
          task_id
        `)
        .eq('patient_id', patientId)
        .eq('scheduled_date', targetDate)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch task details separately
      const taskIds = (patientTasksData || []).map(pt => pt.task_id).filter(Boolean)
      
      if (taskIds.length === 0) {
        setTasks([])
        return
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds)

      if (tasksError) throw tasksError

      // Map tasks with patient task status
      const tasksWithStatus: Task[] = (tasksData || []).map(task => {
        const patientTask = patientTasksData!.find(pt => pt.task_id === task.id)
        return {
          ...task,
          patient_task: patientTask ? {
            id: patientTask.id,
            status: patientTask.status,
            completed_at: patientTask.completed_at
          } : undefined
        }
      })

      setTasks(tasksWithStatus)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    }
  }

  // Load care team
  const loadCareTeam = async (tenantId: string) => {
    try {
      // First get providers
      const { data: providers, error } = await supabase
        .from('providers')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(3)

      if (error) throw error

      if (!providers || providers.length === 0) {
        setCareTeam([])
        return
      }

      // Then get profiles for those providers
      const userIds = providers.map(p => p.user_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profileError) {
        console.error('Error loading profiles:', profileError)
        setCareTeam(providers)
        return
      }

      // Combine providers with their profiles
      const providersWithProfiles = providers.map(provider => ({
        ...provider,
        profile: profiles?.find(p => p.id === provider.user_id) || null
      }))

      setCareTeam(providersWithProfiles)
    } catch (error) {
      console.error('Error loading care team:', error)
    }
  }

  // <thinking>
  // Implementation Decision: Real-time subscriptions for live updates
  // This ensures that messages and task updates are reflected immediately
  // Healthcare Context: Real-time communication is critical for patient care coordination
  // </thinking>
  // Setup real-time subscriptions
  useEffect(() => {
    if (!conversation) return

    const channel = supabase
      .channel(`patient-chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && newMessage) {
            setMessages(prev => [...prev, newMessage as Message])
            scrollToBottom()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patient_tasks',
          filter: `patient_id=eq.${patientId}`
        },
        async (payload) => {
          // Reload day statuses when tasks update
          if (patient?.surgery_date && patient?.tenant_id) {
            await loadDayStatuses(patient.surgery_date, patient.tenant_id)
          }
          
          // Update current tasks if on the same day
          const updatedTask = payload.new
          setTasks(prev => prev.map(task => {
            if (task.patient_task && task.patient_task.id === updatedTask.id) {
              return {
                ...task,
                patient_task: {
                  id: task.patient_task.id,
                  status: updatedTask.status,
                  completed_at: updatedTask.completed_at
                }
              }
            }
            return task
          }))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [conversation, patientId, patient, supabase])

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isSending) return

    setIsSending(true)
    const messageText = inputMessage
    setInputMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Send message
      const { data: sentMessage, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: messageText,
          sender_type: isProvider ? 'provider' : 'patient',
          tenant_id: patient?.tenant_id
        })
        .select()
        .single()

      if (sendError) throw sendError

      // Generate AI response if from patient
      if (!isProvider) {
        // Use protocol-aware AI response
        const response = await fetch('/api/chat/protocol-ai-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            patientId: patient?.id,
            conversationHistory: messages.slice(-5).map(msg => ({
              role: msg.sender_type === 'patient' ? 'user' as const : 'assistant' as const,
              content: msg.content
            }))
          })
        })

        if (!response.ok) throw new Error('Failed to get AI response')

        const { response: aiMessage, context } = await response.json()

        // Insert AI response with context metadata
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: 'ai-assistant',
          content: aiMessage,
          sender_type: 'ai',
          tenant_id: patient?.tenant_id,
          metadata: {
            recoveryDay: context.recoveryDay,
            phase: context.phase,
            detectedActions: context.detectedActions
          }
        })

        // Process any detected actions
        if (context.detectedActions && context.detectedActions.length > 0) {
          for (const action of context.detectedActions) {
            if (action.type === 'escalation' && action.confidence > 0.8) {
              // Could trigger provider notification here
              console.log('Patient concern detected, provider notification could be triggered')
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setInputMessage(messageText)
    } finally {
      setIsSending(false)
    }
  }

  // Handle task action
  const handleTaskAction = async (task: Task, action: string) => {
    try {
      if (!task.patient_task) return

      const updates: any = {}
      
      switch (action) {
        case 'complete':
          updates.status = 'completed'
          updates.completed_at = new Date().toISOString()
          break
        case 'start':
          updates.status = 'in_progress'
          break
        case 'view':
          setSelectedTask(task)
          setShowTaskModal(true)
          return
      }

      const { error } = await supabase
        .from('patient_tasks')
        .update(updates)
        .eq('id', task.patient_task.id)

      if (error) throw error

      // Send completion message if task completed
      if (action === 'complete' && conversation) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: patient?.user_id || '',
          content: `I completed: ${task.title}`,
          sender_type: 'patient',
          tenant_id: patient?.tenant_id,
          metadata: {
            task_id: task.id,
            task_type: task.task_type,
            auto_generated: true
          }
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Navigate to day
  const navigateToDay = async (day: number) => {
    setSelectedDay(day)
    if (patient?.tenant_id && conversation) {
      await loadTasksForDay(day, patient.tenant_id)
      await loadMessagesForDay(day, conversation.id)
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // <thinking>
  // Visual Design: Day status icons provide visual feedback on task completion
  // Using color-coded icons for immediate recognition of status
  // Healthcare Context: Visual indicators help patients track their recovery progress
  // </thinking>
  // Get day status icon
  const getDayStatusIcon = (status: DayStatus | undefined) => {
    if (!status || status.taskCount === 0) return null

    if (status.hasMissedTasks) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    if (status.hasCompletedTasks && status.completedCount === status.taskCount) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if (status.hasPendingTasks) {
      return <Circle className="h-4 w-4 text-blue-500 fill-blue-500" />
    }
    return null
  }

  // Get provider icon
  const getProviderIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'surgeon':
        return <Stethoscope className="h-5 w-5 text-white" />
      case 'nurse':
        return <Activity className="h-5 w-5 text-white" />
      case 'physical_therapist':
      case 'pt':
        return <User className="h-5 w-5 text-white" />
      default:
        return <Stethoscope className="h-5 w-5 text-white" />
    }
  }

  // <thinking>
  // UX Design: Loading state provides feedback during data fetching
  // Using consistent loading patterns across the platform
  // Visual Design: Animated spinner with healthcare-appropriate colors
  // </thinking>
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-gray-500">Loading recovery chat...</p>
        </div>
      </Card>
    )
  }

  // Render error state
  if (!patient) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-sm text-gray-500">Unable to load patient data</p>
        </div>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="h-full flex bg-white">
          {/* <thinking>
          Visual Design: 280px sidebar width as specified in Manus-style requirements
          Using consistent spacing and healthcare-appropriate color palette
          Healthcare Context: Timeline view is crucial for tracking recovery milestones
          </thinking> */}
          {/* Enhanced Sidebar */}
          <div className="w-[280px] border-r bg-gray-50 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-900">Recovery Timeline</h3>
              <p className="text-sm text-gray-500 mt-1">
                {patient.surgery_type} Recovery
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="p-4 border-b bg-white space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, missedTasks: !prev.missedTasks }))}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    activeFilters.missedTasks
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Missed Task
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, completedTasks: !prev.completedTasks }))}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                    activeFilters.completedTasks
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed Tasks
                </button>
              </div>
            </div>

            {/* Timeline Days */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-1">
                {Array.from({ length: 246 }, (_, i) => i - 45)
                  .filter(day => {
                    // If no filters active, show all days
                    if (!activeFilters.missedTasks && !activeFilters.completedTasks) {
                      return true
                    }
                    
                    const status = dayStatuses.get(day)
                    if (!status) return false
                    
                    // Apply filters
                    if (activeFilters.missedTasks && activeFilters.completedTasks) {
                      // Both filters active - show days with either missed OR completed tasks
                      return status.hasMissedTasks || status.hasCompletedTasks
                    } else if (activeFilters.missedTasks) {
                      // Only missed tasks filter active
                      return status.hasMissedTasks
                    } else if (activeFilters.completedTasks) {
                      // Only completed tasks filter active
                      return status.hasCompletedTasks
                    }
                    
                    return true
                  })
                  .map(day => {
                  const status = dayStatuses.get(day)
                  const isToday = day === currentDay
                  const isSelected = day === selectedDay
                  const isPast = day < currentDay

                  return (
                    <Tooltip key={day}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => navigateToDay(day)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-all",
                            isSelected && "bg-blue-600 text-white shadow-sm",
                            !isSelected && "hover:bg-gray-100",
                            isToday && !isSelected && "ring-2 ring-blue-600 ring-offset-1"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className={cn(
                                "font-medium",
                                isSelected && "text-white"
                              )}>
                                Day {day}
                              </p>
                              <p className={cn(
                                "text-xs",
                                isSelected ? "text-blue-100" : "text-gray-500"
                              )}>
                                {patient.surgery_date 
                                  ? format(addDays(new Date(patient.surgery_date), day), 'MMM d')
                                  : 'No date'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getDayStatusIcon(status)}
                              {status && status.taskCount > 0 && (
                                <RecoveryDayBadge day={day} />
                              )}
                            </div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {status && status.taskCount > 0 ? (
                          <div className="text-sm">
                            <p className="font-medium">{status.taskCount} tasks</p>
                            <p>{status.completedCount} completed</p>
                            {status.hasMissedTasks && (
                              <p className="text-red-500">Has missed tasks</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">No tasks scheduled</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </ScrollArea>

            {/* <thinking>
            Visual Design: Care team section shows provider presence
            Healthcare Context: Patients need to know who's available for support
            UX Design: Online status indicators provide real-time availability
            </thinking> */}
            {/* Care Team Section */}
            {careTeam.length > 0 && (
              <div className="p-4 border-t bg-white">
                <h4 className="font-medium text-sm text-gray-900 mb-3">Your Care Team</h4>
                <div className="space-y-2">
                  {careTeam.map((provider) => (
                    <div key={provider.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={provider.profile?.avatar_url} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {provider.profile?.first_name?.[0]}{provider.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {provider.profile?.first_name} {provider.profile?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{provider.role}</p>
                      </div>
                      <OnlineStatus status="online" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col max-w-[800px] mx-auto w-full">
            {/* <thinking>
            Visual Design: Header with primary brand color for strong visual hierarchy
            Healthcare Context: Clear patient identification is crucial for safety
            Implementation: Using new design system colors instead of old TJV colors
            </thinking> */}
            {/* Chat Header */}
            <div className="border-b p-4 bg-gray-900 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={patient.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {patient.profile?.first_name?.[0]}{patient.profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {selectedDay === currentDay ? 'Recovery Assistant' : `Day ${selectedDay} Chat`}
                    </h2>
                    <p className="text-sm text-gray-300">
                      {patient.profile?.first_name} {patient.profile?.last_name} • Day {currentDay} Recovery
                    </p>
                  </div>
                </div>
                {selectedDay !== currentDay && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigateToDay(currentDay)}
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Return to Today
                  </Button>
                )}
              </div>
            </div>

            {/* <thinking>
            UX Design: Missed tasks alert prominently displayed for patient safety
            Healthcare Context: Missed tasks can impact recovery outcomes
            Visual Design: Using warning colors to draw attention
            </thinking> */}
            {/* Missed Tasks Alert */}
            {selectedDay !== null && selectedDay < currentDay && tasks.some(t => t.patient_task?.status === 'pending') && (
              <Card variant="warning" className="p-4 border-0 rounded-none">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Missed Tasks from Day {selectedDay}
                </h4>
                <div className="space-y-2">
                  {tasks.filter(t => t.patient_task?.status === 'pending').map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                      <div className="flex items-center gap-2">
                        {task.task_type === 'exercise' && <Activity className="h-4 w-4 text-amber-600" />}
                        {task.task_type === 'form' && <FileText className="h-4 w-4 text-amber-600" />}
                        {task.task_type === 'education' && <Play className="h-4 w-4 text-amber-600" />}
                        <span className="text-sm">{task.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleTaskAction(task, 'complete')}
                      >
                        Complete Now
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No messages for Day {selectedDay}</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === patient.user_id
                    const isAI = message.sender_type === 'ai'
                    const isProvider = message.sender_type === 'provider'

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          isOwn && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          {isAI ? (
                            <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-white" />
                            </div>
                          ) : isProvider && message.sender ? (
                            <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                              {getProviderIcon(message.sender.role)}
                            </div>
                          ) : (
                            <>
                              <AvatarImage src={message.sender?.avatar_url || undefined} />
                              <AvatarFallback>
                                {message.sender?.first_name?.[0]}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div className={cn(
                          "max-w-[70%] space-y-1",
                          isOwn && "items-end"
                        )}>
                          {isProvider && message.sender && (
                            <p className="text-xs text-gray-500 px-1">
                              {message.sender.role} • {message.sender.first_name}
                            </p>
                          )}
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 px-1">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {/* <thinking>
            UX Design: Today's tasks shown prominently to guide patient actions
            Healthcare Context: Task completion is key to recovery success
            Visual Design: Clear action buttons with appropriate status indicators
            </thinking> */}
            {/* Protocol-Driven Chat Integration */}
            {selectedDay === currentDay && patient.surgery_date && (
              <div className="border-t bg-gray-50">
                <ProtocolDrivenChat
                  patientId={patientId}
                  surgeryDate={patient.surgery_date}
                  currentDay={currentDay}
                  onSendMessage={(message) => {
                    setInputMessage(message)
                    // Automatically send the message
                    sendMessage()
                  }}
                  onTaskAction={handleTaskAction}
                />
              </div>
            )}

            {/* <thinking>
            UX Design: Input area with clear visual hierarchy and accessibility
            Healthcare Context: Voice input option for patients with mobility issues
            Implementation: Using new design system Input component
            </thinking> */}
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={
                    selectedDay !== currentDay 
                      ? "You can only send messages in today's chat" 
                      : isProvider 
                        ? "Type a message to your patient..." 
                        : "Type your message or hold mic to speak..."
                  }
                  disabled={isSending || selectedDay !== currentDay}
                  className="flex-1"
                />
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setIsRecording(!isRecording)}
                  disabled={selectedDay !== currentDay}
                  className={cn(
                    "transition-colors",
                    isRecording && "bg-red-500 text-white hover:bg-red-600"
                  )}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="primary"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending || selectedDay !== currentDay}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Content Modal */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <RecoveryDayBadge day={Math.floor(differenceInDays(new Date(), new Date(patient?.surgery_date || '')))} />
                    {selectedTask.task_type === 'form' && <FileText className="h-4 w-4 text-blue-600" />}
                    {selectedTask.task_type === 'education' && <Play className="h-4 w-4 text-red-600" />}
                    {selectedTask.task_type === 'exercise' && <Activity className="h-4 w-4 text-green-600" />}
                    <span className="text-sm text-gray-600 capitalize">{selectedTask.task_type}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowTaskModal(false)
                    setSelectedTask(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6">
                {/* Render Form */}
                {selectedTask.task_type === 'form' && (
                  <ConversationalForm
                    form={getMockFormData(selectedTask.title, selectedTask.task_type)}
                    onFormComplete={(formData) => {
                      console.log('Form completed:', formData)
                      // Mark task as complete
                      handleTaskAction(selectedTask, 'complete')
                      setShowTaskModal(false)
                      setSelectedTask(null)
                    }}
                    onFieldComplete={(questionId, value) => {
                      console.log('Field completed:', questionId, value)
                    }}
                    showProgress={true}
                    allowVoiceInput={true}
                    autoSave={true}
                  />
                )}

                {/* Render Video */}
                {selectedTask.task_type === 'education' && (
                  <VideoMessage
                    video={getMockVideoData(selectedTask.title, selectedTask.task_type)}
                    onVideoComplete={(videoId, watchTime) => {
                      console.log('Video completed:', videoId, watchTime)
                      // Mark task as complete
                      handleTaskAction(selectedTask, 'complete')
                      setShowTaskModal(false)
                      setSelectedTask(null)
                    }}
                    onVideoStart={(videoId) => {
                      console.log('Video started:', videoId)
                    }}
                    autoPlay={false}
                    showControls={true}
                    allowFullscreen={true}
                  />
                )}

                {/* Render Exercise Content */}
                {selectedTask.task_type === 'exercise' && (
                  <div className="space-y-6">
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Activity className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Exercise Instructions</h3>
                            <p className="text-sm text-gray-600">Follow these steps carefully</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                              <li>Start in a comfortable seated position</li>
                              <li>Slowly bend your knee as far as comfortable</li>
                              <li>Hold for 5-10 seconds</li>
                              <li>Slowly straighten your leg</li>
                              <li>Repeat 10-15 times</li>
                              <li>Rest and repeat the set 2-3 times</li>
                            </ol>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                              <li>Stop if you experience sharp or severe pain</li>
                              <li>Some discomfort is normal during recovery</li>
                              <li>Progress gradually - don&apos;t push too hard</li>
                              <li>Contact your care team if you have concerns</li>
                            </ul>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setShowTaskModal(false)
                                setSelectedTask(null)
                              }}
                              className="flex-1"
                            >
                              Close
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => {
                                handleTaskAction(selectedTask, 'complete')
                                setShowTaskModal(false)
                                setSelectedTask(null)
                              }}
                              className="flex-1"
                            >
                              Mark as Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </TooltipProvider>
    </ErrorBoundary>
  )
}