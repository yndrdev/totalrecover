import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface PracticeAdminPageProps {
  params: {
    adminId: string;
  };
}

export default async function PracticeAdminPage({ params }: PracticeAdminPageProps) {
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
  
  // Verify the user is an admin
  if (profile.role !== 'admin') {
    notFound();
  }
  
  // Redirect to the practice dashboard
  redirect('/practice/protocols');
}