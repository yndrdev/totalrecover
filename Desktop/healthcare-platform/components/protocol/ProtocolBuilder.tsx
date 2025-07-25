"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DataService } from '@/lib/services/dataService';
import { 
  Plus, 
  Save, 
  Eye, 
  Edit2, 
  Trash2,
  Clock,
  FileText,
  Dumbbell,
  Video,
  MessageCircle,
  ArrowRight,
  Calendar,
  Settings
} from 'lucide-react';

// Mock content library options (in real app, these would come from the Content Library)
const VIDEO_RESOURCE_OPTIONS = [
  { id: 'video-1', title: 'Post-Surgery Knee Bending', url: 'https://youtube.com/watch?v=example1' },
  { id: 'video-2', title: 'Walking Techniques', url: 'https://youtube.com/watch?v=example2' },
  { id: 'video-3', title: 'Pain Management Techniques', url: 'https://youtube.com/watch?v=example3' }
];

const FORM_OPTIONS = [
  { id: 'form-1', title: 'Pain Assessment Form', type: 'assessment' },
  { id: 'form-2', title: 'Mobility Check Form', type: 'assessment' },
  { id: 'form-3', title: 'Daily Progress Form', type: 'progress' }
];

const EXERCISE_OPTIONS = [
  { id: 'exercise-1', title: 'Basic Range of Motion', category: 'mobility' },
  { id: 'exercise-2', title: 'Strengthening Exercises', category: 'strength' },
  { id: 'exercise-3', title: 'Balance Training', category: 'balance' }
];

interface ProtocolBuilderProps {
  tenantId?: string;
  user?: any;
  profile?: any;
  mode?: 'admin' | 'practice'; // admin for Practice Admin, practice for Practice level
}

interface ProtocolTask {
  id: string;
  day: number;
  type: 'exercise' | 'form' | 'message' | 'video' | 'assessment';
  title: string;
  description: string;
  duration?: number;
  frequency?: string;
  instructions?: string;
  required?: boolean;
}

interface Protocol {
  id?: string;
  name: string;
  description: string;
  surgery_type: string;
  duration_weeks: number;
  timeline_data: Record<string, ProtocolTask[]>;
  is_active: boolean;
}

