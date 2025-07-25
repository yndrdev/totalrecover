import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user and tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.tenant_id) {
      return NextResponse.json({ error: 'User tenant not found' }, { status: 400 });
    }

    // Fetch form
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (error) {
      console.error('Error fetching form:', error);
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error in form GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user and tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.tenant_id) {
      return NextResponse.json({ error: 'User tenant not found' }, { status: 400 });
    }

    const body = await request.json();
    
    // Update form
    const { data: form, error } = await supabase
      .from('forms')
      .update({
        ...body,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('tenant_id', userData.tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating form:', error);
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error in form PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user and tenant
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.tenant_id) {
      return NextResponse.json({ error: 'User tenant not found' }, { status: 400 });
    }

    // Delete form
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', params.id)
      .eq('tenant_id', userData.tenant_id);

    if (error) {
      console.error('Error deleting form:', error);
      return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in form DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}