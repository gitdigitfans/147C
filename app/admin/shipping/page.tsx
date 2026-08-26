import { d1Query } from "@/lib/d1";
import ShippingRateFormModal from "./ShippingRateFormModal";
import DeleteShippingRateButton from "./DeleteShippingRateButton";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  let rates: any[] = [];
  let errorMsg = "";
  try { rates = await d1Query("SELECT * FROM shipping_rates ORDER BY sort_order"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">الشحن</h1>
        <ShippingRateFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">المحافظة</th><th className="text-start p-3">السعر</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {rates.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-charcoal/40">لا توجد مناطق شحن بعد</td></tr>}
            {rates.map((r: any) => (
              <tr key={r.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{r.governorate_ar}</td>
                <td className="p-3">{r.price}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.is_active ? "مفعل" : "معطل"}</span></td>
                <td className="p-3 flex gap-2"><ShippingRateFormModal initial={{ ...r, is_active: !!r.is_active }} /><DeleteShippingRateButton id={r.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
