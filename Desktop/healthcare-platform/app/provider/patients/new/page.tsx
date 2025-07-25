'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserContext } from '@/components/auth/user-provider'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HealthcareLayout } from '@/components/layout/healthcare-layout'
import { auditLogger } from '@/lib/utils/audit-logger'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewPatientPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useUserContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: 'demo123!', // Default password
    first_name: '',
    last_name: '',
    phone_number: '',
    surgery_date: '',
    medical_record_number: '',
    insurance_provider: '',
    insurance_policy_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  // Get user info for audit trail
  const userRole = user?.user_metadata?.role || 'provider'
  const userName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim()
  const userTenantId = user?.user_metadata?.tenant_id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'patient',
            tenant_id: userTenantId
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Step 2: Create patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          tenant_id: userTenantId,
          user_id: authData.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          surgery_date: formData.surgery_date || null,
          status: 'active',
          metadata: {
            phone_number: formData.phone_number,
            medical_record_number: formData.medical_record_number,
            insurance_provider: formData.insurance_provider,
            insurance_policy_number: formData.insurance_policy_number,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone
          }
        })
        .select()
        .single()

      if (patientError) throw patientError

      // Step 3: Log the action
      if (user?.id && userTenantId) {
        await auditLogger.logPatientCreation({
          tenant_id: userTenantId,
          user_id: user.id,
          patient_id: patient.id,
          patient_name: `${formData.first_name} ${formData.last_name}`,
          created_by: {
            user_name: userName,
            user_role: userRole
          }
        })
      }

      // Navigate to patient detail page
      router.push(`/provider/patients/${patient.id}`)
    } catch (err: any) {
      console.error('Error creating patient:', err)
      setError(err.message || 'Failed to create patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <ProtectedRoute requiredRole="provider">
      <HealthcareLayout>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/provider/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">Add New Patient</h1>
            <p className="text-gray-600 mt-1">Create a new patient account and profile</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account Information */}
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      placeholder="patient@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Initial Password</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={handleChange('password')}
                      placeholder="demo123!"
                    />
                    <p className="text-xs text-gray-500 mt-1">Patient will be prompted to change on first login</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange('first_name')}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange('last_name')}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange('phone_number')}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surgery_date">Surgery Date</Label>
                    <Input
                      id="surgery_date"
                      type="date"
                      value={formData.surgery_date}
                      onChange={handleChange('surgery_date')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medical_record_number">Medical Record Number</Label>
                    <Input
                      id="medical_record_number"
                      type="text"
                      value={formData.medical_record_number}
                      onChange={handleChange('medical_record_number')}
                      placeholder="MRN-123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance_provider">Insurance Provider</Label>
                    <Input
                      id="insurance_provider"
                      type="text"
                      value={formData.insurance_provider}
                      onChange={handleChange('insurance_provider')}
                      placeholder="Blue Cross Blue Shield"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="insurance_policy_number">Insurance Policy Number</Label>
                  <Input
                    id="insurance_policy_number"
                    type="text"
                    value={formData.insurance_policy_number}
                    onChange={handleChange('insurance_policy_number')}
                    placeholder="POL-123456789"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={handleChange('emergency_contact_name')}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange('emergency_contact_phone')}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/provider/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Patient
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </HealthcareLayout>
    </ProtectedRoute>
  )
}