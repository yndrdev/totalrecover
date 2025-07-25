'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Plus,
  Upload,
  Edit,
  Trash2,
  Search,
  Eye,
  X,
  Save,
  Download,
  MessageSquare,
  Bot,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  MoreVertical,
  Sparkles,
  FileUp,
  Image,
  Loader,
  ArrowRight,
  Settings,
  Users,
  Calendar,
  Hash
} from 'lucide-react'

// Enhanced interfaces for AI-powered forms
interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'radio' | 'checkbox' | 'signature' | 'email' | 'phone'
  required: boolean
  options?: string[]
  validation_rules?: any
  conversational_prompt?: string
  display_order: number
  conditional_logic?: any
}

interface AIForm {
  id: string
  title: string
  description: string
  category: 'pre_op' | 'post_op' | 'assessment' | 'medical_history' | 'physical_therapy' | 'insurance' | 'administrative' | 'other'
  original_file_url?: string
  original_file_type?: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png'
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_processing_metadata?: any
  fields: FormField[]
  conversation_flow?: any
  requirements?: string
  created_at: string
  updated_at: string
  is_active: boolean
  tags: string[]
  estimated_time: string
  usage_count: number
}

interface FormAssignment {
  id: string
  form_id: string
  patient_id: string
  assigned_for_day: number
  assignment_status: 'assigned' | 'in_progress' | 'completed' | 'expired'
  completion_percentage: number
  ai_conversation_id?: string
  due_date?: string
  started_at?: string
  completed_at?: string
}

interface ValidationResults {
  overall_score: number
  field_validations: Array<{
    field_id: string
    field_name: string
    status: 'valid' | 'warning' | 'error'
    issues: string[]
    suggestions: string[]
  }>
  form_structure: {
    completeness: number
    clarity: number
    accessibility: number
  }
  recommendations: string[]
  estimated_completion_time: number
}

