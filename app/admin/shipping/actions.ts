"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface ShippingRateFormData {
  id?: string;
  governorate_ar: string;
  governorate_en: string;
  price: number;
  is_active: boolean;
  sort_order: number;
}

function revalidateAll() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout");
}

export async function saveShippingRate(data: ShippingRateFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `ship_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO shipping_rates (id, governorate_ar, governorate_en, price, is_active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.governorate_ar, data.governorate_en, data.price, data.is_active ? 1 : 0, data.sort_order ?? 0, now, now]
    );
  } else {
    await d1Execute(
      `UPDATE shipping_rates SET governorate_ar=?, governorate_en=?, price=?, is_active=?, sort_order=?, updated_at=? WHERE id=?`,
      [data.governorate_ar, data.governorate_en, data.price, data.is_active ? 1 : 0, data.sort_order ?? 0, now, data.id]
    );
  }
  revalidateAll();
}

export async function deleteShippingRate(id: string) {
  await d1Execute(`DELETE FROM shipping_rates WHERE id = ?`, [id]);
  revalidateAll();
}
