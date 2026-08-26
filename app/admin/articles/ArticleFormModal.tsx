"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { saveArticle, ArticleFormData } from "./actions";

export default function ArticleFormModal({ initial }: { initial?: ArticleFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ArticleFormData>(initial || {
    slug: "", title_ar: "", title_en: "", excerpt_ar: "", excerpt_en: "", content_ar: "", content_en: "",
    cover_image: "", author: "", is_published: false, seo_title_ar: "", seo_title_en: "", seo_description_ar: "", seo_description_en: "",
  });

  function update<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveArticle(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> مقال جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل المقال" : "مقال جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>العنوان (عربي)</label><input required className={input} value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} /></div>
              <div><label className={label}>العنوان (إنجليزي)</label><input required className={input} value={form.title_en} onChange={(e) => update("title_en", e.target.value)} /></div>
              <div><label className={label}>Slug</label><input required className={input} value={form.slug} onChange={(e) => update("slug", e.target.value)} /></div>
              <div><label className={label}>الكاتب</label><input className={input} value={form.author} onChange={(e) => update("author", e.target.value)} /></div>
              <div className="md:col-span-2"><CloudinaryUploader resourceType="image" previewUrl={form.cover_image} onUploaded={(url) => update("cover_image", url)} label="صورة الغلاف" /></div>
              <div className="md:col-span-2"><label className={label}>مقتطف (عربي)</label><textarea className={input} value={form.excerpt_ar} onChange={(e) => update("excerpt_ar", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>مقتطف (إنجليزي)</label><textarea className={input} value={form.excerpt_en} onChange={(e) => update("excerpt_en", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>المحتوى (عربي)</label><textarea rows={6} className={input} value={form.content_ar} onChange={(e) => update("content_ar", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>المحتوى (إنجليزي)</label><textarea rows={6} className={input} value={form.content_en} onChange={(e) => update("content_en", e.target.value)} /></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)} /> منشور</label></div>
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
