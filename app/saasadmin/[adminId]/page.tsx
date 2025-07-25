import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface SaasAdminPageProps {
  params: {
    adminId: string;
  };
}

export default async function SaasAdminPage({ params }: SaasAdminPageProps) {
  const supabase = await createClient();
  
  // Extract the actual admin ID from the route (e.g., "admin-123" -> "123")
  const adminId = params.adminId.replace('admin-', '');
  
  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Verify this is the correct user
  if (user.id !== adminId) {
    notFound();
  }
  
  // Get admin profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', adminId)
    .single();
    
  if (error || !profile) {
    notFound();
  }
  
  // Verify the user is a super admin
  if (profile.role !== 'super_admin') {
    notFound();
  }
  
  // Redirect to the SaaS admin dashboard
  redirect('/saasadmin/protocols');
}