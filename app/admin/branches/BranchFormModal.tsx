"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveBranch, BranchFormData } from "./actions";

export default function BranchFormModal({ initial }: { initial?: BranchFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BranchFormData>(initial || {
    name_ar: "", name_en: "", address_ar: "", address_en: "", governorate: "", phone: "", whatsapp: "", email: "",
    lat: null, lng: null, working_hours_ar: "", working_hours_en: "", is_active: true, sort_order: 0,
  });

  function update<K extends keyof BranchFormData>(key: K, value: BranchFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveBranch(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> فرع جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل الفرع" : "فرع جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>الاسم (عربي)</label><input required className={input} value={form.name_ar} onChange={(e) => update("name_ar", e.target.value)} /></div>
              <div><label className={label}>الاسم (إنجليزي)</label><input required className={input} value={form.name_en} onChange={(e) => update("name_en", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>العنوان (عربي)</label><textarea className={input} value={form.address_ar} onChange={(e) => update("address_ar", e.target.value)} /></div>
              <div><label className={label}>المحافظة</label><input className={input} value={form.governorate} onChange={(e) => update("governorate", e.target.value)} /></div>
              <div><label className={label}>الهاتف</label><input className={input} value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div><label className={label}>واتساب</label><input className={input} value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></div>
              <div><label className={label}>البريد الإلكتروني</label><input className={input} value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div><label className={label}>خط العرض (Lat)</label><input type="number" step="any" className={input} value={form.lat ?? ""} onChange={(e) => update("lat", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>خط الطول (Lng)</label><input type="number" step="any" className={input} value={form.lng ?? ""} onChange={(e) => update("lng", e.target.value ? Number(e.target.value) : null)} /></div>
              <div className="md:col-span-2"><label className={label}>ساعات العمل (عربي)</label><input className={input} value={form.working_hours_ar} onChange={(e) => update("working_hours_ar", e.target.value)} /></div>
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
