import { d1Query } from "@/lib/d1";
import OfferFormModal from "./OfferFormModal";
import DeleteOfferButton from "./DeleteOfferButton";

export const dynamic = "force-dynamic";


export default async function AdminOffersPage() {
  let offers: any[] = [];
  let categories: any[] = [];
  let allProducts: any[] = [];
  let offerProductRows: any[] = [];
  let errorMsg = "";
  try {
    offers = await d1Query("SELECT * FROM offers ORDER BY created_at DESC");
    categories = await d1Query("SELECT id, name_ar FROM categories ORDER BY sort_order");
    allProducts = await d1Query("SELECT id, name_ar FROM products ORDER BY name_ar");
    offerProductRows = await d1Query(
      "SELECT op.offer_id, op.product_id, p.name_ar FROM offer_products op LEFT JOIN products p ON p.id = op.product_id"
    );
  } catch (e: any) { errorMsg = e.message; }

  const productIdsByOffer: Record<string, string[]> = {};
  for (const row of offerProductRows) {
    if (!productIdsByOffer[row.offer_id]) productIdsByOffer[row.offer_id] = [];
    productIdsByOffer[row.offer_id].push(row.product_id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">العروض</h1>
        <OfferFormModal categories={categories} allProducts={allProducts} />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">العنوان</th><th className="text-start p-3">نوع العرض</th><th className="text-start p-3">شروط</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {offers.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-charcoal/40">لا توجد عروض</td></tr>}
            {offers.map((o: any) => (
              <tr key={o.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{o.title_ar}</td>
                <td className="p-3">
                  {o.discount_type === "free_shipping" && <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">شحن مجاني</span>}
                  {o.discount_type === "percentage" && <span className="px-2 py-1 rounded-full text-xs font-bold bg-gold/10 text-goldDark">خصم {o.discount_value}%</span>}
                  {o.discount_type === "fixed" && <span className="px-2 py-1 rounded-full text-xs font-bold bg-gold/10 text-goldDark">خصم {o.discount_value} ج.م</span>}
                </td>
                <td className="p-3 text-xs text-charcoal/60 space-y-0.5">
                  {o.max_discount_amount ? <div>أقصى خصم: {o.max_discount_amount} ج.م</div> : null}
                  {o.min_order_amount ? <div>أقل طلب: {o.min_order_amount} ج.م</div> : null}
                  {!o.max_discount_amount && !o.min_order_amount ? <span className="text-charcoal/30">—</span> : null}
                </td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${o.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{o.is_active ? "مفعل" : "معطل"}</span></td>
                <td className="p-3 flex gap-2"><OfferFormModal categories={categories} allProducts={allProducts} initial={{ ...o, is_active: !!o.is_active, show_in_topbar: !!o.show_in_topbar, show_as_popup: !!o.show_as_popup, productIds: productIdsByOffer[o.id] || [] }} /><DeleteOfferButton id={o.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
