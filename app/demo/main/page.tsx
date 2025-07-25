'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, UserCheck, Monitor, MessageSquare, Activity } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TJV Recovery Platform Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the complete patient-to-practice workflow without any authentication barriers
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Demo */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Patient Experience</CardTitle>
              <CardDescription className="text-lg">
                See the exact recovery chat interface from your design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Features Included:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Day 4 recovery status (matches screenshot)</li>
                  <li>• Dark sidebar with care team</li>
                  <li>• Missed tasks from Day 2 & Day 3</li>
                  <li>• Interactive AI conversation</li>
                  <li>• Quick action buttons</li>
                  <li>• Medical records access</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Patient:</strong> Sarah Johnson<br />
                  <strong>Surgery:</strong> Total Knee Replacement<br />
                  <strong>Current Status:</strong> Day 4 Recovery
                </p>
              </div>

              <Link href="/demo/patient-chat" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <User className="h-5 w-5 mr-2" />
                  Experience Patient Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Provider Demo */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Provider Dashboard</CardTitle>
              <CardDescription className="text-lg">
                Monitor patient progress and manage care workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Features Included:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Patient list with recovery status</li>
                  <li>• Real-time task completion monitoring</li>
                  <li>• Missed task alerts</li>
                  <li>• Recent patient messages</li>
                  <li>• Appointment scheduling</li>
                  <li>• Recovery progress tracking</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>Demo Provider:</strong> Dr. Michael Smith<br />
                  <strong>Department:</strong> Orthopedic Surgery<br />
                  <strong>Active Patients:</strong> 23 current recoveries
                </p>
              </div>

              <Link href="/demo/provider-dashboard" className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                  <Monitor className="h-5 w-5 mr-2" />
                  View Provider Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Complete Practice-to-Patient Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Communication</h3>
              <p className="text-sm text-gray-600">
                AI-powered chat with context-aware responses based on recovery day and patient status
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Monitoring</h3>
              <p className="text-sm text-gray-600">
                Track task completion, identify missed activities, and maintain recovery timelines
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Care Team Integration</h3>
              <p className="text-sm text-gray-600">
                Seamless collaboration between surgeons, nurses, and physical therapists
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 Demo Highlights
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This demo shows the exact interface design from your screenshot with realistic data:
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">Day 4</div>
                <div className="text-gray-600">Current Recovery</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">3</div>
                <div className="text-gray-600">Missed Tasks</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">2</div>
                <div className="text-gray-600">Care Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}