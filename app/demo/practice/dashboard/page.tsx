'use client'

import React from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import { 
  demoPatients, 
  demoProviders,
  generateDemoAnalytics,
  generateRecentActivity
} from '@/lib/data/demo-healthcare-data'
import { 
  Building2,
  Users, 
  Activity, 
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DemoPracticeDashboardPage() {
  const router = useRouter()
  const analytics = generateDemoAnalytics()
  const recentActivity = generateRecentActivity()

  // Calculate practice-level metrics
  const totalRevenue = 2847500 // Mock revenue
  const monthlyGrowth = 12.5
  const avgPatientSatisfaction = 4.6
  const clinicLocations = 3
  const totalStaff = 24
  const surgeonCount = demoProviders.filter(p => p.role === 'surgeon').length
  const nurseCount = demoProviders.filter(p => p.role === 'nurse').length
  const ptCount = demoProviders.filter(p => p.role === 'physical_therapist').length

  const monthlyData = [
    { month: 'Oct', patients: 122, revenue: 1845000, satisfaction: 4.4 },
    { month: 'Nov', patients: 138, revenue: 2070000, satisfaction: 4.5 },
    { month: 'Dec', patients: 125, revenue: 1875000, satisfaction: 4.6 },
    { month: 'Jan', patients: 156, revenue: 2340000, satisfaction: 4.6 }
  ]

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Practice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-8 w-8" />
                  <h1 className="text-3xl font-bold">Orthopedic Excellence Practice</h1>
                </div>
                <p className="text-blue-100">
                  Multi-location orthopedic practice specializing in joint replacement
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <span>{clinicLocations} Locations</span>
                  <span>•</span>
                  <span>{totalStaff} Staff Members</span>
                  <span>•</span>
                  <span>Est. 2018</span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => router.push('/demo/practice/settings')}
                icon={<Settings className="h-4 w-4" />}
              >
                Practice Settings
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${(totalRevenue / 1000000).toFixed(2)}M
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-600">+{monthlyGrowth}% vs last month</p>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {analytics.totalPatients}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-600">+18 this month</p>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Patient Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {avgPatientSatisfaction}/5.0
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.floor(avgPatientSatisfaction)
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Surgery Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">98.5%</p>
                    <p className="text-xs text-gray-500 mt-2">Above industry avg</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {monthlyData.map((month, index) => (
                      <div key={month.month}>
                        <p className="text-sm font-medium text-gray-600">{month.month}</p>
                        <div className="mt-2 relative">
                          <div className="h-32 bg-gray-100 rounded relative overflow-hidden">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded transition-all duration-500"
                              style={{
                                height: `${(month.patients / 200) * 100}%`
                              }}
                            />
                          </div>
                          <p className="text-xs mt-1 font-medium">{month.patients}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Total Surgeries</p>
                      <p className="text-lg font-semibold text-gray-900">541</p>
                      <p className="text-xs text-green-600">+12% YoY</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Avg Recovery Time</p>
                      <p className="text-lg font-semibold text-gray-900">84 days</p>
                      <p className="text-xs text-green-600">-5 days vs avg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Readmission Rate</p>
                      <p className="text-lg font-semibold text-gray-900">2.1%</p>
                      <p className="text-xs text-green-600">Industry best</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Staff Overview</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => router.push('/demo/practice/staff')}
                  >
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Surgeons</p>
                        <p className="text-sm text-gray-600">{surgeonCount} active</p>
                      </div>
                    </div>
                    <StatusIndicator status="success" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Nurses</p>
                        <p className="text-sm text-gray-600">{nurseCount} active</p>
                      </div>
                    </div>
                    <StatusIndicator status="success" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Physical Therapists</p>
                        <p className="text-sm text-gray-600">{ptCount} active</p>
                      </div>
                    </div>
                    <StatusIndicator status="success" />
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">Staff Utilization</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: '78%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">78% capacity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Practice Admin */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Practice Management</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/practice/analytics')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <PieChart className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/practice/billing')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Billing</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/practice/staff')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Users className="h-6 w-6" />
                  <span>Staff</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/practice/reports')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <FileText className="h-6 w-6" />
                  <span>Reports</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/demo/practice/settings')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Settings className="h-6 w-6" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}
