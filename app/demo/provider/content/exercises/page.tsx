'use client'

import React, { useState } from 'react'
import { DemoProtectedRoute } from '@/components/auth/demo-auth-provider'
import { DemoHealthcareLayout } from '@/components/layout/demo-healthcare-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Play,
  Clock,
  Eye,
  X,
  Save,
  Target,
  Repeat,
  Timer,
  TrendingUp
} from 'lucide-react'

interface ExerciseItem {
  id: string
  title: string
  description: string
  instructions: string[]
  category: 'mobility' | 'strength' | 'balance' | 'cardio' | 'flexibility'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  bodyPart: string[]
  equipment: string[]
  duration: string
  repetitions?: string
  sets?: string
  phase: 'pre-op' | 'early' | 'intermediate' | 'advanced'
  videoUrl?: string
  imageUrl?: string
  precautions: string[]
  benefits: string[]
  createdAt: string
  updatedAt: string
  isActive: boolean
  tags: string[]
}

const initialExercises: ExerciseItem[] = [
  {
    id: '1',
    title: 'Ankle Pumps',
    description: 'Basic circulation exercise to prevent blood clots and improve lower leg circulation.',
    instructions: [
      'Lie down comfortably with legs extended',
      'Point your toes away from your body',
      'Pull your toes back toward your body',
      'Repeat slowly and smoothly'
    ],
    category: 'mobility',
    difficulty: 'beginner',
    bodyPart: ['ankle', 'calf'],
    equipment: ['none'],
    duration: '5 minutes',
    repetitions: '10-15',
    sets: '3-4',
    phase: 'early',
    precautions: ['Stop if you feel pain', 'Move slowly and controlled'],
    benefits: ['Improves circulation', 'Prevents blood clots', 'Maintains ankle mobility'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isActive: true,
    tags: ['circulation', 'early-recovery', 'bed-exercise']
  },
  {
    id: '2',
    title: 'Quad Sets',
    description: 'Quadriceps strengthening exercise essential for knee stability and function.',
    instructions: [
      'Lie flat with operated leg straight',
      'Tighten the muscles on top of your thigh',
      'Push the back of your knee down into the bed',
      'Hold for 5 seconds, then relax'
    ],
    category: 'strength',
    difficulty: 'beginner',
    bodyPart: ['quadriceps', 'knee'],
    equipment: ['none'],
    duration: '5 minutes',
    repetitions: '10',
    sets: '3',
    phase: 'early',
    precautions: ['Avoid if knee pain increases', 'Keep movement controlled'],
    benefits: ['Strengthens quadriceps', 'Improves knee stability', 'Prevents muscle atrophy'],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    isActive: true,
    tags: ['strengthening', 'quadriceps', 'knee-stability']
  },
  {
    id: '3',
    title: 'Heel Slides',
    description: 'Gentle knee flexion exercise to improve range of motion and prevent stiffness.',
    instructions: [
      'Lie on your back with both legs straight',
      'Slowly bend your operated knee by sliding your heel toward your buttocks',
      'Go only as far as comfortable',
      'Slowly slide your heel back to starting position'
    ],
    category: 'mobility',
    difficulty: 'beginner',
    bodyPart: ['knee', 'hamstring'],
    equipment: ['none'],
    duration: '10 minutes',
    repetitions: '10-15',
    sets: '2-3',
    phase: 'early',
    precautions: ['Stop if sharp pain occurs', 'Progress gradually', 'Ice after if swollen'],
    benefits: ['Improves knee flexion', 'Prevents stiffness', 'Maintains range of motion'],
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    isActive: true,
    tags: ['flexibility', 'range-of-motion', 'knee-flexion']
  },
  {
    id: '4',
    title: 'Stationary Bike',
    description: 'Low-impact cardiovascular exercise that improves endurance and knee mobility.',
    instructions: [
      'Adjust seat height so knee has slight bend when pedal is at lowest point',
      'Start with no resistance',
      'Pedal at comfortable pace',
      'Gradually increase duration as tolerated'
    ],
    category: 'cardio',
    difficulty: 'intermediate',
    bodyPart: ['knee', 'hip', 'ankle'],
    equipment: ['stationary bike'],
    duration: '15-30 minutes',
    phase: 'intermediate',
    precautions: ['Start with short sessions', 'Avoid high resistance initially', 'Stop if pain increases'],
    benefits: ['Improves cardiovascular fitness', 'Enhances joint mobility', 'Low joint impact'],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    isActive: true,
    tags: ['cardiovascular', 'low-impact', 'endurance']
  }
]

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>(initialExercises)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null)
  const [previewExercise, setPreviewExercise] = useState<ExerciseItem | null>(null)

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         exercise.bodyPart.some(part => part.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    const matchesPhase = selectedPhase === 'all' || exercise.phase === selectedPhase
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesPhase && matchesDifficulty
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mobility': return 'bg-blue-100 text-blue-800'
      case 'strength': return 'bg-red-100 text-red-800'
      case 'balance': return 'bg-green-100 text-green-800'
      case 'cardio': return 'bg-purple-100 text-purple-800'
      case 'flexibility': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'pre-op': return 'bg-blue-100 text-blue-800'
      case 'early': return 'bg-yellow-100 text-yellow-800'
      case 'intermediate': return 'bg-green-100 text-green-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
              <p className="text-gray-600 mt-1">
                Manage rehabilitation exercises for all recovery phases
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Exercise
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search exercises, body parts, or tags..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="mobility">Mobility</option>
                    <option value="strength">Strength</option>
                    <option value="balance">Balance</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
                <div>
                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Phases</option>
                    <option value="pre-op">Pre-Op</option>
                    <option value="early">Early</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredExercises.length} exercises
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} variant="default" interactive>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <StatusIndicator 
                        status={exercise.isActive ? 'success' : 'warning'} 
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewExercise(exercise)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Preview exercise"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingExercise(exercise)
                          setShowAddModal(true)
                        }}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit exercise"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setExercises(exercises.filter(e => e.id !== exercise.id))
                        }}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete exercise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {exercise.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exercise.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(exercise.category)}`}>
                        {exercise.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPhaseColor(exercise.phase)}`}>
                        {exercise.phase} phase
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.duration}</span>
                      </div>
                    </div>

                    {(exercise.repetitions || exercise.sets) && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        {exercise.repetitions && (
                          <div className="flex items-center gap-1">
                            <Repeat className="h-4 w-4" />
                            <span>{exercise.repetitions}</span>
                          </div>
                        )}
                        {exercise.sets && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{exercise.sets} sets</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {exercise.bodyPart.slice(0, 2).map(part => (
                        <span key={part} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {part}
                        </span>
                      ))}
                      {exercise.bodyPart.length > 2 && (
                        <span className="text-xs text-gray-400">+{exercise.bodyPart.length - 2}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Exercise Modal */}
          {showAddModal && (
            <ExerciseModal
              exercise={editingExercise}
              onClose={() => {
                setShowAddModal(false)
                setEditingExercise(null)
              }}
              onSave={(exerciseData) => {
                const newExercise: ExerciseItem = {
                  id: editingExercise?.id || Date.now().toString(),
                  ...exerciseData,
                  createdAt: editingExercise?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }

                if (editingExercise) {
                  setExercises(exercises.map(e => e.id === editingExercise.id ? newExercise : e))
                } else {
                  setExercises([...exercises, newExercise])
                }
                
                setShowAddModal(false)
                setEditingExercise(null)
              }}
            />
          )}

          {/* Exercise Preview Modal */}
          {previewExercise && (
            <ExercisePreviewModal
              exercise={previewExercise}
              onClose={() => setPreviewExercise(null)}
            />
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

// Exercise Modal Component
function ExerciseModal({ exercise, onClose, onSave }: {
  exercise: ExerciseItem | null
  onClose: () => void
  onSave: (exercise: Omit<ExerciseItem, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [formData, setFormData] = useState({
    title: exercise?.title || '',
    description: exercise?.description || '',
    category: exercise?.category || 'mobility',
    difficulty: exercise?.difficulty || 'beginner',
    phase: exercise?.phase || 'early',
    duration: exercise?.duration || '5 minutes',
    repetitions: exercise?.repetitions || '',
    sets: exercise?.sets || '',
    isActive: exercise?.isActive ?? true,
    tags: exercise?.tags.join(', ') || '',
    bodyPart: exercise?.bodyPart.join(', ') || '',
    equipment: exercise?.equipment.join(', ') || '',
    instructions: exercise?.instructions.join('\n') || '',
    precautions: exercise?.precautions.join('\n') || '',
    benefits: exercise?.benefits.join('\n') || ''
  })

  const handleSave = () => {
    if (formData.title && formData.description) {
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        bodyPart: formData.bodyPart.split(',').map(part => part.trim()).filter(Boolean),
        equipment: formData.equipment.split(',').map(eq => eq.trim()).filter(Boolean),
        instructions: formData.instructions.split('\n').map(inst => inst.trim()).filter(Boolean),
        precautions: formData.precautions.split('\n').map(prec => prec.trim()).filter(Boolean),
        benefits: formData.benefits.split('\n').map(ben => ben.trim()).filter(Boolean)
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={exercise ? 'Edit Exercise' : 'Add New Exercise'}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Exercise name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="5 minutes"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the exercise..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="mobility">Mobility</option>
                <option value="strength">Strength</option>
                <option value="balance">Balance</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase
              </label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="pre-op">Pre-Op</option>
                <option value="early">Early</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repetitions
              </label>
              <Input
                value={formData.repetitions}
                onChange={(e) => setFormData({ ...formData, repetitions: e.target.value })}
                placeholder="10-15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sets
              </label>
              <Input
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Parts
              </label>
              <Input
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                placeholder="knee, hip, ankle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment
              </label>
              <Input
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="none, chair, theraband"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (one per line)
            </label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step 1: Position yourself...&#10;Step 2: Perform the movement..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precautions (one per line)
              </label>
              <Textarea
                value={formData.precautions}
                onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                placeholder="Stop if pain increases&#10;Move slowly and controlled"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits (one per line)
              </label>
              <Textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Improves strength&#10;Increases flexibility"
                rows={3}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="strengthening, early-recovery, beginner"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {exercise ? 'Update' : 'Add'} Exercise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Exercise Preview Modal
function ExercisePreviewModal({ exercise, onClose }: {
  exercise: ExerciseItem
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={exercise.title}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="overflow-y-auto space-y-6">
          {/* Exercise Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-3">{exercise.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-blue-700">
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>{exercise.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{exercise.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>{exercise.duration}</span>
              </div>
              {exercise.repetitions && (
                <div className="flex items-center gap-1">
                  <Repeat className="h-4 w-4" />
                  <span>{exercise.repetitions}</span>
                </div>
              )}
              {exercise.sets && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{exercise.sets} sets</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Body Parts & Equipment */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Body Parts:</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.bodyPart.map(part => (
                  <span key={part} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full capitalize">
                    {part}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Equipment:</h4>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map(eq => (
                  <span key={eq} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full capitalize">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Precautions & Benefits */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚠️ Precautions:</h4>
              <ul className="space-y-1">
                {exercise.precautions.map((precaution, index) => (
                  <li key={index} className="text-orange-700 text-sm">
                    • {precaution}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✅ Benefits:</h4>
              <ul className="space-y-1">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-green-700 text-sm">
                    • {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}