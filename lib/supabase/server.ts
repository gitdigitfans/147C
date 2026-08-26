import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vnfvzlahcetcdcjcfewk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZnZ6bGFoY2V0Y2RjamNmZXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjM3NDMsImV4cCI6MjEwMDg5OTc0M30.uqdfXLAA-LSUMWLa0On5BC-V6cEs7cwHGt9XQpWQWpI";

// Real server-side Supabase client for Server Components / Route Handlers / Server Actions.
// Reads/writes the auth session via Next.js cookies so it stays in sync with the
// browser client (which also stores its session in cookies via @supabase/ssr).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // The `set` method can be called from a Server Component during
          // rendering, where cookie mutation isn't allowed. Safe to ignore
          // here because middleware.ts refreshes the session on every request.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same as above - ignorable when called from a Server Component.
        }
      },
    },
  });
}
