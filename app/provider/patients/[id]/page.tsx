'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUserContext } from '@/components/auth/user-provider'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
  Shield,
  CreditCard,
  Settings,
  Edit3,
  Plus,
  Trash2,
  Video,
  MessageSquare,
  ClipboardList,
  MoreVertical,
  X,
  Library,
  GripVertical,
  Repeat,
  Eye,
  Download
} from 'lucide-react'

// Simple date formatting helpers
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const formatTime = (date: string | Date) => {
  const d = new Date(date)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes
  return `${displayHours}:${displayMinutes} ${ampm}`
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  surgery_date: string | null
  date_of_birth: string | null
  phone: string | null
  emergency_contact: string | null
  insurance_provider: string | null
  insurance_id: string | null
  protocol_id: string | null
  status: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
  recovery_protocols?: {
    name: string
    duration_days: number
  }
}

interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
}

interface CompletedForm {
  id: string
  form_id: string
  form_name: string
  patient_id: string
  completed_at: string
  completion_time_minutes: number
  responses: Record<string, string>
  status: 'completed' | 'partial' | 'reviewed'
  assigned_by: string
  category: string
  confidence_score?: number
  form_fields: Array<{
    id: string
    label: string
    type: string
    value: string
  }>
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

interface ProtocolTask {
  id: string
  task_id: string
  day_offset: number
  status: string
  completed_at: string | null
  type?: 'message' | 'video' | 'form' | 'exercise' | 'assessment' | 'medication' | 'education'
  tasks: {
    name: string
    description: string
    category: string
    duration_minutes: number
  }
  content?: string
  required?: boolean
  is_recurring?: boolean
  recurring_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDay: number
  }
  form_template_id?: string
}

interface ChatMessage {
  id: string
  sender_id: string
  sender_role: string
  message: string
  timestamp: string
  attachments?: string[]
  profiles?: {
    first_name: string
    last_name: string
  }
}

function PatientDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = params.id as string
  const supabase = createClient()
  const { user } = useUserContext()
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState('messages')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [protocolTasks, setProtocolTasks] = useState<ProtocolTask[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null)
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([])
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([])
  
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

  // Calculate recovery day
  const calculateRecoveryDay = () => {
    if (!patient?.surgery_date) return 0
    const surgery = new Date(patient.surgery_date)
    const today = new Date()
    return Math.floor((today.getTime() - surgery.getTime()) / (1000 * 60 * 60 * 24))
  }

  const loadFormTemplates = async () => {
    // Mock form templates from AI-powered forms system
    setFormTemplates([
      { id: 'form-1', name: 'Pre-Operative Assessment Form', description: 'Comprehensive pre-surgery evaluation', category: 'assessment' },
      { id: 'form-2', name: 'Daily Pain Assessment', description: 'AI-converted pain tracking form', category: 'daily' },
      { id: 'form-3', name: 'Physical Therapy Progress Evaluation', description: 'Smart form that adjusts difficulty based on patient mobility', category: 'progress' },
      { id: 'form-4', name: 'ROM Measurement Form', description: 'Range of motion tracking', category: 'measurement' },
      { id: 'form-5', name: 'Medication Compliance Tracker', description: 'Track medication adherence', category: 'medication' }
    ])
  }

  const getTaskIcon = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.value === type)
    return taskType ? <taskType.icon className="h-4 w-4" /> : null
  }

  const getTaskColor = (type: string) => {
    const taskType = TASK_TYPES.find(t => t.value === type)
    return taskType ? taskType.color : 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    if (patientId) {
      // Check URL parameters for tab selection
      const tabParam = searchParams.get('tab')
      if (tabParam && ['messages', 'timeline', 'progress', 'info', 'forms'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
      
      // Load form templates
      loadFormTemplates()
      
      // For now, use mock data to avoid authentication issues
      setIsLoading(false)
      setPatient({
        id: patientId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        surgery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        date_of_birth: '1985-03-15',
        phone: '(555) 123-4567',
        emergency_contact: 'John Johnson (555) 987-6543',
        insurance_provider: 'Blue Cross Blue Shield',
        insurance_id: 'BCBS123456',
        protocol_id: '1',
        status: 'active',
        profiles: {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@email.com'
        },
        recovery_protocols: {
          name: 'Total Knee Replacement Recovery',
          duration_days: 180
        }
      })
      
      // Mock messages
      setMessages([
        {
          id: '1',
          sender_id: '1',
          sender_role: 'provider',
          message: 'Sorry :( send you as soon as possible.',
          timestamp: new Date().toISOString(),
          profiles: {
            first_name: 'Nickola',
            last_name: 'Peever'
          }
        },
        {
          id: '2',
          sender_id: '2',
          sender_role: 'patient',
          message: 'I know how important this file is to you. You can trust me ;) I know how important this file is to you. You can trust me ;) know how important this file is to you. You can trust me ;)',
          timestamp: new Date().toISOString(),
          profiles: {
            first_name: 'Sarah',
            last_name: 'Johnson'
          }
        },
        {
          id: '3',
          sender_id: '2',
          sender_role: 'patient',
          message: 'I know how important this file is to you. You can trust me ;) me ;)',
          timestamp: new Date().toISOString(),
          attachments: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
          profiles: {
            first_name: 'Sarah',
            last_name: 'Johnson'
          }
        }
      ])
      
      // Mock protocol tasks
      const tasks = []
      for (let i = -45; i <= 135; i++) {
        tasks.push({
          id: `task-${i}`,
          task_id: `task-${i}`,
          day_offset: i,
          status: i < 5 ? 'completed' : 'pending',
          completed_at: i < 5 ? new Date().toISOString() : null,
          tasks: {
            name: i < 0 ? 'Pre-Surgery Preparation' : 'Recovery Exercise',
            description: 'Daily recovery task',
            category: 'exercise',
            duration_minutes: 30
          }
        })
       }
       setProtocolTasks(tasks)
       
       // Mock completed forms data
       setCompletedForms([
         {
           id: 'cf-1',
           form_id: '2',
           form_name: 'Daily Pain Assessment',
           patient_id: patientId,
           completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
           completion_time_minutes: 3,
           responses: {
             pain_level: '4',
             pain_location: 'Surgical site'
           },
           status: 'completed',
           assigned_by: 'Dr. Sarah Martinez',
           category: 'daily',
           confidence_score: 0.98,
           form_fields: [
             { id: 'pain_level', label: 'Pain Level (0-10)', type: 'number', value: '4' },
             { id: 'pain_location', label: 'Pain Location', type: 'select', value: 'Surgical site' }
           ]
         },
         {
           id: 'cf-2',
           form_id: '1',
           form_name: 'Pre-Operative Assessment Form',
           patient_id: patientId,
           completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
           completion_time_minutes: 8,
           responses: {
             medical_history: 'Previous knee surgery in 2018, no complications',
             current_medications: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
             allergies: 'Penicillin - causes rash'
           },
           status: 'reviewed',
           assigned_by: 'Dr. Sarah Martinez',
           category: 'assessment',
           confidence_score: 0.94,
           form_fields: [
             { id: 'medical_history', label: 'Medical History', type: 'textarea', value: 'Previous knee surgery in 2018, no complications' },
             { id: 'current_medications', label: 'Current Medications', type: 'textarea', value: 'Lisinopril 10mg daily, Metformin 500mg twice daily' },
             { id: 'allergies', label: 'Known Allergies', type: 'textarea', value: 'Penicillin - causes rash' }
           ]
         },
         {
           id: 'cf-3',
           form_id: '3',
           form_name: 'Physical Therapy Progress Evaluation',
           patient_id: patientId,
           completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
           completion_time_minutes: 5,
           responses: {
             range_of_motion: '75',
             exercise_difficulty: 'Just Right'
           },
           status: 'completed',
           assigned_by: 'Physical Therapist',
           category: 'progress',
           form_fields: [
             { id: 'range_of_motion', label: 'Range of Motion (degrees)', type: 'number', value: '75' },
             { id: 'exercise_difficulty', label: 'Exercise Difficulty Level', type: 'select', value: 'Just Right' }
           ]
         }
       ])
     }
   }, [patientId, searchParams])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    // Add message to local state for demo
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender_id: user?.id || '1',
      sender_role: 'provider',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      profiles: {
        first_name: 'Dr. Sarah',
        last_name: 'Martinez'
      }
    }
    
    setMessages([...messages, newMsg])
    setNewMessage('')
  }

  const groupTasksByDay = () => {
    const grouped: { [key: number]: ProtocolTask[] } = {}
    protocolTasks.forEach(task => {
      if (!grouped[task.day_offset]) {
        grouped[task.day_offset] = []
      }
      grouped[task.day_offset].push(task)
    })
    return grouped
  }

  const getWeekDays = (week: number) => {
    const startDay = (week - 1) * 7 - 45
    const endDay = startDay + 6
    return Array.from({ length: 7 }, (_, i) => startDay + i)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006DB1]" />
      </div>
    )
  }

  const recoveryDay = calculateRecoveryDay()
  const totalWeeks = patient?.recovery_protocols?.duration_days 
    ? Math.ceil((patient.recovery_protocols.duration_days + 45) / 7) 
    : 36

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-gray-600 hover:text-gray-900"
              onClick={() => router.push('/provider/patients')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                  {patient?.profiles?.first_name?.[0]}{patient?.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {patient?.profiles?.first_name} {patient?.profiles?.last_name}
                </h1>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm">
                  Recovery Day {recoveryDay}
                </Badge>
              </div>
            </div>
            <Button className="bg-[#006DB1] hover:bg-blue-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Clean Tab Navigation with Blue Outline Active Indicators */}
          <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 mb-8">
            <TabsTrigger
              value="messages"
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === 'messages'
                  ? 'border-[#006DB1] text-[#006DB1] bg-[#006DB1]/5 rounded-t-md border-x-2 border-t-2 -mb-px'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === 'timeline'
                  ? 'border-[#006DB1] text-[#006DB1] bg-[#006DB1]/5 rounded-t-md border-x-2 border-t-2 -mb-px'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Recovery Timeline
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === 'progress'
                  ? 'border-[#006DB1] text-[#006DB1] bg-[#006DB1]/5 rounded-t-md border-x-2 border-t-2 -mb-px'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-[#006DB1] text-[#006DB1] bg-[#006DB1]/5 rounded-t-md border-x-2 border-t-2 -mb-px'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Patient Info
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className={`px-4 py-3 font-medium border-b-2 ${
                activeTab === 'forms'
                  ? 'border-[#006DB1] text-[#006DB1] bg-[#006DB1]/5 rounded-t-md border-x-2 border-t-2 -mb-px'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Completed Forms
            </TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Messages</CardTitle>
                <p className="text-sm text-gray-600">
                  Direct communication with {patient?.profiles?.first_name}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <div className="flex-1 p-6">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isProvider = message.sender_role !== 'patient'
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isProvider ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isProvider && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {message.profiles?.first_name?.[0]}{message.profiles?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[70%] ${isProvider ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {message.profiles?.first_name} {message.profiles?.last_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`
                                  rounded-lg px-4 py-2
                                  ${isProvider
                                    ? 'bg-[#006DB1] text-white'
                                    : 'bg-gray-100 text-gray-900'
                                  }
                                `}
                              >
                                <p className="text-sm">{message.message}</p>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 flex gap-2">
                                    {message.attachments.map((url, idx) => (
                                      <div key={idx} className="w-12 h-12 bg-gray-200 rounded" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {isProvider && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[#006DB1] text-white text-xs">
                                  DR
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-6 border-t bg-gray-50">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#006DB1] hover:bg-blue-700 text-white"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recovery Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Recovery Timeline</CardTitle>
                    <p className="text-sm text-gray-600">
                      {protocolTasks.length} tasks configured for {patient?.recovery_protocols?.name}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`${
                        isEditMode
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-[#006DB1] hover:bg-blue-700'
                      } text-white`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Save Changes' : 'Edit Protocol'}
                    </Button>
                    {isEditMode && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('calendar')}
                        className={`${viewMode === 'calendar'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Calendar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`${viewMode === 'list'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="h-4 w-4 mr-1" />
                        List
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                    disabled={currentWeek === 1}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">Week {currentWeek} of {totalWeeks}</h3>
                    <p className="text-sm text-gray-600">
                      Day {(currentWeek - 1) * 7 - 45} to Day {currentWeek * 7 - 39}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                    disabled={currentWeek === totalWeeks}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-7 gap-3">
                  {getWeekDays(currentWeek).map((day, index) => {
                    const dayTasks = groupTasksByDay()[day] || []
                    const isToday = day === recoveryDay
                    const isPast = day < recoveryDay
                    const phase = day < 0 ? 'Pre-Op' : 'Post-Op'
                    
                    return (
                      <Card
                        key={day}
                        className={`
                          min-h-[180px] p-3 cursor-pointer transition-all
                          ${isToday ? 'ring-2 ring-[#006DB1] border-[#006DB1]' : ''}
                          ${isPast && !isEditMode ? 'bg-gray-50' : 'bg-white hover:shadow-md'}
                          ${isEditMode ? 'hover:border-[#006DB1]' : ''}
                        `}
                        onClick={() => {
                          if (isEditMode) {
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
                            setShowTaskModal(true)
                          }
                        }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="mb-2">
                            <Badge
                              variant={day < 0 ? 'secondary' : 'default'}
                              className={`text-xs ${
                                day < 0
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {phase} {Math.abs(day)}
                            </Badge>
                            <p className="text-sm font-medium mt-1 text-gray-900">Day {day}</p>
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            {dayTasks.length > 0 ? (
                              <>
                                {dayTasks.slice(0, isEditMode ? 3 : 2).map(task => (
                                  <div
                                    key={task.id}
                                    className={`
                                      text-xs rounded px-2 py-1 relative group
                                      ${isEditMode
                                        ? 'bg-gray-100 hover:bg-gray-200 border hover:border-[#006DB1]'
                                        : 'bg-gray-100 text-gray-700'
                                      }
                                    `}
                                    onClick={(e) => {
                                      if (isEditMode) {
                                        e.stopPropagation()
                                        setEditingTask(task)
                                        setSelectedDay(day)
                                        setTaskForm({
                                          name: task.tasks.name,
                                          description: task.tasks.description,
                                          type: task.type || 'exercise',
                                          duration_minutes: task.tasks.duration_minutes || 30,
                                          required: task.required || true,
                                          content: task.content || {},
                                          is_recurring: task.is_recurring || false,
                                          recurring_pattern: task.recurring_pattern,
                                          form_template_id: task.form_template_id
                                        })
                                        setShowTaskModal(true)
                                      }
                                    }}
                                  >
                                    <div className="pr-6">{task.tasks.name}</div>
                                    {isEditMode && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-1 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (confirm('Delete this task?')) {
                                            setProtocolTasks(protocolTasks.filter(t => t.id !== task.id))
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {isEditMode && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-6 border border-dashed border-[#006DB1] text-[#006DB1] hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
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
                                      setShowTaskModal(true)
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">
                                No tasks
                              </div>
                            )}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-[#006DB1] font-medium">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                          
                          {isPast && dayTasks.length > 0 && (
                            <div className="mt-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          {isToday && (
                            <div className="mt-2">
                              <Circle className="h-5 w-5 text-[#006DB1] fill-[#006DB1]" />
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Exercise Completion
                  </CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="flex items-center text-xs mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+12%</span>
                    <span className="ml-1 text-gray-500">from last week</span>
                  </div>
                  <Progress value={85} className="h-2 mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pain Level
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">3.2</div>
                  <div className="flex items-center text-xs mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">-1.5</span>
                    <span className="ml-1 text-gray-500">from last week</span>
                  </div>
                  <Progress value={32} className="h-2 mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Day Streak
                  </CardTitle>
                  <Award className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Consecutive days completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Overall Compliance
                  </CardTitle>
                  <Target className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">92%</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Of all scheduled tasks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recovery Milestones</CardTitle>
                <p className="text-sm text-gray-600">
                  Key achievements in the recovery journey
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Full Weight Bearing</p>
                      <p className="text-sm text-gray-600">Achieved on Day 14</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    Completed
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">90° Knee Flexion</p>
                      <p className="text-sm text-gray-600">Currently at 75°</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={83} className="w-20 h-2" />
                    <span className="text-sm font-medium text-gray-900">83%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Walk Without Assistance</p>
                      <p className="text-sm text-gray-600">Target: Day 30</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-600">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Information Tab */}
          <TabsContent value="info">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <User className="h-5 w-5 text-gray-400" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {patient?.date_of_birth 
                          ? formatDate(patient.date_of_birth)
                          : 'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">38 years</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{patient?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{patient?.profiles?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Emergency Contact</p>
                        <p className="font-medium text-gray-900">{patient?.emergency_contact}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Activity className="h-5 w-5 text-gray-400" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Surgery Date</p>
                      <p className="font-medium text-gray-900">
                        {patient?.surgery_date 
                          ? formatDate(patient.surgery_date)
                          : 'Not scheduled'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recovery Day</p>
                      <p className="font-medium text-gray-900">Day {recoveryDay}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-gray-600">Recovery Protocol</p>
                    <p className="font-medium text-gray-900">{patient?.recovery_protocols?.name}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Insurance Provider</p>
                        <p className="font-medium text-gray-900">{patient?.insurance_provider}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Insurance ID</p>
                        <p className="font-medium text-gray-900">{patient?.insurance_id}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Care Team Forms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Care Team Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Pre-Surgery Assessment</span>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Insurance Verification</span>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="font-medium text-gray-900">Consent Forms</span>
                    </div>
                    <Badge className="bg-amber-500 text-white">
                      Pending
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Forms Tab */}
          <TabsContent value="forms">
            <div className="space-y-6">
              {/* Forms Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Forms</p>
                        <p className="text-2xl font-bold text-gray-900">{completedForms.length}</p>
                      </div>
                      <ClipboardList className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Completed Today</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {completedForms.filter(f =>
                            new Date(f.completed_at).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg. Completion Time</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(completedForms.reduce((acc, f) => acc + f.completion_time_minutes, 0) / completedForms.length || 0)}m
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Completed Forms List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="h-5 w-5 text-gray-400" />
                    Completed Forms
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Forms completed by {patient?.profiles?.first_name} {patient?.profiles?.last_name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedForms.map((form) => (
                      <div
                        key={form.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{form.form_name}</h3>
                              <Badge
                                className={`text-xs ${
                                  form.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : form.status === 'reviewed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {form.status === 'completed' ? 'Completed' :
                                 form.status === 'reviewed' ? 'Reviewed' : 'Partial'}
                              </Badge>
                              {form.confidence_score && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(form.confidence_score * 100)}% confidence
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Completed:</span> {formatDate(form.completed_at)} at {formatTime(form.completed_at)}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {form.completion_time_minutes} minutes
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Assigned by:</span> {form.assigned_by}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Category:</span> {form.category}
                              </div>
                            </div>

                            {/* Form Responses */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900 mb-2">Patient Responses</h4>
                              <div className="space-y-2">
                                {form.form_fields.map((field) => (
                                  <div key={field.id} className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-700 flex-shrink-0 mr-4">
                                      {field.label}:
                                    </span>
                                    <span className="text-sm text-gray-900 text-right">
                                      {field.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-300 hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {completedForms.length === 0 && (
                      <div className="text-center py-8">
                        <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No completed forms</h3>
                        <p className="text-gray-600">
                          Forms completed by this patient will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Comprehensive Task Modal with Form Assignment */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure the task details and settings for Day {selectedDay}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTaskModal(false)
                  setEditingTask(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Task Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name
                  </label>
                  <Input
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                    placeholder="e.g., Daily Check-in"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({...taskForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006DB1] focus:border-transparent"
                  >
                    {TASK_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Brief description of the task"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006DB1] focus:border-transparent"
                />
              </div>
              
              {/* Type-specific content */}
              {taskForm.type === 'message' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={taskForm.content.message || ''}
                    onChange={(e) => setTaskForm({
                      ...taskForm,
                      content: { ...taskForm.content, message: e.target.value }
                    })}
                    placeholder="Enter the message to send to the patient"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006DB1] focus:border-transparent"
                  />
                </div>
              )}
              
              {taskForm.type === 'form' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Template
                  </label>
                  <select
                    value={taskForm.form_template_id || ''}
                    onChange={(e) => setTaskForm({...taskForm, form_template_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006DB1] focus:border-transparent"
                  >
                    <option value="">Select a form template</option>
                    {formTemplates.map(form => (
                      <option key={form.id} value={form.id}>
                        {form.name} - {form.description}
                      </option>
                    ))}
                  </select>
                  {taskForm.form_template_id && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {formTemplates.find(f => f.id === taskForm.form_template_id)?.name}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        This form will be converted to an interactive chat experience for the patient
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {(taskForm.type === 'exercise' || taskForm.type === 'video') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={taskForm.duration_minutes}
                    onChange={(e) => setTaskForm({...taskForm, duration_minutes: parseInt(e.target.value) || 0})}
                    min="5"
                    max="120"
                    className="w-32"
                  />
                </div>
              )}
              
              {/* Recurring settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-gray-700">
                      Recurring Task
                    </label>
                    <p className="text-sm text-gray-600">
                      Repeat this task on multiple days
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={taskForm.is_recurring}
                    onChange={(e) => setTaskForm({
                      ...taskForm,
                      is_recurring: e.target.checked,
                      recurring_pattern: e.target.checked ? {
                        frequency: 'daily',
                        interval: 1,
                        endDay: (selectedDay || 0) + 7
                      } : undefined
                    })}
                    className="h-4 w-4 text-[#006DB1] focus:ring-[#006DB1] border-gray-300 rounded"
                  />
                </div>
                
                {taskForm.is_recurring && taskForm.recurring_pattern && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency
                        </label>
                        <select
                          value={taskForm.recurring_pattern.frequency}
                          onChange={(e) => setTaskForm({
                            ...taskForm,
                            recurring_pattern: {
                              ...taskForm.recurring_pattern!,
                              frequency: e.target.value as any
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006DB1] focus:border-transparent"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Repeat every
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={taskForm.recurring_pattern.interval}
                            onChange={(e) => setTaskForm({
                              ...taskForm,
                              recurring_pattern: {
                                ...taskForm.recurring_pattern!,
                                interval: parseInt(e.target.value) || 1
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End on day
                      </label>
                      <Input
                        type="number"
                        value={taskForm.recurring_pattern.endDay}
                        onChange={(e) => setTaskForm({
                          ...taskForm,
                          recurring_pattern: {
                            ...taskForm.recurring_pattern!,
                            endDay: parseInt(e.target.value) || 0
                          }
                        })}
                        min={(selectedDay || 0) + 1}
                        max="200"
                        className="w-32"
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
                  className="h-4 w-4 text-[#006DB1] focus:ring-[#006DB1] border-gray-300 rounded"
                />
                <label htmlFor="task-required" className="text-sm font-medium text-gray-700">
                  Required task
                </label>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTaskModal(false)
                  setEditingTask(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#006DB1] hover:bg-blue-700 text-white"
                onClick={() => {
                  // Create or update task logic would go here
                  console.log('Task data:', taskForm)
                  setShowTaskModal(false)
                  setEditingTask(null)
                }}
                disabled={!taskForm.name.trim()}
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PatientDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006DB1] mx-auto mb-4" />
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    }>
      <PatientDetailContent />
    </Suspense>
  )
}