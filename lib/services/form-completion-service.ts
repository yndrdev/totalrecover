/**
 * Form Completion Service
 * Handles chat-to-form completion workflow, response mapping, and document generation
 */

import { FormResponse, CompletedForm, AIForm, FormAssignment } from '@/types/forms'

export interface FormCompletionResult {
  success: boolean
  completed_form: CompletedForm
  document_url?: string
  validation_errors: string[]
  completion_percentage: number
}

export interface DocumentGenerationOptions {
  format: 'pdf' | 'docx' | 'json'
  include_timestamps: boolean
  include_metadata: boolean
  template_style: 'clinical' | 'standard' | 'minimal'
}

export class FormCompletionService {
  private static instance: FormCompletionService

  static getInstance(): FormCompletionService {
    if (!FormCompletionService.instance) {
      FormCompletionService.instance = new FormCompletionService()
    }
    return FormCompletionService.instance
  }

  /**
   * Process form completion from chat responses
   */
  async completeFormFromChat(
    form: AIForm,
    assignment: FormAssignment,
    responses: FormResponse[],
    options: Partial<DocumentGenerationOptions> = {}
  ): Promise<FormCompletionResult> {
    try {
      // Validate responses against form fields
      const validationResult = this.validateFormResponses(form, responses)
      
      // Calculate completion percentage
      const completionPercentage = this.calculateCompletionPercentage(form, responses)
      
      // Generate completion summary
      const completionSummary = this.generateCompletionSummary(form, responses, validationResult)
      
      // Generate completed form document
      const documentUrl = await this.generateFormDocument(form, responses, {
        format: 'pdf',
        include_timestamps: true,
        include_metadata: true,
        template_style: 'clinical',
        ...options
      })

      // Create completed form record
      const completedForm: CompletedForm = {
        id: this.generateId(),
        form_assignment_id: assignment.id,
        patient_id: assignment.patient_id,
        form_id: form.id,
        completed_form_url: documentUrl,
        completion_percentage: completionPercentage,
        ai_completion_summary: completionSummary,
        provider_reviewed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return {
        success: true,
        completed_form: completedForm,
        document_url: documentUrl,
        validation_errors: validationResult.errors,
        completion_percentage: completionPercentage
      }

    } catch (error) {
      return {
        success: false,
        completed_form: {} as CompletedForm,
        validation_errors: [error instanceof Error ? error.message : 'Unknown error'],
        completion_percentage: 0
      }
    }
  }

  /**
   * Validate form responses against form field requirements
   */
  private validateFormResponses(form: AIForm, responses: FormResponse[]): ValidationResult {
    const errors: string[] = []
    const responseMap = new Map(responses.map(r => [r.form_field_id, r]))

    // Check required fields
    form.fields.forEach(field => {
      if (field.required) {
        const response = responseMap.get(field.id)
        if (!response || !response.response_value || response.response_value.toString().trim() === '') {
          errors.push(`Required field "${field.label}" is missing or empty`)
        }
      }
    })

    // Validate field-specific constraints
    responses.forEach(response => {
      const field = form.fields.find(f => f.id === response.form_field_id)
      if (field) {
        const fieldErrors = this.validateFieldResponse(field, response)
        errors.push(...fieldErrors)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate individual field response
   */
  private validateFieldResponse(field: any, response: FormResponse): string[] {
    const errors: string[] = []
    const value = response.response_value

    switch (field.type) {
      case 'number':
        const numValue = parseFloat(value as string)
        if (isNaN(numValue)) {
          errors.push(`Field "${field.label}" must be a valid number`)
        } else {
          if (field.validation_rules?.min !== undefined && numValue < field.validation_rules.min) {
            errors.push(`Field "${field.label}" must be at least ${field.validation_rules.min}`)
          }
          if (field.validation_rules?.max !== undefined && numValue > field.validation_rules.max) {
            errors.push(`Field "${field.label}" must be at most ${field.validation_rules.max}`)
          }
        }
        break

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value as string)) {
          errors.push(`Field "${field.label}" must be a valid email address`)
        }
        break

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test((value as string).replace(/\D/g, ''))) {
          errors.push(`Field "${field.label}" must be a valid phone number`)
        }
        break

      case 'date':
        const date = new Date(value as string)
        if (isNaN(date.getTime())) {
          errors.push(`Field "${field.label}" must be a valid date`)
        }
        break

      case 'select':
      case 'radio':
        if (field.options && !field.options.includes(value as string)) {
          errors.push(`Field "${field.label}" must be one of the allowed options`)
        }
        break
    }

    return errors
  }

  /**
   * Calculate completion percentage
   */
  private calculateCompletionPercentage(form: AIForm, responses: FormResponse[]): number {
    const totalFields = form.fields.length
    const completedFields = responses.filter(r => 
      r.response_value && r.response_value.toString().trim() !== ''
    ).length

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
  }

  /**
   * Generate completion summary
   */
  private generateCompletionSummary(
    form: AIForm, 
    responses: FormResponse[], 
    validation: ValidationResult
  ) {
    const responseMap = new Map(responses.map(r => [r.form_field_id, r]))
    const missingRequired = form.fields
      .filter(f => f.required && !responseMap.has(f.id))
      .map(f => f.name)

    return {
      total_fields: form.fields.length,
      completed_fields: responses.length,
      missing_required_fields: missingRequired,
      validation_errors: validation.errors,
      confidence_score: this.calculateOverallConfidence(responses)
    }
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(responses: FormResponse[]): number {
    if (responses.length === 0) return 0

    const avgConfidence = responses
      .filter(r => r.confidence_score !== undefined)
      .reduce((sum, r) => sum + (r.confidence_score || 0), 0) / responses.length

    return Math.round(avgConfidence * 100) / 100
  }

  /**
   * Generate completed form document
   */
  private async generateFormDocument(
    form: AIForm,
    responses: FormResponse[],
    options: DocumentGenerationOptions
  ): Promise<string> {
    // Simulate document generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const responseMap = new Map(responses.map(r => [r.form_field_id, r]))
    
    // Generate document content based on format
    switch (options.format) {
      case 'pdf':
        return this.generatePDF(form, responseMap, options)
      case 'docx':
        return this.generateDOCX(form, responseMap, options)
      case 'json':
        return this.generateJSON(form, responseMap, options)
      default:
        return this.generatePDF(form, responseMap, options)
    }
  }

  /**
   * Generate PDF document (simulated)
   */
  private async generatePDF(
    form: AIForm,
    responses: Map<string, FormResponse>,
    options: DocumentGenerationOptions
  ): Promise<string> {
    // In a real implementation, this would use a PDF generation library
    // like jsPDF, Puppeteer, or a server-side PDF service
    
    const documentData = {
      title: form.title,
      description: form.description,
      generated_at: new Date().toISOString(),
      patient_responses: form.fields.map(field => ({
        field_id: field.id,
        field_name: field.name,
        field_label: field.label,
        field_type: field.type,
        response: responses.get(field.id)?.response_value || 'No response',
        timestamp: responses.get(field.id)?.response_timestamp
      })),
      metadata: options.include_metadata ? {
        form_category: form.category,
        processing_confidence: form.ai_processing_metadata?.confidence_score,
        completion_method: 'ai_chat'
      } : undefined
    }

    // Simulate PDF generation and return mock URL
    const documentId = this.generateId()
    return `/api/forms/documents/${documentId}.pdf`
  }

  /**
   * Generate DOCX document (simulated)
   */
  private async generateDOCX(
    form: AIForm,
    responses: Map<string, FormResponse>,
    options: DocumentGenerationOptions
  ): Promise<string> {
    // Similar to PDF generation but for DOCX format
    const documentId = this.generateId()
    return `/api/forms/documents/${documentId}.docx`
  }

  /**
   * Generate JSON document
   */
  private async generateJSON(
    form: AIForm,
    responses: Map<string, FormResponse>,
    options: DocumentGenerationOptions
  ): Promise<string> {
    const jsonData = {
      form: {
        id: form.id,
        title: form.title,
        category: form.category
      },
      responses: Array.from(responses.values()),
      metadata: {
        generated_at: new Date().toISOString(),
        completion_method: 'ai_chat'
      }
    }

    // In practice, this would be stored in a file system or database
    const documentId = this.generateId()
    return `/api/forms/documents/${documentId}.json`
  }

  /**
   * Create digital signature for form completion
   */
  async createDigitalSignature(
    completedForm: CompletedForm,
    patientId: string,
    signatureData: string
  ): Promise<string> {
    // Simulate signature processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    const signatureId = this.generateId()
    const signatureUrl = `/api/forms/signatures/${signatureId}.png`

    // In a real implementation, this would:
    // 1. Validate the signature data
    // 2. Create a timestamped signature file
    // 3. Link it to the completed form
    // 4. Generate a verification token

    return signatureUrl
  }

  /**
   * Send form completion notification
   */
  async sendCompletionNotification(
    completedForm: CompletedForm,
    recipients: string[]
  ): Promise<boolean> {
    try {
      // Simulate notification sending
      await new Promise(resolve => setTimeout(resolve, 500))

      // In practice, this would send notifications via:
      // - Email to healthcare providers
      // - Push notifications to mobile apps
      // - Updates to electronic health records
      // - Integration with practice management systems

      console.log('Form completion notifications sent to:', recipients)
      return true
    } catch (error) {
      console.error('Failed to send completion notifications:', error)
      return false
    }
  }

  /**
   * Generate form analytics and insights
   */
  generateFormAnalytics(
    form: AIForm,
    responses: FormResponse[]
  ): FormAnalytics {
    const responseMap = new Map(responses.map(r => [r.form_field_id, r]))
    
    return {
      completion_time_estimate: this.estimateCompletionTime(responses),
      field_completion_rates: this.calculateFieldCompletionRates(form, responseMap),
      response_quality_scores: this.assessResponseQuality(responses),
      ai_insights: this.generateAIInsights(form, responses),
      recommendations: this.generateRecommendations(form, responses)
    }
  }

  private estimateCompletionTime(responses: FormResponse[]): number {
    if (responses.length < 2) return 0

    const timestamps = responses
      .map(r => new Date(r.response_timestamp).getTime())
      .sort((a, b) => a - b)

    const startTime = timestamps[0]
    const endTime = timestamps[timestamps.length - 1]
    
    return Math.round((endTime - startTime) / 1000 / 60) // minutes
  }

  private calculateFieldCompletionRates(
    form: AIForm,
    responses: Map<string, FormResponse>
  ): Record<string, number> {
    const rates: Record<string, number> = {}
    
    form.fields.forEach(field => {
      const response = responses.get(field.id)
      rates[field.name] = response && response.response_value ? 1.0 : 0.0
    })

    return rates
  }

  private assessResponseQuality(responses: FormResponse[]): Record<string, number> {
    const scores: Record<string, number> = {}
    
    responses.forEach(response => {
      scores[response.form_field_id] = response.confidence_score || 0.5
    })

    return scores
  }

  private generateAIInsights(form: AIForm, responses: FormResponse[]): string[] {
    const insights: string[] = []
    
    // Example insights based on response patterns
    const responseCount = responses.length
    const requiredFieldCount = form.fields.filter(f => f.required).length
    
    if (responseCount === form.fields.length) {
      insights.push('Patient completed all form fields successfully')
    } else if (responseCount >= requiredFieldCount) {
      insights.push('Patient completed all required fields')
    } else {
      insights.push('Some required fields are missing responses')
    }

    // Add more intelligent insights based on response patterns
    const avgConfidence = responses.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / responses.length
    if (avgConfidence > 0.9) {
      insights.push('High confidence in response accuracy')
    } else if (avgConfidence < 0.7) {
      insights.push('Some responses may need manual review')
    }

    return insights
  }

  private generateRecommendations(form: AIForm, responses: FormResponse[]): string[] {
    const recommendations: string[] = []
    
    // Generate recommendations based on completion patterns
    const incompleteFields = form.fields.filter(field => 
      !responses.some(r => r.form_field_id === field.id && r.response_value)
    )

    if (incompleteFields.length > 0) {
      recommendations.push(`Follow up on ${incompleteFields.length} incomplete field(s)`)
    }

    // Add recommendations for improving form completion rates
    if (responses.length < form.fields.length * 0.8) {
      recommendations.push('Consider simplifying form or providing clearer instructions')
    }

    return recommendations
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Supporting interfaces
interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface FormAnalytics {
  completion_time_estimate: number
  field_completion_rates: Record<string, number>
  response_quality_scores: Record<string, number>
  ai_insights: string[]
  recommendations: string[]
}

// Export singleton instance
export const formCompletionService = FormCompletionService.getInstance()