export default function ProtocolBuilder({ tenantId = 'demo', user, profile, mode = 'admin' }: ProtocolBuilderProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProtocolTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Task template
  const [newTask, setNewTask] = useState<Partial<ProtocolTask>>({
    type: 'exercise',
    title: '',
    description: '',
    required: true
  });

  // Timeline range: Day -45 to Day +200 (as per documentation)
  const timelineStart = -45;
  const timelineEnd = 200;
  const dayRange = Array.from(
    { length: timelineEnd - timelineStart + 1 }, 
    (_, i) => timelineStart + i
  );

  useEffect(() => {
    loadProtocols();
  }, [tenantId]);

  const loadProtocols = async () => {
    try {
      const protocolsData = await DataService.getRecoveryProtocols(tenantId);
      setProtocols(protocolsData);
    } catch (error) {
      console.error('Error loading protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProtocol = () => {
    const newProtocol: Protocol = {
      name: '',
      description: '',
      surgery_type: 'TKA',
      duration_weeks: 12,
      timeline_data: {},
      is_active: false
    };
    setCurrentProtocol(newProtocol);
  };

  const saveProtocol = async () => {
    if (!currentProtocol) return;

    setSaving(true);
    try {
      const protocolData = {
        ...currentProtocol,
        tenant_id: tenantId,
        created_by: profile.id
      };

      let savedProtocol;
      if (currentProtocol.id) {
        // Update existing protocol
        savedProtocol = await DataService.updateRecoveryProtocol(currentProtocol.id, protocolData);
      } else {
        // Create new protocol
        savedProtocol = await DataService.createRecoveryProtocol(protocolData);
      }

      // Log protocol creation/update for audit trail
      await DataService.logAction(
        currentProtocol.id ? 'update_protocol' : 'create_protocol',
        {
          protocol_id: savedProtocol.id,
          protocol_name: savedProtocol.name,
          surgery_type: savedProtocol.surgery_type
        },
        profile.id,
        profile.role,
        profile.full_name,
        tenantId
      );

      await loadProtocols();
      setCurrentProtocol(null);
    } catch (error) {
      console.error('Error saving protocol:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTaskToDay = () => {
    if (!currentProtocol || !newTask.title) return;

    const task: ProtocolTask = {
      id: `task_${Date.now()}`,
      day: selectedDay,
      type: newTask.type as ProtocolTask['type'],
      title: newTask.title,
      description: newTask.description || '',
      duration: newTask.duration,
      frequency: newTask.frequency,
      instructions: newTask.instructions,
      required: newTask.required
    };

    const updatedTimeline = { ...currentProtocol.timeline_data };
    if (!updatedTimeline[selectedDay]) {
      updatedTimeline[selectedDay] = [];
    }
    updatedTimeline[selectedDay].push(task);

    setCurrentProtocol({
      ...currentProtocol,
      timeline_data: updatedTimeline
    });

    // Reset form
    setNewTask({
      type: 'exercise',
      title: '',
      description: '',
      required: true
    });
    setShowTaskModal(false);
  };

  const removeTask = (day: number, taskId: string) => {
    if (!currentProtocol) return;

    const updatedTimeline = { ...currentProtocol.timeline_data };
    updatedTimeline[day] = updatedTimeline[day]?.filter(task => task.id !== taskId) || [];
    
    if (updatedTimeline[day].length === 0) {
      delete updatedTimeline[day];
    }

    setCurrentProtocol({
      ...currentProtocol,
      timeline_data: updatedTimeline
    });
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Dumbbell className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      case 'assessment': return <Settings className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'exercise': return 'bg-blue-100 text-blue-800';
      case 'form': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'message': return 'bg-orange-100 text-orange-800';
      case 'assessment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayLabel = (day: number) => {
    if (day < 0) return `Day ${day} (Pre-Surgery)`;
    if (day === 0) return `Day ${day} (Surgery Day)`;
    return `Day ${day} (Post-Surgery)`;
  };

  const getPhaseLabel = (day: number) => {
    if (day < -30) return 'Early Preparation';
    if (day < -7) return 'Pre-Surgery Prep';
    if (day < 0) return 'Final Preparation';
    if (day === 0) return 'Surgery Day';
    if (day <= 7) return 'Early Recovery';
    if (day <= 30) return 'Active Recovery';
    if (day <= 90) return 'Rehabilitation';
    return 'Maintenance';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentProtocol) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Protocol Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Protocol Builder</CardTitle>
                <p className="text-gray-600">
                  {currentProtocol.id ? 'Editing' : 'Creating'}: {currentProtocol.name || 'New Protocol'}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentProtocol(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveProtocol}
                  disabled={saving || !currentProtocol.name}
                >
                  {saving ? 'Saving...' : 'Save Protocol'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protocol Name
                </label>
                <Input
                  value={currentProtocol.name}
                  onChange={(e) => setCurrentProtocol({
                    ...currentProtocol,
                    name: e.target.value
                  })}
                  placeholder="e.g., Standard TKA Recovery"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surgery Type
                </label>
                <select 
                  value={currentProtocol.surgery_type}
                  onChange={(e) => setCurrentProtocol({
                    ...currentProtocol,
                    surgery_type: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="TKA">Total Knee Replacement</option>
                  <option value="THA">Total Hip Replacement</option>
                  <option value="TSA">Total Shoulder Replacement</option>
                  <option value="UKA">Partial Knee Replacement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Weeks)
                </label>
                <Input
                  type="number"
                  value={currentProtocol.duration_weeks}
                  onChange={(e) => setCurrentProtocol({
                    ...currentProtocol,
                    duration_weeks: parseInt(e.target.value) || 12
                  })}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={currentProtocol.description}
                onChange={(e) => setCurrentProtocol({
                  ...currentProtocol,
                  description: e.target.value
                })}
                placeholder="Describe this recovery protocol..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dayRange.filter(day => 
                  day >= -45 && day <= 90 // Show most relevant range
                ).map(day => (
                  <div
                    key={day}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedDay === day 
                        ? 'bg-blue-100 border-blue-300 border' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <div className="text-sm font-medium">{getDayLabel(day)}</div>
                    <div className="text-xs text-gray-600">{getPhaseLabel(day)}</div>
                    {currentProtocol.timeline_data[day] && (
                      <div className="text-xs text-blue-600 mt-1">
                        {currentProtocol.timeline_data[day].length} tasks
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Management */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{getDayLabel(selectedDay)}</CardTitle>
                    <p className="text-gray-600">{getPhaseLabel(selectedDay)}</p>
                  </div>
                  <Button onClick={() => setShowTaskModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentProtocol.timeline_data[selectedDay]?.map(task => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getTaskTypeColor(task.type)}`}>
                            {getTaskIcon(task.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <Badge variant="outline" className={getTaskTypeColor(task.type)}>
                                {task.type}
                              </Badge>
                              {task.required && (
                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            {task.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {task.duration} minutes
                              </p>
                            )}
                            {task.instructions && (
                              <p className="text-xs text-blue-600 mt-1">
                                Instructions: {task.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTask(selectedDay, task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium">No tasks for this day</div>
                      <div className="text-sm">Click &quot;Add Task&quot; to get started</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Task to {getDayLabel(selectedDay)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Type
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as ProtocolTask['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="exercise">Exercise</option>
                      <option value="form">Form/Questionnaire</option>
                      <option value="message">Message/Check-in</option>
                      <option value="video">Educational Video</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title
                    </label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Knee flexion exercise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Describe the task..."
                      rows={3}
                    />
                  </div>

                  {/* Content Library Integration */}
                  {newTask.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Video from Library</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => {
                          const selected = VIDEO_RESOURCE_OPTIONS.find(v => v.id === e.target.value);
                          if (selected) {
                            setNewTask(prev => ({ 
                              ...prev, 
                              title: selected.title,
                              description: `Watch video: ${selected.title}`,
                              videoUrl: selected.url
                            }));
                          }
                        }}
                      >
                        <option value="">Choose from video library...</option>
                        {VIDEO_RESOURCE_OPTIONS.map(video => (
                          <option key={video.id} value={video.id}>{video.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newTask.type === 'form' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Form from Library</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => {
                          const selected = FORM_OPTIONS.find(f => f.id === e.target.value);
                          if (selected) {
                            setNewTask(prev => ({ 
                              ...prev, 
                              title: selected.title,
                              description: `Complete assessment: ${selected.title}`,
                              formType: selected.type
                            }));
                          }
                        }}
                      >
                        <option value="">Choose from form library...</option>
                        {FORM_OPTIONS.map(form => (
                          <option key={form.id} value={form.id}>{form.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newTask.type === 'exercise' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Exercise from Library</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => {
                          const selected = EXERCISE_OPTIONS.find(ex => ex.id === e.target.value);
                          if (selected) {
                            setNewTask(prev => ({ 
                              ...prev, 
                              title: selected.title,
                              description: `Exercise: ${selected.title} (${selected.category})`,
                              exerciseCategory: selected.category
                            }));
                          }
                        }}
                      >
                        <option value="">Choose from exercise library...</option>
                        {EXERCISE_OPTIONS.map(exercise => (
                          <option key={exercise.id} value={exercise.id}>{exercise.title} ({exercise.category})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        value={newTask.duration || ''}
                        onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || undefined })}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <Input
                        value={newTask.frequency || ''}
                        onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                        placeholder="3 times daily"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTask.required}
                        onChange={(e) => setNewTask({ ...newTask, required: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Required task</span>
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={addTaskToDay}
                      disabled={!newTask.title}
                      className="flex-1"
                    >
                      Add Task
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowTaskModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Protocol List */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'admin' ? 'Recovery Protocols - Admin' : 'Recovery Protocols - Practice'}
          </h1>
          <p className="text-gray-600">
            {mode === 'admin' 
              ? 'Create standard protocols for all patients'
              : 'Build and customize recovery protocols for your practice'
            }
          </p>
        </div>
        <Button 
          onClick={createNewProtocol}
          className={mode === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Protocol
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map(protocol => (
          <Card key={protocol.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{protocol.name}</CardTitle>
                  <p className="text-sm text-gray-600">{protocol.surgery_type}</p>
                </div>
                <Badge variant={protocol.is_active ? "default" : "secondary"}>
                  {protocol.is_active ? 'Active' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">{protocol.description}</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div>Duration: {protocol.duration_weeks} weeks</div>
                <div>
                  Tasks: {Object.values(protocol.timeline_data || {}).reduce((acc, tasks) => acc + tasks.length, 0)}
                </div>
                <div>
                  Days covered: {Object.keys(protocol.timeline_data || {}).length}
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentProtocol(protocol)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {protocols.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <div className="text-xl font-medium mb-2">No protocols created yet</div>
            <div className="text-gray-600 mb-4">
              Create your first recovery protocol to get started
            </div>
            <Button onClick={createNewProtocol}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Protocol
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}