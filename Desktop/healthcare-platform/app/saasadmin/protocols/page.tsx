'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/input'
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
  Plus, 
  Search, 
  Filter,
  FileText,
  Star,
  Building,
  TrendingUp,
  Globe,
  Lock,
  Eye
} from 'lucide-react'
import { saasAdminService } from '@/lib/services/saas-admin-service'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface GlobalProtocol {
  id: string
  title: string
  description: string
  surgery_type: string
  is_template: boolean
  is_public: boolean
  usage_count: number
  rating: number
  created_at: string
  tenant?: { name: string }
  creator?: { full_name: string }
}

export default function SaasAdminProtocols() {
  const router = useRouter()
  const { user } = useUserContext()
  const { toast } = useToast()
  const [protocols, setProtocols] = useState<GlobalProtocol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [surgeryTypeFilter, setSurgeryTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user) {
      loadProtocols()
    }
  }, [user, currentPage, surgeryTypeFilter])

  const loadProtocols = async () => {
    try {
      setIsLoading(true)
      const data = await saasAdminService.getGlobalProtocols({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        surgeryType: surgeryTypeFilter
      })
      
      setProtocols(data.protocols)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error loading protocols:', error)
      toast({
        title: "Error",
        description: "Failed to load protocols",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSurgeryTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'TKR': 'bg-blue-100 text-blue-800',
      'THR': 'bg-green-100 text-green-800',
      'ACL': 'bg-purple-100 text-purple-800',
      'Shoulder': 'bg-orange-100 text-orange-800',
      'Spine': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors['General']
  }

  const renderRating = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      )
    }
    return <div className="flex gap-0.5">{stars}</div>
  }

  if (isLoading && protocols.length === 0) {
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
                <h1 className="text-3xl font-bold text-gray-900">Global Protocol Library</h1>
                <p className="text-gray-600 mt-1">Manage system-wide protocol templates</p>
              </div>
            </div>
            <Button 
              variant="primary"
              onClick={() => router.push('/saasadmin/protocols/builder')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Protocol
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Protocols</p>
                    <p className="text-2xl font-bold">{protocols.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Public Templates</p>
                    <p className="text-2xl font-bold">
                      {protocols.filter(p => p.is_public).length}
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Usage</p>
                    <p className="text-2xl font-bold">
                      {protocols.reduce((sum, p) => sum + p.usage_count, 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {protocols.length > 0 
                        ? (protocols.reduce((sum, p) => sum + p.rating, 0) / protocols.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search protocols..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setCurrentPage(1)
                          loadProtocols()
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={surgeryTypeFilter} onValueChange={setSurgeryTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surgery Types</SelectItem>
                    <SelectItem value="TKR">Total Knee Replacement</SelectItem>
                    <SelectItem value="THR">Total Hip Replacement</SelectItem>
                    <SelectItem value="ACL">ACL Reconstruction</SelectItem>
                    <SelectItem value="Shoulder">Shoulder Surgery</SelectItem>
                    <SelectItem value="Spine">Spine Surgery</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCurrentPage(1)
                    loadProtocols()
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Protocols Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Protocol Templates</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Surgery Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {protocols.map((protocol) => (
                      <TableRow key={protocol.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{protocol.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {protocol.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSurgeryTypeColor(protocol.surgery_type)}>
                            {protocol.surgery_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm">{protocol.tenant?.name || 'System'}</p>
                              <p className="text-xs text-gray-500">{protocol.creator?.full_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {protocol.is_public ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            {protocol.usage_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderRating(protocol.rating)}
                        </TableCell>
                        <TableCell>
                          {new Date(protocol.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/saasadmin/protocols/${protocol.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/saasadmin/protocols/builder?id=${protocol.id}`)}
                            >
                              Edit
                            </Button>
                          </div>
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
        </div>
      </HealthcareLayout>
    </ProtectedRoute>
  )
}