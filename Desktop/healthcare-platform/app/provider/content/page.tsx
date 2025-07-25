'use client'

import React, { useState, useEffect } from 'react'
import { HealthcareSidebar } from '@/components/layout/healthcare-sidebar'
import { Card, CardContent, CardHeader } from '@/components/ui/design-system/Card'
import { Button } from '@/components/ui/design-system/Button'
import { Input } from '@/components/ui/design-system/Input'
import { Textarea } from '@/components/ui/design-system/Textarea'
import { StatusIndicator } from '@/components/ui/design-system/StatusIndicator'
import {
  FileText,
  Video,
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  X,
  Save,
  Upload,
  Clock,
  Calendar,
  Hash,
  Target,
  Repeat,
  Timer,
  TrendingUp,
  Link,
  ExternalLink,
  Play,
  CheckSquare,
  Loader2
} from 'lucide-react'
import { contentService } from '@/lib/services/content-service'

type ContentType = 'forms' | 'videos' | 'exercises';

interface BaseContent {
  id: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface FormContent extends BaseContent {
  type: 'form';
  category: 'assessment' | 'intake' | 'survey' | 'outcome';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  phase: 'pre-op' | 'post-op' | 'recovery' | 'follow-up';
  estimated_time: string;
  fields: any[];
  is_active: boolean;
}

interface VideoContent extends BaseContent {
  type: 'video';
  category: 'education' | 'exercise' | 'procedure';
  url: string;
  duration: string;
  thumbnail_url: string;
}

interface ExerciseContent extends BaseContent {
  type: 'exercise';
  category: 'mobility' | 'strength' | 'balance' | 'cardio' | 'flexibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phase: 'pre-op' | 'early' | 'intermediate' | 'advanced';
  duration: string;
  body_parts: string[];
  equipment: string[];
  instructions: string[];
  repetitions: string;
  sets: string;
  precautions: string[];
  benefits: string[];
  video_url?: string;
  image_url?: string;
}

type ContentItem = FormContent | VideoContent | ExerciseContent;

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('forms')
  const [content, setContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContent()
  }, [activeTab])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      let data: any[] = []
      
      switch (activeTab) {
        case 'forms':
          data = await contentService.getForms()
          break
        case 'videos':
          data = await contentService.getVideos()
          break
        case 'exercises':
          data = await contentService.getExercises()
          break
      }
      
      setContent(data.map(item => ({ ...item, type: activeTab.slice(0, -1) as any })))
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryOptions = () => {
    switch (activeTab) {
      case 'forms':
        return ['assessment', 'intake', 'survey', 'outcome']
      case 'videos':
        return ['education', 'exercise', 'procedure']
      case 'exercises':
        return ['mobility', 'strength', 'balance', 'cardio', 'flexibility']
      default:
        return []
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      assessment: 'bg-blue-100 text-blue-800',
      intake: 'bg-green-100 text-green-800',
      survey: 'bg-purple-100 text-purple-800',
      outcome: 'bg-orange-100 text-orange-800',
      education: 'bg-blue-100 text-blue-800',
      exercise: 'bg-purple-100 text-purple-800',
      procedure: 'bg-green-100 text-green-800',
      mobility: 'bg-blue-100 text-blue-800',
      strength: 'bg-red-100 text-red-800',
      balance: 'bg-green-100 text-green-800',
      cardio: 'bg-purple-100 text-purple-800',
      flexibility: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-5 w-5 text-blue-600" />
      case 'video': return <Video className="h-5 w-5 text-purple-600" />
      case 'exercise': return <Activity className="h-5 w-5 text-green-600" />
      default: return null
    }
  }

  const handleDelete = async (id: string) => {
    try {
      switch (activeTab) {
        case 'forms':
          await contentService.deleteForm(id)
          break
        case 'videos':
          await contentService.deleteVideo(id)
          break
        case 'exercises':
          await contentService.deleteExercise(id)
          break
      }
      await loadContent()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <HealthcareSidebar userRole="provider" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
                <p className="text-gray-600 mt-1">
                  Manage forms, videos, and exercises for patient protocols
                </p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Add {activeTab.slice(0, -1)}
              </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('forms')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === 'forms'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Forms
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === 'videos'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Video className="h-4 w-4" />
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab('exercises')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === 'exercises'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Exercises
                </button>
              </nav>
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
                        placeholder={`Search ${activeTab}...`}
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
                      {getCategoryOptions().map(cat => (
                        <option key={cat} value={cat} className="capitalize">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredContent.length} {activeTab}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onEdit={() => {
                      setEditingItem(item)
                      setShowAddModal(true)
                    }}
                    onDelete={() => handleDelete(item.id)}
                    onPreview={() => setPreviewItem(item)}
                  />
                ))}
              </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
              <ContentModal
                type={activeTab}
                item={editingItem}
                onClose={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                }}
                onSave={async (data) => {
                  setSaving(true)
                  try {
                    if (editingItem) {
                      // Update existing
                      switch (activeTab) {
                        case 'forms':
                          await contentService.updateForm(editingItem.id, data)
                          break
                        case 'videos':
                          await contentService.updateVideo(editingItem.id, data)
                          break
                        case 'exercises':
                          await contentService.updateExercise(editingItem.id, data)
                          break
                      }
                    } else {
                      // Create new
                      switch (activeTab) {
                        case 'forms':
                          await contentService.createForm(data)
                          break
                        case 'videos':
                          await contentService.createVideo(data)
                          break
                        case 'exercises':
                          await contentService.createExercise(data)
                          break
                      }
                    }
                    await loadContent()
                    setShowAddModal(false)
                    setEditingItem(null)
                  } catch (error) {
                    console.error('Error saving content:', error)
                  } finally {
                    setSaving(false)
                  }
                }}
              />
            )}

            {/* Preview Modal */}
            {previewItem && (
              <ContentPreviewModal
                item={previewItem}
                onClose={() => setPreviewItem(null)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Content Card Component
function ContentCard({ item, onEdit, onDelete, onPreview }: {
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="h-5 w-5 text-blue-600" />
      case 'video': return <Video className="h-5 w-5 text-purple-600" />
      case 'exercise': return <Activity className="h-5 w-5 text-green-600" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      assessment: 'bg-blue-100 text-blue-800',
      intake: 'bg-green-100 text-green-800',
      survey: 'bg-purple-100 text-purple-800',
      outcome: 'bg-orange-100 text-orange-800',
      education: 'bg-blue-100 text-blue-800',
      exercise: 'bg-purple-100 text-purple-800',
      procedure: 'bg-green-100 text-green-800',
      mobility: 'bg-blue-100 text-blue-800',
      strength: 'bg-red-100 text-red-800',
      balance: 'bg-green-100 text-green-800',
      cardio: 'bg-purple-100 text-purple-800',
      flexibility: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card variant="default" interactive>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getContentIcon(item.type)}
            {item.type === 'form' && 'is_active' in item && (
              <StatusIndicator 
                status={item.is_active ? 'success' : 'warning'} 
                size="sm"
              />
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onPreview}
              className="text-gray-400 hover:text-blue-600"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            {item.type === 'video' && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{item.duration}</span>
              </div>
            )}
            {item.type === 'exercise' && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                item.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.difficulty}
              </span>
            )}
          </div>

          {item.type === 'form' && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {item.frequency === 'once' ? <Hash className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                <span className="capitalize">{item.frequency}</span>
              </div>
              <span>{item.estimated_time}</span>
            </div>
          )}

          {item.type === 'exercise' && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{item.duration}</span>
              </div>
              {item.repetitions && (
                <div className="flex items-center gap-1">
                  <Repeat className="h-4 w-4" />
                  <span>{item.repetitions}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-1 flex-wrap">
            {item.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Content Modal Component
function ContentModal({ type, item, onClose, onSave }: {
  type: ContentType;
  item: ContentItem | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState<any>(() => {
    if (item) {
      return {
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags.join(', '),
        ...getTypeSpecificData(item)
      }
    }
    
    return getDefaultFormData(type)
  })

  function getTypeSpecificData(item: ContentItem): any {
    switch (item.type) {
      case 'form':
        return {
          frequency: item.frequency,
          phase: item.phase,
          estimated_time: item.estimated_time,
          is_active: item.is_active,
          fields: item.fields
        }
      case 'video':
        return {
          url: item.url,
          duration: item.duration
        }
      case 'exercise':
        return {
          difficulty: item.difficulty,
          phase: item.phase,
          duration: item.duration,
          body_parts: item.body_parts.join(', '),
          equipment: item.equipment.join(', '),
          instructions: item.instructions.join('\n'),
          repetitions: item.repetitions,
          sets: item.sets,
          precautions: item.precautions.join('\n'),
          benefits: item.benefits.join('\n')
        }
    }
  }

  function getDefaultFormData(type: ContentType): any {
    const base = {
      title: '',
      description: '',
      tags: ''
    }

    switch (type) {
      case 'forms':
        return {
          ...base,
          category: 'assessment',
          frequency: 'daily',
          phase: 'post-op',
          estimated_time: '5 minutes',
          is_active: true,
          fields: []
        }
      case 'videos':
        return {
          ...base,
          category: 'education',
          url: '',
          duration: ''
        }
      case 'exercises':
        return {
          ...base,
          category: 'mobility',
          difficulty: 'beginner',
          phase: 'early',
          duration: '5 minutes',
          body_parts: '',
          equipment: '',
          instructions: '',
          repetitions: '',
          sets: '',
          precautions: '',
          benefits: ''
        }
    }
  }

  const handleSave = () => {
    const data = {
      ...formData,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    }

    // Process type-specific data
    if (type === 'exercises') {
      data.body_parts = formData.body_parts.split(',').map((part: string) => part.trim()).filter(Boolean)
      data.equipment = formData.equipment.split(',').map((eq: string) => eq.trim()).filter(Boolean)
      data.instructions = formData.instructions.split('\n').map((inst: string) => inst.trim()).filter(Boolean)
      data.precautions = formData.precautions.split('\n').map((prec: string) => prec.trim()).filter(Boolean)
      data.benefits = formData.benefits.split('\n').map((ben: string) => ben.trim()).filter(Boolean)
    }

    onSave(data)
  }

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={item ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`}
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
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {getCategoryOptions(type).map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* Type-specific fields */}
          {type === 'forms' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phase
                  </label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pre-op">Pre-Op</option>
                    <option value="post-op">Post-Op</option>
                    <option value="recovery">Recovery</option>
                    <option value="follow-up">Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time
                  </label>
                  <Input
                    value={formData.estimated_time}
                    onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                    placeholder="5 minutes"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active form</span>
                </label>
              </div>
            </>
          )}

          {type === 'videos' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL *
                </label>
                <div className="relative">
                  <Link className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12:30"
                />
              </div>
            </>
          )}

          {type === 'exercises' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pre-op">Pre-Op</option>
                    <option value="early">Early</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Parts (comma separated)
                  </label>
                  <Input
                    value={formData.body_parts}
                    onChange={(e) => setFormData({ ...formData, body_parts: e.target.value })}
                    placeholder="knee, hip, ankle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment (comma separated)
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
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {item ? 'Update' : 'Create'} {type.slice(0, -1)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function getCategoryOptions(type: ContentType): string[] {
    switch (type) {
      case 'forms':
        return ['assessment', 'intake', 'survey', 'outcome']
      case 'videos':
        return ['education', 'exercise', 'procedure']
      case 'exercises':
        return ['mobility', 'strength', 'balance', 'cardio', 'flexibility']
      default:
        return []
    }
  }
}

// Content Preview Modal
function ContentPreviewModal({ item, onClose }: {
  item: ContentItem;
  onClose: () => void;
}) {
  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={item.title}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="overflow-y-auto space-y-6">
          {/* Type-specific preview content */}
          {item.type === 'video' && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(item.url)}`}
                title={item.title}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{item.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-blue-600">
              {item.type === 'form' && (
                <>
                  <span>📝 {item.fields?.length || 0} fields</span>
                  <span>⏱️ {item.estimated_time}</span>
                  <span>🔄 {item.frequency}</span>
                </>
              )}
              {item.type === 'video' && (
                <>
                  <span>⏱️ {item.duration}</span>
                  <span>📹 {item.category}</span>
                </>
              )}
              {item.type === 'exercise' && (
                <>
                  <span>⏱️ {item.duration}</span>
                  <span>💪 {item.difficulty}</span>
                  {item.repetitions && <span>🔄 {item.repetitions} reps</span>}
                  {item.sets && <span>🎯 {item.sets} sets</span>}
                </>
              )}
            </div>
          </div>

          {item.type === 'form' && item.fields && item.fields.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Form Fields:</h4>
              {item.fields.map((field: any, index: number) => (
                <div key={field.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {field.type.replace('_', ' ')}
                      </span>
                      {field.required && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  {field.options && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Options:</div>
                      <div className="flex flex-wrap gap-1">
                        {field.options.map((option: string) => (
                          <span key={option} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {item.type === 'exercise' && (
            <>
              {item.instructions && item.instructions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Instructions:</h4>
                  <ol className="space-y-2">
                    {item.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {item.body_parts && item.body_parts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Body Parts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.body_parts.map(part => (
                        <span key={part} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full capitalize">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.equipment && item.equipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Equipment:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.equipment.map(eq => (
                        <span key={eq} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full capitalize">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {item.precautions && item.precautions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">⚠️ Precautions:</h4>
                  <ul className="space-y-1">
                    {item.precautions.map((precaution, index) => (
                      <li key={index} className="text-orange-700 text-sm">
                        • {precaution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.benefits && item.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">✅ Benefits:</h4>
                  <ul className="space-y-1">
                    {item.benefits.map((benefit, index) => (
                      <li key={index} className="text-green-700 text-sm">
                        • {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}