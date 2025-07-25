'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bot,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react'
import { AIForm, FormField, ChatMessage, FormResponse } from '@/types/forms'

interface AIFormChatProps {
  form: AIForm
  patientId: string
  onFormComplete: (responses: FormResponse[]) => void
  onFormClose: () => void
}

interface ChatUIMessage {
  id: string
  type: 'ai' | 'patient' | 'system'
  content: string
  timestamp: Date
  relatedField?: FormField
  isTyping?: boolean
  options?: string[]
  inputType?: 'text' | 'number' | 'date' | 'select' | 'textarea'
  validation?: {
    isValid: boolean
    message?: string
  }
}

export default function AIFormChat({ form, patientId, onFormComplete, onFormClose }: AIFormChatProps) {
  const [messages, setMessages] = useState<ChatUIMessage[]>([])
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [responses, setResponses] = useState<Map<string, FormResponse>>(new Map())
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentField = form.fields[currentFieldIndex] || null
  const completionPercentage = Math.round((responses.size / form.fields.length) * 100)

  // Initialize conversation
  useEffect(() => {
    if (form.conversation_flow?.introduction) {
      setTimeout(() => {
        addAIMessage(form.conversation_flow!.introduction)
        setTimeout(() => {
          startNextQuestion()
        }, 1500)
      }, 1000)
    }
  }, [form])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when new question appears
  useEffect(() => {
    if (inputRef.current && !isProcessing && !isComplete) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [currentFieldIndex, isProcessing, isComplete])

  const addAIMessage = (content: string, relatedField?: FormField, options?: string[]) => {
    const newMessage: ChatUIMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      relatedField,
      options,
      inputType: relatedField?.type as any
    }

    // Add typing indicator first
    setMessages(prev => [...prev, { ...newMessage, isTyping: true }])
    
    // Replace with actual message after typing simulation
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...newMessage, isTyping: false } : msg
      ))
    }, 1200)
  }

  const addPatientMessage = (content: string, validation?: { isValid: boolean; message?: string }) => {
    const newMessage: ChatUIMessage = {
      id: Date.now().toString(),
      type: 'patient',
      content,
      timestamp: new Date(),
      validation
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addSystemMessage = (content: string) => {
    const newMessage: ChatUIMessage = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const startNextQuestion = () => {
    if (currentFieldIndex >= form.fields.length) {
      completeForm()
      return
    }

    const field = form.fields[currentFieldIndex]
    const prompt = field.conversational_prompt || `Please provide your ${field.label.toLowerCase()}.`
    
    setTimeout(() => {
      addAIMessage(prompt, field, field.options)
    }, 800)
  }

  const validateResponse = (field: FormField, value: string): { isValid: boolean; message?: string } => {
    if (field.required && (!value || value.trim() === '')) {
      return { isValid: false, message: 'This field is required.' }
    }

    if (field.type === 'number') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid number.' }
      }
      if (field.validation_rules?.min !== undefined && numValue < field.validation_rules.min) {
        return { isValid: false, message: `Value must be at least ${field.validation_rules.min}.` }
      }
      if (field.validation_rules?.max !== undefined && numValue > field.validation_rules.max) {
        return { isValid: false, message: `Value must be at most ${field.validation_rules.max}.` }
      }
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { isValid: false, message: 'Please enter a valid email address.' }
      }
    }

    if (field.type === 'phone') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(value.replace(/\D/g, ''))) {
        return { isValid: false, message: 'Please enter a valid phone number.' }
      }
    }

    return { isValid: true }
  }

  const handleSubmitResponse = async () => {
    if (!currentField || !inputValue.trim()) return

    setIsProcessing(true)
    
    // Validate response
    const validation = validateResponse(currentField, inputValue)
    
    // Add patient message
    addPatientMessage(inputValue, validation)
    
    if (!validation.isValid) {
      setTimeout(() => {
        addAIMessage(validation.message || 'Please try again.', currentField)
        setIsProcessing(false)
      }, 1000)
      return
    }

    // Store response
    const response: FormResponse = {
      id: Date.now().toString(),
      form_assignment_id: '', // Would be set in real implementation
      form_field_id: currentField.id,
      patient_id: patientId,
      response_value: inputValue,
      response_type: currentField.type,
      confidence_score: 1.0,
      needs_clarification: false,
      response_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setResponses(prev => new Map(prev).set(currentField.id, response))
    setInputValue('')

    // AI acknowledgment
    setTimeout(() => {
      const acknowledgments = [
        'Thank you!',
        'Got it.',
        'Perfect.',
        'Thanks for that information.',
        'Understood.'
      ]
      const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)]
      addAIMessage(ack)
      
      // Move to next question
      setTimeout(() => {
        setCurrentFieldIndex(prev => prev + 1)
        setIsProcessing(false)
        startNextQuestion()
      }, 1000)
    }, 800)
  }

  const handleOptionSelect = (option: string) => {
    setInputValue(option)
    setTimeout(() => handleSubmitResponse(), 100)
  }

  const completeForm = () => {
    setIsComplete(true)
    
    if (form.conversation_flow?.completion_message) {
      setTimeout(() => {
        addAIMessage(form.conversation_flow!.completion_message)
        addSystemMessage('Form completed! Your responses have been saved.')
        
        // Call completion callback
        setTimeout(() => {
          onFormComplete(Array.from(responses.values()))
        }, 2000)
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isProcessing && inputValue.trim()) {
        handleSubmitResponse()
      }
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-100">
              <AvatarFallback>
                <Bot className="h-5 w-5 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{form.title}</h3>
              <p className="text-sm text-gray-600">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{form.estimated_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={completionPercentage} className="w-24 h-2" />
              <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onFormClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <Avatar className="h-8 w-8 bg-blue-100">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[70%] ${message.type === 'patient' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">
                    {message.type === 'ai' ? 'AI Assistant' : 'You'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {message.type === 'system' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-800">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.type === 'patient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-gray-600">AI is typing...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Validation Error */}
                        {message.validation && !message.validation.isValid && (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-xs text-red-600">{message.validation.message}</p>
                          </div>
                        )}

                        {/* Quick Options for Select Fields */}
                        {message.type === 'ai' && message.options && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.options.map((option, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleOptionSelect(option)}
                                disabled={isProcessing}
                                className="text-xs"
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Field Information */}
                        {message.relatedField && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {message.relatedField.type}
                            </Badge>
                            {message.relatedField.required && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                Required
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {message.type === 'patient' && (
                <Avatar className="h-8 w-8 bg-gray-100">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      {!isComplete && currentField && (
        <div className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {currentField.type === 'textarea' ? (
                <Textarea
                  ref={inputRef as any}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  disabled={isProcessing}
                  className="resize-none"
                  rows={3}
                />
              ) : currentField.type === 'date' ? (
                <Input
                  ref={inputRef}
                  type="date"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
              ) : currentField.type === 'number' ? (
                <Input
                  ref={inputRef}
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a number..."
                  disabled={isProcessing}
                  min={currentField.validation_rules?.min}
                  max={currentField.validation_rules?.max}
                  className="flex-1"
                />
              ) : (
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  disabled={isProcessing}
                  className="flex-1"
                />
              )}

              <Button
                onClick={handleSubmitResponse}
                disabled={!inputValue.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Field Help Text */}
            {currentField && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Question {currentFieldIndex + 1} of {form.fields.length}</span>
                  {currentField.required && <span className="text-red-500">* Required</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Press Enter to send</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion State */}
      {isComplete && (
        <div className="bg-green-50 border-t border-green-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Form completed successfully!</span>
            <Button
              onClick={onFormClose}
              className="ml-4 bg-green-600 hover:bg-green-700 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}