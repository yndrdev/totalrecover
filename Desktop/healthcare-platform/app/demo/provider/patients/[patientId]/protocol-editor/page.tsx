'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import {
  Calendar,
  List,
  Eye,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Activity,
  MessageSquare,
  FileText,
  Video,
  User,
  ArrowLeft,
  Clock,
  TrendingUp,
  Heart,
  BarChart3,
  Brain
} from 'lucide-react'
import FormAssignmentModal from '@/components/protocol/form-assignment-modal'
import { FormAssignment } from '@/types/forms'

// Types
interface PatientProtocolTask {
  id: string
  day: number
  type: 'message' | 'form' | 'exercise' | 'video'
  title: string
  content: string
  required: boolean
  completed?: boolean
  completedAt?: string
  painLevelReported?: number
  notes?: string
  adjustedFromOriginal?: boolean
  frequency: {
    startDay: number
    stopDay: number
    repeat: boolean
  }
}

interface PatientProtocol {
  id: string
  patientId: string
  name: string
  description: string
  surgeryType: string
  surgeryDate: string
  currentDay: number
  timelineStart: number
  timelineEnd: number
  tasks: PatientProtocolTask[]
  painLevelTrend: number[]
  lastModified: string
}

interface Patient {
  id: string
  name: string
  age: number
  surgeryType: string
  surgeryDate: string
  currentPainLevel: number
  recoveryProgress: number
}

// Mock patient data
const mockPatients: Record<string, Patient> = {
  'patient-1': {
    id: 'patient-1',
    name: 'Sarah Johnson',
    age: 45,
    surgeryType: 'Total Knee Replacement',
    surgeryDate: '2024-01-15',
    currentPainLevel: 6,
    recoveryProgress: 65
  },
  'patient-2': {
    id: 'patient-2',
    name: 'Michael Chen',
    age: 52,
    surgeryType: 'Hip Replacement',
    surgeryDate: '2024-01-08',
    currentPainLevel: 4,
    recoveryProgress: 78
  }
}

