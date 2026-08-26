"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updatePaymentStatus } from "../actions";

const STATUSES: { value: string; label: string; color: string }[] = [
  { value: "pending", label: "قيد الانتظار", color: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "تم التأكيد", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "قيد التجهيز", color: "bg-indigo-100 text-indigo-700" },
  { value: "shipped", label: "تم الشحن", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "تم التسليم", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "ملغي", color: "bg-red-100 text-red-700" },
  { value: "refunded", label: "مسترجع", color: "bg-charcoal/10 text-charcoal/70" },
];

const PAYMENT_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "unpaid", label: "غير مدفوع", color: "bg-red-100 text-red-700" },
  { value: "paid", label: "مدفوع", color: "bg-green-100 text-green-700" },
  { value: "partial", label: "مدفوع جزئياً", color: "bg-amber-100 text-amber-700" },
];

export default function StatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const statusColor = STATUSES.find((s) => s.value === status)?.color ?? "bg-charcoal/10 text-charcoal/70";
  const paymentColor = PAYMENT_STATUSES.find((s) => s.value === paymentStatus)?.color ?? "bg-charcoal/10 text-charcoal/70";

  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label className="block text-xs font-bold text-charcoal/50 mb-1">حالة الطلب</label>
        <select
          defaultValue={status}
          disabled={pending}
          onChange={(e) =>
            startTransition(async () => {
              await updateOrderStatus(orderId, e.target.value);
              router.refresh();
            })
          }
          className={`px-3 py-2 rounded-lg border-0 text-sm font-bold cursor-pointer outline-none ring-1 ring-gold/20 focus:ring-goldDark disabled:opacity-50 ${statusColor}`}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-charcoal/50 mb-1">حالة الدفع</label>
        <select
          defaultValue={paymentStatus}
          disabled={pending}
          onChange={(e) =>
            startTransition(async () => {
              await updatePaymentStatus(orderId, e.target.value);
              router.refresh();
            })
          }
          className={`px-3 py-2 rounded-lg border-0 text-sm font-bold cursor-pointer outline-none ring-1 ring-gold/20 focus:ring-goldDark disabled:opacity-50 ${paymentColor}`}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
