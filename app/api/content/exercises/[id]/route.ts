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

    // Fetch exercise
    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', userData.tenant_id)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error in exercise GET:', error);
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
    
    // Update exercise
    const { data: exercise, error } = await supabase
      .from('exercises')
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
      console.error('Error updating exercise:', error);
      return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error in exercise PUT:', error);
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

    // Delete exercise
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', params.id)
      .eq('tenant_id', userData.tenant_id);

    if (error) {
      console.error('Error deleting exercise:', error);
      return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in exercise DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}