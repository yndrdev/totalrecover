'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle,
  Circle,
  User,
  Bot,
  LogOut,
  FileText,
  Settings,
  ChevronDown,
  Activity,
  Target,
  Play,
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock data matching the screenshot design
const DEMO_DATA = {
  patient: {
    name: 'Sarah Johnson',
    surgery_type: 'Total Knee Replacement',
    surgery_date: '2025-01-17',
    current_day: 4
  },
  currentDayTasks: [
    { id: 1, title: 'Morning exercises, Ice therapy', completed: true, type: 'exercise' },
    { id: 2, title: 'Fill out the pre form', completed: false, type: 'form' },
    { id: 3, title: 'Watch Exercise videos', completed: false, type: 'video' },
    { id: 4, title: 'Watch Doctor Information video', completed: false, type: 'video' }
  ],
  threadDays: [
    { 
      day: 3, 
      date: 'Jan 19', 
      description: 'Morning exercises, Ice therapy', 
      status: 'completed',
      messages: [
        {
          id: 1,
          type: 'message',
          timestamp: '8:00am',
          content: "Good morning! Here are your Day 3 recovery tasks:"
        },
        {
          id: 2,
          type: 'video',
          timestamp: '8:05am',
          content: "Complete your morning exercises with this guided video:",
          video: {
            title: 'Day 3 Morning Exercises',
            duration: '2:30'
          }
        }
      ]
    },
    { 
      day: 3, 
      date: 'Jan 19', 
      description: 'Fill out pain assessment', 
      status: 'missed',
      messages: [
        {
          id: 1,
          type: 'message',
          timestamp: '2:00pm',
          content: "Time for your afternoon pain assessment:",
          form: {
            title: 'Afternoon Pain Check'
          }
        }
      ]
    },
    { 
      day: 2, 
      date: 'Jan 18', 
      description: 'Walking exercise', 
      status: 'completed',
      messages: [
        {
          id: 1,
          type: 'message',
          timestamp: '10:00am',
          content: "Great job completing your Day 2 walking exercise!"
        }
      ]
    },
    { 
      day: 2, 
      date: 'Jan 18', 
      description: 'Evening medication', 
      status: 'missed',
      messages: [
        {
          id: 1,
          type: 'message',
          timestamp: '7:00pm',
          content: "Reminder: Take your evening medication"
        }
      ]
    },
    { 
      day: 1, 
      date: 'Jan 17', 
      description: 'Initial assessment', 
      status: 'completed',
      messages: [
        {
          id: 1,
          type: 'message',
          timestamp: '9:00am',
          content: "Welcome to your recovery journey! Let's start with your initial assessment:",
          form: {
            title: 'Initial Recovery Assessment'
          }
        }
      ]
    }
  ],
  messages: [
    {
      id: 1,
      type: 'message',
      timestamp: '9:15am',
      content: "Good morning! I'm your Recovery Assistant. How are you feeling today on Day 4 of your recovery?"
    },
    {
      id: 2,
      type: 'video',
      timestamp: '9:15am', 
      content: "I noticed you have some missed tasks from previous days. Let me help you catch up! Here's an important knee bending exercise for your recovery:",
      video: {
        title: 'Post-Surgery Knee Bending Exercises',
        duration: '3:45'
      },
      taskId: 3 // Maps to "Watch Exercise videos"
    },
    {
      id: 3,
      type: 'message',
      timestamp: '9:15am',
      content: "Please also complete this pain assessment form to help your care team monitor your progress:",
      form: {
        title: 'Daily Pain Assessment'
      },
      taskId: 2 // Maps to "Fill out the pre form"
    },
    {
      id: 4,
      type: 'video',
      timestamp: '10:30am',
      content: "Here's important information from your doctor about your recovery process:",
      video: {
        title: 'Doctor Information - Recovery Guidelines',
        duration: '5:20'
      },
      taskId: 4 // Maps to "Watch Doctor Information video"
    }
  ]
}

