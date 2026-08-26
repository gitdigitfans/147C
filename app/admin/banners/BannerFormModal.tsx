"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { saveBanner, BannerFormData } from "./actions";

const positions = ["home_hero", "home_secondary", "category_top", "popup"];

export default function BannerFormModal({ initial }: { initial?: BannerFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BannerFormData>(initial || {
    title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "", image_url: "", mobile_image_url: "",
    link_url: "", position: "home_hero", sort_order: 0, starts_at: null, ends_at: null, is_active: true,
    media_type: "image", video_url: "",
  });

  function update<K extends keyof BannerFormData>(key: K, value: BannerFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBanner(form);
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
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> بانر جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل البانر" : "بانر جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>العنوان (عربي)</label><input required className={input} value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} /></div>
              <div><label className={label}>العنوان (إنجليزي)</label><input required className={input} value={form.title_en} onChange={(e) => update("title_en", e.target.value)} /></div>
              <div><label className={label}>العنوان الفرعي (عربي)</label><input className={input} value={form.subtitle_ar} onChange={(e) => update("subtitle_ar", e.target.value)} /></div>
              <div><label className={label}>العنوان الفرعي (إنجليزي)</label><input className={input} value={form.subtitle_en} onChange={(e) => update("subtitle_en", e.target.value)} /></div>
              <div className="md:col-span-2">
                <label className={label}>نوع المحتوى</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="radio" checked={(form.media_type || "image") === "image"} onChange={() => update("media_type", "image")} /> صورة
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="radio" checked={form.media_type === "video"} onChange={() => update("media_type", "video")} /> فيديو
                  </label>
                </div>
              </div>
              <div className="md:col-span-2"><CloudinaryUploader resourceType="image" previewUrl={form.image_url} onUploaded={(url) => update("image_url", url)} label={form.media_type === "video" ? "صورة مصغرة (بوستر) - اختياري" : "صورة البانر"} /></div>
              {form.media_type === "video" && (
                <div className="md:col-span-2"><CloudinaryUploader resourceType="video" previewUrl={form.video_url} onUploaded={(url) => update("video_url", url)} label="فيديو البانر" /></div>
              )}
              <div><label className={label}>رابط الوجهة</label><input className={input} value={form.link_url} onChange={(e) => update("link_url", e.target.value)} /></div>
              <div>
                <label className={label}>الموضع</label>
                <select className={input} value={form.position} onChange={(e) => update("position", e.target.value)}>
                  {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className={label}>الترتيب</label><input type="number" className={input} value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} /></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل</label></div>
              <div><label className={label}>يبدأ في</label><input type="date" className={input} value={form.starts_at || ""} onChange={(e) => update("starts_at", e.target.value)} /></div>
              <div><label className={label}>ينتهي في</label><input type="date" className={input} value={form.ends_at || ""} onChange={(e) => update("ends_at", e.target.value)} /></div>
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
