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
import { Plus, Edit, Trash2, ArrowLeft, Mail, Phone, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { practiceService } from '@/lib/services/practice-service'
import { useToast } from '@/components/ui/use-toast'

interface StaffMember {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  phone?: string
  specialization?: string
  license_number?: string
  is_active: boolean
  created_at: string
  last_sign_in_at?: string
}

export default function StaffManagement() {
  const router = useRouter()
  const { user } = useUserContext()
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'nurse',
    phone: '',
    specialization: '',
    license_number: '',
    password: ''
  })

  useEffect(() => {
    if (user) {
      fetchStaff()
    }
  }, [user])

  const fetchStaff = async () => {
    try {
      setIsLoading(true)
      const data = await practiceService.getStaffMembers()
      setStaff(data)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast({
        title: "Error",
        description: "Failed to fetch staff members",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingStaff) {
        // Update existing staff member
        await practiceService.updateStaffMember(editingStaff.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          phone: formData.phone || undefined,
          specialization: formData.specialization || undefined,
          license_number: formData.license_number || undefined,
        })
        
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })
      } else {
        // Create new staff member
        await practiceService.createStaffMember({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          phone: formData.phone || undefined,
          specialization: formData.specialization || undefined,
          license_number: formData.license_number || undefined,
        })
        
        toast({
          title: "Success",
          description: "Staff member created successfully",
        })
      }

      // Reset form and close dialog
      resetForm()
      setShowAddDialog(false)
      setEditingStaff(null)
      
      // Refresh staff list
      fetchStaff()
    } catch (error) {
      console.error('Error saving staff member:', error)
      toast({
        title: "Error",
        description: "Failed to save staff member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      email: staffMember.email,
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      role: staffMember.role,
      phone: staffMember.phone || '',
      specialization: staffMember.specialization || '',
      license_number: staffMember.license_number || '',
      password: ''
    })
    setShowAddDialog(true)
  }

  const handleToggleActive = async (staffId: string, isActive: boolean) => {
    try {
      await practiceService.toggleStaffStatus(staffId, isActive)
      
      toast({
        title: "Success",
        description: `Staff member ${isActive ? 'deactivated' : 'activated'} successfully`,
      })
      
      fetchStaff()
    } catch (error) {
      console.error('Error toggling staff status:', error)
      toast({
        title: "Error",
        description: "Failed to update staff status",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'nurse',
      phone: '',
      specialization: '',
      license_number: '',
      password: ''
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'surgeon':
        return 'bg-purple-100 text-purple-800'
      case 'nurse':
        return 'bg-blue-100 text-blue-800'
      case 'physical_therapist':
        return 'bg-green-100 text-green-800'
      case 'practice_admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case 'physical_therapist':
        return 'Physical Therapist'
      case 'practice_admin':
        return 'Practice Admin'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="practice_admin">
        <HealthcareLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </HealthcareLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="practice_admin">
      <HealthcareLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/practice')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600 mt-1">Manage your practice staff and permissions</p>
              </div>
            </div>
            <Button 
              variant="primary"
              onClick={() => {
                setEditingStaff(null)
                resetForm()
                setShowAddDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Staff Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Staff</div>
                <div className="text-2xl font-bold">{staff.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {staff.filter(s => s.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Surgeons</div>
                <div className="text-2xl font-bold">
                  {staff.filter(s => s.role === 'surgeon').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Nurses</div>
                <div className="text-2xl font-bold">
                  {staff.filter(s => s.role === 'nurse').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Staff Members</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {formatRole(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {member.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.license_number ? (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              {member.license_number}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.last_sign_in_at ? 
                            new Date(member.last_sign_in_at).toLocaleDateString() :
                            'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={member.is_active ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleToggleActive(member.id, member.is_active)}
                            >
                              {member.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Staff Modal */}
          {showAddDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-[500px] mx-4">
                <CardHeader>
                  <h3 className="text-xl font-semibold">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      {!editingStaff && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="password">Temporary Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              required
                              placeholder="Min 6 characters"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({...formData, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="surgeon">Surgeon</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="physical_therapist">Physical Therapist</SelectItem>
                            <SelectItem value="practice_admin">Practice Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization (Optional)</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                          placeholder="e.g., Orthopedic Surgery"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="license_number">License Number (Optional)</Label>
                        <Input
                          id="license_number"
                          value={formData.license_number}
                          onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button type="button" variant="secondary" onClick={() => {
                        setShowAddDialog(false)
                        setEditingStaff(null)
                        resetForm()
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        {editingStaff ? 'Update' : 'Add'} Staff Member
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