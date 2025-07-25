'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { HealthcareLayout } from '@/components/layout/healthcare-layout'
import { Users, Activity, Calendar, Clock, MessageSquare, BarChart3, User } from 'lucide-react'
import { demoPatients, generateDemoAnalytics } from '@/lib/data/demo-healthcare-data'

interface Patient {
  id: string
  tenant_id: string
  user_id: string
  first_name: string
  last_name: string
  surgery_date: string | null
  status: string
  protocol_id: string | null
  surgeon_id: string | null
  primary_nurse_id: string | null
  physical_therapist_id: string | null
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
  surgeon?: {
    first_name: string
    last_name: string
  }
  nurse?: {
    first_name: string
    last_name: string
  }
  pt?: {
    first_name: string
    last_name: string
  }
  recovery_protocols?: {
    name: string
  }
  _count?: {
    patient_tasks: number
  }
}

interface Protocol {
  id: string
  name: string
  description: string
  surgery_type: string
  duration_days: number
  is_active: boolean
}

interface Provider {
  id: string
  first_name: string
  last_name: string
  role: string
}

interface RecentActivity {
  id: string
  description: string
  user_name: string
  user_role: string
  timestamp: string
  action_type: string
}

export default function ProviderDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState(generateDemoAnalytics())

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setAnalytics(generateDemoAnalytics())
      setIsLoading(false)
    }, 800)
  }, [])


  if (isLoading) {
    return (
      <HealthcareLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </HealthcareLayout>
    )
  }

  return (
    <HealthcareLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your practice overview</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="primary"
              onClick={() => router.push('/provider/patients')}
            >
              <Users className="h-4 w-4 mr-2" />
              View Patients
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Recovery</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{analytics.activePatients}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pre-Surgery</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{analytics.preSurgery}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Compliance</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{analytics.avgCompliance}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/provider/patients')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Patient Management</h3>
                  <p className="text-sm text-gray-600 mt-1">View and manage all patients</p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/provider/chat-monitor')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Chat Monitor</h3>
                  <p className="text-sm text-gray-600 mt-1">Monitor patient conversations</p>
                </div>
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/provider/protocols')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Protocols</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage recovery protocols</p>
                </div>
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoPatients.slice(0, 5).map((patient) => {
                const surgeryDate = new Date(patient.surgery_date)
                const today = new Date('2025-01-23T00:00:00Z')
                const recoveryDay = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/provider/patients/${patient.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {patient.surgery_type} • Day {recoveryDay}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.compliance_rate}% compliance
                      </div>
                      <div className="text-xs text-gray-500">
                        Last active {new Date(patient.last_activity || patient.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </HealthcareLayout>
  )
}
