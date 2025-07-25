'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
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
  Filter,
  X,
  MoreVertical
} from 'lucide-react'

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

interface Modification {
  id: string
  action: string
  task_name: string
  field_changed?: string
  old_value?: string
  new_value?: string
  reason: string
  created_at: string
  provider_name: string
  provider_role: string
}

interface ProtocolEditorProps {
  patientId: string
  patient: any
  onSave?: () => void
}

const TASK_TYPES = [
  { value: 'message', label: 'Message', icon: MessageSquare, color: 'bg-[#C8DBE9] text-[#002238]' },
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

export default function ProtocolEditor({ patientId, patient, onSave }: ProtocolEditorProps) {
  const supabase = createClient()
  
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [tasks, setTasks] = useState<ProtocolTask[]>([])
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([])
  const [taskLibrary, setTaskLibrary] = useState<TaskTemplate[]>([])
  const [modifications, setModifications] = useState<Modification[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'list'>('timeline')
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTaskLibrary, setShowTaskLibrary] = useState(false)
  const [showChatPreview, setShowChatPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [draggedTask, setDraggedTask] = useState<ProtocolTask | null>(null)
  
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
      },
      {
        id: 'lib-4',
        name: 'Pain Management Education',
        description: 'Understanding pain medication schedule',
        type: 'education',
        category: 'medication',
        content: { topic: 'pain management' },
        duration_minutes: 15,
        surgery_types: ['TKA', 'THA'],
        recovery_phase: 'immediate-post-op',
        difficulty_level: 'easy'
      },
      {
        id: 'lib-5',
        name: 'Wound Care Instructions',
        description: 'How to care for your surgical site',
        type: 'video',
        category: 'wound-care',
        content: { videoUrl: 'wound-care-tutorial' },
        duration_minutes: 10,
        surgery_types: ['TKA', 'THA'],
        recovery_phase: 'immediate-post-op',
        difficulty_level: 'easy'
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
      if (onSave) onSave()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragStart = (task: ProtocolTask) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault()
    if (draggedTask) {
      const updatedTasks = tasks.map(task => 
        task.id === draggedTask.id ? { ...task, day } : task
      )
      setTasks(updatedTasks)
      setDraggedTask(null)
    }
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

  const handleAddTask = () => {
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
  }

  const handleEditTask = (task: ProtocolTask) => {
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
  }

  const handleSaveTask = () => {
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
      status: editingTask?.status || 'pending'
    }

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? newTask : task))
    } else {
      setTasks([...tasks, newTask])
    }

    setShowTaskDialog(false)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId))
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006DB1]" />
      </div>
    )
  }

  const recoveryDay = patient?.surgery_date 
    ? Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className={viewMode === 'timeline' ? 'bg-[#006DB1] text-white' : ''}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-[#006DB1] text-white' : ''}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[#006DB1] text-white' : ''}
          >
            List
          </Button>
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
            onClick={() => setShowHistory(!showHistory)}
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

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <Card className="border-0 shadow-sm">
              <ScrollArea className="h-[600px]">
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
                          
                          
                          {(() => {
                            // Get all days with tasks in this phase
                            const phaseTasks = tasks.filter(task => {
                              const taskDay = task.day
                              return taskDay >= phase.dayRange[0] && taskDay <= phase.dayRange[1]
                            })
                            
                            // Get unique days that have tasks (including recurring task days)
                            const daysWithTasks = new Set<number>()
                            for (let day = phase.dayRange[0]; day <= phase.dayRange[1]; day++) {
                              if (getTasksForDay(day).length > 0) {
                                daysWithTasks.add(day)
                              }
                            }
                            
                            // Create array of days to show: all days with tasks + padding
                            const daysToShow: number[] = []
                            const sortedDays = Array.from(daysWithTasks).sort((a, b) => a - b)
                            
                            if (sortedDays.length === 0) {
                              // If no tasks, show first 5 days of the phase
                              for (let i = 0; i < Math.min(5, phase.dayRange[1] - phase.dayRange[0] + 1); i++) {
                                daysToShow.push(phase.dayRange[0] + i)
                              }
                            } else {
                              // Add days with tasks and some padding around them
                              sortedDays.forEach((day, index) => {
                                // Add 2 days before first task
                                if (index === 0) {
                                  for (let d = Math.max(phase.dayRange[0], day - 2); d < day; d++) {
                                    if (!daysToShow.includes(d)) daysToShow.push(d)
                                  }
                                }
                                
                                // Add the day with task
                                daysToShow.push(day)
                                
                                // Add days between tasks if gap is small
                                if (index < sortedDays.length - 1) {
                                  const nextDay = sortedDays[index + 1]
                                  const gap = nextDay - day
                                  if (gap <= 5) {
                                    // Show all days in small gaps
                                    for (let d = day + 1; d < nextDay; d++) {
                                      daysToShow.push(d)
                                    }
                                  } else {
                                    // For larger gaps, show 2 days after current and 2 before next
                                    for (let d = day + 1; d <= Math.min(day + 2, nextDay - 3); d++) {
                                      daysToShow.push(d)
                                    }
                                    // Add ellipsis marker
                                    daysToShow.push(-999) // Special marker for gap
                                    for (let d = Math.max(day + 3, nextDay - 2); d < nextDay; d++) {
                                      daysToShow.push(d)
                                    }
                                  }
                                }
                                
                                // Add 2 days after last task
                                if (index === sortedDays.length - 1) {
                                  for (let d = day + 1; d <= Math.min(phase.dayRange[1], day + 2); d++) {
                                    daysToShow.push(d)
                                  }
                                }
                              })
                            }
                            
                            // Always include today if it's in this phase
                            if (recoveryDay >= phase.dayRange[0] && recoveryDay <= phase.dayRange[1]) {
                              if (!daysToShow.includes(recoveryDay) && recoveryDay !== -999) {
                                // Find where to insert today
                                const insertIndex = daysToShow.findIndex(d => d > recoveryDay)
                                if (insertIndex === -1) {
                                  daysToShow.push(recoveryDay)
                                } else {
                                  daysToShow.splice(insertIndex, 0, recoveryDay)
                                }
                              }
                            }
                            
                            return daysToShow.map((day, index) => {
                              // Handle gap marker
                              if (day === -999) {
                                return (
                                  <div key={`gap-${index}`} className="text-center py-2 text-gray-400">
                                    <span className="text-sm">• • •</span>
                                  </div>
                                )
                              }
                              
                              const dayTasks = getTasksForDay(day)
                              const isToday = day === recoveryDay
                              
                              return (
                                <div
                                  key={`day-${day}`}
                                  className={`
                                    flex items-start gap-4 p-4 rounded-lg border transition-all
                                    ${isToday ? 'border-[#006DB1] bg-[#006DB1]/5' : 'border-gray-200'}
                                  `}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, day)}
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
                                      {dayTasks.map((task) => (
                                        <div
                                          key={task.id}
                                          draggable
                                          onDragStart={() => handleDragStart(task)}
                                          className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-move"
                                        >
                                          <GripVertical className="h-4 w-4 text-gray-400" />
                                          
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
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                  <MoreVertical className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                                  <Edit3 className="h-4 w-4 mr-2" />
                                                  Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                  const newTask = { ...task, id: `task-${Date.now()}`, day: selectedDay }
                                                  setTasks([...tasks, newTask])
                                                }}>
                                                  <Copy className="h-4 w-4 mr-2" />
                                                  Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                  onClick={() => handleDeleteTask(task.id)}
                                                  className="text-red-600"
                                                >
                                                  <Trash2 className="h-4 w-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
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
                                          handleAddTask()
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Task
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        })()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* Chat Preview Panel */}
        {showChatPreview && (
          <Card className="w-96 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Chat Preview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-auto">
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
                          <Button size="sm" className="mt-2 w-full bg-[#006DB1] hover:bg-[#002238]">
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
                      {task.type === 'video' && (
                        <div className="bg-white rounded-lg border p-4">
                          <h4 className="font-medium text-sm mb-2">{task.name}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <Button size="sm" variant="outline" className="mt-2 w-full">
                            <Video className="h-4 w-4 mr-2" />
                            Watch Video
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {getTasksForDay(selectedDay).length === 0 && (
                    <p className="text-center text-gray-500 text-sm">
                      No tasks scheduled for this day
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Panel */}
        {showHistory && (
          <Card className="w-96 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Modification History</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {modifications.map(mod => (
                    <Card key={mod.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{mod.task_name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {mod.action === 'update' && mod.field_changed && (
                              <>Changed {mod.field_changed}: {mod.old_value} → {mod.new_value}</>
                            )}
                            {mod.action === 'create' && 'Added new task'}
                            {mod.action === 'delete' && 'Removed task'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reason: {mod.reason}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mod.action}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>{mod.provider_name} • {mod.provider_role}</p>
                        <p>{formatDate(mod.created_at)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Dialog */}
      {showTaskDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={taskForm.is_recurring}
                      onChange={(e) => setTaskForm({
                        ...taskForm,
                        is_recurring: e.target.checked,
                        recurring_pattern: e.target.checked ? {
                          frequency: 'daily',
                          interval: 1,
                          endDay: selectedDay + 7
                        } : undefined
                      })}
                      className="h-4 w-4 rounded border-gray-300"
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
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTask}
                  disabled={!taskForm.name.trim()}
                  className="bg-[#006DB1] hover:bg-[#002238] text-white"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Library Dialog */}
      {showTaskLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Library</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTaskLibrary(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Select from pre-configured task templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    className="w-full pl-10"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[500px]">
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
                            <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={getTaskColor(template.type)} variant="secondary">
                                {getTaskIcon(template.type)}
                                <span className="ml-1">{template.type}</span>
                              </Badge>
                              {template.duration_minutes && (
                                <span className="text-xs text-gray-500">
                                  {template.duration_minutes} min
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <span>{template.recovery_phase.replace('-', ' ')}</span>
                              <span>•</span>
                              <span>{template.difficulty_level}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}