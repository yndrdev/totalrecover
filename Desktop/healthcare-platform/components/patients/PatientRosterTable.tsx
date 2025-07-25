'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Phone, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/design-system/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/design-system/Select'
import { cn } from '@/lib/utils'

interface CareTeamMember {
  id: string
  name: string
  title: string
}

interface PatientMessage {
  content: string
  timestamp: string
  type: 'text' | 'voice' | 'image'
  unread: boolean
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  surgery_type: string
  surgery_side: string
  recoveryDay: number
  painLevel: number
  surgeon_id: string
  primary_nurse_id: string | null
  physical_therapist_id: string | null
  lastMessage?: PatientMessage
}

interface PatientRosterTableProps {
  patients: Patient[]
  providers: CareTeamMember[]
  onPatientClick: (patientId: string) => void
  onCareTeamChange: (patientId: string, role: string, providerId: string) => void
  onPainLevelUpdate: (patientId: string, level: number) => void
  onMessageClick: (patientId: string) => void
  onPhoneClick: (patientId: string) => void
  onEmailClick: (patientId: string) => void
}

type SortColumn = 'name' | 'surgery' | 'day' | 'pain' | 'surgeon' | 'nurse' | 'pt' | 'message'
type SortDirection = 'asc' | 'desc'

export function PatientRosterTable({
  patients,
  providers,
  onPatientClick,
  onCareTeamChange,
  onPainLevelUpdate,
  onMessageClick,
  onPhoneClick,
  onEmailClick
}: PatientRosterTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('day')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set())

  // Sort patients
  const sortedPatients = [...patients].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortColumn) {
      case 'name':
        aValue = `${a.last_name} ${a.first_name}`
        bValue = `${b.last_name} ${b.first_name}`
        break
      case 'surgery':
        aValue = a.surgery_type
        bValue = b.surgery_type
        break
      case 'day':
        aValue = a.recoveryDay
        bValue = b.recoveryDay
        break
      case 'pain':
        aValue = a.painLevel
        bValue = b.painLevel
        break
      case 'surgeon':
        aValue = providers.find(p => p.id === a.surgeon_id)?.name || ''
        bValue = providers.find(p => p.id === b.surgeon_id)?.name || ''
        break
      case 'nurse':
        aValue = providers.find(p => p.id === a.primary_nurse_id)?.name || ''
        bValue = providers.find(p => p.id === b.primary_nurse_id)?.name || ''
        break
      case 'pt':
        aValue = providers.find(p => p.id === a.physical_therapist_id)?.name || ''
        bValue = providers.find(p => p.id === b.physical_therapist_id)?.name || ''
        break
      case 'message':
        aValue = a.lastMessage?.timestamp || ''
        bValue = b.lastMessage?.timestamp || ''
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const togglePatientSelection = (patientId: string) => {
    const newSelection = new Set(selectedPatients)
    if (newSelection.has(patientId)) {
      newSelection.delete(patientId)
    } else {
      newSelection.add(patientId)
    }
    setSelectedPatients(newSelection)
  }

  const toggleAllPatients = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set())
    } else {
      setSelectedPatients(new Set(patients.map(p => p.id)))
    }
  }

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-50'
    if (level <= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getDayBadgeColor = (day: number) => {
    return day < 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-600" />
      : <ChevronDown className="h-4 w-4 text-gray-600" />
  }

  // Get providers by role
  const surgeons = providers.filter(p => p.title === 'Surgeon')
  const nurses = providers.filter(p => p.title === 'Nurse')
  const physicalTherapists = providers.filter(p => p.title === 'Physical Therapist')

  return (
    <div className="w-full max-w-[1280px] mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPatients.size === patients.length && patients.length > 0}
                    onChange={toggleAllPatients}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Patient Name
                    <SortIcon column="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('surgery')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Surgery Type
                    <SortIcon column="surgery" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('day')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Day
                    <SortIcon column="day" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('pain')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Pain Level
                    <SortIcon column="pain" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('surgeon')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Surgeon
                    <SortIcon column="surgeon" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('nurse')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Nurse
                    <SortIcon column="nurse" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('pt')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Physical Therapist
                    <SortIcon column="pt" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('message')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Message
                    <SortIcon column="message" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-gray-900">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPatients.map((patient, index) => (
                <tr
                  key={patient.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  )}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.has(patient.id)}
                      onChange={() => togglePatientSelection(patient.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onPatientClick(patient.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {patient.first_name} {patient.last_name}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">
                      {patient.surgery_type} - {patient.surgery_side}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getDayBadgeColor(patient.recoveryDay)
                    )}>
                      {patient.recoveryDay > 0 ? patient.recoveryDay : patient.recoveryDay}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        const newLevel = patient.painLevel === 10 ? 1 : patient.painLevel + 1
                        onPainLevelUpdate(patient.id, newLevel)
                      }}
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-pointer transition-colors",
                        getPainLevelColor(patient.painLevel)
                      )}
                    >
                      {patient.painLevel}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <Select
                      value={patient.surgeon_id}
                      onValueChange={(value) => onCareTeamChange(patient.id, 'surgeon', value)}
                    >
                      <SelectTrigger className="w-[180px] text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeons.map(surgeon => (
                          <SelectItem key={surgeon.id} value={surgeon.id}>
                            {surgeon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4">
                    <Select
                      value={patient.primary_nurse_id || ''}
                      onValueChange={(value) => onCareTeamChange(patient.id, 'nurse', value)}
                    >
                      <SelectTrigger className="w-[180px] text-sm">
                        <SelectValue placeholder="Assign nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {nurses.map(nurse => (
                          <SelectItem key={nurse.id} value={nurse.id}>
                            {nurse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4">
                    <Select
                      value={patient.physical_therapist_id || ''}
                      onValueChange={(value) => onCareTeamChange(patient.id, 'pt', value)}
                    >
                      <SelectTrigger className="w-[180px] text-sm">
                        <SelectValue placeholder="Assign PT" />
                      </SelectTrigger>
                      <SelectContent>
                        {physicalTherapists.map(pt => (
                          <SelectItem key={pt.id} value={pt.id}>
                            {pt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4">
                    {patient.lastMessage ? (
                      <button
                        onClick={() => onMessageClick(patient.id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <MessageSquare className={cn(
                          "h-4 w-4",
                          patient.lastMessage.unread && "text-blue-600"
                        )} />
                        <span className="truncate max-w-[200px]">
                          {patient.lastMessage.content}
                        </span>
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">No messages</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Phone className="h-4 w-4" />}
                        onClick={() => onPhoneClick(patient.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Mail className="h-4 w-4" />}
                        onClick={() => onEmailClick(patient.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}