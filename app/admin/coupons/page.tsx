import { d1Query } from "@/lib/d1";
import CouponFormModal from "./CouponFormModal";
import DeleteCouponButton from "./DeleteCouponButton";

export const dynamic = "force-dynamic";


export default async function AdminCouponsPage() {
  let coupons: any[] = [];
  let errorMsg = "";
  try { coupons = await d1Query("SELECT * FROM coupons ORDER BY created_at DESC"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">الكوبونات</h1>
        <CouponFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">الكود</th><th className="text-start p-3">الخصم</th><th className="text-start p-3">الاستخدام</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {coupons.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-charcoal/40">لا توجد كوبونات</td></tr>}
            {coupons.map((c: any) => (
              <tr key={c.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{c.code}</td>
                <td className="p-3">{c.discount_value}{c.discount_type === "percentage" ? "%" : " ج.م"}</td>
                <td className="p-3">{c.used_count} / {c.usage_limit ?? "∞"}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.is_active ? "مفعل" : "معطل"}</span></td>
                <td className="p-3 flex gap-2"><CouponFormModal initial={{ ...c, is_active: !!c.is_active }} /><DeleteCouponButton id={c.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
