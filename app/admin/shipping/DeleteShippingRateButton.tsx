"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteShippingRate } from "./actions";

export default function DeleteShippingRateButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button disabled={pending} onClick={() => { if (confirm("حذف منطقة الشحن؟")) startTransition(() => deleteShippingRate(id)); }} className="text-red-600">
      <Trash2 size={14} />
    </button>
  );
}
