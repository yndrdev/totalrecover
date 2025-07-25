import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PatientDashboardInterface from "@/components/patient/PatientDashboardInterface";

export default async function PatientDashboardPage() {
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

  // Check if user is a patient
  if (profile.role !== 'patient') {
    console.log(`User role is ${profile.role}, redirecting to appropriate dashboard`);
    if (profile.role === 'provider' || profile.role === 'surgeon' || profile.role === 'nurse') {
      redirect("/provider");
    } else if (profile.role === 'admin') {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  // Get patient record
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (!patient || patientError) {
    console.error("No patient record found for user:", user.id);
    redirect("/login");
  }

  // Redirect to appropriate page based on surgery date
  if (patient.surgery_date) {
    const surgeryDate = new Date(patient.surgery_date);
    const today = new Date();
    if (surgeryDate > today) {
      redirect("/preop");
    } else {
      redirect("/postop");
    }
  } else {
    // Default to preop if no surgery date
    redirect("/preop");
  }
}