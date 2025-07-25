import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FormExtractionService } from '@/lib/services/form-extraction-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formTemplateId } = await request.json();

    if (!formTemplateId) {
      return NextResponse.json({ error: 'Form template ID is required' }, { status: 400 });
    }

    const formExtractionService = new FormExtractionService();
    
    // Extract form structure
    const extractedForm = await formExtractionService.extractFormById(formTemplateId);
    
    if (!extractedForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Convert to conversational flow
    const conversationalData = formExtractionService.convertToConversationalFlow(extractedForm);

    return NextResponse.json({
      success: true,
      data: conversationalData
    });
  } catch (error) {
    console.error('Error extracting form:', error);
    return NextResponse.json(
      { error: 'Failed to extract form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const formType = searchParams.get('type');
    const surgeryType = searchParams.get('surgeryType');

    const formExtractionService = new FormExtractionService();
    
    let forms;
    if (surgeryType) {
      forms = await formExtractionService.getFormsForSurgeryType(profile.tenant_id, surgeryType);
    } else if (formType) {
      forms = await formExtractionService.getFormsByType(profile.tenant_id, formType);
    } else {
      return NextResponse.json({ error: 'Form type or surgery type is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}