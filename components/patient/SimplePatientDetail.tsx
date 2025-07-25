'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import { WeeklyTimelineView } from '@/components/patient/WeeklyTimelineView'
import { Task } from '@/components/patient/TaskCard'
import { demoPatients, demoProviders } from '@/lib/data/demo-healthcare-data'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare,
  Calendar,
  FileText,
  Activity,
  User,
  Clock,
  ChevronRight,
  BarChart3,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SimplePatientDetailProps {
  patientId: string
}

type TabType = 'timeline' | 'messages' | 'progress' | 'info'

export function SimplePatientDetail({ patientId }: SimplePatientDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<TabType>('timeline')
  const [currentWeek, setCurrentWeek] = React.useState(1)
  
  // Find patient from demo data
  const patient = demoPatients.find(p => p.id === patientId)
  
  // Calculate recovery day
  const surgeryDate = patient ? new Date(patient.surgery_date) : null
  const today = new Date('2025-01-23T00:00:00Z') // Fixed date for consistent rendering
  const recoveryDay = surgeryDate 
    ? Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const isPreOp = recoveryDay < 0

  // Helper function to get task titles
  const getTaskTitle = (type: Task['type'], day: number) => {
    const titles = {
      message: day === -45 ? 'Welcome to TJV Recovery' : `Day ${day} Check-in`,
      form: day === -45 ? 'Initial Health Assessment' : `Day ${day} Progress Form`,
      video: day === -45 ? 'Welcome from Your Care Team' : `Day ${day} Exercise Guide`,
      exercise: `Day ${day} Physical Therapy`,
      education: `Day ${day} Recovery Education`
    }
    return titles[type]
  }

  // Generate mock tasks data
  const generateMockTasks = React.useMemo(() => {
    const tasks: Task[] = []
    const taskTypes: Task['type'][] = ['message', 'form', 'video', 'exercise', 'education']
    
    // Generate specific tasks for first week to match screenshot
    const firstWeekTasks = [
      { day: -45, type: 'message' as Task['type'], title: 'Welcome to TJV Recovery' },
      { day: -45, type: 'form' as Task['type'], title: 'Initial Health Assessment' },
      { day: -45, type: 'video' as Task['type'], title: 'Welcome from Your Care Team' }
    ]
    
    firstWeekTasks.forEach((taskData, i) => {
      tasks.push({
        id: `task-${taskData.day}-${i}`,
        type: taskData.type,
        title: taskData.title,
        status: 'pending',
        day: taskData.day,
        phase: 'enrollment phase'
      })
    })
    
    // Generate tasks for other days with fixed seed to avoid hydration issues
    for (let day = -38; day <= 200; day += 7) { // Skip first week as we already have specific tasks
      const numTasks = (day % 3) + 1 // Use deterministic value instead of Math.random()
      for (let i = 0; i < numTasks; i++) {
        const randomType = taskTypes[(day + i) % taskTypes.length] // Use deterministic selection
        let status: Task['status'] = 'pending'
        
        if (day < recoveryDay) {
          status = (day + i) % 5 !== 0 ? 'completed' : 'missed' // Use deterministic status
        } else if (day === recoveryDay) {
          status = 'in_progress'
        }
        
        tasks.push({
          id: `task-${day}-${i}`,
          type: randomType,
          title: getTaskTitle(randomType, day),
          status,
          day,
          phase: day < -30 ? 'enrollment phase' : day < 0 ? 'pre-op phase' : day < 90 ? 'early recovery' : 'advanced recovery'
        })
      }
    }
    return tasks
  }, [recoveryDay])

  // Calculate week data for timeline
  const totalWeeks = 36
  const calculateWeekData = () => {
    const startDay = -45 + (currentWeek - 1) * 7
    const weekData = []
    
    for (let i = 0; i < 7; i++) {
      const day = startDay + i
      const dayTasks = generateMockTasks.filter(task => task.day === day)
      
      weekData.push({
        day,
        displayDay: day < 0 ? `Pre-Op ${Math.abs(day)}` : `Day ${day}`,
        phase: day < -30 ? 'enrollment phase' : day < 0 ? 'pre-op phase' : day < 90 ? 'early recovery' : 'advanced recovery',
        tasks: dayTasks
      })
    }
    
    return weekData
  }

  const getWeekRange = () => {
    const startDay = -45 + (currentWeek - 1) * 7
    const endDay = startDay + 6
    return `Day ${startDay} to Day ${endDay}`
  }

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1)
    }
  }

  if (!patient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-500">Patient not found</p>
          <Button
            onClick={() => router.push('/provider/patients')}
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Back to Patients
          </Button>
        </div>
      </div>
    )
  }

  // Get provider names
  const getProviderName = (providerId: string) => {
    const provider = demoProviders.find(p => p.id === providerId)
    return provider ? `Dr. ${provider.first_name} ${provider.last_name}` : 'Unassigned'
  }

  const tabs = [
    { id: 'timeline' as TabType, label: 'Recovery Timeline', icon: Calendar },
    { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'info' as TabType, label: 'Patient Information', icon: Info }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recovery Timeline</h2>
                <p className="text-sm text-gray-600">{generateMockTasks.length} tasks configured</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </Button>
                <Button variant="secondary" size="sm">
                  List View
                </Button>
                <Button variant="primary" size="sm">
                  Edit Protocol
                </Button>
              </div>
            </div>

            {/* Weekly Timeline */}
            <WeeklyTimelineView
              weekData={calculateWeekData()}
              currentWeek={currentWeek}
              totalWeeks={totalWeeks}
              weekRange={getWeekRange()}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              onEditTask={(taskId) => console.log('Edit task:', taskId)}
              onDeleteTask={(taskId) => console.log('Delete task:', taskId)}
              onAddTask={(day) => console.log('Add task for day:', day)}
            />
          </div>
        )
      
      case 'messages':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Message history will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'progress':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recovery Status</span>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <RecoveryDayBadge day={recoveryDay} />
                    <StatusBadge 
                      status={isPreOp ? 'pending' : patient.compliance_rate >= 80 ? 'completed' : 'in_progress'} 
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Surgery: {surgeryDate?.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Surgery Details</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{patient.surgery_type}</p>
                  <p className="text-sm text-gray-600 mt-1">{patient.surgery_side} side</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Surgeon: {getProviderName(patient.surgeon_id)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compliance</span>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{patient.compliance_rate}%</p>
                      <p className="text-xs text-gray-600 mt-1">Overall compliance</p>
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${patient.compliance_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'info':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-sm text-gray-600">Name: {patient.first_name} {patient.last_name}</p>
                    <p className="text-sm text-gray-600">MRN: {patient.medical_record_number}</p>
                    <p className="text-sm text-gray-600">Email: {patient.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Medical Information</h3>
                    <p className="text-sm text-gray-600">Surgery: {patient.surgery_type}</p>
                    <p className="text-sm text-gray-600">Side: {patient.surgery_side}</p>
                    <p className="text-sm text-gray-600">Surgeon: {getProviderName(patient.surgeon_id)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/provider/patients')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-sm text-gray-600">Day {recoveryDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  )
}