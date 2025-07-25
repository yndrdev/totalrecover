import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PracticeAdminDashboard from "@/components/practice/PracticeAdminDashboard";

export default async function PracticeAdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("No profile found for user:", user.id);
    redirect("/login");
  }

  // Check if user has practice admin access
  if (profile.role !== 'practice_admin' && profile.role !== 'super_admin') {
    console.log(`User role is ${profile.role}, not authorized for practice admin`);
    redirect("/dashboard");
  }

  // Get practice information (tenant where this user is admin)
  const { data: practice, error: practiceError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .eq("tenant_type", "practice")
    .single();

  if (!practice || practiceError) {
    console.error("No practice found for tenant:", profile.tenant_id);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PracticeAdminDashboard 
        user={user} 
        profile={profile} 
        practice={practice}
      />
    </div>
  );
}