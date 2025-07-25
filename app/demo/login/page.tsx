'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { demoProviders } from '@/lib/data/demo-healthcare-data'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import { 
  Stethoscope, 
  UserCheck, 
  Activity, 
  Settings,
  Shield,
  Heart,
  Brain,
  Users
} from 'lucide-react'

export default function DemoLoginPage() {
  const router = useRouter()
  const { setDemoUser } = useDemoAuth()

  const handleRoleSelect = (providerId: string) => {
    const provider = demoProviders.find(p => p.id === providerId)
    if (provider) {
      setDemoUser(provider)
      router.push('/demo/provider/dashboard')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'surgeon':
        return <Stethoscope className="h-6 w-6" />
      case 'nurse':
        return <Heart className="h-6 w-6" />
      case 'physical_therapist':
        return <Activity className="h-6 w-6" />
      case 'practice_admin':
        return <Settings className="h-6 w-6" />
      default:
        return <UserCheck className="h-6 w-6" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'surgeon':
        return 'Full patient management, surgical planning, and outcome tracking'
      case 'nurse':
        return 'Patient monitoring, intervention tools, and care coordination'
      case 'physical_therapist':
        return 'Exercise prescription, recovery tracking, and therapy planning'
      case 'practice_admin':
        return 'Practice analytics, performance metrics, and administrative tools'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">TJV Recovery Platform</h1>
          </div>
          <p className="text-xl text-gray-600">Provider Demo Access</p>
          <p className="text-sm text-gray-500 mt-2">Select a role to explore the platform - no account needed</p>
        </div>

        {/* Role Selection */}
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <h2 className="text-2xl font-semibold text-gray-900">Choose Your Demo Role</h2>
            <p className="text-gray-600 mt-1">Experience the platform from different provider perspectives</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoProviders.map(provider => (
                <Card
                  key={provider.id}
                  interactive
                  className="p-6 hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-500"
                  onClick={() => handleRoleSelect(provider.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {getRoleIcon(provider.role)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Dr. {provider.first_name} {provider.last_name}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {provider.role.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      {provider.specialization && (
                        <p className="text-xs text-gray-500 mb-2">{provider.specialization}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {getRoleDescription(provider.role)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Demo Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Demo Features</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• 25+ demo patients with realistic recovery timelines</li>
                    <li>• Complete TJV protocol with 245-day timeline</li>
                    <li>• Real-time chat monitoring and intervention tools</li>
                    <li>• Professional analytics and performance metrics</li>
                    <li>• No setup required - instant access to all features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Looking for the real platform? 
                <Button 
                  variant="ghost" 
                  className="ml-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                  onClick={() => router.push('/login')}
                >
                  Sign in with your account
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <p>This is a demo environment with sample data only. No real patient information is displayed.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
