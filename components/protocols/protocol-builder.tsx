"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Settings,
  Zap,
  Eye,
  Package,
  Save,
  CircleCheckBig,
  List,
  Plus,
  Edit2 as Edit,
  Trash2,
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
  Loader2
} from "lucide-react";

// Import services
import { protocolService } from '@/lib/services/protocol-service';
import { patientService } from '@/lib/services/patient-service';
import { contentService } from '@/lib/services/content-service';

// Import components
import {
  ListView,
  ProtocolPreviewTab,
  TaskModal,
  TemplateLibraryModal,
  SyncPatientModal,
  getFrequencyLabel
} from './protocol-builder-components';

// Import real TJV timeline data
import { 
  completeTimelineData,
  allTimelineTasks,
  TimelineTask,
  TimelinePhase
} from '@/lib/data/tjv-real-timeline-data';

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

// Template library from specifications
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
      description: 'Validated pain scales and symptom tracking forms',
      taskCount: 5,
      popularity: 88
    },
    {
      id: 'early-mobility',
      name: 'Early Mobility Exercise Program',
      category: 'Exercises',
      description: 'Progressive exercise protocol for days 1-14 post-surgery',
      taskCount: 24,
      popularity: 92
    }
  ]
};

export default function ProtocolBuilder({ protocolId }: { protocolId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'preview'>('details');
  const [protocol, setProtocol] = useState<Protocol>({
    id: protocolId || 'new-protocol',
    name: '',
    description: '',
    surgeryTypes: ['TKA'],
    activityLevels: ['all'],
    timelineStart: -45,
    timelineEnd: 200,
    isActive: true,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    isDraft: true
  });
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState<number>(-45);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contentVideos, setContentVideos] = useState<any[]>([]);
  const [contentForms, setContentForms] = useState<any[]>([]);
  const [contentExercises, setContentExercises] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // Load existing protocol if editing
  useEffect(() => {
    if (protocolId && protocolId !== 'new-protocol') {
      loadProtocol();
    } else {
      loadRealTimelineData();
    }
    loadContentLibrary();
    loadPatients();
  }, [protocolId]);

  const loadProtocol = async () => {
    try {
      setIsLoading(true);
      const data = await protocolService.getProtocolById(protocolId!);
      
      // Convert database tasks to component format
      const convertedTasks: ProtocolTask[] = data.tasks.map((task: any) => ({
        id: task.id,
        day: task.day,
        type: task.type,
        title: task.title,
        description: task.description,
        content: task.content,
        required: task.required,
        videoUrl: task.video_url,
        frequency: task.frequency || {
          startDay: task.day,
          stopDay: task.day,
          repeat: false
        },
        duration: task.duration,
        difficulty: task.difficulty,
        dependencies: task.dependencies || [],
        triggers: task.triggers || []
      }));

      setProtocol({
        id: data.id,
        name: data.name,
        description: data.description || '',
        surgeryTypes: data.surgery_types,
        activityLevels: data.activity_levels,
        timelineStart: data.timeline_start,
        timelineEnd: data.timeline_end,
        isActive: data.is_active,
        tasks: convertedTasks,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        version: data.version,
        isDraft: data.is_draft
      });
    } catch (error) {
      console.error('Error loading protocol:', error);
      // TODO: Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimelineData = () => {
    const convertedTasks: ProtocolTask[] = allTimelineTasks.map((task, index) => ({
      id: `task-${index}`,
      day: task.day,
      type: task.type as 'form' | 'exercise' | 'video' | 'message',
      title: task.title,
      description: task.description,
      content: task.content,
      required: task.required,
      frequency: {
        startDay: task.day,
        stopDay: task.day,
        repeat: false
      }
    }));
    
    setProtocol(prev => ({
      ...prev,
      name: 'Standard TKA Recovery Protocol',
      tasks: convertedTasks
    }));
  };

  const loadContentLibrary = async () => {
    try {
      const [videos, forms, exercises] = await Promise.all([
        contentService.getVideos(),
        contentService.getForms(),
        contentService.getExercises()
      ]);
      
      setContentVideos(videos);
      setContentForms(forms);
      setContentExercises(exercises);
    } catch (error) {
      console.error('Error loading content library:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await patientService.getPatients({ 
        status: 'active',
        limit: 100 
      });
      setPatients(result.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const saveProtocol = async () => {
    try {
      setSaving(true);

      // Convert component tasks to database format
      const dbTasks = protocol.tasks.map(task => ({
        day: typeof task.day === 'string' ? parseInt(task.day) : task.day,
        type: task.type,
        title: task.title,
        content: task.content,
        description: task.description,
        video_url: task.videoUrl,
        required: task.required,
        duration: task.duration,
        difficulty: task.difficulty,
        frequency: task.frequency,
        dependencies: task.dependencies || [],
        triggers: task.triggers || []
      }));

      if (protocolId && protocolId !== 'new-protocol') {
        // Update existing protocol
        await protocolService.updateProtocol(protocolId, {
          name: protocol.name,
          description: protocol.description,
          surgery_types: protocol.surgeryTypes,
          activity_levels: protocol.activityLevels,
          timeline_start: protocol.timelineStart,
          timeline_end: protocol.timelineEnd,
          is_draft: false
        });

        // Update tasks (would need to implement task CRUD in service)
        // For now, we'll need to delete and recreate tasks
        // This is a simplified approach - in production you'd want proper task updates
      } else {
        // Create new protocol
        const newProtocol = await protocolService.createProtocol({
          name: protocol.name,
          description: protocol.description,
          surgery_types: protocol.surgeryTypes,
          activity_levels: protocol.activityLevels,
          timeline_start: protocol.timelineStart,
          timeline_end: protocol.timelineEnd,
          version: 1,
          is_active: true,
          is_draft: false,
          created_by: '', // Will be set by service
          tenant_id: '' // Will be set by service
        });

        // Create tasks for the new protocol
        for (const task of dbTasks) {
          await protocolService.createProtocolTask({
            ...task,
            protocol_id: newProtocol.id
          });
        }
      }

      router.push('/provider/protocols');
    } catch (error) {
      console.error('Error saving protocol:', error);
      // TODO: Show error notification
    } finally {
      setSaving(false);
    }
  };

  const addTask = (task: ProtocolTask) => {
    setProtocol(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: `task-${Date.now()}` }]
    }));
  };

  const updateTask = (updatedTask: ProtocolTask) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const deleteTask = (taskId: string) => {
    setProtocol(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const tabs = [
    { id: 'details', label: 'Protocol Details', icon: Settings },
    { id: 'timeline', label: 'Recovery Timeline', icon: Calendar },
    { id: 'logic', label: 'Conditional Logic', icon: Zap },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const handleNextStep = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id as any);
    }
  };

  const isLastTab = activeTab === 'preview';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protocol Builder</h1>
          <p className="text-gray-600 mt-1">
            Create and customize recovery protocols with visual timeline editing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateLibrary(true)}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-4 py-2.5 text-base rounded-lg"
          >
            <Package className="h-4 w-4 mr-2" />
            Template Library
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-4 py-2.5 text-base rounded-lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={() => setShowSyncModal(true)}
            disabled={!protocol.name || protocol.tasks.length === 0}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 px-4 py-2.5 text-base rounded-lg"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Sync to Patient
          </button>
          <button
            onClick={saveProtocol}
            disabled={!protocol.name || protocol.tasks.length === 0 || saving}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2.5 text-base rounded-lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Protocol
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'details' && (
          <ProtocolDetailsTab
            protocol={protocol}
            setProtocol={setProtocol}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            protocol={protocol}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            onAddTask={addTask}
            onEditTask={updateTask}
            onDeleteTask={deleteTask}
            showTaskModal={showTaskModal}
            setShowTaskModal={setShowTaskModal}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            contentVideos={contentVideos}
            contentForms={contentForms}
            contentExercises={contentExercises}
          />
        )}

        {activeTab === 'preview' && (
          <ProtocolPreviewTab protocol={protocol} selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
        )}

        {/* Next Button - Bottom Right of Card */}
        {!isLastTab && (
          <div className="absolute bottom-0 right-0 p-6">
            <button
              onClick={handleNextStep}
              className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-6 py-3 text-base rounded-lg shadow-lg"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibraryModal
          onClose={() => setShowTemplateLibrary(false)}
          onImport={(template: any) => {
            // Import template logic
            setShowTemplateLibrary(false);
          }}
        />
      )}

      {/* Sync to Patient Modal */}
      {showSyncModal && (
        <SyncPatientModal
          patients={patients}
          onClose={() => setShowSyncModal(false)}
          onSync={async (patientId: string) => {
            setSyncing(true);
            try {
              // Get patient details to extract surgery date
              const patient = patients.find(p => p.id === patientId);
              if (!patient || !patient.surgery_date) {
                throw new Error('Patient surgery date not found');
              }

              const result = await protocolService.assignProtocolToPatient({
                patientId,
                protocolId: protocol.id,
                surgeryDate: patient.surgery_date,
                surgeryType: protocol.surgeryTypes[0] || 'TKA'
              });
              
              console.log('Protocol assigned successfully:', result);
              // TODO: Show success notification
              setShowSyncModal(false);
              router.push(`/provider/patients/${patientId}`);
            } catch (error) {
              console.error('Sync error:', error);
              // TODO: Show error notification
            } finally {
              setSyncing(false);
            }
          }}
        />
      )}
    </div>
  );
}

