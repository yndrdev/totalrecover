import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClinicDashboard from "@/components/clinic/ClinicDashboard";

export default async function ClinicDashboardPage() {
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

  // Check if user has clinic access
  if (!['clinic_admin', 'nurse', 'surgeon', 'physical_therapist', 'practice_admin', 'super_admin'].includes(profile.role)) {
    console.log(`User role is ${profile.role}, not authorized for clinic dashboard`);
    redirect("/dashboard");
  }

  // Get clinic/tenant information
  const { data: clinic, error: clinicError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  if (!clinic || clinicError) {
    console.error("No clinic found for tenant:", profile.tenant_id);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClinicDashboard 
        user={user} 
        profile={profile} 
        clinic={clinic}
      />
    </div>
  );
}