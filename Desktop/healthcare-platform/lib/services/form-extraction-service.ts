import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type FormTemplate = Database['public']['Tables']['form_templates']['Row'];
type FormSection = Database['public']['Tables']['form_sections']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type SectionQuestion = Database['public']['Tables']['section_questions']['Row'];

export interface ExtractedForm {
  id: string;
  name: string;
  description: string | null;
  formType: string;
  category: string | null;
  sections: ExtractedSection[];
  estimatedCompletionTime: number | null;
  allowPartialCompletion: boolean;
  voiceInputEnabled: boolean;
  imageUploadEnabled: boolean;
  clinicalPurpose: string | null;
}

export interface ExtractedSection {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  sortOrder: number;
  isRequired: boolean;
  questions: ExtractedQuestion[];
}

export interface ExtractedQuestion {
  id: string;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  placeholderText: string | null;
  helpText: string | null;
  medicalDefinition: string | null;
  validationRules: any;
  options: any;
  voicePrompt: string | null;
  voiceResponseType: string;
  clinicalSignificance: string | null;
  sortOrder: number;
}

export interface ConversationalFormData {
  form: ExtractedForm;
  conversationalFlow: ConversationalStep[];
  totalQuestions: number;
  requiredQuestions: number;
}

export interface ConversationalStep {
  stepId: string;
  sectionId: string;
  sectionName: string;
  questionId: string;
  question: string;
  type: string;
  isRequired: boolean;
  helpText?: string;
  medicalDefinition?: string;
  options?: any;
  validationRules?: any;
  voicePrompt?: string;
  nextStep?: string;
  conditionalNext?: ConditionalNext[];
}

export interface ConditionalNext {
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
  nextStep: string;
}

