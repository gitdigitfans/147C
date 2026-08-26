"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { savePaymentMethod, PaymentMethodFormData } from "./actions";
import CloudinaryUploader from "@/components/CloudinaryUploader";

export default function PaymentMethodFormModal({ initial }: { initial?: PaymentMethodFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentMethodFormData>(initial || {
    type: "bank", label_ar: "", label_en: "", account_name: "", account_number: "",
    instructions_ar: "", instructions_en: "", image_url: "", is_active: true, sort_order: 0,
  });

  function update<K extends keyof PaymentMethodFormData>(key: K, value: PaymentMethodFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await savePaymentMethod(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> طريقة دفع جديدة</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل طريقة الدفع" : "طريقة دفع جديدة"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={label}>النوع</label>
                <select className={input} value={form.type} onChange={(e) => update("type", e.target.value as PaymentMethodFormData["type"])}>
                  <option value="bank">حساب بنكي</option>
                  <option value="wallet">محفظة إلكترونية</option>
                  <option value="instapay">إنستاباي</option>
                  <option value="cod">الدفع عند الاستلام</option>
                </select>
              </div>
              <div><label className={label}>الاسم (عربي)</label><input required className={input} value={form.label_ar} onChange={(e) => update("label_ar", e.target.value)} /></div>
              <div><label className={label}>الاسم (إنجليزي)</label><input required className={input} value={form.label_en} onChange={(e) => update("label_en", e.target.value)} /></div>
              <div><label className={label}>اسم صاحب الحساب</label><input className={input} value={form.account_name} onChange={(e) => update("account_name", e.target.value)} /></div>
              <div><label className={label}>رقم الحساب</label><input className={input} value={form.account_number} onChange={(e) => update("account_number", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>تعليمات الدفع (عربي)</label><textarea className={input} value={form.instructions_ar} onChange={(e) => update("instructions_ar", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>تعليمات الدفع (إنجليزي)</label><textarea className={input} value={form.instructions_en} onChange={(e) => update("instructions_en", e.target.value)} /></div>
              <div className="md:col-span-2">
                <CloudinaryUploader label="شعار/QR طريقة الدفع" previewUrl={form.image_url} onUploaded={(url) => update("image_url", url)} />
              </div>
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
