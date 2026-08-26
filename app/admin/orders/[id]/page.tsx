import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusControls from "./StatusControls";
import PaymentProofViewer from "./PaymentProofViewer";
import { User, Phone, Mail, MapPin, Truck, CreditCard, Tag, StickyNote } from "lucide-react";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank: "تحويل بنكي",
  wallet: "محفظة إلكترونية",
  instapay: "إنستاباي",
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gold/10 text-goldDark flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-charcoal/40">{label}</p>
        <p className="text-sm font-bold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle();
  if (!order) {
    notFound();
  }

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", params.id),
    supabase.from("order_status_history").select("*").eq("order_id", params.id).order("created_at", { ascending: false }),
  ]);

  const paymentMethodLabel =
    order.payment_method_label || PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || "—";

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-charcoal/50 hover:text-goldDark transition-colors inline-flex items-center gap-1">
        <span>&rarr;</span> رجوع للطلبات
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">{order.order_number}</h1>
            <p className="text-xs text-charcoal/40 mt-1">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
          </div>
          <StatusControls orderId={order.id} status={order.status} paymentStatus={order.payment_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5 space-y-4">
          <h2 className="font-bold text-charcoal text-sm border-b border-gold/10 pb-2">بيانات العميل</h2>
          <InfoRow icon={User} label="الاسم" value={order.guest_name} />
          <InfoRow icon={Phone} label="رقم الهاتف" value={order.guest_phone} />
          <InfoRow icon={Mail} label="البريد الإلكتروني" value={order.guest_email} />
          <InfoRow icon={MapPin} label="المحافظة" value={order.governorate} />
          {order.notes && <InfoRow icon={StickyNote} label="العنوان / ملاحظات" value={order.notes} />}
        </div>

        {/* Shipping & payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5 space-y-4">
          <h2 className="font-bold text-charcoal text-sm border-b border-gold/10 pb-2">الشحن والدفع</h2>
          <InfoRow icon={Truck} label="المحافظة / الشحن" value={order.governorate ? `${order.governorate} — ${order.shipping_amount?.toLocaleString() ?? 0} ج.م` : null} />
          <InfoRow icon={CreditCard} label="طريقة الدفع" value={paymentMethodLabel} />
          {order.coupon_code && <InfoRow icon={Tag} label="كود الخصم المستخدم" value={order.coupon_code} />}
        </div>

        {/* Payment proof */}
        <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-5 space-y-3">
          <h2 className="font-bold text-charcoal text-sm border-b border-gold/10 pb-2">إثبات الدفع</h2>
          {order.payment_proof_url ? (
            <PaymentProofViewer url={order.payment_proof_url} />
          ) : (
            <p className="text-sm text-charcoal/40">لم يتم رفع صورة إثبات دفع لهذا الطلب.</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-hidden">
        <div className="p-4 font-bold text-charcoal border-b border-gold/10">عناصر الطلب</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-charcoal/50 text-xs bg-ivory/60">
                <th className="text-start p-3">المنتج</th>
                <th className="text-start p-3">السعر</th>
                <th className="text-start p-3">الكمية</th>
                <th className="text-start p-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((it: any) => (
                <tr key={it.id} className="border-b border-gold/5 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {it.product_image && <img src={it.product_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                      <span className="font-bold text-charcoal">{it.product_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-charcoal/70">{it.unit_price?.toLocaleString()} ج.م</td>
                  <td className="p-3 text-charcoal/70">{it.quantity}</td>
                  <td className="p-3 font-bold text-charcoal">{it.total_price?.toLocaleString()} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-end space-y-1.5 text-sm border-t border-gold/10 bg-ivory/40">
          <p className="text-charcoal/60">
            الإجمالي الفرعي: <span className="font-bold text-charcoal">{order.subtotal?.toLocaleString()} ج.م</span>
          </p>
          <p className="text-charcoal/60">
            الخصم: <span className="font-bold text-charcoal">{order.discount_amount?.toLocaleString() ?? 0} ج.م</span>
          </p>
          <p className="text-charcoal/60">
            الشحن: <span className="font-bold text-charcoal">{order.shipping_amount?.toLocaleString() ?? 0} ج.م</span>
          </p>
          <p className="text-lg font-bold text-goldDark pt-1">الإجمالي: {order.total?.toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* Status history */}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-4">
        <div className="font-bold text-charcoal mb-3 text-sm">سجل الحالة</div>
        {(history ?? []).length === 0 ? (
          <p className="text-sm text-charcoal/40">لا يوجد سجل بعد</p>
        ) : (
          <ul className="space-y-2 text-sm text-charcoal/70">
            {(history ?? []).map((h: any) => (
              <li key={h.id} className="flex justify-between border-b border-gold/5 last:border-0 pb-2 last:pb-0">
                <span className="font-bold text-charcoal">{h.status}</span>
                <span className="text-charcoal/40">{new Date(h.created_at).toLocaleString("ar-EG")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
