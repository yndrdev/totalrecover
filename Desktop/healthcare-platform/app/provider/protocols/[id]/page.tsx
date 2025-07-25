'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Copy, Archive, Users, Clock, Calendar, Loader2 } from 'lucide-react'
import { protocolService } from '@/lib/services/protocol-service'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'

interface Task {
  id: string
  name: string
  description: string
  category: 'exercise' | 'assessment' | 'medication' | 'education'
  day: number
  duration_minutes: number
  required: boolean
  instructions: string
}

interface Protocol {
  id: string
  name: string
  description: string | null
  duration_days: number | null
  surgery_types: string[] | null
  phases: any[] | null
  is_active: boolean
  is_draft: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  tasks?: Task[]
  patients_assigned?: number
  version?: string
}

export default function ProtocolDetail() {
  const router = useRouter()
  const params = useParams()
  const protocolId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [protocolTasks, setProtocolTasks] = useState<Task[]>([])

  useEffect(() => {
    fetchProtocolData()
  }, [protocolId])

  const fetchProtocolData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch protocol details
      const protocolData = await protocolService.getProtocolById(protocolId)
      if (!protocolData) {
        setError('Protocol not found')
        return
      }
      
      setProtocol(protocolData)

      // Fetch protocol tasks
      const tasks = await protocolService.getProtocolTasks(protocolId)
      const formattedTasks: Task[] = tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        category: task.type as Task['category'],
        day: task.day || 1,
        duration_minutes: task.duration_minutes || 15,
        required: task.is_required || false,
        instructions: task.instructions || ''
      }))
      setProtocolTasks(formattedTasks)
    } catch (err) {
      console.error('Error fetching protocol:', err)
      setError('Failed to load protocol details')
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demo - remove this
  const mockProtocol: Protocol = {
    id: protocolId,
    name: 'Total Knee Replacement Recovery',
    description: 'Comprehensive recovery protocol for patients undergoing total knee replacement surgery.',
    duration_days: 14,
    surgery_types: ['total_knee'],
    phases: [],
    is_active: true,
    is_draft: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    created_by: null,
    patients_assigned: 12
  }

  const mockTasks: Task[] = [
      {
        id: '1',
        name: 'Ankle Pumps',
        description: 'Move your foot up and down at the ankle joint',
        category: 'exercise',
        day: 1,
        duration_minutes: 10,
        required: true,
        instructions: 'Perform 10-15 repetitions every hour while awake'
      },
      {
        id: '2',
        name: 'Pain Assessment',
        description: 'Rate your pain level from 0-10',
        category: 'assessment',
        day: 1,
        duration_minutes: 5,
        required: true,
        instructions: 'Record pain level before and after exercises'
      },
      {
        id: '3',
        name: 'Medication Reminder',
        description: 'Take prescribed pain medication',
        category: 'medication',
        day: 1,
        duration_minutes: 5,
        required: true,
        instructions: 'Follow the medication schedule provided by your surgeon'
      },
      {
        id: '4',
        name: 'Quad Sets',
        description: 'Tighten thigh muscles while leg is straight',
        category: 'exercise',
        day: 2,
        duration_minutes: 15,
        required: true,
        instructions: 'Hold for 5 seconds, repeat 10 times, 3 sets per day'
      },
      {
        id: '5',
        name: 'Walking Practice',
        description: 'Short distance walking with assistance',
        category: 'exercise',
        day: 3,
        duration_minutes: 20,
        required: true,
        instructions: 'Start with 50 feet, gradually increase distance'
      }
    ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exercise': return 'bg-blue-100 text-blue-800'
      case 'assessment': return 'bg-green-100 text-green-800'
      case 'medication': return 'bg-purple-100 text-purple-800'
      case 'education': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'challenging': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupTasksByDay = () => {
    const grouped: { [key: number]: Task[] } = {}
    const tasks = protocolTasks.length > 0 ? protocolTasks : mockTasks
    tasks.forEach(task => {
      if (!grouped[task.day]) {
        grouped[task.day] = []
      }
      grouped[task.day].push(task)
    })
    return grouped
  }

  const handleDuplicate = async () => {
    if (!protocol) return
    
    try {
      const duplicated = await protocolService.duplicateProtocol(protocolId)
      if (duplicated) {
        router.push(`/provider/protocols/${duplicated.id}/edit`)
      }
    } catch (err) {
      console.error('Error duplicating protocol:', err)
    }
  }

  const handleArchive = async () => {
    if (!protocol) return
    
    try {
      await protocolService.updateProtocol(protocolId, {
        is_active: false
      })
      router.push('/provider/protocols')
    } catch (err) {
      console.error('Error archiving protocol:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="provider" userName="Practice Staff" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading protocol details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !protocol) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="provider" userName="Practice Staff" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Protocol not found'}</p>
            <Button
              onClick={() => router.push('/provider/protocols')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Protocols
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Use mock data if no real data available for demo
  const displayProtocol = protocol || mockProtocol
  const displayTasks = protocolTasks.length > 0 ? protocolTasks : mockTasks

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" userName="Practice Staff" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-[#F5F8FA] text-[#002238]"
              onClick={() => router.push('/provider/protocols')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Protocols
            </Button>
            <h1 className="text-2xl font-bold text-[#002238]">{displayProtocol.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleDuplicate}
              className="border-[#006DB1] text-[#006DB1] hover:bg-[#006DB1] hover:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/provider/protocols/${protocolId}/edit`)}
              className="border-[#006DB1] text-[#006DB1] hover:bg-[#006DB1] hover:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleArchive}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        {/* Protocol Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#002238]">Protocol Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{displayProtocol.description || 'No description provided'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Surgery Type</p>
                  <p className="text-[#002238] capitalize">
                    {displayProtocol.surgery_types?.join(', ') || 'General'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Difficulty Level</p>
                  <Badge className={displayProtocol.is_draft ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                    {displayProtocol.is_draft ? 'Draft' : 'Active'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <div className="flex items-center text-[#002238]">
                    <Calendar className="h-4 w-4 mr-1" />
                    {displayProtocol.duration_days || 90} days
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <div className="flex items-center text-[#002238]">
                    <Clock className="h-4 w-4 mr-1" />
                    {displayTasks.length} tasks
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#002238]">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patients Assigned</p>
                  <div className="flex items-center text-[#002238]">
                    <Users className="h-4 w-4 mr-1" />
                    {displayProtocol.patients_assigned || 0}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-[#002238]">
                    {new Date(displayProtocol.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-[#002238]">
                    {new Date(displayProtocol.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Day */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#002238]">Protocol Tasks</h2>
          
          {Object.entries(groupTasksByDay())
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, tasks]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-[#002238]">Day {day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-[#002238]">{task.name}</h4>
                              <Badge className={getCategoryColor(task.category)}>
                                {task.category}
                              </Badge>
                              {task.required && (
                                <Badge variant="secondary">Required</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <p className="text-gray-500 text-sm">{task.instructions}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.duration_minutes} min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}