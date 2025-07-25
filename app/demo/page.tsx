'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { 
  UserMinus, 
  UserCheck,
  Building2,
  Shield,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MainLandingPage() {
  const router = useRouter()

  const userFlows = [
    {
      title: 'Pre-Op Patient',
      description: 'Pre-operative questions and chat interface for patients preparing for surgery',
      icon: <UserMinus className="h-8 w-8" />,
      path: '/preop',
      color: 'blue',
      badge: 'Patient Experience'
    },
    {
      title: 'Post-Op Patient', 
      description: 'Post-operative questions and recovery guidance for patients after surgery',
      icon: <UserCheck className="h-8 w-8" />,
      path: '/postop',
      color: 'green',
      badge: 'Patient Experience'
    },
    {
      title: 'Practice Admin',
      description: 'SaaS admin interface for practice administration and system management',
      icon: <Shield className="h-8 w-8" />,
      path: '/saasadmin',
      color: 'purple',
      badge: 'Administration'
    },
    {
      title: 'Practice',
      description: 'General practice interface for nurses, surgeons, and physical therapists',
      icon: <Building2 className="h-8 w-8" />,
      path: '/practice',
      color: 'orange',
      badge: 'Healthcare Team'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string; border: string; badgeBg: string; badgeText: string }> = {
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-600', 
        hover: 'hover:bg-blue-100', 
        border: 'border-blue-200',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700'
      },
      green: { 
        bg: 'bg-green-50', 
        text: 'text-green-600', 
        hover: 'hover:bg-green-100', 
        border: 'border-green-200',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-600', 
        hover: 'hover:bg-purple-100', 
        border: 'border-purple-200',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700'
      },
      orange: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-600', 
        hover: 'hover:bg-orange-100', 
        border: 'border-orange-200',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700'
      }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TJV Recovery Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare platform supporting patients and providers throughout the recovery journey
          </p>
        </div>

        {/* User Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {userFlows.map((flow) => {
            const colors = getColorClasses(flow.color)
            return (
              <Card 
                key={flow.path}
                className={`${colors.bg} ${colors.border} border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                onClick={() => router.push(flow.path)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors.badgeBg} ${colors.badgeText} mb-4`}>
                      {flow.badge}
                    </div>
                    
                    <div className={`w-20 h-20 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center ${colors.text} mb-6`}>
                      {flow.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {flow.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {flow.description}
                    </p>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      className={`${colors.hover} transition-colors`}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(flow.path)
                      }}
                    >
                      Enter {flow.title} →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Individual Provider Access */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 text-center">Individual Provider Access</h2>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Individual providers can access their personalized dashboard with patient management, chat, and protocols
            </p>
            <Button
              onClick={() => router.push('/provider')}
              variant="secondary"
              size="lg"
            >
              Access Provider Portal →
            </Button>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Activity className="h-4 w-4" />
            <span className="font-medium">Live Platform</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Experience the full TJV Recovery Platform capabilities
          </p>
        </div>
      </div>
    </div>
  )
}
