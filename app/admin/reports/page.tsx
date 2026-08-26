import { createClient } from "@/lib/supabase/server";


export default async function AdminReportsPage() {
  const supabase = createClient();

  const { data: orders } = await supabase.from("orders").select("total, status, created_at");
  const { data: orderItems } = await supabase.from("order_items").select("product_name, quantity, total_price");
  const { data: customers } = await supabase.from("profiles").select("created_at");

  const totalRevenue = (orders ?? []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const statusBreakdown: Record<string, number> = {};
  (orders ?? []).forEach((o: any) => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });

  const productTotals: Record<string, { qty: number; revenue: number }> = {};
  (orderItems ?? []).forEach((it: any) => {
    if (!productTotals[it.product_name]) productTotals[it.product_name] = { qty: 0, revenue: 0 };
    productTotals[it.product_name].qty += it.quantity;
    productTotals[it.product_name].revenue += it.total_price;
  });
  const topProducts = Object.entries(productTotals).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);

  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("ar-EG", { month: "short", year: "numeric" });
    const count = (customers ?? []).filter((c: any) => {
      const cd = new Date(c.created_at);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }
  const maxCustomers = Math.max(...months.map((m) => m.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">التقارير</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gold/10"><p className="text-xs text-charcoal/50">إجمالي الإيراد</p><p className="text-xl font-bold text-charcoal">{totalRevenue.toLocaleString()} ج.م</p></div>
        <div className="bg-white rounded-xl p-5 border border-gold/10"><p className="text-xs text-charcoal/50">إجمالي الطلبات</p><p className="text-xl font-bold text-charcoal">{(orders ?? []).length}</p></div>
        <div className="bg-white rounded-xl p-5 border border-gold/10"><p className="text-xs text-charcoal/50">إجمالي العملاء</p><p className="text-xl font-bold text-charcoal">{(customers ?? []).length}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5">
          <h3 className="font-bold mb-4">الطلبات حسب الحالة</h3>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1"><span>{status}</span><span className="font-bold">{count}</span></div>
                <div className="h-2 rounded-full bg-gold/10"><div className="h-2 rounded-full bg-gold-gradient" style={{ width: `${(count / Math.max(...Object.values(statusBreakdown), 1)) * 100}%` }} /></div>
              </div>
            ))}
            {Object.keys(statusBreakdown).length === 0 && <p className="text-sm text-charcoal/40">لا توجد بيانات</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5">
          <h3 className="font-bold mb-4">عملاء جدد (آخر 6 أشهر)</h3>
          <div className="space-y-3">
            {months.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1"><span>{m.label}</span><span className="font-bold">{m.count}</span></div>
                <div className="h-2 rounded-full bg-gold/10"><div className="h-2 rounded-full bg-bronze-gradient" style={{ width: `${(m.count / maxCustomers) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <div className="p-4 border-b border-gold/10 font-bold">الأكثر مبيعاً</div>
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">المنتج</th><th className="text-start p-3">الكمية المباعة</th><th className="text-start p-3">الإيراد</th></tr></thead>
          <tbody>
            {topProducts.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-charcoal/40">لا توجد بيانات مبيعات بعد</td></tr>}
            {topProducts.map(([name, data]) => (
              <tr key={name} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{name}</td>
                <td className="p-3">{data.qty}</td>
                <td className="p-3">{data.revenue.toLocaleString()} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
