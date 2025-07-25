import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HierarchyTestInterface from "@/components/test/HierarchyTestInterface";

export default async function HierarchyTestPage() {
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

  // Check if user has admin access for testing
  if (!['super_admin', 'saas_admin', 'practice_admin'].includes(profile.role)) {
    console.log(`User role is ${profile.role}, not authorized for testing`);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HierarchyTestInterface 
        user={user} 
        profile={profile}
      />
    </div>
  );
}