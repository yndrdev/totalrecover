'use client'

import React, { useState, useEffect } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import { SkeletonTable } from '@/components/ui/design-system/Skeleton'
import { patientService } from '@/lib/services/patient-service'
import { practiceService } from '@/lib/services/practice-service'
import { InvitePatientModal } from './invite-modal'
import {
  Search,
  Filter,
  Calendar,
  Activity,
  Phone,
  Mail,
  ChevronRight,
  MessageCircle,
  ArrowUpDown,
  Loader2,
  UserPlus
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PatientWithInfo {
  id: string
  profile_id: string
  tenant_id: string
  practice_id?: string
  mrn: string
  date_of_birth?: string
  surgery_date?: string
  surgery_type?: string
  surgeon_id?: string
  primary_provider_id?: string
  phone_number?: string
  emergency_contact?: any
  medical_history?: any
  insurance_info?: any
  preferred_language?: string
  status: 'active' | 'inactive' | 'discharged'
  created_at?: string
  updated_at?: string
  practice?: {
    name: string
  }
  profile?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  protocols?: Array<{
    id: string
    protocol_id: string
    surgery_date: string
    surgery_type: string
    status: string
    protocol?: {
      name: string
      description?: string
    }
  }>
  recoveryDay?: number
  isPreOp?: boolean
  surgeryDateFormatted?: string
  currentProtocol?: any
}

interface StaffMember {
  id: string
  email: string
  role: string
  providers?: Array<{
    id: string
    specialty: string
    credentials?: string[]
  }>
}

export default function PatientsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [patients, setPatients] = useState<PatientWithInfo[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'discharged'>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const patientsPerPage = 50

  // Fetch patients from database
  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      console.log('[Provider Page] Fetching patients...');
      const result = await patientService.getPatients({
        page: currentPage,
        limit: patientsPerPage,
        search: searchTerm,
        status: statusFilter
      })
      console.log('[Provider Page] Result:', result);

      // Calculate recovery info for each patient
      const patientsWithInfo = await Promise.all(result.patients.map(async (patient: any) => {
        // Get current protocol
        const currentProtocol = await patientService.getPatientCurrentProtocol(patient.id)
        
        let recoveryDay = 0
        let isPreOp = false
        let surgeryDateFormatted = 'N/A'

        if (currentProtocol && currentProtocol.surgery_date) {
          const surgeryDate = new Date(currentProtocol.surgery_date)
          const today = new Date()
          const diffTime = today.getTime() - surgeryDate.getTime()
          recoveryDay = Math.floor(diffTime / (1000 * 60 * 60 * 24))
          isPreOp = recoveryDay < 0
          surgeryDateFormatted = surgeryDate.toLocaleDateString()
        }

        return {
          ...patient,
          recoveryDay,
          isPreOp,
          surgeryDateFormatted,
          currentProtocol
        }
      }))

      // Debug log to check patient data
      console.log('[Provider Page] First patient data:', patientsWithInfo[0]);
      console.log('[Provider Page] First patient profile:', patientsWithInfo[0]?.profile);
      
      setPatients(patientsWithInfo)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (error: any) {
      console.error('[Provider Page] Error fetching patients:', error)
      console.error('[Provider Page] Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      })
      // TODO: Add proper error notification
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch staff members
  const fetchStaffMembers = async () => {
    try {
      const staff = await practiceService.getStaffMembers()
      setStaffMembers(staff)
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchStaffMembers()
  }, [currentPage, searchTerm, statusFilter])

  // Get pain level for patient (mock data based on recovery day)
  const getPainLevel = (patient: PatientWithInfo) => {
    if (!patient.recoveryDay) return 0
    if (patient.recoveryDay < 0) return 2 // Pre-op
    if (patient.recoveryDay <= 7) return 7 // Early post-op
    if (patient.recoveryDay <= 30) return 4 // Intermediate
    if (patient.recoveryDay <= 90) return 2 // Late recovery
    return 1 // Long-term
  }

  // Get latest message for patient (mock data for now)
  const getLatestMessage = (patient: PatientWithInfo) => {
    const messages = [
      "Having some pain with exercises today, but continuing as prescribed.",
      "Completed all tasks for the day, feeling good!",
      "Question about my medication schedule - can I take it with food?",
      "Made it to physical therapy today, progress is good.",
      "Feeling tired but motivated to continue recovery.",
      "Need to reschedule my next appointment."
    ]
    // Use a more deterministic approach based on patient data
    const name = patient.profile ? `${patient.profile.first_name || ''} ${patient.profile.last_name || ''}`.trim() : patient.mrn || 'Unknown'
    const hash = name.length
    return messages[hash % messages.length]
  }

  // Update patient assignments
  const updatePatientAssignment = async (
    patientId: string, 
    field: string, 
    value: string
  ) => {
    try {
      // TODO: Implement assignment update in patient service
      console.log('Assignment updated')
    } catch (error) {
      console.error('Error updating assignment:', error)
      // TODO: Add proper error notification
    }
  }

  // Get staff by role
  const getStaffByRole = (role: string) => {
    return staffMembers.filter(member => {
      if (role === 'surgeon' && member.providers?.some(p => p.specialty === 'Orthopedic Surgery')) {
        return true
      }
      return member.role === role
    })
  }

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="provider" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-[1280px] mx-auto">
              <div className="space-y-6">
                {/* Page Header Skeleton */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Patients Table Skeleton */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <SkeletonTable rows={8} columns={7} className="p-6" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor your patient roster
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Patient
                </Button>
              </div>

              {/* Patients Table */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Patients ({totalCount})
                  </h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-base border border-gray-300 rounded-md px-3 py-2 bg-white min-h-[44px]"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discharged">Discharged</option>
                    </select>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-base"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider min-w-[200px]">
                            Patient Name
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-24">
                            <div className="flex items-center gap-1">
                              Day
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider w-32">
                            Pain Level
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider min-w-[180px]">
                            Surgeon
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider min-w-[180px]">
                            Nurse
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider min-w-[180px]">
                            Physical Therapist
                          </th>
                          <th className="px-6 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider min-w-[300px]">
                            Latest Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient, index) => {
                          const painLevel = getPainLevel(patient)
                          const painColor = painLevel <= 3 ? 'text-green-600 bg-green-100' :
                                          painLevel <= 6 ? 'text-yellow-600 bg-yellow-100' :
                                          'text-red-600 bg-red-100'
                          
                          return (
                            <tr
                              key={patient.id}
                              className={`hover:bg-blue-50 cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                              onClick={() => router.push(`/provider/patients/${patient.id}`)}
                            >
                              <td className="px-6 py-5">
                                <div className="text-base font-medium text-gray-900 hover:text-blue-600">
                                  {patient.profile && (patient.profile.first_name || patient.profile.last_name) 
                                    ? `${patient.profile.first_name || ''} ${patient.profile.last_name || ''}`.trim()
                                    : 'Unknown Patient'}
                                </div>
                                <div className="text-base text-gray-500 mt-1">
                                  MRN: {patient.mrn}
                                </div>
                                {patient.profile?.email && (
                                  <div className="text-base text-gray-400">
                                    {patient.profile.email}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <span className={`inline-flex px-3 py-2 text-base font-semibold rounded-full ${
                                  patient.isPreOp ? 'bg-blue-100 text-blue-800' : 
                                  patient.recoveryDay === undefined ? 'bg-gray-100 text-gray-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {patient.recoveryDay !== undefined ? patient.recoveryDay : 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <button
                                  className={`inline-flex px-3 py-2 text-base font-semibold rounded-full hover:opacity-80 transition-opacity ${painColor}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle pain level update
                                  }}
                                >
                                  {painLevel}
                                </button>
                              </td>
                              <td className="px-6 py-5">
                                <select
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    updatePatientAssignment(patient.id, 'surgeon', e.target.value)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-base border border-gray-300 rounded-md px-3 py-3 bg-white hover:border-[#006DB1] focus:border-[#006DB1] focus:outline-none focus:ring-1 focus:ring-[#006DB1] min-h-[44px]"
                                  defaultValue=""
                                >
                                  <option value="">Unassigned</option>
                                  {getStaffByRole('surgeon').map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                      Dr. {staff.email}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-5">
                                <select
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    updatePatientAssignment(patient.id, 'nurse', e.target.value)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-base border border-gray-300 rounded-md px-3 py-3 bg-white hover:border-[#006DB1] focus:border-[#006DB1] focus:outline-none focus:ring-1 focus:ring-[#006DB1] min-h-[44px]"
                                  defaultValue=""
                                >
                                  <option value="">Unassigned</option>
                                  {getStaffByRole('nurse').map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                      {staff.email}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-5">
                                <select
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    updatePatientAssignment(patient.id, 'pt', e.target.value)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-base border border-gray-300 rounded-md px-3 py-3 bg-white hover:border-[#006DB1] focus:border-[#006DB1] focus:outline-none focus:ring-1 focus:ring-[#006DB1] min-h-[44px]"
                                  defaultValue=""
                                >
                                  <option value="">Unassigned</option>
                                  {/* PT role not in current schema, using providers for now */}
                                  {getStaffByRole('provider').map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                      {staff.email}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-5">
                                <div className="relative group">
                                  <button
                                    className="text-left text-base hover:text-[#006DB1] flex items-start w-full transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      router.push(`/provider/patients/${patient.id}?tab=messages`)
                                    }}
                                    title={getLatestMessage(patient)}
                                  >
                                    <MessageCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#006DB1' }} />
                                    <span className="line-clamp-2">
                                      {getLatestMessage(patient)}
                                    </span>
                                  </button>
                                  {/* Hover tooltip */}
                                  <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-base rounded-lg py-3 px-4 -top-2 left-0 transform -translate-y-full whitespace-normal max-w-md">
                                    <div className="relative">
                                      {getLatestMessage(patient)}
                                      <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -bottom-1.5 left-6"></div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {patients.length === 0 && !isLoading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No patients found</p>
                      </div>
                    )}
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-base text-gray-500">
                        Showing {(currentPage - 1) * patientsPerPage + 1}-
                        {Math.min(currentPage * patientsPerPage, totalCount)} of {totalCount} patients
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-base text-gray-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Invite Patient Modal */}
      <InvitePatientModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false)
          // Refresh patient list
          fetchPatients()
        }}
      />
    </div>
  )
}