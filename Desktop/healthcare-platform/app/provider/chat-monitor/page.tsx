'use client'

import React, { useEffect, useState } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import EnhancedProviderChatMonitor from '@/components/provider/EnhancedProviderChatMonitor'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatMonitorPage() {
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Get provider profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          provider:providers!providers_user_id_fkey(*)
        `)
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile?.provider) {
        console.error('Error fetching provider profile:', profileError)
        router.push('/dashboard')
        return
      }

      setProvider(profile)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="provider" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading chat monitor...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!provider) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      <main className="flex-1 overflow-hidden">
        <EnhancedProviderChatMonitor
          providerId={provider.provider[0].id}
          providerName={provider.full_name || 'Provider'}
        />
      </main>
    </div>
  )
}