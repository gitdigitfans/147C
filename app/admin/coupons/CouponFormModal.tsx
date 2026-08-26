"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveCoupon, CouponFormData } from "./actions";

export default function CouponFormModal({ initial }: { initial?: CouponFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouponFormData>(initial || {
    code: "", description_ar: "", description_en: "", discount_type: "percentage", discount_value: 0,
    min_order_amount: null, max_discount_amount: null, usage_limit: null, usage_limit_per_user: null,
    starts_at: null, ends_at: null, is_active: true,
  });

  function update<K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveCoupon(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> كوبون جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل الكوبون" : "كوبون جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={label}>الكود</label><input required className={`${input} uppercase`} value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} /></div>
              <div>
                <label className={label}>نوع الخصم</label>
                <select className={input} value={form.discount_type} onChange={(e) => update("discount_type", e.target.value as any)}>
                  <option value="percentage">نسبة %</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
              <div><label className={label}>قيمة الخصم</label><input type="number" className={input} value={form.discount_value} onChange={(e) => update("discount_value", Number(e.target.value))} /></div>
              <div><label className={label}>الحد الأدنى للطلب</label><input type="number" className={input} value={form.min_order_amount ?? ""} onChange={(e) => update("min_order_amount", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>أقصى قيمة خصم</label><input type="number" className={input} value={form.max_discount_amount ?? ""} onChange={(e) => update("max_discount_amount", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>حد الاستخدام الكلي</label><input type="number" className={input} value={form.usage_limit ?? ""} onChange={(e) => update("usage_limit", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>حد الاستخدام لكل عميل</label><input type="number" className={input} value={form.usage_limit_per_user ?? ""} onChange={(e) => update("usage_limit_per_user", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>يبدأ في</label><input type="date" className={input} value={form.starts_at || ""} onChange={(e) => update("starts_at", e.target.value)} /></div>
              <div><label className={label}>ينتهي في</label><input type="date" className={input} value={form.ends_at || ""} onChange={(e) => update("ends_at", e.target.value)} /></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل</label></div>
              {initial && "used_count" in (initial as any) && <p className="text-xs text-charcoal/50 flex items-end">مرات الاستخدام: {(initial as any).used_count}</p>}
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gold/30 text-sm">إلغاء</button>
                <button disabled={saving} className="px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold text-sm disabled:opacity-60">{saving ? "جاري الحفظ..." : "حفظ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
