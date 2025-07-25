import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Fetch exercises
    const { data: exercises, error } = await supabase
      .from('content_exercises')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exercises:', error);
      return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
    }

    return NextResponse.json(exercises || []);
  } catch (error) {
    console.error('Error in exercises GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    // Create exercise
    const { data: exercise, error } = await supabase
      .from('content_exercises')
      .insert({
        ...body,
        tenant_id: userData.tenant_id,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating exercise:', error);
      return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error in exercises POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}