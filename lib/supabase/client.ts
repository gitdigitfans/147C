"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vnfvzlahcetcdcjcfewk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZnZ6bGFoY2V0Y2RjamNmZXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjM3NDMsImV4cCI6MjEwMDg5OTc0M30.uqdfXLAA-LSUMWLa0On5BC-V6cEs7cwHGt9XQpWQWpI";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
