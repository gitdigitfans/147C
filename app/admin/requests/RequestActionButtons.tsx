"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { updateRequestStatus, deleteRequest } from "./actions";

const STATUS_OPTIONS: { value: "new" | "contacted" | "closed"; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "closed", label: "مغلق" },
];

export default function RequestActionButtons({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(newStatus: "new" | "contacted" | "closed") {
    startTransition(async () => {
      await updateRequestStatus(requestId, newStatus);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    startTransition(async () => {
      await deleteRequest(requestId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => changeStatus(e.target.value as "new" | "contacted" | "closed")}
        className="px-2 py-1.5 rounded-lg border border-gold/30 text-xs font-bold bg-white outline-none focus:border-gold disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-charcoal/10 text-charcoal/70 text-xs font-bold hover:bg-charcoal/20 disabled:opacity-50"
      >
        <Trash2 size={13} /> حذف
      </button>
    </div>
  );
}
