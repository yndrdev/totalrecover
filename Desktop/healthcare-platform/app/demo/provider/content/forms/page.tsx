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
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  X,
  Save,
  Copy,
  Download,
  CheckSquare,
  Calendar,
  Hash
} from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'number' | 'scale' | 'multiple_choice' | 'date' | 'checkbox'
  label: string
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

interface FormItem {
  id: string
  title: string
  description: string
  category: 'assessment' | 'intake' | 'survey' | 'outcome'
  fields: FormField[]
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  phase: 'pre-op' | 'post-op' | 'recovery' | 'follow-up'
  estimatedTime: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  tags: string[]
}

const initialForms: FormItem[] = [
  {
    id: '1',
    title: 'Pain Assessment Scale',
    description: 'Daily pain evaluation using validated pain scales and functional assessment.',
    category: 'assessment',
    fields: [
      {
        id: 'pain-level',
        type: 'scale',
        label: 'Rate your pain level (0-10)',
        required: true,
        min: 0,
        max: 10
      },
      {
        id: 'pain-location',
        type: 'multiple_choice',
        label: 'Where is your pain located?',
        required: true,
        options: ['Knee', 'Hip', 'Shoulder', 'Back', 'Multiple locations']
      },
      {
        id: 'pain-interference',
        type: 'scale',
        label: 'How much does pain interfere with daily activities? (0-10)',
        required: true,
        min: 0,
        max: 10
      }
    ],
    frequency: 'daily',
    phase: 'post-op',
    estimatedTime: '3 minutes',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isActive: true,
    tags: ['pain', 'assessment', 'daily']
  },
  {
    id: '2',
    title: 'Pre-Surgery Health Assessment',
    description: 'Comprehensive health evaluation before joint replacement surgery.',
    category: 'intake',
    fields: [
      {
        id: 'medical-history',
        type: 'checkbox',
        label: 'Check all that apply to your medical history',
        required: false,
        options: ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'Previous Surgeries', 'Allergies']
      },
      {
        id: 'activity-level',
        type: 'multiple_choice',
        label: 'How would you describe your current activity level?',
        required: true,
        options: ['Very Active', 'Moderately Active', 'Somewhat Active', 'Sedentary']
      },
      {
        id: 'goals',
        type: 'text',
        label: 'What are your main goals for this surgery?',
        required: true
      }
    ],
    frequency: 'once',
    phase: 'pre-op',
    estimatedTime: '10 minutes',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    isActive: true,
    tags: ['pre-surgery', 'intake', 'baseline']
  },
  {
    id: '3',
    title: 'Weekly Progress Survey',
    description: 'Track recovery progress, mobility improvements, and any concerns.',
    category: 'survey',
    fields: [
      {
        id: 'mobility-improvement',
        type: 'scale',
        label: 'Rate your mobility improvement this week (1-10)',
        required: true,
        min: 1,
        max: 10
      },
      {
        id: 'exercise-compliance',
        type: 'multiple_choice',
        label: 'How many days did you complete your exercises?',
        required: true,
        options: ['0-1 days', '2-3 days', '4-5 days', '6-7 days']
      },
      {
        id: 'concerns',
        type: 'text',
        label: 'Any concerns or questions this week?',
        required: false
      }
    ],
    frequency: 'weekly',
    phase: 'recovery',
    estimatedTime: '5 minutes',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    isActive: true,
    tags: ['progress', 'survey', 'weekly']
  }
]

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>(initialForms)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingForm, setEditingForm] = useState<FormItem | null>(null)
  const [previewForm, setPreviewForm] = useState<FormItem | null>(null)

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory
    const matchesPhase = selectedPhase === 'all' || form.phase === selectedPhase
    return matchesSearch && matchesCategory && matchesPhase
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'assessment': return 'bg-blue-100 text-blue-800'
      case 'intake': return 'bg-green-100 text-green-800'
      case 'survey': return 'bg-purple-100 text-purple-800'
      case 'outcome': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'pre-op': return 'bg-yellow-100 text-yellow-800'
      case 'post-op': return 'bg-red-100 text-red-800'
      case 'recovery': return 'bg-green-100 text-green-800'
      case 'follow-up': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'once': return <Hash className="h-4 w-4" />
      case 'daily': return <Calendar className="h-4 w-4" />
      case 'weekly': return <Calendar className="h-4 w-4" />
      case 'monthly': return <Calendar className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <DemoProtectedRoute>
      <DemoHealthcareLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Library</h1>
              <p className="text-gray-600 mt-1">
                Manage assessment forms, surveys, and intake documents
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Create Form
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
                      placeholder="Search forms, descriptions, or tags..."
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
                    <option value="assessment">Assessment</option>
                    <option value="intake">Intake</option>
                    <option value="survey">Survey</option>
                    <option value="outcome">Outcome</option>
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
                    <option value="post-op">Post-Op</option>
                    <option value="recovery">Recovery</option>
                    <option value="follow-up">Follow-Up</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredForms.length} forms
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} variant="default" interactive>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <StatusIndicator 
                        status={form.isActive ? 'success' : 'warning'} 
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreviewForm(form)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Preview form"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingForm(form)
                          setShowAddModal(true)
                        }}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit form"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setForms(forms.filter(f => f.id !== form.id))
                        }}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete form"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {form.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {form.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(form.category)}`}>
                        {form.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPhaseColor(form.phase)}`}>
                        {form.phase}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {getFrequencyIcon(form.frequency)}
                        <span className="capitalize">{form.frequency}</span>
                      </div>
                      <span>{form.estimatedTime}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{form.fields.length} fields</span>
                      <div className="flex gap-1">
                        {form.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {form.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{form.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Form Modal */}
          {showAddModal && (
            <FormModal
              form={editingForm}
              onClose={() => {
                setShowAddModal(false)
                setEditingForm(null)
              }}
              onSave={(formData) => {
                const newForm: FormItem = {
                  id: editingForm?.id || Date.now().toString(),
                  ...formData,
                  createdAt: editingForm?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }

                if (editingForm) {
                  setForms(forms.map(f => f.id === editingForm.id ? newForm : f))
                } else {
                  setForms([...forms, newForm])
                }
                
                setShowAddModal(false)
                setEditingForm(null)
              }}
            />
          )}

          {/* Form Preview Modal */}
          {previewForm && (
            <FormPreviewModal
              form={previewForm}
              onClose={() => setPreviewForm(null)}
            />
          )}
        </div>
      </DemoHealthcareLayout>
    </DemoProtectedRoute>
  )
}

// Form Modal Component
function FormModal({ form, onClose, onSave }: {
  form: FormItem | null
  onClose: () => void
  onSave: (form: Omit<FormItem, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [formData, setFormData] = useState({
    title: form?.title || '',
    description: form?.description || '',
    category: form?.category || 'assessment',
    phase: form?.phase || 'post-op',
    frequency: form?.frequency || 'daily',
    estimatedTime: form?.estimatedTime || '5 minutes',
    isActive: form?.isActive ?? true,
    tags: form?.tags.join(', ') || '',
    fields: form?.fields || []
  })

  const handleSave = () => {
    if (formData.title && formData.description) {
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={form ? 'Edit Form' : 'Create New Form'}
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
                placeholder="Form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time
              </label>
              <Input
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                placeholder="5 minutes"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and use of this form..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="assessment">Assessment</option>
                <option value="intake">Intake</option>
                <option value="survey">Survey</option>
                <option value="outcome">Outcome</option>
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
                <option value="post-op">Post-Op</option>
                <option value="recovery">Recovery</option>
                <option value="follow-up">Follow-Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="pain, assessment, daily"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active form</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {form ? 'Update' : 'Create'} Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Form Preview Modal
function FormPreviewModal({ form, onClose }: {
  form: FormItem
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader
          title={`Preview: ${form.title}`}
          action={
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          }
        />
        <CardContent className="overflow-y-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">{form.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-blue-600">
              <span>📝 {form.fields.length} fields</span>
              <span>⏱️ {form.estimatedTime}</span>
              <span>🔄 {form.frequency}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Form Fields:</h4>
            {form.fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
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
                      {field.options.map(option => (
                        <span key={option} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(field.min !== undefined || field.max !== undefined) && (
                  <div className="text-xs text-gray-600 mt-1">
                    Range: {field.min || 0} - {field.max || 'unlimited'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}