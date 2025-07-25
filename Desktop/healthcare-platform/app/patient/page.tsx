'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare, 
  Calendar, 
  FileText, 
  Activity, 
  User, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function PatientPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-sm text-gray-600">Your Recovery Journey</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Recovery Portal</h2>
          <p className="text-gray-600">Access your recovery timeline, complete tasks, and communicate with your care team</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">Day 4</p>
                  <p className="text-sm text-gray-600">Recovery Day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-gray-600">New Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recovery Chat */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Recovery Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Interactive chat interface with your recovery assistant and care team
              </p>
              <Link href="/demo/patient-chat">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Open Chat
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recovery Timeline */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Recovery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View your complete recovery schedule and track daily progress
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                View Timeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* My Forms */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>My Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Complete assessments and track your recovery metrics
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                View Forms
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Exercise Library */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Exercise Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access your personalized exercise videos and instructions
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled>
                View Exercises
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Care Team */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>My Care Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Connect with your doctors, nurses, and physical therapists
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled>
                View Team
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>

          {/* Progress Reports */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Progress Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View detailed reports on your recovery progress and milestones
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled>
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-900">Morning exercises completed</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-900">Pain assessment form pending</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-900">New message from Dr. Smith</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}