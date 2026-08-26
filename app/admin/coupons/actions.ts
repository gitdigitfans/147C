"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface CouponFormData {
  id?: string;
  code: string;
  description_ar?: string;
  description_en?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
}

function revalidateAll() {
  revalidatePath("/admin/coupons");
}

export async function saveCoupon(data: CouponFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `cpn_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO coupons (id, code, description_ar, description_en, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_limit_per_user, used_count, starts_at, ends_at, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.code, data.description_ar || null, data.description_en || null, data.discount_type, data.discount_value,
        data.min_order_amount ?? null, data.max_discount_amount ?? null, data.usage_limit ?? null,
        data.usage_limit_per_user ?? null, 0, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE coupons SET code=?, description_ar=?, description_en=?, discount_type=?, discount_value=?, min_order_amount=?, max_discount_amount=?, usage_limit=?, usage_limit_per_user=?, starts_at=?, ends_at=?, is_active=? WHERE id=?`,
      [
        data.code, data.description_ar || null, data.description_en || null, data.discount_type, data.discount_value,
        data.min_order_amount ?? null, data.max_discount_amount ?? null, data.usage_limit ?? null,
        data.usage_limit_per_user ?? null, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteCoupon(id: string) {
  await d1Execute(`DELETE FROM coupons WHERE id = ?`, [id]);
  revalidateAll();
}
