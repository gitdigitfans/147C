"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface ContactFieldFormData {
  id?: string;
  field_key: string;
  label_ar: string;
  label_en: string;
  field_type: "text" | "email" | "phone" | "textarea";
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
}

function revalidateAll() {
  revalidatePath("/admin/contact-fields");
  revalidatePath("/contact");
}

export async function saveContactField(data: ContactFieldFormData) {
  const key = data.field_key.trim().toLowerCase().replace(/\s+/g, "_");
  if (!data.id) {
    const id = `cf_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO contact_form_fields (id, field_key, label_ar, label_en, field_type, is_required, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, key, data.label_ar, data.label_en || null, data.field_type, data.is_required ? 1 : 0, data.sort_order ?? 0, data.is_active ? 1 : 0]
    );
  } else {
    await d1Execute(
      `UPDATE contact_form_fields SET field_key=?, label_ar=?, label_en=?, field_type=?, is_required=?, sort_order=?, is_active=? WHERE id=?`,
      [key, data.label_ar, data.label_en || null, data.field_type, data.is_required ? 1 : 0, data.sort_order ?? 0, data.is_active ? 1 : 0, data.id]
    );
  }
  revalidateAll();
}

export async function deleteContactField(id: string) {
  await d1Execute(`DELETE FROM contact_form_fields WHERE id = ?`, [id]);
  revalidateAll();
}
