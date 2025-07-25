import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ManusStyleChatInterface from '@/components/chat/ManusStyleChatInterface';

interface PatientPageProps {
  params: {
    profileId: string;
  };
}

export default async function PatientPage({ params }: PatientPageProps) {
  const supabase = await createClient();
  
  const profileId = params.profileId;
  
  // Verify the user has access to this patient record
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    notFound();
  }
  
  // Get patient record by profile ID
  const { data: patient, error } = await supabase
    .from('patients')
    .select(`
      *,
      profiles!inner(*)
    `)
    .eq('profile_id', profileId)
    .single();
    
  if (error || !patient) {
    notFound();
  }
  
  // Verify the user owns this patient record or is a provider
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  const isPatient = userProfile?.role === 'patient' && patient.profile_id === user.id;
  const isProvider = ['surgeon', 'nurse', 'physical_therapist', 'provider', 'admin'].includes(userProfile?.role || '');
  
  if (!isPatient && !isProvider) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ManusStyleChatInterface
        patientId={patient.id}
        mode={isPatient ? 'patient' : 'provider'}
      />
    </div>
  );
}