'use client'

import React, { useState, useEffect } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  List,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  Video,
  MessageSquare,
  Activity,
  X,
  Copy,
  CheckCircle,
  Clock,
  Users,
  Package,
  Zap,
  Target,
  Layers,
  Filter,
  SortAsc
} from 'lucide-react'

// Import real TJV timeline data
import { 
  completeTimelineData,
  allTimelineTasks,
  TimelineTask,
  TimelinePhase
} from '@/lib/data/tjv-real-timeline-data'

interface ProtocolTask {
  id: string
  day: number | string
  type: 'form' | 'exercise' | 'video' | 'message'
  title: string
  description?: string
  content: string
  required: boolean
  frequency: {
    startDay: number | string
    stopDay: number | string
    repeat: boolean
  }
  duration?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  dependencies?: string[]
  triggers?: {
    condition: string
    action: string
  }[]
}

interface Protocol {
  id: string
  name: string
  description: string
  surgeryTypes: string[]
  activityLevels: string[]
  timelineStart: number
  timelineEnd: number
  isActive: boolean
  tasks: ProtocolTask[]
  createdAt: string
  updatedAt: string
  version: number
  isDraft: boolean
}

// Template library from specifications
const templateLibrary = {
  categories: ['Pre-Surgery', 'Post-Surgery', 'Exercises', 'Assessments', 'Education'],
  templates: [
    {
      id: 'pre-op-prep',
      name: 'Pre-Operative Preparation Bundle',
      category: 'Pre-Surgery',
      description: 'Complete pre-surgery preparation including education, assessments, and instructions',
      taskCount: 12,
      popularity: 95
    },
    {
      id: 'pain-assessment',
      name: 'Standard Pain Assessment Forms',
      category: 'Assessments',
      description: 'Validated pain scales and symptom tracking forms',
      taskCount: 5,
      popularity: 88
    },
    {
      id: 'early-mobility',
      name: 'Early Mobility Exercise Program',
      category: 'Exercises',
      description: 'Progressive exercise protocol for days 1-14 post-surgery',
      taskCount: 24,
      popularity: 92
    }
  ]
}

