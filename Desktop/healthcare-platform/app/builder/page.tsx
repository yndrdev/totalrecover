import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuilderInterface } from "@/components/builder/builder-interface";

export default async function BuilderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to verify permissions
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("No profile found for user:", user.id);
    redirect("/login");
  }

  // Check if user has builder access (admin, surgeon, nurse, pt)
  const allowedRoles = ["admin", "surgeon", "nurse", "physical_therapist"];
  if (!allowedRoles.includes(profile.role)) {
    redirect("/login");
  }

  // Get existing exercises and forms for editing
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("name");

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("name");

  return (
    <BuilderInterface
      user={user}
      profile={profile}
      exercises={exercises || []}
      forms={forms || []}
    />
  );
}