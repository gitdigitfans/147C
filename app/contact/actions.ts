"use server";

import { randomUUID } from "crypto";
import { d1Execute } from "@/lib/d1";

export async function submitContactForm(data: Record<string, string>) {
  const id = `csub_${randomUUID()}`;
  const now = new Date().toISOString();
  await d1Execute(
    `INSERT INTO contact_submissions (id, data, status, created_at) VALUES (?, ?, ?, ?)`,
    [id, JSON.stringify(data), "new", now]
  );
}
