'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusBadge, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import { demoPatients, demoProviders } from '@/lib/data/demo-healthcare-data'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import {
  Search,
  Filter,
  UserPlus,
  Calendar,
  Activity,
  Phone,
  Mail,
  MoreVertical,
  ChevronRight,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DemoPatientsPage() {
  const { demoUser } = useDemoAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pre-op' | 'post-op' | 'discharged'>('all')

  // Get patients relevant to the current user's role
  const myPatients = demoUser?.role === 'practice_admin' 
    ? demoPatients 
    : demoPatients.filter(p => 
        p.surgeon_id === demoUser?.id || 
        p.primary_nurse_id === demoUser?.id || 
        p.physical_therapist_id === demoUser?.id
      )

  // Calculate recovery day for each patient
  const getPatientsWithRecoveryInfo = () => {
    return myPatients.map(patient => {
      const surgeryDate = new Date(patient.surgery_date)
      const today = new Date()
      const diffTime = today.getTime() - surgeryDate.getTime()
      const recoveryDay = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      return {
        ...patient,
        recoveryDay,
        isPreOp: recoveryDay < 0,
        surgeryDateFormatted: surgeryDate.toLocaleDateString()
      }
    })
  }

  const patientsWithInfo = getPatientsWithRecoveryInfo()

  // Filter patients based on search and filter
  const filteredPatients = patientsWithInfo.filter(patient => {
    const matchesSearch = 
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pre-op' && patient.isPreOp) ||
      (filterStatus === 'post-op' && !patient.isPreOp && patient.recoveryDay <= 90) ||
      (filterStatus === 'discharged' && patient.recoveryDay > 90)

    return matchesSearch && matchesFilter
  })

  // Get provider name helper
  const getProviderName = (providerId: string) => {
    const provider = demoProviders.find(p => p.id === providerId)
    return provider ? `Dr. ${provider.first_name} ${provider.last_name}` : 'Unassigned'
  }

  const getTaskStatus = (patient: any) => {
    if (patient.isPreOp) {
      return patient.pre_surgery_forms_completed ? 'completed' : 'pending'
    } else {
      const completionRate = patient.compliance_rate
      if (completionRate >= 90) return 'completed'
      if (completionRate >= 70) return 'in_progress'
      if (completionRate >= 50) return 'pending'
      return 'overdue'
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
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
              onClick={() => router.push('/demo/provider/patients/new')}
              icon={<UserPlus className="h-4 w-4" />}
            >
              Add Patient
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or MRN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'pre-op', 'post-op', 'discharged'] as const).map(status => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{myPatients.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pre-Op</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {patientsWithInfo.filter(p => p.isPreOp).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Recovery</p>
                    <p className="text-2xl font-bold text-green-600">
                      {patientsWithInfo.filter(p => !p.isPreOp && p.recoveryDay <= 90).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Compliance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        myPatients.reduce((sum, p) => sum + p.compliance_rate, 0) / myPatients.length
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

          {/* Patients List */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Patient Roster ({filteredPatients.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                icon={<Filter className="h-4 w-4" />}
              >
                More Filters
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/demo/provider/patients/${patient.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Patient Avatar */}
                        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          <User className="h-6 w-6" />
                        </div>

                        {/* Patient Info */}
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <RecoveryDayBadge day={patient.recoveryDay} size="sm" />
                            <StatusBadge status={getTaskStatus(patient)} size="sm" />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>MRN: {patient.medical_record_number}</span>
                            <span>•</span>
                            <span>{patient.surgery_type} - {patient.surgery_side}</span>
                            <span>•</span>
                            <span>Surgery: {patient.surgeryDateFormatted}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>Surgeon: {getProviderName(patient.surgeon_id)}</span>
                            {patient.primary_nurse_id && (
                              <>
                                <span>•</span>
                                <span>Nurse: {getProviderName(patient.primary_nurse_id)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Phone className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle phone call
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Mail className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle email
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<ChevronRight className="h-4 w-4" />}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Recovery Progress</span>
                        <span className="text-gray-900 font-medium">{patient.compliance_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${patient.compliance_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}
