'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
  PauseCircle
} from 'lucide-react'
import { Database } from '@/types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

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
    hours = hours ? hours : 12 // 0 should be 12
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

type Patient = Database['public']['Tables']['patients']['Row'] & {
  profile?: Database['public']['Tables']['profiles']['Row']
  first_name?: string
  last_name?: string
}

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: Database['public']['Tables']['profiles']['Row']
}

type Task = Database['public']['Tables']['tasks']['Row'] & {
  status?: string
  scheduled_date?: string
  completed_at?: string | null
  patient_task_id?: string
}

type PatientTask = Database['public']['Tables']['patient_tasks']['Row'] & {
  task?: Task
}

type Conversation = Database['public']['Tables']['conversations']['Row']

interface PatientChatCoreProps {
  patientId: string
  providerId?: string
  isProvider?: boolean
}

export default function PatientChatCore({
  patientId,
  providerId,
  isProvider = false
}: PatientChatCoreProps) {
  const supabase = createClient()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentDay, setCurrentDay] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Calculate current recovery day
  const calculateRecoveryDay = useCallback((surgeryDate: string | null) => {
    if (!surgeryDate) return 0
    const surgery = new Date(surgeryDate)
    const today = new Date()
    return differenceInDays(today, surgery)
  }, [])

  // Initialize patient data and conversation
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)

        // Fetch patient data
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single()

        if (patientError) throw patientError
        
        // Fetch profile separately
        if (patientData.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', patientData.user_id)
            .single()
          
          if (!profileError && profileData) {
            patientData.profile = profileData
          }
        }
        
        setPatient(patientData as Patient)

        // Calculate current recovery day
        const recoveryDay = calculateRecoveryDay(patientData.surgery_date)
        setCurrentDay(recoveryDay)
        setSelectedDay(recoveryDay)

        // Get or create conversation
        let conversationData: Conversation | null = null

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

        // Load messages for the conversation
        if (conversationData) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationData.id)
            .order('created_at', { ascending: true })

          if (messagesError) throw messagesError
          
          // Fetch sender profiles separately
          const messagesWithSenders = await Promise.all(
            (messagesData || []).map(async (msg) => {
              if (msg.sender_id && msg.sender_id !== 'ai-assistant') {
                const { data: senderProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', msg.sender_id)
                  .single()
                
                return { ...msg, sender: senderProfile }
              }
              return msg
            })
          )
          
          setMessages(messagesWithSenders as Message[])
        }

        // Load tasks for selected day
        await loadTasksForDay(recoveryDay, patientData.tenant_id)

      } catch (error) {
        console.error('Error initializing chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [patientId, supabase, calculateRecoveryDay])

  // Load tasks for a specific day
  const loadTasksForDay = async (day: number, tenantId: string) => {
    try {
      const targetDate = patient?.surgery_date
        ? format(addDays(new Date(patient.surgery_date), day), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')

      const { data: patientTasksData, error } = await supabase
        .from('patient_tasks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('scheduled_date', targetDate)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Fetch task details separately
      const tasksWithDetails = await Promise.all(
        (patientTasksData || []).map(async (pt) => {
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', pt.task_id)
            .single()
          
          if (taskData) {
            return {
              ...taskData,
              status: pt.status,
              scheduled_date: pt.scheduled_date,
              completed_at: pt.completed_at,
              patient_task_id: pt.id
            }
          }
          return null
        })
      )
      
      setTasks(tasksWithDetails.filter(Boolean) as Task[])
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    }
  }

  // Setup real-time subscriptions
  useEffect(() => {
    if (!conversation) return

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        async (payload) => {
          // Fetch complete message with sender info
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select('*')
            .eq('id', payload.new.id)
            .single()

          if (!error && newMessage) {
            // Fetch sender profile if needed
            let messageWithSender = newMessage
            if (newMessage.sender_id && newMessage.sender_id !== 'ai-assistant') {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newMessage.sender_id)
                .single()
              
              if (senderProfile) {
                messageWithSender = { ...newMessage, sender: senderProfile }
              }
            }
            
            setMessages(prev => [...prev, messageWithSender as Message])
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
        (payload) => {
          // Update task status in real-time
          setTasks(prev => prev.map(task => 
            task.patient_task_id === payload.new.id 
              ? { ...task, status: payload.new.status, completed_at: payload.new.completed_at }
              : task
          ))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [conversation, patientId, supabase])

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isSending) return

    setIsSending(true)
    const messageText = inputMessage
    setInputMessage('')

    try {
      // Get current user
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
        const response = await fetch('/api/chat/ai-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            patientId: patient?.id,
            conversationId: conversation.id,
            context: {
              surgeryType: patient?.surgery_type,
              recoveryDay: currentDay,
              recentMessages: messages.slice(-5)
            }
          })
        })

        if (!response.ok) throw new Error('Failed to get AI response')

        const { message: aiMessage } = await response.json()

        // Save AI response
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: 'ai-assistant',
          content: aiMessage,
          sender_type: 'ai',
          tenant_id: patient?.tenant_id
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setInputMessage(messageText) // Restore message on error
    } finally {
      setIsSending(false)
    }
  }

  // Handle task action
  const handleTaskAction = async (task: Task, action: string) => {
    try {
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
          // Handle viewing task details
          return
      }

      if (task.patient_task_id) {
        const { error } = await supabase
          .from('patient_tasks')
          .update(updates)
          .eq('id', task.patient_task_id)

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
      }
    } catch (error) {
      console.error('Error updating task:', error)
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

  // Handle voice recording
  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      // TODO: Implement voice recording stop and transcription
    } else {
      // Start recording
      setIsRecording(true)
      // TODO: Implement voice recording start
    }
  }

  {/* <thinking>
  Healthcare Context: Patient chat interface for recovery communication
  - Need to update all old TJV colors to new design system
  - Maintain HIPAA-compliant communication channel
  - Clear visual hierarchy for recovery timeline
  - Professional medical interface appearance
  </thinking> */}

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-gray-500">Loading chat...</p>
        </div>
      </Card>
    )
  }

  // Render error state
  if (!patient) {
    return (
      <Card variant="error" className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-sm text-gray-500">Unable to load patient data</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4 bg-gray-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={patient.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-600 text-white">
                {(patient.first_name || patient.profile?.first_name)?.[0]}{(patient.last_name || patient.profile?.last_name)?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {patient.first_name || patient.profile?.first_name} {patient.last_name || patient.profile?.last_name}
              </h2>
              <p className="text-sm text-gray-300">
                Day {currentDay} • {patient.surgery_type}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-600 text-white">
            {conversation?.status || 'Active'}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Day/Task Navigation */}
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 text-gray-900">Recovery Timeline</h3>
          <div className="space-y-2">
            {Array.from({ length: 14 }, (_, i) => i - 7 + currentDay).map(day => {
              const dayTasks = tasks.filter(t => {
                if (!patient.surgery_date || !t.scheduled_date) return false
                const taskDate = new Date(t.scheduled_date)
                const surgeryDate = new Date(patient.surgery_date)
                return differenceInDays(taskDate, surgeryDate) === day
              })
              
              const isToday = day === currentDay
              const isPast = day < currentDay
              const hasTasks = dayTasks.length > 0

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day)
                    if (patient.tenant_id) {
                      loadTasksForDay(day, patient.tenant_id)
                    }
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    selectedDay === day ? "bg-blue-600 text-white" : "hover:bg-gray-100",
                    isToday && "ring-2 ring-blue-600 ring-offset-2"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Day {day}</p>
                      <p className="text-xs opacity-70">
                        {format(addDays(new Date(patient.surgery_date || new Date()), day), 'MMM d')}
                      </p>
                    </div>
                    {hasTasks && (
                      <Badge variant="secondary" className="text-xs">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === (isProvider ? providerId : patient.user_id)
                const isAI = message.sender_type === 'ai'

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
                      <div className={cn(
                        "rounded-2xl px-4 py-2",
                        isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      )}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 px-1">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Tasks for Selected Day */}
          {selectedDay !== null && tasks.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <h4 className="font-medium mb-3 text-gray-900">
                Tasks for Day {selectedDay}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {task.task_type === 'exercise' && <Activity className="h-4 w-4 text-blue-600" />}
                      {task.task_type === 'form' && <FileText className="h-4 w-4 text-blue-600" />}
                      {task.task_type === 'education' && <Play className="h-4 w-4 text-blue-600" />}
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleTaskAction(task, 'view')}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleTaskAction(task, 'complete')}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isProvider ? "Type a message to your patient..." : "Type your message or hold mic to speak..."}
                disabled={isSending}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleVoiceRecord}
                className={cn(
                  "transition-colors h-10 w-10 p-0",
                  isRecording && "bg-red-500 text-white hover:bg-red-600"
                )}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}