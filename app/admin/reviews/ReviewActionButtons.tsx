"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2 } from "lucide-react";
import { updateReviewStatus, deleteReview } from "./actions";

export default function ReviewActionButtons({ reviewId, status }: { reviewId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      await updateReviewStatus(reviewId, "approved");
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      await updateReviewStatus(reviewId, "rejected");
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    startTransition(async () => {
      await deleteReview(reviewId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <button
          type="button"
          disabled={pending}
          onClick={approve}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 disabled:opacity-50"
        >
          <Check size={13} /> اعتماد
        </button>
      )}
      {status !== "rejected" && (
        <button
          type="button"
          disabled={pending}
          onClick={reject}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 disabled:opacity-50"
        >
          <X size={13} /> رفض
        </button>
      )}
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
