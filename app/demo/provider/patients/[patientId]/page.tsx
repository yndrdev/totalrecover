'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List
} from 'lucide-react'

// Mock data for demo
const mockPatient = {
  name: 'Sarah Johnson',
  recoveryDay: 5,
  protocol: 'Total Knee Replacement Recovery',
  totalTasks: 55
}

const mockMessages = [
  {
    id: 1,
    sender: 'Nickola Peever',
    role: 'Provider',
    message: 'Sorry :( send you as soon as possible.',
    time: '05:23 PM',
    isProvider: true
  },
  {
    id: 2,
    sender: 'Sarah Johnson',
    role: 'Patient',
    message: 'I know how important this file is to you. You can trust me ;) I know how important this file is to you. You can trust me ;) know how important this file is to you. You can trust me ;)',
    time: '05:23 PM',
    isProvider: false
  },
  {
    id: 3,
    sender: 'Sarah Johnson',
    role: 'Patient',
    message: 'I know how important this file is to you. You can trust me ;) me ;)',
    time: '05:23 PM',
    isProvider: false,
    attachments: ['/placeholder-image-1.jpg', '/placeholder-image-2.jpg']
  }
]

const mockProgress = {
  exerciseCompletion: 85,
  painLevel: 3.2,
  painTrend: -1.5,
  streakDays: 7,
  totalDays: 15,
  overallCompliance: 92
}

const mockMilestones = [
  { name: 'Full Weight Bearing', status: 'completed', achievedDay: 14 },
  { name: '90° Knee Flexion', status: 'in-progress', current: 75, target: 90 },
  { name: 'Walk Without Assistance', status: 'pending', targetDay: 30 }
]

