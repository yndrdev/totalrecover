'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { PatientRosterTable } from '@/components/patients/PatientRosterTable'
import { demoPatients, demoProviders } from '@/lib/data/demo-healthcare-data'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import {
  Search,
  Filter,
  UserPlus,
  Calendar,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DemoPatientsPage() {
  const { demoUser } = useDemoAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pre-op' | 'post-op' | 'discharged'>('all')
  const [patientPainLevels, setPatientPainLevels] = useState<{ [key: string]: number }>({})
  const [patientCareTeams, setPatientCareTeams] = useState<{ [key: string]: any }>({})

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
      
      // Generate random pain level if not set
      if (!patientPainLevels[patient.id]) {
        const painLevel = Math.floor(Math.random() * 10) + 1
        setPatientPainLevels(prev => ({ ...prev, [patient.id]: painLevel }))
      }
      
      return {
        ...patient,
        recoveryDay,
        isPreOp: recoveryDay < 0,
        surgeryDateFormatted: surgeryDate.toLocaleDateString(),
        painLevel: patientPainLevels[patient.id] || 5,
        physical_therapist_id: patientCareTeams[patient.id]?.physical_therapist_id || patient.physical_therapist_id,
        lastMessage: Math.random() > 0.5 ? {
          content: "I'm feeling much better today, thank you!",
          timestamp: new Date().toISOString(),
          type: 'text' as const,
          unread: Math.random() > 0.7
        } : undefined
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

  // Get care team members
  const careTeamMembers = demoProviders.map(provider => ({
    id: provider.id,
    name: `Dr. ${provider.first_name} ${provider.last_name}`,
    title: provider.role === 'provider' ? 'Surgeon' : 
           provider.role === 'nurse' ? 'Nurse' : 
           'Physical Therapist'
  }))

  // Handlers
  const handlePatientClick = (patientId: string) => {
    router.push(`/demo/provider/patients/${patientId}`)
  }

  const handleCareTeamChange = (patientId: string, role: string, providerId: string) => {
    setPatientCareTeams(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [`${role === 'pt' ? 'physical_therapist' : role}_id`]: providerId
      }
    }))
  }

  const handlePainLevelUpdate = (patientId: string, level: number) => {
    setPatientPainLevels(prev => ({ ...prev, [patientId]: level }))
  }

  const handleMessageClick = (patientId: string) => {
    router.push(`/demo/provider/chat?patient=${patientId}`)
  }

  const handlePhoneClick = (patientId: string) => {
    console.log('Phone call to patient:', patientId)
  }

  const handleEmailClick = (patientId: string) => {
    console.log('Email patient:', patientId)
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

          {/* Patients Table */}
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
              <PatientRosterTable
                patients={filteredPatients}
                providers={careTeamMembers}
                onPatientClick={handlePatientClick}
                onCareTeamChange={handleCareTeamChange}
                onPainLevelUpdate={handlePainLevelUpdate}
                onMessageClick={handleMessageClick}
                onPhoneClick={handlePhoneClick}
                onEmailClick={handleEmailClick}
              />
            </CardContent>
          </Card>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}
