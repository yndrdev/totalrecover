// This file contains the remaining components for protocol-builder.tsx
// These will be imported into the main file

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  MessageSquare,
  Activity,
  X,
  Copy,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Package,
  Loader2
} from "lucide-react";

interface ProtocolTask {
  id: string;
  day: number | string;
  type: 'form' | 'exercise' | 'video' | 'message';
  title: string;
  description?: string;
  content: string;
  required: boolean;
  videoUrl?: string;
  frequency: {
    startDay: number | string;
    stopDay: number | string;
    repeat: boolean;
    type?: 'daily' | 'everyOtherDay' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dependencies?: string[];
  triggers?: {
    condition: string;
    action: string;
  }[];
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  surgeryTypes: string[];
  activityLevels: string[];
  timelineStart: number;
  timelineEnd: number;
  isActive: boolean;
  tasks: ProtocolTask[];
  createdAt: string;
  updatedAt: string;
  version: number;
  isDraft: boolean;
}

// Helper function to get human-readable frequency label
export function getFrequencyLabel(frequencyType: string): string {
  switch (frequencyType) {
    case 'daily':
      return 'Daily';
    case 'everyOtherDay':
      return 'Every other day';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return 'Custom interval';
    default:
      return 'Daily';
  }
}

// List View Component
export function ListView({ protocol, onEditTask, onDeleteTask }: any) {
  const [sortBy, setSortBy] = useState('day');
  const [filterType, setFilterType] = useState('all');

  const sortedTasks = [...protocol.tasks].sort((a, b) => {
    if (sortBy === 'day') {
      const dayA = typeof a.frequency.startDay === 'string' ? -45 : a.frequency.startDay;
      const dayB = typeof b.frequency.startDay === 'string' ? -45 : b.frequency.startDay;
      return dayA - dayB;
    }
    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
    return a.title.localeCompare(b.title);
  });

  const filteredTasks = sortedTasks.filter(task => {
    if (filterType === 'all') return true;
    return task.type === filterType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'message': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-xl border transition-all duration-200 bg-white border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="day">Day</option>
                <option value="type">Type</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="form">Forms</option>
                <option value="exercise">Exercises</option>
                <option value="video">Videos</option>
                <option value="message">Messages</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredTasks.length} tasks
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(task.type)}
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600">
                    Day {typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay}
                    {task.frequency.repeat && ` - ${typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay}`}
                    {task.frequency.repeat && (
                      <span className="text-blue-600 ml-2">
                        ({getFrequencyLabel(task.frequency.type || 'daily')})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditTask(task)}
                  className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Protocol Preview Tab - Day by Day View
export function ProtocolPreviewTab({ protocol, selectedDay, setSelectedDay }: {
  protocol: Protocol;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
}) {
  const [currentDayTasks, setCurrentDayTasks] = useState<ProtocolTask[]>([]);

  // Get tasks for the selected day, considering frequency rules
  const getTasksForSelectedDay = () => {
    return protocol.tasks.filter((task: ProtocolTask) => {
      const startDay = typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay;
      const stopDay = typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay;
      
      // If task doesn't repeat, only show on start day
      if (!task.frequency.repeat) {
        return selectedDay === startDay;
      }
      
      // Check if day is within the task's active period
      if (selectedDay < startDay || selectedDay > stopDay) {
        return false;
      }
      
      // Apply frequency-specific logic
      const daysSinceStart = selectedDay - startDay;
      const frequencyType = task.frequency.type || 'daily';
      
      switch (frequencyType) {
        case 'daily':
          return true;
        case 'everyOtherDay':
          return daysSinceStart % 2 === 0;
        case 'weekly':
          return daysSinceStart % 7 === 0;
        case 'biweekly':
          return daysSinceStart % 14 === 0;
        case 'monthly':
          return daysSinceStart % 30 === 0;
        case 'custom':
          const interval = task.frequency.interval || 1;
          return daysSinceStart % interval === 0;
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    setCurrentDayTasks(getTasksForSelectedDay());
  }, [selectedDay, protocol.tasks]);

  const getDayLabel = (day: number) => {
    if (day === 0) return 'Surgery Day';
    if (day < 0) return `Pre-Op Day ${Math.abs(day)}`;
    return `Post-Op Day ${day}`;
  };

  const getPhaseForDay = (day: number) => {
    if (day < -7) return { name: 'Enrollment', color: 'blue' };
    if (day < 0) return { name: 'Pre-Operation', color: 'yellow' };
    if (day === 0) return { name: 'Surgery', color: 'red' };
    if (day <= 7) return { name: 'Early Recovery', color: 'orange' };
    if (day <= 30) return { name: 'Intermediate Recovery', color: 'green' };
    return { name: 'Advanced Recovery', color: 'purple' };
  };

  const currentPhase = getPhaseForDay(selectedDay);

  return (
    <div className="space-y-6">
      {/* Day Navigation */}
      <div className="rounded-xl border transition-all duration-200 bg-white border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Day-by-Day Preview
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Navigate through the recovery timeline to see tasks for each day
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDay(Math.max(protocol.timelineStart, selectedDay - 7))}
              disabled={selectedDay <= protocol.timelineStart}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Week
            </button>
            <button
              onClick={() => setSelectedDay(Math.max(protocol.timelineStart, selectedDay - 1))}
              disabled={selectedDay <= protocol.timelineStart}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="px-4 py-2 bg-gray-100 rounded-lg min-w-[200px] text-center">
              <div className="text-lg font-semibold text-gray-900">{getDayLabel(selectedDay)}</div>
              <div className={`text-xs font-medium text-${currentPhase.color}-700 mt-1`}>
                {currentPhase.name}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedDay(Math.min(protocol.timelineEnd, selectedDay + 1))}
              disabled={selectedDay >= protocol.timelineEnd}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedDay(Math.min(protocol.timelineEnd, selectedDay + 7))}
              disabled={selectedDay >= protocol.timelineEnd}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
            >
              Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Quick Jump to Key Days */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Quick jump:</span>
          <button
            onClick={() => setSelectedDay(-45)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === -45 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day -45 (Start)
          </button>
          <button
            onClick={() => setSelectedDay(-7)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === -7 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day -7
          </button>
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Surgery
          </button>
          <button
            onClick={() => setSelectedDay(7)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === 7 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day 7
          </button>
          <button
            onClick={() => setSelectedDay(30)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === 30 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day 30
          </button>
          <button
            onClick={() => setSelectedDay(90)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === 90 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day 90
          </button>
          <button
            onClick={() => setSelectedDay(180)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDay === 180 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day 180
          </button>
        </div>
      </div>

      {/* Tasks for Selected Day */}
      <div className="rounded-xl border transition-all duration-200 bg-white border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Tasks for {getDayLabel(selectedDay)}</h3>
            <p className="text-sm text-gray-600">{currentDayTasks.length} task{currentDayTasks.length !== 1 ? 's' : ''} scheduled</p>
          </div>
        </div>
        
        {currentDayTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tasks scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDayTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        task.type === 'form' ? 'bg-green-100 text-green-800' :
                        task.type === 'exercise' ? 'bg-purple-100 text-purple-800' :
                        task.type === 'video' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {task.type === 'form' && <FileText className="h-3 w-3" />}
                        {task.type === 'exercise' && <Activity className="h-3 w-3" />}
                        {task.type === 'video' && <Video className="h-3 w-3" />}
                        {task.type === 'message' && <MessageSquare className="h-3 w-3" />}
                        <span className="capitalize">{task.type}</span>
                      </div>
                      {task.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Required
                        </span>
                      )}
                      {task.frequency.repeat && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getFrequencyLabel(task.frequency.type || 'daily')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.content}</p>
                    {task.videoUrl && (
                      <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        Video URL: {task.videoUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protocol Summary */}
      <div className="rounded-xl border transition-all duration-200 bg-gray-50 border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-3">Protocol Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-gray-600">Total Days</dt>
            <dd className="font-semibold text-gray-900">{Math.abs(protocol.timelineStart) + protocol.timelineEnd}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Total Tasks</dt>
            <dd className="font-semibold text-gray-900">{protocol.tasks.length}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Surgery Types</dt>
            <dd className="font-semibold text-gray-900">{protocol.surgeryTypes.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Activity Levels</dt>
            <dd className="font-semibold text-gray-900 capitalize">{protocol.activityLevels.join(', ')}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Modal
export function TaskModal({ isOpen, onClose, onSave, editingTask, selectedDay, contentVideos, contentForms, contentExercises }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ProtocolTask) => void;
  editingTask: ProtocolTask | null;
  selectedDay: number;
  contentVideos?: any[];
  contentForms?: any[];
  contentExercises?: any[];
}) {
  const [task, setTask] = useState<ProtocolTask>(
    editingTask || {
      id: '',
      day: selectedDay,
      type: 'message',
      title: '',
      content: '',
      required: true,
      frequency: {
        startDay: selectedDay,
        stopDay: selectedDay,
        repeat: false,
        type: 'daily',
        interval: 1
      }
    }
  );

  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [contentSelectionMode, setContentSelectionMode] = useState<boolean>(false);

  // Get available content based on task type
  const getAvailableContent = () => {
    switch (task.type) {
      case 'video':
        return contentVideos || [];
      case 'form':
        return contentForms || [];
      case 'exercise':
        return contentExercises || [];
      default:
        return [];
    }
  };

  // Handle content selection from dropdown
  const handleContentSelection = (contentId: string) => {
    const availableContent = getAvailableContent();
    const selectedContent = availableContent.find(item => item.id === contentId);
    
    if (selectedContent) {
      setTask(prevTask => ({
        ...prevTask,
        title: selectedContent.title,
        content: selectedContent.description,
        description: selectedContent.description,
        videoUrl: selectedContent.url || selectedContent.video_url
      }));
      setSelectedContentId(contentId);
    }
  };

  // Toggle between manual entry and content selection
  const toggleContentSelectionMode = () => {
    setContentSelectionMode(!contentSelectionMode);
    if (!contentSelectionMode) {
      // Clear manual entries when switching to selection mode
      setTask(prevTask => ({
        ...prevTask,
        title: '',
        content: ''
      }));
      setSelectedContentId('');
    }
  };

  const handleSave = () => {
    if (task.title && task.content) {
      onSave(task);
    }
  };

  if (!isOpen) return null;

  const availableContent = getAvailableContent();
  const canUseContentLibrary = ['video', 'form', 'exercise'].includes(task.type) && availableContent.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={task.type}
                onChange={(e) => {
                  setTask({ ...task, type: e.target.value as any });
                  setContentSelectionMode(false);
                  setSelectedContentId('');
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="message">Message</option>
                <option value="video">Video</option>
                <option value="form">Form</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required
              </label>
              <select
                value={task.required ? 'yes' : 'no'}
                onChange={(e) => setTask({ ...task, required: e.target.value === 'yes' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Content Selection Toggle */}
          {canUseContentLibrary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Content Library Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Select from existing {task.type}s in your content library or create manually
                  </p>
                </div>
                <button
                  onClick={toggleContentSelectionMode}
                  className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm rounded-lg ${
                    contentSelectionMode
                      ? 'bg-primary text-white hover:bg-primary-dark focus:ring-primary'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary'
                  }`}
                >
                  {contentSelectionMode ? 'Manual Entry' : 'Select from Library'}
                </button>
              </div>
            </div>
          )}

          {/* Content Selection Dropdown */}
          {contentSelectionMode && canUseContentLibrary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {task.type === 'exercise' ? 'Exercise' : task.type === 'form' ? 'Form' : 'Video'} *
              </label>
              <select
                value={selectedContentId}
                onChange={(e) => handleContentSelection(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Choose a {task.type}...</option>
                {availableContent.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                    {item.category && ` (${item.category})`}
                    {item.duration && ` - ${item.duration}`}
                    {item.estimated_time && ` - ${item.estimated_time}`}
                  </option>
                ))}
              </select>
              {selectedContentId && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {availableContent.find(item => item.id === selectedContentId)?.description}
                  </p>
                  {availableContent.find(item => item.id === selectedContentId)?.tags && (
                    <div className="flex gap-2 mt-2">
                      {availableContent.find(item => item.id === selectedContentId)?.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Fields */}
          {(!contentSelectionMode || !canUseContentLibrary) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              {/* Video URL Input - Only show for video tasks */}
              {task.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="url"
                    value={task.videoUrl || ''}
                    onChange={(e) => setTask({ ...task, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a YouTube, Vimeo, or direct video URL for this video task
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content/Description
                </label>
                <textarea
                  value={task.content}
                  onChange={(e) => setTask({ ...task, content: e.target.value })}
                  placeholder="Task content or description"
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </>
          )}

          {/* Frequency Settings */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Task Frequency</h4>
            <div className="space-y-4">
              {/* First Row - Start Day, Stop Day, Repeat Toggle */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Day
                  </label>
                  <input
                    type="number"
                    value={typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay}
                    onChange={(e) => setTask({
                      ...task,
                      frequency: { ...task.frequency, startDay: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Day
                  </label>
                  <input
                    type="number"
                    value={typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay}
                    onChange={(e) => setTask({
                      ...task,
                      frequency: { ...task.frequency, stopDay: parseInt(e.target.value) || 0 }
                    })}
                    disabled={!task.frequency.repeat}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Task
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={task.frequency.repeat}
                      onChange={(e) => setTask({
                        ...task,
                        frequency: {
                          ...task.frequency,
                          repeat: e.target.checked,
                          stopDay: e.target.checked ? task.frequency.stopDay : task.frequency.startDay,
                          type: e.target.checked ? (task.frequency.type || 'daily') : 'daily'
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable repeating</span>
                  </div>
                </div>
              </div>

              {/* Frequency Options - Only show when repeat is enabled */}
              {task.frequency.repeat && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency Type
                    </label>
                    <select
                      value={task.frequency.type || 'daily'}
                      onChange={(e) => setTask({
                        ...task,
                        frequency: {
                          ...task.frequency,
                          type: e.target.value as any,
                          interval: e.target.value === 'custom' ? (task.frequency.interval || 1) : undefined
                        }
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="everyOtherDay">Every other day</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom interval</option>
                    </select>
                  </div>

                  {/* Custom Interval Input */}
                  {task.frequency.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Interval (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={task.frequency.interval || 1}
                        onChange={(e) => setTask({
                          ...task,
                          frequency: {
                            ...task.frequency,
                            interval: parseInt(e.target.value) || 1
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Every X days"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Task will repeat every {task.frequency.interval || 1} {(task.frequency.interval || 1) === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  )}

                  {/* Frequency Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Task will repeat:</strong> {getFrequencyLabel(task.frequency.type || 'daily')}
                      {task.frequency.type === 'custom' && task.frequency.interval && task.frequency.interval > 1 &&
                        ` (every ${task.frequency.interval} days)`
                      }
                      {' from day '}
                      {typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay}
                      {' to day '}
                      {typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!task.title || !task.content}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Template Library Modal
export function TemplateLibraryModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (template: any) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templateLibrary = {
    categories: ['Pre-Surgery', 'Post-Surgery', 'Exercises', 'Assessments', 'Education'],
    templates: [
      {
        id: 'pre-op-prep',
        name: 'Pre-Operative Preparation Bundle',
        category: 'Pre-Surgery',
        description: 'Complete pre-surgery preparation including education, assessments, and instructions',
        taskCount: 12,
        popularity: 95
      },
      {
        id: 'pain-assessment',
        name: 'Standard Pain Assessment Forms',
        category: 'Assessments',
        description: 'Daily pain assessment forms for tracking patient recovery progress',
        taskCount: 5,
        popularity: 88
      },
      {
        id: 'post-op-week1',
        name: 'First Week Post-Surgery Protocol',
        category: 'Post-Surgery',
        description: 'Essential tasks for the critical first week after surgery',
        taskCount: 21,
        popularity: 92
      },
      {
        id: 'mobility-exercises',
        name: 'Progressive Mobility Exercise Program',
        category: 'Exercises',
        description: 'Graduated exercise program for restoring mobility and strength',
        taskCount: 15,
        popularity: 90
      },
      {
        id: 'wound-care',
        name: 'Wound Care Instructions',
        category: 'Education',
        description: 'Daily wound care education and tracking forms',
        taskCount: 7,
        popularity: 85
      }
    ]
  };

  const filteredTemplates = templateLibrary.templates.filter(
    template => selectedCategory === 'All' || template.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Template Library</h3>
            <p className="text-sm text-gray-600 mt-1">Import pre-built task bundles to speed up protocol creation</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-48 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Templates
              </button>
              {templateLibrary.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Template List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {template.popularity}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {template.taskCount} tasks
                    </span>
                    <span className="text-xs text-blue-600 font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedTemplate) {
                const template = templateLibrary.templates.find(t => t.id === selectedTemplate);
                if (template) {
                  onImport(template);
                }
              }
            }}
            disabled={!selectedTemplate}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            Import Template
          </button>
        </div>
      </div>
    </div>
  );
}

// Sync Patient Modal
export function SyncPatientModal({ onClose, onSync, patients }: {
  onClose: () => void;
  onSync: (patientId: string) => void;
  patients: any[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSync = async () => {
    if (selectedPatientId) {
      setIsLoading(true);
      try {
        await onSync(selectedPatientId);
        onClose();
      } catch (error) {
        console.error('Error syncing patient:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sync Protocol to Patient</h3>
              <p className="text-sm text-gray-600 mt-1">
                Select a patient to assign this protocol to
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Patient List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No patients found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <label
                    key={patient.id}
                    className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedPatientId === patient.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="patient"
                      value={patient.id}
                      checked={selectedPatientId === patient.id}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {patient.surgery_type || 'No surgery type set'}
                          </p>
                          {patient.surgery_date && (
                            <p className="text-sm text-gray-500">
                              Surgery: {new Date(patient.surgery_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSync}
            disabled={!selectedPatientId || isLoading}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Protocol'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}