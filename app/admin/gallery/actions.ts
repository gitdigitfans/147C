"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface GallerySlideFormData {
  id?: string;
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  image_url: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}

function revalidateAll() {
  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function saveGallerySlide(data: GallerySlideFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `gal_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO gallery_slides (id, image_url, title_ar, title_en, subtitle_ar, subtitle_en, link_url, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.image_url, data.title_ar, data.title_en, data.subtitle_ar || null, data.subtitle_en || null,
        data.link_url || null, data.sort_order ?? 0, data.is_active ? 1 : 0, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE gallery_slides SET image_url=?, title_ar=?, title_en=?, subtitle_ar=?, subtitle_en=?, link_url=?, sort_order=?, is_active=? WHERE id=?`,
      [
        data.image_url, data.title_ar, data.title_en, data.subtitle_ar || null, data.subtitle_en || null,
        data.link_url || null, data.sort_order ?? 0, data.is_active ? 1 : 0, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteGallerySlide(id: string) {
  await d1Execute(`DELETE FROM gallery_slides WHERE id = ?`, [id]);
  revalidateAll();
}
