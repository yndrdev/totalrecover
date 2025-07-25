'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  Inbox,
  Send,
  Archive,
  Trash2,
  Search,
  Filter,
  Star,
  AlertCircle,
  Clock,
  User,
  Users,
  FileText,
  Calendar,
  Check,
  CheckCheck,
  Plus,
  Reply,
  Forward,
  MoreHorizontal
} from 'lucide-react'

interface Message {
  id: string
  subject: string
  sender: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  recipients: Array<{
    id: string
    name: string
    role: string
  }>
  content: string
  timestamp: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: 'patient-update' | 'protocol-alert' | 'system' | 'team' | 'appointment'
  status: 'unread' | 'read' | 'replied' | 'forwarded'
  starred: boolean
  archived: boolean
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: string
  }>
}

const mockMessages: Message[] = [
  {
    id: '1',
    subject: 'Patient Protocol Update - Sarah Johnson',
    sender: {
      id: 'nurse-1',
      name: 'Jessica Chen',
      role: 'Nurse'
    },
    recipients: [
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon' },
      { id: 'pt-1', name: 'Dr. Thompson', role: 'Physical Therapist' }
    ],
    content: 'Sarah Johnson has completed Week 2 of her hip replacement recovery protocol. Pain levels are consistently at 3/10, and range of motion has improved significantly. Please review her progress and consider advancing to Week 3 exercises.',
    timestamp: '2024-01-15T14:30:00Z',
    priority: 'normal',
    category: 'patient-update',
    status: 'unread',
    starred: false,
    archived: false,
    attachments: [
      { id: 'att-1', name: 'progress-report.pdf', type: 'application/pdf', size: '2.1 MB' }
    ]
  },
  {
    id: '2',
    subject: 'URGENT: Protocol Deviation Alert',
    sender: {
      id: 'system',
      name: 'TJV Recovery System',
      role: 'System'
    },
    recipients: [
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon' }
    ],
    content: 'Alert: Patient Michael Davis has missed 3 consecutive physical therapy sessions. His recovery timeline may be at risk. Immediate intervention recommended.',
    timestamp: '2024-01-15T11:45:00Z',
    priority: 'urgent',
    category: 'protocol-alert',
    status: 'read',
    starred: true,
    archived: false
  },
  {
    id: '3',
    subject: 'Team Meeting Notes - Weekly Review',
    sender: {
      id: 'admin-1',
      name: 'Dr. Kim',
      role: 'Practice Admin'
    },
    recipients: [
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon' },
      { id: 'nurse-1', name: 'Jessica Chen', role: 'Nurse' },
      { id: 'pt-1', name: 'Dr. Thompson', role: 'Physical Therapist' }
    ],
    content: 'Summary of this week\'s team meeting: New protocol templates approved, patient satisfaction scores reviewed (93% positive), and Q1 goals discussed. Next meeting scheduled for January 22nd.',
    timestamp: '2024-01-15T09:00:00Z',
    priority: 'normal',
    category: 'team',
    status: 'read',
    starred: false,
    archived: false
  },
  {
    id: '4',
    subject: 'Appointment Reminder - Tomorrow',
    sender: {
      id: 'system',
      name: 'Appointment System',
      role: 'System'
    },
    recipients: [
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon' }
    ],
    content: 'Reminder: You have 4 patient appointments scheduled for tomorrow, January 16th. Sarah Johnson (9:00 AM), Michael Davis (10:30 AM), Lisa Rodriguez (2:00 PM), and Robert Wilson (3:30 PM).',
    timestamp: '2024-01-14T17:00:00Z',
    priority: 'normal',
    category: 'appointment',
    status: 'read',
    starred: false,
    archived: false
  },
  {
    id: '5',
    subject: 'System Maintenance Notification',
    sender: {
      id: 'system',
      name: 'IT Support',
      role: 'System'
    },
    recipients: [
      { id: 'all', name: 'All Users', role: 'All' }
    ],
    content: 'Scheduled system maintenance will occur this Saturday, January 20th from 2:00 AM to 6:00 AM EST. The system will be temporarily unavailable during this time. Please plan accordingly.',
    timestamp: '2024-01-13T10:00:00Z',
    priority: 'low',
    category: 'system',
    status: 'read',
    starred: false,
    archived: true
  }
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showCompose, setShowCompose] = useState(false)

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || message.category === filterCategory
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && !message.archived
  })

  const unreadCount = messages.filter(m => m.status === 'unread' && !m.archived).length
  const starredCount = messages.filter(m => m.starred && !m.archived).length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient-update': return <User className="h-4 w-4" />
      case 'protocol-alert': return <AlertCircle className="h-4 w-4" />
      case 'system': return <FileText className="h-4 w-4" />
      case 'team': return <Users className="h-4 w-4" />
      case 'appointment': return <Calendar className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ))
  }

  const toggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ))
  }

  const archiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, archived: true } : msg
    ))
    setSelectedMessage(null)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg overflow-hidden border border-gray-200">
          {/* Messages Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <Button
                  onClick={() => setShowCompose(true)}
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Compose
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{unreadCount}</div>
                  <div className="text-xs text-gray-600">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{starredCount}</div>
                  <div className="text-xs text-gray-600">Starred</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  <option value="patient-update">Patient Updates</option>
                  <option value="protocol-alert">Protocol Alerts</option>
                  <option value="team">Team Messages</option>
                  <option value="appointment">Appointments</option>
                  <option value="system">System</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (message.status === 'unread') {
                      markAsRead(message.id)
                    }
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                  } ${message.status === 'unread' ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority/Category Indicator */}
                    <div className={`p-1 rounded border ${getPriorityColor(message.priority)}`}>
                      {getCategoryIcon(message.category)}
                    </div>

                    {/* Message Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.sender.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          {message.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          {message.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                      </div>

                      <h3 className={`text-sm font-medium mb-1 truncate ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {message.subject}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.content}
                      </p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {selectedMessage.sender.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{selectedMessage.sender.name}</span>
                            <span className="text-gray-500 ml-1">({selectedMessage.sender.role})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStar(selectedMessage.id)}
                        icon={<Star className={`h-4 w-4 ${selectedMessage.starred ? 'fill-current text-yellow-500' : ''}`} />}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Reply className="h-4 w-4" />}
                      >
                        Reply
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Forward className="h-4 w-4" />}
                      >
                        Forward
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => archiveMessage(selectedMessage.id)}
                        icon={<Archive className="h-4 w-4" />}
                      >
                        Archive
                      </Button>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">To:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMessage.recipients.map((recipient, index) => (
                        <span key={recipient.id} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {recipient.name} ({recipient.role})
                          {index < selectedMessage.recipients.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  {/* Attachments */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-sm text-gray-500">{attachment.size}</p>
                            </div>
                            <Button variant="secondary" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a message</p>
                  <p className="text-sm">Choose a message from the list to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}