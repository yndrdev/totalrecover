'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  X,
  Save,
  Filter
} from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'on-leave'
  avatar?: string
  specialty?: string
  license?: string
  hireDate: string
  patients: number
  lastLogin?: string
  initials: string
}

const initialStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Martinez',
    role: 'Surgeon',
    department: 'Orthopedic Surgery',
    email: 's.martinez@hospital.com',
    phone: '(555) 123-4567',
    status: 'active',
    specialty: 'Total Joint Replacement',
    license: 'MD12345',
    hireDate: '2019-03-15',
    patients: 45,
    lastLogin: '2024-01-15T08:30:00Z',
    initials: 'SM'
  },
  {
    id: '2',
    name: 'Dr. Jessica Chen',
    role: 'Nurse',
    department: 'Post-Operative Care',
    email: 'j.chen@hospital.com',
    phone: '(555) 234-5678',
    status: 'active',
    specialty: 'Orthopedic Nursing',
    license: 'RN67890',
    hireDate: '2020-08-22',
    patients: 28,
    lastLogin: '2024-01-15T09:15:00Z',
    initials: 'JC'
  },
  {
    id: '3',
    name: 'Dr. Michael Thompson',
    role: 'Physical Therapist',
    department: 'Rehabilitation Services',
    email: 'm.thompson@hospital.com',
    phone: '(555) 345-6789',
    status: 'active',
    specialty: 'Joint Recovery',
    license: 'PT11223',
    hireDate: '2018-01-10',
    patients: 32,
    lastLogin: '2024-01-15T10:00:00Z',
    initials: 'MT'
  },
  {
    id: '4',
    name: 'Dr. Robert Kim',
    role: 'Practice Admin',
    department: 'Administration',
    email: 'r.kim@hospital.com',
    phone: '(555) 456-7890',
    status: 'active',
    hireDate: '2017-05-20',
    patients: 0,
    lastLogin: '2024-01-15T07:45:00Z',
    initials: 'RK'
  },
  {
    id: '5',
    name: 'Lisa Rodriguez',
    role: 'Nurse',
    department: 'Pre-Operative Care',
    email: 'l.rodriguez@hospital.com',
    phone: '(555) 567-8901',
    status: 'on-leave',
    specialty: 'Pre-Op Assessment',
    license: 'RN78901',
    hireDate: '2021-11-08',
    patients: 0,
    initials: 'LR'
  }
]

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaff)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  const departments = Array.from(new Set(staffMembers.map(s => s.department)))
  const roles = Array.from(new Set(staffMembers.map(s => s.role)))
  const statuses = ['active', 'inactive', 'on-leave']

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Surgeon': return 'bg-blue-100 text-blue-800'
      case 'Nurse': return 'bg-purple-100 text-purple-800'
      case 'Physical Therapist': return 'bg-green-100 text-green-800'
      case 'Practice Admin': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your healthcare team and track staff information
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Staff Member
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card variant="default" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
                    <p className="text-sm text-gray-600">Total Staff</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="default" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <StatusIndicator status="success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {staffMembers.filter(s => s.status === 'active').length}
                    </p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="default" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {staffMembers.reduce((sum, s) => sum + s.patients, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="default" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Filter className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                    <p className="text-sm text-gray-600">Departments</p>
                  </div>
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
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search staff members..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  {filteredStaff.length} staff members
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <Card key={staff.id} variant="default" interactive>
                <CardContent className="p-6">
                  {/* Staff Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{staff.initials}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-sm text-gray-600">{staff.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingStaff(staff)
                          setShowAddModal(true)
                        }}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setStaffMembers(staffMembers.filter(s => s.id !== staff.id))
                        }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Role Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                      {staff.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staff.role)}`}>
                      {staff.role}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Hired {new Date(staff.hireDate).toLocaleDateString()}
                      </span>
                    </div>
                    {staff.lastLogin && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Last login {new Date(staff.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      {staff.patients > 0 && (
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{staff.patients}</p>
                          <p className="text-xs text-gray-500">Active Patients</p>
                        </div>
                      )}
                      {staff.specialty && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Specialty</p>
                          <p className="text-xs text-gray-600">{staff.specialty}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Staff Modal */}
          {showAddModal && (
            <StaffModal
              staff={editingStaff}
              onClose={() => {
                setShowAddModal(false)
                setEditingStaff(null)
              }}
              onSave={(staffData) => {
                if (!staffData.name || !staffData.email) return
                
                const newStaff: StaffMember = {
                  id: editingStaff?.id || Date.now().toString(),
                  name: staffData.name,
                  role: staffData.role || 'Staff',
                  department: staffData.department || 'General',
                  email: staffData.email,
                  phone: staffData.phone || '',
                  status: staffData.status || 'active',
                  specialty: staffData.specialty,
                  license: staffData.license,
                  hireDate: staffData.hireDate || new Date().toISOString().split('T')[0],
                  patients: staffData.patients || 0,
                  initials: staffData.name.split(' ').map(n => n[0]).join('').toUpperCase()
                }

                if (editingStaff) {
                  setStaffMembers(staffMembers.map(s => s.id === editingStaff.id ? newStaff : s))
                } else {
                  setStaffMembers([...staffMembers, newStaff])
                }
                
                setShowAddModal(false)
                setEditingStaff(null)
              }}
            />
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

// Staff Add/Edit Modal
function StaffModal({ staff, onClose, onSave }: {
  staff: StaffMember | null
  onClose: () => void
  onSave: (staff: Partial<StaffMember>) => void
}) {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || 'Staff',
    department: staff?.department || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    status: staff?.status || 'active' as const,
    specialty: staff?.specialty || '',
    license: staff?.license || '',
    hireDate: staff?.hireDate || new Date().toISOString().split('T')[0],
    patients: staff?.patients || 0
  })

  const handleSave = () => {
    if (formData.name && formData.email) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader
          title={staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Surgeon">Surgeon</option>
                <option value="Nurse">Nurse</option>
                <option value="Physical Therapist">Physical Therapist</option>
                <option value="Practice Admin">Practice Admin</option>
                <option value="Medical Assistant">Medical Assistant</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Orthopedic Surgery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@hospital.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <Input
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Total Joint Replacement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number
              </label>
              <Input
                value={formData.license}
                onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                placeholder="MD12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hire Date
              </label>
              <Input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Patients
              </label>
              <Input
                type="number"
                value={formData.patients}
                onChange={(e) => setFormData({ ...formData, patients: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {staff ? 'Update' : 'Add'} Staff Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}