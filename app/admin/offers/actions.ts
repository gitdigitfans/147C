"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath, revalidateTag } from "next/cache";

export interface OfferFormData {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number | null;
  category_id?: string | null;
  product_id?: string | null;
  code?: string | null;
  productIds?: string[];
  banner_image?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active: boolean;
  show_in_topbar?: boolean;
  show_as_popup?: boolean;
}

function revalidateAll() {
  revalidatePath("/admin/offers");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/offers");
  revalidatePath("/checkout");
  revalidateTag("offers");
}

export async function saveOffer(data: OfferFormData) {
  const now = new Date().toISOString();
  // Free shipping offers don't carry a numeric discount value.
  const discountValue = data.discount_type === "free_shipping" ? 0 : data.discount_value;
  let offerId = data.id;
  if (!offerId) {
    offerId = `off_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO offers (id, title_ar, title_en, description_ar, description_en, discount_type, discount_value, max_discount_amount, min_order_amount, category_id, product_id, code, banner_image, starts_at, ends_at, is_active, show_in_topbar, show_as_popup, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        offerId, data.title_ar, data.title_en, data.description_ar || null, data.description_en || null,
        data.discount_type, discountValue, data.max_discount_amount || null, data.min_order_amount || null,
        data.category_id || null, data.product_id || null, data.code || null,
        data.banner_image || null, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0,
        data.show_in_topbar ? 1 : 0, data.show_as_popup ? 1 : 0, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE offers SET title_ar=?, title_en=?, description_ar=?, description_en=?, discount_type=?, discount_value=?, max_discount_amount=?, min_order_amount=?, category_id=?, product_id=?, code=?, banner_image=?, starts_at=?, ends_at=?, is_active=?, show_in_topbar=?, show_as_popup=? WHERE id=?`,
      [
        data.title_ar, data.title_en, data.description_ar || null, data.description_en || null,
        data.discount_type, discountValue, data.max_discount_amount || null, data.min_order_amount || null,
        data.category_id || null, data.product_id || null, data.code || null,
        data.banner_image || null, data.starts_at || null, data.ends_at || null, data.is_active ? 1 : 0,
        data.show_in_topbar ? 1 : 0, data.show_as_popup ? 1 : 0, offerId,
      ]
    );
  }

  await d1Execute(`DELETE FROM offer_products WHERE offer_id = ?`, [offerId]);
  const productIds = data.productIds || [];
  for (const pid of productIds) {
    await d1Execute(
      `INSERT INTO offer_products (id, offer_id, product_id) VALUES (?, ?, ?)`,
      [`offp_${randomUUID()}`, offerId, pid]
    );
  }

  revalidateAll();
}

export async function deleteOffer(id: string) {
  await d1Execute(`DELETE FROM offers WHERE id = ?`, [id]);
  revalidateAll();
}
