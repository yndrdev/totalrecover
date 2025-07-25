'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Heart, 
  Stethoscope, 
  Building2, 
  Settings, 
  Users, 
  FileText, 
  Calendar,
  MessageSquare,
  Activity,
  Home,
  ClipboardList,
  Video,
  ChartBar,
  UserPlus,
  Shield
} from 'lucide-react'

export default function DemoNavigationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TJV Recovery Platform - Demo Navigation
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            All pages are accessible without authentication in demo mode
          </p>
          <p className="text-sm text-gray-500">
            BYPASS_AUTH is enabled - Click any section to explore
          </p>
        </div>

        {/* Patient Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Heart className="mr-3 h-8 w-8 text-red-500" />
            Patient Portal
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/preop">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Pre-Op Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Pre-surgery timeline with AI assistant (matches screenshot)</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/demo/patient-chat">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Patient Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">24/7 AI recovery assistant chat</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/preop">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Pre-Op Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Pre-surgery preparation and tasks</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/postop">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Post-Op Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Post-surgery recovery tracking</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Provider Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Stethoscope className="mr-3 h-8 w-8 text-blue-500" />
            Provider Portal
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/provider/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Provider Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Provider overview and metrics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/patients">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Patient Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">View and manage patient list</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/protocols">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Recovery protocol management</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/protocols/builder">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Protocol Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create custom recovery protocols</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/schedule">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Appointment scheduling</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/content/exercises">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Exercise Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage exercise content</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/content/videos">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="mr-2 h-5 w-5" />
                    Video Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Educational video library</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChartBar className="mr-2 h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Patient outcome analytics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/provider/messages">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Patient communication center</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Practice Admin Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-green-500" />
            Practice Administration
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/practice/protocols">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Practice Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage practice-wide protocols</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/practice/staff">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Staff Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage practice staff and roles</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/practice/patients">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Patient Registry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Practice patient management</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/practice/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Practice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Configure practice settings</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Demo Mode Information
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• All pages are accessible without authentication</p>
            <p>• Mock data is provided for all database queries</p>
            <p>• Changes are not persisted between sessions</p>
            <p>• Perfect for exploring the platform's capabilities</p>
          </div>
          <div className="mt-4 flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Try Login Flow
              </Button>
            </Link>
            <Link href="/auth/create-account">
              <Button variant="outline" size="sm">
                Try Signup Flow
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}