// Mock data for AI-powered forms
const mockAIForms: AIForm[] = [
  {
    id: '1',
    title: 'Pre-Operative Assessment Form',
    description: 'Comprehensive pre-surgery evaluation converted from uploaded PDF form using AI analysis',
    category: 'pre_op',
    original_file_url: '/forms/pre-op-assessment.pdf',
    original_file_type: 'pdf',
    processing_status: 'completed',
    ai_processing_metadata: {
      confidence_score: 0.94,
      fields_extracted: 12,
      processing_time_seconds: 45
    },
    fields: [
      {
        id: 'medical_history',
        name: 'medical_history',
        label: 'Medical History',
        type: 'textarea',
        required: true,
        conversational_prompt: 'Let me ask about your medical history. Can you tell me about any significant medical conditions you have or have had in the past?',
        display_order: 1
      },
      {
        id: 'current_medications',
        name: 'current_medications',
        label: 'Current Medications',
        type: 'textarea',
        required: true,
        conversational_prompt: 'What medications are you currently taking? Please include prescription drugs, over-the-counter medications, and supplements.',
        display_order: 2
      },
      {
        id: 'allergies',
        name: 'allergies',
        label: 'Known Allergies',
        type: 'textarea',
        required: true,
        conversational_prompt: 'Do you have any known allergies to medications, foods, or other substances?',
        display_order: 3
      },
      {
        id: 'patient_signature',
        name: 'patient_signature',
        label: 'Patient Signature',
        type: 'signature',
        required: true,
        conversational_prompt: 'Please provide your signature to confirm the information above is accurate.',
        display_order: 4
      },
      {
        id: 'patient_name_signature',
        name: 'patient_name_signature',
        label: 'Print Full Name',
        type: 'text',
        required: true,
        conversational_prompt: 'Please type your full name as it appears on your ID.',
        display_order: 5
      }
    ],
    conversation_flow: {
      introduction: 'Hi! I need to collect some important information before your surgery. This should only take about 10 minutes, and I\'ll guide you through each question.',
      completion_message: 'Perfect! Your pre-operative assessment is complete. Your surgical team will review this information before your procedure.'
    },
    requirements: 'Must be completed 48 hours before surgery',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    is_active: true,
    tags: ['pre-surgery', 'intake', 'required'],
    estimated_time: '10 minutes',
    usage_count: 24
  },
  {
    id: '2',
    title: 'Daily Pain Assessment',
    description: 'AI-converted pain tracking form that adapts questions based on patient responses',
    category: 'post_op',
    processing_status: 'completed',
    ai_processing_metadata: {
      confidence_score: 0.98,
      fields_extracted: 8,
      processing_time_seconds: 32
    },
    fields: [
      {
        id: 'pain_level',
        name: 'pain_level',
        label: 'Pain Level (0-10)',
        type: 'number',
        required: true,
        conversational_prompt: 'On a scale from 0 to 10, where 0 is no pain and 10 is the worst pain imaginable, how would you rate your current pain level?',
        display_order: 1,
        validation_rules: { min: 0, max: 10 }
      },
      {
        id: 'pain_location',
        name: 'pain_location',
        label: 'Pain Location',
        type: 'select',
        required: true,
        options: ['Surgical site', 'Joint', 'Muscle', 'Surrounding area', 'Other'],
        conversational_prompt: 'Where is your pain located primarily?',
        display_order: 2
      }
    ],
    conversation_flow: {
      introduction: 'Let me check on how you\'re feeling today. This quick assessment helps your care team monitor your recovery.',
      completion_message: 'Thank you for the update! Your care team will review this information and may adjust your treatment plan if needed.'
    },
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    is_active: true,
    tags: ['pain', 'daily', 'monitoring'],
    estimated_time: '3 minutes',
    usage_count: 156
  },
  {
    id: '3',
    title: 'Physical Therapy Progress Evaluation',
    description: 'Smart form that adjusts difficulty based on patient mobility level',
    category: 'physical_therapy',
    processing_status: 'completed',
    fields: [
      {
        id: 'range_of_motion',
        name: 'range_of_motion',
        label: 'Range of Motion (degrees)',
        type: 'number',
        required: true,
        conversational_prompt: 'Let\'s measure your progress. How many degrees can you bend your joint today?',
        display_order: 1
      },
      {
        id: 'exercise_difficulty',
        name: 'exercise_difficulty',
        label: 'Exercise Difficulty Level',
        type: 'select',
        required: true,
        options: ['Too Easy', 'Just Right', 'Challenging', 'Too Difficult'],
        conversational_prompt: 'How are you finding your current exercises?',
        display_order: 2
      }
    ],
    conversation_flow: {
      introduction: 'Time for your PT check-in! Let\'s see how your exercises are going and track your progress.',
      completion_message: 'Excellent work! Your physical therapist will review your progress and may adjust your exercise plan.'
    },
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
    is_active: true,
    tags: ['physical-therapy', 'progress', 'weekly'],
    estimated_time: '5 minutes',
    usage_count: 89
  }
]

