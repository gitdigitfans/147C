"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateRequestStatus(id: string, status: "new" | "contacted" | "closed") {
  const supabase = createClient();
  const { error } = await supabase.from("product_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/requests");
}

export async function deleteRequest(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("product_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/requests");
}
