'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserContext } from '@/components/auth/user-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HealthcareLayout } from '@/components/layout/healthcare-layout'
import { ArrowLeft, Save, Building, Clock, Calendar, Shield } from 'lucide-react'
import { practiceService } from '@/lib/services/practice-service'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface BusinessHours {
  [key: string]: {
    open?: string
    close?: string
    closed?: boolean
  }
}

export default function PracticeSettings() {
  const router = useRouter()
  const { user } = useUserContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    practice_name: '',
    practice_type: 'orthopedic',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    phone: '',
    email: '',
    business_hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { closed: true },
      sunday: { closed: true }
    } as BusinessHours,
    appointment_duration: 30,
    buffer_time: 10,
    max_daily_patients: 20,
    specialties: [] as string[],
    insurance_accepted: [] as string[]
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [newInsurance, setNewInsurance] = useState('')

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const data = await practiceService.getPracticeSettings()
      setFormData({
        practice_name: data.practice_name || '',
        practice_type: data.practice_type || 'orthopedic',
        address: data.address || { street: '', city: '', state: '', zip: '' },
        phone: data.phone || '',
        email: data.email || '',
        business_hours: data.business_hours || formData.business_hours,
        appointment_duration: data.appointment_duration || 30,
        buffer_time: data.buffer_time || 10,
        max_daily_patients: data.max_daily_patients || 20,
        specialties: data.specialties || [],
        insurance_accepted: data.insurance_accepted || []
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch practice settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      await practiceService.updatePracticeSettings(formData)
      
      toast({
        title: "Success",
        description: "Practice settings updated successfully",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save practice settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDayStatus = (day: string) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: prev.business_hours[day]?.closed 
          ? { open: '09:00', close: '17:00' }
          : { closed: true }
      }
    }))
  }

  const updateBusinessHours = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }))
  }

  const addSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const addInsurance = () => {
    if (newInsurance && !formData.insurance_accepted.includes(newInsurance)) {
      setFormData(prev => ({
        ...prev,
        insurance_accepted: [...prev.insurance_accepted, newInsurance]
      }))
      setNewInsurance('')
    }
  }

  const removeInsurance = (insurance: string) => {
    setFormData(prev => ({
      ...prev,
      insurance_accepted: prev.insurance_accepted.filter(i => i !== insurance)
    }))
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
                <h1 className="text-3xl font-bold text-gray-900">Practice Settings</h1>
                <p className="text-gray-600 mt-1">Configure your practice information and preferences</p>
              </div>
            </div>
            <Button 
              variant="primary"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="practice_name">Practice Name</Label>
                    <Input
                      id="practice_name"
                      value={formData.practice_name}
                      onChange={(e) => setFormData({...formData, practice_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="practice_type">Practice Type</Label>
                    <Select
                      value={formData.practice_type}
                      onValueChange={(value) => setFormData({...formData, practice_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orthopedic">Orthopedic Surgery</SelectItem>
                        <SelectItem value="general">General Surgery</SelectItem>
                        <SelectItem value="sports">Sports Medicine</SelectItem>
                        <SelectItem value="spine">Spine Surgery</SelectItem>
                        <SelectItem value="multi">Multi-Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contact@practice.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Street Address"
                      value={formData.address.street}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                    />
                    <Input
                      placeholder="City"
                      value={formData.address.city}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    />
                    <Input
                      placeholder="State"
                      value={formData.address.state}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={formData.address.zip}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, zip: e.target.value}})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="capitalize font-medium w-24">{day}</span>
                      <button
                        type="button"
                        onClick={() => toggleDayStatus(day)}
                        className={`px-3 py-1 rounded text-sm ${
                          formData.business_hours[day]?.closed 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {formData.business_hours[day]?.closed ? 'Closed' : 'Open'}
                      </button>
                    </div>
                    {!formData.business_hours[day]?.closed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.business_hours[day]?.open || '09:00'}
                          onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                          className="w-24"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={formData.business_hours[day]?.close || '17:00'}
                          onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Appointment Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_duration">Appointment Duration (minutes)</Label>
                    <Input
                      id="appointment_duration"
                      type="number"
                      min="15"
                      max="120"
                      value={formData.appointment_duration}
                      onChange={(e) => setFormData({...formData, appointment_duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_time">Buffer Time (minutes)</Label>
                    <Input
                      id="buffer_time"
                      type="number"
                      min="0"
                      max="60"
                      value={formData.buffer_time}
                      onChange={(e) => setFormData({...formData, buffer_time: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_daily_patients">Max Daily Patients</Label>
                    <Input
                      id="max_daily_patients"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.max_daily_patients}
                      onChange={(e) => setFormData({...formData, max_daily_patients: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialties and Insurance */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Specialties & Insurance
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specialties */}
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add specialty"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSpecialty()
                        }
                      }}
                    />
                    <Button type="button" onClick={addSpecialty} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map((specialty) => (
                      <Badge key={specialty} className="px-3 py-1">
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-2 text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div className="space-y-2">
                  <Label>Insurance Accepted</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newInsurance}
                      onChange={(e) => setNewInsurance(e.target.value)}
                      placeholder="Add insurance provider"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addInsurance()
                        }
                      }}
                    />
                    <Button type="button" onClick={addInsurance} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.insurance_accepted.map((insurance) => (
                      <Badge key={insurance} className="px-3 py-1">
                        {insurance}
                        <button
                          type="button"
                          onClick={() => removeInsurance(insurance)}
                          className="ml-2 text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </HealthcareLayout>
    </ProtectedRoute>
  )
}