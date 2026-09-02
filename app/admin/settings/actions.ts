"use server";

import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath, revalidateTag } from "next/cache";

const CORE_KEYS = ["phone", "whatsapp", "email", "site_name_ar", "site_name_en", "currency", "default_locale"];

export async function saveSetting(key: string, value: string) {
  const now = new Date().toISOString();
  const existing = await d1Query<{ key: string }>("SELECT key FROM site_settings WHERE key = ?", [key]);
  if (existing.length > 0) {
    await d1Execute(`UPDATE site_settings SET value = ?, updated_at = ? WHERE key = ?`, [value, now, key]);
  } else {
    await d1Execute(
      `INSERT INTO site_settings (key, value, value_type, group_name, updated_at) VALUES (?, ?, 'string', 'general', ?)`,
      [key, value, now]
    );
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidateTag("site-settings");
}

export async function createSetting(key: string, groupName: string, value: string) {
  const now = new Date().toISOString();
  const cleanKey = key.trim();
  if (!cleanKey) throw new Error("مفتاح الإعداد مطلوب");
  await d1Execute(
    `INSERT OR REPLACE INTO site_settings (key, value, value_type, group_name, updated_at) VALUES (?, ?, 'string', ?, ?)`,
    [cleanKey, value, groupName.trim() || "general", now]
  );
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidateTag("site-settings");
}

export async function deleteSetting(key: string) {
  if (CORE_KEYS.includes(key)) {
    throw new Error("لا يمكن حذف هذا الإعداد الأساسي");
  }
  await d1Execute(`DELETE FROM site_settings WHERE key = ?`, [key]);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidateTag("site-settings");
}
