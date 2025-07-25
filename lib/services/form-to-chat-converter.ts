import { ExtractedForm, ConversationalStep, ConversationalFormData } from './form-extraction-service';
import { Database } from '@/types/supabase';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export interface ChatFormMessage {
  role: 'assistant' | 'user';
  content: string;
  metadata?: {
    formId?: string;
    questionId?: string;
    questionType?: string;
    isFormStart?: boolean;
    isFormEnd?: boolean;
    options?: any[];
    validationRules?: any;
  };
}

export interface FormChatSession {
  formId: string;
  patientFormId: string;
  currentStep: string;
  responses: Record<string, any>;
  completedSteps: string[];
  startedAt: Date;
  lastInteraction: Date;
}

export class FormToChatConverter {
  /**
   * Convert a form into an initial chat message
   */
  createFormIntroduction(form: ExtractedForm, patientName?: string): ChatFormMessage {
    let introduction = `I'd like to help you complete the ${form.name}.`;
    
    if (form.description) {
      introduction += ` ${form.description}`;
    }
    
    if (form.estimatedCompletionTime) {
      introduction += ` This should take about ${form.estimatedCompletionTime} minutes.`;
    }
    
    if (form.allowPartialCompletion) {
      introduction += ` You can save your progress and come back later if needed.`;
    }
    
    introduction += ` Let's get started!`;
    
    return {
      role: 'assistant',
      content: introduction,
      metadata: {
        formId: form.id,
        isFormStart: true
      }
    };
  }

  /**
   * Convert a conversational step into a chat message
   */
  stepToChatMessage(step: ConversationalStep, patientName?: string): ChatFormMessage {
    let content = this.formatQuestion(step, patientName);
    
    return {
      role: 'assistant',
      content,
      metadata: {
        questionId: step.questionId,
        questionType: step.type,
        options: step.options,
        validationRules: step.validationRules
      }
    };
  }

  /**
   * Format a question for chat presentation
   */
  private formatQuestion(step: ConversationalStep, patientName?: string): string {
    let question = step.voicePrompt || step.question;
    
    // Personalize if patient name provided
    if (patientName) {
      question = question.replace(/\b(you|your)\b/gi, (match) => {
        return match.toLowerCase() === 'you' ? patientName : `${patientName}'s`;
      });
    }
    
    // Add formatting based on question type
    switch (step.type) {
      case 'yes_no':
        question += '\n\n✅ Yes  ❌ No';
        break;
        
      case 'scale':
      case 'pain_scale':
        question += '\n\n0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟';
        if (step.type === 'pain_scale') {
          question += '\n(0 = No pain, 10 = Worst pain imaginable)';
        }
        break;
        
      case 'multiple_choice':
      case 'single_choice':
        if (step.options && Array.isArray(step.options)) {
          question += '\n';
          step.options.forEach((option: any, index: number) => {
            const emoji = this.getNumberEmoji(index + 1);
            question += `\n${emoji} ${option.label || option}`;
          });
        }
        break;
        
      case 'date':
        question += '\n\n📅 Please enter the date (MM/DD/YYYY)';
        break;
        
      case 'time':
        question += '\n\n🕐 Please enter the time (HH:MM AM/PM)';
        break;
        
      case 'medication_search':
        question += '\n\n💊 You can type the medication name or say "scan" to take a photo of your medication bottle.';
        break;
        
      case 'condition_search':
        question += '\n\n🔍 Start typing to search for medical conditions.';
        break;
        
      case 'file_upload':
        question += '\n\n📎 Please upload the requested file.';
        break;
        
      case 'image_upload':
        question += '\n\n📷 Please upload an image or take a photo.';
        break;
    }
    
    // Add help text if available
    if (step.helpText) {
      question += `\n\nℹ️ ${step.helpText}`;
    }
    
    // Add medical definition if available
    if (step.medicalDefinition) {
      question += `\n\n📚 ${step.medicalDefinition}`;
    }
    
    return question;
  }

  /**
   * Process a user response and generate appropriate feedback
   */
  processUserResponse(step: ConversationalStep, response: string, validation: { isValid: boolean; error?: string }): ChatFormMessage[] {
    const messages: ChatFormMessage[] = [];
    
    // Add user message
    messages.push({
      role: 'user',
      content: response
    });
    
    // Add validation feedback if invalid
    if (!validation.isValid) {
      messages.push({
        role: 'assistant',
        content: `⚠️ ${validation.error}\n\nLet's try that again.`,
        metadata: {
          questionId: step.questionId,
          questionType: step.type
        }
      });
      return messages;
    }
    
    // Add positive acknowledgment for certain types
    const acknowledgment = this.generateAcknowledgment(step, response);
    if (acknowledgment) {
      messages.push({
        role: 'assistant',
        content: acknowledgment
      });
    }
    
    return messages;
  }

  /**
   * Generate acknowledgment based on response type
   */
  private generateAcknowledgment(step: ConversationalStep, response: string): string | null {
    switch (step.type) {
      case 'pain_scale':
        const painLevel = parseInt(response);
        if (painLevel >= 7) {
          return "I understand you're experiencing significant pain. I've noted this for your care team.";
        } else if (painLevel >= 4) {
          return "Thank you for letting me know about your pain level. We'll monitor this closely.";
        } else if (painLevel <= 2) {
          return "I'm glad to hear your pain is well-controlled.";
        }
        break;
        
      case 'yes_no':
        if (step.questionId.includes('emergency') && response.toLowerCase() === 'yes') {
          return "⚠️ This requires immediate attention. Please contact your care team right away.";
        }
        break;
        
      case 'medication_search':
        return `Got it. I've recorded ${response} in your medication list.`;
        
      default:
        return null;
    }
    
    return null;
  }

