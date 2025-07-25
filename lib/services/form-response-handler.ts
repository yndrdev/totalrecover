import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { ConversationalStep } from './form-extraction-service';
import { FormToChatConverter } from './form-to-chat-converter';

type QuestionResponse = Database['public']['Tables']['question_responses']['Row'];
type PatientForm = Database['public']['Tables']['patient_forms']['Row'];

export interface FormResponseData {
  patientFormId: string;
  questionId: string;
  response: any;
  responseType: string;
  responseMethod: 'text' | 'voice' | 'selection' | 'upload' | 'scan';
  timeToRespond?: number;
  metadata?: Record<string, any>;
}

export interface ClinicalAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  questionId: string;
  response: any;
  requiresImmedateAction: boolean;
  notifyProvider: boolean;
}

export interface FormCompletionStatus {
  patientFormId: string;
  totalQuestions: number;
  answeredQuestions: number;
  requiredQuestions: number;
  answeredRequiredQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
  missingRequiredQuestions: string[];
}

export class FormResponseHandler {
  private supabase;
  private formToChatConverter: FormToChatConverter;

  constructor() {
    this.supabase = createClient();
    this.formToChatConverter = new FormToChatConverter();
  }

  /**
   * Save a form response
   */
  async saveResponse(data: FormResponseData): Promise<{ success: boolean; alerts?: ClinicalAlert[] }> {
    try {
      // Get patient form to ensure it exists and get patient ID
      const { data: patientForm, error: formError } = await this.supabase
        .from('patient_forms')
        .select('*, form_template_id')
        .eq('id', data.patientFormId)
        .single();

      if (formError || !patientForm) {
        console.error('Error fetching patient form:', formError);
        return { success: false };
      }

      // Parse the response based on type
      const parsedResponse = this.parseResponseByType(data.response, data.responseType);

      // Prepare response record
      const responseRecord: any = {
        patient_form_id: data.patientFormId,
        question_id: data.questionId,
        patient_id: patientForm.patient_id,
        response_method: data.responseMethod,
        time_to_respond_seconds: data.timeToRespond,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Set the appropriate response field based on type
      switch (data.responseType) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'phone':
          responseRecord.response_text = parsedResponse;
          break;
        case 'number':
        case 'scale':
        case 'pain_scale':
          responseRecord.response_number = parsedResponse;
          break;
        case 'date':
          responseRecord.response_date = parsedResponse;
          break;
        case 'time':
          responseRecord.response_time = parsedResponse;
          break;
        case 'datetime':
          responseRecord.response_datetime = parsedResponse;
          break;
        case 'yes_no':
          responseRecord.response_boolean = parsedResponse === 'yes' || parsedResponse === true;
          responseRecord.response_text = parsedResponse;
          break;
        case 'single_choice':
        case 'multiple_choice':
          responseRecord.response_json = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
          break;
        case 'file_upload':
          responseRecord.file_urls = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
          break;
        case 'image_upload':
          responseRecord.image_urls = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
          break;
        case 'voice_recording':
          responseRecord.audio_url = parsedResponse;
          break;
        default:
          responseRecord.response_json = parsedResponse;
      }

      // Check for existing response
      const { data: existingResponse } = await this.supabase
        .from('question_responses')
        .select('id')
        .eq('patient_form_id', data.patientFormId)
        .eq('question_id', data.questionId)
        .single();

      let savedResponse;
      if (existingResponse) {
        // Update existing response
        const { data: updated, error: updateError } = await this.supabase
          .from('question_responses')
          .update(responseRecord)
          .eq('id', existingResponse.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating response:', updateError);
          return { success: false };
        }
        savedResponse = updated;
      } else {
        // Insert new response
        const { data: inserted, error: insertError } = await this.supabase
          .from('question_responses')
          .insert(responseRecord)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting response:', insertError);
          return { success: false };
        }
        savedResponse = inserted;
      }

      // Check for clinical alerts
      const alerts = await this.checkClinicalAlerts(savedResponse, data.questionId);

      // Update form status
      await this.updateFormStatus(data.patientFormId);

      return { success: true, alerts };
    } catch (error) {
      console.error('Error in saveResponse:', error);
      return { success: false };
    }
  }

  /**
   * Parse response based on question type
   */
  private parseResponseByType(response: any, responseType: string): any {
    switch (responseType) {
      case 'number':
      case 'scale':
      case 'pain_scale':
        return parseFloat(response);
      
      case 'date':
        // Ensure date is in YYYY-MM-DD format
        const date = new Date(response);
        return date.toISOString().split('T')[0];
      
      case 'time':
        // Ensure time is in HH:MM:SS format
        return response.includes(':') ? response : `${response}:00`;
      
      case 'datetime':
        return new Date(response).toISOString();
      
      case 'yes_no':
        const yesValues = ['yes', 'y', 'true', '1'];
        return yesValues.includes(response.toString().toLowerCase()) ? 'yes' : 'no';
      
      default:
        return response;
    }
  }

  /**
   * Check for clinical alerts based on response
   */
  private async checkClinicalAlerts(response: QuestionResponse, questionId: string): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [];

    // Get question details for alert rules
    const { data: question } = await this.supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!question || !question.clinical_alerts) {
      return alerts;
    }

    const alertRules = question.clinical_alerts as any;

    // Check pain level alerts
    if (question.question_type === 'pain_scale' && response.response_number !== null) {
      const painLevel = response.response_number;
      
      if (painLevel >= 8) {
        alerts.push({
          severity: 'high',
          type: 'high_pain_level',
          message: `Patient reported severe pain level: ${painLevel}/10`,
          questionId,
          response: painLevel,
          requiresImmedateAction: true,
          notifyProvider: true
        });
      } else if (painLevel >= 6) {
        alerts.push({
          severity: 'medium',
          type: 'moderate_pain_level',
          message: `Patient reported moderate pain level: ${painLevel}/10`,
          questionId,
          response: painLevel,
          requiresImmedateAction: false,
          notifyProvider: true
        });
      }
    }

    // Check yes/no alerts for concerning symptoms
    if (question.question_type === 'yes_no' && alertRules.concerning_if_yes && response.response_boolean) {
      alerts.push({
        severity: alertRules.severity || 'medium',
        type: 'concerning_symptom',
        message: alertRules.message || `Patient reported concerning symptom: ${question.question_text}`,
        questionId,
        response: 'yes',
        requiresImmedateAction: alertRules.immediate_action || false,
        notifyProvider: true
      });
    }

    // Check numeric thresholds
    if (question.question_type === 'number' && response.response_number !== null) {
      if (alertRules.max_threshold && response.response_number > alertRules.max_threshold) {
        alerts.push({
          severity: alertRules.severity || 'medium',
          type: 'threshold_exceeded',
          message: `Value exceeds threshold: ${response.response_number} > ${alertRules.max_threshold}`,
          questionId,
          response: response.response_number,
          requiresImmedateAction: alertRules.immediate_action || false,
          notifyProvider: true
        });
      }
      
      if (alertRules.min_threshold && response.response_number < alertRules.min_threshold) {
        alerts.push({
          severity: alertRules.severity || 'medium',
          type: 'threshold_below',
          message: `Value below threshold: ${response.response_number} < ${alertRules.min_threshold}`,
          questionId,
          response: response.response_number,
          requiresImmedateAction: alertRules.immediate_action || false,
          notifyProvider: true
        });
      }
    }

    // Check text responses for keywords
    if (response.response_text && alertRules.alert_keywords) {
      const text = response.response_text.toLowerCase();
      const triggeringKeywords = alertRules.alert_keywords.filter((keyword: string) => 
        text.includes(keyword.toLowerCase())
      );
      
      if (triggeringKeywords.length > 0) {
        alerts.push({
          severity: alertRules.severity || 'medium',
          type: 'keyword_detected',
          message: `Concerning keywords detected: ${triggeringKeywords.join(', ')}`,
          questionId,
          response: response.response_text,
          requiresImmedateAction: alertRules.immediate_action || false,
          notifyProvider: true
        });
      }
    }

    // Process any alerts (save to database, send notifications, etc.)
    if (alerts.length > 0) {
      await this.processAlerts(alerts, response.patient_id);
    }

    return alerts;
  }

  /**
   * Process clinical alerts
   */
  private async processAlerts(alerts: ClinicalAlert[], patientId: string): Promise<void> {
    for (const alert of alerts) {
      // Save alert to database
      await this.supabase
        .from('clinical_alerts')
        .insert({
          patient_id: patientId,
          severity: alert.severity,
          type: alert.type,
          message: alert.message,
          source: 'form_response',
          source_id: alert.questionId,
          requires_immediate_action: alert.requiresImmedateAction,
          metadata: {
            response: alert.response,
            questionId: alert.questionId
          }
        });

      // TODO: Send notifications to providers if required
      if (alert.notifyProvider) {
        // Implement notification logic
      }
    }
  }

  /**
   * Update form completion status
   */
  private async updateFormStatus(patientFormId: string): Promise<void> {
    const status = await this.getFormCompletionStatus(patientFormId);
    
    if (!status) return;

    const updateData: any = {
      completion_percentage: status.completionPercentage,
      updated_at: new Date().toISOString()
    };

    // Update status based on completion
    if (status.isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    } else if (status.answeredQuestions > 0) {
      updateData.status = 'in_progress';
      if (!updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
    }

    await this.supabase
      .from('patient_forms')
      .update(updateData)
      .eq('id', patientFormId);
  }

  /**
   * Get form completion status
   */
  async getFormCompletionStatus(patientFormId: string): Promise<FormCompletionStatus | null> {
    try {
      // Get form details
      const { data: patientForm } = await this.supabase
        .from('patient_forms')
        .select('*, form_template_id')
        .eq('id', patientFormId)
        .single();

      if (!patientForm) return null;

      // Get all questions for this form
      const { data: sections } = await this.supabase
        .from('form_sections')
        .select(`
          *,
          section_questions!inner(
            *,
            questions!inner(*)
          )
        `)
        .eq('form_template_id', patientForm.form_template_id)
        .order('sort_order');

      if (!sections) return null;

      // Count total questions and required questions
      let totalQuestions = 0;
      let requiredQuestions = 0;
      const allQuestionIds: string[] = [];
      const requiredQuestionIds: string[] = [];

      sections.forEach((section: any) => {
        section.section_questions.forEach((sq: any) => {
          totalQuestions++;
          allQuestionIds.push(sq.question_id);
          
          const isRequired = sq.is_required_override ?? sq.questions.is_required;
          if (isRequired) {
            requiredQuestions++;
            requiredQuestionIds.push(sq.question_id);
          }
        });
      });

      // Get responses
      const { data: responses } = await this.supabase
        .from('question_responses')
        .select('question_id')
        .eq('patient_form_id', patientFormId)
        .in('question_id', allQuestionIds);

      const answeredQuestionIds = (responses || []).map(r => r.question_id);
      const answeredQuestions = answeredQuestionIds.length;
      const answeredRequiredQuestions = answeredQuestionIds.filter(id => 
        requiredQuestionIds.includes(id)
      ).length;

      // Calculate completion percentage
      const completionPercentage = totalQuestions > 0 
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;

      // Determine if form is complete (all required questions answered)
      const isComplete = answeredRequiredQuestions === requiredQuestions;

      // Find missing required questions
      const missingRequiredQuestions = requiredQuestionIds.filter(id => 
        !answeredQuestionIds.includes(id)
      );

      return {
        patientFormId,
        totalQuestions,
        answeredQuestions,
        requiredQuestions,
        answeredRequiredQuestions,
        completionPercentage,
        isComplete,
        missingRequiredQuestions
      };
    } catch (error) {
      console.error('Error in getFormCompletionStatus:', error);
      return null;
    }
  }

  /**
   * Get form responses for export or review
   */
  async getFormResponses(patientFormId: string): Promise<Record<string, any>> {
    try {
      const { data: responses } = await this.supabase
        .from('question_responses')
        .select(`
          *,
          questions!inner(*)
        `)
        .eq('patient_form_id', patientFormId);

      if (!responses) return {};

      const formattedResponses: Record<string, any> = {};

      responses.forEach((response: any) => {
        const question = response.questions;
        let value;

        // Extract the actual response value
        if (response.response_text !== null) value = response.response_text;
        else if (response.response_number !== null) value = response.response_number;
        else if (response.response_date !== null) value = response.response_date;
        else if (response.response_time !== null) value = response.response_time;
        else if (response.response_datetime !== null) value = response.response_datetime;
        else if (response.response_boolean !== null) value = response.response_boolean;
        else if (response.response_json !== null) value = response.response_json;
        else if (response.file_urls?.length > 0) value = response.file_urls;
        else if (response.image_urls?.length > 0) value = response.image_urls;
        else if (response.audio_url) value = response.audio_url;

        formattedResponses[question.question_text] = {
          value,
          type: question.question_type,
          answeredAt: response.created_at,
          responseMethod: response.response_method,
          clinicalFlags: response.clinical_flags
        };
      });

      return formattedResponses;
    } catch (error) {
      console.error('Error in getFormResponses:', error);
      return {};
    }
  }
}