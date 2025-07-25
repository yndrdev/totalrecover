'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { StatusIndicator, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import { 
  demoPatients, 
  generateDemoMessages, 
  generateDemoAlerts 
} from '@/lib/data/demo-healthcare-data'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import { 
  MessageSquare,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  User,
  Bot,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DemoChatMonitorPage() {
  const { demoUser } = useDemoAuth()
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'urgent' | 'normal'>('all')

  // Get patients with recent chat activity
  const getPatientsWithChatActivity = () => {
    const myPatients = demoUser?.role === 'practice_admin' 
      ? demoPatients 
      : demoPatients.filter(p => 
          p.surgeon_id === demoUser?.id || 
          p.primary_nurse_id === demoUser?.id || 
          p.physical_therapist_id === demoUser?.id
        )

    return myPatients.map(patient => {
      const messages = generateDemoMessages(patient.id)
      const lastMessage = messages[messages.length - 1]
      const unreadCount = Math.floor(Math.random() * 5)
      const hasAlert = Math.random() > 0.7
      
      const surgeryDate = new Date(patient.surgery_date)
      const today = new Date()
      const diffTime = today.getTime() - surgeryDate.getTime()
      const recoveryDay = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      return {
        ...patient,
        recoveryDay,
        messages,
        lastMessage,
        unreadCount,
        hasAlert,
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }
    }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  const patientsWithActivity = getPatientsWithChatActivity()
  
  // Filter patients based on urgency
  const filteredPatients = patientsWithActivity.filter(patient => {
    if (filterUrgency === 'all') return true
    if (filterUrgency === 'urgent') return patient.hasAlert || patient.unreadCount > 2
    return !patient.hasAlert && patient.unreadCount <= 2
  })

  const selectedPatient = selectedPatientId 
    ? filteredPatients.find(p => p.id === selectedPatientId)
    : null

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {/* Patient List */}
          <div className="w-1/3 space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Monitor</h1>
              <p className="text-gray-600 mt-1">Monitor patient conversations in real-time</p>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['all', 'urgent', 'normal'] as const).map(urgency => (
                      <Button
                        key={urgency}
                        variant={filterUrgency === urgency ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterUrgency(urgency)}
                      >
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw className="h-4 w-4" />}
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patient List */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-0 h-full overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedPatientId === patient.id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            {patient.hasAlert && (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                            {patient.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {patient.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <RecoveryDayBadge day={patient.recoveryDay} size="sm" />
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(patient.lastActivity)}
                            </span>
                          </div>
                          {patient.lastMessage && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {patient.lastMessage.sender_type === 'ai' && (
                                <span className="text-blue-600 font-medium">AI: </span>
                              )}
                              {patient.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat View */}
          <div className="flex-1">
            {selectedPatient ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>MRN: {selectedPatient.medical_record_number}</span>
                        <span>•</span>
                        <RecoveryDayBadge day={selectedPatient.recoveryDay} size="sm" />
                        <span>•</span>
                        <span>{selectedPatient.surgery_type}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/demo/provider/patients/${selectedPatient.id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Zap className="h-4 w-4" />}
                      >
                        Intervene
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedPatient.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.sender_type === 'patient' ? '' : 'justify-end'
                        }`}
                      >
                        {message.sender_type === 'patient' && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_type === 'patient'
                              ? 'bg-gray-100 text-gray-900'
                              : message.sender_type === 'ai'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-green-100 text-green-900'
                          }`}
                        >
                          {message.sender_type !== 'patient' && (
                            <p className="text-xs font-medium mb-1">
                              {message.sender_type === 'ai' ? 'AI Assistant' : 'Provider'}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {message.sender_type === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Quick Actions */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      Send Message
                    </Button>
                    <Button variant="ghost" size="sm">
                      Flag for Review
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Full History
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a patient to view their chat</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}
