'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserContext } from '@/components/auth/user-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HealthcareLayout } from '@/components/layout/healthcare-layout'
import { 
  ArrowLeft, 
  Building, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Users,
  FileText,
  HardDrive,
  Activity
} from 'lucide-react'
import { saasAdminService } from '@/lib/services/saas-admin-service'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Tenant {
  id: string
  name: string
  tenant_type: 'practice' | 'hospital' | 'clinic'
  subscription_status: 'active' | 'inactive' | 'trial' | 'suspended'
  subscription_tier: string
  created_at: string
  stats?: {
    total_users: number
    total_patients: number
    total_protocols: number
  }
}

export default function TenantManagement() {
  const router = useRouter()
  const { user } = useUserContext()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Form state for new tenant
  const [formData, setFormData] = useState({
    name: '',
    tenant_type: 'practice' as const,
    admin_email: '',
    admin_password: '',
    subscription_tier: 'starter'
  })

  useEffect(() => {
    if (user) {
      loadTenants()
    }
  }, [user, currentPage, statusFilter])

  const loadTenants = async () => {
    try {
      setIsLoading(true)
      const data = await saasAdminService.getTenants({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: statusFilter as any
      })
      
      // Load stats for each tenant
      const tenantsWithStats = await Promise.all(
        data.tenants.map(async (tenant) => {
          try {
            const stats = await saasAdminService.getTenantStats(tenant.id)
            return { ...tenant, stats }
          } catch (error) {
            return tenant
          }
        })
      )
      
      setTenants(tenantsWithStats)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error loading tenants:', error)
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await saasAdminService.createTenant(formData)
      
      toast({
        title: "Success",
        description: "Tenant created successfully",
      })
      
      setShowCreateDialog(false)
      setFormData({
        name: '',
        tenant_type: 'practice',
        admin_email: '',
        admin_password: '',
        subscription_tier: 'starter'
      })
      
      loadTenants()
    } catch (error) {
      console.error('Error creating tenant:', error)
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (tenantId: string, status: 'active' | 'suspended') => {
    try {
      await saasAdminService.updateTenantStatus(tenantId, status)
      
      toast({
        title: "Success",
        description: `Tenant ${status === 'active' ? 'activated' : 'suspended'} successfully`,
      })
      
      loadTenants()
    } catch (error) {
      console.error('Error updating tenant status:', error)
      toast({
        title: "Error",
        description: "Failed to update tenant status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTenantTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥'
      case 'clinic':
        return '🏢'
      default:
        return '🏛️'
    }
  }

  if (isLoading && tenants.length === 0) {
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/saasadmin')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
                <p className="text-gray-600 mt-1">Manage practices, hospitals, and clinics</p>
              </div>
            </div>
            <Button 
              variant="primary"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tenants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setCurrentPage(1)
                          loadTenants()
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentPage(1)
                    loadTenants()
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Tenants ({tenants.length})</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Patients</TableHead>
                      <TableHead>Protocols</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getTenantTypeIcon(tenant.tenant_type)}</span>
                            <div>
                              <p className="font-medium">{tenant.name}</p>
                              <p className="text-sm text-gray-500">{tenant.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{tenant.tenant_type}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(tenant.subscription_status)}>
                            {tenant.subscription_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{tenant.subscription_tier}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            {tenant.stats?.total_users || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-gray-400" />
                            {tenant.stats?.total_patients || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {tenant.stats?.total_protocols || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/saasadmin/tenants/${tenant.id}`)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/saasadmin/tenants/${tenant.id}/edit`)}
                              >
                                Edit Settings
                              </DropdownMenuItem>
                              {tenant.subscription_status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(tenant.id, 'suspended')}
                                  className="text-red-600"
                                >
                                  Suspend Tenant
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(tenant.id, 'active')}
                                  className="text-green-600"
                                >
                                  Activate Tenant
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Tenant Dialog */}
          {showCreateDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-[500px] mx-4">
                <CardHeader>
                  <h3 className="text-xl font-semibold">Create New Tenant</h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTenant}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tenant Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g., City General Hospital"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tenant_type">Type</Label>
                        <Select
                          value={formData.tenant_type}
                          onValueChange={(value) => setFormData({...formData, tenant_type: value as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="practice">Practice</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="admin_email">Admin Email</Label>
                        <Input
                          id="admin_email"
                          type="email"
                          value={formData.admin_email}
                          onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="admin_password">Admin Password</Label>
                        <Input
                          id="admin_password"
                          type="password"
                          value={formData.admin_password}
                          onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subscription_tier">Subscription Tier</Label>
                        <Select
                          value={formData.subscription_tier}
                          onValueChange={(value) => setFormData({...formData, subscription_tier: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button type="button" variant="secondary" onClick={() => {
                        setShowCreateDialog(false)
                        setFormData({
                          name: '',
                          tenant_type: 'practice',
                          admin_email: '',
                          admin_password: '',
                          subscription_tier: 'starter'
                        })
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Create Tenant
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </HealthcareLayout>
    </ProtectedRoute>
  )
}