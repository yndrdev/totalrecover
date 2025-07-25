'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, Paperclip, Phone, Video, ChevronLeft, Heart, Activity, Calendar, Clock, User, Stethoscope, TrendingUp } from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: Date
  sender: 'patient' | 'ai'
  type?: 'text' | 'question' | 'form' | 'assessment'
}

const PostOpDemoPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Great morning, Sarah! I\'m your Recovery Assistant. You\'re now 5 days post-surgery and making excellent progress! Your knee is healing well, and I\'m here to support you through your recovery journey. How are you feeling today?',
      timestamp: new Date(Date.now() - 300000),
      sender: 'ai',
      type: 'text'
    },
    {
      id: '2',
      content: 'Good morning! I\'m feeling much better than yesterday. The pain is more manageable now, maybe a 4/10. I did my exercises this morning.',
      timestamp: new Date(Date.now() - 240000),
      sender: 'patient',
      type: 'text'
    },
    {
      id: '3',
      content: 'That\'s fantastic progress! A pain level of 4/10 is excellent for Day 5. I\'m so proud that you\'re staying consistent with your exercises - that\'s the key to a successful recovery. Let\'s track your progress today.',
      timestamp: new Date(Date.now() - 180000),
      sender: 'ai',
      type: 'text'
    }
  ])

  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    "Log my daily exercises",
    "When can I shower normally?",
    "Is my swelling normal?",
    "When can I drive again?",
    "Show me today's PT exercises"
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
      
      // Post-op specific responses
      if (currentInput.toLowerCase().includes('pain')) {
        aiResponse = 'Your pain levels are tracking well! At Day 5, most patients experience pain in the 3-6 range. Continue taking your prescribed medications as directed, and remember that ice can help reduce both pain and swelling. You\'re doing great!'
      } else if (currentInput.toLowerCase().includes('exercise') || currentInput.toLowerCase().includes('physical therapy')) {
        aiResponse = 'Excellent dedication to your recovery! For Day 5, focus on: ankle pumps (10 reps every hour), heel slides (10 reps, 3 times daily), and gentle quad sets. Remember to ice afterward. Your consistency with exercises is key to regaining strength and mobility.'
      } else if (currentInput.toLowerCase().includes('shower') || currentInput.toLowerCase().includes('bath')) {
        aiResponse = 'You can shower once your incision is fully sealed, typically around Day 10-14. For now, continue with sponge baths and keep your dressing dry. Dr. Martinez will clear you for normal showering at your follow-up appointment.'
      } else if (currentInput.toLowerCase().includes('drive') || currentInput.toLowerCase().includes('driving')) {
        aiResponse = 'Most patients can return to driving when they can perform an emergency stop safely, usually 4-6 weeks post-surgery if it\'s your right knee, or 2-3 weeks if it\'s your left knee. You\'ll also need to be off narcotic pain medications. We\'ll assess this at your 2-week follow-up.'
      } else if (currentInput.toLowerCase().includes('swelling') || currentInput.toLowerCase().includes('swollen')) {
        aiResponse = 'Some swelling is completely normal and expected for several weeks after surgery. Keep your leg elevated above heart level when resting, use ice for 15-20 minutes several times daily, and wear your compression stockings. If you notice sudden increase in swelling, redness, or warmth, contact us immediately.'
      } else if (currentInput.toLowerCase().includes('sleep')) {
        aiResponse = 'Sleep can be challenging after knee surgery. Try sleeping with a pillow between your legs or under your knee for comfort. Some patients find a recliner helpful for the first week. Take your pain medication before bed, and don\'t hesitate to adjust positions as needed during the night.'
      } else {
        // Default encouraging response
        aiResponse = 'Thank you for sharing that with me. Your recovery is progressing well, and I\'m here to support you every step of the way. Remember, healing takes time, and every day you\'re getting stronger. Is there anything specific about your recovery that concerns you?'
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
                <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                  SJ
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-gray-900">Sarah Johnson</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Day +5 (Post-Op)
                  </Badge>
                  <span>•</span>
                  <span>Recovery Progress: Excellent</span>
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
          {/* Left Sidebar - Recovery Progress */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Recovery Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Surgery Date:</span>
                  <span className="font-medium">March 10, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Post-Op:</span>
                  <span className="font-medium text-green-600">5 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Appointment:</span>
                  <span className="font-medium">March 24, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Progress:</span>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Daily Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pain Level:</span>
                  <span className="font-medium text-green-600">4/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Swelling:</span>
                  <span className="font-medium text-yellow-600">Mild</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobility:</span>
                  <span className="font-medium text-green-600">Improving</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sleep Quality:</span>
                  <span className="font-medium">Fair</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Today's Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Morning Exercises:</span>
                  <Badge className="bg-green-100 text-green-700">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Afternoon Walk:</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Evening Exercises:</span>
                  <Badge className="bg-gray-100 text-gray-700">Scheduled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ice Therapy:</span>
                  <Badge className="bg-blue-100 text-blue-700">2/4 Complete</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Care Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Surgeon:</span>
                  <span className="font-medium">Dr. Sarah Martinez</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Physical Therapist:</span>
                  <span className="font-medium">Mike Thompson</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nurse:</span>
                  <span className="font-medium">Jessica Chen</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Case Manager:</span>
                  <span className="font-medium">Lisa Rodriguez</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b bg-green-50">
                <CardTitle className="flex items-center text-lg">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  Recovery Assistant Chat
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Track your progress, ask questions, and get personalized recovery guidance
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
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'patient' ? 'text-green-200' : 'text-gray-500'
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
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
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
                    placeholder="How are you feeling today? Ask about exercises, pain, or recovery..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isLoading}
                    className="bg-green-600 hover:bg-green-700"
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

export default PostOpDemoPage