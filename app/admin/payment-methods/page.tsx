import { d1Query } from "@/lib/d1";
import PaymentMethodFormModal from "./PaymentMethodFormModal";
import DeletePaymentMethodButton from "./DeletePaymentMethodButton";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  bank: "حساب بنكي",
  wallet: "محفظة إلكترونية",
  instapay: "إنستاباي",
  cod: "الدفع عند الاستلام",
};

export default async function AdminPaymentMethodsPage() {
  let methods: any[] = [];
  let errorMsg = "";
  try { methods = await d1Query("SELECT * FROM payment_methods ORDER BY sort_order"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">طرق الدفع</h1>
        <PaymentMethodFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">النوع</th><th className="text-start p-3">الاسم</th><th className="text-start p-3">رقم الحساب</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {methods.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-charcoal/40">لا توجد طرق دفع بعد</td></tr>}
            {methods.map((m: any) => (
              <tr key={m.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3">{typeLabels[m.type] || m.type}</td>
                <td className="p-3 font-bold">{m.label_ar}</td>
                <td className="p-3">{m.account_number}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${m.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{m.is_active ? "مفعل" : "معطل"}</span></td>
                <td className="p-3 flex gap-2"><PaymentMethodFormModal initial={{ ...m, is_active: !!m.is_active }} /><DeletePaymentMethodButton id={m.id} type={m.type} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