// Protocol Details Tab
function ProtocolDetailsTab({ protocol, setProtocol }: {
  protocol: Protocol;
  setProtocol: (protocol: Protocol) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border transition-all duration-200 bg-white border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protocol Name *
              </label>
              <input
                type="text"
                value={protocol.name}
                onChange={(e) => setProtocol({ ...protocol, name: e.target.value })}
                placeholder="e.g., Standard TKA Recovery Protocol"
                className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={protocol.description}
                onChange={(e) => setProtocol({ ...protocol, description: e.target.value })}
                placeholder="Describe this protocol and when to use it..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surgery Types
                </label>
                <div className="space-y-2">
                  {['TKA', 'THA', 'TSA'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={protocol.surgeryTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProtocol({ 
                              ...protocol, 
                              surgeryTypes: [...protocol.surgeryTypes, type] 
                            });
                          } else {
                            setProtocol({ 
                              ...protocol, 
                              surgeryTypes: protocol.surgeryTypes.filter(t => t !== type) 
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Levels
                </label>
                <div className="space-y-2">
                  {['Active', 'Sedentary', 'All'].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={protocol.activityLevels.includes(level.toLowerCase())}
                        onChange={(e) => {
                          const value = level.toLowerCase();
                          if (e.target.checked) {
                            setProtocol({ 
                              ...protocol, 
                              activityLevels: [...protocol.activityLevels, value] 
                            });
                          } else {
                            setProtocol({ 
                              ...protocol, 
                              activityLevels: protocol.activityLevels.filter(l => l !== value) 
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline Start (Days Before Surgery)
                </label>
                <input
                  type="number"
                  value={Math.abs(protocol.timelineStart)}
                  onChange={(e) => setProtocol({ 
                    ...protocol, 
                    timelineStart: -parseInt(e.target.value) || 0 
                  })}
                  className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typically starts 45 days before surgery
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline End (Days After Surgery)
                </label>
                <input
                  type="number"
                  value={protocol.timelineEnd}
                  onChange={(e) => setProtocol({ 
                    ...protocol, 
                    timelineEnd: parseInt(e.target.value) || 0 
                  })}
                  className="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Long-term recovery extends to 200+ days
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

// Timeline Tab with Calendar and List Views
function TimelineTab({ 
  protocol, 
  viewMode, 
  setViewMode, 
  selectedDay, 
  setSelectedDay,
  onAddTask,
  onEditTask,
  onDeleteTask,
  showTaskModal,
  setShowTaskModal,
  editingTask,
  setEditingTask,
  contentVideos,
  contentForms,
  contentExercises
}: any) {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  const getTasksForDay = (day: number) => {
    return protocol.tasks.filter((task: ProtocolTask) => {
      const startDay = typeof task.frequency.startDay === 'string' ? -45 : task.frequency.startDay;
      const stopDay = typeof task.frequency.stopDay === 'string' ? -45 : task.frequency.stopDay;
      
      // If task doesn't repeat, only show on start day
      if (!task.frequency.repeat) {
        return day === startDay;
      }
      
      // Check if day is within the task's active period
      if (day < startDay || day > stopDay) {
        return false;
      }
      
      // Apply frequency-specific logic
      const daysSinceStart = day - startDay;
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
          // For simplicity, using 30-day months
          return daysSinceStart % 30 === 0;
        
        case 'custom':
          const interval = task.frequency.interval || 1;
          return daysSinceStart % interval === 0;
        
        default:
          return true;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Recovery Timeline</h3>
          <span className="text-sm text-gray-600">
            {protocol.tasks.length} tasks configured
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
          </div>
          
          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark focus:ring-primary px-4 py-2 text-sm rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView
          protocol={protocol}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onEditTask={(task: ProtocolTask) => {
            setEditingTask(task);
            setShowTaskModal(true);
          }}
          onDeleteTask={onDeleteTask}
          getTasksForDay={getTasksForDay}
          setEditingTask={setEditingTask}
          setShowTaskModal={setShowTaskModal}
        />
      ) : (
        <ListView
          protocol={protocol}
          onEditTask={(task: ProtocolTask) => {
            setEditingTask(task);
            setShowTaskModal(true);
          }}
          onDeleteTask={onDeleteTask}
        />
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={(task: ProtocolTask) => {
            if (editingTask) {
              onEditTask(task);
            } else {
              onAddTask(task);
            }
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
          selectedDay={selectedDay}
          contentVideos={contentVideos}
          contentForms={contentForms}
          contentExercises={contentExercises}
        />
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ protocol, currentWeek, setCurrentWeek, selectedDay, setSelectedDay, onEditTask, onDeleteTask, getTasksForDay, setEditingTask, setShowTaskModal }: any) {
  const generateWeeks = () => {
    const weeks = [];
    const totalDays = protocol.timelineEnd - protocol.timelineStart + 1;
    const weeksCount = Math.ceil(totalDays / 7);
    
    for (let i = 0; i < weeksCount; i++) {
      const startDay = protocol.timelineStart + (i * 7);
      const endDay = Math.min(startDay + 6, protocol.timelineEnd);
      const days = [];
      
      for (let day = startDay; day <= endDay; day++) {
        days.push(day);
      }
      
      weeks.push({ startDay, endDay, days });
    }
    return weeks;
  };

  const weeks = generateWeeks();
  const currentWeekData = weeks[currentWeek] || weeks[0];

  const getDayLabel = (day: number) => {
    if (day === 0) return 'Surgery';
    if (day < 0) return `Pre-Op ${Math.abs(day)}`;
    return `Post-Op ${day}`;
  };

  const getDayPhase = (day: number) => {
    if (day < -7) return 'enrollment';
    if (day < 0) return 'pre-op';
    if (day === 0) return 'surgery';
    if (day <= 7) return 'early';
    if (day <= 30) return 'intermediate';
    return 'advanced';
  };

  const phaseColors = {
    enrollment: 'bg-[#F9FAFB] border-gray-200',
    'pre-op': 'bg-[#F9FAFB] border-gray-200',
    surgery: 'bg-[#F9FAFB] border-gray-200',
    early: 'bg-[#F9FAFB] border-gray-200',
    intermediate: 'bg-[#F9FAFB] border-gray-200',
    advanced: 'bg-[#F9FAFB] border-gray-200'
  };

  const phaseTextLabels = {
    enrollment: 'enrollment phase',
    'pre-op': 'pre-op phase',
    surgery: 'surgery day',
    early: 'early recovery',
    intermediate: 'intermediate',
    advanced: 'advanced'
  };

  return (
    <div className="rounded-xl border transition-all duration-200 bg-white border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Week
          </button>
          
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900">
              Week {currentWeek + 1} of {weeks.length}
            </h4>
            <p className="text-sm text-gray-600">
              Day {currentWeekData.startDay} to Day {currentWeekData.endDay}
            </p>
          </div>
          
          <button
            onClick={() => setCurrentWeek(Math.min(weeks.length - 1, currentWeek + 1))}
            disabled={currentWeek === weeks.length - 1}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary px-3 py-1.5 text-sm rounded-lg"
          >
            Next Week
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {currentWeekData.days.map((day: number) => {
            const phase = getDayPhase(day);
            const tasks = getTasksForDay(day);
            
            return (
              <div
                key={day}
                className={`border rounded-lg p-3 min-h-[250px] ${phaseColors[phase]}`}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {getDayLabel(day)}
                  </div>
                  <div className="text-xs text-gray-600 capitalize mt-1">
                    {phaseTextLabels[phase]}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tasks.map((task: ProtocolTask) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                  
                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      setEditingTask(null);
                      setShowTaskModal(true);
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onEdit, onDelete }: {
  task: ProtocolTask;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-3 w-3" />;
      case 'exercise': return <Activity className="h-3 w-3" />;
      case 'video': return <Video className="h-3 w-3" />;
      case 'message': return <MessageSquare className="h-3 w-3" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'form': return 'bg-green-100 text-green-800 border-green-200';
      case 'exercise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'video': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'message': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-2 text-xs relative group ${getTypeColor(task.type)}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {getTypeIcon(task.type)}
          <span className="font-medium capitalize">{task.type}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="font-medium text-gray-900 truncate">
        {task.title}
      </div>
    </div>
  );
}