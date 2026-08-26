"use server";

import { d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export async function updateSubmissionStatus(id: string, status: "new" | "read" | "archived") {
  await d1Execute(`UPDATE contact_submissions SET status=? WHERE id=?`, [status, id]);
  revalidatePath("/admin/contact-submissions");
}

export async function deleteSubmission(id: string) {
  await d1Execute(`DELETE FROM contact_submissions WHERE id = ?`, [id]);
  revalidatePath("/admin/contact-submissions");
}
