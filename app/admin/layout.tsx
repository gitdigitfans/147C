import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards protected /admin/* routes. If there's no user
  // here we're on /admin/login - render the login page without the admin shell.
  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name, avatar_url, role_id, roles(name_ar)")
    .eq("id", user.id)
    .single();

  const adminName = (profile as any)?.full_name || user.email || "المدير";
  const roleName = (profile as any)?.roles?.name_ar || "مسؤول";

  return (
    <div dir="rtl" className="min-h-screen flex bg-ivory font-cairo">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gold/20 flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="text-sm text-charcoal/50 hover:text-goldDark transition-colors">
            عرض الموقع &larr;
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-sm font-bold text-charcoal">{adminName}</p>
              <p className="text-xs text-charcoal/50">{roleName}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-white font-bold">
              {adminName.charAt(0)}
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
