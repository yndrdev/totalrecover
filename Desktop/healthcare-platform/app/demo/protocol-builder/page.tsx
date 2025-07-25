'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtocolBuilderRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the practice dashboard with the builder tab active
    router.push('/provider/dashboard?tab=builder')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Protocol Builder...</p>
      </div>
    </div>
  )
}