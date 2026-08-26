"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface BannerFormData {
  id?: string;
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  position: string;
  sort_order: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  media_type?: "image" | "video";
  video_url?: string;
}

function revalidateAll() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function saveBanner(data: BannerFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `ban_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO banners (id, title_ar, title_en, subtitle_ar, subtitle_en, image_url, mobile_image_url, link_url, position, sort_order, starts_at, ends_at, is_active, created_at, media_type, video_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.title_ar, data.title_en, data.subtitle_ar || null, data.subtitle_en || null,
        data.image_url, data.mobile_image_url || null, data.link_url || null, data.position,
        data.sort_order ?? 0, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0, now,
        data.media_type || "image", data.video_url || null,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE banners SET title_ar=?, title_en=?, subtitle_ar=?, subtitle_en=?, image_url=?, mobile_image_url=?, link_url=?, position=?, sort_order=?, starts_at=?, ends_at=?, is_active=?, media_type=?, video_url=? WHERE id=?`,
      [
        data.title_ar, data.title_en, data.subtitle_ar || null, data.subtitle_en || null,
        data.image_url, data.mobile_image_url || null, data.link_url || null, data.position,
        data.sort_order ?? 0, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0,
        data.media_type || "image", data.video_url || null, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteBanner(id: string) {
  await d1Execute(`DELETE FROM banners WHERE id = ?`, [id]);
  revalidateAll();
}
