# Feature 4: Pre-Surgery Forms and Questionnaires

## Overview

The Pre-Surgery Forms and Questionnaires feature provides a comprehensive digital intake system that streamlines the pre-operative process for both patients and healthcare providers. This feature transforms traditional paper-based medical forms into intelligent, interactive digital experiences that integrate seamlessly with the chat interface while ensuring complete HIPAA compliance and clinical accuracy. The system supports complex medical questionnaires, consent forms, clearance requirements, and risk assessments that adapt based on patient responses and surgery type.

## Design Philosophy

The pre-surgery form system prioritizes patient understanding and completion while maintaining clinical rigor and legal compliance. Forms are presented in a conversational, step-by-step manner that reduces anxiety and confusion often associated with medical paperwork. The system emphasizes clear explanations, visual aids, and voice input options to accommodate patients with varying literacy levels and physical limitations.

## User Stories

### Epic: Comprehensive Pre-Operative Assessment

**As a Healthcare Provider, I want to collect complete and accurate pre-operative information from patients so that I can ensure surgical safety and optimal outcomes.**

#### User Story 4.1: Universal Medical Questionnaire
**As a Patient, I want to complete my medical history questionnaire in a clear, step-by-step process so that I can provide accurate information without feeling overwhelmed.**

**Acceptance Criteria:**
- Given I am scheduled for surgery and need to complete pre-operative forms
- When I access the medical questionnaire through the chat interface
- Then I should see questions presented one at a time in conversational format
- And I should be able to answer using voice input, text, or selection buttons
- And I should receive explanations for medical terms I might not understand
- And I should be able to upload photos of medication bottles or medical documents
- And the system should validate my responses and ask for clarification when needed
- And I should be able to save my progress and return later to complete the form
- And my responses should automatically populate relevant sections of other forms

**Technical Implementation:**
- Conversational form presentation with medical terminology explanations
- Multi-modal input support including voice transcription and image upload
- Intelligent response validation with medical context awareness
- Progress saving and session management
- Cross-form data population and consistency checking

**Medical Questionnaire Component:**
```typescript
<UniversalMedicalQuestionnaire
  patientId={patient.id}
  surgeryType={patient.surgeryType}
  onSectionComplete={handleSectionComplete}
  onFormComplete={handleFormComplete}
  enableVoiceInput={true}
  enableImageUpload={true}
  showMedicalDefinitions={true}
  autoSave={true}
/>
```

#### User Story 4.2: Medication and Allergy Documentation
**As a Patient, I want to easily document all my medications and allergies so that my surgical team has complete information for my safety.**

**Acceptance Criteria:**
- Given I am completing my pre-operative assessment
- When I reach the medication and allergy section
- Then I should be able to search for medications by name or scan medication bottles
- And I should be able to specify dosages, frequencies, and prescribing physicians
- And I should be able to document drug allergies with reaction descriptions
- And I should be able to include over-the-counter medications and supplements
- And the system should flag potential drug interactions or surgical concerns
- And I should receive guidance on which medications to stop before surgery

**Technical Implementation:**
- Medication database integration with search and autocomplete
- OCR technology for medication bottle scanning
- Drug interaction checking algorithms
- Pre-operative medication guidance system
- Allergy severity classification and documentation

**Medication Documentation Interface:**
```typescript
<MedicationDocumentation
  onMedicationAdd={handleMedicationAdd}
  onAllergyAdd={handleAllergyAdd}
  enableOCRScanning={true}
  enableDrugInteractionCheck={true}
  showPreOpGuidance={true}
  medicationDatabase={medicationDB}
/>
```

#### User Story 4.3: Medical History and Previous Surgeries
**As a Patient, I want to document my complete medical history including previous surgeries so that my surgical team understands my health background.**

**Acceptance Criteria:**
- Given I am providing my medical history
- When I document previous surgeries and medical conditions
- Then I should be able to search for conditions from a comprehensive medical database
- And I should be able to specify dates, treating physicians, and outcomes
- And I should be able to upload relevant medical records or imaging
- And the system should identify conditions that may impact my upcoming surgery
- And I should receive prompts for related conditions I might have forgotten
- And the information should be organized chronologically for easy provider review

**Technical Implementation:**
- Medical condition database with ICD-10 coding
- Chronological timeline visualization
- Medical record upload and OCR processing
- Risk factor identification algorithms
- Related condition suggestion engine

### Epic: Surgical Consent and Legal Documentation

