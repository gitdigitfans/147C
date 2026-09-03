"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import SubmissionActionButtons from "./SubmissionActionButtons";

export interface SubmissionRowData {
  id: string;
  sourceLabel: string | null;
  isConsultation: boolean;
  name?: string;
  phone?: string;
  rest: Record<string, string>;
  fieldMap: Record<string, { label_ar: string; label_en: string }>;
  status: string;
  created_at?: string | null;
}

export default function SubmissionRow({ data }: { data: SubmissionRowData }) {
  const [expanded, setExpanded] = useState(false);
  const restEntries = Object.entries(data.rest);
  const messagePreview = data.rest.message;

  return (
    <div className="bg-white rounded-xl border border-gold/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          {data.sourceLabel && (
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-1 ${
                data.isConsultation ? "bg-goldDark/10 text-goldDark" : "bg-charcoal/10 text-charcoal/70"
              }`}
            >
              {data.sourceLabel}
            </span>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {data.name && <span className="font-cairo font-bold text-sm text-charcoal">{data.name}</span>}
            {data.phone && (
              <span className="text-sm text-charcoal/60" dir="ltr">
                {data.phone}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/10 text-goldDark text-xs font-bold hover:bg-gold/20 transition-colors"
        >
          {expanded ? <EyeOff size={13} /> : <Eye size={13} />}
          {expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </button>
      </div>

      {expanded ? (
        <div className="bg-ivory/60 rounded-lg p-3 mb-2 space-y-1.5 text-sm">
          {data.name && (
            <div>
              <span className="text-charcoal/50">الاسم: </span>
              <span className="font-bold">{data.name}</span>
            </div>
          )}
          {data.phone && (
            <div>
              <span className="text-charcoal/50">الهاتف: </span>
              <span className="font-bold" dir="ltr">
                {data.phone}
              </span>
            </div>
          )}
          {restEntries.map(([key, value]) => {
            const field = data.fieldMap[key];
            const displayLabel = field?.label_ar || (key === "message" ? "الرسالة" : key);
            return (
              <div key={key}>
                <span className="text-charcoal/50">{displayLabel}: </span>
                <span className="whitespace-pre-line break-words">{value}</span>
              </div>
            );
          })}
          <div>
            <span className="text-charcoal/50">التاريخ: </span>
            <span>{data.created_at ? new Date(data.created_at).toLocaleString("ar-EG") : ""}</span>
          </div>
        </div>
      ) : (
        messagePreview && <p className="text-sm text-charcoal/70 mb-2 line-clamp-2 break-words">{messagePreview}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gold/10">
        <span className="text-xs text-charcoal/40">
          {data.created_at ? new Date(data.created_at).toLocaleDateString("ar-EG") : ""}
        </span>
        <SubmissionActionButtons submissionId={data.id} status={data.status || "new"} />
      </div>
    </div>
  );
}
