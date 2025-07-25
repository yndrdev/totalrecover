'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, Paperclip, Phone, Video, ChevronLeft, Heart, Activity, Calendar, Clock, User, Stethoscope } from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: Date
  sender: 'patient' | 'ai'
  type?: 'text' | 'question' | 'form' | 'assessment'
}

const PreOpDemoPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello Sarah! I\'m your Pre-Op Assistant. I\'m here to help you prepare for your Total Knee Replacement surgery scheduled for next week. Let\'s start with some important pre-operative questions to ensure you\'re fully prepared.',
      timestamp: new Date(Date.now() - 300000),
      sender: 'ai',
      type: 'text'
    },
    {
      id: '2',
      content: 'Hi! I\'m feeling a bit nervous about the surgery. What should I expect?',
      timestamp: new Date(Date.now() - 240000),
      sender: 'patient',
      type: 'text'
    },
    {
      id: '3',
      content: 'It\'s completely normal to feel nervous - that shows you\'re taking this seriously! Let me help you prepare step by step. First, let\'s go through some important medical questions to ensure your safety.',
      timestamp: new Date(Date.now() - 180000),
      sender: 'ai',
      type: 'text'
    }
  ])

  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const preOpQuestions = [
    "Do you currently smoke or have you smoked in the past month?",
    "Do you have diabetes? If yes, what is your most recent A1C level?",
    "What medications are you currently taking? Please include all prescriptions, over-the-counter drugs, and supplements.",
    "Do you have any allergies to medications, latex, or other substances?",
    "Have you had any previous surgeries or complications with anesthesia?",
    "How would you rate your current pain level on a scale of 1-10?",
    "Do you have someone who can help you during your recovery period?",
    "Do you have reliable transportation to and from the hospital?"
  ]

  const suggestedPrompts = [
    "Tell me about the surgery procedure",
    "What should I do the night before surgery?",
    "What medications should I stop taking?",
    "How long is the recovery time?",
    "When can I return to normal activities?"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      timestamp: new Date(),
      sender: 'patient',
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = ''
      
      // Pre-op specific responses
      if (currentInput.toLowerCase().includes('nervous') || currentInput.toLowerCase().includes('scared')) {
        aiResponse = 'Your feelings are completely valid. Pre-operative anxiety is very common. Let me share some information that might help ease your concerns. Your surgical team is highly experienced, and we\'ll be with you every step of the way.'
      } else if (currentInput.toLowerCase().includes('pain')) {
        aiResponse = 'Pain management is a top priority for us. We\'ll use a combination of medications and techniques to keep you comfortable. Most patients report manageable pain levels within the first few days after surgery.'
      } else if (currentInput.toLowerCase().includes('procedure') || currentInput.toLowerCase().includes('surgery')) {
        aiResponse = 'Your Total Knee Replacement will take approximately 1-2 hours. Dr. Martinez will remove the damaged cartilage and bone, then position new metal and plastic components to restore your knee\'s function. You\'ll be under general anesthesia and won\'t feel anything during the procedure.'
      } else if (currentInput.toLowerCase().includes('recovery')) {
        aiResponse = 'Recovery typically takes 3-6 months for full healing, but you\'ll start moving the day after surgery! Most patients can walk with assistance within 24 hours and return to light activities within 2-4 weeks.'
      } else if (currentInput.toLowerCase().includes('medication')) {
        aiResponse = 'Please stop taking any blood thinners 5 days before surgery (unless otherwise directed). Continue your regular medications, but avoid NSAIDs like ibuprofen. We\'ll provide a complete list of medications to stop and continue.'
      } else {
        // Default encouraging response
        aiResponse = 'Thank you for that information. It\'s important that we have all the details to ensure your surgery goes smoothly. Is there anything else you\'d like to know about your pre-operative preparation?'
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        timestamp: new Date(),
        sender: 'ai',
        type: 'text'
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setCurrentInput(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Demo
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  SJ
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-gray-900">Sarah Johnson</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Day -7 (Pre-Op)
                  </Badge>
                  <span>•</span>
                  <span>Total Knee Replacement</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Patient Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Surgery Date:</span>
                  <span className="font-medium">March 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Procedure:</span>
                  <span className="font-medium">Total Knee Replacement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Surgeon:</span>
                  <span className="font-medium">Dr. Sarah Martinez</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="font-medium">TJV Medical Center</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Pre-Op Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Medical Clearance:</span>
                  <Badge className="bg-green-100 text-green-700">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pre-Op Instructions:</span>
                  <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lab Results:</span>
                  <Badge className="bg-green-100 text-green-700">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Insurance:</span>
                  <Badge className="bg-green-100 text-green-700">Approved</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Vital Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Pain Level:</span>
                  <span className="font-medium text-red-600">7/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobility:</span>
                  <span className="font-medium">Limited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sleep Quality:</span>
                  <span className="font-medium">Poor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anxiety Level:</span>
                  <span className="font-medium text-yellow-600">Moderate</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b bg-blue-50">
                <CardTitle className="flex items-center text-lg">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Pre-Op Assistant Chat
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Get answers about your upcoming surgery and complete pre-operative assessments
                </p>
              </CardHeader>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'patient'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'patient' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              <div className="px-4 py-2 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask any questions about your surgery preparation..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreOpDemoPage