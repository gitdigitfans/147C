"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath, revalidateTag } from "next/cache";

export interface CategoryFormData {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  icon_key?: string | null;
  icon_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_description_ar?: string;
  seo_description_en?: string;
}

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidateTag("categories");
}

export async function saveCategory(data: CategoryFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `cat_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO categories (id, slug, name_ar, name_en, description_ar, description_en, image_url, icon_key, icon_url, parent_id, sort_order, is_active, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.slug, data.name_ar, data.name_en, data.description_ar || null, data.description_en || null,
        data.image_url || null, data.icon_key || null, data.icon_url || null, data.parent_id || null, data.sort_order ?? 0, data.is_active ? 1 : 0,
        data.seo_title_ar || null, data.seo_title_en || null, data.seo_description_ar || null, data.seo_description_en || null,
        now, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE categories SET slug=?, name_ar=?, name_en=?, description_ar=?, description_en=?, image_url=?, icon_key=?, icon_url=?, parent_id=?, sort_order=?, is_active=?, seo_title_ar=?, seo_title_en=?, seo_description_ar=?, seo_description_en=?, updated_at=? WHERE id=?`,
      [
        data.slug, data.name_ar, data.name_en, data.description_ar || null, data.description_en || null,
        data.image_url || null, data.icon_key || null, data.icon_url || null, data.parent_id || null, data.sort_order ?? 0, data.is_active ? 1 : 0,
        data.seo_title_ar || null, data.seo_title_en || null, data.seo_description_ar || null, data.seo_description_en || null,
        now, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteCategory(id: string) {
  await d1Execute(`DELETE FROM categories WHERE id = ?`, [id]);
  revalidateAll();
}
