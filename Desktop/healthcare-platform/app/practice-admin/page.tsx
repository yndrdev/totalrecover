'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Settings, 
  Users, 
  FileText, 
  Building, 
  BarChart3, 
  ArrowRight,
  Target,
  MessageSquare,
  Video,
  Activity,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Play,
  Save,
  Eye
} from 'lucide-react'

export default function PracticeAdminPortal() {
  const [activeSection, setActiveSection] = useState('staff')
  const [showContentDropdown, setShowContentDropdown] = useState(false)
  const [contentType, setContentType] = useState('videos') // videos, forms, exercises
  
  // Mock data for content library
  const [videos, setVideos] = useState([
    { id: 1, title: 'Post-Surgery Knee Bending', url: 'https://youtube.com/watch?v=example1', description: 'Basic knee bending exercises for post-surgery recovery' },
    { id: 2, title: 'Walking Techniques', url: 'https://youtube.com/watch?v=example2', description: 'Proper walking techniques during recovery' }
  ])
  
  const [newVideo, setNewVideo] = useState({ title: '', url: '', description: '' })

  // Protocol Builder State - Clean Version
  const [builderProtocol, setBuilderProtocol] = useState({
    name: 'Standard TKA Recovery Protocol',
    surgery_type: 'TKA',
    description: 'Comprehensive total knee replacement recovery program',
    tasks: []
  });
  const assignedPatient = 'John Miller - TKA Recovery Day 4';

  // Mock Staff Data
  const [staff] = useState([
    { id: 1, name: 'Dr. Sarah Wilson', role: 'Surgeon', email: 'swilson@practice.com', status: 'Active', patients: 45 },
    { id: 2, name: 'Jennifer Brown', role: 'Nurse', email: 'jbrown@practice.com', status: 'Active', patients: 32 },
    { id: 3, name: 'Michael Chen', role: 'Physical Therapist', email: 'mchen@practice.com', status: 'Active', patients: 28 },
    { id: 4, name: 'Dr. James Rodriguez', role: 'Surgeon', email: 'jrodriguez@practice.com', status: 'Active', patients: 38 }
  ])

  // Mock Patients Data (Pre-op and Post-op)
  const [patients] = useState([
    { 
      id: 1, 
      name: 'John Miller', 
      type: 'post-op', 
      surgery: 'TKA', 
      status: 'Active Recovery',
      recoveryDay: 4,
      age: 68,
      lastActivity: '2 hours ago',
      tasksCompleted: 12,
      totalTasks: 18,
      compliance: 67,
      assignedStaff: 'Dr. Sarah Wilson'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      type: 'pre-op', 
      surgery: 'THA', 
      status: 'Pre-Surgery Prep',
      surgeryDate: '2025-01-28',
      age: 72,
      lastActivity: '1 day ago',
      tasksCompleted: 8,
      totalTasks: 12,
      compliance: 100,
      assignedStaff: 'Dr. James Rodriguez'
    },
    { 
      id: 3, 
      name: 'Michael Chen', 
      type: 'post-op', 
      surgery: 'TKA', 
      status: 'Early Recovery',
      recoveryDay: 12,
      age: 55,
      lastActivity: '30 minutes ago',
      tasksCompleted: 28,
      totalTasks: 35,
      compliance: 80,
      assignedStaff: 'Dr. Sarah Wilson'
    },
    { 
      id: 4, 
      name: 'Maria Rodriguez', 
      type: 'pre-op', 
      surgery: 'TSA', 
      status: 'Pre-Surgery Prep',
      surgeryDate: '2025-02-05',
      age: 64,
      lastActivity: '4 hours ago',
      tasksCompleted: 15,
      totalTasks: 15,
      compliance: 100,
      assignedStaff: 'Jennifer Brown'
    },
    { 
      id: 5, 
      name: 'Robert Wilson', 
      type: 'post-op', 
      surgery: 'THA', 
      status: 'Rehabilitation',
      recoveryDay: 45,
      age: 71,
      lastActivity: '1 hour ago',
      tasksCompleted: 89,
      totalTasks: 95,
      compliance: 94,
      assignedStaff: 'Dr. James Rodriguez'
    }
  ])

  const renderSidebar = () => (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Practice Admin</h1>
            <p className="text-xs text-gray-600">Administrative Control</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveSection('staff')}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
            activeSection === 'staff' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Staff</span>
        </button>
        
        <button
          onClick={() => setActiveSection('patients')}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
            activeSection === 'patients' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Building className="h-5 w-5" />
          <span>Patients</span>
        </button>
        
        <button
          onClick={() => setActiveSection('protocols')}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
            activeSection === 'protocols' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Target className="h-5 w-5" />
          <span>Protocols</span>
        </button>
        
        <div className="relative">
          <button
            onClick={() => {
              setActiveSection('content')
              setShowContentDropdown(!showContentDropdown)
            }}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
              activeSection === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <span>Content Library</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showContentDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showContentDropdown && (
            <div className="ml-6 mt-1 space-y-1">
              <button
                onClick={() => setContentType('forms')}
                className={`w-full text-left px-3 py-1 text-sm rounded ${
                  contentType === 'forms' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Forms
              </button>
              <button
                onClick={() => setContentType('videos')}
                className={`w-full text-left px-3 py-1 text-sm rounded ${
                  contentType === 'videos' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setContentType('exercises')}
                className={`w-full text-left px-3 py-1 text-sm rounded ${
                  contentType === 'exercises' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Exercises
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setActiveSection('messages')}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
            activeSection === 'messages' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Messages</span>
        </button>
        
        <button
          onClick={() => setActiveSection('settings')}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
            activeSection === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Admin Settings</span>
        </button>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <Link href="/">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'staff':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h2>
                <p className="text-gray-600">Manage provider accounts, roles, and permissions</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            {/* Staff Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.length}</p>
                      <p className="text-xs text-gray-600">Total Staff</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.filter(s => s.status === 'Active').length}</p>
                      <p className="text-xs text-gray-600">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.filter(s => s.role === 'Surgeon').length}</p>
                      <p className="text-xs text-gray-600">Surgeons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.reduce((acc, s) => acc + s.patients, 0)}</p>
                      <p className="text-xs text-gray-600">Total Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Practice Staff</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-blue-600 font-medium">{member.role}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {member.patients} patients
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-gray-600 hover:bg-gray-50">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'patients':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Overview</h2>
                <p className="text-gray-600">Administrative view of all patients across the practice</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/provider/dashboard">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Activity className="h-4 w-4 mr-2" />
                    Provider Dashboard
                  </Button>
                </Link>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>

            {/* Patient Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patients.length}</p>
                      <p className="text-xs text-gray-600">Total Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patients.filter(p => p.type === 'pre-op').length}</p>
                      <p className="text-xs text-gray-600">Pre-Op</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patients.filter(p => p.type === 'post-op').length}</p>
                      <p className="text-xs text-gray-600">Post-Op</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(patients.reduce((acc, p) => acc + p.compliance, 0) / patients.length)}%
                      </p>
                      <p className="text-xs text-gray-600">Avg Compliance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {patients.reduce((acc, p) => acc + p.tasksCompleted, 0)}
                      </p>
                      <p className="text-xs text-gray-600">Tasks Done</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patients List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>All Practice Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          patient.type === 'pre-op' 
                            ? 'bg-gradient-to-br from-red-500 to-red-600' 
                            : 'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                          <span className="text-white font-semibold text-sm">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              patient.type === 'pre-op' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {patient.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-blue-600 font-medium">{patient.surgery} - {patient.status}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">Age {patient.age}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-blue-600">{patient.assignedStaff}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            {patient.type === 'post-op' ? (
                              <span className="text-xs text-gray-500">Recovery Day {patient.recoveryDay}</span>
                            ) : (
                              <span className="text-xs text-gray-500">Surgery: {patient.surgeryDate}</span>
                            )}
                            <span className="text-xs text-gray-500">Last activity: {patient.lastActivity}</span>
                            <span className="text-xs text-gray-500">
                              Tasks: {patient.tasksCompleted}/{patient.totalTasks} ({patient.compliance}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            patient.compliance >= 90 ? 'text-green-600' :
                            patient.compliance >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {patient.compliance}%
                          </div>
                          <div className="text-xs text-gray-500">Compliance</div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/patient/chat?demo=true&patient=${patient.id}`}>
                            <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'protocols':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6">
              {/* Protocol Builder Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Protocol Builder - Practice Admin</h2>
                      <p className="text-sm text-blue-600 font-medium">TJV Recovery Platform</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Create standard protocols for all patients</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Patient View
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Save className="h-4 w-4 mr-2" />
                    Save Protocol
                  </Button>
                </div>
              </div>

              {/* Protocol Info */}
              <Card className="mb-6 border-blue-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-900">Protocol Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Protocol Name</label>
                      <Input 
                        value={builderProtocol.name} 
                        onChange={(e) => setBuilderProtocol(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter protocol name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Surgery Type</label>
                      <select 
                        value={builderProtocol.surgery_type}
                        onChange={(e) => setBuilderProtocol(prev => ({ ...prev, surgery_type: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="TKA">Total Knee Replacement (TKA)</option>
                        <option value="THA">Total Hip Replacement (THA)</option>
                        <option value="TSA">Total Shoulder Replacement (TSA)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Textarea 
                      value={builderProtocol.description}
                      onChange={(e) => setBuilderProtocol(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this recovery protocol"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card className="border-gray-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg text-gray-900">Recovery Tasks ({builderProtocol.tasks.length})</CardTitle>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">
                        Assigned to: <span className="font-medium text-blue-600">{assignedPatient}</span>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {builderProtocol.tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <div className="text-lg font-medium">No tasks created yet</div>
                        <div className="text-sm">Add your first task to get started</div>
                      </div>
                    ) : (
                      builderProtocol.tasks.map((task: any, index: number) => (
                        <div key={task.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-300 group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                <Activity className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                                    {task.type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
        
      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Library - {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</h2>
              <p className="text-gray-600">Manage your {contentType} for use in protocols</p>
            </div>
            
            {contentType === 'videos' && (
              <div className="space-y-6">
                {/* Add New Video */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Add New Video</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                      <Input
                        value={newVideo.title}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter video title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                      <Input
                        value={newVideo.url}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Textarea
                        value={newVideo.description}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this video covers..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (newVideo.title && newVideo.url) {
                          setVideos(prev => [...prev, { ...newVideo, id: Date.now() }])
                          setNewVideo({ title: '', url: '', description: '' })
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Video
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Video Library */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {videos.map((video) => (
                        <div key={video.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Play className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{video.title}</h4>
                            <p className="text-sm text-gray-600">{video.description}</p>
                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              {video.url}
                            </a>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {videos.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No videos yet. Add your first video above.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {contentType === 'forms' && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Form Builder</h3>
                    <p className="text-gray-600 mb-4">Coming Soon - Create and manage assessment forms</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {contentType === 'exercises' && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Exercise Library</h3>
                    <p className="text-gray-600 mb-4">Coming Soon - Manage exercise videos and instructions</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
        
      case 'messages':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
              <p className="text-gray-600">Internal practice messaging system</p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Practice Messages</h3>
                  <p className="text-gray-600 mb-4">Coming Soon - Internal messaging for practice staff</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Settings</h2>
              <p className="text-gray-600">Configure practice settings and system preferences</p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Practice Settings</h3>
                  <p className="text-gray-600 mb-4">Coming Soon - Configure practice information and system settings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  )
}