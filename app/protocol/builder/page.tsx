import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProtocolBuilder from "@/components/protocol/ProtocolBuilder";

export default async function ProtocolBuilderPage() {
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

  // Check if user has protocol builder access (all provider roles can build protocols)
  const allowedRoles = ['surgeon', 'nurse', 'physical_therapist', 'practice_admin', 'clinic_admin', 'saas_admin'];
  if (!allowedRoles.includes(profile.role)) {
    console.log(`User role is ${profile.role}, not authorized for protocol builder`);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtocolBuilder 
        tenantId={profile.tenant_id}
        user={user} 
        profile={profile}
      />
    </div>
  );
}