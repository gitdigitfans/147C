"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) throw error;

  await supabase.from("order_status_history").insert({ order_id: orderId, status, note: note ?? null, changed_by: user?.id ?? null });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePaymentStatus(orderId: string, payment_status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ payment_status, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
