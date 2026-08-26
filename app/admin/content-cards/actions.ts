"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface ContentCardFormData {
  id?: string;
  section: "services" | "about_features";
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar?: string;
  desc_en?: string;
  sort_order: number;
  is_active: boolean;
}

function revalidateAll() {
  revalidatePath("/admin/content-cards");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/services");
}

export async function saveContentCard(data: ContentCardFormData) {
  const now = new Date().toISOString();
  const desc_ar = data.section === "about_features" ? null : data.desc_ar || null;
  const desc_en = data.section === "about_features" ? null : data.desc_en || null;
  if (!data.id) {
    const id = `card_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO content_cards (id, section, icon, title_ar, title_en, desc_ar, desc_en, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.section, data.icon, data.title_ar, data.title_en, desc_ar, desc_en, data.sort_order ?? 0, data.is_active ? 1 : 0, now]
    );
  } else {
    await d1Execute(
      `UPDATE content_cards SET section=?, icon=?, title_ar=?, title_en=?, desc_ar=?, desc_en=?, sort_order=?, is_active=? WHERE id=?`,
      [data.section, data.icon, data.title_ar, data.title_en, desc_ar, desc_en, data.sort_order ?? 0, data.is_active ? 1 : 0, data.id]
    );
  }
  revalidateAll();
}

export async function deleteContentCard(id: string) {
  await d1Execute(`DELETE FROM content_cards WHERE id = ?`, [id]);
  revalidateAll();
}
