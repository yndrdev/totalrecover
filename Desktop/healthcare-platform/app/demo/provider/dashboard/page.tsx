'use client'

import React from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import { 
  demoPatients, 
  generateDemoAlerts, 
  generateDemoAnalytics,
  generateRecentActivity,
  generateDemoMessages
} from '@/lib/data/demo-healthcare-data'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import { 
  Users, 
  Activity, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Bell,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DemoDashboardPage() {
  const { demoUser } = useDemoAuth()
  const router = useRouter()
  const analytics = generateDemoAnalytics()
  const alerts = generateDemoAlerts()
  const recentActivity = generateRecentActivity()

  // Get patients relevant to the current user's role
  const myPatients = demoUser?.role === 'practice_admin' 
    ? demoPatients 
    : demoPatients.filter(p => 
        p.surgeon_id === demoUser?.id || 
        p.primary_nurse_id === demoUser?.id || 
        p.physical_therapist_id === demoUser?.id
      )

  // Calculate days until/since surgery for each patient
  const getPatientsWithSurgeryInfo = () => {
    return myPatients.map(patient => {
      const surgeryDate = new Date(patient.surgery_date)
      const today = new Date()
      const diffTime = surgeryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return {
        ...patient,
        daysToSurgery: diffDays,
        isPreOp: diffDays > 0,
        surgeryDateFormatted: surgeryDate.toLocaleDateString()
      }
    }).sort((a, b) => Math.abs(a.daysToSurgery) - Math.abs(b.daysToSurgery))
  }

  const patientsWithInfo = getPatientsWithSurgeryInfo()
  const upcomingSurgeries = patientsWithInfo.filter(p => p.isPreOp).slice(0, 3)
  const recentSurgeries = patientsWithInfo.filter(p => !p.isPreOp && p.daysToSurgery >= -7).slice(0, 3)

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, Dr. {demoUser?.first_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s an overview of your patients and practice
            </p>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push('/demo/provider/alerts')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 3).map(alert => (
                  <div 
                    key={alert.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/demo/provider/patients/${alert.patient_id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`h-5 w-5 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-500' : 
                        alert.severity === 'medium' ? 'text-orange-500' : 
                        'text-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{alert.patient_name}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalPatients}</p>
                    <p className="text-xs text-green-600 mt-2">+3 this month</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Compliance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.avgCompliance}%</p>
                    <p className="text-xs text-green-600 mt-2">↑ 2% from last week</p>
                  </div>
                  <ClipboardCheck className="h-8 w-8 text-green-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.pendingTasks}</p>
                    <p className="text-xs text-gray-500 mt-2">{analytics.completedTasks} completed</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.patientSatisfaction}</p>
                    <p className="text-xs text-green-600 mt-2">Excellent</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Surgeries */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Surgeries</h2>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSurgeries.length > 0 ? (
                  upcomingSurgeries.map(patient => (
                    <div 
                      key={patient.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/demo/provider/patients/${patient.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {patient.surgery_type} - {patient.surgery_side}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">
                            {Math.abs(patient.daysToSurgery)} days
                          </p>
                          <p className="text-xs text-gray-500">
                            {patient.surgeryDateFormatted}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No upcoming surgeries</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Post-Op Patients */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Post-Op</h2>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentSurgeries.map(patient => (
                  <div 
                    key={patient.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/demo/provider/patients/${patient.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusIndicator 
                            status={patient.pain_level <= 3 ? 'success' : patient.pain_level <= 5 ? 'warning' : 'error'} 
                          />
                          <span className="text-sm text-gray-600">
                            Pain: {patient.pain_level}/10
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Day {Math.abs(patient.daysToSurgery)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {patient.compliance_rate}% compliance
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.slice(0, 4).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.user_name} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => router.push('/demo/provider/audit-logs')}
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/provider/patients/new')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Users className="h-6 w-6" />
                  <span>Add Patient</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/provider/chat-monitor')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <MessageSquare className="h-6 w-6" />
                  <span>Chat Monitor</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/provider/protocols')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <ClipboardCheck className="h-6 w-6" />
                  <span>Protocols</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/provider/analytics')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}
