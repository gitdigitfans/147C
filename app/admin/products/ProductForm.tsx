"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Info, Images, Settings2, Layers, Youtube, Upload, X, Search } from "lucide-react";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import { saveProduct, ProductFormData, ProductImageInput, SpecInput, FaqInput, AttributeInput } from "./actions";

interface CategoryOpt { id: string; name_ar: string; name_en: string }
export interface ProductOpt { id: string; name_ar: string }

const TABS = [
  { key: "basic", label: "البيانات الأساسية", icon: Info },
  { key: "images", label: "الصور", icon: Images },
  { key: "more", label: "إعدادات إضافية", icon: Settings2 },
  { key: "variants", label: "المتغيرات", icon: Layers },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isYoutubeUrl(url?: string | null) {
  return !!url && /youtube\.com|youtu\.be/.test(url);
}

export function MultiProductPicker({
  label,
  allProducts,
  selectedIds,
  onChange,
}: {
  label: string;
  allProducts: ProductOpt[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = allProducts.filter((p) => selectedIds.includes(p.id));

  const results = query.trim()
    ? allProducts.filter(
        (p) => !selectedIds.includes(p.id) && p.name_ar.toLowerCase().includes(query.trim().toLowerCase())
      )
    : allProducts.filter((p) => !selectedIds.includes(p.id));

  function addProduct(id: string) {
    onChange([...selectedIds, id]);
    setQuery("");
    setOpen(false);
  }

  function removeProduct(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <div>
      <label className="block text-xs font-bold text-charcoal/60 mb-1">{label}</label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((p) => (
            <span
              key={p.id}
              className="bg-gold/10 text-charcoal text-xs rounded-full px-3 py-1 flex items-center gap-1"
            >
              {p.name_ar}
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                aria-label={`إزالة ${p.name_ar}`}
                className="text-charcoal/50 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
          <input
            className="w-full ps-8 pe-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold"
            placeholder="ابحث عن منتج لإضافته..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gold/20 rounded-lg shadow-lg">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addProduct(p.id);
                }}
                className="w-full text-start px-3 py-2 text-sm hover:bg-gold/10 flex items-center gap-2"
              >
                <Plus size={12} className="text-goldDark" />
                {p.name_ar}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpecsTableEditor({
  specs,
  onChange,
}: {
  specs: SpecInput[];
  onChange: (specs: SpecInput[]) => void;
}) {
  interface Row {
    nameAr: string;
    nameEn: string;
    cells: { ar: string; en: string }[];
  }

  function parse(): { columns: string[]; columnsEn: string[]; rows: Row[] } {
    const colMap = new Map<string, string>();
    const colEnMap = new Map<string, string>();
    const rowMap = new Map<string, Row>();

    for (const s of specs) {
      const dashIdx = s.keyAr.indexOf(" - ");
      if (dashIdx > 0) {
        const itemName = s.keyAr.substring(0, dashIdx).trim();
        const colName = s.keyAr.substring(dashIdx + 3).trim();
        const colNameEn = s.keyEn.includes(" - ") ? s.keyEn.substring(s.keyEn.indexOf(" - ") + 3).trim() : colName;
        if (!colMap.has(colName)) colMap.set(colName, colNameEn);
        if (!rowMap.has(itemName)) {
          rowMap.set(itemName, { nameAr: itemName, nameEn: s.keyEn.substring(0, s.keyEn.indexOf(" - ")).trim(), cells: [] });
        }
      } else {
        const name = s.keyAr.trim();
        if (!rowMap.has(name)) {
          rowMap.set(name, { nameAr: name, nameEn: s.keyEn.trim(), cells: [] });
        }
      }
    }

    const columns = Array.from(colMap.keys());
    const columnsEn = Array.from(colMap.values());
    const rows = Array.from(rowMap.values());

    for (const row of rows) {
      for (const col of columns) {
        const found = specs.find((s) => {
          const di = s.keyAr.indexOf(" - ");
          return di > 0 && s.keyAr.substring(0, di).trim() === row.nameAr && s.keyAr.substring(di + 3).trim() === col;
        });
        const foundEn = found?.keyEn.includes(" - ") ? found.keyEn.substring(found.keyEn.indexOf(" - ") + 3).trim() : col;
        row.cells.push({ ar: found?.valueAr || "", en: found?.valueEn || "" });
      }
    }

    return { columns, columnsEn, rows };
  }

  function serialize(columns: string[], columnsEn: string[], rows: Row[]): SpecInput[] {
    const result: SpecInput[] = [];
    for (const row of rows) {
      for (let c = 0; c < columns.length; c++) {
        const val = row.cells[c];
        if (row.nameAr || (val && val.ar)) {
          result.push({
            keyAr: row.nameAr + " - " + columns[c],
            keyEn: (row.nameEn || row.nameAr) + " - " + (columnsEn[c] || columns[c]),
            valueAr: val?.ar || "",
            valueEn: val?.en || "",
          });
        }
      }
    }
    return result;
  }

  const parsed = parse();
  const [columns, setColumns] = useState(parsed.columns);
  const [columnsEn, setColumnsEn] = useState(parsed.columnsEn);
  const [rows, setRows] = useState<Row[]>(parsed.rows);
  const [newColName, setNewColName] = useState("");
  const [newColNameEn, setNewColNameEn] = useState("");

  function emit(c: string[], ce: string[], r: Row[]) {
    setColumns(c);
    setColumnsEn(ce);
    setRows(r);
    onChange(serialize(c, ce, r));
  }

  function updateCell(ri: number, ci: number, field: "ar" | "en", val: string) {
    const r = rows.map((row, i) => {
      if (i !== ri) return row;
      const cells = row.cells.map((cell, j) => (j === ci ? { ...cell, [field]: val } : cell));
      return { ...row, cells };
    });
    emit(columns, columnsEn, r);
  }

  function updateRowName(ri: number, field: "nameAr" | "nameEn", val: string) {
    const r = rows.map((row, i) => (i === ri ? { ...row, [field]: val } : row));
    emit(columns, columnsEn, r);
  }

  function addRow() {
    const newRow: Row = { nameAr: "", nameEn: "", cells: columns.map(() => ({ ar: "", en: "" })) };
    emit(columns, columnsEn, [...rows, newRow]);
  }

  function removeRow(ri: number) {
    emit(columns, columnsEn, rows.filter((_, i) => i !== ri));
  }

  function addColumn() {
    const name = newColName.trim();
    if (!name) return;
    const nameEn = newColNameEn.trim() || name;
    const r = rows.map((row) => ({ ...row, cells: [...row.cells, { ar: "", en: "" }] }));
    emit([...columns, name], [...columnsEn, nameEn], r);
    setNewColName("");
    setNewColNameEn("");
  }

  function removeColumn(ci: number) {
    const r = rows.map((row) => ({ ...row, cells: row.cells.filter((_, j) => j !== ci) }));
    emit(columns.filter((_, i) => i !== ci), columnsEn.filter((_, i) => i !== ci), r);
  }

  function updateColumnName(ci: number, field: "ar" | "en", val: string) {
    if (field === "ar") {
      setColumns(columns.map((c, i) => (i === ci ? val : c)));
      emit(columns.map((c, i) => (i === ci ? val : c)), columnsEn, rows);
    } else {
      setColumnsEn(columnsEn.map((c, i) => (i === ci ? val : c)));
      emit(columns, columnsEn.map((c, i) => (i === ci ? val : c)), rows);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gold/20">
          <thead>
            <tr className="bg-gold/10">
              <th className="px-3 py-2 text-right font-bold text-charcoal border border-gold/20 min-w-[120px]">
                <div className="text-xs text-charcoal/50 mb-1">القطعة</div>
              </th>
              {columns.map((col, ci) => (
                <th key={ci} className="px-3 py-2 text-center font-bold text-charcoal border border-gold/20 min-w-[120px]">
                  <input
                    className="w-full text-center bg-transparent border-b border-gold/30 text-xs font-bold outline-none mb-1"
                    value={col}
                    onChange={(e) => updateColumnName(ci, "ar", e.target.value)}
                    placeholder="العمود (عربي)"
                  />
                  <input
                    className="w-full text-center bg-transparent border-b border-gold/30 text-[10px] text-charcoal/50 outline-none"
                    value={columnsEn[ci] || ""}
                    onChange={(e) => updateColumnName(ci, "en", e.target.value)}
                    placeholder="Column (en)"
                  />
                  <button type="button" onClick={() => removeColumn(ci)} className="text-red-500 hover:text-red-700 mt-1">
                    <Trash2 size={10} />
                  </button>
                </th>
              ))}
              <th className="px-2 py-2 border border-gold/20 w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-ivory" : "bg-white"}>
                <td className="px-2 py-1.5 border border-gold/20">
                  <input
                    className="w-full px-2 py-1 text-xs font-bold border border-gold/20 rounded outline-none focus:border-gold"
                    value={row.nameAr}
                    onChange={(e) => updateRowName(ri, "nameAr", e.target.value)}
                    placeholder="اسم القطعة"
                  />
                  <input
                    className="w-full px-2 py-1 text-[10px] text-charcoal/50 border border-gold/10 rounded outline-none mt-1"
                    value={row.nameEn}
                    onChange={(e) => updateRowName(ri, "nameEn", e.target.value)}
                    placeholder="Name (en)"
                  />
                </td>
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 border border-gold/20">
                    <input
                      className="w-full px-2 py-1 text-xs border border-gold/20 rounded outline-none focus:border-gold"
                      value={cell.ar}
                      onChange={(e) => updateCell(ri, ci, "ar", e.target.value)}
                      placeholder="—"
                    />
                    <input
                      className="w-full px-2 py-1 text-[10px] text-charcoal/50 border border-gold/10 rounded outline-none mt-1"
                      value={cell.en}
                      onChange={(e) => updateCell(ri, ci, "en", e.target.value)}
                      placeholder="—"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 border border-gold/20 text-center">
                  <button type="button" onClick={() => removeRow(ri)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <button type="button" onClick={addRow} className="text-goldDark text-sm font-bold flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-lg hover:bg-gold/20">
          <Plus size={14} /> إضافة صف
        </button>
        <div className="flex items-end gap-1">
          <input
            className="px-2 py-1.5 text-xs border border-gold/30 rounded-lg outline-none focus:border-gold w-[120px]"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder="عمود جديد (عربي)"
          />
          <input
            className="px-2 py-1.5 text-xs border border-gold/30 rounded-lg outline-none focus:border-gold w-[120px]"
            value={newColNameEn}
            onChange={(e) => setNewColNameEn(e.target.value)}
            placeholder="Column (en)"
          />
          <button type="button" onClick={addColumn} className="text-goldDark text-sm font-bold flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-lg hover:bg-gold/20">
            <Plus size={14} /> إضافة عمود
          </button>
        </div>
      </div>

      <p className="text-[11px] text-charcoal/40">الصف الأول = اسم القطعة، الأعمدة = الأبعاد. البيانات تتحول تلقائياً للمواصفات المطلوبة.</p>
    </div>
  );
}

export default function ProductForm({
  categories,
  allProducts,
  initial,
}: {
  categories: CategoryOpt[];
  allProducts: ProductOpt[];
  initial?: Partial<ProductFormData>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [form, setForm] = useState<ProductFormData>({
    id: initial?.id,
    sku: initial?.sku || "",
    slug: initial?.slug || "",
    name_ar: initial?.name_ar || "",
    name_en: initial?.name_en || "",
    short_desc_ar: initial?.short_desc_ar || "",
    short_desc_en: initial?.short_desc_en || "",
    description_ar: initial?.description_ar || "",
    description_en: initial?.description_en || "",
    category_id: initial?.category_id || categories[0]?.id || "",
    price: initial?.price || 0,
    old_price: initial?.old_price ?? null,
    cost_price: initial?.cost_price ?? null,
    stock_qty: initial?.stock_qty || 0,
    video_url: initial?.video_url || "",
    is_bestseller: initial?.is_bestseller || false,
    is_offer: initial?.is_offer || false,
    is_ready_to_pickup: initial?.is_ready_to_pickup || false,
    is_active: initial?.is_active ?? true,
    seo_title_ar: initial?.seo_title_ar || "",
    seo_title_en: initial?.seo_title_en || "",
    seo_description_ar: initial?.seo_description_ar || "",
    seo_description_en: initial?.seo_description_en || "",
    images: initial?.images || [],
    specs: initial?.specs || [],
    faqs: initial?.faqs || [],
    relatedIds: initial?.relatedIds || [],
    similarIds: initial?.similarIds || [],
    alsoBoughtIds: initial?.alsoBoughtIds || [],
    product_type: initial?.product_type || "simple",
    length_cm: initial?.length_cm ?? null,
    width_cm: initial?.width_cm ?? null,
    height_cm: initial?.height_cm ?? null,
    viewer_count_min: initial?.viewer_count_min ?? null,
    viewer_count_max: initial?.viewer_count_max ?? null,
    shipping_text: initial?.shipping_text || "",
    attributes: initial?.attributes || [],
  });
  const [saving, setSaving] = useState(false);
  const [videoMode, setVideoMode] = useState<"youtube" | "upload">(
    isYoutubeUrl(initial?.video_url) ? "youtube" : initial?.video_url ? "upload" : "youtube"
  );

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProduct(form);
      const returnUrl = sessionStorage.getItem("admin_products_list_url") || "/admin/products";
      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full px-3 py-2 rounded-lg border border-gold/30 text-sm outline-none focus:border-gold";
  const label = "block text-xs font-bold text-charcoal/60 mb-1";
  const sectionTitle = "text-sm font-bold text-charcoal mb-3 pb-2 border-b border-gold/10";

  function updateAttributes(attrs: AttributeInput[]) {
    update("attributes", attrs);
  }

  function addAttribute() {
    updateAttributes([...form.attributes, { name_ar: "", name_en: "", values: [] }]);
  }

  function removeAttribute(i: number) {
    updateAttributes(form.attributes.filter((_, j) => j !== i));
  }

  function updateAttribute(i: number, patch: Partial<AttributeInput>) {
    updateAttributes(form.attributes.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  }

  function addAttributeValue(i: number) {
    const attr = form.attributes[i];
    updateAttribute(i, { values: [...attr.values, { value_ar: "", value_en: "", price_modifier: 0 }] });
  }

  function removeAttributeValue(i: number, vi: number) {
    const attr = form.attributes[i];
    updateAttribute(i, { values: attr.values.filter((_, j) => j !== vi) });
  }

  function updateAttributeValue(i: number, vi: number, patch: Partial<AttributeInput["values"][number]>) {
    const attr = form.attributes[i];
    updateAttribute(i, { values: attr.values.map((v, j) => (j === vi ? { ...v, ...patch } : v)) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <div className="flex overflow-x-auto flex-nowrap gap-1 bg-white rounded-full p-1.5 border border-gold/20 w-fit max-w-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                active ? "bg-gold-gradient text-charcoal shadow" : "text-charcoal/60 hover:bg-white/60"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "basic" && (
        <section className="bg-white rounded-2xl p-6 border border-gold/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={label}>الاسم (عربي)</label><input required className={input} value={form.name_ar} onChange={(e) => update("name_ar", e.target.value)} /></div>
            <div><label className={label}>الاسم (إنجليزي)</label><input required className={input} value={form.name_en} onChange={(e) => update("name_en", e.target.value)} /></div>
            <div><label className={label}>SKU</label><input className={input} value={form.sku} onChange={(e) => update("sku", e.target.value)} /></div>
            <div><label className={label}>Slug</label><input required className={input} value={form.slug} onChange={(e) => update("slug", e.target.value)} /></div>
            <div>
              <label className={label}>التصنيف</label>
              <select className={input} value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>نوع المنتج</label>
              <select className={input} value={form.product_type} onChange={(e) => update("product_type", e.target.value as "simple" | "variable")}>
                <option value="simple">منتج بسيط</option>
                <option value="variable">منتج متعدد (له سمات مثل الألوان)</option>
              </select>
            </div>
            <div><label className={label}>السعر</label><input type="number" required className={input} value={form.price} onChange={(e) => update("price", Number(e.target.value))} /></div>
            <div><label className={label}>السعر قبل الخصم</label><input type="number" className={input} value={form.old_price ?? ""} onChange={(e) => update("old_price", e.target.value ? Number(e.target.value) : null)} /></div>
            <div><label className={label}>سعر التكلفة</label><input type="number" className={input} value={form.cost_price ?? ""} onChange={(e) => update("cost_price", e.target.value ? Number(e.target.value) : null)} /></div>
            <div><label className={label}>الكمية بالمخزون</label><input type="number" required className={input} value={form.stock_qty} onChange={(e) => update("stock_qty", Number(e.target.value))} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gold/10">
            <div className="md:col-span-2"><label className={label}>وصف مختصر (عربي)</label><textarea className={input} value={form.short_desc_ar} onChange={(e) => update("short_desc_ar", e.target.value)} /></div>
            <div className="md:col-span-2"><label className={label}>وصف مختصر (إنجليزي)</label><textarea className={input} value={form.short_desc_en} onChange={(e) => update("short_desc_en", e.target.value)} /></div>
            <div className="md:col-span-2"><label className={label}>الوصف الكامل (عربي)</label><textarea rows={4} className={input} value={form.description_ar} onChange={(e) => update("description_ar", e.target.value)} /></div>
            <div className="md:col-span-2"><label className={label}>الوصف الكامل (إنجليزي)</label><textarea rows={4} className={input} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} /></div>
          </div>

          <div className="pt-2 border-t border-gold/10">
            <h4 className={sectionTitle}>المقاسات</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={label}>الطول (سم)</label><input type="number" className={input} value={form.length_cm ?? ""} onChange={(e) => update("length_cm", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>العرض (سم)</label><input type="number" className={input} value={form.width_cm ?? ""} onChange={(e) => update("width_cm", e.target.value ? Number(e.target.value) : null)} /></div>
              <div><label className={label}>الارتفاع (سم)</label><input type="number" className={input} value={form.height_cm ?? ""} onChange={(e) => update("height_cm", e.target.value ? Number(e.target.value) : null)} /></div>
            </div>
          </div>

          <div className="pt-2 border-t border-gold/10">
            <h4 className={sectionTitle}>فيديو المنتج</h4>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setVideoMode("youtube")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  videoMode === "youtube" ? "bg-gold-gradient text-charcoal" : "bg-ivory text-charcoal/60 border border-gold/20"
                }`}
              >
                <Youtube size={14} /> رابط يوتيوب
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("upload")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  videoMode === "upload" ? "bg-gold-gradient text-charcoal" : "bg-ivory text-charcoal/60 border border-gold/20"
                }`}
              >
                <Upload size={14} /> رفع فيديو من الجهاز
              </button>
            </div>
            {videoMode === "youtube" ? (
              <input
                className={input}
                placeholder="https://youtube.com/watch?v=..."
                value={form.video_url}
                onChange={(e) => update("video_url", e.target.value)}
              />
            ) : (
              <CloudinaryUploader
                resourceType="video"
                previewUrl={form.video_url && !isYoutubeUrl(form.video_url) ? form.video_url : undefined}
                onUploaded={(url) => update("video_url", url)}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-gold/10">
            {[
              ["is_bestseller", "الأكثر مبيعاً"],
              ["is_offer", "عرض خاص"],
              ["is_ready_to_pickup", "جاهز للاستلام"],
              ["is_active", "مفعل"],
            ].map(([key, l]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-bold text-charcoal/70">
                <input type="checkbox" checked={(form as any)[key]} onChange={(e) => update(key as any, e.target.checked as any)} />
                {l}
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-gold/10">
            <label className={label}>نص الشحن</label>
            <input
              className={input}
              placeholder="مدة الشحن من 40 لـ 60 يوم عمل"
              value={form.shipping_text || ""}
              onChange={(e) => update("shipping_text", e.target.value)}
            />
            <p className="text-xs text-charcoal/40 mt-1">سيظهر كبوتن أزرق تحت الوصف القصير. لو فاضي، هيتاخد تلقائياً من الوصف.</p>
          </div>
        </section>
      )}

      {activeTab === "images" && (
        <section className="bg-white rounded-2xl p-6 border border-gold/10">
          <h3 className="font-bold mb-3">معرض الصور</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative border border-gold/20 rounded-lg p-2">
                <img src={img.url} className="w-full h-24 object-cover rounded" />
                <div className="flex justify-between items-center mt-1">
                  <label className="text-xs flex items-center gap-1">
                    <input type="radio" checked={!!img.isPrimary} onChange={() => update("images", form.images.map((im, j) => ({ ...im, isPrimary: j === i })))} />
                    رئيسية
                  </label>
                  <button type="button" onClick={() => update("images", form.images.filter((_, j) => j !== i))} className="text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <CloudinaryUploader
            resourceType="image"
            resetAfterUpload
            onUploaded={(url, publicId) => update("images", [...form.images, { url, publicId, isPrimary: form.images.length === 0 }])}
          />
        </section>
      )}

      {activeTab === "more" && (
        <section className="bg-white rounded-2xl p-6 border border-gold/10 space-y-8">
          <div>
            <h3 className={sectionTitle}>المواصفات</h3>
            <SpecsTableEditor specs={form.specs} onChange={(specs) => update("specs", specs)} />
          </div>

          <div className="pt-6 border-t border-gold/10">
            <h3 className={sectionTitle}>الأسئلة الشائعة</h3>
            <div className="flex justify-end mb-3">
              <button type="button" onClick={() => update("faqs", [...form.faqs, { questionAr: "", questionEn: "", answerAr: "", answerEn: "" }])} className="text-goldDark text-sm font-bold flex items-center gap-1">
                <Plus size={14} /> إضافة
              </button>
            </div>
            {form.faqs.map((f, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 border-b border-gold/10 pb-3">
                <input placeholder="السؤال (عربي)" className={input} value={f.questionAr} onChange={(e) => update("faqs", form.faqs.map((x, j) => j === i ? { ...x, questionAr: e.target.value } : x))} />
                <input placeholder="Question (en)" className={input} value={f.questionEn} onChange={(e) => update("faqs", form.faqs.map((x, j) => j === i ? { ...x, questionEn: e.target.value } : x))} />
                <textarea placeholder="الإجابة (عربي)" className={input} value={f.answerAr} onChange={(e) => update("faqs", form.faqs.map((x, j) => j === i ? { ...x, answerAr: e.target.value } : x))} />
                <textarea placeholder="Answer (en)" className={input} value={f.answerEn} onChange={(e) => update("faqs", form.faqs.map((x, j) => j === i ? { ...x, answerEn: e.target.value } : x))} />
                <button type="button" onClick={() => update("faqs", form.faqs.filter((_, j) => j !== i))} className="text-red-600 text-xs flex items-center gap-1"><Trash2 size={14} /> حذف</button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gold/10">
            <h3 className={sectionTitle}>منتجات مرتبطة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                ["relatedIds", "منتجات مرتبطة"],
                ["similarIds", "منتجات مشابهة"],
                ["alsoBoughtIds", "اشتراها عملاء آخرون"],
              ] as const).map(([key, l]) => (
                <MultiProductPicker
                  key={key}
                  label={l}
                  allProducts={allProducts.filter((p) => p.id !== form.id)}
                  selectedIds={form[key] as string[]}
                  onChange={(ids) => update(key, ids as any)}
                />
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gold/10">
            <h3 className={sectionTitle}>رقم اجتماعي (اختياري)</h3>
            <p className="text-xs text-charcoal/50 mb-3">
              حدد نطاق (أقل - أقصى) لعدد المشاهدين، وسيتم عرض رقم عشوائي مختلف من هذا النطاق لكل زيارة للمنتج. اتركهما فارغين لإخفاء هذا السطر تماماً.
            </p>
            <div className="max-w-md grid grid-cols-2 gap-4">
              <div>
                <label className={label}>أقل عدد</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={form.viewer_count_min ?? ""}
                  onChange={(e) => update("viewer_count_min", e.target.value ? Number(e.target.value) : null)}
                  placeholder="مثال: 50"
                />
              </div>
              <div>
                <label className={label}>أقصى عدد</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={form.viewer_count_max ?? ""}
                  onChange={(e) => update("viewer_count_max", e.target.value ? Number(e.target.value) : null)}
                  placeholder="مثال: 100"
                />
              </div>
            </div>
            {form.viewer_count_min != null && form.viewer_count_max != null && form.viewer_count_min > form.viewer_count_max && (
              <p className="text-xs font-bold text-red-500 mt-2">
                تنبيه: "أقل عدد" أكبر من "أقصى عدد" - برجاء التصحيح.
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-gold/10">
            <h3 className={sectionTitle}>السيو</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={label}>عنوان SEO (عربي)</label><input className={input} value={form.seo_title_ar} onChange={(e) => update("seo_title_ar", e.target.value)} /></div>
              <div><label className={label}>عنوان SEO (إنجليزي)</label><input className={input} value={form.seo_title_en} onChange={(e) => update("seo_title_en", e.target.value)} /></div>
              <div><label className={label}>وصف SEO (عربي)</label><textarea className={input} value={form.seo_description_ar} onChange={(e) => update("seo_description_ar", e.target.value)} /></div>
              <div><label className={label}>وصف SEO (إنجليزي)</label><textarea className={input} value={form.seo_description_en} onChange={(e) => update("seo_description_en", e.target.value)} /></div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "variants" && (
        <section className="bg-white rounded-2xl p-6 border border-gold/10">
          {form.product_type !== "variable" ? (
            <p className="text-sm text-charcoal/60 bg-ivory rounded-lg p-4 border border-gold/20">
              فعّل خيار "منتج متعدد" من تبويب "البيانات الأساسية" أولاً لإضافة سمات لهذا المنتج (مثل الألوان).
            </p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">السمات (مثل: اللون)</h3>
                <button type="button" onClick={addAttribute} className="text-goldDark text-sm font-bold flex items-center gap-1">
                  <Plus size={14} /> إضافة سمة
                </button>
              </div>
              <div className="space-y-5">
                {form.attributes.map((attr, i) => (
                  <div key={i} className="border border-gold/20 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <input placeholder="اسم السمة (عربي) مثل: اللون" className={input} value={attr.name_ar} onChange={(e) => updateAttribute(i, { name_ar: e.target.value })} />
                      <input placeholder="Attribute name (en) e.g. Color" className={input} value={attr.name_en} onChange={(e) => updateAttribute(i, { name_en: e.target.value })} />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-charcoal/70">العناصر</h4>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => addAttributeValue(i)} className="text-goldDark text-xs font-bold flex items-center gap-1">
                          <Plus size={12} /> إضافة عنصر
                        </button>
                        <button type="button" onClick={() => removeAttribute(i)} className="text-red-600 text-xs flex items-center gap-1">
                          <Trash2 size={12} /> حذف السمة
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {attr.values.map((v, vi) => (
                        <div key={vi} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start border-t border-gold/10 pt-3">
                          <input placeholder="القيمة (عربي) مثل: أحمر" className={input} value={v.value_ar} onChange={(e) => updateAttributeValue(i, vi, { value_ar: e.target.value })} />
                          <input placeholder="Value (en) e.g. Red" className={input} value={v.value_en} onChange={(e) => updateAttributeValue(i, vi, { value_en: e.target.value })} />
                          <div>
                            <CloudinaryUploader
                              resourceType="image"
                              label="صورة العنصر"
                              previewUrl={v.image_url || undefined}
                              onUploaded={(url) => updateAttributeValue(i, vi, { image_url: url })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-charcoal/50 block mb-1">فرق السعر (اختياري)</label>
                            <input type="number" className={input} value={v.price_modifier} onChange={(e) => updateAttributeValue(i, vi, { price_modifier: Number(e.target.value) || 0 })} />
                          </div>
                          <button type="button" onClick={() => removeAttributeValue(i, vi)} className="text-red-600 justify-self-start mt-6"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      {attr.values.length === 0 && (
                        <p className="text-xs text-charcoal/40">لا يوجد عناصر بعد.</p>
                      )}
                    </div>
                  </div>
                ))}
                {form.attributes.length === 0 && (
                  <p className="text-sm text-charcoal/40">لا يوجد سمات بعد. اضغط "إضافة سمة" للبدء.</p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <div className="fixed bottom-0 inset-x-0 md:inset-x-auto md:sticky md:bottom-4 flex justify-end p-4 md:p-0">
        <button disabled={saving} className="px-6 py-3 rounded-lg bg-gold-gradient text-white font-bold shadow-xl disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ المنتج"}
        </button>
      </div>
    </form>
  );
}