  /**
   * Create a form completion message
   */
  createFormCompletion(form: ExtractedForm, totalQuestions: number, skippedQuestions: number = 0): ChatFormMessage {
    let completion = `🎉 Great job! You've completed the ${form.name}.`;
    
    if (skippedQuestions > 0) {
      completion += ` You answered ${totalQuestions - skippedQuestions} out of ${totalQuestions} questions.`;
    }
    
    completion += ` Your responses have been saved and will be reviewed by your care team.`;
    
    if (form.clinicalPurpose) {
      completion += ` This information helps us ${form.clinicalPurpose.toLowerCase()}.`;
    }
    
    return {
      role: 'assistant',
      content: completion,
      metadata: {
        formId: form.id,
        isFormEnd: true
      }
    };
  }

  /**
   * Create a form pause/save message
   */
  createFormPauseMessage(form: ExtractedForm, completionPercentage: number): ChatFormMessage {
    return {
      role: 'assistant',
      content: `Your progress has been saved (${completionPercentage}% complete). You can continue the ${form.name} anytime by saying "continue form" or selecting it from your tasks.`,
      metadata: {
        formId: form.id
      }
    };
  }

  /**
   * Create a form resume message
   */
  createFormResumeMessage(form: ExtractedForm, lastQuestionText: string, completionPercentage: number): ChatFormMessage {
    return {
      role: 'assistant',
      content: `Welcome back! Let's continue with the ${form.name} (${completionPercentage}% complete).\n\nWe were at: "${lastQuestionText}"\n\nWould you like to continue from where you left off?`,
      metadata: {
        formId: form.id
      }
    };
  }

  /**
   * Get emoji for number (1-10)
   */
  private getNumberEmoji(num: number): string {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[Math.min(num - 1, 9)] || `${num}.`;
  }

  /**
   * Parse user input based on question type
   */
  parseUserInput(step: ConversationalStep, input: string): any {
    switch (step.type) {
      case 'yes_no':
        const yesVariants = ['yes', 'y', 'yeah', 'yep', 'sure', 'ok', 'okay', 'true', '✅'];
        const noVariants = ['no', 'n', 'nope', 'nah', 'false', '❌'];
        const lowerInput = input.toLowerCase().trim();
        
        if (yesVariants.includes(lowerInput)) return 'yes';
        if (noVariants.includes(lowerInput)) return 'no';
        return input;
        
      case 'number':
      case 'scale':
      case 'pain_scale':
        // Handle emoji numbers
        const emojiMap: Record<string, number> = {
          '0️⃣': 0, '1️⃣': 1, '2️⃣': 2, '3️⃣': 3, '4️⃣': 4,
          '5️⃣': 5, '6️⃣': 6, '7️⃣': 7, '8️⃣': 8, '9️⃣': 9, '🔟': 10
        };
        
        if (emojiMap[input.trim()]) {
          return emojiMap[input.trim()];
        }
        
        // Extract number from text like "5 out of 10" or "pain is 7"
        const numberMatch = input.match(/\b(\d+(?:\.\d+)?)\b/);
        if (numberMatch) {
          return parseFloat(numberMatch[1]);
        }
        return input;
        
      case 'multiple_choice':
      case 'single_choice':
        // Handle selection by number or emoji
        const choiceMatch = input.match(/^(\d+)|([1-9]️⃣|🔟)/);
        if (choiceMatch) {
          const index = choiceMatch[1] ? parseInt(choiceMatch[1]) - 1 : this.emojiToIndex(choiceMatch[2]);
          if (step.options && step.options[index]) {
            return step.options[index].value || step.options[index];
          }
        }
        
        // Try to match by text
        if (step.options) {
          const lowerInput = input.toLowerCase().trim();
          const match = step.options.find((opt: any) => 
            (opt.label || opt).toLowerCase() === lowerInput
          );
          if (match) return match.value || match;
        }
        return input;
        
      case 'date':
        // Try to parse various date formats
        const dateFormats = [
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // MM/DD/YYYY
          /^(\d{1,2})-(\d{1,2})-(\d{4})$/,     // MM-DD-YYYY
          /^(\d{4})-(\d{1,2})-(\d{1,2})$/      // YYYY-MM-DD
        ];
        
        for (const format of dateFormats) {
          const match = input.match(format);
          if (match) {
            return input;
          }
        }
        return input;
        
      default:
        return input.trim();
    }
  }

  /**
   * Convert emoji to index
   */
  private emojiToIndex(emoji: string): number {
    const emojiMap: Record<string, number> = {
      '1️⃣': 0, '2️⃣': 1, '3️⃣': 2, '4️⃣': 3, '5️⃣': 4,
      '6️⃣': 5, '7️⃣': 6, '8️⃣': 7, '9️⃣': 8, '🔟': 9
    };
    return emojiMap[emoji] || 0;
  }

  /**
   * Check if input indicates user wants to skip
   */
  isSkipIntent(input: string): boolean {
    const skipPhrases = ['skip', 'pass', 'next', 'i don\'t know', 'not sure', 'n/a', 'na', '-'];
    return skipPhrases.includes(input.toLowerCase().trim());
  }

  /**
   * Check if input indicates user wants to go back
   */
  isBackIntent(input: string): boolean {
    const backPhrases = ['back', 'previous', 'go back', 'last question', 'undo'];
    return backPhrases.includes(input.toLowerCase().trim());
  }

  /**
   * Check if input indicates user wants to pause
   */
  isPauseIntent(input: string): boolean {
    const pausePhrases = ['pause', 'stop', 'save', 'later', 'break', 'exit'];
    return pausePhrases.includes(input.toLowerCase().trim());
  }
}