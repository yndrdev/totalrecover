'use client'

import React, { useState } from 'react';
import { 
  Activity,
  AlertTriangle, 
  Calendar,
  Clock,
  MessageCircle,
  Search,
  User,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for provider dashboard demo
const DEMO_PATIENTS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    surgery_type: 'TKA',
    surgery_date: '2025-01-17',
    current_day: 4,
    status: 'active',
    last_activity: '2 hours ago',
    next_appointment: '2025-01-22 14:00',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@email.com',
    tasks: {
      total: 4,
      completed: 0,
      missed: 3, // Has missed tasks from previous days
      pending: 4
    },
    recent_messages: [
      { time: '09:48 AM', content: 'Good morning! I\'m feeling better today. The pain is more manageable.' },
      { time: '08:30 AM', content: 'I completed my morning exercises.' }
    ],
    alerts: [
      { type: 'warning', message: 'Missed tasks on Day 2 and Day 3', priority: 'medium' },
      { type: 'info', message: 'Next check-in scheduled for 2:00 PM today', priority: 'low' }
    ]
  },
  {
    id: '2', 
    name: 'Robert Martinez',
    surgery_type: 'THA',
    surgery_date: '2025-01-10',
    current_day: 11,
    status: 'active',
    last_activity: '6 hours ago',
    next_appointment: '2025-01-25 10:00',
    phone: '(555) 987-6543',
    email: 'robert.martinez@email.com',
    tasks: {
      total: 5,
      completed: 4,
      missed: 0,
      pending: 1
    },
    recent_messages: [
      { time: '03:20 PM', content: 'Physical therapy went well today!' },
      { time: '10:15 AM', content: 'Pain level is about a 3/10 this morning.' }
    ],
    alerts: [
      { type: 'success', message: 'Excellent progress - ahead of schedule', priority: 'low' }
    ]
  }
]

const DASHBOARD_STATS = {
  total_patients: 47,
  active_recoveries: 23,
  pending_tasks: 89,
  missed_tasks: 12,
  scheduled_appointments: 8
}

export default function DemoProviderDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(DEMO_PATIENTS[0])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = DEMO_PATIENTS.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800' 
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'success': return 'border-green-200 bg-green-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-sm text-gray-600">TJV Recovery Platform - Patient Monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Dr. Michael Smith</p>
              <p className="text-xs text-gray-500">Orthopedic Surgery</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Patient List */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2">
                <div className="font-semibold text-gray-900">{DASHBOARD_STATS.active_recoveries}</div>
                <div className="text-gray-500">Active</div>
              </div>
              <div className="text-center p-2">
                <div className="font-semibold text-red-600">{DASHBOARD_STATS.missed_tasks}</div>
                <div className="text-gray-500">Missed Tasks</div>
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="divide-y divide-gray-100">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatient.id === patient.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{patient.name}</h3>
                    <p className="text-xs text-gray-500">
                      {patient.surgery_type} • Day {patient.current_day}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last active: {patient.last_activity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                    {patient.tasks.missed > 0 && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">{patient.tasks.missed} missed</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Selected Patient Details */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Patient Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedPatient.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPatient.surgery_type === 'TKA' ? 'Total Knee Replacement' : 'Total Hip Replacement'} • 
                      Surgery: {new Date(selectedPatient.surgery_date).toLocaleDateString()} • 
                      Day {selectedPatient.current_day} Recovery
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{selectedPatient.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Chat
                    </Button>
                    <Button size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recovery Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recovery Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Tasks</span>
                      <span className="font-medium">{selectedPatient.tasks.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">{selectedPatient.tasks.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-medium text-blue-600">{selectedPatient.tasks.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Missed</span>
                      <span className="font-medium text-red-600">{selectedPatient.tasks.missed}</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(selectedPatient.tasks.completed / (selectedPatient.tasks.total + selectedPatient.tasks.completed)) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Overall completion rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Next Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(selectedPatient.next_appointment).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(selectedPatient.next_appointment).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      Reschedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      View Recovery Timeline
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Create Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {selectedPatient.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPatient.alerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                        <div className="flex items-start space-x-2">
                          {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                          {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">Priority: {alert.priority}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedPatient.recent_messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}