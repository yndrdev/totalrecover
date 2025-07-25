import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Get or create default tenant
    let tenantId = '00000000-0000-0000-0000-000000000000';
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', 'Default Tenant')
      .single();

    if (tenant) {
      tenantId = tenant.id;
    } else {
      // Create default tenant if it doesn't exist
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Default Tenant',
          subdomain: 'default',
          settings: {}
        })
        .select('id')
        .single();

      if (!tenantError && newTenant) {
        tenantId = newTenant.id;
      }
    }

    // Create profile with user metadata
    const { data: newProfile, error: profileError } = await supabase
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

    if (profileError) {
      console.error("Failed to create profile:", profileError);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    // Create role-specific record
    const userType = user.user_metadata?.userType || 'patient';
    
    if (userType === 'patient') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          tenant_id: tenantId,
          first_name: user.user_metadata?.firstName || 'Unknown',
          last_name: user.user_metadata?.lastName || 'User',
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
      }
    } else if (userType === 'provider') {
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          user_id: user.id,
          tenant_id: tenantId,
          first_name: user.user_metadata?.firstName || 'Unknown',
          last_name: user.user_metadata?.lastName || 'User',
          specialty: user.user_metadata?.specialty || 'General',
          license_number: user.user_metadata?.licenseNumber || 'N/A',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          accepting_new_patients: true
        });

      if (providerError) {
        console.error('Error creating provider record:', providerError);
      }
    }

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error) {
    console.error("Profile setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}