'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProtocolDrivenChat } from './ProtocolDrivenChat'
import {
  Send,
  Mic,
  MessageSquare,
  Home,
  Stethoscope
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { demoPatients } from '@/lib/data/demo-healthcare-data'
import { WeekViewTimeline } from '@/components/patient/WeekViewTimeline'

interface SimplePatientChatProps {
  patientId: string
  isProvider?: boolean
}

type Message = {
  id: string
  content: string
  sender_id: string
  sender_type: 'patient' | 'provider' | 'ai'
  created_at: string
  sender?: {
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

export default function SimplePatientChat({
  patientId,
  isProvider = true
}: SimplePatientChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Get patient data
  const patient = demoPatients.find(p => p.id === patientId)

  // Calculate current recovery day
  const calculateRecoveryDay = () => {
    if (!patient?.surgery_date) return 0
    const surgery = new Date(patient.surgery_date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - surgery.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const currentDay = calculateRecoveryDay()
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [dayStatuses] = useState(new Map<number, any>())
  const [activeFilters, setActiveFilters] = useState({
    missedTasks: false,
    completedTasks: false
  })

  // Load demo messages for the selected day
  useEffect(() => {
    // Demo messages based on recovery day
    const demoMessages: Message[] = []
    
    if (selectedDay === currentDay) {
      // Today's messages
      demoMessages.push(
        {
          id: '1',
          content: 'Good morning! How are you feeling today?',
          sender_id: 'ai-assistant',
          sender_type: 'ai',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          content: 'I\'m doing okay, but my knee is a bit sore this morning.',
          sender_id: patient?.id || 'patient-1',
          sender_type: 'patient',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          sender: {
            first_name: patient?.first_name,
            last_name: patient?.last_name
          }
        },
        {
          id: '3',
          content: 'That\'s normal for day ' + currentDay + ' of recovery. Have you taken your prescribed pain medication?',
          sender_id: 'ai-assistant',
          sender_type: 'ai',
          created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          content: 'Yes, I took it about an hour ago.',
          sender_id: patient?.id || 'patient-1',
          sender_type: 'patient',
          created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          sender: {
            first_name: patient?.first_name,
            last_name: patient?.last_name
          }
        },
        {
          id: '5',
          content: 'Great! Remember to complete your physical therapy exercises today. They\'re important for your recovery.',
          sender_id: 'ai-assistant',
          sender_type: 'ai',
          created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      )
    } else if (selectedDay < currentDay) {
      // Historical messages
      demoMessages.push(
        {
          id: '1',
          content: `This is the chat history from day ${selectedDay}.`,
          sender_id: 'ai-assistant',
          sender_type: 'ai',
          created_at: new Date(Date.now() - (currentDay - selectedDay) * 24 * 60 * 60 * 1000).toISOString()
        }
      )
    }
    
    setMessages(demoMessages)
  }, [selectedDay, currentDay, patient])

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    setIsSending(true)
    const messageText = inputMessage
    setInputMessage('')

    try {
      // Add provider message
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageText,
        sender_id: 'provider-1',
        sender_type: 'provider',
        created_at: new Date().toISOString(),
        sender: {
          first_name: 'Dr.',
          last_name: 'Smith'
        }
      }
      
      setMessages(prev => [...prev, newMessage])
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'I\'ve notified the patient about your message. They will receive it in their recovery app.',
          sender_id: 'ai-assistant',
          sender_type: 'ai',
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
      
    } catch (error) {
      console.error('Error sending message:', error)
      setInputMessage(messageText)
    } finally {
      setIsSending(false)
    }
  }

  // Navigate to day
  const navigateToDay = (day: number) => {
    setSelectedDay(day)
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (!patient) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Unable to load patient data</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full flex bg-white">
      {/* Sidebar with Timeline */}
      <WeekViewTimeline
        surgeryDate={patient.surgery_date}
        currentDay={currentDay}
        selectedDay={selectedDay}
        dayStatuses={dayStatuses}
        activeFilters={activeFilters}
        onDaySelect={navigateToDay}
        onFilterToggle={(filter) => {
          setActiveFilters(prev => ({
            ...prev,
            [filter]: !prev[filter]
          }))
        }}
        subtitle={patient.surgery_type + ' Recovery'}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-[800px] mx-auto w-full">
        {/* Chat Header */}
        <div className="border-b p-4 bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">
                  {selectedDay === currentDay ? 'Recovery Assistant' : `Day ${selectedDay} Chat`}
                </h2>
                <p className="text-sm text-gray-300">
                  {patient.first_name} {patient.last_name} • Day {currentDay} Recovery
                </p>
              </div>
            </div>
            {selectedDay !== currentDay && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateToDay(currentDay)}
              >
                <Home className="h-4 w-4 mr-1" />
                Return to Today
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No messages for Day {selectedDay}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isAI = message.sender_type === 'ai'
                const isProvider = message.sender_type === 'provider'
                const isPatient = message.sender_type === 'patient'

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isProvider && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      {isAI ? (
                        <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <>
                          <AvatarImage src={undefined} />
                          <AvatarFallback>
                            {message.sender?.first_name?.[0]}
                            {message.sender?.last_name?.[0]}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={cn(
                      "max-w-[70%] space-y-1",
                      isProvider && "items-end"
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2",
                        isProvider ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 px-1">
                        {formatTime(new Date(message.created_at))}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Protocol-Driven Chat Integration */}
        {selectedDay === currentDay && patient.surgery_date && (
          <div className="border-t bg-gray-50">
            <ProtocolDrivenChat
              patientId={patientId}
              surgeryDate={patient.surgery_date}
              currentDay={currentDay}
              onSendMessage={(message) => {
                setInputMessage(message)
                sendMessage()
              }}
              onTaskAction={(task, action) => {
                console.log('Task action:', task, action)
              }}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={
                selectedDay !== currentDay 
                  ? "You can only send messages in today's chat" 
                  : "Type a message to your patient..."
              }
              disabled={isSending || selectedDay !== currentDay}
              className="flex-1"
            />
            <Button
              size="md"
              variant="secondary"
              onClick={() => setIsRecording(!isRecording)}
              disabled={selectedDay !== currentDay}
              className={cn(
                "transition-colors",
                isRecording && "bg-red-500 text-white hover:bg-red-600"
              )}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending || selectedDay !== currentDay}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}