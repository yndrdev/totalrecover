'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useDemoAuth } from '@/components/auth/demo-auth-provider'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Activity,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Video,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/design-system/Button'

interface DemoHealthcareLayoutProps {
  children: React.ReactNode
}

export function DemoHealthcareLayout({ children }: DemoHealthcareLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['patients'])
  const { demoUser, logout } = useDemoAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (!demoUser) {
    return null
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/demo/provider/dashboard',
      icon: Home,
      roles: ['surgeon', 'nurse', 'physical_therapist', 'practice_admin']
    },
    // Practice Admin specific navigation
    {
      name: 'Staff',
      href: '/demo/practice/staff',
      icon: Users,
      roles: ['practice_admin']
    },
    // Practice level users navigation
    {
      name: 'Patients',
      icon: Users,
      roles: ['surgeon', 'nurse', 'physical_therapist'],
      children: [
        { name: 'All Patients', href: '/demo/provider/patients' },
        { name: 'Add New Patient', href: '/demo/provider/patients/new' }
      ]
    },
    {
      name: 'Chat',
      href: '/demo/provider/chat',
      icon: MessageSquare,
      roles: ['surgeon', 'nurse', 'physical_therapist']
    },
    {
      name: 'Messages',
      href: '/demo/provider/messages',
      icon: MessageSquare,
      roles: ['surgeon', 'nurse', 'physical_therapist', 'practice_admin']
    },
    // Protocols for both practice admin and practice level users
    {
      name: 'Protocols',
      icon: ClipboardList,
      roles: ['surgeon', 'nurse', 'physical_therapist', 'practice_admin'],
      children: [
        { name: 'View Protocols', href: '/demo/provider/protocols' },
        { name: 'Protocol Builder', href: '/demo/provider/protocols/builder' }
      ]
    },
    // Content Library for both groups
    {
      name: 'Content Library',
      icon: BookOpen,
      roles: ['surgeon', 'nurse', 'physical_therapist', 'practice_admin'],
      children: [
        { name: 'Forms', href: '/demo/provider/content/forms', icon: FileText },
        { name: 'Videos', href: '/demo/provider/content/videos', icon: Video },
        { name: 'Exercises', href: '/demo/provider/content/exercises', icon: Activity }
      ]
    },
    // Practice Admin specific settings
    {
      name: 'Admin Settings',
      href: '/demo/practice/admin-settings',
      icon: Settings,
      roles: ['practice_admin']
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles?.includes(demoUser.role)
  )

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.href || 
      (item.children && item.children.some((child: any) => pathname === child.href))
    const isExpanded = expandedSections.includes(item.name.toLowerCase())

    if (item.children) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSection(item.name.toLowerCase())}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {sidebarOpen && <span>{item.name}</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown 
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'transform rotate-180'
                )}
              />
            )}
          </button>
          {sidebarOpen && isExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map((child: any) => (
                <a
                  key={child.name}
                  href={child.href}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(child.href)
                  }}
                  className={cn(
                    'block px-4 py-2 text-sm rounded-lg transition-colors',
                    pathname === child.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center">
                    {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                    {child.name}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <a
        key={item.name}
        href={item.href}
        onClick={(e) => {
          e.preventDefault()
          router.push(item.href)
        }}
        className={cn(
          'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        )}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {sidebarOpen && <span>{item.name}</span>}
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">TJV Recovery</h2>
                <p className="text-xs text-gray-500">Demo Environment</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* User Info */}
          {sidebarOpen && (
            <div className="px-4 py-4 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {demoUser.first_name[0]}{demoUser.last_name[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {demoUser.first_name} {demoUser.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {demoUser.role.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {filteredNavigation.map(renderNavItem)}
          </nav>

          {/* Logout */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              fullWidth
              onClick={logout}
              className="justify-start"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {pathname?.split('/').pop()?.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ') || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Demo Mode</span>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
