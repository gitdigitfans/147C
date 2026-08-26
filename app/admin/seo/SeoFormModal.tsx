"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveSeo, SeoFormData } from "./actions";

export default function SeoFormModal({ initial }: { initial?: SeoFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SeoFormData>(initial || {
    scope: "global", title_ar: "", title_en: "", description_ar: "", description_en: "", keywords_ar: "", keywords_en: "", og_image: "", canonical_url: "", robots: "index,follow",
  });

  function update<K extends keyof SeoFormData>(key: K, value: SeoFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveSeo(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> إضافة نطاق SEO</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل SEO" : "نطاق SEO جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className={label}>النطاق (scope)</label><input required placeholder="global | page:home | category:bedrooms | product:my-slug" className={input} value={form.scope} onChange={(e) => update("scope", e.target.value)} /></div>
              <div><label className={label}>عنوان (عربي)</label><input className={input} value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} /></div>
              <div><label className={label}>عنوان (إنجليزي)</label><input className={input} value={form.title_en} onChange={(e) => update("title_en", e.target.value)} /></div>
              <div><label className={label}>وصف (عربي)</label><textarea className={input} value={form.description_ar} onChange={(e) => update("description_ar", e.target.value)} /></div>
              <div><label className={label}>وصف (إنجليزي)</label><textarea className={input} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} /></div>
              <div><label className={label}>كلمات مفتاحية (عربي)</label><input className={input} value={form.keywords_ar} onChange={(e) => update("keywords_ar", e.target.value)} /></div>
              <div><label className={label}>كلمات مفتاحية (إنجليزي)</label><input className={input} value={form.keywords_en} onChange={(e) => update("keywords_en", e.target.value)} /></div>
              <div><label className={label}>رابط canonical</label><input className={input} value={form.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} /></div>
              <div><label className={label}>robots</label><input className={input} value={form.robots} onChange={(e) => update("robots", e.target.value)} /></div>
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
