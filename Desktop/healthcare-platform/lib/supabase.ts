import { createBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database-types";

// Browser client for client-side operations
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client for server-side operations
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Admin client for privileged operations (uses service role key)
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper function to get current user with proper typing
export async function getCurrentUser() {
  const supabase = createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error fetching user:', error);
    return null;
  }
}

// Helper function to get user profile data
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        patients (*),
        providers (*)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
}

// Helper function for Row Level Security policies
export async function setUserContext(userId: string, tenantId: string) {
  const supabase = createClient();
  
  try {
    // Set user context for RLS policies
    await supabase.rpc('set_user_context', {
      user_id: userId,
      tenant_id: tenantId
    });
  } catch (error) {
    console.error('Error setting user context:', error);
  }
}

// Error handling utilities
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  // Map common Supabase errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    '23505': 'This record already exists',
    '23503': 'Referenced record not found',
    '42501': 'Insufficient permissions',
    'PGRST116': 'Record not found',
    'auth/user-not-found': 'User not found',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
  };
  
  const userMessage = errorMessages[error.code] || 'An unexpected error occurred';
  return { message: userMessage, code: error.code };
}

// Healthcare-specific utilities
export async function getPatientTimeline(patientId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('patient_tasks')
      .select(`
        *,
        protocol_tasks (*),
        patient_protocols (
          *,
          protocols (*)
        )
      `)
      .eq('patient_id', patientId)
      .order('scheduled_date');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patient timeline:', error);
    return [];
  }
}

export async function getActiveProtocols(tenantId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('protocols')
      .select(`
        *,
        protocol_tasks (*)
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching active protocols:', error);
    return [];
  }
}

export async function getChatMessages(conversationId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users!sender_id (
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
}

// Real-time subscription helpers
export function subscribeToPatientTasks(patientId: string, callback: (payload: any) => void) {
  const supabase = createClient();
  
  return supabase
    .channel(`patient_tasks:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_tasks',
        filter: `patient_id=eq.${patientId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToChatMessages(conversationId: string, callback: (payload: any) => void) {
  const supabase = createClient();
  
  return supabase
    .channel(`chat_messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      callback
    )
    .subscribe();
}

export type { Database };