**As a Healthcare Provider, I want to ensure all patients provide proper informed consent with full understanding of their procedure and associated risks.**

#### User Story 4.4: Informed Consent Process
**As a Patient, I want to understand my surgical procedure and associated risks so that I can provide truly informed consent.**

**Acceptance Criteria:**
- Given I need to provide informed consent for my surgery
- When I access the consent process
- Then I should see a detailed explanation of my specific procedure
- And I should see procedure-specific risks and benefits clearly explained
- And I should be able to watch educational videos about my surgery
- And I should be able to ask questions and receive answers before consenting
- And I should be able to review alternative treatment options
- And I should provide digital signature with timestamp and IP logging
- And I should receive a copy of my signed consent for my records

**Technical Implementation:**
- Surgery-specific consent form generation
- Educational video integration
- Interactive Q&A system with provider escalation
- Digital signature capture with legal compliance
- Automated consent document generation and distribution

**Informed Consent Interface:**
```typescript
<InformedConsentProcess
  surgeryType={patient.surgeryType}
  surgeonId={patient.assignedSurgeon}
  onQuestionSubmit={handleConsentQuestion}
  onConsentSign={handleConsentSignature}
  enableVideoEducation={true}
  requireDigitalSignature={true}
  generatePDF={true}
/>
```

#### User Story 4.5: Anesthesia Consent and Assessment
**As a Patient, I want to understand anesthesia options and risks so that I can make informed decisions about my anesthetic care.**

**Acceptance Criteria:**
- Given I need anesthesia for my surgery
- When I complete the anesthesia assessment
- Then I should see explanations of different anesthesia types available for my procedure
- And I should document my anesthesia history and any previous complications
- And I should be able to express preferences or concerns about anesthesia
- And I should understand the risks specific to my health conditions
- And I should be able to schedule a consultation with the anesthesiologist if needed
- And my anesthesia consent should be properly documented and signed

**Technical Implementation:**
- Anesthesia type recommendation engine based on surgery and patient factors
- Anesthesia risk calculator integration
- Anesthesiologist consultation scheduling
- Specialized anesthesia consent documentation

#### User Story 4.6: Facility and Financial Consent
**As a Patient, I want to understand facility policies, financial responsibilities, and insurance coverage so that I can make informed financial decisions.**

**Acceptance Criteria:**
- Given I am having surgery at a specific facility
- When I complete facility and financial consent
- Then I should understand the facility's policies and procedures
- And I should see my estimated costs and insurance coverage
- And I should be able to set up payment plans if needed
- And I should understand my rights and responsibilities as a patient
- And I should be able to designate emergency contacts and healthcare proxies
- And all financial agreements should be clearly documented

**Technical Implementation:**
- Insurance verification and benefits checking
- Cost estimation tools with payment plan options
- Patient rights and responsibilities documentation
- Emergency contact and healthcare proxy designation

### Epic: Medical Clearance and Risk Assessment

**As a Healthcare Provider, I want to identify and address all medical risks before surgery so that I can optimize patient safety and outcomes.**

#### User Story 4.7: Cardiac Risk Stratification
**As a Patient with potential cardiac risk factors, I want to complete appropriate cardiac assessment so that my surgical team can ensure my heart health during surgery.**

**Acceptance Criteria:**
- Given I have cardiac risk factors or history
- When I complete the cardiac assessment
- Then I should answer questions about my heart health and symptoms
- And the system should calculate my cardiac risk score
- And I should understand if I need additional cardiac testing
- And I should be able to upload recent cardiac test results
- And my cardiologist should be notified if clearance is needed
- And I should receive clear instructions for cardiac optimization

**Technical Implementation:**
- Cardiac risk scoring algorithms (RCRI, NSQIP)
- Automated cardiac clearance determination
- Cardiologist notification and consultation scheduling
- Cardiac test result upload and interpretation

**Cardiac Risk Assessment:**
```typescript
<CardiacRiskAssessment
  patientAge={patient.age}
  surgeryType={patient.surgeryType}
  onRiskCalculation={handleRiskCalculation}
  onClearanceRequired={handleClearanceRequired}
  enableTestUpload={true}
  showRiskExplanation={true}
/>
```

#### User Story 4.8: Dental Clearance Requirements
**As a Patient requiring dental clearance, I want to understand why dental health is important for my surgery and how to obtain proper clearance.**

