import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FormResponseHandler } from '@/lib/services/form-response-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientFormId,
      questionId,
      response,
      responseType,
      responseMethod = 'text',
      timeToRespond
    } = body;

    if (!patientFormId || !questionId || response === undefined || !responseType) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientFormId, questionId, response, responseType' 
      }, { status: 400 });
    }

    const formResponseHandler = new FormResponseHandler();
    
    // Save the response
    const result = await formResponseHandler.saveResponse({
      patientFormId,
      questionId,
      response,
      responseType,
      responseMethod,
      timeToRespond
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
    }

    // Get updated completion status
    const completionStatus = await formResponseHandler.getFormCompletionStatus(patientFormId);

    return NextResponse.json({
      success: true,
      alerts: result.alerts || [],
      completionStatus
    });
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Failed to submit form response' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientFormId, responses } = body;

    if (!patientFormId || !responses || !Array.isArray(responses)) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientFormId, responses (array)' 
      }, { status: 400 });
    }

    const formResponseHandler = new FormResponseHandler();
    const alerts: any[] = [];
    
    // Save all responses
    for (const responseData of responses) {
      const result = await formResponseHandler.saveResponse({
        patientFormId,
        questionId: responseData.questionId,
        response: responseData.response,
        responseType: responseData.responseType,
        responseMethod: responseData.responseMethod || 'text',
        timeToRespond: responseData.timeToRespond
      });

      if (result.alerts) {
        alerts.push(...result.alerts);
      }
    }

    // Get updated completion status
    const completionStatus = await formResponseHandler.getFormCompletionStatus(patientFormId);

    return NextResponse.json({
      success: true,
      alerts,
      completionStatus
    });
  } catch (error) {
    console.error('Error submitting batch form responses:', error);
    return NextResponse.json(
      { error: 'Failed to submit batch form responses' },
      { status: 500 }
    );
  }
}