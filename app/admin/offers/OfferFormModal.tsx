"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveOffer, OfferFormData } from "./actions";
import { MultiProductPicker, ProductOpt } from "../products/ProductForm";

export default function OfferFormModal({ categories, allProducts, initial }: { categories: any[]; allProducts: ProductOpt[]; initial?: OfferFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OfferFormData>(initial || {
    title_ar: "", title_en: "", description_ar: "", description_en: "", discount_type: "percentage",
    discount_value: 0, max_discount_amount: null, min_order_amount: null,
    category_id: null, product_id: null, code: "", productIds: [], banner_image: "", starts_at: null, ends_at: null, is_active: true,
    show_in_topbar: false, show_as_popup: false,
  });

  function update<K extends keyof OfferFormData>(key: K, value: OfferFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await saveOffer(form); setOpen(false); router.refresh(); } catch (err: any) { alert("خطأ: " + err.message); } finally { setSaving(false); }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className={initial ? "text-goldDark" : "px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm"}>
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> عرض جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل العرض" : "عرض جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>العنوان (عربي)</label><input required className={input} value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} /></div>
              <div><label className={label}>العنوان (إنجليزي)</label><input required className={input} value={form.title_en} onChange={(e) => update("title_en", e.target.value)} /></div>
              <div className="md:col-span-2"><label className={label}>الوصف (عربي)</label><textarea className={input} value={form.description_ar} onChange={(e) => update("description_ar", e.target.value)} /></div>
              <div>
                <label className={label}>نوع العرض</label>
                <select className={input} value={form.discount_type} onChange={(e) => update("discount_type", e.target.value as any)}>
                  <option value="percentage">خصم نسبة %</option>
                  <option value="fixed">خصم مبلغ ثابت</option>
                  <option value="free_shipping">شحن مجاني</option>
                </select>
              </div>
              {form.discount_type !== "free_shipping" ? (
                <div><label className={label}>قيمة الخصم</label><input type="number" className={input} value={form.discount_value} onChange={(e) => update("discount_value", Number(e.target.value))} /></div>
              ) : (
                <div className="flex items-end text-sm text-charcoal/50 pb-2">لا تحتاج قيمة - يتم إلغاء رسوم الشحن بالكامل</div>
              )}
              {form.discount_type === "percentage" && (
                <div><label className={label}>أقصى مبلغ خصم (اختياري)</label><input type="number" placeholder="بدون حد أقصى" className={input} value={form.max_discount_amount ?? ""} onChange={(e) => update("max_discount_amount", e.target.value ? Number(e.target.value) : null)} /></div>
              )}
              <div><label className={label}>كود الخصم (اختياري)</label><input className={input} placeholder="اتركه فاضي ليتم تطبيق الخصم أوتوماتيك" value={form.code ?? ""} onChange={(e) => update("code", e.target.value)} /></div>
              <div><label className={label}>أقل قيمة طلب لتفعيل العرض (اختياري)</label><input type="number" placeholder="بدون حد أدنى" className={input} value={form.min_order_amount ?? ""} onChange={(e) => update("min_order_amount", e.target.value ? Number(e.target.value) : null)} /></div>
              <div>
                <label className={label}>التصنيف المستهدف</label>
                <select className={input} value={form.category_id ?? ""} onChange={(e) => update("category_id", e.target.value ? e.target.value : null)}>
                  <option value="">بدون</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <MultiProductPicker
                  label="المنتجات المستهدفة (اختياري)"
                  allProducts={allProducts}
                  selectedIds={form.productIds || []}
                  onChange={(ids) => update("productIds", ids)}
                />
              </div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل</label></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!form.show_in_topbar} onChange={(e) => update("show_in_topbar", e.target.checked)} /> يظهر فوق الهيدر</label></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!form.show_as_popup} onChange={(e) => update("show_as_popup", e.target.checked)} /> تفعيل نافذة منبثقة عند فتح الموقع</label></div>
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
