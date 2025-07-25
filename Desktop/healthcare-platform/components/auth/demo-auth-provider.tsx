'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { demoProviders, type DemoProvider } from '@/lib/data/demo-healthcare-data'

interface DemoAuthContextType {
  demoUser: DemoProvider | null
  setDemoUser: (user: DemoProvider | null) => void
  isLoading: boolean
  logout: () => void
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  demoUser: null,
  setDemoUser: () => {},
  isLoading: true,
  logout: () => {}
})

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [demoUser, setDemoUser] = useState<DemoProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is stored in sessionStorage
    if (typeof window !== 'undefined') {
      const storedUser = sessionStorage.getItem('demo-user')
      if (storedUser) {
        setDemoUser(JSON.parse(storedUser))
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect to demo login if not authenticated and on a demo page
    if (!isLoading && !demoUser && pathname?.startsWith('/demo/provider')) {
      router.push('/demo/login')
    }
  }, [demoUser, isLoading, pathname, router])

  const handleSetDemoUser = (user: DemoProvider | null) => {
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem('demo-user', JSON.stringify(user))
      } else {
        sessionStorage.removeItem('demo-user')
      }
    }
    setDemoUser(user)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('demo-user')
    }
    setDemoUser(null)
    router.push('/demo/login')
  }

  return (
    <DemoAuthContext.Provider value={{ 
      demoUser, 
      setDemoUser: handleSetDemoUser, 
      isLoading,
      logout 
    }}>
      {children}
    </DemoAuthContext.Provider>
  )
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext)
  if (!context) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider')
  }
  return context
}

// Wrapper component for demo pages
export function DemoProtectedRoute({ children }: { children: React.ReactNode }) {
  const { demoUser, isLoading } = useDemoAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#006DB1' }} />
      </div>
    )
  }

  if (!demoUser) {
    return null // Router will redirect to login
  }

  return <>{children}</>
}
