'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PracticePortal() {
  const router = useRouter()

  useEffect(() => {
    // Redirect immediately to patients page
    router.replace('/practice/patients')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}
