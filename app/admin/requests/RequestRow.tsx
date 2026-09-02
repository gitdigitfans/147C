"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import RequestActionButtons from "./RequestActionButtons";

export interface RequestRowData {
  id: string;
  type: string;
  typeLabel: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  status: string;
  created_at?: string | null;
  product?: { name_ar: string; slug: string } | null;
  productIdUnknown?: string | null;
}

export default function RequestRow({ data }: { data: RequestRowData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gold/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-gold/10 text-goldDark mb-1">
            {data.typeLabel}
          </span>
          {data.product ? (
            <Link href={`/shop/${data.product.slug}`} className="block font-bold text-goldDark hover:underline text-sm" target="_blank">
              {data.product.name_ar}
            </Link>
          ) : data.productIdUnknown ? (
            <span className="block text-sm text-charcoal/40">منتج غير معروف ({data.productIdUnknown})</span>
          ) : null}
          <div className="mt-1">
            <span className="font-cairo font-bold text-sm text-charcoal">{data.name}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/10 text-goldDark text-xs font-bold hover:bg-gold/20 transition-colors"
        >
          {expanded ? <EyeOff size={13} /> : <Eye size={13} />}
          {expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </button>
      </div>

      {expanded && (
        <div className="bg-ivory/60 rounded-lg p-3 mb-2 space-y-1.5 text-sm">
          <div><span className="text-charcoal/50">الاسم: </span><span className="font-bold">{data.name}</span></div>
          {data.phone && <div><span className="text-charcoal/50">الهاتف: </span><span className="font-bold" dir="ltr">{data.phone}</span></div>}
          {data.email && <div><span className="text-charcoal/50">البريد: </span><span className="font-bold" dir="ltr">{data.email}</span></div>}
          <div><span className="text-charcoal/50">النوع: </span><span className="font-bold">{data.typeLabel}</span></div>
          {data.message && <div><span className="text-charcoal/50">الرسالة: </span><span>{data.message}</span></div>}
          <div><span className="text-charcoal/50">التاريخ: </span><span>{data.created_at ? new Date(data.created_at).toLocaleString("ar-EG") : ""}</span></div>
        </div>
      )}

      {!expanded && data.message && <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">{data.message}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gold/10">
        <span className="text-xs text-charcoal/40">
          {data.created_at ? new Date(data.created_at).toLocaleDateString("ar-EG") : ""}
        </span>
        <RequestActionButtons requestId={data.id} status={data.status || "new"} />
      </div>
    </div>
  );
}
