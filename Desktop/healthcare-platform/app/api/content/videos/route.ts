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

    // Fetch videos
    const { data: videos, error } = await supabase
      .from('content_videos')
      .select('*')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    return NextResponse.json(videos || []);
  } catch (error) {
    console.error('Error in videos GET:', error);
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
    
    // Extract YouTube ID from URL if needed
    let thumbnailUrl = body.thumbnail_url;
    if (body.url && !thumbnailUrl) {
      const youtubeId = extractYouTubeId(body.url);
      if (youtubeId) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      }
    }
    
    // Create video
    const { data: video, error } = await supabase
      .from('content_videos')
      .insert({
        ...body,
        thumbnail_url: thumbnailUrl,
        tenant_id: userData.tenant_id,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error in videos POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}