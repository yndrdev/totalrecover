'use client'

import React, { useState, useEffect } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  User,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { patientService } from '@/lib/services/patient-service'
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
  profile?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  recoveryDay?: number
  isPreOp?: boolean
  surgeryDateFormatted?: string
  currentProtocol?: any
}

export default function PracticePatientsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [patients, setPatients] = useState<PatientWithInfo[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'discharged'>('all')
  const patientsPerPage = 50

  // Fetch patients from database
  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const result = await patientService.getPatients({
        page: currentPage,
        limit: patientsPerPage,
        search: searchTerm,
        status: statusFilter
      })

      // Calculate recovery info for each patient
      const patientsWithInfo = await Promise.all(result.patients.map(async (patient: any) => {
        // Get current protocol
        const currentProtocol = await patientService.getPatientCurrentProtocol(patient.id)
        
        let recoveryDay = 0
        let isPreOp = false
        let surgeryDateFormatted = 'N/A'

        if (patient.surgery_date) {
          const surgeryDate = new Date(patient.surgery_date)
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
      console.log('[Practice Page] First patient data:', patientsWithInfo[0]);
      console.log('[Practice Page] First patient profile:', patientsWithInfo[0]?.profile);
      
      setPatients(patientsWithInfo)
      setTotalPages(result.totalPages)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error fetching patients:', error)
      // TODO: Add proper error notification
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [currentPage, searchTerm, statusFilter])

  // Get recovery phase
  const getRecoveryPhase = (patient: PatientWithInfo) => {
    if (!patient.surgery_date) return { phase: 'No Surgery', color: 'bg-gray-100 text-gray-800' }
    
    const day = patient.recoveryDay || 0
    if (day < 0) return { phase: 'Pre-Op', color: 'bg-amber-100 text-amber-800' }
    if (day <= 7) return { phase: 'Early', color: 'bg-red-100 text-red-800' }
    if (day <= 30) return { phase: 'Mid', color: 'bg-yellow-100 text-yellow-800' }
    if (day <= 90) return { phase: 'Late', color: 'bg-green-100 text-green-800' }
    return { phase: 'Completed', color: 'bg-[#C8DBE9] text-[#002238]' }
  }

  // Calculate recovery progress
  const getRecoveryProgress = (patient: PatientWithInfo) => {
    if (!patient.surgery_date || patient.recoveryDay === undefined) return 0
    const day = patient.recoveryDay
    if (day < 0) return 0
    if (day >= 90) return 100
    return Math.round((day / 90) * 100)
  }

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="practice" />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#006DB1' }} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="practice" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Patients</h1>
                <p className="text-sm text-muted-foreground">
                  Manage and monitor your patient roster
                </p>
              </div>
              <Link href="/practice/patients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </Link>
            </div>

            {/* Patient List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Patient Roster ({totalCount})</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white"
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
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {patients.map((patient) => {
                  const phase = getRecoveryPhase(patient)
                  const progress = getRecoveryProgress(patient)
                  
                  return (
                    <Card key={patient.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => router.push(`/practice/patients/${patient.id}`)}>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 flex items-center justify-center" style={{ backgroundColor: '#C8DBE9' }}>
                            <User className="h-6 w-6" style={{ color: '#006DB1' }} />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {patient.profile && (patient.profile.first_name || patient.profile.last_name)
                                  ? `${patient.profile.first_name || ''} ${patient.profile.last_name || ''}`.trim()
                                  : 'Unknown Patient'}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>MRN: {patient.mrn}</span>
                                {patient.surgery_type && (
                                  <>
                                    <span>•</span>
                                    <span>{patient.surgery_type}</span>
                                  </>
                                )}
                                {patient.surgery_date && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Surgery: {patient.surgeryDateFormatted}
                                    </span>
                                  </>
                                )}
                              </div>
                              {patient.profile?.email && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {patient.profile.email}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Surgeon: Not Assigned</span>
                              <span>•</span>
                              <span>Nurse: Not Assigned</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {patient.recoveryDay !== undefined && patient.recoveryDay >= 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Day {patient.recoveryDay}
                                </Badge>
                              )}
                              <Badge className={phase.color}>
                                {phase.phase === 'Completed' ? '✓ Completed' : phase.phase}
                              </Badge>
                              <Badge variant="outline" className={
                                patient.status === 'active' ? 'border-green-500 text-green-700' :
                                patient.status === 'inactive' ? 'border-gray-500 text-gray-700' :
                                'border-[#006DB1] text-[#002238]'
                              }>
                                {patient.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium">Recovery Progress</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all"
                                  style={{ backgroundColor: '#006DB1' }}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{progress}%</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement phone call
                            }}>
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implement email
                            }}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
                
                {patients.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No patients found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * patientsPerPage + 1}-
                    {Math.min(currentPage * patientsPerPage, totalCount)} of {totalCount} patients
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}