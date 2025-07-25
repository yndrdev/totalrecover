import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../database-types";
import { createMockSupabaseClient } from "../mock-data/mock-supabase-client";

// Browser client for client-side operations
export function createClient() {
  // Check if bypass auth is enabled
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return createMockSupabaseClient() as any;
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