export class FormExtractionService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Extract a complete form structure by form template ID
   */
  async extractFormById(formTemplateId: string): Promise<ExtractedForm | null> {
    try {
      // Get form template
      const { data: formTemplate, error: formError } = await this.supabase
        .from('form_templates')
        .select('*')
        .eq('id', formTemplateId)
        .single();

      if (formError || !formTemplate) {
        console.error('Error fetching form template:', formError);
        return null;
      }

      // Get form sections
      const { data: sections, error: sectionsError } = await this.supabase
        .from('form_sections')
        .select('*')
        .eq('form_template_id', formTemplateId)
        .order('sort_order', { ascending: true });

      if (sectionsError) {
        console.error('Error fetching form sections:', sectionsError);
        return null;
      }

      // Get all questions for this form
      const extractedSections: ExtractedSection[] = [];

      for (const section of sections || []) {
        const { data: sectionQuestions, error: questionsError } = await this.supabase
          .from('section_questions')
          .select(`
            *,
            questions!inner(*)
          `)
          .eq('section_id', section.id)
          .order('sort_order', { ascending: true });

        if (questionsError) {
          console.error('Error fetching section questions:', questionsError);
          continue;
        }

        const extractedQuestions: ExtractedQuestion[] = (sectionQuestions || []).map(sq => ({
          id: sq.questions.id,
          questionText: sq.questions.question_text,
          questionType: sq.questions.question_type,
          isRequired: sq.is_required_override ?? sq.questions.is_required,
          placeholderText: sq.questions.placeholder_text,
          helpText: sq.custom_help_text || sq.questions.help_text,
          medicalDefinition: sq.questions.medical_definition,
          validationRules: {
            ...(sq.questions.validation_rules || {}),
            ...(sq.custom_validation || {})
          },
          options: sq.questions.options,
          voicePrompt: sq.questions.voice_prompt,
          voiceResponseType: sq.questions.voice_response_type,
          clinicalSignificance: sq.questions.clinical_significance,
          sortOrder: sq.sort_order
        }));

        extractedSections.push({
          id: section.id,
          name: section.name,
          description: section.description,
          instructions: section.instructions,
          sortOrder: section.sort_order,
          isRequired: section.is_required,
          questions: extractedQuestions
        });
      }

      return {
        id: formTemplate.id,
        name: formTemplate.name,
        description: formTemplate.description,
        formType: formTemplate.form_type,
        category: formTemplate.category,
        sections: extractedSections,
        estimatedCompletionTime: formTemplate.completion_time_estimate,
        allowPartialCompletion: formTemplate.allow_partial_completion,
        voiceInputEnabled: formTemplate.voice_input_enabled,
        imageUploadEnabled: formTemplate.image_upload_enabled,
        clinicalPurpose: formTemplate.clinical_purpose
      };
    } catch (error) {
      console.error('Error in extractFormById:', error);
      return null;
    }
  }

  /**
   * Convert extracted form to conversational flow for chat interface
   */
  convertToConversationalFlow(extractedForm: ExtractedForm): ConversationalFormData {
    const conversationalFlow: ConversationalStep[] = [];
    let totalQuestions = 0;
    let requiredQuestions = 0;

    // Flatten all questions into a linear flow
    extractedForm.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        totalQuestions++;
        if (question.isRequired) requiredQuestions++;

        const stepId = `${section.id}-${question.id}`;
        const nextSectionIndex = sectionIndex;
        const nextQuestionIndex = questionIndex + 1;
        
        let nextStep: string | undefined;
        if (nextQuestionIndex < section.questions.length) {
          nextStep = `${section.id}-${section.questions[nextQuestionIndex].id}`;
        } else if (sectionIndex + 1 < extractedForm.sections.length) {
          const nextSection = extractedForm.sections[sectionIndex + 1];
          if (nextSection.questions.length > 0) {
            nextStep = `${nextSection.id}-${nextSection.questions[0].id}`;
          }
        }

        conversationalFlow.push({
          stepId,
          sectionId: section.id,
          sectionName: section.name,
          questionId: question.id,
          question: question.questionText,
          type: question.questionType,
          isRequired: question.isRequired,
          helpText: question.helpText || undefined,
          medicalDefinition: question.medicalDefinition || undefined,
          options: question.options,
          validationRules: question.validationRules,
          voicePrompt: question.voicePrompt || undefined,
          nextStep,
          conditionalNext: this.parseConditionalLogic(question, extractedForm)
        });
      });
    });

    return {
      form: extractedForm,
      conversationalFlow,
      totalQuestions,
      requiredQuestions
    };
  }

  /**
   * Parse conditional logic for branching questions
   */
  private parseConditionalLogic(question: ExtractedQuestion, form: ExtractedForm): ConditionalNext[] {
    // This would parse any conditional logic from the question's validation rules
    // For now, returning empty array - can be extended based on specific requirements
    return [];
  }

  /**
   * Get forms by type for a specific tenant
   */
  async getFormsByType(tenantId: string, formType: string): Promise<FormTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('form_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('form_type', formType)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching forms by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFormsByType:', error);
      return [];
    }
  }

  /**
   * Get forms applicable for a surgery type
   */
  async getFormsForSurgeryType(tenantId: string, surgeryType: string): Promise<FormTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('form_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .contains('surgery_types', [surgeryType])
        .order('form_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching forms for surgery type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFormsForSurgeryType:', error);
      return [];
    }
  }

  /**
   * Create a chat-friendly prompt from a question
   */
  createChatPrompt(step: ConversationalStep, patientName?: string): string {
    let prompt = step.voicePrompt || step.question;

    // Personalize the prompt
    if (patientName) {
      prompt = prompt.replace(/\byou\b/gi, patientName);
    }

    // Add context based on question type
    switch (step.type) {
      case 'yes_no':
        prompt += ' (Please answer Yes or No)';
        break;
      case 'scale':
      case 'pain_scale':
        prompt += ' (On a scale of 0-10, where 0 is no pain and 10 is the worst pain imaginable)';
        break;
      case 'multiple_choice':
        if (step.options && Array.isArray(step.options)) {
          prompt += '\n\nOptions:';
          step.options.forEach((option: any, index: number) => {
            prompt += `\n${index + 1}. ${option.label || option}`;
          });
        }
        break;
      case 'date':
        prompt += ' (Please provide the date in MM/DD/YYYY format)';
        break;
      case 'medication_search':
        prompt += ' (You can search for medications by name or scan your medication bottle)';
        break;
    }

    // Add help text if available
    if (step.helpText) {
      prompt += `\n\nℹ️ ${step.helpText}`;
    }

    // Add medical definition if available
    if (step.medicalDefinition) {
      prompt += `\n\n📋 Medical context: ${step.medicalDefinition}`;
    }

    return prompt;
  }

  /**
   * Validate a response based on question rules
   */
  validateResponse(step: ConversationalStep, response: any): { isValid: boolean; error?: string } {
    // Check if required
    if (step.isRequired && (!response || response === '')) {
      return { isValid: false, error: 'This question is required.' };
    }

    // Type-specific validation
    switch (step.type) {
      case 'number':
        const num = Number(response);
        if (isNaN(num)) {
          return { isValid: false, error: 'Please enter a valid number.' };
        }
        if (step.validationRules?.min !== undefined && num < step.validationRules.min) {
          return { isValid: false, error: `Value must be at least ${step.validationRules.min}.` };
        }
        if (step.validationRules?.max !== undefined && num > step.validationRules.max) {
          return { isValid: false, error: `Value must be no more than ${step.validationRules.max}.` };
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(response)) {
          return { isValid: false, error: 'Please enter a valid email address.' };
        }
        break;

      case 'phone':
        const phoneRegex = /^\d{3}-?\d{3}-?\d{4}$/;
        if (!phoneRegex.test(response.replace(/[^\d-]/g, ''))) {
          return { isValid: false, error: 'Please enter a valid phone number.' };
        }
        break;

      case 'date':
        const date = new Date(response);
        if (isNaN(date.getTime())) {
          return { isValid: false, error: 'Please enter a valid date.' };
        }
        break;

      case 'yes_no':
        const validYesNo = ['yes', 'no', 'y', 'n', 'true', 'false'];
        if (!validYesNo.includes(response.toLowerCase())) {
          return { isValid: false, error: 'Please answer Yes or No.' };
        }
        break;

      case 'pain_scale':
      case 'scale':
        const scale = Number(response);
        if (isNaN(scale) || scale < 0 || scale > 10) {
          return { isValid: false, error: 'Please enter a number between 0 and 10.' };
        }
        break;
    }

    // Custom validation rules
    if (step.validationRules?.pattern) {
      const regex = new RegExp(step.validationRules.pattern);
      if (!regex.test(response)) {
        return { isValid: false, error: step.validationRules.message || 'Invalid format.' };
      }
    }

    return { isValid: true };
  }
}