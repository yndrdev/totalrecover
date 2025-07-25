# Form Extraction and Chat Integration Guide

## Overview

The TJV Recovery Platform now includes a comprehensive form extraction and chat integration system that seamlessly converts structured forms into conversational experiences within the patient chat interface.

## Architecture Components

### 1. Form Extraction Service (`/lib/services/form-extraction-service.ts`)
- Extracts form structure from database
- Converts forms to conversational flow
- Validates responses based on question type
- Creates chat-friendly prompts

### 2. Protocol Form Service (`/lib/services/protocol-form-service.ts`)
- Manages forms within recovery protocols
- Tracks form scheduling and frequency
- Monitors completion status
- Handles protocol-specific form logic

### 3. Form-to-Chat Converter (`/lib/services/form-to-chat-converter.ts`)
- Converts form questions to natural language
- Generates appropriate chat messages
- Parses user inputs based on question type
- Handles special intents (skip, back, pause)

### 4. Form Response Handler (`/lib/services/form-response-handler.ts`)
- Saves and validates responses
- Triggers clinical alerts
- Tracks completion progress
- Manages form state

## Usage Examples

### Basic Form Integration in Chat

```tsx
import { FormChatIntegration } from '@/components/chat/form-chat-integration';

// In your patient chat component
<FormChatIntegration
  patientId={patient.id}
  conversationId={conversation.id}
  onFormComplete={(formId, responses) => {
    console.log('Form completed:', formId, responses);
  }}
  onClinicalAlert={(alerts) => {
    // Handle clinical alerts
    alerts.forEach(alert => {
      if (alert.severity === 'high') {
        notifyProvider(alert);
      }
    });
  }}
/>
```

### Extracting a Form for Chat

```typescript
import { FormExtractionService } from '@/lib/services/form-extraction-service';

const formService = new FormExtractionService();

// Extract form structure
const extractedForm = await formService.extractFormById(formTemplateId);

// Convert to conversational flow
const conversationalData = formService.convertToConversationalFlow(extractedForm);

// Create chat prompt for a question
const prompt = formService.createChatPrompt(
  conversationalData.conversationalFlow[0],
  patientName
);
```

### Managing Protocol Forms

```typescript
import { ProtocolFormService } from '@/lib/services/protocol-form-service';

const protocolService = new ProtocolFormService();

// Get all forms for patient's protocol
const protocolForms = await protocolService.getPatientProtocolForms(patientId);

// Check today's forms
protocolForms.todaysForms.forEach(form => {
  if (form.status === 'pending') {
    // Prompt patient to complete form
  }
});

// Get next pending form
const nextForm = await protocolService.getNextPendingForm(patientId);
```

### Handling Form Responses

```typescript
import { FormResponseHandler } from '@/lib/services/form-response-handler';
import { FormToChatConverter } from '@/lib/services/form-to-chat-converter';

const responseHandler = new FormResponseHandler();
const converter = new FormToChatConverter();

// Parse user input
const parsedResponse = converter.parseUserInput(step, userInput);

// Validate response
const validation = formService.validateResponse(step, parsedResponse);

if (validation.isValid) {
  // Save response
  const result = await responseHandler.saveResponse({
    patientFormId,
    questionId: step.questionId,
    response: parsedResponse,
    responseType: step.type,
    responseMethod: 'text'
  });
  
  // Check for clinical alerts
  if (result.alerts && result.alerts.length > 0) {
    handleClinicalAlerts(result.alerts);
  }
}
```

## Medical Question Types

The system supports various medical-specific question types:

### Pain Scale
```typescript
{
  type: 'pain_scale',
  question: 'Rate your pain level',
  min: 0,
  max: 10
}
// Renders: 0-10 scale with color coding
// Green (0-3), Yellow (4-6), Red (7-10)
```

### Medication Search
```typescript
{
  type: 'medication_search',
  question: 'What medications are you taking?',
  placeholder: 'Search medications...'
}
// Features: Auto-complete, photo scanning option
```

### Condition Search
```typescript
{
  type: 'condition_search',
  question: 'Do you have any medical conditions?',
  placeholder: 'Search medical conditions...'
}
// Features: ICD-10 code mapping, synonym search
```

## Clinical Alerts

The system automatically triggers alerts based on:

1. **Pain Levels**: High pain (≥8) triggers immediate alerts
2. **Keywords**: Concerning symptoms in text responses
3. **Thresholds**: Numeric values outside safe ranges
4. **Yes/No Flags**: Positive responses to critical questions

## API Endpoints

### Extract Form
```http
POST /api/forms/extract
{
  "formTemplateId": "uuid"
}
```

### Submit Response
```http
POST /api/forms/submit
{
  "patientFormId": "uuid",
  "questionId": "uuid",
  "response": "answer",
  "responseType": "text",
  "responseMethod": "text"
}
```

### Get Protocol Forms
```http
GET /api/forms/protocol-forms?patientId=uuid
```

### Validate Response
```http
POST /api/forms/validate
{
  "questionType": "email",
  "response": "user@example.com",
  "validationRules": {}
}
```

## Best Practices

1. **Progressive Disclosure**: Present one question at a time
2. **Context Preservation**: Maintain conversation flow
3. **Error Recovery**: Allow users to correct mistakes
4. **Partial Saves**: Enable resuming incomplete forms
5. **Voice Support**: Offer voice input for accessibility
6. **Clinical Safety**: Monitor responses for concerning patterns

## Database Schema

The system uses these key tables:
- `form_templates`: Form definitions
- `questions`: Question library
- `patient_forms`: Form instances
- `question_responses`: Individual responses
- `clinical_alerts`: Generated alerts

## Security Considerations

1. All form data is encrypted at rest
2. Row-level security ensures data isolation
3. Audit trails track all form interactions
4. Clinical alerts are logged for compliance
5. PHI is handled according to HIPAA requirements