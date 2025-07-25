"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/design-system/Button";
import { Input } from "@/components/ui/design-system/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/design-system/Card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/design-system/Textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Mic, 
  CheckCircle,
  FileText,
  Calendar,
  Clock,
  Star,
  Upload,
  Camera,
  Search,
  Pill,
  Activity,
  Info,
  AlertCircle
} from "lucide-react";

interface FormQuestion {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'single_choice' | 'rating' | 'yes_no' | 'date' | 'time' | 'datetime' | 'number' | 'email' | 'phone' | 'scale' | 'pain_scale' | 'medication_search' | 'condition_search' | 'file_upload' | 'image_upload';
  question: string;
  description?: string;
  required?: boolean;
  options?: string[] | { label: string; value: any }[];
  min?: number;
  max?: number;
  placeholder?: string;
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
  helpText?: string;
  medicalDefinition?: string;
  voicePrompt?: string;
  conditionalLogic?: any;
}

interface ConversationalFormProps {
  form: {
    id: string;
    title: string;
    description?: string;
    questions: FormQuestion[];
  };
  onFieldComplete?: (questionId: string, value: any) => void;
  onFormComplete?: (formData: Record<string, any>) => void;
  allowVoiceInput?: boolean;
  showProgress?: boolean;
  autoSave?: boolean;
  validationMode?: 'inline' | 'conversational';
}