export default function DemoPatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('timeline')
  const [newMessage, setNewMessage] = useState('')
  const [currentWeek, setCurrentWeek] = useState(1)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const getWeekDays = (week: number) => {
    const startDay = (week - 1) * 7 - 45
    return Array.from({ length: 7 }, (_, i) => ({
      day: startDay + i,
      phase: startDay + i < 0 ? 'Pre-Op' : 'Post-Op',
      tasks: [
        'Welcome to TJV',
        'Initial Health Assess',
        'Welcome from Your'
      ]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/demo/provider-dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#002238]">
                {mockPatient.name}
              </h1>
              <p className="text-sm text-gray-600">Day {mockPatient.recoveryDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white border">
            <TabsTrigger 
              value="timeline" 
              className="flex-1 data-[state=active]:bg-[#006DB1] data-[state=active]:text-white"
            >
              Recovery Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              className="flex-1 data-[state=active]:bg-[#006DB1] data-[state=active]:text-white"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="progress"
              className="flex-1 data-[state=active]:bg-[#006DB1] data-[state=active]:text-white"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger 
              value="info"
              className="flex-1 data-[state=active]:bg-[#006DB1] data-[state=active]:text-white"
            >
              Patient Information
            </TabsTrigger>
          </TabsList>

          {/* Recovery Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-white border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-[#002238]">
                      Recovery Timeline
                    </h2>
                    <Badge className="bg-[#C8DBE9] text-[#002238]">
                      {mockPatient.totalTasks} tasks configured
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setViewMode('calendar')}
                    >
                      <CalendarDays className="h-4 w-4 mr-1" />
                      Calendar View
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4 mr-1" />
                      List View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-[#006DB1] hover:bg-[#005a91]"
                    >
                      Edit Protocol
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                    disabled={currentWeek === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Week
                  </Button>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-[#002238]">
                      Week {currentWeek} of 36
                    </h3>
                    <p className="text-sm text-gray-600">
                      Day {(currentWeek - 1) * 7 - 45} to Day {currentWeek * 7 - 39}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.min(36, currentWeek + 1))}
                    disabled={currentWeek === 36}
                  >
                    Next Week
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-7 gap-4">
                  {getWeekDays(currentWeek).map((dayData, index) => {
                    const isToday = dayData.day === mockPatient.recoveryDay
                    const isPast = dayData.day < mockPatient.recoveryDay
                    
                    return (
                      <div
                        key={dayData.day}
                        className={`
                          border-2 rounded-lg p-4 min-h-[200px]
                          ${isToday ? 'border-[#006DB1] bg-[#C8DBE9]/10' : 'border-gray-200'}
                          ${isPast ? 'bg-gray-50' : 'bg-white'}
                        `}
                      >
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-500">
                            {dayData.phase} {Math.abs(dayData.day)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Enrollment Phase
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-sm text-[#002238]">
                            Day {dayData.day}
                          </div>
                          <div className="space-y-1">
                            {dayData.tasks.map((task, i) => (
                              <div 
                                key={i}
                                className="text-xs text-gray-600 truncate"
                              >
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {isPast && (
                          <div className="mt-2 flex justify-end">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <Card className="border-0 shadow-sm h-[600px] flex flex-col">
              <CardHeader className="bg-white border-b">
                <h2 className="text-xl font-semibold text-[#002238]">Messages</h2>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {mockMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isProvider ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[60%] ${message.isProvider ? 'order-2' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-400">
                              {message.role === 'Patient' ? 'Online' : ''}
                            </span>
                          </div>
                          <div
                            className={`
                              rounded-lg p-4
                              ${message.isProvider 
                                ? 'bg-gray-100 text-gray-900' 
                                : 'bg-white border border-gray-200 text-gray-900'
                              }
                            `}
                          >
                            <p className="text-sm">{message.message}</p>
                            {message.attachments && (
                              <div className="mt-3 flex gap-2">
                                {message.attachments.map((_, idx) => (
                                  <div key={idx} className="w-20 h-20 bg-gray-300 rounded" />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 text-right">
                            {message.time} <Check className="inline h-3 w-3 ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4 bg-white">
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="secondary" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="secondary" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="sm"
                      className="bg-[#006DB1] hover:bg-[#005a91]"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#002238]">Progress</h2>
              
              {/* Progress Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm text-gray-600">Subscriptions</h3>
                        <div className="text-3xl font-bold text-[#002238] mt-1">+4850</div>
                        <div className="text-sm text-green-600">+180.1% from last month</div>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 h-20">
                      {[240, 300, 200, 278, 189, 239, 278, 189].map((height, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-[#002238] rounded-t"
                          style={{ height: `${height/3}%` }}
                        >
                          <div className="text-xs text-white text-center pt-1">
                            {height}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm text-gray-600">Total Revenue</h3>
                        <div className="text-3xl font-bold text-[#002238] mt-1">$15,231.89</div>
                        <div className="text-sm text-green-600">+20.1% from last month</div>
                      </div>
                    </div>
                    <div className="h-20">
                      <svg className="w-full h-full" viewBox="0 0 200 80">
                        <path
                          d="M0,40 L40,30 L80,35 L120,25 L160,35 L200,30"
                          fill="none"
                          stroke="#006DB1"
                          strokeWidth="2"
                        />
                        <circle cx="0" cy="40" r="3" fill="#006DB1" />
                        <circle cx="40" cy="30" r="3" fill="#006DB1" />
                        <circle cx="80" cy="35" r="3" fill="#006DB1" />
                        <circle cx="120" cy="25" r="3" fill="#006DB1" />
                        <circle cx="160" cy="35" r="3" fill="#006DB1" />
                        <circle cx="200" cy="30" r="3" fill="#006DB1" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600">
                  Please show relevant progress milestones, pain thresholds, mobility, and streaks on their targets.
                </p>
                <p className="text-gray-600 mt-2">
                  Use cards like this, use our brand colors as well.
                </p>
              </div>

              {/* Milestones */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[#002238]">Recovery Milestones</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMilestones.map((milestone, i) => (
                      <div 
                        key={i}
                        className={`
                          p-4 rounded-lg border
                          ${milestone.status === 'completed' ? 'bg-green-50 border-green-200' : 
                            milestone.status === 'in-progress' ? 'bg-[#C8DBE9]/20 border-[#006DB1]' :
                            'bg-gray-50 border-gray-200'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[#002238]">{milestone.name}</div>
                            <div className="text-sm text-gray-600">
                              {milestone.status === 'completed' && `Achieved on Day ${milestone.achievedDay}`}
                              {milestone.status === 'in-progress' && `In Progress - Currently at ${milestone.current}°`}
                              {milestone.status === 'pending' && `Target: Day ${milestone.targetDay}`}
                            </div>
                          </div>
                          <div>
                            {milestone.status === 'completed' && <Check className="h-6 w-6 text-green-600" />}
                            {milestone.status === 'in-progress' && (
                              <div className="text-[#006DB1] font-medium">
                                {Math.round((milestone.current! / milestone.target!) * 100)}%
                              </div>
                            )}
                            {milestone.status === 'pending' && <div className="text-gray-400">Pending</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Streaks */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[#002238]">Compliance Streaks</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#C8DBE9]/20 rounded-lg">
                      <div className="text-2xl font-bold text-[#006DB1]">{mockProgress.streakDays}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <div className="text-center p-4 bg-[#C8DBE9]/20 rounded-lg">
                      <div className="text-2xl font-bold text-[#006DB1]">{mockProgress.totalDays}</div>
                      <div className="text-sm text-gray-600">Total Days</div>
                    </div>
                    <div className="text-center p-4 bg-[#C8DBE9]/20 rounded-lg">
                      <div className="text-2xl font-bold text-[#006DB1]">{mockProgress.overallCompliance}%</div>
                      <div className="text-sm text-gray-600">Overall</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patient Information Tab */}
          <TabsContent value="info" className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    This will be patient information like day of birth, surgery date, caretaker, forms that they fill it out.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Relevant patient care.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}