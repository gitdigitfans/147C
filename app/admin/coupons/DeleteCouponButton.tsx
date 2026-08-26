"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCoupon } from "./actions";

export default function DeleteCouponButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف الكوبون؟")) startTransition(() => deleteCoupon(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
