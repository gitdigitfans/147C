"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveShippingRate, ShippingRateFormData } from "./actions";

export default function ShippingRateFormModal({ initial }: { initial?: ShippingRateFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShippingRateFormData>(initial || {
    governorate_ar: "", governorate_en: "", price: 0, is_active: true, sort_order: 0,
  });

  function update<K extends keyof ShippingRateFormData>(key: K, value: ShippingRateFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveShippingRate(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const inputDisabled = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm bg-ivory/60 text-charcoal/60";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";
  const isExisting = !!initial;

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> منطقة شحن جديدة</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل منطقة الشحن" : "منطقة شحن جديدة"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>المحافظة (عربي)</label>
                {isExisting ? (
                  <input disabled className={inputDisabled} value={form.governorate_ar} />
                ) : (
                  <input required className={input} value={form.governorate_ar} onChange={(e) => update("governorate_ar", e.target.value)} />
                )}
              </div>
              <div>
                <label className={label}>المحافظة (إنجليزي)</label>
                {isExisting ? (
                  <input disabled className={inputDisabled} value={form.governorate_en} />
                ) : (
                  <input required className={input} value={form.governorate_en} onChange={(e) => update("governorate_en", e.target.value)} />
                )}
              </div>
              <div><label className={label}>السعر</label><input required type="number" step="any" className={input} value={form.price} onChange={(e) => update("price", Number(e.target.value))} /></div>
              <div><label className={label}>الترتيب</label><input type="number" className={input} value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} /></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل</label></div>
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
