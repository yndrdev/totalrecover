'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Plus,
  Paperclip,
  Smile,
  Calendar,
  FileText,
  Camera,
  X
} from 'lucide-react'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'protocol-share'
  status: 'sent' | 'delivered' | 'read'
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: string
    url?: string
  }>
}

interface ChatRoom {
  id: string
  name: string
  type: 'patient' | 'group' | 'staff'
  participants: Array<{
    id: string
    name: string
    role: string
    avatar?: string
    status: 'online' | 'offline' | 'away'
  }>
  lastMessage?: ChatMessage
  unreadCount: number
  pinned: boolean
}

const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'Sarah Johnson - Hip Replacement',
    type: 'patient',
    participants: [
      { id: 'patient-1', name: 'Sarah Johnson', role: 'Patient', status: 'online' },
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon', status: 'online' },
      { id: 'nurse-1', name: 'Jessica Chen', role: 'Nurse', status: 'away' }
    ],
    lastMessage: {
      id: 'msg-1',
      senderId: 'patient-1',
      senderName: 'Sarah Johnson',
      senderRole: 'Patient',
      content: 'My pain level is at 3/10 today, much better than yesterday!',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 2,
    pinned: true
  },
  {
    id: '2',
    name: 'Michael Davis - Knee Recovery',
    type: 'patient',
    participants: [
      { id: 'patient-2', name: 'Michael Davis', role: 'Patient', status: 'offline' },
      { id: 'pt-1', name: 'Dr. Thompson', role: 'Physical Therapist', status: 'online' }
    ],
    lastMessage: {
      id: 'msg-2',
      senderId: 'pt-1',
      senderName: 'Dr. Thompson',
      senderRole: 'Physical Therapist',
      content: 'Great progress on your exercises! Keep up the good work.',
      timestamp: '2024-01-15T10:15:00Z',
      type: 'text',
      status: 'delivered'
    },
    unreadCount: 0,
    pinned: false
  },
  {
    id: '3',
    name: 'Team Discussion',
    type: 'group',
    participants: [
      { id: 'surgeon-1', name: 'Dr. Martinez', role: 'Surgeon', status: 'online' },
      { id: 'nurse-1', name: 'Jessica Chen', role: 'Nurse', status: 'away' },
      { id: 'pt-1', name: 'Dr. Thompson', role: 'Physical Therapist', status: 'online' },
      { id: 'admin-1', name: 'Dr. Kim', role: 'Practice Admin', status: 'offline' }
    ],
    lastMessage: {
      id: 'msg-3',
      senderId: 'nurse-1',
      senderName: 'Jessica Chen',
      senderRole: 'Nurse',
      content: 'Updated protocol templates are ready for review',
      timestamp: '2024-01-15T09:45:00Z',
      type: 'text',
      status: 'read'
    },
    unreadCount: 1,
    pinned: false
  }
]

const mockMessages: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'msg-1-1',
      senderId: 'surgeon-1',
      senderName: 'Dr. Martinez',
      senderRole: 'Surgeon',
      content: 'Good morning Sarah! How are you feeling today?',
      timestamp: '2024-01-15T09:00:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg-1-2',
      senderId: 'patient-1',
      senderName: 'Sarah Johnson',
      senderRole: 'Patient',
      content: 'Much better, thank you! The swelling has gone down significantly.',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: 'msg-1-3',
      senderId: 'nurse-1',
      senderName: 'Jessica Chen',
      senderRole: 'Nurse',
      content: 'That\'s wonderful to hear! Let me share your updated protocol timeline.',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'protocol-share',
      status: 'read'
    },
    {
      id: 'msg-1-4',
      senderId: 'patient-1',
      senderName: 'Sarah Johnson',
      senderRole: 'Patient',
      content: 'My pain level is at 3/10 today, much better than yesterday!',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text',
      status: 'read'
    }
  ]
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms)
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(chatRooms[0])
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages['1'] || [])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room)
    setMessages(mockMessages[room.id] || [])
    
    // Mark as read
    setChatRooms(prev => prev.map(r => 
      r.id === room.id ? { ...r, unreadCount: 0 } : r
    ))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      senderRole: 'Provider',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update last message in room
    setChatRooms(prev => prev.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, lastMessage: message }
        : room
    ))
  }

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg overflow-hidden border border-gray-200">
          {/* Chat Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => window.location.href = '/demo/test-protocol-chat'}
                icon={<MessageCircle className="h-4 w-4" />}
              >
                Test Protocol Chat
              </Button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {room.type === 'group' ? <MessageCircle className="h-5 w-5" /> : room.name.charAt(0)}
                        </span>
                      </div>
                      {room.type === 'patient' && room.participants[0] && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(room.participants[0].status)}`} />
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">{formatTime(room.lastMessage.timestamp)}</span>
                        )}
                      </div>

                      {room.lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {room.lastMessage.senderName}: {room.lastMessage.content}
                          </p>
                          <div className="flex items-center gap-2">
                            {room.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {room.unreadCount}
                              </span>
                            )}
                            {room.pinned && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Participants */}
                      <div className="flex items-center gap-1 mt-2">
                        {room.participants.slice(0, 3).map((participant, index) => (
                          <div key={participant.id} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`} />
                            <span className="text-xs text-gray-500">{participant.role}</span>
                            {index < Math.min(room.participants.length - 1, 2) && (
                              <span className="text-xs text-gray-400">•</span>
                            )}
                          </div>
                        ))}
                        {room.participants.length > 3 && (
                          <span className="text-xs text-gray-400">+{room.participants.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {selectedRoom.type === 'group' ? <MessageCircle className="h-5 w-5" /> : selectedRoom.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
                        <p className="text-sm text-gray-600">
                          {selectedRoom.participants.length} participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" icon={<Phone className="h-4 w-4" />} />
                      <Button variant="secondary" size="sm" icon={<Video className="h-4 w-4" />} />
                      <Button variant="secondary" size="sm" icon={<MoreVertical className="h-4 w-4" />} />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === 'current-user'
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

                    return (
                      <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && showAvatar && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600">
                              {message.senderName.charAt(0)}
                            </span>
                          </div>
                        )}
                        {!isCurrentUser && !showAvatar && <div className="w-8" />}

                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-first' : ''}`}>
                          {showAvatar && (
                            <div className={`text-xs text-gray-500 mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                              {message.senderName} • {message.senderRole}
                            </div>
                          )}
                          
                          {message.type === 'protocol-share' ? (
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Protocol Shared</span>
                                </div>
                                <p className="text-sm text-blue-800">Hip Replacement Recovery Timeline</p>
                                <Button variant="primary" size="sm" className="mt-2">
                                  View Protocol
                                </Button>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className={`rounded-lg px-3 py-2 ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          )}
                          
                          <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                            {isCurrentUser && (
                              <div className="text-xs">
                                {message.status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
                                {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" />}
                                {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Button variant="secondary" size="sm" icon={<Paperclip className="h-4 w-4" />} />
                        <Button variant="secondary" size="sm" icon={<Camera className="h-4 w-4" />} />
                        <Button variant="secondary" size="sm" icon={<Calendar className="h-4 w-4" />} />
                      </div>
                      <div className="relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your message..."
                          className="pr-10"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <Smile className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      icon={<Send className="h-4 w-4" />}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a patient or team chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}