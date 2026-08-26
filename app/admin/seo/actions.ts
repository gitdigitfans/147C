"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface SeoFormData {
  id?: string;
  scope: string;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  keywords_ar?: string;
  keywords_en?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
}

function revalidateAll() {
  revalidatePath("/admin/seo");
  revalidatePath("/");
}

export async function saveSeo(data: SeoFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `seo_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO seo_settings (id, scope, title_ar, title_en, description_ar, description_en, keywords_ar, keywords_en, og_image, canonical_url, robots, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.scope, data.title_ar || null, data.title_en || null, data.description_ar || null, data.description_en || null,
        data.keywords_ar || null, data.keywords_en || null, data.og_image || null, data.canonical_url || null,
        data.robots || null, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE seo_settings SET scope=?, title_ar=?, title_en=?, description_ar=?, description_en=?, keywords_ar=?, keywords_en=?, og_image=?, canonical_url=?, robots=?, updated_at=? WHERE id=?`,
      [
        data.scope, data.title_ar || null, data.title_en || null, data.description_ar || null, data.description_en || null,
        data.keywords_ar || null, data.keywords_en || null, data.og_image || null, data.canonical_url || null,
        data.robots || null, now, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteSeo(id: string) {
  await d1Execute(`DELETE FROM seo_settings WHERE id = ?`, [id]);
  revalidateAll();
}