// Mock protocol data with real TJV timeline tasks
const createMockPatientProtocol = (patientId: string): PatientProtocol => {
  const patient = mockPatients[patientId]
  const today = new Date()
  const surgeryDate = new Date(patient.surgeryDate)
  const currentDay = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))

  return {
    id: `protocol-${patientId}`,
    patientId,
    name: `${patient.surgeryType} Recovery Protocol`,
    description: `Personalized recovery protocol for ${patient.name}`,
    surgeryType: patient.surgeryType,
    surgeryDate: patient.surgeryDate,
    currentDay,
    timelineStart: -14,
    timelineEnd: 180,
    painLevelTrend: [8, 7, 6, 5, 6, 5, 4, 6, 5, 4], // Last 10 days
    lastModified: new Date().toISOString(),
    tasks: [
      {
        id: 'task-pre-1',
        day: -7,
        type: 'form',
        title: 'Pre-Surgery Assessment',
        content: 'Complete pre-operative health assessment and expectations questionnaire.',
        required: true,
        completed: true,
        completedAt: '2024-01-08T10:00:00Z',
        frequency: { startDay: -7, stopDay: -7, repeat: false }
      },
      {
        id: 'task-1',
        day: 0,
        type: 'message',
        title: 'Welcome to Your Recovery',
        content: 'Congratulations on taking the first step toward better health! Your surgical team is here to support you throughout your recovery journey.',
        required: true,
        completed: true,
        completedAt: '2024-01-15T08:00:00Z',
        frequency: { startDay: 0, stopDay: 0, repeat: false }
      },
      {
        id: 'task-2',
        day: 1,
        type: 'exercise',
        title: 'Ankle Pumps and Calf Raises',
        content: 'Perform 10 ankle pumps every hour while awake. This helps prevent blood clots and reduces swelling.',
        required: true,
        completed: true,
        completedAt: '2024-01-16T14:30:00Z',
        painLevelReported: 7,
        frequency: { startDay: 1, stopDay: 14, repeat: true }
      },
      {
        id: 'task-3',
        day: 2,
        type: 'form',
        title: 'Daily Pain & Progress Check',
        content: 'Rate your pain level and report any concerns about your recovery.',
        required: true,
        completed: true,
        completedAt: '2024-01-17T09:15:00Z',
        painLevelReported: 6,
        frequency: { startDay: 2, stopDay: 30, repeat: true }
      },
      {
        id: 'task-4',
        day: 3,
        type: 'video',
        title: 'Proper Walking Technique',
        content: 'Learn the correct way to walk with your assistive device to promote healing and prevent injury.',
        required: true,
        completed: true,
        completedAt: '2024-01-18T11:00:00Z',
        frequency: { startDay: 3, stopDay: 3, repeat: false }
      },
      {
        id: 'task-5',
        day: 7,
        type: 'exercise',
        title: 'Seated Knee Extensions',
        content: 'Sit in a chair and slowly straighten your knee. Hold for 5 seconds, then lower. Repeat 10 times, 3x daily.',
        required: true,
        completed: true,
        completedAt: '2024-01-22T16:45:00Z',
        painLevelReported: 5,
        adjustedFromOriginal: true, // This task was modified due to patient progress
        notes: 'Reduced frequency due to patient reporting high pain levels',
        frequency: { startDay: 7, stopDay: 21, repeat: true }
      },
      {
        id: 'task-6',
        day: 14,
        type: 'form',
        title: '2-Week Progress Assessment',
        content: 'Complete comprehensive recovery assessment including range of motion and functional capacity.',
        required: true,
        completed: false,
        frequency: { startDay: 14, stopDay: 14, repeat: false }
      },
      {
        id: 'task-7',
        day: 21,
        type: 'exercise',
        title: 'Advanced Strengthening',
        content: 'Begin advanced strengthening exercises as tolerated. Focus on quadriceps and hip strengthening.',
        required: true,
        completed: false,
        frequency: { startDay: 21, stopDay: 60, repeat: true }
      },
      {
        id: 'task-8',
        day: 30,
        type: 'video',
        title: 'Return to Activities',
        content: 'Learn how to safely return to your normal daily activities and work responsibilities.',
        required: true,
        completed: false,
        frequency: { startDay: 30, stopDay: 30, repeat: false }
      },
      {
        id: 'task-9',
        day: 60,
        type: 'form',
        title: 'Final Recovery Assessment',
        content: 'Complete comprehensive final assessment to evaluate recovery progress and plan for long-term care.',
        required: true,
        completed: false,
        frequency: { startDay: 60, stopDay: 60, repeat: false }
      }
    ]
  }
}

