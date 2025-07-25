'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProviderPortal() {
  const router = useRouter()

  useEffect(() => {
    // Redirect immediately to patients page
    router.replace('/provider/patients')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}