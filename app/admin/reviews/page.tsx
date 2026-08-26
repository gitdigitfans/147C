import Link from "next/link";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { d1Query } from "@/lib/d1";
import ReviewActionButtons from "./ReviewActionButtons";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = searchParams?.status || "";
  const supabase = createClient();

  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: reviews } = await query;

  const rows = reviews || [];

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
      <h1 className="text-2xl font-bold text-charcoal mb-6">التقييمات</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/reviews?status=${f.value}` : "/admin/reviews"}
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
            لا توجد تقييمات
          </div>
        )}
        {rows.map((r: any) => {
          const product = productMap[r.product_id];
          const reviewerName = r.guest_name || (r.user_id ? "مستخدم مسجل" : "زائر");
          const statusLabel =
            r.status === "approved" ? "مقبول" : r.status === "rejected" ? "مرفوض" : "قيد المراجعة";
          const statusColor =
            r.status === "approved"
              ? "bg-green-100 text-green-700"
              : r.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700";

          return (
            <div key={r.id} className="bg-white rounded-xl border border-gold/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  {product ? (
                    <Link href={`/shop/${product.slug}`} className="font-bold text-goldDark hover:underline text-sm" target="_blank">
                      {product.name_ar}
                    </Link>
                  ) : (
                    <span className="text-sm text-charcoal/40">منتج غير معروف ({r.product_id})</span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-cairo font-bold text-sm text-charcoal">{reviewerName}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={13} className={idx < (r.rating || 0) ? "fill-gold text-gold" : "text-charcoal/20"} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusLabel}</span>
              </div>

              {r.title && <p className="font-bold text-sm text-charcoal mb-1">{r.title}</p>}
              {r.body && <p className="text-sm text-charcoal/70 mb-2">{r.body}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gold/10">
                <span className="text-xs text-charcoal/40">
                  {new Date(r.created_at).toLocaleDateString("ar-EG")}
                </span>
                <ReviewActionButtons reviewId={r.id} status={r.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
