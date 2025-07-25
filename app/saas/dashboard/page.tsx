import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SaaSDashboardInterface from "@/components/saas/SaaSDashboardInterface";

export default async function SaaSDashboardPage() {
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

  // Check if user has SaaS admin access
  if (profile.role !== 'saas_admin' && profile.role !== 'super_admin') {
    console.log(`User role is ${profile.role}, not authorized for SaaS dashboard`);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SaaSDashboardInterface user={user} profile={profile} />
    </div>
  );
}