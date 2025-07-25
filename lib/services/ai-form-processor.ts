/**
 * AI Form Processing Service
 * Handles intelligent form upload, field extraction, and conversation flow generation
 */

import { FormField, AIForm } from '@/types/forms'

export interface AIProcessingResult {
  success: boolean
  confidence_score: number
  fields_extracted: FormField[]
  conversation_flow: ConversationFlow
  processing_time_seconds: number
  error_message?: string
}

export interface ConversationFlow {
  introduction: string
  completion_message: string
  validation_prompts: Record<string, string>
  personality_traits: {
    tone: 'professional' | 'friendly' | 'empathetic'
    formality: 'formal' | 'casual' | 'semi-formal'
    supportiveness: 'high' | 'medium' | 'low'
  }
}

export class AIFormProcessor {
  private static instance: AIFormProcessor
  private processingQueue: Map<string, ProcessingJob> = new Map()

  static getInstance(): AIFormProcessor {
    if (!AIFormProcessor.instance) {
      AIFormProcessor.instance = new AIFormProcessor()
    }
    return AIFormProcessor.instance
  }

  /**
   * Process uploaded form file with AI analysis
   */
  async processFormFile(
    file: File,
    formId: string,
    category?: string
  ): Promise<AIProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Add to processing queue
      this.processingQueue.set(formId, {
        id: formId,
        status: 'processing',
        progress: 0,
        startTime
      })

      // Simulate AI processing steps
      await this.updateProgress(formId, 20, 'Reading file content...')
      const fileContent = await this.extractFileContent(file)

      await this.updateProgress(formId, 40, 'Analyzing form structure...')
      const structureAnalysis = await this.analyzeFormStructure(fileContent, file.type)

      await this.updateProgress(formId, 60, 'Extracting form fields...')
      const extractedFields = await this.extractFormFields(structureAnalysis, category)

      await this.updateProgress(formId, 80, 'Generating conversation flow...')
      const conversationFlow = await this.generateConversationFlow(extractedFields, category)

      await this.updateProgress(formId, 100, 'Processing complete!')

      const processingTime = Math.round((Date.now() - startTime) / 1000)
      
      // Remove from queue
      this.processingQueue.delete(formId)

