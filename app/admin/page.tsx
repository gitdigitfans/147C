import { createClient } from "@/lib/supabase/server";
import { d1Query } from "@/lib/d1";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";


async function getStats() {
  let productCount = 0;
  let recentOrders: any[] = [];
  let orderCount = 0;
  let customerCount = 0;
  let revenueThisMonth = 0;
  let topStatus: Record<string, number> = {};

  try {
    const rows = await d1Query<{ c: number }>("SELECT COUNT(*) as c FROM products");
    productCount = rows[0]?.c ?? 0;
  } catch {
    // D1 env vars not configured yet
  }

  const supabase = createClient();
  const { count: orderTotal } = await supabase.from("orders").select("*", { count: "exact", head: true });
  orderCount = orderTotal ?? 0;

  const { count: customerTotal } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  customerCount = customerTotal ?? 0;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, guest_name, total, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  recentOrders = orders ?? [];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { data: monthOrders } = await supabase
    .from("orders")
    .select("total, status")
    .gte("created_at", startOfMonth.toISOString());
  revenueThisMonth = (monthOrders ?? []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  (monthOrders ?? []).forEach((o: any) => {
    topStatus[o.status] = (topStatus[o.status] || 0) + 1;
  });

  return { productCount, orderCount, customerCount, revenueThisMonth, recentOrders, topStatus };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "إجمالي المنتجات", value: stats.productCount, icon: Package },
    { label: "إجمالي الطلبات", value: stats.orderCount, icon: ShoppingCart },
    { label: "إجمالي العملاء", value: stats.customerCount, icon: Users },
    { label: "إيراد هذا الشهر", value: `${stats.revenueThisMonth.toLocaleString()} ج.م`, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">لوحة القيادة</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-gold/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gold-gradient flex items-center justify-center text-white">
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-xs text-charcoal/50">{c.label}</p>
              <p className="text-xl font-bold text-charcoal">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gold/10 overflow-hidden">
          <div className="p-4 border-b border-gold/10 font-bold text-charcoal">أحدث الطلبات</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-charcoal/50 text-xs border-b border-gold/10">
                <th className="text-start p-3">رقم الطلب</th>
                <th className="text-start p-3">العميل</th>
                <th className="text-start p-3">الإجمالي</th>
                <th className="text-start p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-charcoal/40">
                    لا توجد طلبات بعد
                  </td>
                </tr>
              )}
              {stats.recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-gold/5 last:border-0">
                  <td className="p-3">{o.order_number}</td>
                  <td className="p-3">{o.guest_name || "-"}</td>
                  <td className="p-3">{o.total?.toLocaleString()} ج.م</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-goldDark font-bold">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-4">
          <div className="font-bold text-charcoal mb-4">الطلبات حسب الحالة (هذا الشهر)</div>
          <div className="space-y-3">
            {Object.entries(stats.topStatus).length === 0 && <p className="text-sm text-charcoal/40">لا توجد بيانات</p>}
            {Object.entries(stats.topStatus).map(([status, count]) => {
              const max = Math.max(...Object.values(stats.topStatus), 1);
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-charcoal/70">{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gold/10">
                    <div className="h-2 rounded-full bg-gold-gradient" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