// Content Library Data - matching the structure from content library pages
const contentLibraryData = {
  videos: [
    {
      id: '1',
      title: 'Pre-Surgery Preparation Overview',
      description: 'Complete guide to preparing patients for joint replacement surgery, including timeline and expectations.',
      category: 'education',
      duration: '12:30',
      tags: ['pre-surgery', 'education', 'timeline']
    },
    {
      id: '2',
      title: 'Post-Op Exercise Routine - Week 1',
      description: 'Essential exercises for the first week after joint replacement surgery. Focus on gentle mobility and circulation.',
      category: 'exercise',
      duration: '15:45',
      tags: ['post-op', 'exercise', 'week-1', 'mobility']
    },
    {
      id: '3',
      title: 'Pain Management Strategies',
      description: 'Comprehensive overview of pain management techniques and medications for recovery.',
      category: 'education',
      duration: '18:20',
      tags: ['pain-management', 'education', 'recovery']
    },
    {
      id: '4',
      title: 'Advanced Strengthening Exercises',
      description: 'Progressive strengthening exercises for intermediate recovery phase.',
      category: 'exercise',
      duration: '22:15',
      tags: ['strengthening', 'intermediate', 'recovery']
    }
  ],
  forms: [
    {
      id: '1',
      title: 'Pain Assessment Scale',
      description: 'Daily pain evaluation using validated pain scales and functional assessment.',
      category: 'assessment',
      phase: 'post-op',
      estimatedTime: '3 minutes',
      tags: ['pain', 'assessment', 'daily']
    },
    {
      id: '2',
      title: 'Pre-Surgery Health Assessment',
      description: 'Comprehensive health evaluation before joint replacement surgery.',
      category: 'intake',
      phase: 'pre-op',
      estimatedTime: '10 minutes',
      tags: ['pre-surgery', 'intake', 'baseline']
    },
    {
      id: '3',
      title: 'Weekly Progress Survey',
      description: 'Track recovery progress, mobility improvements, and any concerns.',
      category: 'survey',
      phase: 'recovery',
      estimatedTime: '5 minutes',
      tags: ['progress', 'survey', 'weekly']
    },
    {
      id: '4',
      title: 'Functional Outcome Measure',
      description: 'Standardized assessment of functional recovery and quality of life outcomes.',
      category: 'outcome',
      phase: 'follow-up',
      estimatedTime: '8 minutes',
      tags: ['outcome', 'functional', 'qol']
    }
  ],
  exercises: [
    {
      id: '1',
      title: 'Ankle Pumps',
      description: 'Basic circulation exercise to prevent blood clots and improve lower leg circulation.',
      category: 'mobility',
      difficulty: 'beginner',
      phase: 'early',
      duration: '5 minutes',
      bodyPart: ['ankle', 'calf'],
      tags: ['circulation', 'early-recovery', 'bed-exercise']
    },
    {
      id: '2',
      title: 'Quad Sets',
      description: 'Quadriceps strengthening exercise essential for knee stability and function.',
      category: 'strength',
      difficulty: 'beginner',
      phase: 'early',
      duration: '5 minutes',
      bodyPart: ['quadriceps', 'knee'],
      tags: ['strengthening', 'quadriceps', 'knee-stability']
    },
    {
      id: '3',
      title: 'Heel Slides',
      description: 'Gentle knee flexion exercise to improve range of motion and prevent stiffness.',
      category: 'mobility',
      difficulty: 'beginner',
      phase: 'early',
      duration: '10 minutes',
      bodyPart: ['knee', 'hamstring'],
      tags: ['flexibility', 'range-of-motion', 'knee-flexion']
    },
    {
      id: '4',
      title: 'Stationary Bike',
      description: 'Low-impact cardiovascular exercise that improves endurance and knee mobility.',
      category: 'cardio',
      difficulty: 'intermediate',
      phase: 'intermediate',
      duration: '15-30 minutes',
      bodyPart: ['knee', 'hip', 'ankle'],
      tags: ['cardiovascular', 'low-impact', 'endurance']
    },
    {
      id: '5',
      title: 'Single Leg Balance',
      description: 'Advanced balance exercise to improve proprioception and functional stability.',
      category: 'balance',
      difficulty: 'advanced',
      phase: 'advanced',
      duration: '10 minutes',
      bodyPart: ['hip', 'knee', 'ankle'],
      tags: ['balance', 'proprioception', 'functional']
    }
  ]
}

