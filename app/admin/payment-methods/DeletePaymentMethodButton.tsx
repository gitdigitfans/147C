"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePaymentMethod } from "./actions";

export default function DeletePaymentMethodButton({ id, type }: { id: string; type: string }) {
  const [pending, startTransition] = useTransition();
  const isCod = type === "cod";
  return (
    <button
      disabled={pending || isCod}
      title={isCod ? "لا يمكن حذف طريقة الدفع عند الاستلام" : undefined}
      onClick={() => { if (confirm("حذف طريقة الدفع؟")) startTransition(() => deletePaymentMethod(id, type)); }}
      className={isCod ? "text-charcoal/20 cursor-not-allowed" : "text-red-600"}
    >
      <Trash2 size={14} />
    </button>
  );
}
