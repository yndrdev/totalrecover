import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("No profile found for user:", user.id);
    
    // Try to create a basic profile record if it doesn't exist
    if (profileError?.code === 'PGRST116') { // No rows returned
      console.log("Creating missing profile for user:", user.id);
      
      // Get or create default tenant
      let tenantId = '00000000-0000-0000-0000-000000000000';
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('name', 'Default Tenant')
        .single();
      
      if (tenant) {
        tenantId = tenant.id;
      }
      
      // Create profile with basic information
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          user_id: user.id,
          tenant_id: tenantId,
          email: user.email || '',
          first_name: user.user_metadata?.firstName || 'Unknown',
          last_name: user.user_metadata?.lastName || 'User',
          full_name: user.user_metadata?.firstName && user.user_metadata?.lastName 
            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
            : user.email || 'Unknown User',
          role: user.user_metadata?.userType || 'patient',
          is_active: true,
          email_verified: !!user.email_confirmed_at,
          onboarding_completed: false
        })
        .select('*')
        .single();
      
      if (createError) {
        console.error("Failed to create profile:", createError);
        redirect("/login?error=Account setup incomplete. Please contact support.");
      }
      
      // Use the newly created profile
      const createdProfile = newProfile;
      
      // Create role-specific records for the newly created profile
      if (createdProfile.role === 'patient') {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            tenant_id: tenantId,
            first_name: createdProfile.first_name,
            last_name: createdProfile.last_name,
            phone: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            date_of_birth: '',
            status: 'active'
          });

        if (patientError) {
          console.error('Error creating patient record:', patientError);
          redirect("/login?error=Patient setup incomplete. Please contact support.");
        }
      }
      
      // Route based on user role
      switch (createdProfile.role) {
        case "patient":
          redirect("/patient/chat");
          break;
        case "admin":
          redirect("/admin");
          break;
        case "surgeon":
        case "nurse":
        case "physical_therapist":
        case "provider":
          redirect("/provider/patients");
          break;
        default:
          redirect("/patient/chat");
      }
      return;
    }
    
    // If it's a different error, redirect to login
    redirect("/login?error=Account setup incomplete. Please try registering again.");
  }

  // Route based on user role
  switch (profile.role) {
    case "patient":
      redirect("/patient/chat");
      break;
    case "admin":
      redirect("/admin");
      break;
    case "surgeon":
    case "nurse":
    case "physical_therapist":
    case "provider":
      redirect("/provider/patients");
      break;
    default:
      redirect("/patient/chat");
  }
}