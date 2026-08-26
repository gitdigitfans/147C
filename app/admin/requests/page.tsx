import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { d1Query } from "@/lib/d1";
import RequestActionButtons from "./RequestActionButtons";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "closed", label: "مغلق" },
];

const TYPE_LABELS: Record<string, string> = {
  consultation: "استشارة",
  viewing: "معاينة",
  question: "استفسار",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = searchParams?.status || "";
  const supabase = createClient();

  let query = supabase.from("product_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: requests } = await query;

  const rows = requests || [];

  const productIds = Array.from(new Set(rows.map((r: any) => r.product_id).filter(Boolean)));
  let productMap: Record<string, { name_ar: string; name_en: string; slug: string }> = {};
  if (productIds.length > 0) {
    try {
      const placeholders = productIds.map(() => "?").join(",");
      const products = await d1Query<any>(
        `SELECT id, name_ar, name_en, slug FROM products WHERE id IN (${placeholders})`,
        productIds
      );
      products.forEach((p: any) => {
        productMap[p.id] = { name_ar: p.name_ar, name_en: p.name_en, slug: p.slug };
      });
    } catch {
      productMap = {};
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6 flex items-center gap-2">
        <ClipboardList size={22} className="text-goldDark" /> طلبات العملاء
      </h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/requests?status=${f.value}` : "/admin/requests"}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              status === f.value ? "bg-gold-gradient text-white" : "bg-white border border-gold/20 text-charcoal/60 hover:bg-gold/10"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="bg-white rounded-xl border border-gold/10 p-6 text-center text-charcoal/40">
            لا توجد طلبات
          </div>
        )}
        {rows.map((r: any) => {
          const product = r.product_id ? productMap[r.product_id] : undefined;
          const typeLabel = TYPE_LABELS[r.type] || r.type;

          return (
            <div key={r.id} className="bg-white rounded-xl border border-gold/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-gold/10 text-goldDark mb-1">
                    {typeLabel}
                  </span>
                  {product ? (
                    <Link href={`/shop/${product.slug}`} className="block font-bold text-goldDark hover:underline text-sm" target="_blank">
                      {product.name_ar}
                    </Link>
                  ) : r.product_id ? (
                    <span className="block text-sm text-charcoal/40">منتج غير معروف ({r.product_id})</span>
                  ) : null}
                  <div className="mt-1">
                    <span className="font-cairo font-bold text-sm text-charcoal">{r.name}</span>
                    {r.phone && <span className="text-xs text-charcoal/50 ms-2">{r.phone}</span>}
                    {r.email && <span className="text-xs text-charcoal/50 ms-2">{r.email}</span>}
                  </div>
                </div>
              </div>

              {r.message && <p className="text-sm text-charcoal/70 mb-2">{r.message}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gold/10">
                <span className="text-xs text-charcoal/40">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString("ar-EG") : ""}
                </span>
                <RequestActionButtons requestId={r.id} status={r.status || "new"} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
