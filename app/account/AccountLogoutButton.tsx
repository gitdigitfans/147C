"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountLogoutButton({ label }: { label: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/40 text-charcoal font-bold hover:bg-gold hover:text-white transition-colors text-sm"
    >
      <LogOut size={16} /> {label}
    </button>
  );
}
