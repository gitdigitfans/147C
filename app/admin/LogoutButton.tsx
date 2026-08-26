"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      title="تسجيل الخروج"
      className="p-2 rounded-lg text-charcoal/60 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <LogOut size={18} />
    </button>
  );
}
