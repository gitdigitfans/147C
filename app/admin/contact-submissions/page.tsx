import { d1Query } from "@/lib/d1";
import { MessageSquare } from "lucide-react";
import SubmissionActionButtons from "./SubmissionActionButtons";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "new", label: "جديد" },
  { value: "read", label: "مقروء" },
  { value: "archived", label: "مؤرشف" },
];

export default async function AdminContactSubmissionsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = searchParams?.status || "";

  let rows: any[] = [];
  let errorMsg = "";
  try {
    rows = status
      ? await d1Query("SELECT * FROM contact_submissions WHERE status=? ORDER BY created_at DESC", [status])
      : await d1Query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
  } catch (e: any) {
    errorMsg = e.message;
  }

  let fieldMap: Record<string, { label_ar: string; label_en: string }> = {};
  try {
    const fields = await d1Query<any>("SELECT field_key, label_ar, label_en FROM contact_form_fields");
    fields.forEach((f: any) => {
      fieldMap[f.field_key] = { label_ar: f.label_ar, label_en: f.label_en };
    });
  } catch {
    fieldMap = {};
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6 flex items-center gap-2">
        <MessageSquare size={22} className="text-goldDark" /> رسائل التواصل
      </h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <a
            key={f.value}
            href={f.value ? `/admin/contact-submissions?status=${f.value}` : "/admin/contact-submissions"}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              status === f.value ? "bg-gold-gradient text-white" : "bg-white border border-gold/20 text-charcoal/60 hover:bg-gold/10"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>
      )}

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="bg-white rounded-xl border border-gold/10 p-6 text-center text-charcoal/40">
            لا توجد رسائل
          </div>
        )}
        {rows.map((r: any) => {
          let data: Record<string, string> = {};
          try {
            data = JSON.parse(r.data);
          } catch {
            data = {};
          }

          return (
            <div key={r.id} className="bg-white rounded-xl border border-gold/10 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {Object.entries(data).map(([key, value]) => {
                  const field = fieldMap[key];
                  const displayLabel = field?.label_ar || key;
                  return (
                    <div key={key} className="text-sm">
                      <span className="text-charcoal/50 font-bold">{displayLabel}: </span>
                      <span className="text-charcoal/80">{value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gold/10">
                <span className="text-xs text-charcoal/40">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("ar-EG") : ""}
                </span>
                <SubmissionActionButtons submissionId={r.id} status={r.status || "new"} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
