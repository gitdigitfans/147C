"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil } from "lucide-react";
import { saveContactField, ContactFieldFormData } from "./actions";

const TYPE_OPTIONS: { value: ContactFieldFormData["field_type"]; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "phone", label: "هاتف" },
  { value: "textarea", label: "نص طويل" },
];

export default function FormModal({ initial }: { initial?: ContactFieldFormData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContactFieldFormData>(
    initial || {
      field_key: "",
      label_ar: "",
      label_en: "",
      field_type: "text",
      is_required: false,
      sort_order: 0,
      is_active: true,
    }
  );

  function update<K extends keyof ContactFieldFormData>(key: K, value: ContactFieldFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveContactField(form);
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
        {initial ? <Pencil size={14} /> : (<><Plus size={16} /> حقل جديد</>)}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4 text-charcoal/50">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">{initial ? "تعديل الحقل" : "حقل جديد"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>المفتاح (بالإنجليزي، بدون مسافات)</label>
                <input required className={input} value={form.field_key} onChange={(e) => update("field_key", e.target.value)} />
              </div>
              <div>
                <label className={label}>نوع الحقل</label>
                <select className={input} value={form.field_type} onChange={(e) => update("field_type", e.target.value as ContactFieldFormData["field_type"])}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>التسمية (عربي)</label>
                <input required className={input} value={form.label_ar} onChange={(e) => update("label_ar", e.target.value)} />
              </div>
              <div>
                <label className={label}>التسمية (إنجليزي)</label>
                <input className={input} value={form.label_en} onChange={(e) => update("label_en", e.target.value)} />
              </div>
              <div>
                <label className={label}>الترتيب</label>
                <input type="number" className={input} value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={form.is_required} onChange={(e) => update("is_required", e.target.checked)} /> إلزامي
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> مفعل
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gold/30 text-sm">
                  إلغاء
                </button>
                <button disabled={saving} className="px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold text-sm disabled:opacity-60">
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
