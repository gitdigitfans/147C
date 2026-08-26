"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveContentCard, ContentCardFormData } from "./actions";

export default function ContentCardFormModal({
  section,
  initial,
}: {
  section: "services" | "about_features";
  initial?: ContentCardFormData;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContentCardFormData>(
    initial || {
      section,
      icon: "",
      title_ar: "",
      title_en: "",
      desc_ar: "",
      desc_en: "",
      sort_order: 0,
      is_active: true,
    }
  );

  function update<K extends keyof ContentCardFormData>(key: K, value: ContentCardFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveContentCard({ ...form, section });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}
      >
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> بطاقة جديدة</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل البطاقة" : "بطاقة جديدة"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={label}>اسم الأيقونة (lucide-react)</label>
                <input required className={input} value={form.icon} onChange={(e) => update("icon", e.target.value)} placeholder="PenTool" />
                <p className="text-xs text-charcoal/40 mt-1">اسم أيقونة من lucide-react, مثال: PenTool, Hammer, ShieldCheck</p>
              </div>
              <div><label className={label}>العنوان (عربي)</label><input required className={input} value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} /></div>
              <div><label className={label}>العنوان (إنجليزي)</label><input required className={input} value={form.title_en} onChange={(e) => update("title_en", e.target.value)} /></div>
              {section === "services" && (
                <>
                  <div><label className={label}>الوصف (عربي)</label><input className={input} value={form.desc_ar || ""} onChange={(e) => update("desc_ar", e.target.value)} /></div>
                  <div><label className={label}>الوصف (إنجليزي)</label><input className={input} value={form.desc_en || ""} onChange={(e) => update("desc_en", e.target.value)} /></div>
                </>
              )}
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
