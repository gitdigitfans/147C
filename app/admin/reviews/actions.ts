"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateReviewStatus(reviewId: string, status: "approved" | "rejected") {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  try {
    revalidatePath("/shop", "layout");
  } catch {
    // revalidatePath with a "layout" type may not be supported in every Next.js
    // version - product detail pages are already force-dynamic so this is optional.
  }
}

export async function deleteReview(reviewId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  try {
    revalidatePath("/shop", "layout");
  } catch {
    // see note above
  }
}
