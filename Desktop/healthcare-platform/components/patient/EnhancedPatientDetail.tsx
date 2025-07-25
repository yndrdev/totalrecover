'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WeekViewTimeline, type DayStatus } from './WeekViewTimeline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  Edit,
  Calendar,
  Activity,
  AlertCircle,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Date formatting utility
const formatDate = (date: Date | string, formatStr: string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (formatStr === 'MMMM d, yyyy') {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[d.getMonth()]
    const day = d.getDate()
    const year = d.getFullYear()
    return `${month} ${day}, ${year}`
  } else if (formatStr === 'h:mm a') {
    let hours = d.getHours()
    const minutes = d.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    return `${hours}:${minutesStr} ${ampm}`
  }
  
  return d.toLocaleDateString()
}

interface PatientTask {
  id: string
  task_id: string
  scheduled_date: string
  completed_at: string | null
  missed: boolean
  patient_notes: string | null
  task: {
    title: string
    frequency: string
    category: string
    video_url?: string
  }
  recoveryDay?: number
}

interface PatientMessage {
  id: string
  message: string
  is_from_patient: boolean
  created_at: string
  recoveryDay?: number
}

interface PatientData {
  id: string
  first_name: string
  last_name: string
  protocol_assigned_date: string
  surgery_date: string | null
  email: string
  phone: string
  protocol: {
    id: string
    name: string
    description: string
  }
  provider: {
    first_name: string
    last_name: string
  }
}

interface EnhancedPatientDetailProps {
  patientId: string
}

