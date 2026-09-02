"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";

// `source` distinguishes which form the submission came from so the admin
// inbox (/admin/contact-submissions) can show a readable badge per row
// instead of every row looking identical - see ConsultationClient.tsx for
// the "consultation" source.
export async function submitContactForm(data: Record<string, string>, source: string = "contact_form") {
  const id = `csub_${randomUUID()}`;
  const now = new Date().toISOString();
  await d1Execute(
    `INSERT INTO contact_submissions (id, data, status, created_at) VALUES (?, ?, ?, ?)`,
    [id, JSON.stringify({ __source: source, ...data }), "new", now]
  );
}
