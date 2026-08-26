"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toggleIsAdmin } from "../actions";

export default function AdminToggleButton({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleIsAdmin(userId, !isAdmin);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-60 ${
        isAdmin ? "border border-red-300 text-red-600 hover:bg-red-50" : "bg-gold-gradient text-charcoal hover:opacity-90"
      }`}
    >
      {isAdmin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
      {pending ? "جاري التنفيذ..." : isAdmin ? "إزالة صلاحية الأدمن" : "اجعله أدمن"}
    </button>
  );
}
