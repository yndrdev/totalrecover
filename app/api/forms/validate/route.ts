import { NextRequest, NextResponse } from 'next/server';
import { FormExtractionService } from '@/lib/services/form-extraction-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionType, response, validationRules } = body;

    if (!questionType || response === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: questionType, response' 
      }, { status: 400 });
    }

    const formExtractionService = new FormExtractionService();
    
    // Create a mock step for validation
    const step = {
      stepId: 'validation',
      sectionId: 'validation',
      sectionName: 'Validation',
      questionId: 'validation',
      question: 'Validation',
      type: questionType,
      isRequired: true,
      validationRules
    };

    const validationResult = formExtractionService.validateResponse(step, response);

    return NextResponse.json({
      success: true,
      isValid: validationResult.isValid,
      error: validationResult.error
    });
  } catch (error) {
    console.error('Error validating response:', error);
    return NextResponse.json(
      { error: 'Failed to validate response' },
      { status: 500 }
    );
  }
}