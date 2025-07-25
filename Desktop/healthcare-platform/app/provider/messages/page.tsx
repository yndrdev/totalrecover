'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { providerChatService, ChatConversation, ChatMessage, TypingIndicator } from '@/lib/services/provider-chat-service'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  Search, 
  Send, 
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  Plus,
  Check,
  CheckCheck,
  ChevronLeft,
  FileText,
  Calendar,
  Activity,
  AlertCircle,
  MessageCircle,
  User,
  Clock,
  Star,
  Archive,
  Bot,
  Shield,
  Loader2,
  X,
  Image as ImageIcon,
  File
} from 'lucide-react'

export default function MessagesPage() {
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showPatientDetails, setShowPatientDetails] = useState(true)
  const [patientTasks, setPatientTasks] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (provider?.provider?.[0]?.id) {
      loadConversations()
      setupSubscriptions()
    }

    return () => {
      providerChatService.unsubscribeAll()
    }
  }, [provider])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      loadPatientTasks(selectedConversation.patient_id)
      markMessagesAsRead(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/auth/login'
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          *,
          provider:providers!providers_user_id_fkey(*)
        `)
        .eq('id', session.user.id)
        .single()

      if (error || !profile?.provider) {
        console.error('Error fetching provider profile:', error)
        window.location.href = '/dashboard'
        return
      }

      setProvider(profile)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const setupSubscriptions = () => {
    if (!provider?.provider?.[0]?.id) return

    providerChatService.subscribeToProviderConversations(
      provider.provider[0].id,
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
    if (!provider?.provider?.[0]?.id) return
    
    const data = await providerChatService.getProviderConversations(provider.provider[0].id)
    setConversations(data)
  }

  const loadMessages = async (conversationId: string) => {
    const data = await providerChatService.getConversationMessages(conversationId)
    setMessages(data)

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

  const loadPatientTasks = async (patientId: string) => {
    const { data, error } = await supabase
      .from('patient_tasks')
      .select(`
        *,
        protocol_task:protocol_tasks(*)
      `)
      .eq('patient_id', patientId)
      .eq('status', 'pending')
      .order('scheduled_date', { ascending: true })
      .limit(5)

    if (!error && data) {
      setPatientTasks(data)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    if (!provider?.id) return
    
    await providerChatService.markMessagesAsRead(conversationId, provider.id)
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    )
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending || !provider?.provider?.[0]?.id) return

    setIsSending(true)
    const message = await providerChatService.sendProviderMessage(
      selectedConversation.id,
      provider.provider[0].id,
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

    if (!isTyping && value.trim() && selectedConversation) {
      setIsTyping(true)
      providerChatService.updateTypingIndicator(selectedConversation.id, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedConversation) {
        setIsTyping(false)
        providerChatService.updateTypingIndicator(selectedConversation.id, false)
      }
    }, 2000)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files)
    }
  }

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.read_at) {
      return <CheckCheck className="h-4 w-4 shrink-0 text-[#006DB1]" />
    } else if (message.delivered_at) {
      return <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
    }
    return <Clock className="h-3 w-3 shrink-0 text-gray-300" />
  }

  const filteredConversations = conversations.filter(conv => {
    if (searchTerm && conv.patient) {
      const patientName = `${conv.patient.first_name} ${conv.patient.last_name}`.toLowerCase()
      return patientName.includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <HealthcareSidebar userRole="provider" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      
      <div className="flex-1 flex">
        {/* Chat Sidebar */}
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-96 pb-0">
          {/* Header */}
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-[data-slot=card-action]:grid-cols-[1fr_auto]">
            <div className="text-lg font-semibold text-[#002238]">Messages</div>
            <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
              <Button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground size-9 rounded-full"
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-muted-foreground text-sm relative col-span-2 mt-4 flex w-full items-center">
              <Search className="text-muted-foreground absolute start-4 size-4" />
              <Input
                placeholder="Messages search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10 border-gray-300 focus:border-[#006DB1] focus:ring-[#006DB1]"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="flex-1 overflow-auto p-0">
            <div className="block min-w-0 divide-y">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id
                const typingStatus = getConversationTypingIndicator(conversation.id)
                const isOnline = false // Would need to implement online status tracking
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 px-6 py-4 ${
                      isSelected ? 'bg-[#C8DBE9]/20' : ''
                    }`}
                  >
                    {isOnline && (
                      <div className="size-2 rounded-full bg-green-400 mr-2"></div>
                    )}
                    
                    <div className="min-w-0 grow">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-[#002238]">
                          {conversation.patient?.first_name} {conversation.patient?.last_name}
                        </span>
                        <span className="text-muted-foreground flex-none text-xs">
                          {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typingStatus ? (
                          <span className="text-muted-foreground truncate text-start text-sm italic">
                            {typingStatus}
                          </span>
                        ) : (
                          <span className="text-muted-foreground truncate text-start text-sm">
                            {conversation.patient?.medical_record_number} • {conversation.type.replace(/_/g, ' ')}
                          </span>
                        )}
                        {(conversation.unread_count || 0) > 0 && (
                          <div className="ms-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#006DB1] text-sm text-white">
                            {conversation.unread_count}
                          </div>
                        )}
                        {(conversation.urgent_count || 0) > 0 && (
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute end-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-50% px-4 opacity-0 group-hover/item:opacity-100 from-muted">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="size-9 rounded-full"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex">
          {selectedConversation ? (
            <>
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-sm font-medium text-[#002238]">
                          {selectedConversation.patient?.first_name} {selectedConversation.patient?.last_name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          MRN: {selectedConversation.patient?.medical_record_number} • {selectedConversation.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#006DB1] hover:bg-[#C8DBE9]/20"
                        onClick={() => setShowPatientDetails(!showPatientDetails)}
                      >
                        {showPatientDetails ? 'Hide' : 'Show'} Details
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#006DB1] hover:bg-[#C8DBE9]/20">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#006DB1] hover:bg-[#C8DBE9]/20">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-[#006DB1] hover:bg-[#C8DBE9]/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
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
                          
                          <div className={`flex ${isProvider ? 'justify-end' : 'justify-start'} group`}>
                            {!isProvider && (
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3",
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
                                "rounded-2xl px-3 py-2 text-sm",
                                isProvider
                                  ? "bg-[#006DB1] text-white"
                                  : isPatient
                                  ? "bg-[#C8DBE9]/30 text-[#002238]"
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
                                
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                
                                <div className={cn(
                                  "flex items-center gap-2 mt-1",
                                  isProvider ? "justify-end" : ""
                                )}>
                                  <span className={cn(
                                    "text-xs",
                                    isProvider ? "text-white/70" : "text-muted-foreground"
                                  )}>
                                    {format(new Date(message.created_at), 'h:mm a')}
                                  </span>
                                  {isProvider && getMessageStatusIcon(message)}
                                </div>
                              </div>
                            </div>
                            
                            {isProvider && (
                              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 ml-3">
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
                          <div className="bg-[#C8DBE9]/30 rounded-2xl px-3 py-2">
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
                </ScrollArea>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#006DB1] hover:bg-[#C8DBE9]/20"
                      onClick={handleFileUpload}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Enter message..."
                        value={messageInput}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="pr-12 border-gray-300 focus:border-[#006DB1] focus:ring-[#006DB1] text-sm resize-none"
                        rows={1}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#006DB1] hover:bg-[#C8DBE9]/20"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isSending}
                      className="bg-[#006DB1] hover:bg-[#002238] text-white"
                      size="sm"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Patient Details Sidebar */}
              {showPatientDetails && selectedConversation && (
                <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                  <h3 className="font-semibold text-[#002238] mb-4">Patient Information</h3>
                  
                  {selectedConversation.patient && (
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">MRN:</span>
                            <span>{selectedConversation.patient.medical_record_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Surgery:</span>
                            <span>{selectedConversation.patient.surgery_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Surgery Date:</span>
                            <span>{format(new Date(selectedConversation.patient.surgery_date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recovery Day:</span>
                            <span>
                              Day {Math.floor((Date.now() - new Date(selectedConversation.patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Current Tasks */}
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          {patientTasks.length > 0 ? (
                            patientTasks.map((task) => (
                              <div key={task.id} className="flex items-start gap-2 text-sm">
                                <div className="mt-0.5">
                                  {task.protocol_task?.task_type === 'exercise' && <Activity className="h-4 w-4 text-blue-500" />}
                                  {task.protocol_task?.task_type === 'form' && <FileText className="h-4 w-4 text-green-500" />}
                                  {task.protocol_task?.task_type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{task.protocol_task?.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Due: {format(new Date(task.scheduled_date), 'MMM d')}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.location.href = `/provider/patients/${selectedConversation.patient_id}`}
                          >
                            <User className="h-4 w-4 mr-2" />
                            View Full Profile
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Appointment
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            View Medical Records
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#C8DBE9]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-[#006DB1]" />
                </div>
                <h3 className="text-sm font-medium text-[#002238] mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground text-xs">
                  Choose a patient to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}