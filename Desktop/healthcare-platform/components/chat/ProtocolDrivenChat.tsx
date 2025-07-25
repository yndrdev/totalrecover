'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/design-system/Button'
import { Card } from '@/components/ui/design-system/Card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Activity,
  FileText,
  Video,
  Sparkles,
  ChevronRight,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTasksForDay } from '@/lib/data/tjv-real-timeline-data'

interface ProtocolTask {
  id: string
  day: number
  type: 'message' | 'form' | 'exercise' | 'video'
  title: string
  content: string
  status?: 'pending' | 'completed' | 'missed'
  scheduled_date?: string
}

interface PredictiveResponse {
  id: string
  text: string
  type: 'task_reminder' | 'task_completion' | 'general_inquiry' | 'concern'
  relatedTaskId?: string
  priority: 'high' | 'medium' | 'low'
}

interface ProtocolDrivenChatProps {
  patientId: string
  surgeryDate: string
  currentDay: number
  onSendMessage: (message: string) => void
  onTaskAction?: (task: any, action: string) => void
}

export function ProtocolDrivenChat({
  patientId,
  surgeryDate,
  currentDay,
  onSendMessage,
  onTaskAction
}: ProtocolDrivenChatProps) {
  const supabase = createClient()
  const [todaysTasks, setTodaysTasks] = useState<ProtocolTask[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<ProtocolTask[]>([])
  const [predictiveResponses, setPredictiveResponses] = useState<PredictiveResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Load protocol tasks for current and upcoming days
  useEffect(() => {
    const loadProtocolTasks = async () => {
      try {
        setLoading(true)

        // Get tasks from the real TJV timeline data
        const todayTasks = getTasksForDay(currentDay)
        const tomorrowTasks = getTasksForDay(currentDay + 1)
        const nextWeekTasks = []
        
        for (let i = 2; i <= 7; i++) {
          nextWeekTasks.push(...getTasksForDay(currentDay + i))
        }

        // Check completion status from database
        const { data: patientTasks, error } = await supabase
          .from('patient_tasks')
          .select('task_id, status, scheduled_date')
          .eq('patient_id', patientId)
          .gte('scheduled_date', new Date().toISOString().split('T')[0])
          .lte('scheduled_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

        if (error) throw error

        // Map timeline tasks to include completion status
        const mapTasksWithStatus = (tasks: any[], dayOffset: number) => {
          return tasks.map((task, index) => {
            const scheduledDate = new Date(surgeryDate)
            scheduledDate.setDate(scheduledDate.getDate() + currentDay + dayOffset)
            
            const patientTask = patientTasks?.find(pt => 
              pt.scheduled_date === scheduledDate.toISOString().split('T')[0]
            )

            return {
              id: `${currentDay + dayOffset}-${index}`,
              day: currentDay + dayOffset,
              type: task.type,
              title: task.title,
              content: task.content,
              status: patientTask?.status || 'pending',
              scheduled_date: scheduledDate.toISOString().split('T')[0]
            }
          })
        }

        setTodaysTasks(mapTasksWithStatus(todayTasks, 0))
        setUpcomingTasks([
          ...mapTasksWithStatus(tomorrowTasks, 1),
          ...mapTasksWithStatus(nextWeekTasks.slice(0, 5), 2) // Show max 5 upcoming
        ])

        // Generate predictive responses based on tasks
        generatePredictiveResponses(
          mapTasksWithStatus(todayTasks, 0),
          mapTasksWithStatus(tomorrowTasks, 1)
        )

      } catch (error) {
        console.error('Error loading protocol tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProtocolTasks()
  }, [patientId, surgeryDate, currentDay, supabase])

  // Generate smart predictive responses based on protocol
  const generatePredictiveResponses = (today: ProtocolTask[], tomorrow: ProtocolTask[]) => {
    const responses: PredictiveResponse[] = []

    // Task reminders for pending tasks today
    const pendingToday = today.filter(t => t.status === 'pending')
    if (pendingToday.length > 0) {
      const priorityTask = pendingToday.find(t => t.type === 'form' || t.type === 'exercise') || pendingToday[0]
      responses.push({
        id: 'reminder-1',
        text: `Ready to complete "${priorityTask.title}"?`,
        type: 'task_reminder',
        relatedTaskId: priorityTask.id,
        priority: 'high'
      })
    }

    // Completion confirmation for any task
    if (pendingToday.length > 0) {
      responses.push({
        id: 'complete-1',
        text: "I've completed my exercises for today",
        type: 'task_completion',
        priority: pendingToday.some(t => t.type === 'exercise') ? 'high' : 'medium'
      })
    }

    // Pain or concern reporting
    responses.push({
      id: 'concern-1',
      text: "I'm experiencing increased pain today",
      type: 'concern',
      priority: 'medium'
    })

    // General recovery questions
    responses.push({
      id: 'general-1',
      text: "What exercises should I focus on?",
      type: 'general_inquiry',
      priority: 'low'
    })

    // Tomorrow preparation
    if (tomorrow.length > 0) {
      responses.push({
        id: 'tomorrow-1',
        text: "What should I prepare for tomorrow?",
        type: 'general_inquiry',
        priority: 'low'
      })
    }

    setPredictiveResponses(responses.slice(0, 4)) // Limit to 4 suggestions
  }

  // Handle predictive response click
  const handlePredictiveClick = (response: PredictiveResponse) => {
    if (response.type === 'task_reminder' && response.relatedTaskId) {
      // Find the related task and open it
      const task = todaysTasks.find(t => t.id === response.relatedTaskId)
      if (task) {
        const taskData = {
          id: task.id,
          title: task.title,
          task_type: task.type as any,
          description: task.content,
          patient_task: {
            id: `pt-${task.id}`,
            status: task.status || 'pending',
            completed_at: task.status === 'completed' ? new Date().toISOString() : null
          }
        }
        onTaskAction?.(taskData, 'view')
      }
    } else {
      // Send as message
      onSendMessage(response.text)
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Activity className="h-4 w-4" />
      case 'form': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Today's Protocol Tasks */}
      {todaysTasks.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Today&apos;s Recovery Tasks
            </h3>
            <Badge variant="outline" className="text-xs">
              Day {currentDay}
            </Badge>
          </div>
          <div className="space-y-2">
            {todaysTasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50",
                  task.status === 'completed' && "bg-green-50 border-green-200",
                  task.status === 'missed' && "bg-red-50 border-red-200"
                )}
                onClick={() => {
                  const taskData = {
                    id: task.id,
                    title: task.title,
                    task_type: task.type as any,
                    description: task.content,
                    patient_task: {
                      id: `pt-${task.id}`,
                      status: task.status || 'pending',
                      completed_at: task.status === 'completed' ? new Date().toISOString() : null
                    }
                  }
                  onTaskAction?.(taskData, 'view')
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    task.status === 'completed' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {getTaskIcon(task.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Predictive Response Suggestions */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 px-1">Suggested responses:</p>
        <div className="grid grid-cols-2 gap-2">
          {predictiveResponses.map(response => (
            <Button
              key={response.id}
              variant="secondary"
              size="sm"
              className={cn(
                "justify-start text-left h-auto py-2 px-3",
                response.priority === 'high' && "ring-2 ring-blue-500 ring-offset-1"
              )}
              onClick={() => handlePredictiveClick(response)}
            >
              <div className="flex items-center gap-2 w-full">
                {response.type === 'task_reminder' && <Clock className="h-4 w-4 text-blue-600 shrink-0" />}
                {response.type === 'task_completion' && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                {response.type === 'concern' && <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />}
                {response.type === 'general_inquiry' && <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />}
                <span className="text-xs line-clamp-2">{response.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks Preview */}
      {upcomingTasks.length > 0 && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Upcoming This Week</p>
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </div>
          <div className="space-y-1">
            {upcomingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-xs text-blue-800">
                <span className="font-medium">Day {task.day}:</span>
                <span>{task.title}</span>
              </div>
            ))}
            {upcomingTasks.length > 3 && (
              <p className="text-xs text-blue-600">+{upcomingTasks.length - 3} more tasks</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}