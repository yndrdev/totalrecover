import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_profile_id_fkey(first_name, last_name, email, phone)
      `)
      .eq('profile_id', user.id)
      .single();

    if (patientError) {
      if (patientError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Patient record not found' }, { status: 404 });
      }
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    // Calculate recovery phase
    let recoveryPhase = 'pre-op';
    let currentDay = 0;
    
    if (patient.surgery_date) {
      const surgeryDate = new Date(patient.surgery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      surgeryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0) {
        recoveryPhase = 'post-op';
        currentDay = daysDiff;
      } else {
        currentDay = daysDiff; // Negative number for pre-op days
      }
    }

    return NextResponse.json({
      success: true,
      patient: {
        ...patient,
        recovery_phase: recoveryPhase,
        current_day: currentDay
      }
    });
  } catch (error) {
    console.error('Error in /api/patients/current:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}