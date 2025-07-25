"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, User, CheckCircle, Clock, AlertTriangle, Users, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system' | 'provider';
  timestamp: Date;
  buttons?: { text: string; action: string }[];
  day: number;
  providerId?: string;
  providerName?: string;
  providerRole?: string;
}

interface DayConversations {
  [key: number]: Message[];
}

interface Provider {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  specialty?: string;
}

interface PatientProfile {
  name: string;
  avatar: string;
  surgeryType: string;
  surgeonName: string;
}

interface Task {
  id: string;
  title: string;
  type: 'exercise' | 'medication' | 'form' | 'checkup';
  status: 'completed' | 'pending' | 'missed';
  dueDate: string;
}

interface DayTasks {
  [key: number]: Task[];
}

export default function ChatDemo() {
  const [dayConversations, setDayConversations] = useState<DayConversations>({});
  const [currentDay] = useState(0); // Today is Day 0
  const [viewingDay, setViewingDay] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPastMessages, setShowPastMessages] = useState(false);
  const [showTaskInterface, setShowTaskInterface] = useState<{taskId: string, type: string, title: string} | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [taskData, setTaskData] = useState<DayTasks>({});

  // Initialize task data
  const initializeDayTasks = (): DayTasks => ({
    0: [ // Today
      {
        id: 't0-1',
        title: 'Daily Check-in',
        type: 'form',
        status: 'pending',
        dueDate: new Date().toISOString()
      },
      {
        id: 't0-2',
        title: 'Knee Flexion Exercises',
        type: 'exercise',
        status: 'pending',
        dueDate: new Date().toISOString()
      },
      {
        id: 't0-3',
        title: 'Take Pain Medication',
        type: 'medication',
        status: 'pending',
        dueDate: new Date().toISOString()
      }
    ],
    [-1]: [
      {
        id: 't-1-1',
        title: 'Daily Check-in',
        type: 'form',
        status: 'missed',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 't-1-2',
        title: 'Walking Exercise',
        type: 'exercise',
        status: 'missed',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    [-2]: [
      {
        id: 't-2-1',
        title: 'Daily Check-in',
        type: 'form',
        status: 'completed',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 't-2-2',
        title: 'Ankle Pumps',
        type: 'exercise',
        status: 'completed',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    [-3]: [
      {
        id: 't-3-1',
        title: 'Daily Check-in',
        type: 'form',
        status: 'completed',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 't-3-2',
        title: 'Range of Motion',
        type: 'exercise',
        status: 'completed',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 't-3-3',
        title: 'Medication Tracking',
        type: 'medication',
        status: 'completed',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    [-6]: [
      {
        id: 't-6-1',
        title: 'Pre-Surgery Check-in',
        type: 'form',
        status: 'completed',
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 't-6-2',
        title: 'Pre-Surgery Exercises',
        type: 'exercise',
        status: 'completed',
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });

  // Initialize tasks data once
  useEffect(() => {
    setTaskData(initializeDayTasks());
  }, []);

  // Calculate missed tasks count
  const getMissedTasksCount = () => {
    let count = 0;
    Object.entries(taskData).forEach(([day, tasks]) => {
      const dayNum = parseInt(day);
      if (dayNum < currentDay) { // Only count past days
        tasks.forEach((task: Task) => {
          if (task.status === 'missed') count++;
        });
      }
    });
    return count;
  };

  const getTaskStatusForDay = (day: number): 'completed' | 'pending' | 'missed' | 'none' => {
    const tasks = taskData[day];
    if (!tasks || tasks.length === 0) return 'none';
    
    const allCompleted = tasks.every(task => task.status === 'completed');
    const hasMissed = tasks.some(task => task.status === 'missed');
    const hasPending = tasks.some(task => task.status === 'pending');
    
    if (allCompleted) return 'completed';
    if (hasMissed) return 'missed';
    if (hasPending) return 'pending';
    return 'none';
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>;
      case 'missed':
        return <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>;
      case 'pending':
        return <span className="w-3 h-3 bg-blue-500 rounded-full"></span>;
      default:
        return null;
    }
  };

  const getAvailableDays = () => {
    // Show specific days that have data (tasks or conversations)
    const daysWithData = Object.keys(taskData).map(Number).sort((a, b) => b - a); // Descending order
    
    // Always include current day even if no tasks yet
    if (!daysWithData.includes(currentDay)) {
      daysWithData.unshift(currentDay);
    }
    
    // Only show days up to current day (no future days)
    return daysWithData.filter(day => day <= currentDay);
  };

  // Patient profile data
  const patientProfile: PatientProfile = {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    surgeryType: "Total Knee Replacement",
    surgeonName: "Dr. Michael Chen"
  };

  // Care team data
  const careTeam: Provider[] = [
    {
      id: "surgeon",
      name: "Dr. Michael Chen",
      role: "Orthopedic Surgeon",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      isOnline: true,
      specialty: "Joint Replacement"
    },
    {
      id: "nurse",
      name: "Lisa Martinez, RN",
      role: "Recovery Nurse",
      avatar: "https://images.unsplash.com/photo-1594824020307-3bf28b8e1d33?w=150&h=150&fit=crop&crop=face",
      isOnline: true,
      specialty: "Post-Surgical Care"
    },
    {
      id: "pt",
      name: "James Wilson, PT",
      role: "Physical Therapist",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
      isOnline: false,
      specialty: "Orthopedic Rehabilitation"
    }
  ];

  // Initialize sample conversations for different days
  useEffect(() => {
    const sampleConversations: DayConversations = {};
    
    // Day 0 (today) - live conversation
    sampleConversations[0] = [];
    
    // Day -3 - sample completed conversation
    sampleConversations[-3] = [
      {
        id: 'day-3-1',
        content: "👋 Hi! Ready to start your Day -3 check-in? I'll guide you through some quick questions about your recovery.",
        type: 'assistant',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        day: -3,
        buttons: [
          { text: "Yes, let's start!", action: 'start_checkin' },
          { text: "Not right now", action: 'postpone' }
        ]
      },
      {
        id: 'day-3-2',
        content: "Selected: Yes, let's start!",
        type: 'user',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30000),
        day: -3
      },
      {
        id: 'day-3-3',
        content: "Perfect! Let's start with your pain level today. On a scale of 1-10, how would you rate your current pain?",
        type: 'assistant',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000),
        day: -3
      },
      {
        id: 'day-3-4',
        content: "Selected: 4",
        type: 'user',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90000),
        day: -3
      },
      {
        id: 'day-3-5',
        content: "Got it, pain level 4. Now, have you completed your prescribed exercises today?",
        type: 'assistant',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120000),
        day: -3
      },
      {
        id: 'day-3-6',
        content: "Selected: Yes, completed all",
        type: 'user',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 150000),
        day: -3
      },
      {
        id: 'day-3-7',
        content: "Excellent! Great progress on Day -3. Keep up the good work!",
        type: 'assistant',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 180000),
        day: -3
      }
    ];

    // Day -6 - another sample conversation with provider intervention
    sampleConversations[-6] = [
      {
        id: 'day-6-1',
        content: "👋 Good morning! How are you feeling on Day -6 of your recovery?",
        type: 'assistant',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        day: -6
      },
      {
        id: 'day-6-2',
        content: "I'm feeling nervous about the upcoming surgery",
        type: 'user',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30000),
        day: -6
      },
      {
        id: 'day-6-3',
        content: "It's completely normal to feel nervous. Let me connect you with your surgeon who can address your concerns directly.",
        type: 'assistant',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60000),
        day: -6
      },
      {
        id: 'day-6-4',
        content: "Hi Sarah! Dr. Chen here. I wanted to personally address your pre-surgery concerns. What specific aspects of the procedure are you most worried about?",
        type: 'provider',
        providerId: 'surgeon',
        providerName: 'Dr. Michael Chen',
        providerRole: 'Orthopedic Surgeon',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 120000),
        day: -6
      },
      {
        id: 'day-6-5',
        content: "Thank you Dr. Chen! I'm mostly worried about the recovery time and pain management.",
        type: 'user',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 180000),
        day: -6
      },
      {
        id: 'day-6-6',
        content: "Those are very valid concerns. We have excellent pain management protocols, and I'll ensure you're comfortable throughout your recovery. Lisa, our recovery nurse, will also be monitoring your progress closely.",
        type: 'provider',
        providerId: 'surgeon',
        providerName: 'Dr. Michael Chen',
        providerRole: 'Orthopedic Surgeon',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 240000),
        day: -6
      }
    ];

    setDayConversations(sampleConversations);

    // Initialize today's conversation with welcome message
    setTimeout(() => {
      addMessage({
        id: '1',
        content: "👋 Hi! Ready to start your Day 0 check-in? I'll guide you through some quick questions about your recovery.",
        type: 'assistant',
        timestamp: new Date(),
        day: 0,
        buttons: [
          { text: "Yes, let's start!", action: 'start_checkin' },
          { text: "Not right now", action: 'postpone' }
        ]
      });
    }, 1000);
  }, []);

  const addMessage = (message: Message) => {
    setDayConversations(prev => ({
      ...prev,
      [message.day]: [...(prev[message.day] || []), message]
    }));
  };

  const handleDayClick = async (day: number) => {
    if (day === viewingDay) return;

    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setViewingDay(day);
    setIsLoading(false);
    
    // Clear input when switching to a different day
    setInputValue('');
  };

  const handleReturnToToday = () => {
    setViewingDay(currentDay);
    setInputValue('');
  };

  const showTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim() || viewingDay !== currentDay) return;

    // Add user message
    addMessage({
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
      day: currentDay
    });

    setInputValue('');
    showTyping();

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        id: Date.now().toString() + '_response',
        content: "Thanks for sharing! Let me help you with that. How would you rate your pain level right now?",
        type: 'assistant',
        timestamp: new Date(),
        day: currentDay,
        buttons: Array.from({length: 10}, (_, i) => ({
          text: `${i + 1}`,
          action: `pain_${i + 1}`
        }))
      });
    }, 1500);
  };

  const handleCompleteTask = async (task: Task) => {
    // Set the task interface to show
    setShowTaskInterface({ taskId: task.id, type: task.type, title: task.title });
  };

  const completeTaskFromInterface = async (taskId: string, taskType: string, taskTitle: string) => {
    // Update task status to completed in real-time
    setTaskData(prevData => ({
      ...prevData,
      [viewingDay]: prevData[viewingDay].map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      )
    }));
    
    // Add to completed tasks set
    setCompletedTasks(prev => new Set([...prev, taskId]));
    
    // Show success message
    setSuccessMessage(`✅ Great job! You've completed "${taskTitle}" from Day ${viewingDay}. This will help you catch up on your recovery plan.`);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Close the task interface
    setShowTaskInterface(null);
  };

  const handleButtonClick = (action: string, text: string) => {
    if (viewingDay !== currentDay) return;

    // Show user selection
    addMessage({
      id: Date.now().toString(),
      content: `Selected: ${text}`,
      type: 'user',
      timestamp: new Date(),
      day: currentDay
    });

    showTyping();

    setTimeout(() => {
      if (action === 'start_checkin') {
        addMessage({
          id: Date.now().toString(),
          content: "Perfect! Let's start with your pain level today. On a scale of 1-10, how would you rate your current pain?",
          type: 'assistant',
          timestamp: new Date(),
          day: currentDay,
          buttons: Array.from({length: 10}, (_, i) => ({
            text: `${i + 1}`,
            action: `pain_${i + 1}`
          }))
        });
      } else if (action.startsWith('pain_')) {
        const painLevel = action.split('_')[1];
        addMessage({
          id: Date.now().toString(),
          content: `Got it, pain level ${painLevel}. Now, have you completed your prescribed exercises today?`,
          type: 'assistant',
          timestamp: new Date(),
          day: currentDay,
          buttons: [
            { text: "Yes, completed all", action: 'exercises_complete' },
            { text: "Partially completed", action: 'exercises_partial' },
            { text: "Haven't started yet", action: 'exercises_none' },
            { text: "Having difficulties", action: 'exercises_help' }
          ]
        });
      } else if (action.startsWith('exercises_')) {
        addMessage({
          id: Date.now().toString(),
          content: "Thanks for the update! How are you feeling about your recovery progress overall?",
          type: 'assistant',
          timestamp: new Date(),
          day: currentDay,
          buttons: [
            { text: "Very positive", action: 'mood_positive' },
            { text: "Optimistic", action: 'mood_optimistic' },
            { text: "Neutral", action: 'mood_neutral' },
            { text: "Concerned", action: 'mood_concerned' },
            { text: "Anxious", action: 'mood_anxious' }
          ]
        });
      } else {
        addMessage({
          id: Date.now().toString(),
          content: "Thank you for completing your check-in! Is there anything specific you'd like to discuss about your recovery today?",
          type: 'assistant',
          timestamp: new Date(),
          day: currentDay
        });
      }
    }, 1500);
  };

  const currentMessages = dayConversations[viewingDay] || [];
  const isViewingPastDay = viewingDay !== currentDay;
  const isInputDisabled = isViewingPastDay || isLoading;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Enhanced Recovery Timeline */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-blue-900">Recovery Timeline</h2>
          </div>
          <p className="text-sm text-blue-700">Current: Day {currentDay}</p>
          
          {/* Quick Actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Phone className="w-3 h-3 mr-1" />
              Contact Nurse
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs border-red-200 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Report Pain
            </Button>
          </div>
          
          {isViewingPastDay && (
            <Button 
              onClick={handleReturnToToday}
              size="sm"
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Today
            </Button>
          )}
        </div>

        {/* Search Function */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-2 top-2.5 w-4 h-4 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Today's Summary - only show on current day */}
        {viewingDay === currentDay && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Today's Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Tasks Completed</span>
                <span className="font-medium text-blue-900">
                  {taskData[currentDay] ? taskData[currentDay].filter(t => t.status === 'completed').length : 0}/{taskData[currentDay]?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Pain Level</span>
                <span className="font-medium text-blue-900">Not reported</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Next Check-in</span>
                <span className="font-medium text-blue-900">2:00 PM</span>
              </div>
            </div>
          </div>
        )}

        {/* Missed Tasks Alert */}
        {getMissedTasksCount() > 0 && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-900">
                {getMissedTasksCount()} Missed Tasks
              </span>
            </div>
            <p className="text-xs text-red-700">
              Click on previous days to catch up on missed tasks
            </p>
          </div>
        )}

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {getAvailableDays().reverse().map((day, dayIndex) => {
              const isToday = day === currentDay;
              const isViewing = day === viewingDay;
              const hasConversation = dayConversations[day] && dayConversations[day].length > 0;
              const taskStatus = getTaskStatusForDay(day);
              const tasks = taskData[day] || [];
              const missedTasksCount = tasks.filter(t => t.status === 'missed').length;
              
              return (
                <div key={`day-${day}-${dayIndex}`} className="relative group">
                  <button
                    onClick={() => handleDayClick(day)}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      isViewing
                        ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200 transform scale-[1.02]'
                        : isToday 
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:transform hover:scale-[1.01]' 
                          : hasConversation
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isViewing 
                            ? 'text-blue-900'
                            : isToday 
                              ? 'text-blue-900' 
                              : hasConversation
                                ? 'text-green-900'
                                : 'text-gray-900'
                        }`}>
                          Day {day}
                        </div>
                        <div className={`text-xs ${
                          isViewing
                            ? 'text-blue-700'
                            : isToday 
                              ? 'text-blue-700' 
                              : hasConversation
                                ? 'text-green-700'
                                : 'text-gray-600'
                        }`}>
                          {new Date(Date.now() + (day * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Task Status Indicators */}
                        {missedTasksCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔴 {missedTasksCount}
                          </span>
                        )}
                        {taskStatus === 'completed' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅
                          </span>
                        )}
                        {taskStatus === 'pending' && day === currentDay && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔵 {tasks.filter(t => t.status === 'pending').length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {isToday && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Today
                          </span>
                        )}
                        {isViewing && !isToday && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Viewing
                          </span>
                        )}
                        {hasConversation && !isViewing && !isToday && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Chat
                          </span>
                        )}
                      </div>
                      {tasks.length > 0 && (
                        <div className={`text-xs ${
                          isViewing
                            ? 'text-blue-700'
                            : isToday 
                              ? 'text-blue-700' 
                              : hasConversation
                                ? 'text-green-700'
                                : 'text-gray-600'
                        }`}>
                          {tasks.length} tasks
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Enhanced Tooltip */}
                  {tasks.length > 0 && (
                    <div className="absolute left-full ml-2 top-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-48">
                        <div className="font-semibold mb-2">Day {day} Tasks:</div>
                        <div className="space-y-1">
                          {tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between">
                              <span className="truncate mr-2">{task.title}</span>
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                task.status === 'completed' ? 'bg-green-600' :
                                task.status === 'missed' ? 'bg-red-600' :
                                'bg-blue-600'
                              }`}>
                                {task.status === 'completed' ? '✓' : 
                                 task.status === 'missed' ? '!' : '●'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Care Team Panel */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-t border-green-200">
          <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Your Care Team
          </h3>
          <div className="space-y-2">
            {careTeam.slice(0, 2).map((provider) => (
              <div key={provider.id} className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                    provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-green-900 truncate">
                    {provider.name}
                  </div>
                  <div className="text-xs text-green-700">
                    {provider.role}
                  </div>
                </div>
                <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                  provider.isOnline 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {provider.isOnline ? 'Online' : 'Away'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Patient Profile */}
              <div className="flex items-center space-x-3">
                <img
                  src={patientProfile.avatar}
                  alt={patientProfile.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{patientProfile.name}</h1>
                  <p className="text-sm text-gray-600">
                    {patientProfile.surgeryType} • Day {viewingDay} {viewingDay === currentDay ? 'Check-in' : 'Conversation'}
                    {isViewingPastDay && (
                      <span className="ml-2 text-amber-600">(Past Conversation)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
              
              {/* Care Team Info */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Care Team:</span>
                <div className="flex -space-x-2">
                  {careTeam.map((provider) => (
                    <div key={provider.id} className="relative">
                      <img
                        src={provider.avatar}
                        alt={provider.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        title={`${provider.name} - ${provider.role} ${provider.isOnline ? '(Online)' : '(Offline)'}`}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Missed Tasks Section - only show for past days with missed tasks */}
        {isViewingPastDay && taskData[viewingDay] && taskData[viewingDay].some(task => task.status === 'missed') && (
          <div className="bg-red-50 border-b border-red-200 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 text-red-600">⚠️</div>
                <h3 className="text-lg font-semibold text-red-900">Missed Tasks from Day {viewingDay}</h3>
              </div>
              <p className="text-sm text-red-700 mb-4">
                You can still complete these tasks to catch up on your recovery plan.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {taskData[viewingDay].filter(task => task.status === 'missed').map(task => (
                  <div key={task.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">{task.title}</h4>
                        <p className="text-sm text-red-700 capitalize">
                          {task.type} • Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleCompleteTask(task)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Complete Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 text-green-600">✅</div>
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium">No conversation yet</div>
                <div className="text-sm">
                  {viewingDay === currentDay 
                    ? "Start chatting to begin your check-in!"
                    : "No messages found for this day."
                  }
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentMessages.map((message) => {
                const provider = message.providerId ? careTeam.find(p => p.id === message.providerId) : null;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-sm lg:max-w-md ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar for non-user messages */}
                      {message.type !== 'user' && (
                        <div className="flex-shrink-0">
                          {message.type === 'provider' && provider ? (
                            <img
                              src={provider.avatar}
                              alt={provider.name}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-sm">AI</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'provider'
                              ? 'bg-green-50 text-green-900 border border-green-200'
                              : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {/* Provider name header */}
                        {message.type === 'provider' && provider && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-xs font-semibold text-green-700">
                              {provider.name}
                            </div>
                            <div className="text-xs text-green-600">
                              {provider.role}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-sm">{message.content}</div>
                        
                        {message.buttons && viewingDay === currentDay && (
                          <div className="mt-3 space-y-2">
                            {message.buttons.map((button, index) => (
                              <button
                                key={`btn-${message.id}-${index}-${button.action}`}
                                onClick={() => handleButtonClick(button.action, button.text)}
                                className="block w-full text-left px-3 py-2 text-xs bg-white text-gray-700 rounded-lg border hover:bg-gray-50 transition-colors"
                              >
                                {button.text}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' 
                            ? 'text-blue-100' 
                            : message.type === 'provider'
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator - only show for current day */}
              {isTyping && viewingDay === currentDay && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-4 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          {isViewingPastDay && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-amber-600">⚠️</div>
              <div className="text-sm text-amber-800">
                You are viewing a past conversation. Return to today to continue chatting.
              </div>
            </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                isInputDisabled 
                  ? isViewingPastDay 
                    ? "Switch to today to send messages..."
                    : "Loading..."
                  : "Type your message..."
              }
              disabled={isInputDisabled}
              className={`flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isInputDisabled 
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isInputDisabled}
              className={`px-6 py-3 rounded-2xl transition-colors ${
                isInputDisabled || !inputValue.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Task Completion Interface Modal */}
      {showTaskInterface && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Complete Task: {showTaskInterface.title}
                </h3>
                <button
                  onClick={() => setShowTaskInterface(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {showTaskInterface.type === 'form' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please complete this quick check-in form:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How are you feeling today? (1-10)
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        <option>Select...</option>
                        {Array.from({length: 10}, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Any concerns or questions?
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Optional - share any concerns..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {showTaskInterface.type === 'exercise' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Mark this exercise as completed:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">{showTaskInterface.title}</h4>
                    <p className="text-sm text-blue-700">
                      Have you completed this exercise today? Mark it as done to update your progress.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm text-gray-700">I have completed this exercise</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm text-gray-700">I followed the proper form and technique</span>
                    </label>
                  </div>
                </div>
              )}

              {showTaskInterface.type === 'medication' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Confirm medication intake:
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">{showTaskInterface.title}</h4>
                    <p className="text-sm text-green-700">
                      Please confirm that you have taken your prescribed medication as directed.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time taken
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm text-gray-700">I took the medication as prescribed</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => completeTaskFromInterface(
                    showTaskInterface.taskId, 
                    showTaskInterface.type, 
                    showTaskInterface.title
                  )}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Completed
                </Button>
                <Button
                  onClick={() => setShowTaskInterface(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
