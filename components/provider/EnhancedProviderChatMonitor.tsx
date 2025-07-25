'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { providerChatService, ChatConversation, ChatMessage, TypingIndicator } from '@/lib/services/provider-chat-service'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { StatusIndicator, RecoveryDayBadge } from '@/components/ui/design-system/StatusIndicator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { 
  MessageSquare,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  User,
  Bot,
  Zap,
  Send,
  Paperclip,
  CheckCheck,
  Check,
  MoreVertical,
  Phone,
  Video,
  UserCheck,
  Shield,
  Activity,
  X,
  Search,
  Bell,
  BellOff,
  Star
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface EnhancedProviderChatMonitorProps {
  providerId: string;
  providerName: string;
}

export default function EnhancedProviderChatMonitor({ 
  providerId, 
  providerName 
}: EnhancedProviderChatMonitorProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map())
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'normal'>('all')
  const [filterUnread, setFilterUnread] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Quick response templates
  const quickResponses = [
    "I'll review your concerns and get back to you shortly.",
    "Thank you for the update. How are you feeling now?",
    "Please continue with your current exercise routine.",
    "If symptoms persist, please schedule an appointment.",
    "Great progress! Keep up the good work.",
    "Let me check with the care team and update you."
  ]

  useEffect(() => {
    loadConversations()
    setupSubscriptions()

    return () => {
      providerChatService.unsubscribeAll()
    }
  }, [providerId])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      markMessagesAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const setupSubscriptions = () => {
    // Subscribe to provider conversations
    providerChatService.subscribeToProviderConversations(
      providerId,
      handleConversationUpdate,
      handleNewMessage,
      handleTypingUpdate
    )
  }

  const handleConversationUpdate = (conversation: ChatConversation) => {
    setConversations(prev => {
      const existing = prev.find(c => c.id === conversation.id)
      if (existing) {
        return prev.map(c => c.id === conversation.id ? conversation : c)
      }
      return [conversation, ...prev]
    })
  }

  const handleNewMessage = (message: ChatMessage) => {
    // Update conversation list
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === message.conversation_id) {
          return {
            ...conv,
            updated_at: message.created_at,
            unread_count: conv.id === selectedConversation?.id ? 0 : (conv.unread_count || 0) + 1
          }
        }
        return conv
      }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    )

    // Update messages if this conversation is selected
    if (selectedConversation?.id === message.conversation_id) {
      setMessages(prev => [...prev, message])
      markMessagesAsRead(message.conversation_id)
    }
  }

  const handleTypingUpdate = (indicator: TypingIndicator) => {
    setTypingIndicators(prev => {
      const updated = new Map(prev)
      if (indicator.is_typing) {
        updated.set(indicator.user_id, indicator)
      } else {
        updated.delete(indicator.user_id)
      }
      return updated
    })
  }

  const loadConversations = async () => {
    setIsLoading(true)
    const data = await providerChatService.getProviderConversations(providerId)
    setConversations(data)
    setIsLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    const data = await providerChatService.getConversationMessages(conversationId)
    setMessages(data)

    // Subscribe to this specific conversation
    providerChatService.subscribeToConversation(
      conversationId,
      (message) => {
        setMessages(prev => [...prev, message])
      },
      handleTypingUpdate,
      (messageId, readBy) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
          )
        )
      }
    )
  }

  const markMessagesAsRead = async (conversationId: string) => {
    const userId = providerId // This should be the actual user ID
    await providerChatService.markMessagesAsRead(conversationId, userId)
    
    // Update unread count
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    )
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    const message = await providerChatService.sendProviderMessage(
      selectedConversation.id,
      providerId,
      messageInput.trim(),
      'text',
      'normal'
    )

    if (message) {
      setMessageInput('')
      setMessages(prev => [...prev, message])
    }
    setIsSending(false)
  }

  const handleTyping = (value: string) => {
    setMessageInput(value)

    if (!isTyping && value.trim()) {
      setIsTyping(true)
      if (selectedConversation) {
        providerChatService.updateTypingIndicator(selectedConversation.id, true)
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedConversation) {
        setIsTyping(false)
        providerChatService.updateTypingIndicator(selectedConversation.id, false)
      }
    }, 2000)
  }

  const handleQuickResponse = (response: string) => {
    setMessageInput(response)
    handleSendMessage()
  }

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-blue-600" />
    } else if (message.delivered_at) {
      return <Check className="h-3 w-3 text-gray-400" />
    }
    return <Clock className="h-3 w-3 text-gray-300" />
  }

  const filteredConversations = conversations.filter(conv => {
    // Filter by search term
    if (searchTerm && conv.patient) {
      const patientName = `${conv.patient.first_name} ${conv.patient.last_name}`.toLowerCase()
      if (!patientName.includes(searchTerm.toLowerCase())) {
        return false
      }
    }

    // Filter by priority
    if (filterPriority === 'urgent') {
      return (conv.urgent_count || 0) > 0
    }

    // Filter by unread
    if (filterUnread) {
      return (conv.unread_count || 0) > 0
    }

    return true
  })

  const getConversationTypingIndicator = (conversationId: string) => {
    const typingUsers = Array.from(typingIndicators.values())
      .filter(indicator => 
        indicator.conversation_id === conversationId && 
        indicator.is_typing
      )

    if (typingUsers.length > 0) {
      return 'is typing...'
    }
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversation List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Patient Conversations</h1>
          <p className="text-sm text-gray-600">Monitoring as {providerName}</p>
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterPriority === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterPriority('all')}
            >
              All
            </Button>
            <Button
              variant={filterPriority === 'urgent' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterPriority('urgent')}
              className="flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Urgent
            </Button>
            <Button
              variant={filterUnread ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
              className="flex items-center gap-1"
            >
              <Bell className="h-3 w-3" />
              Unread
            </Button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-12 w-12 mb-2" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map(conversation => {
                const isSelected = selectedConversation?.id === conversation.id
                const typingStatus = getConversationTypingIndicator(conversation.id)
                
                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.patient?.first_name} {conversation.patient?.last_name}
                          </h3>
                          {(conversation.urgent_count || 0) > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {(conversation.unread_count || 0) > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span>MRN: {conversation.patient?.medical_record_number}</span>
                          {conversation.patient?.surgery_date && (
                            <>
                              <span>•</span>
                              <RecoveryDayBadge 
                                day={Math.floor((Date.now() - new Date(conversation.patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))} 
                                size="sm" 
                              />
                            </>
                          )}
                        </div>

                        {typingStatus ? (
                          <p className="text-sm text-blue-600 mt-2 italic">{typingStatus}</p>
                        ) : (
                          <p className="text-sm text-gray-600 mt-2 truncate">
                            Last activity {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {selectedConversation.patient?.first_name} {selectedConversation.patient?.last_name}
                  {(selectedConversation.urgent_count || 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span>MRN: {selectedConversation.patient?.medical_record_number}</span>
                  <span>•</span>
                  <span>{selectedConversation.patient?.surgery_type}</span>
                  <span>•</span>
                  <span>{selectedConversation.type.replace(/_/g, ' ')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" icon={<Phone className="h-4 w-4" />}>
                  Call
                </Button>
                <Button variant="ghost" size="sm" icon={<Video className="h-4 w-4" />}>
                  Video
                </Button>
                <Button variant="ghost" size="sm" icon={<UserCheck className="h-4 w-4" />}>
                  Assign
                </Button>
                <Button variant="ghost" size="sm" icon={<MoreVertical className="h-4 w-4" />} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isProvider = message.source === 'provider'
                const isPatient = message.source === 'patient'
                const isAI = message.source === 'ai'
                const showDate = index === 0 || 
                  new Date(messages[index - 1].created_at).toDateString() !== 
                  new Date(message.created_at).toDateString()

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                          {format(new Date(message.created_at), 'EEEE, MMMM d')}
                        </span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex gap-3",
                      isProvider ? "justify-end" : ""
                    )}>
                      {!isProvider && (
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isPatient ? "bg-gray-200" : "bg-blue-600"
                        )}>
                          {isPatient ? (
                            <User className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[70%] space-y-1",
                        isProvider ? "items-end" : ""
                      )}>
                        {!isProvider && (
                          <p className="text-xs font-medium text-gray-600">
                            {isPatient ? 'Patient' : 'AI Assistant'}
                          </p>
                        )}
                        
                        <div className={cn(
                          "rounded-lg p-3",
                          isProvider 
                            ? "bg-blue-600 text-white" 
                            : isPatient
                            ? "bg-white border border-gray-200"
                            : "bg-blue-100 text-blue-900"
                        )}>
                          {message.priority !== 'normal' && (
                            <div className={cn(
                              "flex items-center gap-1 mb-2 text-xs font-medium",
                              message.priority === 'urgent' ? "text-orange-500" : "text-red-500"
                            )}>
                              <AlertCircle className="h-3 w-3" />
                              {message.priority.toUpperCase()}
                            </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          <div className={cn(
                            "flex items-center gap-2 mt-2",
                            isProvider ? "justify-end" : ""
                          )}>
                            <span className={cn(
                              "text-xs",
                              isProvider ? "text-blue-200" : "text-gray-500"
                            )}>
                              {format(new Date(message.created_at), 'h:mm a')}
                            </span>
                            {isProvider && getMessageStatusIcon(message)}
                          </div>
                        </div>
                      </div>
                      
                      {isProvider && (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                )
              })}
              
              {/* Typing Indicators */}
              {Array.from(typingIndicators.values())
                .filter(indicator => 
                  indicator.conversation_id === selectedConversation.id && 
                  indicator.is_typing
                )
                .map(indicator => (
                  <div key={indicator.user_id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                ))}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Responses */}
          <div className="bg-white border-t border-gray-200 p-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Paperclip className="h-4 w-4" />}
              />
              <Textarea
                value={messageInput}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 resize-none"
                rows={1}
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Send className="h-4 w-4" />}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a patient conversation to view messages and respond</p>
          </div>
        </div>
      )}
    </div>
  )
}