export default function DemoProtocolBuilderPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'logic' | 'preview'>('details')
  const [protocol, setProtocol] = useState<Protocol>({
    id: 'new-protocol',
    name: '',
    description: '',
    surgeryTypes: ['TKA'],
    activityLevels: ['all'],
    timelineStart: -45,
    timelineEnd: 200,
    isActive: true,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    isDraft: true
  })
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDay, setSelectedDay] = useState<number>(-45)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load real TJV timeline data on mount
  useEffect(() => {
    loadRealTimelineData()
  }, [])

  const loadRealTimelineData = () => {
    const convertedTasks: ProtocolTask[] = allTimelineTasks.map((task, index) => ({
      id: `task-${index}`,
      day: task.day,
      type: task.type as 'form' | 'exercise' | 'video' | 'message',
      title: task.title,
      description: task.description,
      content: task.content,
      required: task.required,
      frequency: {
        startDay: task.day,
        stopDay: task.day,
        repeat: false
      }
    }))
    
    setProtocol(prev => ({ ...prev, tasks: convertedTasks }))
  }

  const saveProtocol = () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      router.push('/demo/provider/protocols')
    }, 1500)
  }

  const addTask = (task: ProtocolTask) => {
    setProtocol(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: `task-${Date.now()}` }]
    }))
  }

  const updateTask = (updatedTask: ProtocolTask) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }))
  }

  const deleteTask = (taskId: string) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }))
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Protocol Builder</h1>
              <p className="text-gray-600 mt-1">
                Create and customize recovery protocols with visual timeline editing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowTemplateLibrary(true)}
                icon={<Package className="h-4 w-4" />}
              >
                Template Library
              </Button>
              <Button
                variant="secondary"
                onClick={() => setActiveTab('preview')}
                icon={<Eye className="h-4 w-4" />}
              >
                Preview
              </Button>
              <Button
                onClick={saveProtocol}
                disabled={!protocol.name || protocol.tasks.length === 0 || saving}
                icon={<Save className="h-4 w-4" />}
              >
                {saving ? 'Saving...' : 'Save Protocol'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', label: 'Protocol Details', icon: Settings },
                { id: 'timeline', label: 'Recovery Timeline', icon: Calendar },
                { id: 'logic', label: 'Conditional Logic', icon: Zap },
                { id: 'preview', label: 'Preview', icon: Eye }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <ProtocolDetailsTab 
              protocol={protocol} 
              setProtocol={setProtocol} 
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab
              protocol={protocol}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              onAddTask={addTask}
              onEditTask={updateTask}
              onDeleteTask={deleteTask}
              showTaskModal={showTaskModal}
              setShowTaskModal={setShowTaskModal}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
            />
          )}

          {activeTab === 'logic' && (
            <ConditionalLogicTab 
              protocol={protocol}
              setProtocol={setProtocol}
            />
          )}

          {activeTab === 'preview' && (
            <ProtocolPreviewTab protocol={protocol} />
          )}

          {/* Template Library Modal */}
          {showTemplateLibrary && (
            <TemplateLibraryModal
              onClose={() => setShowTemplateLibrary(false)}
              onImport={(template) => {
                // Import template logic
                setShowTemplateLibrary(false)
              }}
            />
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

// Protocol Details Tab
function ProtocolDetailsTab({ protocol, setProtocol }: {
  protocol: Protocol
  setProtocol: (protocol: Protocol) => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader title="Basic Information">
            <Settings className="h-5 w-5 text-blue-600 mr-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protocol Name *
              </label>
              <Input
                value={protocol.name}
                onChange={(e) => setProtocol({ ...protocol, name: e.target.value })}
                placeholder="e.g., Standard TKA Recovery Protocol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={protocol.description}
                onChange={(e) => setProtocol({ ...protocol, description: e.target.value })}
                placeholder="Describe this protocol and when to use it..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surgery Types
                </label>
                <div className="space-y-2">
                  {['TKA', 'THA', 'TSA'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={protocol.surgeryTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProtocol({ 
                              ...protocol, 
                              surgeryTypes: [...protocol.surgeryTypes, type] 
                            })
                          } else {
                            setProtocol({ 
                              ...protocol, 
                              surgeryTypes: protocol.surgeryTypes.filter(t => t !== type) 
                            })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Levels
                </label>
                <div className="space-y-2">
                  {['Active', 'Sedentary', 'All'].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={protocol.activityLevels.includes(level.toLowerCase())}
                        onChange={(e) => {
                          const value = level.toLowerCase()
                          if (e.target.checked) {
                            setProtocol({ 
                              ...protocol, 
                              activityLevels: [...protocol.activityLevels, value] 
                            })
                          } else {
                            setProtocol({ 
                              ...protocol, 
                              activityLevels: protocol.activityLevels.filter(l => l !== value) 
                            })
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline Start (Days Before Surgery)
                </label>
                <Input
                  type="number"
                  value={Math.abs(protocol.timelineStart)}
                  onChange={(e) => setProtocol({ 
                    ...protocol, 
                    timelineStart: -parseInt(e.target.value) || 0 
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typically starts 45 days before surgery
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline End (Days After Surgery)
                </label>
                <Input
                  type="number"
                  value={protocol.timelineEnd}
                  onChange={(e) => setProtocol({ 
                    ...protocol, 
                    timelineEnd: parseInt(e.target.value) || 0 
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Long-term recovery extends to 200+ days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Protocol Status" />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="font-medium">{protocol.version}.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <StatusIndicator 
                status={protocol.isDraft ? 'warning' : 'success'} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasks</span>
              <span className="font-medium">{protocol.tasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-medium">
                {Math.abs(protocol.timelineStart) + protocol.timelineEnd} days
              </span>
            </div>
          </CardContent>
        </Card>

        <Card variant="info">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Real TJV Data Loaded
            </h4>
            <p className="text-sm text-blue-800">
              This protocol includes evidence-based timeline data from TJV&apos;s clinical protocols, 
              spanning from enrollment through long-term recovery.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Timeline Tab with Calendar and List Views
function TimelineTab({ 
  protocol, 
  viewMode, 
  setViewMode, 
  selectedDay, 
  setSelectedDay,
  onAddTask,
  onEditTask,
  onDeleteTask,
  showTaskModal,
  setShowTaskModal,
  editingTask,
  setEditingTask
}: any) {
  const [currentWeek, setCurrentWeek] = useState(0)
  
  const getTasksForDay = (day: number) => {
    return protocol.tasks.filter((task: ProtocolTask) => {
      const startDay = typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay
      const stopDay = typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay
      
      if (task.frequency.repeat) {
        return day >= startDay && day <= stopDay
      }
      return day === startDay
    })
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Recovery Timeline</h3>
          <span className="text-sm text-gray-600">
            {protocol.tasks.length} tasks configured
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
          
          <Button
            onClick={() => {
              setEditingTask(null)
              setShowTaskModal(true)
            }}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView
          protocol={protocol}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onEditTask={(task: ProtocolTask) => {
            setEditingTask(task)
            setShowTaskModal(true)
          }}
          onDeleteTask={onDeleteTask}
          getTasksForDay={getTasksForDay}
        />
      ) : (
        <ListView
          protocol={protocol}
          onEditTask={(task: ProtocolTask) => {
            setEditingTask(task)
            setShowTaskModal(true)
          }}
          onDeleteTask={onDeleteTask}
        />
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSave={(task: ProtocolTask) => {
            if (editingTask) {
              onEditTask(task)
            } else {
              onAddTask(task)
            }
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          editingTask={editingTask}
          selectedDay={selectedDay}
        />
      )}
    </div>
  )
}

// Calendar View Component
function CalendarView({ protocol, currentWeek, setCurrentWeek, selectedDay, setSelectedDay, onEditTask, onDeleteTask, getTasksForDay }: any) {
  const generateWeeks = () => {
    const weeks = []
    const totalDays = protocol.timelineEnd - protocol.timelineStart + 1
    const weeksCount = Math.ceil(totalDays / 7)
    
    for (let i = 0; i < weeksCount; i++) {
      const startDay = protocol.timelineStart + (i * 7)
      const endDay = Math.min(startDay + 6, protocol.timelineEnd)
      const days = []
      
      for (let day = startDay; day <= endDay; day++) {
        days.push(day)
      }
      
      weeks.push({ startDay, endDay, days })
    }
    return weeks
  }

  const weeks = generateWeeks()
  const currentWeekData = weeks[currentWeek] || weeks[0]

  const getDayLabel = (day: number) => {
    if (day === 0) return 'Surgery'
    if (day < 0) return `Pre-Op ${Math.abs(day)}`
    return `Post-Op ${day}`
  }

  const getDayPhase = (day: number) => {
    if (day < -7) return 'enrollment'
    if (day < 0) return 'pre-op'
    if (day === 0) return 'surgery'
    if (day <= 7) return 'early'
    if (day <= 30) return 'intermediate'
    return 'advanced'
  }

  const phaseColors = {
    enrollment: 'bg-blue-50 border-blue-200',
    'pre-op': 'bg-yellow-50 border-yellow-200',
    surgery: 'bg-red-50 border-red-200',
    early: 'bg-orange-50 border-orange-200',
    intermediate: 'bg-green-50 border-green-200',
    advanced: 'bg-purple-50 border-purple-200'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous Week
          </Button>
          
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900">
              Week {currentWeek + 1} of {weeks.length}
            </h4>
            <p className="text-sm text-gray-600">
              Day {currentWeekData.startDay} to Day {currentWeekData.endDay}
            </p>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
            disabled={currentWeek === weeks.length - 1}
          >
            Next Week
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {currentWeekData.days.map((day: number) => {
            const phase = getDayPhase(day)
            const tasks = getTasksForDay(day)
            
            return (
              <div
                key={day}
                className={`border rounded-lg p-3 min-h-[250px] ${phaseColors[phase]}`}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {getDayLabel(day)}
                  </div>
                  <div className="text-xs text-gray-600 capitalize mt-1">
                    {phase} phase
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tasks.map((task: ProtocolTask) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                  
                  <button
                    onClick={() => setSelectedDay(day)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Task Card Component
function TaskCard({ task, onEdit, onDelete }: {
  task: ProtocolTask
  onEdit: () => void
  onDelete: () => void
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-3 w-3" />
      case 'exercise': return <Activity className="h-3 w-3" />
      case 'video': return <Video className="h-3 w-3" />
      case 'message': return <MessageSquare className="h-3 w-3" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800 border-green-200'
      case 'exercise': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'video': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'message': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className={`border rounded-lg p-2 text-xs ${getTypeColor(task.type)}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {getTypeIcon(task.type)}
          <span className="font-medium capitalize">{task.type}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="font-medium text-gray-900 truncate">
        {task.title}
      </div>
      {task.frequency.repeat && (
        <div className="text-xs text-gray-600 mt-1">
          <Clock className="h-3 w-3 inline mr-1" />
          Repeats
        </div>
      )}
    </div>
  )
}

// List View Component
function ListView({ protocol, onEditTask, onDeleteTask }: any) {
  const [sortBy, setSortBy] = useState('day')
  const [filterType, setFilterType] = useState('all')

  const sortedTasks = [...protocol.tasks].sort((a, b) => {
    if (sortBy === 'day') {
      const dayA = typeof a.frequency.startDay === 'string' ? -45 : a.frequency.startDay
      const dayB = typeof b.frequency.startDay === 'string' ? -45 : b.frequency.startDay
      return dayA - dayB
    }
    if (sortBy === 'type') {
      return a.type.localeCompare(b.type)
    }
    return a.title.localeCompare(b.title)
  })

  const filteredTasks = sortedTasks.filter(task => {
    if (filterType === 'all') return true
    return task.type === filterType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-4 w-4" />
      case 'exercise': return <Activity className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800'
      case 'exercise': return 'bg-purple-100 text-purple-800'
      case 'video': return 'bg-blue-100 text-blue-800'
      case 'message': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="day">Day</option>
                <option value="type">Type</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="form">Forms</option>
                <option value="exercise">Exercises</option>
                <option value="video">Videos</option>
                <option value="message">Messages</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredTasks.length} tasks
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(task.type)}
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">
                    Day {typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay}
                    {task.frequency.repeat && ` - ${typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTask(task)}
                  icon={<Edit className="h-4 w-4" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTask(task.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Conditional Logic Tab
function ConditionalLogicTab({ protocol, setProtocol }: {
  protocol: Protocol
  setProtocol: (protocol: Protocol) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Conditional Task Logic">
          <Zap className="h-5 w-5 text-purple-600 mr-2" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conditional Logic
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Set up rules to show or hide tasks based on patient responses, progress, or other conditions.
            </p>
            <Button className="mt-6" variant="primary">
              Add Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Example Conditions" />
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">High Pain Level</h4>
              <p className="text-sm text-blue-700 mt-1">
                If pain level {'>'} 7, add extra pain management education and notify provider
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Good Progress</h4>
              <p className="text-sm text-green-700 mt-1">
                If mobility score improves by 20%, unlock advanced exercises
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">Missed Tasks</h4>
              <p className="text-sm text-orange-700 mt-1">
                If patient misses 3+ tasks, send encouragement message and simplify program
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Protocol Preview Tab
function ProtocolPreviewTab({ protocol }: { protocol: Protocol }) {
  const tasksByType = protocol.tasks.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getPhaseStats = () => {
    const phases = [
      { name: 'Pre-Surgery', start: -45, end: -1, color: 'blue' },
      { name: 'Early Recovery', start: 0, end: 30, color: 'orange' },
      { name: 'Intermediate', start: 31, end: 90, color: 'green' },
      { name: 'Advanced', start: 91, end: 200, color: 'purple' }
    ]

    return phases.map(phase => {
      const tasksInPhase = protocol.tasks.filter(task => {
        const day = typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay
        return day >= phase.start && day <= phase.end
      })
      return { ...phase, count: tasksInPhase.length }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Protocol Overview">
          <Eye className="h-5 w-5 text-blue-600 mr-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Name</dt>
                  <dd className="font-medium">{protocol.name || 'Untitled Protocol'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Description</dt>
                  <dd className="text-sm">{protocol.description || 'No description provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Surgery Types</dt>
                  <dd className="text-sm">{protocol.surgeryTypes.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Duration</dt>
                  <dd className="text-sm">
                    {Math.abs(protocol.timelineStart) + protocol.timelineEnd} days total
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Task Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Forms
                  </span>
                  <span className="font-medium">{tasksByType.form || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Exercises
                  </span>
                  <span className="font-medium">{tasksByType.exercise || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videos
                  </span>
                  <span className="font-medium">{tasksByType.video || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </span>
                  <span className="font-medium">{tasksByType.message || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Timeline Phases" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getPhaseStats().map((phase) => (
              <div key={phase.name} className={`p-4 rounded-lg bg-${phase.color}-50 border border-${phase.color}-200`}>
                <h5 className={`font-medium text-${phase.color}-900`}>{phase.name}</h5>
                <p className={`text-2xl font-bold text-${phase.color}-700 mt-1`}>{phase.count}</p>
                <p className={`text-xs text-${phase.color}-600`}>tasks</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="success">
        <CardContent className="p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Ready to Save
          </h4>
          <p className="text-sm text-green-800">
            This protocol contains {protocol.tasks.length} tasks spanning {Math.abs(protocol.timelineStart) + protocol.timelineEnd} days 
            of recovery. All tasks include real clinical data from TJV&apos;s evidence-based protocols.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Task Modal
function TaskModal({ isOpen, onClose, onSave, editingTask, selectedDay }: {
  isOpen: boolean
  onClose: () => void
  onSave: (task: ProtocolTask) => void
  editingTask: ProtocolTask | null
  selectedDay: number
}) {
  const [task, setTask] = useState<ProtocolTask>(
    editingTask || {
      id: '',
      day: selectedDay,
      type: 'message',
      title: '',
      content: '',
      required: true,
      frequency: {
        startDay: selectedDay,
        stopDay: selectedDay,
        repeat: false
      }
    }
  )

  const [selectedContentId, setSelectedContentId] = useState<string>('')
  const [contentSelectionMode, setContentSelectionMode] = useState<boolean>(false)

  // Get available content based on task type
  const getAvailableContent = () => {
    switch (task.type) {
      case 'video':
        return contentLibraryData.videos
      case 'form':
        return contentLibraryData.forms
      case 'exercise':
        return contentLibraryData.exercises
      default:
        return []
    }
  }

  // Handle content selection from dropdown
  const handleContentSelection = (contentId: string) => {
    const availableContent = getAvailableContent()
    const selectedContent = availableContent.find(item => item.id === contentId)
    
    if (selectedContent) {
      setTask(prevTask => ({
        ...prevTask,
        title: selectedContent.title,
        content: selectedContent.description,
        description: selectedContent.description
      }))
      setSelectedContentId(contentId)
    }
  }

  // Toggle between manual entry and content selection
  const toggleContentSelectionMode = () => {
    setContentSelectionMode(!contentSelectionMode)
    if (!contentSelectionMode) {
      // Clear manual entries when switching to selection mode
      setTask(prevTask => ({
        ...prevTask,
        title: '',
        content: ''
      }))
      setSelectedContentId('')
    }
  }

  const handleSave = () => {
    if (task.title && task.content) {
      onSave(task)
    }
  }

  if (!isOpen) return null

  const availableContent = getAvailableContent()
  const canUseContentLibrary = ['video', 'form', 'exercise'].includes(task.type) && availableContent.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={editingTask ? 'Edit Task' : 'Add New Task'}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={task.type}
                onChange={(e) => {
                  setTask({ ...task, type: e.target.value as any })
                  setContentSelectionMode(false)
                  setSelectedContentId('')
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="message">Message</option>
                <option value="video">Video</option>
                <option value="form">Form</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required
              </label>
              <select
                value={task.required ? 'yes' : 'no'}
                onChange={(e) => setTask({ ...task, required: e.target.value === 'yes' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Content Selection Toggle */}
          {canUseContentLibrary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Content Library Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Select from existing {task.type}s in your content library or create manually
                  </p>
                </div>
                <Button
                  variant={contentSelectionMode ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={toggleContentSelectionMode}
                >
                  {contentSelectionMode ? 'Manual Entry' : 'Select from Library'}
                </Button>
              </div>
            </div>
          )}

          {/* Content Selection Dropdown */}
          {contentSelectionMode && canUseContentLibrary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {task.type === 'exercise' ? 'Exercise' : task.type === 'form' ? 'Form' : 'Video'} *
              </label>
              <select
                value={selectedContentId}
                onChange={(e) => handleContentSelection(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choose a {task.type}...</option>
                {availableContent.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                    {item.category && ` (${item.category})`}
                    {'duration' in item && item.duration && ` - ${item.duration}`}
                    {'estimatedTime' in item && item.estimatedTime && ` - ${item.estimatedTime}`}
                  </option>
                ))}
              </select>
              {selectedContentId && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {availableContent.find(item => item.id === selectedContentId)?.description}
                  </p>
                  {availableContent.find(item => item.id === selectedContentId)?.tags && (
                    <div className="flex gap-2 mt-2">
                      {availableContent.find(item => item.id === selectedContentId)?.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Fields */}
          {(!contentSelectionMode || !canUseContentLibrary) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <Textarea
                  value={task.content}
                  onChange={(e) => setTask({ ...task, content: e.target.value })}
                  placeholder="Task instructions or content"
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Selected Content Display */}
          {contentSelectionMode && selectedContentId && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Title
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                  {task.title}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Content
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 min-h-[100px]">
                  {task.content}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.frequency.repeat}
                onChange={(e) => setTask({
                  ...task,
                  frequency: { ...task.frequency, repeat: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Repeat task</span>
            </label>
          </div>

          {task.frequency.repeat && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Day
                </label>
                <Input
                  type="number"
                  value={task.frequency.startDay}
                  onChange={(e) => setTask({
                    ...task,
                    frequency: { ...task.frequency, startDay: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Day
                </label>
                <Input
                  type="number"
                  value={task.frequency.stopDay}
                  onChange={(e) => setTask({
                    ...task,
                    frequency: { ...task.frequency, stopDay: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!task.title || !task.content}
            >
              {editingTask ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Template Library Modal
function TemplateLibraryModal({ onClose, onImport }: {
  onClose: () => void
  onImport: (template: any) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader
          title="Template Library"
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateLibrary.templates.map((template) => (
              <Card key={template.id} variant="default" interactive>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>{template.taskCount} tasks</span>
                        <span>{template.popularity}% popularity</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onImport(template)}
                      icon={<Copy className="h-4 w-4" />}
                    >
                      Import
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