export function EnhancedPatientDetail({ patientId }: EnhancedPatientDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [tasks, setTasks] = useState<PatientTask[]>([])
  const [messages, setMessages] = useState<PatientMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayStatuses, setDayStatuses] = useState<Map<number, DayStatus>>(new Map())
  const [activeFilters, setActiveFilters] = useState({
    missedTasks: false,
    completedTasks: false
  })
  const [activeTab, setActiveTab] = useState<'tasks' | 'messages'>('tasks')
  
  // Calculate current recovery day
  const currentDay = patient?.surgery_date 
    ? Math.floor((Date.now() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Load patient data
  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true)

        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select(`
            *,
            protocol:protocols!inner(*),
            provider:providers!inner(*)
          `)
          .eq('id', patientId)
          .single()

        if (patientError) throw patientError
        setPatient(patientData)

        // Fetch patient tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('patient_tasks')
          .select(`
            *,
            task:protocol_tasks!inner(*)
          `)
          .eq('patient_id', patientId)
          .order('scheduled_date', { ascending: true })

        if (tasksError) throw tasksError

        // Calculate recovery day for each task
        const tasksWithDays = tasksData.map(task => ({
          ...task,
          recoveryDay: patientData.surgery_date 
            ? Math.floor((new Date(task.scheduled_date).getTime() - new Date(patientData.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0
        }))
        setTasks(tasksWithDays)

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('patient_messages')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError
        
        // Calculate recovery day for each message
        const messagesWithDays = messagesData.map(msg => ({
          ...msg,
          recoveryDay: patientData.surgery_date
            ? Math.floor((new Date(msg.created_at).getTime() - new Date(patientData.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0
        }))
        setMessages(messagesWithDays)

        // Build day statuses map
        const statusMap = new Map<number, DayStatus>()
        
        // Process tasks
        tasksWithDays.forEach(task => {
          const day = task.recoveryDay || 0
          const existing = statusMap.get(day) || {
            day,
            date: new Date(task.scheduled_date),
            hasCompletedTasks: false,
            hasPendingTasks: false,
            hasMissedTasks: false,
            taskCount: 0,
            completedCount: 0,
            messageCount: 0
          }

          existing.taskCount++
          if (task.completed_at) {
            existing.hasCompletedTasks = true
            existing.completedCount++
          } else if (task.missed) {
            existing.hasMissedTasks = true
          } else {
            existing.hasPendingTasks = true
          }

          statusMap.set(day, existing)
        })

        // Process messages
        messagesWithDays.forEach(msg => {
          const day = msg.recoveryDay || 0
          const existing = statusMap.get(day) || {
            day,
            date: new Date(msg.created_at),
            hasCompletedTasks: false,
            hasPendingTasks: false,
            hasMissedTasks: false,
            taskCount: 0,
            completedCount: 0,
            messageCount: 0
          }

          existing.messageCount = (existing.messageCount || 0) + 1
          statusMap.set(day, existing)
        })

        setDayStatuses(statusMap)
        
        // Set selected day to current day initially
        if (selectedDay === null) {
          setSelectedDay(currentDay)
        }
      } catch (error) {
        console.error('Error loading patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPatientData()
  }, [patientId, selectedDay, supabase])

  // Filter tasks and messages for selected day
  const selectedDayTasks = selectedDay !== null
    ? tasks.filter(task => task.recoveryDay === selectedDay)
    : []

  const selectedDayMessages = selectedDay !== null
    ? messages.filter(msg => msg.recoveryDay === selectedDay)
    : []

  // Handle day selection
  const handleDaySelect = useCallback((day: number) => {
    setSelectedDay(day)
  }, [])

  // Handle filter toggle
  const handleFilterToggle = useCallback((filter: 'missedTasks' | 'completedTasks') => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Week View Timeline Sidebar */}
      <WeekViewTimeline
        surgeryDate={patient.surgery_date}
        currentDay={currentDay}
        selectedDay={selectedDay}
        dayStatuses={dayStatuses}
        activeFilters={activeFilters}
        onDaySelect={handleDaySelect}
        onFilterToggle={handleFilterToggle}
        startDay={-7}
        endDay={currentDay + 7}
        showFuture={false}
        title="Patient Progress"
        subtitle={`${patient.first_name} ${patient.last_name}`}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Patient Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Day {currentDay} of Recovery</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-secondary" />
                  <span>{patient.protocol.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-primary-navy" />
                  <span>Dr. {patient.provider.first_name} {patient.provider.last_name}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/demo/provider/patients/${patient.id}/protocol-editor`)}
              className="gap-2 bg-primary hover:bg-primary-navy text-white transition-colors"
            >
              <Edit className="h-4 w-4" />
              Adjust Protocol
            </Button>
          </div>
        </div>

        {/* Selected Day Content */}
        {selectedDay !== null && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Day {selectedDay} - {formatDate(new Date((new Date(patient.surgery_date || '').getTime()) + (selectedDay * 24 * 60 * 60 * 1000)), 'MMMM d, yyyy')}
            </h2>

            <div className="space-y-4">
              <div className="grid w-full grid-cols-2 bg-primary-light/10 p-1 rounded-lg border border-primary-light/30">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={cn(
                    "py-2 px-4 rounded-md text-sm font-medium transition-all",
                    activeTab === 'tasks'
                      ? "bg-primary text-white shadow-sm"
                      : "text-primary-navy hover:text-primary hover:bg-primary-light/10"
                  )}
                >
                  Tasks ({selectedDayTasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={cn(
                    "py-2 px-4 rounded-md text-sm font-medium transition-all",
                    activeTab === 'messages'
                      ? "bg-primary text-white shadow-sm"
                      : "text-primary-navy hover:text-primary hover:bg-primary-light/10"
                  )}
                >
                  Messages ({selectedDayMessages.length})
                </button>
              </div>

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                {selectedDayTasks.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No tasks scheduled for this day</p>
                    </CardContent>
                  </Card>
                ) : (
                  selectedDayTasks.map((task) => (
                    <Card key={task.id} className={cn(
                      "transition-all hover:shadow-md",
                      task.completed_at && "bg-secondary-light/10 border-secondary",
                      task.missed && "bg-error/10 border-error"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {task.completed_at ? (
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            ) : task.missed ? (
                              <XCircle className="h-5 w-5 text-error" />
                            ) : (
                              <Clock className="h-5 w-5 text-primary" />
                            )}
                            {task.task.title}
                          </CardTitle>
                          <Badge variant="outline">
                            {task.task.category}
                          </Badge>
                        </div>
                        <CardDescription>
                          {task.task.frequency}
                        </CardDescription>
                      </CardHeader>
                      {(task.patient_notes || task.completed_at) && (
                        <CardContent className="pt-3">
                          {task.completed_at && (
                            <p className="text-sm text-secondary-dark">
                              Completed at {formatDate(new Date(task.completed_at), 'h:mm a')}
                            </p>
                          )}
                          {task.patient_notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Patient notes:</span> {task.patient_notes}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                {selectedDayMessages.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No messages on this day</p>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {selectedDayMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-3",
                            msg.is_from_patient ? "justify-start" : "justify-end"
                          )}
                        >
                          <div className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            msg.is_from_patient
                              ? "bg-gray-100 text-gray-900"
                              : "bg-primary text-white shadow-sm"
                          )}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              msg.is_from_patient ? "text-gray-500" : "text-primary-light/80"
                            )}>
                              {formatDate(new Date(msg.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}