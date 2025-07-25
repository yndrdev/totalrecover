import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface ProviderPageProps {
  params: {
    providerId: string;
  };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const supabase = await createClient();
  
  // Extract the actual provider ID from the route (e.g., "provider-123" -> "123")
  const providerId = params.providerId.replace('provider-', '');
  
  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Verify this is the correct user
  if (user.id !== providerId) {
    notFound();
  }
  
  // Get provider profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', providerId)
    .single();
    
  if (error || !profile) {
    notFound();
  }
  
  // Verify the user is a provider type
  const providerRoles = ['surgeon', 'nurse', 'physical_therapist', 'provider'];
  if (!providerRoles.includes(profile.role)) {
    notFound();
  }
  
  // Redirect to the provider dashboard
  redirect('/provider/patients');
}