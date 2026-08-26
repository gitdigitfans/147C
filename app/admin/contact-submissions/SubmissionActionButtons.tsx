"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { updateSubmissionStatus, deleteSubmission } from "./actions";

const STATUS_OPTIONS: { value: "new" | "read" | "archived"; label: string }[] = [
  { value: "new", label: "جديد" },
  { value: "read", label: "مقروء" },
  { value: "archived", label: "مؤرشف" },
];

export default function SubmissionActionButtons({ submissionId, status }: { submissionId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(newStatus: "new" | "read" | "archived") {
    startTransition(async () => {
      await updateSubmissionStatus(submissionId, newStatus);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    startTransition(async () => {
      await deleteSubmission(submissionId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => changeStatus(e.target.value as "new" | "read" | "archived")}
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
