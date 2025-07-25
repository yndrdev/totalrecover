'use client'

import React, { useState } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusBadge } from '@/components/ui/design-system/StatusIndicator'
import {
  Plus,
  Search,
  Copy,
  Edit,
  Eye,
  MoreVertical,
  FileText,
  Clock,
  Users,
  CheckCircle,
  Activity,
  Star,
  StarOff
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DemoProtocol {
  id: string
  name: string
  description: string
  version: string
  surgery_types: string[]
  duration_days: number
  active_patients: number
  completion_rate: number
  created_at: string
  updated_at: string
  created_by: string
  status: 'active' | 'draft' | 'archived'
  is_standard_practice: boolean
}

const demoProtocols: DemoProtocol[] = [
  {
    id: 'protocol-1',
    name: 'TJV Standard Recovery Protocol',
    description: 'Comprehensive recovery protocol for total joint replacement surgeries',
    version: '2.3',
    surgery_types: ['TKA', 'THA'],
    duration_days: 180,
    active_patients: 156,
    completion_rate: 89,
    created_at: '2024-01-15',
    updated_at: '2024-12-20',
    created_by: 'Dr. Sarah Martinez',
    status: 'active',
    is_standard_practice: true
  },
  {
    id: 'protocol-2',
    name: 'Accelerated Recovery Protocol',
    description: 'Fast-track recovery protocol for younger, healthier patients',
    version: '1.5',
    surgery_types: ['TKA', 'THA'],
    duration_days: 120,
    active_patients: 43,
    completion_rate: 92,
    created_at: '2024-06-10',
    updated_at: '2025-01-05',
    created_by: 'Dr. Sarah Martinez',
    status: 'active',
    is_standard_practice: false
  },
  {
    id: 'protocol-3',
    name: 'Complex Case Protocol',
    description: 'Extended protocol for patients with comorbidities or complications',
    version: '1.2',
    surgery_types: ['TKA', 'THA', 'TSA'],
    duration_days: 240,
    active_patients: 28,
    completion_rate: 85,
    created_at: '2024-03-22',
    updated_at: '2024-11-15',
    created_by: 'Dr. Robert Kim',
    status: 'active',
    is_standard_practice: false
  },
  {
    id: 'protocol-4',
    name: 'Shoulder Recovery Protocol',
    description: 'Specialized protocol for total shoulder arthroplasty patients',
    version: '3.0',
    surgery_types: ['TSA'],
    duration_days: 150,
    active_patients: 12,
    completion_rate: 87,
    created_at: '2023-11-05',
    updated_at: '2024-10-30',
    created_by: 'Dr. Sarah Martinez',
    status: 'active',
    is_standard_practice: true
  },
  {
    id: 'protocol-5',
    name: 'Bilateral Joint Protocol (Draft)',
    description: 'Protocol for patients undergoing bilateral joint replacement',
    version: '0.8',
    surgery_types: ['TKA', 'THA'],
    duration_days: 200,
    active_patients: 0,
    completion_rate: 0,
    created_at: '2025-01-10',
    updated_at: '2025-01-18',
    created_by: 'Dr. Michael Thompson',
    status: 'draft',
    is_standard_practice: false
  }
]

export default function ProtocolsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [protocols, setProtocols] = useState<DemoProtocol[]>(demoProtocols)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const toggleStandardPractice = async (protocolId: string) => {
    setIsUpdating(protocolId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setProtocols(prev => prev.map(protocol =>
      protocol.id === protocolId
        ? { ...protocol, is_standard_practice: !protocol.is_standard_practice }
        : protocol
    ))
    
    setIsUpdating(null)
  }

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch =
      protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === 'all' || protocol.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusVariant = (status: string): 'completed' | 'pending' | 'in_progress' => {
    switch (status) {
      case 'active': return 'completed'
      case 'draft': return 'pending'
      case 'archived': return 'in_progress'
      default: return 'pending'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Recovery Protocols</h1>
                  <p className="text-gray-600 mt-1">
                    Manage and customize patient recovery protocols
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/provider/protocols/builder')}
                    icon={<Edit className="h-4 w-4" />}
                  >
                    Protocol Builder
                  </Button>
                  <Button
                    onClick={() => router.push('/provider/protocols/new')}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Protocol
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Protocols</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {protocols.filter(p => p.status === 'active').length}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Standard Practice</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {protocols.filter(p => p.is_standard_practice).length}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {protocols.reduce((sum, p) => sum + p.active_patients, 0)}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Completion</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            protocols
                              .filter(p => p.completion_rate > 0)
                              .reduce((sum, p) => sum + p.completion_rate, 0) /
                            protocols.filter(p => p.completion_rate > 0).length
                          )}%
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search protocols..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      {(['all', 'active', 'draft', 'archived'] as const).map(status => (
                        <Button
                          key={status}
                          variant={filterStatus === status ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setFilterStatus(status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Protocols List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProtocols.map(protocol => (
                  <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {protocol.name}
                            </h3>
                            <StatusBadge
                              status={getStatusVariant(protocol.status)}
                              size="sm"
                            />
                            {protocol.is_standard_practice && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Star className="h-3 w-3" />
                                Standard Practice
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Version {protocol.version} • {protocol.duration_days} days
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MoreVertical className="h-4 w-4" />}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">
                        {protocol.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Surgery Types</span>
                          <div className="flex gap-1">
                            {protocol.surgery_types.map(type => (
                              <span
                                key={type}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Active Patients</span>
                          <span className="font-medium text-gray-900">
                            {protocol.active_patients}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium text-gray-900">
                            {protocol.completion_rate}%
                          </span>
                        </div>

                        <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                          <span>Created by {protocol.created_by}</span>
                          <span>Updated {new Date(protocol.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => router.push(`/provider/protocols/${protocol.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            icon={<Copy className="h-4 w-4" />}
                          >
                            Duplicate
                          </Button>
                        </div>
                        <Button
                          variant={protocol.is_standard_practice ? "primary" : "secondary"}
                          size="sm"
                          fullWidth
                          icon={protocol.is_standard_practice ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                          onClick={() => toggleStandardPractice(protocol.id)}
                          disabled={isUpdating === protocol.id}
                          className={protocol.is_standard_practice
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "border-amber-300 text-amber-600 hover:bg-amber-50"
                          }
                        >
                          {isUpdating === protocol.id
                            ? 'Updating...'
                            : protocol.is_standard_practice
                              ? 'Standard Practice'
                              : 'Mark as Standard Practice'
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}