export default function AIFormsPage() {
  const [forms, setForms] = useState<AIForm[]>(mockAIForms)
  const [activeTab, setActiveTab] = useState('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingForm, setEditingForm] = useState<AIForm | null>(null)
  const [previewForm, setPreviewForm] = useState<AIForm | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingForms, setProcessingForms] = useState<string[]>([])
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedFormForChat, setSelectedFormForChat] = useState<AIForm | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [selectedFormForValidation, setSelectedFormForValidation] = useState<AIForm | null>(null)
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null)

  // File upload handling
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    )
    setUploadedFiles(prev => [...prev, ...validFiles])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  // AI form processing simulation
  const processUploadedForms = async () => {
    for (const file of uploadedFiles) {
      const formId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      setProcessingForms(prev => [...prev, formId])
      
      // Simulate AI processing
      const newForm: AIForm = {
        id: formId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `AI-processed form from uploaded ${file.type.split('/')[1].toUpperCase()} file`,
        category: 'other',
        original_file_url: URL.createObjectURL(file),
        original_file_type: file.type.split('/')[1] as any,
        processing_status: 'processing',
        fields: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        tags: ['uploaded', 'ai-processed'],
        estimated_time: '5 minutes',
        usage_count: 0
      }

      setForms(prev => [...prev, newForm])

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Complete processing
      setForms(prev => prev.map(form => 
        form.id === formId 
          ? {
              ...form,
              processing_status: 'completed' as const,
              ai_processing_metadata: {
                confidence_score: 0.85 + Math.random() * 0.13,
                fields_extracted: Math.floor(Math.random() * 15) + 5,
                processing_time_seconds: Math.floor(Math.random() * 60) + 20
              },
              fields: generateMockFields()
            }
          : form
      ))

      setProcessingForms(prev => prev.filter(id => id !== formId))
    }

    setUploadedFiles([])
    setShowUploadModal(false)
  }

  const generateMockFields = (): FormField[] => {
    // Simulate AI analysis detecting various field types including signatures
    const possibleFields = [
      {
        id: 'field_1',
        name: 'patient_name',
        label: 'Patient Name',
        type: 'text' as const,
        required: true,
        conversational_prompt: 'What is your full name?',
        display_order: 1
      },
      {
        id: 'field_2',
        name: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date' as const,
        required: true,
        conversational_prompt: 'When is your date of birth?',
        display_order: 2
      },
      {
        id: 'field_3',
        name: 'symptoms',
        label: 'Current Symptoms',
        type: 'textarea' as const,
        required: true,
        conversational_prompt: 'Can you describe your current symptoms or concerns?',
        display_order: 3
      },
      {
        id: 'field_4',
        name: 'emergency_contact',
        label: 'Emergency Contact',
        type: 'text' as const,
        required: true,
        conversational_prompt: 'Who should we contact in case of emergency?',
        display_order: 4
      },
      {
        id: 'field_5',
        name: 'insurance_number',
        label: 'Insurance ID Number',
        type: 'text' as const,
        required: true,
        conversational_prompt: 'What is your insurance ID number?',
        display_order: 5
      },
      {
        id: 'field_6',
        name: 'patient_signature',
        label: 'Patient Signature',
        type: 'signature' as const,
        required: true,
        conversational_prompt: 'Please sign to confirm the accuracy of the information provided.',
        display_order: 6
      },
      {
        id: 'field_7',
        name: 'printed_name',
        label: 'Print Full Name',
        type: 'text' as const,
        required: true,
        conversational_prompt: 'Please print your full name exactly as it appears on your ID.',
        display_order: 7
      },
      {
        id: 'field_8',
        name: 'date_signed',
        label: 'Date Signed',
        type: 'date' as const,
        required: true,
        conversational_prompt: 'What is today\'s date?',
        display_order: 8
      }
    ]

    // Randomly select 3-6 fields, but ensure signature fields are often included
    const numFields = Math.floor(Math.random() * 4) + 3 // 3-6 fields
    const selectedFields: FormField[] = []
    
    // Always include basic fields
    selectedFields.push(possibleFields[0]) // patient_name
    
    // 70% chance to include signature fields for realism
    if (Math.random() > 0.3) {
      selectedFields.push(possibleFields[5]) // patient_signature
      selectedFields.push(possibleFields[6]) // printed_name
    }
    
    // Fill remaining slots with random fields
    const remainingFields = possibleFields.filter(f => !selectedFields.includes(f))
    while (selectedFields.length < numFields && remainingFields.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingFields.length)
      selectedFields.push(remainingFields.splice(randomIndex, 1)[0])
    }
    
    // Re-order by display_order
    return selectedFields.sort((a, b) => a.display_order - b.display_order)
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || form.processing_status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'pre_op': 'bg-blue-100 text-blue-800',
      'post_op': 'bg-red-100 text-red-800',
      'assessment': 'bg-purple-100 text-purple-800',
      'medical_history': 'bg-green-100 text-green-800',
      'physical_therapy': 'bg-orange-100 text-orange-800',
      'insurance': 'bg-yellow-100 text-yellow-800',
      'administrative': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Loader className="h-4 w-4 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleConvertToChat = (form: AIForm) => {
    setSelectedFormForChat(form)
    setShowChatModal(true)
  }

  const handleTestConversationFlow = (form: AIForm) => {
    setSelectedFormForChat(form)
    setShowChatModal(true)
    setPreviewForm(null) // Close preview modal
  }

  const handleValidateForm = (form: AIForm) => {
    setSelectedFormForValidation(form)
    
    // Simulate validation analysis
    const mockValidationResults: ValidationResults = {
      overall_score: 0.87,
      field_validations: form.fields.map((field, index) => ({
        field_id: field.id,
        field_name: field.label,
        status: Math.random() > 0.8 ? 'warning' : 'valid' as 'valid' | 'warning' | 'error',
        issues: Math.random() > 0.8 ? ['Field label could be more specific'] : [],
        suggestions: Math.random() > 0.7 ? ['Consider adding help text for clarity'] : []
      })),
      form_structure: {
        completeness: 0.92,
        clarity: 0.85,
        accessibility: 0.84
      },
      recommendations: [
        'Add progress indicators for multi-step forms',
        'Include field descriptions for complex medical terms',
        'Consider adding input validation messages'
      ],
      estimated_completion_time: Math.round(form.fields.length * 1.5)
    }
    
    setValidationResults(mockValidationResults)
    setShowValidationModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-600" />
                AI-Powered Forms
              </h1>
              <p className="text-gray-600 mt-2">
                Upload, convert, and manage intelligent healthcare forms with AI-powered chat completion
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFormModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Forms
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <TabsList className="bg-white border mb-8">
            <TabsTrigger value="library">Form Library</TabsTrigger>
            <TabsTrigger value="processing">AI Processing</TabsTrigger>
            <TabsTrigger value="assignments">Form Assignments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Form Library Tab */}
          <TabsContent value="library" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search forms, descriptions, or tags..."
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="pre_op">Pre-Op</option>
                    <option value="post_op">Post-Op</option>
                    <option value="assessment">Assessment</option>
                    <option value="medical_history">Medical History</option>
                    <option value="physical_therapy">Physical Therapy</option>
                    <option value="insurance">Insurance</option>
                    <option value="administrative">Administrative</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Badge variant="secondary" className="text-sm">
                    {filteredForms.length} forms
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {form.original_file_type === 'pdf' && <FileText className="h-5 w-5 text-red-600" />}
                        {form.original_file_type === 'doc' && <FileText className="h-5 w-5 text-blue-600" />}
                        {form.original_file_type === 'docx' && <FileText className="h-5 w-5 text-blue-600" />}
                        {['jpg', 'jpeg', 'png'].includes(form.original_file_type || '') && <Image className="h-5 w-5 text-green-600" />}
                        {!form.original_file_type && <FileText className="h-5 w-5 text-gray-600" />}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(form.processing_status)}`}>
                          {getStatusIcon(form.processing_status)}
                          <span className="capitalize">{form.processing_status}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewForm(form)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingForm(form)
                            setShowFormModal(true)
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {form.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {form.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(form.category)}>
                          {form.category.replace('_', ' ')}
                        </Badge>
                        {form.ai_processing_metadata && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Sparkles className="h-3 w-3" />
                            <span>{Math.round(form.ai_processing_metadata.confidence_score * 100)}%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{form.fields.length} fields</span>
                        <span>{form.estimated_time}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{form.usage_count} uses</span>
                        <div className="flex gap-1">
                          {form.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {form.tags.length > 2 && (
                            <span className="text-xs">+{form.tags.length - 2}</span>
                          )}
                        </div>
                      </div>

                      {form.processing_status === 'completed' && (
                        <div className="pt-2 border-t space-y-2">
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleConvertToChat(form)}
                          >
                            <MessageSquare className="h-3 w-3 mr-2" />
                            Convert to Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleValidateForm(form)}
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Validate Form
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Processing Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forms.filter(form => form.processing_status === 'processing').map(form => (
                    <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Loader className="h-5 w-5 animate-spin text-blue-600" />
                        <div>
                          <h4 className="font-medium">{form.title}</h4>
                          <p className="text-sm text-gray-600">Extracting fields and creating conversation flow...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={65} className="w-24" />
                        <span className="text-sm text-gray-600">65%</span>
                      </div>
                    </div>
                  ))}
                  {forms.filter(form => form.processing_status === 'processing').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No forms currently being processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Form assignment functionality will be integrated with the protocol editor.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Pre-built healthcare form templates for common use cases.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Forms for AI Processing
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Upload PDF, DOC, or image files to automatically extract form fields including signatures
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Drop files here to upload</h3>
                <p className="text-gray-600 mb-4">
                  Support for PDF, DOC, DOCX, JPG, PNG files
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Select Files
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={processUploadedForms}
                  disabled={uploadedFiles.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Process with AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      {previewForm && (
        <FormPreviewModal
          form={previewForm}
          onClose={() => setPreviewForm(null)}
          onConvertToChat={handleConvertToChat}
        />
      )}

      {/* Chat Conversion Modal */}
      {showChatModal && selectedFormForChat && (
        <ChatConversionModal
          form={selectedFormForChat}
          onClose={() => {
            setShowChatModal(false)
            setSelectedFormForChat(null)
          }}
        />
      )}

      {/* Form Validation Modal */}
      {showValidationModal && selectedFormForValidation && validationResults && (
        <FormValidationModal
          form={selectedFormForValidation}
          validationResults={validationResults}
          onClose={() => {
            setShowValidationModal(false)
            setSelectedFormForValidation(null)
            setValidationResults(null)
          }}
        />
      )}
    </div>
  )
}

// Form Preview Modal Component
function FormPreviewModal({ form, onClose, onConvertToChat }: {
  form: AIForm
  onClose: () => void
  onConvertToChat: (form: AIForm) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Form Preview: {form.title}
          </CardTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Structure */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Form Structure</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">{form.description}</p>
                {form.ai_processing_metadata && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-blue-600">
                    <span>🎯 {Math.round(form.ai_processing_metadata.confidence_score * 100)}% confidence</span>
                    <span>📝 {form.ai_processing_metadata.fields_extracted} fields</span>
                    <span>⏱️ {form.estimated_time}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {form.fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {index + 1}. {field.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    {field.options && (
                      <div className="text-xs text-gray-600">
                        Options: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Conversation Flow */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">AI Conversation Flow</h3>
              {form.conversation_flow && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Introduction</h4>
                    <p className="text-green-700 text-sm">{form.conversation_flow.introduction}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Sample Questions</h4>
                    {form.fields.slice(0, 3).map((field, index) => (
                      <div key={field.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Bot className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            {field.conversational_prompt || `Please provide your ${field.label.toLowerCase()}.`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Completion Message</h4>
                    <p className="text-blue-700 text-sm">{form.conversation_flow.completion_message}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    onConvertToChat(form)
                    onClose()
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Test Conversation Flow
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Chat Conversion Modal Component
function ChatConversionModal({ form, onClose }: {
  form: AIForm
  onClose: () => void
}) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentResponse, setCurrentResponse] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showFormFields, setShowFormFields] = useState(false)

  const currentField = form.fields[currentFieldIndex]
  const isLastField = currentFieldIndex === form.fields.length - 1

  const handleSendResponse = () => {
    if (!currentResponse.trim()) return

    // Store response
    setResponses(prev => ({
      ...prev,
      [currentField.id]: currentResponse
    }))

    setCurrentResponse('')

    // Move to next field or complete
    if (currentFieldIndex < form.fields.length - 1) {
      setCurrentFieldIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendResponse()
    }
  }

  const handlePreviousField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(prev => prev - 1)
      setCurrentResponse(responses[form.fields[currentFieldIndex - 1].id] || '')
    }
  }

  const getFieldInput = () => {
    if (!currentField) return null

    switch (currentField.type) {
      case 'signature':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm cursor-pointer">✎</span>
                </div>
                <span className="text-blue-800 font-medium">Signature Required</span>
              </div>
              <p className="text-blue-700 text-sm">
                {typeof navigator !== 'undefined' && 'ontouchstart' in window
                  ? 'Tap and draw your signature in the box below with your finger'
                  : 'Click and drag to draw your signature in the box below'}
              </p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="relative">
                <canvas
                  ref={(canvas) => {
                    if (canvas && !currentResponse) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        canvas.width = canvas.offsetWidth * 2;
                        canvas.height = 150 * 2;
                        ctx.scale(2, 2);
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#374151';
                        
                        let isDrawing = false;
                        let hasSignature = false;
                        
                        const startDrawing = (e: MouseEvent | TouchEvent) => {
                          isDrawing = true;
                          hasSignature = true;
                          const rect = canvas.getBoundingClientRect();
                          const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
                          const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
                          ctx.beginPath();
                          ctx.moveTo(x, y);
                        };
                        
                        const draw = (e: MouseEvent | TouchEvent) => {
                          if (!isDrawing) return;
                          e.preventDefault();
                          const rect = canvas.getBoundingClientRect();
                          const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
                          const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
                          ctx.lineTo(x, y);
                          ctx.stroke();
                        };
                        
                        const stopDrawing = () => {
                          if (isDrawing && hasSignature) {
                            setCurrentResponse(canvas.toDataURL());
                          }
                          isDrawing = false;
                        };
                        
                        // Mouse events
                        canvas.addEventListener('mousedown', startDrawing);
                        canvas.addEventListener('mousemove', draw);
                        canvas.addEventListener('mouseup', stopDrawing);
                        canvas.addEventListener('mouseout', stopDrawing);
                        
                        // Touch events
                        canvas.addEventListener('touchstart', startDrawing);
                        canvas.addEventListener('touchmove', draw);
                        canvas.addEventListener('touchend', stopDrawing);
                      }
                    }
                  }}
                  className="w-full h-24 border border-gray-300 rounded bg-white cursor-crosshair"
                  style={{ touchAction: 'none' }}
                />
                {!currentResponse && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                      {typeof navigator !== 'undefined' && 'ontouchstart' in window ? (
                        <>
                          <span className="text-2xl">👆</span>
                          Draw signature here
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🖱️</span>
                          Click and drag to sign
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {currentResponse && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentResponse('')}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear Signature
                </button>
                <div className="flex-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Signature captured
                </div>
              </div>
            )}
          </div>
        )
      case 'select':
      case 'radio':
        return (
          <div className="space-y-2">
            {currentField.options?.map((option) => (
              <button
                key={option}
                onClick={() => setCurrentResponse(option)}
                className={`w-full text-left p-3 border rounded-lg hover:bg-blue-50 transition-colors ${
                  currentResponse === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )
      case 'textarea':
        return (
          <Textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            rows={4}
            className="w-full"
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a number..."
            min={currentField.validation_rules?.min}
            max={currentField.validation_rules?.max}
            className="w-full"
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            className="w-full"
          />
        )
      default:
        return (
          <Input
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            className="w-full"
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {form.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Complete this form through guided questions</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Main Form Area */}
          <div className="flex-1 flex flex-col">
            {!isCompleted ? (
              <>
                {/* Progress Header */}
                <div className="bg-gray-50 border-b px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentFieldIndex + 1} of {form.fields.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentFieldIndex + 1) / form.fields.length) * 100)}% Complete
                    </span>
                  </div>
                  <Progress
                    value={((currentFieldIndex + 1) / form.fields.length) * 100}
                    className="h-2"
                  />
                </div>

                {/* Question Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {currentField.label}
                        {currentField.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {currentField.conversational_prompt && (
                        <p className="text-gray-600 mb-4">{currentField.conversational_prompt}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {getFieldInput()}
                    </div>

                    {/* Show previous responses */}
                    {Object.keys(responses).length > 0 && (
                      <div className="pt-6 border-t">
                        <button
                          onClick={() => setShowFormFields(!showFormFields)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          {showFormFields ? 'Hide' : 'Show'} Previous Responses
                        </button>
                        
                        {showFormFields && (
                          <div className="mt-3 space-y-2 bg-gray-50 rounded-lg p-4">
                            {form.fields.slice(0, currentFieldIndex).map((field, index) => (
                              <div key={field.id} className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{field.label}:</span>
                                <span className="text-sm text-gray-600">{responses[field.id]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="bg-white border-t px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousField}
                      disabled={currentFieldIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Previous
                    </Button>

                    <Button
                      onClick={handleSendResponse}
                      disabled={!currentResponse.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      {isLastField ? 'Complete Form' : 'Next Question'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Completion Screen
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Completed!</h3>
                  <p className="text-gray-600 mb-6">
                    {form.conversation_flow?.completion_message ||
                     'Thank you for completing this form. Your responses have been recorded.'}
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={onClose}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFormFields(!showFormFields)}
                      className="w-full"
                    >
                      {showFormFields ? 'Hide' : 'Review'} Responses
                    </Button>
                  </div>
                  
                  {showFormFields && (
                    <div className="mt-6 space-y-3 text-left bg-gray-50 rounded-lg p-4">
                      {form.fields.map((field) => (
                        <div key={field.id} className="border-b border-gray-200 pb-2 last:border-0">
                          <p className="text-sm font-medium text-gray-700">{field.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{responses[field.id]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l p-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Form Progress</h4>
                <div className="space-y-2">
                  {form.fields.map((field, index) => {
                    const isCompleted = responses[field.id]
                    const isCurrent = index === currentFieldIndex
                    
                    return (
                      <div
                        key={field.id}
                        className={`p-3 rounded-lg text-sm transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : isCurrent
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="font-medium">{field.label}</span>
                        </div>
                        {isCompleted && (
                          <p className="text-xs mt-1 opacity-75 truncate">
                            {responses[field.id]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Form Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="secondary" className="text-xs">
                      {form.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated time:</span>
                    <span className="text-gray-900">{form.estimated_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total fields:</span>
                    <span className="text-gray-900">{form.fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-gray-900">{Object.keys(responses).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Form Validation Modal Component
function FormValidationModal({ form, validationResults, onClose }: {
  form: AIForm
  validationResults: ValidationResults
  onClose: () => void
}) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Form Validation Report: {form.title}
          </CardTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Overall Validation Score</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(validationResults.overall_score)}`}>
                  {Math.round(validationResults.overall_score * 100)}%
                </div>
              </div>
              <Progress value={validationResults.overall_score * 100} className="mb-4" />
              <p className="text-gray-600 text-sm">
                This form has been analyzed for completeness, clarity, and accessibility standards.
              </p>
            </div>

            {/* Form Structure Analysis */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Structure Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${getScoreColor(validationResults.form_structure.completeness)}`}>
                    <span className="text-xl font-bold">
                      {Math.round(validationResults.form_structure.completeness * 100)}%
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">Completeness</h4>
                  <p className="text-xs text-gray-600">All required fields present</p>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${getScoreColor(validationResults.form_structure.clarity)}`}>
                    <span className="text-xl font-bold">
                      {Math.round(validationResults.form_structure.clarity * 100)}%
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">Clarity</h4>
                  <p className="text-xs text-gray-600">Clear labels and instructions</p>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${getScoreColor(validationResults.form_structure.accessibility)}`}>
                    <span className="text-xl font-bold">
                      {Math.round(validationResults.form_structure.accessibility * 100)}%
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">Accessibility</h4>
                  <p className="text-xs text-gray-600">WCAG compliance</p>
                </div>
              </div>
            </div>

            {/* Field Validations */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Analysis</h3>
              <div className="space-y-3">
                {validationResults.field_validations.map((field) => (
                  <div key={field.field_id} className={`border rounded-lg p-4 ${getStatusColor(field.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(field.status)}
                        <h4 className="font-medium text-gray-900">{field.field_name}</h4>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {field.status}
                      </Badge>
                    </div>
                    
                    {field.issues.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Issues:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {field.issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {field.suggestions.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Suggestions:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {field.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">💡</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
              <div className="space-y-2">
                {validationResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-blue-800 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{form.fields.length}</div>
                  <div className="text-sm text-gray-600">Total Fields</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.field_validations.filter(f => f.status === 'valid').length}
                  </div>
                  <div className="text-sm text-gray-600">Valid Fields</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResults.field_validations.filter(f => f.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{validationResults.estimated_completion_time}min</div>
                  <div className="text-sm text-gray-600">Est. Time</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}