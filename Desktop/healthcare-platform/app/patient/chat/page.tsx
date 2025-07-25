'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EnhancedPatientChat from '@/components/chat/EnhancedPatientChat'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function PatientChatPage() {
  const router = useRouter()
  const supabase = createClient()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Get patient record for this user
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (patientError) {
          console.error('Error fetching patient:', patientError)
          setError('Unable to find patient record')
          return
        }

        setPatientId(patient.id)
      } catch (err) {
        console.error('Error in auth check:', err)
        setError('Authentication error')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#006DB1' }} />
            <p className="text-sm text-gray-600">Loading your recovery chat...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !patientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error || 'Unable to load chat'}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <EnhancedPatientChat patientId={patientId} />
      </div>
    </div>
  )
}
