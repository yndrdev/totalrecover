import { NextRequest, NextResponse } from 'next/server';
import { checkAutoInitiationForTenant } from '@/lib/chat/auto-initiation';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const supabase = await createClient();
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant ID' },
        { status: 400 }
      );
    }

    // Run auto-initiation check
    await checkAutoInitiationForTenant(tenantId);

    return NextResponse.json({
      success: true,
      message: `Auto-initiation check completed for tenant ${tenant.name}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-initiation API error:', error);
    return NextResponse.json(
      { error: 'Failed to run auto-initiation check' },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get active conversations count
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    // Get patients with pending tasks
    const { data: patientsWithTasks } = await supabase
      .from('patient_tasks')
      .select('patient_id')
      .eq('status', 'assigned')
      .eq('assigned_date', getCurrentRecoveryDay());

    return NextResponse.json({
      tenantId,
      activeConversations: conversationsCount || 0,
      patientsWithPendingTasks: patientsWithTasks?.length || 0,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-initiation status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

function getCurrentRecoveryDay(): number {
  // This is a simplified version - in real implementation,
  // this would be calculated per patient based on their surgery date
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}