import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ManusStyleChatInterface from "@/components/chat/ManusStyleChatInterface";

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile first (profiles.id = auth.users.id)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("No profile found for user:", user.id);
    redirect("/login");
  }

  // Check if user is a patient - only patients can access chat
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

  // Get patient record with proper tenant isolation
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user.id)  // patients.user_id = auth.users.id
    .eq("tenant_id", profile.tenant_id)  // CRITICAL: Tenant isolation
    .single();

  if (!patient || patientError) {
    console.error("No patient record found for user:", user.id);
    redirect("/login");
  }

  // Get or create conversation for the patient with tenant isolation
  let conversation;
  
  // First, try to get existing conversation using maybeSingle to avoid errors
  const { data: existingConversation, error: fetchError } = await supabase
    .from("conversations")
    .select("*")
    .eq("patient_id", patient.id)  // CORRECT: Use patient.id as the foreign key
    .eq("tenant_id", profile.tenant_id)  // CRITICAL: Tenant isolation
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching conversation:", fetchError);
    redirect("/login");
  }

  if (!existingConversation) {
    // Create new conversation with correct schema
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        patient_id: patient.id,  // CORRECT: Use patient.id as foreign key
        tenant_id: profile.tenant_id,  // Use profile tenant_id for consistency
        title: 'Recovery Chat',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      redirect("/login");
    }

    conversation = newConversation;

    // Create initial AI greeting message - personalized based on patient data
    // Extract name from user metadata or email
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || 
                     userMetadata.full_name?.split(' ')[0] || 
                     user.email?.split('@')[0].split('.')[0] || 
                     "there";
    
    const surgeryType = patient.surgery_type === 'TKA' ? 'knee replacement' :
                       patient.surgery_type === 'THA' ? 'hip replacement' :
                       patient.surgery_type === 'TSA' ? 'shoulder surgery' : 'surgery';
    
    const daysPostOp = patient.surgery_date ?
      Math.floor((new Date().getTime() - new Date(patient.surgery_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let greeting;
    if (daysPostOp > 0) {
      greeting = `Hello ${firstName}! I'm your recovery assistant. You're ${daysPostOp} days post-op from your ${surgeryType}. How are you feeling today?`;
    } else {
      greeting = `Hello ${firstName}! I'm your recovery assistant, here to support you through your ${surgeryType} journey. How are you feeling today?`;
    }

    // Insert message with proper fields and tenant isolation
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: newConversation.id,
      tenant_id: profile.tenant_id,  // CRITICAL: Tenant isolation
      content: greeting,
      sender_type: "ai", // Use sender_type instead of message_type
      sender_id: null, // AI messages don't have a sender_id
      metadata: {}
    });

    if (messageError) {
      console.error("Error creating initial greeting:", messageError);
    }
  } else {
    conversation = existingConversation;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManusStyleChatInterface
        patientId={patient.user_id}
        mode="patient"
      />
    </div>
  );
}