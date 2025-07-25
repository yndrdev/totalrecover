import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProtocolFormService } from '@/lib/services/protocol-form-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId') || user.id;
    const day = searchParams.get('day');
    const protocolId = searchParams.get('protocolId');

    const protocolFormService = new ProtocolFormService();
    
    if (day && protocolId) {
      // Get forms for a specific day
      const forms = await protocolFormService.getFormsForDay(protocolId, parseInt(day));
      return NextResponse.json({
        success: true,
        data: forms
      });
    } else {
      // Get all forms for patient's active protocol
      const protocolForms = await protocolFormService.getPatientProtocolForms(patientId);
      
      if (!protocolForms) {
        return NextResponse.json({ 
          error: 'No active protocol found for patient' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: protocolForms
      });
    }
  } catch (error) {
    console.error('Error fetching protocol forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocol forms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, formTemplateId, protocolTaskId } = body;

    if (!patientId || !formTemplateId) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientId, formTemplateId' 
      }, { status: 400 });
    }

    const protocolFormService = new ProtocolFormService();
    
    // Create patient form instance
    const patientFormId = await protocolFormService.createPatientFormInstance(
      patientId,
      formTemplateId,
      protocolTaskId
    );

    if (!patientFormId) {
      return NextResponse.json({ error: 'Failed to create form instance' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { patientFormId }
    });
  } catch (error) {
    console.error('Error creating patient form instance:', error);
    return NextResponse.json(
      { error: 'Failed to create patient form instance' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientFormId, status, completionPercentage } = body;

    if (!patientFormId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientFormId, status' 
      }, { status: 400 });
    }

    const protocolFormService = new ProtocolFormService();
    
    // Update form status
    const success = await protocolFormService.updateFormStatus(
      patientFormId,
      status,
      completionPercentage
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update form status' }, { status: 500 });
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error updating form status:', error);
    return NextResponse.json(
      { error: 'Failed to update form status' },
      { status: 500 }
    );
  }
}