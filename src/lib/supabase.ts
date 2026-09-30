import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** Server-side admin client (service role). RLS bypassed — only use in server code. */
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public read-only client. Falls back gracefully when Supabase env is absent. */
export function supabasePublic(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SUPABASE_MISSING_MSG =
  "Supabase is not configured. Copy .env.example to .env.local and fill in your project values.";
