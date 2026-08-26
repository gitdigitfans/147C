"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { CATEGORY_ICON_OPTIONS } from "@/lib/categoryIcons";
import { saveCategory, CategoryFormData } from "./actions";

export default function CategoryFormModal({ categories, initial, trigger }: { categories: any[]; initial?: CategoryFormData; trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(
    initial || {
      slug: "", name_ar: "", name_en: "", description_ar: "", description_en: "", image_url: "", icon_key: null, icon_url: "",
      parent_id: null, sort_order: categories.length, is_active: true,
      seo_title_ar: "", seo_title_en: "", seo_description_ar: "", seo_description_en: "",
    }
  );

  function update<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCategory(form);
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
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm">
        {trigger || (<><Plus size={16} /> تصنيف جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل التصنيف" : "تصنيف جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>الاسم (عربي)</label><input required className={input} value={form.name_ar} onChange={(e) => update("name_ar", e.target.value)} /></div>
              <div><label className={label}>الاسم (إنجليزي)</label><input required className={input} value={form.name_en} onChange={(e) => update("name_en", e.target.value)} /></div>
              <div><label className={label}>Slug</label><input required className={input} value={form.slug} onChange={(e) => update("slug", e.target.value)} /></div>
              <div><label className={label}>الترتيب</label><input type="number" className={input} value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} /></div>
              <div className="md:col-span-2"><label className={label}>وصف (عربي)</label><textarea className={input} value={form.description_ar} onChange={(e) => update("description_ar", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>وصف (إنجليزي)</label><textarea className={input} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} /></div>
              <div className="md:col-span-2">
                <CloudinaryUploader resourceType="image" previewUrl={form.image_url} onUploaded={(url) => update("image_url", url)} label="صورة التصنيف" />
              </div>
              <div className="md:col-span-2">
                <label className={label}>أيقونة الكرت (تظهر فوق الصورة في الرئيسية وصفحة التصنيفات)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { update("icon_key", null); update("icon_url", ""); }}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold ${!form.icon_key && !form.icon_url ? "border-gold bg-gold/10 text-goldDark" : "border-gold/20 text-charcoal/50"}`}
                  >
                    بدون أيقونة
                  </button>
                  {CATEGORY_ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = form.icon_key === opt.key && !form.icon_url;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => { update("icon_key", opt.key); update("icon_url", ""); }}
                        title={opt.label_ar}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold ${active ? "border-gold bg-gold/10 text-goldDark" : "border-gold/20 text-charcoal/60"}`}
                      >
                        <Icon size={16} /> {opt.label_ar}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-charcoal/50 mb-1">أو ارفع أيقونة من عندك (PNG بخلفية شفافة أفضل شكل):</p>
                <CloudinaryUploader
                  resourceType="image"
                  previewUrl={form.icon_url || ""}
                  onUploaded={(url) => { update("icon_url", url); update("icon_key", null); }}
                  label="أيقونة مخصصة (اختياري)"
                />
                {form.icon_url && (
                  <button
                    type="button"
                    onClick={() => update("icon_url", "")}
                    className="mt-2 text-xs text-red-600 font-bold"
                  >
                    إزالة الأيقونة المخصصة
                  </button>
                )}
              </div>
              <div>
                <label className={label}>التصنيف الأب</label>
                <select className={input} value={form.parent_id ?? ""} onChange={(e) => update("parent_id", e.target.value ? e.target.value : null)}>
                  <option value="">بدون</option>
                  {categories.filter((c) => c.id !== form.id).map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-bold text-charcoal/70">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل
                </label>
              </div>
              <div><label className={label}>عنوان SEO (عربي)</label><input className={input} value={form.seo_title_ar} onChange={(e) => update("seo_title_ar", e.target.value)} /></div>
              <div><label className={label}>عنوان SEO (إنجليزي)</label><input className={input} value={form.seo_title_en} onChange={(e) => update("seo_title_en", e.target.value)} /></div>
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
