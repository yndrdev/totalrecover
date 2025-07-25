'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  MessageSquare,
  Activity,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  FileText,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Send,
  Paperclip,
  Mic,
  TrendingUp,
  TrendingDown,
  Award
} from 'lucide-react'

// Mock data for patient
const patientData = {
  id: 'patient-123',
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 'sarah.johnson@email.com',
  surgeryDate: '2025-01-15',
  recoveryDay: 7,
  protocol: 'TKA Recovery Protocol',
  status: 'active',
  mobility: 'moderate',
  painLevel: 3,
  phone: '(555) 123-4567',
  emergency_contact: 'John Johnson (555) 987-6543',
  insurance_provider: 'Blue Cross Blue Shield',
  insurance_id: 'BCBS123456',
  date_of_birth: '1985-03-15',
  notes: 'Patient is progressing well, showing good range of motion improvement.'
}

// Mock messages
const messages = [
  {
    id: '1',
    sender_role: 'provider',
    message: 'How are you feeling today? Any changes in pain level?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sender_name: 'Dr. Martinez'
  },
  {
    id: '2',
    sender_role: 'patient',
    message: 'Feeling much better today! Pain is down to about a 3. Completed all my exercises this morning.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    sender_name: 'Sarah Johnson'
  },
  {
    id: '3',
    sender_role: 'provider',
    message: 'Excellent progress! Keep up the great work with the exercises.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sender_name: 'Dr. Martinez'
  }
]

// Mock protocol template
const baseProtocol = [
  {
    id: 1,
    day: 1,
    title: 'Initial Recovery Assessment',
    type: 'assessment',
    description: 'Pain assessment and initial mobility check',
    recurring: 'one_time',
    enabled: true
  },
  {
    id: 2,
    day: 1,
    title: 'Ice Application',
    type: 'treatment',
    description: 'Apply ice for 15-20 minutes every 2-3 hours',
    recurring: 'daily',
    enabled: true
  },
  {
    id: 3,
    day: 3,
    title: 'Basic Range of Motion',
    type: 'exercise',
    description: 'Gentle knee bending exercises - 10 reps, 3 sets',
    recurring: 'daily',
    enabled: true,
    videoUrl: 'https://youtube.com/watch?v=example1'
  },
  {
    id: 4,
    day: 7,
    title: 'Walking Assessment',
    type: 'assessment',
    description: 'Evaluate walking ability and gait',
    recurring: 'weekly',
    enabled: true
  },
  {
    id: 5,
    day: 14,
    title: 'Advanced Exercises',
    type: 'exercise',
    description: 'Progressive strengthening exercises',
    recurring: 'daily',
    enabled: false // Disabled for this patient due to mobility level
  }
]