**Acceptance Criteria:**
- Given my surgery requires dental clearance
- When I access the dental clearance section
- Then I should understand why dental health affects surgical outcomes
- And I should see what dental issues need to be addressed before surgery
- And I should be able to find approved dentists for clearance
- And I should be able to upload my dental clearance documentation
- And my surgical team should be notified when clearance is complete
- And I should understand the timeline for completing dental work

**Technical Implementation:**
- Dental clearance requirement determination
- Approved provider directory integration
- Dental clearance document upload and verification
- Timeline management for dental work completion

#### User Story 4.9: Specialist Medical Clearance
**As a Patient with complex medical conditions, I want to coordinate clearance from my specialists so that all my health conditions are optimized for surgery.**

**Acceptance Criteria:**
- Given I have medical conditions requiring specialist clearance
- When I complete the specialist clearance section
- Then I should see which specialists need to provide clearance
- And I should be able to contact my specialists directly through the system
- And I should be able to upload clearance letters and test results
- And my surgical team should track the status of all required clearances
- And I should receive reminders about pending clearances
- And surgery scheduling should be coordinated with clearance completion

**Technical Implementation:**
- Specialist clearance requirement engine
- Provider communication and notification system
- Clearance document management and tracking
- Surgery scheduling integration with clearance status

### Epic: Pre-Operative Preparation and Education

**As a Patient, I want comprehensive preparation instructions so that I can optimize my health and readiness for surgery.**

#### User Story 4.10: Surgery Preparation Checklist
**As a Patient, I want a personalized preparation checklist so that I know exactly what to do before my surgery.**

**Acceptance Criteria:**
- Given my surgery is scheduled
- When I access my preparation checklist
- Then I should see a timeline of tasks leading up to surgery
- And I should receive instructions for diet, medications, and lifestyle modifications
- And I should be able to check off completed tasks
- And I should receive reminders for time-sensitive tasks
- And I should be able to ask questions about preparation instructions
- And my surgical team should see my preparation progress

**Technical Implementation:**
- Personalized checklist generation based on surgery type and patient factors
- Timeline-based task management with notifications
- Progress tracking and provider visibility
- Interactive Q&A for preparation questions

**Surgery Preparation Component:**
```typescript
<SurgeryPreparationChecklist
  surgeryDate={patient.surgeryDate}
  surgeryType={patient.surgeryType}
  patientConditions={patient.medicalConditions}
  onTaskComplete={handleTaskComplete}
  onQuestionSubmit={handlePreparationQuestion}
  enableReminders={true}
  showTimeline={true}
/>
```

## Technical Specifications

### Form Architecture

#### Dynamic Form Generation
```typescript
// Pre-surgery form configuration
interface PreSurgeryFormConfig {
  surgeryType: SurgeryType;
  patientProfile: PatientProfile;
  facilityRequirements: FacilityRequirements;
  insuranceRequirements: InsuranceRequirements;
}

class PreSurgeryFormGenerator {
  generateRequiredForms(config: PreSurgeryFormConfig): FormSuite {
    const forms: FormDefinition[] = [];
    
    // Always required forms
    forms.push(this.generateUniversalMedicalQuestionnaire(config));
    forms.push(this.generateInformedConsent(config));
    forms.push(this.generateAnesthesiaConsent(config));
    forms.push(this.generateFacilityConsent(config));
    
    // Conditional forms based on patient factors
    if (this.requiresCardiacClearance(config)) {
      forms.push(this.generateCardiacRiskAssessment(config));
    }
    
    if (this.requiresDentalClearance(config)) {
      forms.push(this.generateDentalClearanceForm(config));
    }
    
    if (this.requiresSpecialistClearance(config)) {
      forms.push(this.generateSpecialistClearanceForm(config));
    }
    
    return {
      forms,
      estimatedCompletionTime: this.calculateCompletionTime(forms),
      dependencies: this.mapFormDependencies(forms)
    };
  }
  
  private requiresCardiacClearance(config: PreSurgeryFormConfig): boolean {
    const { patientProfile, surgeryType } = config;
    
    // High-risk surgery types
    if (['THA', 'TKA'].includes(surgeryType) && patientProfile.age > 65) {
      return true;
    }
    
    // Cardiac risk factors
    const cardiacRiskFactors = [
      'diabetes', 'hypertension', 'coronary_artery_disease',
      'heart_failure', 'arrhythmia', 'previous_mi'
    ];
    
    return patientProfile.medicalConditions.some(condition => 
      cardiacRiskFactors.includes(condition)
    );
  }
}
```

