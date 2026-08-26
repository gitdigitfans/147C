"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface BranchFormData {
  id?: string;
  name_ar: string;
  name_en: string;
  address_ar?: string;
  address_en?: string;
  governorate?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  lat?: number | null;
  lng?: number | null;
  working_hours_ar?: string;
  working_hours_en?: string;
  is_active: boolean;
  sort_order: number;
}

function revalidateAll() {
  revalidatePath("/admin/branches");
  revalidatePath("/branches");
  revalidatePath("/");
}

export async function saveBranch(data: BranchFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `br_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO branches (id, name_ar, name_en, address_ar, address_en, governorate, phone, whatsapp, email, lat, lng, working_hours_ar, working_hours_en, is_active, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name_ar, data.name_en, data.address_ar || null, data.address_en || null, data.governorate || null,
        data.phone || null, data.whatsapp || null, data.email || null, data.lat ?? null, data.lng ?? null,
        data.working_hours_ar || null, data.working_hours_en || null, data.is_active ? 1 : 0, data.sort_order ?? 0, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE branches SET name_ar=?, name_en=?, address_ar=?, address_en=?, governorate=?, phone=?, whatsapp=?, email=?, lat=?, lng=?, working_hours_ar=?, working_hours_en=?, is_active=?, sort_order=? WHERE id=?`,
      [
        data.name_ar, data.name_en, data.address_ar || null, data.address_en || null, data.governorate || null,
        data.phone || null, data.whatsapp || null, data.email || null, data.lat ?? null, data.lng ?? null,
        data.working_hours_ar || null, data.working_hours_en || null, data.is_active ? 1 : 0, data.sort_order ?? 0, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteBranch(id: string) {
  await d1Execute(`DELETE FROM branches WHERE id = ?`, [id]);
  revalidateAll();
}