export default function PatientProtocolEditor() {
  const params = useParams()
  const patientId = params.patientId as string
  
  const [patient] = useState<Patient>(mockPatients[patientId] || mockPatients['patient-1'])
  const [protocol, setProtocol] = useState<PatientProtocol>(() => createMockPatientProtocol(patientId))
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [selectedDay, setSelectedDay] = useState<number>(protocol.currentDay)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<PatientProtocolTask | null>(null)
  const [showAdjustmentPanel, setShowAdjustmentPanel] = useState(false)
  const [showFormAssignmentModal, setShowFormAssignmentModal] = useState(false)
  const [formAssignments, setFormAssignments] = useState<FormAssignment[]>([])

  // Get days range for display
  const getDaysRange = () => {
    const days: number[] = []
    for (let i = protocol.timelineStart; i <= protocol.timelineEnd; i++) {
      days.push(i)
    }
    return days
  }

  // Get tasks for a specific day
  const getTasksForDay = (day: number) => {
    return protocol.tasks.filter(task => {
      if (task.frequency.repeat) {
        return day >= task.frequency.startDay && day <= task.frequency.stopDay
      }
      return task.frequency.startDay === day
    })
  }

  // Format day display
  const formatDay = (day: number) => {
    if (day < 0) return `${Math.abs(day)} days before surgery`
    if (day === 0) return 'Surgery Day'
    return `Day ${day}`
  }

  // Get task icon
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Activity className="h-4 w-4" />
      case 'form': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  // Handle task completion
  const handleTaskCompletion = (taskId: string, completed: boolean, painLevel?: number, notes?: string) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
              painLevelReported: painLevel,
              notes: notes || task.notes
            }
          : task
      ),
      lastModified: new Date().toISOString()
    }))
  }

  // Handle task adjustment
  const adjustTask = (taskId: string, adjustments: Partial<PatientProtocolTask>) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, ...adjustments, adjustedFromOriginal: true }
          : task
      ),
      lastModified: new Date().toISOString()
    }))
  }

  // Add new task
  const addTask = (task: Omit<PatientProtocolTask, 'id'>) => {
    const newTask: PatientProtocolTask = {
      ...task,
      id: `task-${Date.now()}`
    }
    setProtocol(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask].sort((a, b) => a.day - b.day),
      lastModified: new Date().toISOString()
    }))
  }

  // Save task from modal
  const handleSaveTask = (taskData: PatientProtocolTask) => {
    if (editingTask) {
      adjustTask(editingTask.id, taskData)
    } else {
      addTask(taskData)
    }
    setShowTaskModal(false)
    setEditingTask(null)
  }

  // Handle form assignments
  const handleFormAssignment = (assignments: any[]) => {
    // Convert form assignments to tasks
    const formTasks = assignments.map(assignment => ({
      id: `form-task-${Date.now()}-${Math.random()}`,
      day: assignment.assigned_for_day,
      type: 'form' as const,
      title: `AI Form Assignment`,
      content: `Complete assigned AI form with intelligent conversation flow.`,
      required: assignment.priority === 'high',
      completed: false,
      frequency: {
        startDay: assignment.assigned_for_day,
        stopDay: assignment.assigned_for_day,
        repeat: false
      },
      formId: assignment.form_id,
      priority: assignment.priority,
      assignmentNotes: assignment.notes
    }))

    // Add form tasks to protocol
    setProtocol(prev => ({
      ...prev,
      tasks: [...prev.tasks, ...formTasks].sort((a, b) => a.day - b.day),
      lastModified: new Date().toISOString()
    }))

    // Store form assignments
    setFormAssignments(prev => [...prev, ...assignments.map(a => ({
      ...a,
      id: `assignment-${Date.now()}-${Math.random()}`,
      patient_id: patientId,
      assigned_by: 'current-provider',
      assigned_at: new Date().toISOString(),
      status: 'assigned' as const
    }))])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.name} - Protocol Editor
                </h1>
                <p className="text-gray-600">
                  {protocol.surgeryType} • Surgery: {new Date(protocol.surgeryDate).toLocaleDateString()} • Day {protocol.currentDay}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showAdjustmentPanel ? 'primary' : 'secondary'}
                onClick={() => setShowAdjustmentPanel(!showAdjustmentPanel)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Adjustment Panel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedDay(protocol.currentDay)
                  setShowFormAssignmentModal(true)
                }}
              >
                <Brain className="h-4 w-4 mr-2" />
                Assign AI Forms
              </Button>
              <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className={showAdjustmentPanel ? 'col-span-8' : 'col-span-12'}>
            {/* Patient Status Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card variant="info">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Current Pain Level</p>
                      <p className="text-2xl font-bold text-blue-700">{patient.currentPainLevel}/10</p>
                    </div>
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="success">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Recovery Progress</p>
                      <p className="text-2xl font-bold text-green-700">{patient.recoveryProgress}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Day</p>
                      <p className="text-2xl font-bold text-gray-900">{protocol.currentDay}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{protocol.tasks.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Mode Toggle */}
            <Card className="mb-6">
              <CardHeader
                title="Timeline View"
                action={
                  <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="h-4 w-4 mr-2 inline" />
                      List View
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'calendar'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2 inline" />
                      Calendar View
                    </button>
                  </div>
                }
              />
            </Card>

            {/* Timeline Content */}
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {getDaysRange().filter(day => getTasksForDay(day).length > 0).map(day => (
                  <Card key={day} className={day === protocol.currentDay ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader
                      title={formatDay(day)}
                      subtitle={`${getTasksForDay(day).length} task${getTasksForDay(day).length !== 1 ? 's' : ''}`}
                      action={
                        <div className="flex items-center gap-2">
                          {day === protocol.currentDay && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Current Day
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDay(day)
                              setShowFormAssignmentModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Assign AI Forms
                          </Button>
                        </div>
                      }
                    />
                    <CardContent>
                      <div className="space-y-3">
                        {getTasksForDay(day).map(task => (
                          <div
                            key={`${task.id}-${day}`}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              task.completed
                                ? 'bg-green-50 border-green-200'
                                : task.adjustedFromOriginal
                                ? 'bg-yellow-50 border-yellow-200'
                                : (task as any).formId
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                task.completed
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {getTaskIcon(task.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                                  {(task as any).formId && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Brain className="h-3 w-3" />
                                      AI Form
                                    </span>
                                  )}
                                  {task.required && (
                                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                      Required
                                    </span>
                                  )}
                                  {task.adjustedFromOriginal && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                      Adjusted
                                    </span>
                                  )}
                                  {(task as any).priority && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      (task as any).priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : (task as any).priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {(task as any).priority} priority
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{task.content}</p>
                                {task.completed && task.painLevelReported && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Pain level reported: {task.painLevelReported}/10
                                  </p>
                                )}
                                {task.notes && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    Note: {task.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.completed ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleTaskCompletion(task.id, false)}
                                  >
                                    Mark Incomplete
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleTaskCompletion(task.id, true)}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(task)
                                  setShowTaskModal(true)
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                    <p className="text-gray-600">Calendar view implementation coming soon</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Adjustment Panel */}
          {showAdjustmentPanel && (
            <div className="col-span-4">
              <Card>
                <CardHeader title="Protocol Adjustments" />
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pain Level Trend</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Last 10 days average:</span>
                        <span className="font-medium">
                          {Math.round(protocol.painLevelTrend.reduce((a, b) => a + b, 0) / protocol.painLevelTrend.length * 10) / 10}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {protocol.painLevelTrend.map((level, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-gray-200 rounded-sm"
                            style={{ height: `${level * 4}px`, minHeight: '4px' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Quick Adjustments</h4>
                    <div className="space-y-2">
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reduce Exercise Intensity
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        <Clock className="h-4 w-4 mr-2" />
                        Extend Recovery Timeline
                      </Button>
                      <Button variant="secondary" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Pain Management Task
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Adjustment History</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span>Reduced exercise frequency (Day 7)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span>No recent adjustments</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
          editingTask={editingTask}
          selectedDay={selectedDay}
        />
      )}

      {/* Form Assignment Modal */}
      {showFormAssignmentModal && (
        <FormAssignmentModal
          isOpen={showFormAssignmentModal}
          onClose={() => setShowFormAssignmentModal(false)}
          onAssign={handleFormAssignment}
          selectedDay={selectedDay}
          patientId={patientId}
          existingAssignments={formAssignments}
        />
      )}
    </div>
  )
}

// Task Modal Component
function TaskModal({ isOpen, onClose, onSave, editingTask, selectedDay }: {
  isOpen: boolean
  onClose: () => void
  onSave: (task: PatientProtocolTask) => void
  editingTask: PatientProtocolTask | null
  selectedDay: number
}) {
  const [task, setTask] = useState<PatientProtocolTask>(
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

  const handleSave = () => {
    if (task.title && task.content) {
      onSave(task)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader
          title={editingTask ? 'Edit Task' : 'Add New Task'}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={task.type}
                onChange={(e) => setTask({ ...task, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="message">Message</option>
                <option value="form">Form</option>
                <option value="exercise">Exercise</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <Input
                type="number"
                value={task.day}
                onChange={(e) => setTask({ ...task, day: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.required}
                  onChange={(e) => setTask({ ...task, required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Required task</span>
              </label>
            </div>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!task.title || !task.content}>
              {editingTask ? 'Update' : 'Add'} Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}