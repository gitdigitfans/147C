import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { d1Query } from "@/lib/d1";
import RequestRow from "./RequestRow";

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
            <RequestRow
              key={r.id}
              data={{
                id: r.id,
                type: r.type,
                typeLabel,
                name: r.name,
                phone: r.phone,
                email: r.email,
                message: r.message,
                status: r.status || "new",
                created_at: r.created_at,
                product: product ? { name_ar: product.name_ar, slug: product.slug } : null,
                productIdUnknown: !product && r.product_id ? r.product_id : null,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
