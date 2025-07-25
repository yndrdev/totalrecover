'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Plus } from 'lucide-react'

interface Task {
  id: string
  name: string
  description: string
  category: 'exercise' | 'assessment' | 'medication' | 'education'
  day: number
  duration_minutes: number
}

export default function NewProtocol() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 14,
    surgery_type: '',
    difficulty_level: 'moderate'
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    category: 'exercise' as const,
    day: 1,
    duration_minutes: 30
  })

  const addTask = () => {
    if (newTask.name.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask
      }
      setTasks([...tasks, task])
      setNewTask({
        name: '',
        description: '',
        category: 'exercise',
        day: 1,
        duration_minutes: 30
      })
    }
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleSave = () => {
    // TODO: Save to Supabase
    console.log('Saving protocol:', formData, tasks)
    router.push('/provider/protocols')
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-[#F5F8FA] text-[#002238]"
              onClick={() => router.push('/provider/protocols')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Protocols
            </Button>
            <h1 className="text-2xl font-bold text-[#002238]">Create New Protocol</h1>
          </div>
          <Button onClick={handleSave} className="bg-[#006DB1] hover:bg-[#002238]">
            <Save className="h-4 w-4 mr-2" />
            Save Protocol
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Protocol Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#002238]">Protocol Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Protocol Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Total Knee Replacement Recovery"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the protocol purpose and goals"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="surgery_type">Surgery Type</Label>
                <Select value={formData.surgery_type} onValueChange={(value) => setFormData({...formData, surgery_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select surgery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total_knee">Total Knee Replacement</SelectItem>
                    <SelectItem value="partial_knee">Partial Knee Replacement</SelectItem>
                    <SelectItem value="hip_replacement">Hip Replacement</SelectItem>
                    <SelectItem value="shoulder">Shoulder Surgery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration_days">Duration (Days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({...formData, difficulty_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Add Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#002238]">Add Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="task_name">Task Name</Label>
                <Input
                  id="task_name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  placeholder="e.g., Ankle pumps"
                />
              </div>
              <div>
                <Label htmlFor="task_description">Task Description</Label>
                <Textarea
                  id="task_description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Describe how to perform this task"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTask.category} onValueChange={(value: any) => setNewTask({...newTask, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    type="number"
                    value={newTask.day}
                    onChange={(e) => setNewTask({...newTask, day: parseInt(e.target.value)})}
                    min="1"
                    max={formData.duration_days}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newTask.duration_minutes}
                  onChange={(e) => setNewTask({...newTask, duration_minutes: parseInt(e.target.value)})}
                  min="1"
                  max="120"
                />
              </div>
              <Button onClick={addTask} className="w-full bg-[#006DB1] hover:bg-[#002238]">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-[#002238]">Protocol Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[#002238]">{task.name}</span>
                        <span className="text-xs px-2 py-1 bg-[#006DB1] text-white rounded-full">
                          {task.category}
                        </span>
                        <span className="text-xs text-gray-500">Day {task.day}</span>
                        <span className="text-xs text-gray-500">{task.duration_minutes}min</span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(task.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}