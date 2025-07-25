'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  MessageSquare,
  Activity,
  CheckCircle,
  Settings,
  Phone,
  Save,
  Play,
  Pause,
  RefreshCw,
  Plus,
  FileText,
  Zap
} from 'lucide-react'
import { patientService } from '@/lib/services/patient-service'
import { protocolService } from '@/lib/services/protocol-service'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const { toast } = useToast()
  
  const [patient, setPatient] = useState<any>(null)
  const [protocols, setProtocols] = useState<any[]>([])
  const [assignedProtocols, setAssignedProtocols] = useState<any[]>([])
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [showProtocolDialog, setShowProtocolDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [alert, setAlert] = useState<any>(null)
  const [showModificationPanel, setShowModificationPanel] = useState(false)
  const [selectedModification, setSelectedModification] = useState('')
  const [customMessage, setCustomMessage] = useState("I've reduced the intensity for you")
  const [isMonitoring, setIsMonitoring] = useState(true)

  // Load patient data
  useEffect(() => {
    loadPatientData()
    loadProtocols()
    loadAssignedProtocols()
  }, [patientId])

  const loadPatientData = async () => {
    try {
      const data = await patientService.getPatientById(patientId)
      setPatient(data)
    } catch (error) {
      console.error('Error loading patient:', error)
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProtocols = async () => {
    try {
      const data = await protocolService.getProtocols()
      setProtocols(data)
    } catch (error) {
      console.error('Error loading protocols:', error)
    }
  }

  const loadAssignedProtocols = async () => {
    try {
      const response = await fetch(`/api/protocols/sync?patientId=${patientId}`)
      const data = await response.json()
      if (data.success) {
        setAssignedProtocols(data.assignments || [])
      }
    } catch (error) {
      console.error('Error loading assigned protocols:', error)
    }
  }

  const assignProtocol = async () => {
    if (!selectedProtocolId) {
      toast({
        title: "Error",
        description: "Please select a protocol",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch('/api/protocols/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: selectedProtocolId,
          patientId: patientId,
          startDate: patient?.surgery_date
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Protocol assigned successfully! ${data.tasksCreated} tasks created.`,
        })
        setShowProtocolDialog(false)
        setSelectedProtocolId('')
        loadAssignedProtocols()
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to assign protocol',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error assigning protocol:', error)
      toast({
        title: "Error",
        description: "Failed to assign protocol",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  // Handle exercise modification
  const applyModification = () => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'nurse',
      content: customMessage,
      timestamp: new Date(),
      type: 'intervention'
    }
    
    const botResponse = {
      id: messages.length + 2,
      sender: 'bot',
      content: `Here's your updated exercise:\n▶️ ${selectedModification}`,
      timestamp: new Date(Date.now() + 1000),
      type: 'exercise_update'
    }
    
    setMessages(prev => [...prev, newMessage, botResponse])
    setAlert(null)
    setShowModificationPanel(false)
  }

  const calculateRecoveryDay = () => {
    if (!patient?.surgery_date) return 0
    const surgeryDate = new Date(patient.surgery_date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - surgeryDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Patient not found</p>
          <Link href="/provider/patients">
            <Button className="mt-4">Back to Patients</Button>
          </Link>
        </div>
      </div>
    )
  }

  const recoveryDay = calculateRecoveryDay()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/provider/patients">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patients
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {patient.first_name} {patient.last_name} - Day {recoveryDay} {patient.surgery_type || 'Recovery'}
                </h1>
                <p className="text-sm text-gray-600">Real-time patient monitoring and intervention</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Healthcare Platform</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Surgery Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Surgery Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <span>{patient.surgery_type || 'N/A'}</span>
              </div>
              <div className="text-sm text-gray-600">
                {patient.surgery_date ? new Date(patient.surgery_date).toLocaleDateString() : 'Not scheduled'}
              </div>
              <div className="text-sm text-gray-600">{patient.surgeon || 'Not assigned'}</div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                Day {recoveryDay}/84
              </div>
              <div className="text-sm">{Math.round((recoveryDay / 84) * 100)}% Complete</div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-green-600">Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Protocols */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Protocols</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assignedProtocols.length > 0 ? (
                assignedProtocols.map((assignment) => (
                  <div key={assignment.assignmentId} className="text-sm">
                    <div className="font-medium">{assignment.protocol?.title}</div>
                    <div className="text-gray-600">
                      {assignment.completedTasks}/{assignment.totalTasks} tasks ({assignment.progressPercentage}%)
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">No protocols assigned</div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Protocol
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Protocol to Patient</DialogTitle>
                    <DialogDescription>
                      Select a protocol to assign to {patient.first_name} {patient.last_name}. This will generate all tasks based on the protocol template.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            {protocol.title} - {protocol.surgery_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowProtocolDialog(false)
                          setSelectedProtocolId('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={assignProtocol}
                        disabled={!selectedProtocolId || isAssigning}
                      >
                        {isAssigning ? 'Assigning...' : 'Assign Protocol'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Link href={`/provider/patients/${patientId}/protocol-editor`}>
                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Protocols
                </Button>
              </Link>
              
              <Button size="sm" variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alert Section */}
        {alert && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    🚨 PATIENT NEEDS HELP - IMMEDIATE ACTION REQUIRED
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm"><span className="font-medium">⚠️ {alert.title}</span></div>
                    <div className="text-sm">{alert.description}</div>
                    <div className="text-sm">Current Exercise: {alert.currentExercise}</div>
                    <div className="text-sm">Pain Level: {alert.painLevel}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowModificationPanel(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    🔧 Modify Exercise
                  </Button>
                  <Button variant="outline">
                    💬 Send Message
                  </Button>
                  <Button variant="outline">
                    📞 Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Modification Panel */}
        {showModificationPanel && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                🔧 MODIFY EXERCISE - KNEE FLEXION STANDARD
              </h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  Current: 5 reps, 5 sec hold, 2 sets
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Fixes:</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      className={`p-4 rounded-lg border text-left ${
                        selectedModification === 'Knee Flexion - Reduced (3 reps)' 
                          ? 'bg-green-100 border-green-300' 
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => setSelectedModification('Knee Flexion - Reduced (3 reps)')}
                    >
                      <div className="font-medium text-green-700">🟢 Reduce Intensity</div>
                      <div className="text-sm text-gray-600">3 reps</div>
                      {selectedModification === 'Knee Flexion - Reduced (3 reps)' && (
                        <div className="text-sm text-green-600 mt-1">✓ Selected</div>
                      )}
                    </button>
                    
                    <button
                      className={`p-4 rounded-lg border text-left ${
                        selectedModification === 'Knee Flexion - Gentle (Seated)' 
                          ? 'bg-yellow-100 border-yellow-300' 
                          : 'bg-white border-gray-200 hover:border-yellow-300'
                      }`}
                      onClick={() => setSelectedModification('Knee Flexion - Gentle (Seated)')}
                    >
                      <div className="font-medium text-yellow-700">🟡 Gentle Version</div>
                      <div className="text-sm text-gray-600">Seated</div>
                      {selectedModification === 'Knee Flexion - Gentle (Seated)' && (
                        <div className="text-sm text-yellow-600 mt-1">✓ Selected</div>
                      )}
                    </button>
                    
                    <button
                      className={`p-4 rounded-lg border text-left ${
                        selectedModification === 'Ankle Pumps (Alternative)' 
                          ? 'bg-blue-100 border-blue-300' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedModification('Ankle Pumps (Alternative)')}
                    >
                      <div className="font-medium text-blue-700">🔵 Replace Exercise</div>
                      <div className="text-sm text-gray-600">Ankle Pumps</div>
                      {selectedModification === 'Ankle Pumps (Alternative)' && (
                        <div className="text-sm text-blue-600 mt-1">✓ Selected</div>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message to Patient:</label>
                  <Input 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Message to send to patient"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={applyModification}
                    disabled={!selectedModification}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    💾 Apply Changes & Send to Patient
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModificationPanel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Chat Monitor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>💬 LIVE CHAT MONITOR</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={isMonitoring ? "default" : "outline"}>
                  {isMonitoring ? 'Monitoring' : 'Paused'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMonitoring(!isMonitoring)}
                >
                  {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      message.sender === 'bot' ? 'bg-blue-500' :
                      message.sender === 'patient' ? 'bg-green-500' :
                      message.sender === 'nurse' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}>
                      {message.sender === 'bot' ? '🤖' :
                       message.sender === 'patient' ? '👤' :
                       message.sender === 'nurse' ? '👩‍⚕️' : 'ℹ️'}
                    </div>
                    <div className="flex-1">
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                        message.sender === 'patient' ? 'bg-gray-100 text-gray-900' :
                        message.sender === 'nurse' ? 'bg-purple-100 text-purple-900' :
                        message.sender === 'system' ? 'bg-yellow-100 text-yellow-900' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No chat messages yet</p>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t flex space-x-3">
              <Button size="sm" variant="outline">
                📝 Add Task
              </Button>
              <Button size="sm" variant="outline">
                📋 Modify Plan
              </Button>
              <Button size="sm" variant="outline">
                💬 Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}