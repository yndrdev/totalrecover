"use client";

import { useState, useEffect } from 'react';
import { ConversationalForm } from './conversational-form';
import { FormExtractionService, ExtractedForm, ConversationalFormData } from '@/lib/services/form-extraction-service';
import { ProtocolFormService, ProtocolForm } from '@/lib/services/protocol-form-service';
import { FormToChatConverter, ChatFormMessage } from '@/lib/services/form-to-chat-converter';
import { FormResponseHandler, FormResponseData } from '@/lib/services/form-response-handler';
import { Button } from '@/components/ui/design-system/Button';
import { Card } from '@/components/ui/design-system/Card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, FileText, Clock, ChevronRight } from 'lucide-react';

interface FormChatIntegrationProps {
  patientId: string;
  conversationId: string;
  onFormComplete?: (formId: string, responses: Record<string, any>) => void;
  onFormProgress?: (formId: string, completionPercentage: number) => void;
  onClinicalAlert?: (alerts: any[]) => void;
}

export function FormChatIntegration({
  patientId,
  conversationId,
  onFormComplete,
  onFormProgress,
  onClinicalAlert
}: FormChatIntegrationProps) {
  const [loading, setLoading] = useState(true);
  const [protocolForms, setProtocolForms] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<ProtocolForm | null>(null);
  const [extractedForm, setExtractedForm] = useState<ExtractedForm | null>(null);
  const [conversationalData, setConversationalData] = useState<ConversationalFormData | null>(null);
  const [patientFormId, setPatientFormId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showFormsList, setShowFormsList] = useState(true);
  const [clinicalAlerts, setClinicalAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadProtocolForms();
  }, [patientId]);

  const loadProtocolForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/protocol-forms?patientId=${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setProtocolForms(data.data);
      }
    } catch (error) {
      console.error('Error loading protocol forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const startForm = async (form: ProtocolForm) => {
    try {
      setLoading(true);
      setSelectedForm(form);
      setShowFormsList(false);
      
      // Extract form structure
      const extractResponse = await fetch('/api/forms/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formTemplateId: form.formId })
      });
      
      const extractData = await extractResponse.json();
      if (extractData.success) {
        setExtractedForm(extractData.data.form);
        setConversationalData(extractData.data);
      }
      
      // Create patient form instance
      const instanceResponse = await fetch('/api/forms/protocol-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          formTemplateId: form.formId,
          protocolTaskId: form.taskId
        })
      });
      
      const instanceData = await instanceResponse.json();
      if (instanceData.success) {
        setPatientFormId(instanceData.data.patientFormId);
      }
    } catch (error) {
      console.error('Error starting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormResponse = async (questionId: string, response: any) => {
    if (!patientFormId || !conversationalData) return;
    
    const currentStep = conversationalData.conversationalFlow[currentStepIndex];
    
    // Save response locally
    const newResponses = { ...responses, [questionId]: response };
    setResponses(newResponses);
    
    // Submit response to backend
    try {
      const submitResponse = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientFormId,
          questionId,
          response,
          responseType: currentStep.type,
          responseMethod: 'text'
        })
      });
      
      const submitData = await submitResponse.json();
      if (submitData.success) {
        // Update completion percentage
        if (submitData.completionStatus) {
          setCompletionPercentage(submitData.completionStatus.completionPercentage);
          if (onFormProgress) {
            onFormProgress(selectedForm?.formId || '', submitData.completionStatus.completionPercentage);
          }
        }
        
        // Handle clinical alerts
        if (submitData.alerts && submitData.alerts.length > 0) {
          setClinicalAlerts([...clinicalAlerts, ...submitData.alerts]);
          if (onClinicalAlert) {
            onClinicalAlert(submitData.alerts);
          }
        }
        
        // Move to next question or complete form
        if (currentStepIndex < conversationalData.conversationalFlow.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          handleFormCompletion();
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const handleFormCompletion = async () => {
    if (!patientFormId || !selectedForm) return;
    
    // Update form status to completed
    await fetch('/api/forms/protocol-forms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientFormId,
        status: 'completed',
        completionPercentage: 100
      })
    });
    
    if (onFormComplete) {
      onFormComplete(selectedForm.formId, responses);
    }
    
    // Reset state
    setSelectedForm(null);
    setExtractedForm(null);
    setConversationalData(null);
    setPatientFormId(null);
    setCurrentStepIndex(0);
    setResponses({});
    setCompletionPercentage(0);
    setShowFormsList(true);
    
    // Reload forms list
    loadProtocolForms();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!protocolForms) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active protocol found. Please contact your care team.
        </AlertDescription>
      </Alert>
    );
  }

  if (showFormsList) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Forms</h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete these forms as part of your recovery journey.
          </p>
        </div>
        
        {protocolForms.todaysForms.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due Today
            </h4>
            {protocolForms.todaysForms.map((form: ProtocolForm) => (
              <FormCard key={form.taskId} form={form} onStart={() => startForm(form)} />
            ))}
          </div>
        )}
        
        {protocolForms.upcomingForms.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-medium text-gray-700">Upcoming Forms</h4>
            {protocolForms.upcomingForms.map((form: ProtocolForm) => (
              <FormCard 
                key={form.taskId} 
                form={form} 
                onStart={() => startForm(form)} 
                isUpcoming 
              />
            ))}
          </div>
        )}
        
        {protocolForms.completedForms.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-sm font-medium text-gray-700">Completed Forms</h4>
            {protocolForms.completedForms.map((form: ProtocolForm) => (
              <FormCard key={form.taskId} form={form} isCompleted />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedForm && extractedForm && conversationalData) {
    return (
      <div className="space-y-4">
        {clinicalAlerts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Important: Your responses indicate concerns that will be reviewed by your care team.
            </AlertDescription>
          </Alert>
        )}
        
        <ConversationalForm
          form={{
            id: extractedForm.id,
            title: extractedForm.name,
            description: extractedForm.description || undefined,
            questions: conversationalData.conversationalFlow.map(step => ({
              id: step.questionId,
              type: step.type as any,
              question: step.question,
              description: step.helpText,
              required: step.isRequired,
              options: step.options,
              min: step.validationRules?.min,
              max: step.validationRules?.max,
              placeholder: undefined,
              validation: step.validationRules,
              helpText: step.helpText,
              medicalDefinition: step.medicalDefinition,
              voicePrompt: step.voicePrompt
            }))
          }}
          onFieldComplete={handleFormResponse}
          onFormComplete={() => handleFormCompletion()}
          allowVoiceInput={extractedForm.voiceInputEnabled}
          showProgress={true}
          autoSave={extractedForm.allowPartialCompletion}
        />
      </div>
    );
  }

  return null;
}

interface FormCardProps {
  form: ProtocolForm;
  onStart?: () => void;
  isUpcoming?: boolean;
  isCompleted?: boolean;
}

function FormCard({ form, onStart, isUpcoming, isCompleted }: FormCardProps) {
  return (
    <Card 
      className={`p-4 ${
        isCompleted ? 'opacity-75' : ''
      } ${
        !isCompleted && !isUpcoming ? 'border-blue-200 bg-blue-50/50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">
              {form.form?.name || 'Assessment Form'}
            </h4>
            {form.isRequired && (
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          
          {form.form?.description && (
            <p className="text-sm text-gray-600 mt-1">
              {form.form.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Day {form.scheduledDay}</span>
            {form.form?.estimatedCompletionTime && (
              <span>{form.form.estimatedCompletionTime} min</span>
            )}
            {isCompleted && form.completedAt && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>
        
        {!isCompleted && onStart && (
          <Button
            variant={isUpcoming ? "secondary" : "primary"}
            size="sm"
            onClick={onStart}
            disabled={isUpcoming}
          >
            {isUpcoming ? 'Upcoming' : 'Start'}
            {!isUpcoming && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </div>
      
      {form.status === 'in_progress' && (
        <div className="mt-3">
          <Progress value={50} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">50% complete</p>
        </div>
      )}
    </Card>
  );
}