#### Medical Validation Engine
```typescript
// Medical data validation and risk assessment
class MedicalValidationEngine {
  validateMedicationList(medications: Medication[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Check for drug interactions
    const interactions = this.checkDrugInteractions(medications);
    interactions.forEach(interaction => {
      issues.push({
        severity: interaction.severity,
        type: 'drug_interaction',
        message: `Potential interaction between ${interaction.drug1} and ${interaction.drug2}`,
        recommendation: interaction.recommendation
      });
    });
    
    // Check for pre-operative medication concerns
    medications.forEach(medication => {
      const preOpConcern = this.checkPreOperativeConcerns(medication);
      if (preOpConcern) {
        issues.push({
          severity: preOpConcern.severity,
          type: 'preop_medication',
          message: `${medication.name} may need adjustment before surgery`,
          recommendation: preOpConcern.recommendation
        });
      }
    });
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      issues
    };
  }
  
  calculateCardiacRisk(assessment: CardiacAssessment): CardiacRiskResult {
    let riskScore = 0;
    
    // Revised Cardiac Risk Index (RCRI) factors
    if (assessment.coronaryArteryDisease) riskScore += 1;
    if (assessment.heartFailure) riskScore += 1;
    if (assessment.cerebrovascularDisease) riskScore += 1;
    if (assessment.diabetes) riskScore += 1;
    if (assessment.renalInsufficiency) riskScore += 1;
    if (assessment.isHighRiskSurgery) riskScore += 1;
    
    const riskLevel = this.interpretRiskScore(riskScore);
    const recommendations = this.generateCardiacRecommendations(riskLevel, assessment);
    
    return {
      riskScore,
      riskLevel,
      recommendations,
      requiresClearance: riskLevel === 'high' || riskScore >= 2
    };
  }
}
```

### Database Integration

#### Form Response Storage
```sql
-- Pre-surgery form responses with medical validation
CREATE TABLE preop_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN (
    'universal_medical_questionnaire',
    'informed_consent',
    'anesthesia_consent',
    'facility_consent',
    'cardiac_risk_assessment',
    'dental_clearance',
    'specialist_clearance'
  )),
  
  -- Form data and metadata
  form_responses JSONB NOT NULL,
  completion_status TEXT DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'requires_review')),
  completion_percentage INTEGER DEFAULT 0,
  
  -- Medical validation
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'requires_attention')),
  validation_issues JSONB DEFAULT '[]',
  risk_flags JSONB DEFAULT '[]',
  
  -- Digital signatures and legal compliance
  digital_signatures JSONB DEFAULT '[]',
  consent_timestamp TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  
  -- Provider review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  clearance_status TEXT DEFAULT 'pending' CHECK (clearance_status IN ('pending', 'cleared', 'requires_additional_work')),
  
  -- Timing and workflow
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical clearance tracking
CREATE TABLE medical_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  clearance_type TEXT NOT NULL CHECK (clearance_type IN ('cardiac', 'pulmonary', 'endocrine', 'dental', 'specialist')),
  specialty TEXT, -- For specialist clearances
  
  -- Clearance status
  status TEXT DEFAULT 'required' CHECK (status IN ('required', 'in_progress', 'completed', 'not_required')),
  required_by DATE,
  completed_at TIMESTAMPTZ,
  
  -- Provider information
  clearing_provider_name TEXT,
  clearing_provider_contact TEXT,
  clearing_provider_npi TEXT,
  
  -- Documentation
  clearance_document_url TEXT,
  clearance_notes TEXT,
  restrictions TEXT,
  recommendations TEXT,
  
  -- Risk assessment
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
  risk_factors TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication documentation
CREATE TABLE patient_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Medication details
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  ndc_code TEXT, -- National Drug Code
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT, -- oral, injection, topical, etc.
  
  -- Prescriber information
  prescribing_physician TEXT,
  prescriber_npi TEXT,
  pharmacy_name TEXT,
  
  -- Usage details
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  indication TEXT, -- What condition is this treating
  
  -- Pre-operative instructions
  preop_instructions TEXT, -- Continue, stop, modify
  stop_before_surgery_days INTEGER,
  restart_after_surgery_days INTEGER,
  
  -- Drug interaction flags
  interaction_flags JSONB DEFAULT '[]',
  allergy_flags JSONB DEFAULT '[]',
  
  -- Documentation
  medication_image_url TEXT, -- Photo of medication bottle
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

#### Pre-Surgery Form API
```typescript
// Pre-surgery form management endpoints
GET /api/preop/forms/required/:patientId
POST /api/preop/forms/:formType/start
PUT /api/preop/forms/:formId/update
POST /api/preop/forms/:formId/complete
GET /api/preop/forms/:formId/status

