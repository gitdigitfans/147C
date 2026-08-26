import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


export default async function AdminOrdersPage() {
  const supabase = createClient();
  const query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  const { data: orders } = await query;

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">الطلبات</h1>
      <form className="flex gap-2 mb-4">
        <select name="status" defaultValue="" className="px-3 py-2 rounded-lg border border-gold/30 text-sm">
          <option value="">كل الحالات</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="px-4 py-2 rounded-lg bg-charcoal text-white text-sm">تصفية</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">رقم الطلب</th>
              <th className="text-start p-3">العميل</th>
              <th className="text-start p-3">الإجمالي</th>
              <th className="text-start p-3">الحالة</th>
              <th className="text-start p-3">الدفع</th>
              <th className="text-start p-3">التاريخ</th>
              <th className="text-start p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-charcoal/40">
                  لا توجد طلبات
                </td>
              </tr>
            )}
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{o.order_number}</td>
                <td className="p-3">{o.guest_name || "-"}</td>
                <td className="p-3">{o.total?.toLocaleString()} ج.م</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-goldDark font-bold">{o.status}</span>
                </td>
                <td className="p-3">{o.payment_status}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString("ar-EG")}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-goldDark font-bold hover:underline">
                    التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
