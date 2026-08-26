// Cloudflare D1 access. Uses the native D1 binding (DB) exposed by the
// OpenNext Cloudflare adapter when running on a Worker, and falls back to
// the HTTP API (which requires CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN).

import { getCloudflareContext } from "@opennextjs/cloudflare";

const D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || "d4b3b08f-fe54-4cff-a0e6-a38d767748c4";

interface D1QueryResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: { results: T[]; success: boolean; meta?: Record<string, unknown> }[];
}

export async function d1Query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const db = (getCloudflareContext().env as any).DB;
    if (db) {
      const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
      const res = await stmt.all();
      return res.results ?? [];
    }
  } catch {
    // Not running inside a Cloudflare Worker - fall back to the HTTP API below.
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variables. " +
        "Set them in .env.local (see .env.local.example) - create an API token with D1 Edit permission " +
        "from the Cloudflare dashboard and find your Account ID on the dashboard's right sidebar."
    );
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${D1_DATABASE_ID}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
    // Never let Next.js's fetch cache serve a stale (e.g. empty) result for
    // admin/catalog data - every call must hit D1 fresh.
    cache: "no-store",
  });

  const json = (await res.json()) as D1QueryResponse<T>;

  if (!res.ok || !json.success) {
    const message = json.errors?.map((e) => e.message).join("; ") || `D1 query failed (${res.status})`;
    throw new Error(message);
  }

  return json.result?.[0]?.results ?? [];
}

// Convenience helper for INSERT/UPDATE/DELETE that don't need rows back.
export async function d1Execute(sql: string, params: any[] = []): Promise<void> {
  await d1Query(sql, params);
}

export interface D1BatchStatement {
  sql: string;
  params?: any[];
}

// Runs multiple statements in a single D1 batch instead of one sequential
// round trip per statement - a product with many images/specs/relations
// previously issued dozens of awaited d1Execute calls in a row, which could
// exceed the Worker's request time budget and crash the save action.
export async function d1Batch(statements: D1BatchStatement[]): Promise<void> {
  if (statements.length === 0) return;

  try {
    const db = (getCloudflareContext().env as any).DB;
    if (db) {
      const prepared = statements.map((s) =>
        s.params && s.params.length > 0 ? db.prepare(s.sql).bind(...s.params) : db.prepare(s.sql)
      );
      await db.batch(prepared);
      return;
    }
  } catch {
    // Not running inside a Cloudflare Worker - fall back to the HTTP API below.
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variables. " +
        "Set them in .env.local (see .env.local.example) - create an API token with D1 Edit permission " +
        "from the Cloudflare dashboard and find your Account ID on the dashboard's right sidebar."
    );
  }

  for (const s of statements) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${D1_DATABASE_ID}/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: s.sql, params: s.params ?? [] }),
      cache: "no-store",
    });
    const json = (await res.json()) as D1QueryResponse<unknown>;
    if (!res.ok || !json.success) {
      const message = json.errors?.map((e) => e.message).join("; ") || `D1 query failed (${res.status})`;
      throw new Error(message);
    }
  }
}