const formatTime = (date: string | Date) => {
  const d = new Date(date)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes
  return `${displayHours}:${displayMinutes} ${ampm}`
}

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id
  
  const [protocol, setProtocol] = useState(baseProtocol)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newMessage, setNewMessage] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'exercise',
    description: '',
    day: 1,
    recurring: 'daily',
    enabled: true
  })

  const updateTask = (taskId: number, updates: any) => {
    setProtocol(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  const addTask = () => {
    if (newTask.title && newTask.description) {
      const task = {
        ...newTask,
        id: Date.now(),
      }
      setProtocol(prev => [...prev, task])
      setNewTask({
        title: '',
        type: 'exercise',
        description: '',
        day: 1,
        recurring: 'daily',
        enabled: true
      })
      setShowAddTask(false)
    }
  }

  const removeTask = (taskId: number) => {
    setProtocol(prev => prev.filter(task => task.id !== taskId))
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    // Mock message sending
    setNewMessage('')
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'exercise': return 'bg-blue-100 text-blue-800'
      case 'assessment': return 'bg-purple-100 text-purple-800'
      case 'treatment': return 'bg-green-100 text-green-800'
      case 'medication': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecurringLabel = (recurring: string) => {
    switch (recurring) {
      case 'daily': return 'Daily'
      case 'every_other_day': return 'Every Other Day'
      case 'twice_weekly': return 'Twice Weekly'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'one_time': return 'One Time'
      default: return recurring
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/practice')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Practice
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {patientData.first_name?.[0]}{patientData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {patientData.first_name} {patientData.last_name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                      Recovery Day {patientData.recoveryDay}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  alert('Export report functionality coming soon')
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Clean Tab Navigation with Blue Outline Indicators */}
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent border-0 p-0">
              <TabsTrigger
                value="overview"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md border-x-2 border-t-2 -mb-px'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md border-x-2 border-t-2 -mb-px'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="protocol"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'protocol'
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md border-x-2 border-t-2 -mb-px'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Protocol Editor
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md border-x-2 border-t-2 -mb-px'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">{formatDate(patientData.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="text-gray-900">38 years</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{patientData.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{patientData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                        <p className="text-gray-900">{patientData.emergency_contact}</p>
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
                      <p className="text-sm font-medium text-gray-500">Surgery Date</p>
                      <p className="text-gray-900">{formatDate(patientData.surgeryDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Recovery Day</p>
                      <p className="text-gray-900">Day {patientData.recoveryDay}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recovery Protocol</p>
                    <p className="text-gray-900">{patientData.protocol}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Insurance Provider</p>
                        <p className="text-gray-900">{patientData.insurance_provider}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Insurance ID</p>
                        <p className="text-gray-900">{patientData.insurance_id}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Factors Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Patient Factors & Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobility Level</label>
                    <Select defaultValue={patientData.mobility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pain Level (1-10)</label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10" 
                      defaultValue={patientData.painLevel}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <Badge className="bg-green-100 text-green-800">Active Recovery</Badge>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
                  <Textarea 
                    defaultValue={patientData.notes} 
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900">Messages</CardTitle>
                <p className="text-sm text-gray-600">
                  Direct communication with {patientData.first_name}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-6">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 mb-4">
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
                                {patientData.first_name?.[0]}{patientData.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isProvider ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">
                                {message.sender_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div
                              className={`
                                rounded-lg px-3 py-2
                                ${isProvider
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                                }
                              `}
                            >
                              <p className="text-sm">{message.message}</p>
                            </div>
                          </div>
                          {isProvider && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                DR
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protocol Editor Tab */}
          <TabsContent value="protocol" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Recovery Protocol Editor</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Customize tasks based on patient mobility and pain levels
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowAddTask(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Task Modal */}
                {showAddTask && (
                  <Card className="border-blue-200 bg-blue-50 mb-6">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Add New Task</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                          <Input
                            value={newTask.title}
                            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter task title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <Select value={newTask.type} onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exercise">Exercise</SelectItem>
                              <SelectItem value="assessment">Assessment</SelectItem>
                              <SelectItem value="treatment">Treatment</SelectItem>
                              <SelectItem value="medication">Medication</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                          <Input
                            type="number"
                            min="1"
                            value={newTask.day}
                            onChange={(e) => setNewTask(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                          <Select value={newTask.recurring} onValueChange={(value) => setNewTask(prev => ({ ...prev, recurring: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="every_other_day">Every Other Day</SelectItem>
                              <SelectItem value="twice_weekly">Twice Weekly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="one_time">One Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter task description and instructions"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          onClick={addTask} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddTask(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Protocol Tasks */}
                <div className="space-y-4">
                  {protocol.map((task) => (
                    <Card key={task.id} className={`${!task.enabled ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">Day {task.day}</Badge>
                              <Badge className={getTaskTypeColor(task.type)}>{task.type}</Badge>
                              <Badge variant="outline">{getRecurringLabel(task.recurring)}</Badge>
                              {task.videoUrl && (
                                <div className="flex items-center">
                                  <PlayCircle className="h-4 w-4 text-blue-600" />
                                  <span className="sr-only">Has video</span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              {task.enabled ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Enabled
                                </span>
                              ) : (
                                <span className="flex items-center text-gray-500">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Disabled (based on mobility level)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTask(task.id, { enabled: !task.enabled })}
                              className={task.enabled 
                                ? 'text-red-600 border-red-300 hover:bg-red-50' 
                                : 'text-green-600 border-green-300 hover:bg-green-50'
                              }
                            >
                              {task.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => removeTask(task.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <Card className="bg-gray-50 mt-6">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Protocol Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Total Tasks:</span>
                        <span className="ml-2 text-gray-600">{protocol.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Enabled:</span>
                        <span className="ml-2 text-gray-600">{protocol.filter(t => t.enabled).length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Customized for:</span>
                        <span className="ml-2 text-gray-600">Moderate mobility, Pain level {patientData.painLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Exercise Completion
                  </CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="flex items-center text-xs text-gray-600">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+12%</span>
                    <span className="ml-1">from last week</span>
                  </div>
                  <Progress value={85} className="h-2 mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Pain Level
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">3.2</div>
                  <div className="flex items-center text-xs text-gray-600">
                    <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">-1.5</span>
                    <span className="ml-1">from last week</span>
                  </div>
                  <Progress value={32} className="h-2 mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Day Streak
                  </CardTitle>
                  <Award className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <p className="text-xs text-gray-600">
                    Consecutive days completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Overall Compliance
                  </CardTitle>
                  <Target className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">92%</div>
                  <p className="text-xs text-gray-600">
                    Of all scheduled tasks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recovery Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Recovery Milestones</CardTitle>
                <p className="text-sm text-gray-600">
                  Key achievements in the recovery journey
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Full Weight Bearing</p>
                      <p className="text-sm text-gray-600">Achieved on Day 14</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    Completed
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">90° Knee Flexion</p>
                      <p className="text-sm text-gray-600">Currently at 75°</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={83} className="w-20 h-2" />
                    <span className="text-sm font-medium">83%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
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

        </Tabs>
      </main>
    </div>
  )
}