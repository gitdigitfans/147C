import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vnfvzlahcetcdcjcfewk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZnZ6bGFoY2V0Y2RjamNmZXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjM3NDMsImV4cCI6MjEwMDg5OTc0M30.uqdfXLAA-LSUMWLa0On5BC-V6cEs7cwHGt9XQpWQWpI";

// Refreshes the Supabase auth session cookie on every request so that
// Server Components (which can't write cookies themselves) always see
// an up-to-date session. Required when using @supabase/ssr.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAccount = pathname === "/account" || pathname.startsWith("/account/");

  if (!user && (isProtectedAdmin || isAccount)) {
    const url = request.nextUrl.clone();
    url.pathname = isProtectedAdmin ? "/admin/login" : "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
