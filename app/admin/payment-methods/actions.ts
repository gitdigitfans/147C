"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface PaymentMethodFormData {
  id?: string;
  type: "bank" | "wallet" | "instapay" | "cod";
  label_ar: string;
  label_en: string;
  account_name?: string;
  account_number?: string;
  instructions_ar?: string;
  instructions_en?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

function revalidateAll() {
  revalidatePath("/admin/payment-methods");
  revalidatePath("/checkout");
}

export async function savePaymentMethod(data: PaymentMethodFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `pm_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO payment_methods (id, type, label_ar, label_en, account_name, account_number, instructions_ar, instructions_en, image_url, is_active, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.type, data.label_ar, data.label_en, data.account_name || null, data.account_number || null,
        data.instructions_ar || null, data.instructions_en || null, data.image_url || null,
        data.is_active ? 1 : 0, data.sort_order ?? 0, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE payment_methods SET type=?, label_ar=?, label_en=?, account_name=?, account_number=?, instructions_ar=?, instructions_en=?, image_url=?, is_active=?, sort_order=? WHERE id=?`,
      [
        data.type, data.label_ar, data.label_en, data.account_name || null, data.account_number || null,
        data.instructions_ar || null, data.instructions_en || null, data.image_url || null,
        data.is_active ? 1 : 0, data.sort_order ?? 0, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deletePaymentMethod(id: string, type: string) {
  if (type === "cod") {
    throw new Error("لا يمكن حذف طريقة الدفع عند الاستلام");
  }
  await d1Execute(`DELETE FROM payment_methods WHERE id = ?`, [id]);
  revalidateAll();
}