export default function DemoPatientChatPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectedDay, setSelectedDay] = useState<typeof DEMO_DATA.threadDays[0] | null>(null)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [filterType, setFilterType] = useState<'missed' | 'completed' | null>(null) // null, 'missed', or 'completed'
  const [currentDayTasks, setCurrentDayTasks] = useState(DEMO_DATA.currentDayTasks)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    // Handle message send
    setInputValue('')
  }

  const clearFilter = () => {
    setFilterType(null)
  }

  const markTaskComplete = (taskId: number, taskType: string) => {
    setCurrentDayTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    )
  }

  const filteredThreadDays = filterType ? 
    DEMO_DATA.threadDays.filter(day => day.status === filterType) : 
    DEMO_DATA.threadDays

  // Get messages to display - either from selected day or default messages
  const displayMessages = selectedDay ? selectedDay.messages : DEMO_DATA.messages

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header for Demo Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Link href="/practice/patients/demo-patient-123/">
              <Button variant="outline" size="sm" className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                <User className="h-4 w-4 mr-2" />
                Provider View
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Home
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Patient Recovery Chat - Sarah Johnson</h1>
            <p className="text-sm text-gray-600">Day 7 • Total Knee Replacement Recovery</p>
          </div>
        </div>
      </div>
      
      <div className="flex">
      {/* Left Sidebar - Exactly as shown in screenshot */}
      <div className="w-[280px] bg-slate-800 flex flex-col">
        {/* Recovery Timeline Header - No Icon */}
        <div className="p-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-medium text-sm">Recovery Timeline</h2>
            <p className="text-blue-300 text-xs">Day {DEMO_DATA.patient.current_day}</p>
          </div>
        </div>

        {/* Missed Task / Completed Tasks Filter */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('missed')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === 'missed' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Missed Task
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === 'completed' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Completed Tasks
              </button>
            </div>
            <div className="w-6 flex justify-center">
              {filterType && (
                <button
                  onClick={clearFilter}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Clear filter"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Day Task List Preview */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-blue-400 font-medium text-sm mb-3">Day {DEMO_DATA.patient.current_day}</h3>
          <div className="space-y-2">
            {currentDayTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-2 text-white">
                <div className="mt-1">
                  {task.completed ? (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <span className="text-xs text-gray-300">{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thread - Past Days */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {filteredThreadDays.map((dayItem, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(dayItem)}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-all duration-200 hover:bg-slate-700 ${
                  selectedDay === dayItem ? 'bg-slate-700' : 'bg-transparent'
                } ${
                  filterType === 'completed' && dayItem.status === 'completed' ? 'border border-green-500' : 
                  filterType === 'missed' && dayItem.status === 'missed' ? 'border border-red-500' : 
                  !filterType ? '' : ''
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">
                  Day {dayItem.day} {dayItem.date}
                </div>
                <div className="text-xs text-gray-400">
                  {dayItem.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top Right Profile */}
        <div className="absolute top-4 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{DEMO_DATA.patient.name}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>My Forms</span>
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>My Exercises</span>
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>My Progress</span>
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-20 pb-20 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {selectedDay && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="text-sm font-medium text-blue-900">
                  Viewing Day {selectedDay?.day} - {selectedDay?.date}
                </div>
                <div className="text-xs text-blue-700">
                  {selectedDay?.description} ({selectedDay?.status})
                </div>
              </div>
            )}
            {displayMessages.map((message: any) => (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-lg w-full">
                  {/* Message Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {message.type === 'message' ? 'Message Task' : 
                       message.type === 'video' ? 'Video Task' : 'Form Task'} {message.timestamp}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-900 mb-3">
                      {message.content}
                    </p>

                    {/* Video Content */}
                    {message.type === 'video' && message.video && (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="bg-black aspect-video flex items-center justify-center relative">
                          <div className="text-center text-white">
                            <div className="mb-2">
                              <Play className="h-12 w-12 mx-auto text-white" />
                            </div>
                            <div className="text-sm">Video unavailable</div>
                            <div className="text-xs text-gray-400">Playback on other websites has been disabled by the video owner</div>
                            <div className="text-xs text-blue-400 underline mt-1">Watch on YouTube</div>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <Play className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{message.video.title}</div>
                              <div className="text-xs text-gray-600">Duration: {message.video.duration}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-xs"
                              onClick={() => markTaskComplete(message.taskId, 'video')}
                            >
                              Mark as Watched
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              Add to Favorites
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Content */}
                    {message.form && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3">{message.form.title}</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Pain level (0-10)
                            </label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-blue-700">0</span>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                defaultValue="5"
                                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-sm text-blue-700">10</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-2">
                              Mobility today
                            </label>
                            <select className="w-full p-2 border border-blue-300 rounded text-sm">
                              <option>Select...</option>
                              <option>Much better</option>
                              <option>Better</option>
                              <option>Same</option>
                              <option>Worse</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                            onClick={() => markTaskComplete(message.taskId, 'form')}
                          >
                            Submit Assessment
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Input - Claude/ChatGPT Style */}
        <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Assign a task or ask anything"
                  className="resize-none border border-gray-300 focus:border-blue-600 rounded-xl bg-white"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}