export function ConversationalForm({
  form,
  onFieldComplete,
  onFormComplete,
  allowVoiceInput = true,
  showProgress = true,
  autoSave = true,
  validationMode = 'conversational'
}: ConversationalFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentQuestion = form.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === form.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100;

  useEffect(() => {
    // Load existing answer if available
    if (currentQuestion && answers[currentQuestion.id] !== undefined) {
      setCurrentAnswer(answers[currentQuestion.id]);
    } else {
      setCurrentAnswer(currentQuestion?.type === 'multiple_choice' ? '' : '');
    }
    setValidationError(null);
  }, [currentQuestionIndex, currentQuestion, answers]);

  const validateAnswer = (question: FormQuestion, value: any): string | null => {
    if (question.required && (!value || value === '')) {
      return "This question is required.";
    }

    if (question.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number.";
      if (question.min !== undefined && num < question.min) {
        return `Value must be at least ${question.min}.`;
      }
      if (question.max !== undefined && num > question.max) {
        return `Value must be no more than ${question.max}.`;
      }
    }

    if (question.type === 'text' && question.validation?.pattern) {
      const regex = new RegExp(question.validation.pattern);
      if (!regex.test(value)) {
        return question.validation.message || "Please enter a valid format.";
      }
    }

    return null;
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion) return;

    const error = validateAnswer(currentQuestion, currentAnswer);
    if (error) {
      setValidationError(error);
      return;
    }

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);

    if (onFieldComplete) {
      onFieldComplete(currentQuestion.id, currentAnswer);
    }

    if (autoSave) {
      // Auto-save logic would go here
      console.log("Auto-saving form progress:", newAnswers);
    }

    if (isLastQuestion) {
      setIsCompleted(true);
      if (onFormComplete) {
        onFormComplete(newAnswers);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnswerSubmit();
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    {/* <thinking>
    Healthcare Context: Form inputs for patient questionnaires
    - Need clear visual feedback for form fields
    - Maintain consistent styling with design system
    - Accessibility is crucial for patient forms
    - Use appropriate input types for different questions
    </thinking> */}
    
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentQuestion.placeholder || "Type your answer..."}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || "Type your answer..."}
            className="min-h-[100px] text-base"
            autoFocus
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentQuestion.placeholder || "Enter a number..."}
            min={currentQuestion.min}
            max={currentQuestion.max}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'multiple_choice':
      case 'single_choice':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isSelected = currentQuestion.type === 'multiple_choice' 
                ? Array.isArray(currentAnswer) && currentAnswer.includes(optionValue)
                : currentAnswer === optionValue;
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => {
                    if (currentQuestion.type === 'multiple_choice') {
                      const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                      if (current.includes(optionValue)) {
                        setCurrentAnswer(current.filter(v => v !== optionValue));
                      } else {
                        setCurrentAnswer([...current, optionValue]);
                      }
                    } else {
                      setCurrentAnswer(optionValue);
                    }
                  }}
                  className="w-full text-left justify-start h-auto py-3 px-4"
                >
                  {optionLabel}
                </Button>
              );
            })}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-3">
            <Button
              variant={currentAnswer === 'yes' ? "primary" : "secondary"}
              onClick={() => setCurrentAnswer('yes')}
              className="flex-1 h-12 text-lg"
            >
              ✅ Yes
            </Button>
            <Button
              variant={currentAnswer === 'no' ? "primary" : "secondary"}
              onClick={() => setCurrentAnswer('no')}
              className="flex-1 h-12 text-lg"
            >
              ❌ No
            </Button>
          </div>
        );

      case 'rating':
      case 'scale':
      case 'pain_scale':
        const maxRating = currentQuestion.max || (currentQuestion.type === 'pain_scale' ? 10 : 5);
        const minRating = currentQuestion.min || 0;
        return (
          <div className="space-y-3">
            {currentQuestion.type === 'pain_scale' && (
              <div className="text-center text-sm text-gray-600 mb-2">
                <span className="text-green-600">0 = No pain</span>
                <span className="mx-4">•</span>
                <span className="text-red-600">10 = Worst pain imaginable</span>
              </div>
            )}
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: maxRating - minRating + 1 }, (_, i) => i + minRating).map((rating) => (
                <Button
                  key={rating}
                  variant={currentAnswer === rating ? "primary" : "secondary"}
                  onClick={() => setCurrentAnswer(rating)}
                  className={`w-12 h-12 rounded-full p-0 ${
                    currentQuestion.type === 'pain_scale' 
                      ? rating <= 3 ? "hover:bg-green-100" 
                        : rating <= 6 ? "hover:bg-yellow-100" 
                        : "hover:bg-red-100"
                      : ""
                  }`}
                >
                  {currentQuestion.type === 'rating' ? (
                    <Star className="w-5 h-5" fill={currentAnswer >= rating ? "currentColor" : "none"} />
                  ) : (
                    <span className="font-semibold">{rating}</span>
                  )}
                </Button>
              ))}
            </div>
            {currentAnswer !== '' && (
              <div className="text-center">
                <Badge 
                  variant="secondary" 
                  className={`${
                    currentQuestion.type === 'pain_scale'
                      ? currentAnswer <= 3 ? "bg-green-100 text-green-800"
                        : currentAnswer <= 6 ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {currentAnswer} out of {maxRating}
                </Badge>
              </div>
            )}
          </div>
        );

      case 'time':
        return (
          <Input
            type="time"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentQuestion.placeholder || "Enter your email..."}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentQuestion.placeholder || "(555) 555-5555"}
            className="text-base h-12"
            autoFocus
          />
        );

      case 'medication_search':
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  // TODO: Implement medication search
                }}
                onKeyPress={handleKeyPress}
                placeholder={currentQuestion.placeholder || "Search medications..."}
                className="text-base h-12 pl-10"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Camera className="w-4 h-4" />
              <span>Or take a photo of your medication bottle</span>
            </div>
          </div>
        );

      case 'condition_search':
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  // TODO: Implement condition search
                }}
                onKeyPress={handleKeyPress}
                placeholder={currentQuestion.placeholder || "Search medical conditions..."}
                className="text-base h-12 pl-10"
                autoFocus
              />
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload file</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, or image files up to 10MB</p>
            </div>
          </div>
        );

      case 'image_upload':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload image or take photo</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isCompleted) {
    {/* <thinking>
    Healthcare Context: Form completion confirmation
    - Clear success feedback for patients
    - Assurance that responses are saved
    - Next steps information
    </thinking> */}
    return (
      <Card variant="success" className="max-w-md">
        <div className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Form Completed!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Thank you for completing the {form.title}.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Your responses have been saved and will be reviewed by your care team.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {form.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {currentQuestion && (
          <>
            <div className="space-y-2">
              <h3 className="text-gray-900 font-medium text-base">
                {currentQuestion.question}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {currentQuestion.description && (
                <p className="text-sm text-gray-600">{currentQuestion.description}</p>
              )}
              {currentQuestion.helpText && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">{currentQuestion.helpText}</p>
                </div>
              )}
              {currentQuestion.medicalDefinition && (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <Activity className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Medical Context:</p>
                    <p className="text-sm text-gray-600">{currentQuestion.medicalDefinition}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {renderQuestionInput()}
              
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="text-gray-600 hover:text-blue-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="primary"
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer && currentQuestion.required}
                className="flex-1"
              >
                {isLastQuestion ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Form
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              {allowVoiceInput && currentQuestion && 
                ['text', 'textarea', 'number', 'yes_no', 'medication_search', 'condition_search'].includes(currentQuestion.type) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement voice input
                    setIsRecording(!isRecording);
                  }}
                  className={`${isRecording ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}