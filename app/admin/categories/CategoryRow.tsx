"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import CategoryFormModal from "./CategoryFormModal";
import { deleteCategory } from "./actions";

export default function CategoryRow({ category, allCategories }: { category: any; allCategories: any[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-gold/5 last:border-0">
      <td className="p-3">
        {category.image_url ? <img src={category.image_url} className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-gold/10 rounded-lg" />}
      </td>
      <td className="p-3 font-bold">{category.name_ar}</td>
      <td className="p-3 text-charcoal/60">{category.slug}</td>
      <td className="p-3">{category.sort_order}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${category.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {category.is_active ? "مفعل" : "معطل"}
        </span>
      </td>
      <td className="p-3 flex gap-3 items-center">
        <CategoryFormModal categories={allCategories} initial={{
          id: category.id, slug: category.slug, name_ar: category.name_ar, name_en: category.name_en,
          description_ar: category.description_ar, description_en: category.description_en, image_url: category.image_url,
          icon_key: category.icon_key, icon_url: category.icon_url,
          parent_id: category.parent_id, sort_order: category.sort_order, is_active: !!category.is_active,
          seo_title_ar: category.seo_title_ar, seo_title_en: category.seo_title_en,
          seo_description_ar: category.seo_description_ar, seo_description_en: category.seo_description_en,
        }} trigger={<Pencil size={14} />} />
        <button
          disabled={pending}
          onClick={() => { if (confirm(`حذف "${category.name_ar}"؟`)) startTransition(() => deleteCategory(category.id)); }}
          className="text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
