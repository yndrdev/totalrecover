'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  X,
  Search,
  FileText,
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  AlertCircle,
  Brain,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { AIForm, FormAssignment } from '@/types/forms'

interface FormAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (assignments: FormAssignmentData[]) => void
  selectedDay: number
  patientId: string
  existingAssignments?: FormAssignment[]
}

interface FormAssignmentData {
  form_id: string
  assigned_for_day: number
  due_date?: string
  notes?: string
  priority: 'low' | 'medium' | 'high'
}

// Mock data for available forms
const availableForms: AIForm[] = [
  {
    id: 'form_1',
    title: 'Pre-Operative Assessment',
    description: 'Comprehensive pre-surgery evaluation with AI-guided questions',
    category: 'pre_op',
    processing_status: 'completed',
    fields: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    tags: ['pre-surgery', 'assessment', 'required'],
    estimated_time: '10 minutes',
    usage_count: 156,
    ai_processing_metadata: {
      confidence_score: 0.94,
      fields_extracted: 12,
      processing_time_seconds: 45
    }
  },
  {
    id: 'form_2',
    title: 'Daily Pain Assessment',
    description: 'Smart pain tracking with adaptive questioning based on patient responses',
    category: 'post_op',
    processing_status: 'completed',
    fields: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    tags: ['pain', 'daily', 'monitoring'],
    estimated_time: '3 minutes',
    usage_count: 432,
    ai_processing_metadata: {
      confidence_score: 0.98,
      fields_extracted: 8,
      processing_time_seconds: 32
    }
  },
  {
    id: 'form_3',
    title: 'Physical Therapy Progress',
    description: 'PT evaluation form that adapts difficulty based on mobility level',
    category: 'physical_therapy',
    processing_status: 'completed',
    fields: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    tags: ['physical-therapy', 'progress', 'weekly'],
    estimated_time: '5 minutes',
    usage_count: 89,
    ai_processing_metadata: {
      confidence_score: 0.92,
      fields_extracted: 10,
      processing_time_seconds: 38
    }
  },
  {
    id: 'form_4',
    title: 'Weekly Recovery Survey',
    description: 'Comprehensive recovery assessment with mood and satisfaction tracking',
    category: 'assessment',
    processing_status: 'completed',
    fields: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    tags: ['weekly', 'recovery', 'survey'],
    estimated_time: '7 minutes',
    usage_count: 124,
    ai_processing_metadata: {
      confidence_score: 0.89,
      fields_extracted: 15,
      processing_time_seconds: 52
    }
  }
]

export default function FormAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  selectedDay,
  patientId,
  existingAssignments = []
}: FormAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedForms, setSelectedForms] = useState<Map<string, FormAssignmentData>>(new Map())
  const [assignmentNotes, setAssignmentNotes] = useState('')

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedForms(new Map())
      setSearchTerm('')
      setSelectedCategory('all')
      setAssignmentNotes('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredForms = availableForms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory
    
    // Don't show forms already assigned to this day
    const isAlreadyAssigned = existingAssignments.some(assignment => 
      assignment.form_id === form.id && assignment.assigned_for_day === selectedDay
    )
    
    return matchesSearch && matchesCategory && !isAlreadyAssigned && form.is_active
  })

  const handleFormToggle = (form: AIForm) => {
    const newSelectedForms = new Map(selectedForms)
    
    if (newSelectedForms.has(form.id)) {
      newSelectedForms.delete(form.id)
    } else {
      newSelectedForms.set(form.id, {
        form_id: form.id,
        assigned_for_day: selectedDay,
        priority: 'medium',
        notes: assignmentNotes
      })
    }
    
    setSelectedForms(newSelectedForms)
  }

  const handlePriorityChange = (formId: string, priority: 'low' | 'medium' | 'high') => {
    const newSelectedForms = new Map(selectedForms)
    const assignment = newSelectedForms.get(formId)
    if (assignment) {
      newSelectedForms.set(formId, { ...assignment, priority })
      setSelectedForms(newSelectedForms)
    }
  }

  const handleAssign = () => {
    const assignments = Array.from(selectedForms.values()).map(assignment => ({
      ...assignment,
      notes: assignmentNotes || undefined
    }))
    onAssign(assignments)
    onClose()
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Assign AI Forms to Day {selectedDay}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Select intelligent forms that will adapt to patient responses through AI conversation
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AI forms..."
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pre_op">Pre-Op</SelectItem>
                <SelectItem value="post_op">Post-Op</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                <SelectItem value="medical_history">Medical History</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredForms.length} forms available
            </Badge>
          </div>

          {/* Selected Forms Summary */}
          {selectedForms.size > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Selected for Assignment ({selectedForms.size})
                </h4>
                <div className="space-y-2">
                  {Array.from(selectedForms.entries()).map(([formId, assignment]) => {
                    const form = availableForms.find(f => f.id === formId)
                    if (!form) return null
                    
                    return (
                      <div key={formId} className="flex items-center justify-between bg-white rounded p-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{form.title}</span>
                          <Badge className={getCategoryColor(form.category)}>
                            {form.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={assignment.priority}
                            onValueChange={(value) =>
                              handlePriorityChange(formId, value as 'low' | 'medium' | 'high')
                            }
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFormToggle(form)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Forms */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Available AI Forms</h4>
            <ScrollArea className="h-96">
              <div className="grid gap-3">
                {filteredForms.map((form) => {
                  const isSelected = selectedForms.has(form.id)
                  
                  return (
                    <Card
                      key={form.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleFormToggle(form)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <h5 className="font-medium text-gray-900">{form.title}</h5>
                              {isSelected && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {form.description}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{form.estimated_time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{form.usage_count} uses</span>
                              </div>
                              {form.ai_processing_metadata && (
                                <div className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  <span>{Math.round(form.ai_processing_metadata.confidence_score * 100)}% AI confidence</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getCategoryColor(form.category)}>
                              {form.category.replace('_', ' ')}
                            </Badge>
                            
                            <div className="flex gap-1">
                              {form.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                
                {filteredForms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No forms found matching your criteria</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Assignment Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <Textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this form assignment..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedForms.size > 0 ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {selectedForms.size} form(s) ready to assign
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Select forms to assign to Day {selectedDay}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={selectedForms.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign {selectedForms.size > 0 ? `${selectedForms.size} Form${selectedForms.size > 1 ? 's' : ''}` : 'Forms'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}