      return {
        success: true,
        confidence_score: this.calculateConfidenceScore(extractedFields, structureAnalysis),
        fields_extracted: extractedFields,
        conversation_flow: conversationFlow,
        processing_time_seconds: processingTime
      }

    } catch (error) {
      this.processingQueue.delete(formId)
      
      return {
        success: false,
        confidence_score: 0,
        fields_extracted: [],
        conversation_flow: this.getDefaultConversationFlow(),
        processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
        error_message: error instanceof Error ? error.message : 'Unknown processing error'
      }
    }
  }

  /**
   * Get processing status for a form
   */
  getProcessingStatus(formId: string): ProcessingJob | null {
    return this.processingQueue.get(formId) || null
  }

  /**
   * Extract content from uploaded file
   */
  private async extractFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        // Simulate processing delay
        setTimeout(() => {
          if (file.type === 'application/pdf') {
            // Mock PDF text extraction
            resolve(this.getMockPDFContent(file.name))
          } else if (file.type.includes('image')) {
            // Mock OCR processing
            resolve(this.getMockOCRContent(file.name))
          } else {
            // Mock document processing
            resolve(this.getMockDocumentContent(file.name))
          }
        }, 1000)
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  /**
   * Analyze form structure using AI
   */
  private async analyzeFormStructure(content: string, fileType: string): Promise<FormStructureAnalysis> {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      sections: this.identifyFormSections(content),
      fieldTypes: this.identifyFieldTypes(content),
      layout: this.analyzeLayout(content),
      complexity: this.assessComplexity(content)
    }
  }

  /**
   * Extract form fields using AI
   */
  private async extractFormFields(
    structure: FormStructureAnalysis,
    category?: string
  ): Promise<FormField[]> {
    // Simulate AI field extraction
    await new Promise(resolve => setTimeout(resolve, 1200))

    const baseFields = this.generateBaseFields(structure, category)
    return baseFields.map((field, index) => ({
      ...field,
      id: `field_${index + 1}`,
      display_order: index + 1,
      conversational_prompt: this.generateConversationalPrompt(field)
    }))
  }

  /**
   * Generate conversation flow for form completion
   */
  private async generateConversationFlow(
    fields: FormField[],
    category?: string
  ): Promise<ConversationFlow> {
    // Simulate AI conversation generation
    await new Promise(resolve => setTimeout(resolve, 800))

    const personalityTraits = this.determinePersonalityTraits(category)
    
    return {
      introduction: this.generateIntroduction(fields.length, category, personalityTraits),
      completion_message: this.generateCompletionMessage(category, personalityTraits),
      validation_prompts: this.generateValidationPrompts(fields),
      personality_traits: personalityTraits
    }
  }

  /**
   * Update processing progress
   */
  private async updateProgress(formId: string, progress: number, message: string): Promise<void> {
    const job = this.processingQueue.get(formId)
    if (job) {
      job.progress = progress
      job.currentStep = message
    }
  }

  /**
   * Calculate confidence score based on extraction quality
   */
  private calculateConfidenceScore(fields: FormField[], structure: FormStructureAnalysis): number {
    let score = 0.7 // Base score

    // Boost for more fields detected
    score += Math.min(fields.length * 0.02, 0.15)

    // Boost for field type diversity
    const uniqueTypes = new Set(fields.map(f => f.type)).size
    score += Math.min(uniqueTypes * 0.03, 0.1)

    // Boost for structured content
    if (structure.complexity === 'high') score += 0.05

    return Math.min(score, 0.98) // Cap at 98%
  }

  /**
   * Generate conversational prompt for field
   */
  private generateConversationalPrompt(field: FormField): string {
    const prompts: Record<string, string> = {
      'text': `Please provide your ${field.label.toLowerCase()}.`,
      'textarea': `Can you tell me about ${field.label.toLowerCase()}? Please provide as much detail as you feel comfortable sharing.`,
      'number': `What is your ${field.label.toLowerCase()}? Please enter a number.`,
      'date': `When is your ${field.label.toLowerCase()}? Please provide the date.`,
      'boolean': `${field.label} - please answer yes or no.`,
      'select': `For ${field.label.toLowerCase()}, please choose from the available options.`,
      'email': `What is your ${field.label.toLowerCase()}? Please provide a valid email address.`,
      'phone': `What is your ${field.label.toLowerCase()}? Please provide your phone number.`
    }

    return prompts[field.type] || `Please provide information for: ${field.label}`
  }

  /**
   * Generate introduction message based on form characteristics
   */
  private generateIntroduction(fieldCount: number, category?: string, traits?: any): string {
    const timeEstimate = Math.ceil(fieldCount * 0.5)
    const categoryIntros: Record<string, string> = {
      'pre_op': 'Hi! I need to collect some important information before your surgery.',
      'post_op': 'Hello! Let me check on your recovery progress today.',
      'assessment': 'Hi there! Time for your regular assessment.',
      'medical_history': 'Hello! I need to gather some information about your medical history.',
      'physical_therapy': 'Hi! Let\'s check on your physical therapy progress.',
      'insurance': 'Hello! I need to collect some insurance information.',
      'administrative': 'Hi! I have a few administrative questions for you.'
    }

    const baseIntro = category ? categoryIntros[category] : 'Hello! I have a form for you to complete.'
    return `${baseIntro} This should only take about ${timeEstimate} minutes, and I'll guide you through each question.`
  }

  /**
   * Generate completion message
   */
  private generateCompletionMessage(category?: string, traits?: any): string {
    const categoryCompletions: Record<string, string> = {
      'pre_op': 'Perfect! Your pre-operative information is complete. Your surgical team will review this before your procedure.',
      'post_op': 'Thank you for the update! Your care team will review this information.',
      'assessment': 'Great! Your assessment is complete. Your healthcare team will review your responses.',
      'medical_history': 'Thank you! Your medical history information has been recorded.',
      'physical_therapy': 'Excellent work! Your physical therapist will review your progress.',
      'insurance': 'Thank you! Your insurance information has been updated.',
      'administrative': 'All done! Thank you for completing the administrative information.'
    }

    return category ? categoryCompletions[category] : 'Thank you! Your form has been completed successfully.'
  }

  /**
   * Generate validation prompts for fields
   */
  private generateValidationPrompts(fields: FormField[]): Record<string, string> {
    const prompts: Record<string, string> = {}
    
    fields.forEach(field => {
      if (field.required) {
        prompts[field.name] = `I notice you haven't provided your ${field.label.toLowerCase()} yet. This information is required to continue. Could you please provide it?`
      }
    })

    return prompts
  }

  /**
   * Determine personality traits based on form category
   */
  private determinePersonalityTraits(category?: string): ConversationFlow['personality_traits'] {
    const categoryTraits: Record<string, ConversationFlow['personality_traits']> = {
      'pre_op': { tone: 'empathetic', formality: 'semi-formal', supportiveness: 'high' },
      'post_op': { tone: 'empathetic', formality: 'casual', supportiveness: 'high' },
      'assessment': { tone: 'professional', formality: 'semi-formal', supportiveness: 'medium' },
      'medical_history': { tone: 'professional', formality: 'formal', supportiveness: 'medium' },
      'physical_therapy': { tone: 'friendly', formality: 'casual', supportiveness: 'high' },
      'insurance': { tone: 'professional', formality: 'formal', supportiveness: 'low' },
      'administrative': { tone: 'professional', formality: 'formal', supportiveness: 'low' }
    }

    return category ? categoryTraits[category] : { tone: 'professional', formality: 'semi-formal', supportiveness: 'medium' }
  }

  // Mock data generators for development
  private getMockPDFContent(filename: string): string {
    return `
      PATIENT INFORMATION FORM
      
      Name: _______________
      Date of Birth: _______________
      Address: _______________
      Phone: _______________
      Email: _______________
      
      MEDICAL HISTORY
      Current Medications: _______________
      Allergies: _______________
      Previous Surgeries: _______________
      
      EMERGENCY CONTACT
      Name: _______________
      Relationship: _______________
      Phone: _______________
    `
  }

  private getMockOCRContent(filename: string): string {
    return `
      Patient Assessment Form
      Pain Level (0-10): [ ]
      Location of Pain: [ ]
      Mobility Level: [ ] Limited [ ] Moderate [ ] Good
      Current Symptoms: _______________
    `
  }

  private getMockDocumentContent(filename: string): string {
    return `
      Healthcare Intake Form
      Patient Name: _______________
      Insurance Provider: _______________
      Policy Number: _______________
      Reason for Visit: _______________
    `
  }

  private identifyFormSections(content: string): string[] {
    return ['Patient Information', 'Medical History', 'Contact Information']
  }

  private identifyFieldTypes(content: string): string[] {
    return ['text', 'textarea', 'select', 'number']
  }

  private analyzeLayout(content: string): string {
    return 'structured'
  }

  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const wordCount = content.split(' ').length
    if (wordCount < 50) return 'low'
    if (wordCount < 150) return 'medium'
    return 'high'
  }

  private generateBaseFields(structure: FormStructureAnalysis, category?: string): Omit<FormField, 'id' | 'display_order' | 'conversational_prompt'>[] {
    // Generate different field sets based on category
    const categoryFields: Record<string, Omit<FormField, 'id' | 'display_order' | 'conversational_prompt'>[]> = {
      'pre_op': [
        { name: 'patient_name', label: 'Full Name', type: 'text', required: true },
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'medical_history', label: 'Medical History', type: 'textarea', required: true },
        { name: 'current_medications', label: 'Current Medications', type: 'textarea', required: true },
        { name: 'allergies', label: 'Known Allergies', type: 'textarea', required: true },
        { name: 'emergency_contact', label: 'Emergency Contact', type: 'text', required: true }
      ],
      'post_op': [
        { name: 'pain_level', label: 'Pain Level (0-10)', type: 'number', required: true, validation_rules: { min: 0, max: 10 } },
        { name: 'pain_location', label: 'Pain Location', type: 'select', required: true, options: ['Surgical site', 'Joint', 'Muscle', 'Other'] },
        { name: 'mobility_level', label: 'Current Mobility', type: 'select', required: true, options: ['Limited', 'Moderate', 'Good'] },
        { name: 'symptoms', label: 'Current Symptoms', type: 'textarea', required: false }
      ],
      'assessment': [
        { name: 'overall_feeling', label: 'How are you feeling overall?', type: 'select', required: true, options: ['Much better', 'Better', 'Same', 'Worse', 'Much worse'] },
        { name: 'concerns', label: 'Any concerns or questions?', type: 'textarea', required: false },
        { name: 'satisfaction', label: 'Satisfaction with care (1-10)', type: 'number', required: true, validation_rules: { min: 1, max: 10 } }
      ]
    }

    return category ? categoryFields[category] || categoryFields['assessment'] : [
      { name: 'patient_name', label: 'Patient Name', type: 'text', required: true },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { name: 'contact_info', label: 'Contact Information', type: 'text', required: true }
    ]
  }

  private getDefaultConversationFlow(): ConversationFlow {
    return {
      introduction: 'Hello! I have a form for you to complete. This should only take a few minutes.',
      completion_message: 'Thank you! Your form has been completed successfully.',
      validation_prompts: {},
      personality_traits: { tone: 'professional', formality: 'semi-formal', supportiveness: 'medium' }
    }
  }
}

// Supporting interfaces
interface ProcessingJob {
  id: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: number
  currentStep?: string
}

interface FormStructureAnalysis {
  sections: string[]
  fieldTypes: string[]
  layout: string
  complexity: 'low' | 'medium' | 'high'
}

// Export singleton instance
export const aiFormProcessor = AIFormProcessor.getInstance()