// Medical validation endpoints
POST /api/preop/validate/medications
POST /api/preop/validate/allergies
POST /api/preop/assess/cardiac-risk
POST /api/preop/assess/surgical-risk

// Clearance management endpoints
GET /api/preop/clearances/:patientId
POST /api/preop/clearances/:clearanceId/request
PUT /api/preop/clearances/:clearanceId/complete
GET /api/preop/clearances/:clearanceId/status

// Document management endpoints
POST /api/preop/documents/upload
GET /api/preop/documents/:documentId
POST /api/preop/documents/:documentId/sign
GET /api/preop/documents/:patientId/summary

// Provider review endpoints
GET /api/preop/review/pending
PUT /api/preop/review/:formId/approve
PUT /api/preop/review/:formId/request-changes
POST /api/preop/review/:formId/notes
```

### Component Library

#### Pre-Surgery Form Components
```typescript
// Main pre-surgery form suite
<PreSurgeryFormSuite
  patientId={patient.id}
  surgeryType={patient.surgeryType}
  onFormComplete={handleFormComplete}
  onClearanceUpdate={handleClearanceUpdate}
  enableVoiceInput={true}
  showProgress={true}
/>

// Individual form components
<UniversalMedicalQuestionnaire
  onSectionComplete={handleSectionComplete}
  enableMedicalTermDefinitions={true}
  enableImageUpload={true}
  autoValidate={true}
/>

<MedicationDocumentation
  onMedicationAdd={handleMedicationAdd}
  enableOCRScanning={true}
  enableInteractionCheck={true}
  showPreOpGuidance={true}
/>

<InformedConsentForm
  surgeryType={patient.surgeryType}
  surgeonName={surgeon.name}
  onConsentSign={handleConsentSign}
  enableVideoEducation={true}
  requireDigitalSignature={true}
/>

<CardiacRiskAssessment
  patientAge={patient.age}
  onRiskCalculation={handleRiskCalculation}
  enableClearanceRequest={true}
  showRiskExplanation={true}
/>

// Clearance tracking components
<ClearanceTracker
  requiredClearances={clearances}
  onClearanceRequest={handleClearanceRequest}
  onDocumentUpload={handleDocumentUpload}
  showTimeline={true}
/>

<PreparationChecklist
  surgeryDate={patient.surgeryDate}
  onTaskComplete={handleTaskComplete}
  enableReminders={true}
  showCountdown={true}
/>
```

### Medical Integration Services

#### Drug Interaction Checking
```typescript
// Drug interaction service integration
class DrugInteractionService {
  private interactionDatabase: DrugInteractionDB;
  
  async checkInteractions(medications: Medication[]): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = await this.checkPairInteraction(
          medications[i], 
          medications[j]
        );
        
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions.sort((a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity));
  }
  
  async getPreOperativeGuidance(medication: Medication, surgeryType: SurgeryType): Promise<PreOpGuidance> {
    const guidance = await this.interactionDatabase.getPreOpGuidance(
      medication.genericName || medication.name,
      surgeryType
    );
    
    return {
      action: guidance.action, // 'continue', 'stop', 'modify'
      stopDaysBefore: guidance.stopDaysBefore,
      restartDaysAfter: guidance.restartDaysAfter,
      alternativeOptions: guidance.alternatives,
      reasoning: guidance.reasoning,
      urgency: guidance.urgency
    };
  }
}
```

#### Medical Record OCR Processing
```typescript
// OCR service for medical document processing
class MedicalOCRService {
  async processMedicationBottle(imageFile: File): Promise<MedicationInfo> {
    const ocrResult = await this.performOCR(imageFile);
    const extractedInfo = await this.extractMedicationInfo(ocrResult.text);
    
    return {
      medicationName: extractedInfo.name,
      dosage: extractedInfo.dosage,
      frequency: extractedInfo.frequency,
      prescriber: extractedInfo.prescriber,
      pharmacy: extractedInfo.pharmacy,
      ndcCode: extractedInfo.ndc,
      confidence: ocrResult.confidence
    };
  }
  
