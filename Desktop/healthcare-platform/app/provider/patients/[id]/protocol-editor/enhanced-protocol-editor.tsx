'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Activity,
  FileText,
  Settings,
  CheckCircle2,
  Circle,
  Edit3,
  Copy,
  MessageSquare,
  Video,
  ClipboardList,
  Repeat,
  Eye,
  History,
  GripVertical,
  Library,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface ProtocolTask {
  id: string
  day: number
  name: string
  description: string
  type: 'message' | 'video' | 'form' | 'exercise' | 'assessment' | 'medication' | 'education'
  content: any
  duration_minutes?: number
  required: boolean
  is_recurring: boolean
  recurring_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    interval: number
    endDay: number
    daysOfWeek?: number[]
  }
  form_template_id?: string
  status: 'pending' | 'completed' | 'skipped' | 'cancelled'
  completed_at?: string
}

interface Protocol {
  id: string
  name: string
  description: string
  surgery_type: string
  duration_days: number
}

interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
}

interface TaskTemplate {
  id: string
  name: string
  description: string
  type: string
  category: string
  content: any
  duration_minutes?: number
  surgery_types: string[]
  recovery_phase: string
  difficulty_level: string
}

const TASK_TYPES = [
  { value: 'message', label: 'Message', icon: MessageSquare, color: 'bg-blue-100 text-blue-800' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-purple-100 text-purple-800' },
  { value: 'form', label: 'Form', icon: ClipboardList, color: 'bg-green-100 text-green-800' },
  { value: 'exercise', label: 'Exercise', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  { value: 'assessment', label: 'Assessment', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'medication', label: 'Medication', icon: Circle, color: 'bg-pink-100 text-pink-800' },
  { value: 'education', label: 'Education', icon: Settings, color: 'bg-indigo-100 text-indigo-800' }
]

const RECOVERY_PHASES = [
  { value: 'pre-op', label: 'Pre-Operation', dayRange: [-45, -1] },
  { value: 'immediate-post-op', label: 'Immediate Post-Op', dayRange: [0, 7] },
  { value: 'early-recovery', label: 'Early Recovery', dayRange: [8, 30] },
  { value: 'mid-recovery', label: 'Mid Recovery', dayRange: [31, 90] },
  { value: 'late-recovery', label: 'Late Recovery', dayRange: [91, 200] }
]

export default function EnhancedProtocolEditor() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const supabase = createClient()
  
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [patient, setPatient] = useState<any>(null)
  const [tasks, setTasks] = useState<ProtocolTask[]>([])
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([])
  const [taskLibrary, setTaskLibrary] = useState<TaskTemplate[]>([])
  const [modifications, setModifications] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'list'>('timeline')
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTaskLibrary, setShowTaskLibrary] = useState(false)
  const [showChatPreview, setShowChatPreview] = useState(false)
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  
  // Task form state
  const [taskForm, setTaskForm] = useState<{
    name: string
    description: string
    type: 'message' | 'video' | 'form' | 'exercise' | 'assessment' | 'medication' | 'education'
    duration_minutes: number
    required: boolean
    content: any
    is_recurring: boolean
    recurring_pattern?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
      interval: number
      endDay: number
      daysOfWeek?: number[]
    }
    form_template_id?: string
  }>({
    name: '',
    description: '',
    type: 'exercise',
    duration_minutes: 30,
    required: true,
    content: {},
    is_recurring: false
  })

  useEffect(() => {
    if (patientId) {
      loadProtocolData()
      loadFormTemplates()
      loadTaskLibrary()
      loadModificationHistory()
    }
  }, [patientId])

  const loadProtocolData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for demo
      setPatient({
        id: patientId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        surgery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        surgery_type: 'TKA'
      })

      setProtocol({
        id: 'protocol-1',
        name: 'Total Knee Replacement Recovery',
        description: 'Comprehensive recovery protocol for total knee arthroplasty',
        surgery_type: 'TKA',
        duration_days: 245 // -45 to +200
      })

      // Mock tasks across the timeline
      const mockTasks: ProtocolTask[] = [
        // Pre-op tasks
        {
          id: 'task-pre-1',
          day: -30,
          name: 'Pre-Surgery Education Video',
          description: 'Watch educational video about your upcoming surgery',
          type: 'video',
          content: { videoUrl: 'https://example.com/pre-surgery-education' },
          duration_minutes: 20,
          required: true,
          is_recurring: false,
          status: 'pending'
        },
        {
          id: 'task-pre-2',
          day: -14,
          name: 'Pre-Op Assessment Form',
          description: 'Complete pre-operative health assessment',
          type: 'form',
          content: {},
          form_template_id: 'form-1',
          required: true,
          is_recurring: false,
          status: 'pending'
        },
        {
          id: 'task-pre-3',
          day: -7,
          name: 'Daily Pre-Op Exercises',
          description: 'Strengthen muscles before surgery',
          type: 'exercise',
          content: { sets: 3, reps: 10 },
          duration_minutes: 15,
          required: true,
          is_recurring: true,
          recurring_pattern: {
            frequency: 'daily',
            interval: 1,
            endDay: -1
          },
          status: 'pending'
        },
        // Post-op tasks
        {
          id: 'task-1',
          day: 0,
          name: 'Post-Surgery Assessment',
          description: 'Initial post-operative evaluation',
          type: 'assessment',
          content: {},
          duration_minutes: 45,
          required: true,
          is_recurring: false,
          status: 'completed'
        },
        {
          id: 'task-2',
          day: 1,
          name: 'Daily Pain Check',
          description: 'Rate your pain level',
          type: 'message',
          content: { message: 'How is your pain today on a scale of 1-10?' },
          required: true,
          is_recurring: true,
          recurring_pattern: {
            frequency: 'daily',
            interval: 1,
            endDay: 30
          },
          status: 'pending'
        },
        {
          id: 'task-3',
          day: 2,
          name: 'Gentle Range of Motion',
          description: 'Begin gentle knee flexion exercises',
          type: 'exercise',
          content: { sets: 3, reps: 10 },
          duration_minutes: 30,
          required: true,
          is_recurring: true,
          recurring_pattern: {
            frequency: 'daily',
            interval: 1,
            endDay: 14
          },
          status: 'pending'
        }
      ]
      
      setTasks(mockTasks)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFormTemplates = async () => {
    // Mock form templates
    setFormTemplates([
      { id: 'form-1', name: 'Pre-Op Health Assessment', description: 'General health questionnaire', category: 'assessment' },
      { id: 'form-2', name: 'Pain Assessment', description: 'Daily pain tracking form', category: 'daily' },
      { id: 'form-3', name: 'ROM Measurement', description: 'Range of motion tracking', category: 'progress' },
      { id: 'form-4', name: 'Medication Tracker', description: 'Track medication compliance', category: 'medication' },
      { id: 'form-5', name: 'Physical Therapy Progress', description: 'PT session documentation', category: 'therapy' }
    ])
  }

  const loadTaskLibrary = async () => {
    // Mock task library
    setTaskLibrary([
      {
        id: 'lib-1',
        name: 'Ankle Pumps',
        description: 'Basic circulation exercise',
        type: 'exercise',
        category: 'circulation',
        content: { sets: 3, reps: 20, hold: 5 },
        duration_minutes: 10,
        surgery_types: ['TKA', 'THA'],
        recovery_phase: 'immediate-post-op',
        difficulty_level: 'easy'
      },
      {
        id: 'lib-2',
        name: 'Quad Sets',
        description: 'Strengthen quadriceps muscle',
        type: 'exercise',
        category: 'strengthening',
        content: { sets: 3, reps: 10, hold: 5 },
        duration_minutes: 15,
        surgery_types: ['TKA'],
        recovery_phase: 'early-recovery',
        difficulty_level: 'moderate'
      },
      {
        id: 'lib-3',
        name: 'Walking Program',
        description: 'Progressive walking routine',
        type: 'exercise',
        category: 'mobility',
        content: { distance: '100ft', assistance: 'walker' },
        duration_minutes: 20,
        surgery_types: ['TKA', 'THA'],
        recovery_phase: 'early-recovery',
        difficulty_level: 'moderate'
      }
    ])
  }

  const loadModificationHistory = async () => {
    // Mock modification history
    setModifications([
      {
        id: 'mod-1',
        action: 'update',
        task_name: 'Gentle Range of Motion',
        field_changed: 'duration_minutes',
        old_value: '45',
        new_value: '30',
        reason: 'Patient experiencing fatigue',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        provider_name: 'Dr. Smith',
        provider_role: 'surgeon'
      },
      {
        id: 'mod-2',
        action: 'create',
        task_name: 'Ice Application',
        reason: 'Added for swelling management',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        provider_name: 'Nurse Johnson',
        provider_role: 'nurse'
      }
    ])
  }

  const handleSaveProtocol = async () => {
    try {
      setIsSaving(true)
      // TODO: Implement actual save to database
      console.log('Saving protocol:', { protocol, tasks })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Protocol saved successfully!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    
    // Update the day based on the destination
    const newDay = parseInt(result.destination.droppableId.replace('day-', ''))
    reorderedItem.day = newDay
    
    items.splice(result.destination.index, 0, reorderedItem)
    setTasks(items)
  }

  const addTaskFromLibrary = (template: TaskTemplate) => {
    const newTask: ProtocolTask = {
      id: `task-${Date.now()}`,
      day: selectedDay,
      name: template.name,
      description: template.description,
      type: template.type as any,
      content: template.content,
      duration_minutes: template.duration_minutes,
      required: true,
      is_recurring: false,
      status: 'pending'
    }
    
    setTasks([...tasks, newTask])
    setShowTaskLibrary(false)
  }

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (task.day === day) return true
      if (task.is_recurring && task.recurring_pattern) {
        const pattern = task.recurring_pattern
        if (day > task.day && day <= pattern.endDay) {
          const dayDiff = day - task.day
          if (pattern.frequency === 'daily' && dayDiff % pattern.interval === 0) {
            return true
          }
          if (pattern.frequency === 'weekly' && dayDiff % (7 * pattern.interval) === 0) {
            return true
          }
        }
      }
      return false
    })
  }

  const getCurrentPhase = (day: number) => {
    return RECOVERY_PHASES.find(phase => 
      day >= phase.dayRange[0] && day <= phase.dayRange[1]
    ) || RECOVERY_PHASES[0]
  }

  const getTaskIcon = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.value === type)
    return taskType ? <taskType.icon className="h-4 w-4" /> : null
  }

  const getTaskColor = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.value === type)
    return taskType ? taskType.color : 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006DB1]" />
      </div>
    )
  }

  const recoveryDay = patient?.surgery_date 
    ? Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex h-16 items-center px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 hover:bg-[#F5F8FA] text-[#002238]"
            onClick={() => router.push(`/provider/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[#002238]">
              Protocol Editor - {patient?.first_name} {patient?.last_name}
            </h1>
            <p className="text-sm text-[#006DB1]">{protocol?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChatPreview(!showChatPreview)}
              className="border-[#C8DBE9] text-[#006DB1] hover:bg-[#006DB1] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showChatPreview ? 'Hide' : 'Show'} Chat Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Show history */}}
              className="border-[#C8DBE9] text-[#006DB1] hover:bg-[#006DB1] hover:text-white"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button
              onClick={handleSaveProtocol}
              disabled={isSaving}
              className="bg-[#006DB1] hover:bg-[#002238] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Protocol'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Timeline View */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                />
                <Select value={filterPhase} onValueChange={setFilterPhase}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    {RECOVERY_PHASES.map(phase => (
                      <SelectItem key={phase.value} value={phase.value}>
                        {phase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowTaskLibrary(true)}
                  className="bg-[#006DB1] hover:bg-[#002238] text-white"
                >
                  <Library className="h-4 w-4 mr-2" />
                  Task Library
                </Button>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              <DragDropContext onDragEnd={handleDragEnd}>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="p-6">
                    {RECOVERY_PHASES.map(phase => {
                      if (filterPhase !== 'all' && filterPhase !== phase.value) return null
                      
                      return (
                        <div key={phase.value} className="mb-8">
                          <h3 className="text-lg font-semibold text-[#002238] mb-4">
                            {phase.label}
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              (Day {phase.dayRange[0]} to {phase.dayRange[1]})
                            </span>
                          </h3>
                          
                          <div className="space-y-2">
                            {Array.from(
                              { length: phase.dayRange[1] - phase.dayRange[0] + 1 },
                              (_, i) => phase.dayRange[0] + i
                            ).map(day => {
                              const dayTasks = getTasksForDay(day)
                              const isToday = day === recoveryDay
                              
                              return (
                                <Droppable key={`day-${day}`} droppableId={`day-${day}`}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`
                                        flex items-start gap-4 p-4 rounded-lg border transition-all
                                        ${isToday ? 'border-[#006DB1] bg-[#006DB1]/5' : 'border-gray-200'}
                                        ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''}
                                      `}
                                    >
                                      <div className="w-24 flex-shrink-0">
                                        <div className="font-medium text-[#002238]">
                                          Day {day}
                                        </div>
                                        {isToday && (
                                          <Badge className="mt-1 bg-[#006DB1] text-white">
                                            Today
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex-1 min-h-[60px]">
                                        {dayTasks.length > 0 ? (
                                          <div className="space-y-2">
                                            {dayTasks.map((task, index) => (
                                              <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                              >
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`
                                                      flex items-center gap-3 p-3 bg-white rounded-lg border
                                                      ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                                                      hover:shadow-md transition-shadow
                                                    `}
                                                  >
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className="cursor-move"
                                                    >
                                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    
                                                    <Badge className={getTaskColor(task.type)}>
                                                      {getTaskIcon(task.type)}
                                                      <span className="ml-1 capitalize">{task.type}</span>
                                                    </Badge>
                                                    
                                                    <div className="flex-1">
                                                      <p className="font-medium text-sm">{task.name}</p>
                                                      <p className="text-xs text-gray-600">
                                                        {task.description}
                                                      </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                      {task.is_recurring && (
                                                        <Repeat className="h-4 w-4 text-[#006DB1]" />
                                                      )}
                                                      {task.duration_minutes && (
                                                        <div className="flex items-center text-xs text-gray-500">
                                                          <Clock className="h-3 w-3 mr-1" />
                                                          {task.duration_minutes}m
                                                        </div>
                                                      )}
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                          setEditingTask(task)
                                                          setTaskForm({
                                                            name: task.name,
                                                            description: task.description,
                                                            type: task.type,
                                                            duration_minutes: task.duration_minutes || 30,
                                                            required: task.required,
                                                            content: task.content,
                                                            is_recurring: task.is_recurring,
                                                            recurring_pattern: task.recurring_pattern,
                                                            form_template_id: task.form_template_id
                                                          })
                                                          setShowTaskDialog(true)
                                                        }}
                                                      >
                                                        <Edit3 className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-gray-400">
                                            <p className="text-sm">No tasks scheduled</p>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="mt-2"
                                              onClick={() => {
                                                setSelectedDay(day)
                                                setEditingTask(null)
                                                setTaskForm({
                                                  name: '',
                                                  description: '',
                                                  type: 'exercise',
                                                  duration_minutes: 30,
                                                  required: true,
                                                  content: {},
                                                  is_recurring: false
                                                })
                                                setShowTaskDialog(true)
                                              }}
                                            >
                                              <Plus className="h-4 w-4 mr-1" />
                                              Add Task
                                            </Button>
                                          </div>
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    </div>
                                  )}
                                </Droppable>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </DragDropContext>
            </div>
          </div>
        </div>

        {/* Chat Preview Panel */}
        {showChatPreview && (
          <div className="w-96 border-l bg-white p-6">
            <h3 className="text-lg font-semibold text-[#002238] mb-4">
              Chat Preview
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 h-[calc(100vh-10rem)] overflow-auto">
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-500">
                  Day {selectedDay} Preview
                </div>
                {getTasksForDay(selectedDay).map(task => (
                  <div key={task.id} className="space-y-2">
                    {task.type === 'message' && (
                      <div className="bg-[#006DB1] text-white rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">{task.content.message || task.description}</p>
                      </div>
                    )}
                    {task.type === 'exercise' && (
                      <div className="bg-white rounded-lg border p-4">
                        <h4 className="font-medium text-sm mb-2">{task.name}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <Button size="sm" className="mt-2 w-full">
                          Start Exercise
                        </Button>
                      </div>
                    )}
                    {task.type === 'form' && (
                      <div className="bg-white rounded-lg border p-4">
                        <h4 className="font-medium text-sm mb-2">{task.name}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <Button size="sm" variant="outline" className="mt-2 w-full">
                          Complete Form
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              Configure the task details and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                  placeholder="e.g., Daily Check-in"
                />
              </div>
              
              <div>
                <Label htmlFor="task-type">Task Type</Label>
                <Select
                  value={taskForm.type}
                  onValueChange={(value: any) => setTaskForm({...taskForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Brief description of the task"
                rows={3}
              />
            </div>
            
            {/* Type-specific content */}
            {taskForm.type === 'message' && (
              <div>
                <Label htmlFor="message-content">Message Content</Label>
                <Textarea
                  id="message-content"
                  value={taskForm.content.message || ''}
                  onChange={(e) => setTaskForm({
                    ...taskForm,
                    content: { ...taskForm.content, message: e.target.value }
                  })}
                  placeholder="Enter the message to send to the patient"
                  rows={3}
                />
              </div>
            )}
            
            {taskForm.type === 'form' && (
              <div>
                <Label htmlFor="form-template">Form Template</Label>
                <Select
                  value={taskForm.form_template_id}
                  onValueChange={(value) => setTaskForm({...taskForm, form_template_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a form template" />
                  </SelectTrigger>
                  <SelectContent>
                    {formTemplates.map(form => (
                      <SelectItem key={form.id} value={form.id}>
                        <div>
                          <p className="font-medium">{form.name}</p>
                          <p className="text-xs text-gray-600">{form.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(taskForm.type === 'exercise' || taskForm.type === 'video') && (
              <div>
                <Label htmlFor="task-duration">Duration (minutes)</Label>
                <Input
                  id="task-duration"
                  type="number"
                  value={taskForm.duration_minutes}
                  onChange={(e) => setTaskForm({...taskForm, duration_minutes: parseInt(e.target.value)})}
                  min="5"
                  max="120"
                />
              </div>
            )}
            
            {/* Recurring settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring">Recurring Task</Label>
                  <p className="text-sm text-gray-600">
                    Repeat this task on multiple days
                  </p>
                </div>
                <Switch
                  id="recurring"
                  checked={taskForm.is_recurring}
                  onCheckedChange={(checked) => setTaskForm({
                    ...taskForm,
                    is_recurring: checked,
                    recurring_pattern: checked ? {
                      frequency: 'daily',
                      interval: 1,
                      endDay: selectedDay + 7
                    } : undefined
                  })}
                />
              </div>
              
              {taskForm.is_recurring && taskForm.recurring_pattern && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={taskForm.recurring_pattern.frequency}
                        onValueChange={(value: any) => setTaskForm({
                          ...taskForm,
                          recurring_pattern: {
                            ...taskForm.recurring_pattern!,
                            frequency: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="interval">Repeat every</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="interval"
                          type="number"
                          value={taskForm.recurring_pattern.interval}
                          onChange={(e) => setTaskForm({
                            ...taskForm,
                            recurring_pattern: {
                              ...taskForm.recurring_pattern!,
                              interval: parseInt(e.target.value)
                            }
                          })}
                          min="1"
                          max="30"
                          className="w-20"
                        />
                        <span className="text-sm">
                          {taskForm.recurring_pattern.frequency === 'daily' ? 'days' :
                           taskForm.recurring_pattern.frequency === 'weekly' ? 'weeks' :
                           'months'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="end-day">End on day</Label>
                    <Input
                      id="end-day"
                      type="number"
                      value={taskForm.recurring_pattern.endDay}
                      onChange={(e) => setTaskForm({
                        ...taskForm,
                        recurring_pattern: {
                          ...taskForm.recurring_pattern!,
                          endDay: parseInt(e.target.value)
                        }
                      })}
                      min={selectedDay + 1}
                      max="200"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="task-required"
                checked={taskForm.required}
                onChange={(e) => setTaskForm({...taskForm, required: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="task-required">Required task</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const newTask: ProtocolTask = {
                  id: editingTask?.id || `task-${Date.now()}`,
                  day: editingTask?.day || selectedDay,
                  name: taskForm.name,
                  description: taskForm.description,
                  type: taskForm.type,
                  content: taskForm.content,
                  duration_minutes: taskForm.duration_minutes,
                  required: taskForm.required,
                  is_recurring: taskForm.is_recurring,
                  recurring_pattern: taskForm.recurring_pattern,
                  form_template_id: taskForm.form_template_id,
                  status: 'pending'
                }
                
                if (editingTask) {
                  setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t))
                } else {
                  setTasks([...tasks, newTask])
                }
                
                setShowTaskDialog(false)
              }}
              disabled={!taskForm.name.trim()}
              className="bg-[#006DB1] hover:bg-[#002238] text-white"
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Library Dialog */}
      <Dialog open={showTaskLibrary} onOpenChange={setShowTaskLibrary}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Task Library</DialogTitle>
            <DialogDescription>
              Select from pre-configured task templates
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Search tasks..."
              className="w-full"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {taskLibrary.map(template => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:border-[#006DB1] transition-colors"
                    onClick={() => addTaskFromLibrary(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm