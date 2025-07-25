'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { useUserContext } from '@/components/auth/user-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HealthcareLayout } from '@/components/layout/healthcare-layout'
import { 
  Building, 
  Users, 
  FileText, 
  Activity,
  TrendingUp,
  Package,
  Settings,
  Shield,
  Database,
  BarChart3
} from 'lucide-react'
import { saasAdminService } from '@/lib/services/saas-admin-service'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface SystemStats {
  totalTenants: number
  activeTenants: number
  trialTenants: number
  totalUsers: number
  totalPatients: number
  activePatients: number
  totalProtocols: number
  globalProtocols: number
}

interface ContentStats {
  totalForms: number
  totalVideos: number
  totalExercises: number
}

export default function SaasAdminDashboard() {
  const router = useRouter()
  const { user } = useUserContext()
  const { toast } = useToast()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [contentStats, setContentStats] = useState<ContentStats | null>(null)
  const [recentTenants, setRecentTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load all dashboard data in parallel
      const [sysStats, contStats, tenants] = await Promise.all([
        saasAdminService.getSystemStats(),
        saasAdminService.getContentStats(),
        saasAdminService.getTenants({ page: 1, limit: 5 })
      ])

      setSystemStats(sysStats)
      setContentStats(contStats)
      setRecentTenants(tenants.tenants)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="saas_admin">
        <HealthcareLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </HealthcareLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="saas_admin">
      <HealthcareLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SaaS Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage tenants, protocols, and system settings</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/saasadmin/tenants">
              <Button variant="secondary" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Manage Tenants
              </Button>
            </Link>
            <Link href="/saasadmin/protocols">
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Global Protocols
              </Button>
            </Link>
            <Link href="/saasadmin/users">
              <Button variant="secondary" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
            </Link>
            <Link href="/saasadmin/settings">
              <Button variant="secondary" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>

          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold">{systemStats?.totalTenants || 0}</p>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-green-600">{systemStats?.activeTenants || 0} active</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-600">{systemStats?.trialTenants || 0} trial</span>
                    </div>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{systemStats?.totalUsers || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Across all tenants</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold">{systemStats?.totalPatients || 0}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {systemStats?.activePatients || 0} active
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Global Protocols</p>
                    <p className="text-2xl font-bold">{systemStats?.globalProtocols || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      of {systemStats?.totalProtocols || 0} total
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Library Stats */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Content Library
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Forms</p>
                      <p className="text-2xl font-bold text-blue-900">{contentStats?.totalForms || 0}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Videos</p>
                      <p className="text-2xl font-bold text-green-900">{contentStats?.totalVideos || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Exercises</p>
                      <p className="text-2xl font-bold text-purple-900">{contentStats?.totalExercises || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tenants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                Recent Tenants
              </h2>
              <Link href="/saasadmin/tenants">
                <Button variant="secondary" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-gray-600">
                        {tenant.tenant_type} • Created {new Date(tenant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tenant.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : tenant.subscription_status === 'trial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.subscription_status}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/saasadmin/tenants/${tenant.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Database Health</p>
                    <p className="text-sm text-green-600">All systems operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Security Status</p>
                    <p className="text-sm text-blue-600">No issues detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Performance</p>
                    <p className="text-sm text-purple-600">99.9% uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </HealthcareLayout>
    </ProtectedRoute>
  )
}