  async processLabResults(imageFile: File): Promise<LabResults> {
    const ocrResult = await this.performOCR(imageFile);
    const structuredData = await this.parseLabResults(ocrResult.text);
    
    return {
      testDate: structuredData.date,
      orderingPhysician: structuredData.physician,
      results: structuredData.values,
      abnormalFlags: structuredData.abnormal,
      referenceRanges: structuredData.ranges
    };
  }
  
  private async extractMedicationInfo(ocrText: string): Promise<ExtractedMedicationInfo> {
    // Use AI/ML to extract structured medication information from OCR text
    const prompt = `Extract medication information from this prescription label text: ${ocrText}`;
    
    const aiResponse = await this.aiService.extractStructuredData(prompt, {
      schema: medicationExtractionSchema
    });
    
    return aiResponse.data;
  }
}
```

### Compliance and Security

#### HIPAA Compliance Features
```typescript
// HIPAA-compliant form handling
class HIPAACompliantFormHandler {
  async saveFormResponse(
    formResponse: FormResponse, 
    patientId: string, 
    userContext: UserContext
  ): Promise<void> {
    // Encrypt sensitive medical data
    const encryptedResponse = await this.encryptMedicalData(formResponse);
    
    // Log access for audit trail
    await this.auditLogger.logDataAccess({
      userId: userContext.userId,
      patientId: patientId,
      action: 'form_save',
      dataType: 'medical_form',
      timestamp: new Date(),
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent
    });
    
    // Save with proper access controls
    await this.database.saveWithRLS(encryptedResponse, {
      tenantId: userContext.tenantId,
      userId: userContext.userId
    });
    
    // Notify relevant providers
    await this.notificationService.notifyProviders(patientId, {
      type: 'form_completed',
      formType: formResponse.formType,
      urgency: this.determineUrgency(formResponse)
    });
  }
  
  async generateConsentDocument(
    consentData: ConsentData, 
    digitalSignature: DigitalSignature
  ): Promise<LegalDocument> {
    // Generate legally compliant consent document
    const document = await this.documentGenerator.generateConsent({
      patientInfo: consentData.patient,
      procedureInfo: consentData.procedure,
      risks: consentData.risks,
      alternatives: consentData.alternatives,
      signature: digitalSignature,
      timestamp: new Date(),
      ipAddress: digitalSignature.ipAddress
    });
    
    // Store with legal compliance metadata
    await this.legalDocumentStorage.store(document, {
      retentionPeriod: '7 years',
      accessLevel: 'restricted',
      auditRequired: true
    });
    
    return document;
  }
}
```

### Testing and Quality Assurance

#### Medical Form Validation Testing
```typescript
// Comprehensive testing for medical forms
describe('Pre-Surgery Forms', () => {
  describe('Medical Questionnaire', () => {
    test('should validate medication interactions', async () => {
      const medications = [
        { name: 'Warfarin', dosage: '5mg', frequency: 'daily' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'daily' }
      ];
      
      const validation = await medicalValidator.validateMedicationList(medications);
      
      expect(validation.issues).toContainEqual(
        expect.objectContaining({
          type: 'drug_interaction',
          severity: 'high'
        })
      );
    });
    
    test('should calculate cardiac risk correctly', async () => {
      const assessment = {
        age: 75,
        coronaryArteryDisease: true,
        diabetes: true,
        heartFailure: false,
        cerebrovascularDisease: false,
        renalInsufficiency: false,
        isHighRiskSurgery: true
      };
      
      const riskResult = await cardiacRiskCalculator.calculate(assessment);
      
      expect(riskResult.riskScore).toBe(3);
      expect(riskResult.riskLevel).toBe('high');
      expect(riskResult.requiresClearance).toBe(true);
    });
  });
  
  describe('Consent Process', () => {
    test('should generate valid digital signature', async () => {
      const consentData = {
        patientId: 'patient-123',
        procedureType: 'TKA',
        signatureData: 'base64-signature-data'
      };
      
      const signature = await digitalSignatureService.createSignature(consentData);
      
      expect(signature.isValid).toBe(true);
      expect(signature.timestamp).toBeDefined();
      expect(signature.ipAddress).toBeDefined();
    });
  });
});
```

This comprehensive Pre-Surgery Forms and Questionnaires feature ensures that all necessary medical information is collected efficiently and accurately while maintaining the highest standards of patient experience, clinical quality, and regulatory compliance.

