import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatTestInterface from "@/components/chat/ChatTestInterface";

export default async function ChatTestPage() {
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

  // Get patient record if user is a patient
  let patient = null;
  if (profile.role === 'patient') {
    const { data: patientData } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", user.id)
      .eq("tenant_id", profile.tenant_id)
      .single();
    
    patient = patientData;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat System Test</h1>
          <p className="text-gray-600">Test the complete Manus-style chat implementation</p>
        </div>

        <ChatTestInterface 
          user={user}
          profile={profile}
          patient={patient}
        />
      </div>
    </div>
  );
}