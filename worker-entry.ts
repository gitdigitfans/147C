// Thin wrapper around the OpenNext-generated Cloudflare Worker.
//
// wrangler's `main` points here instead of directly at `.open-next/worker.js`
// so we can attach a `scheduled()` handler (Cron Trigger) without touching
// the build-generated file, which gets overwritten on every
// `opennextjs-cloudflare build`.
//
// The cron just does a tiny read against the Supabase REST API every few
// days so the Supabase project's usage-based pause (for inactive free-tier
// projects) never kicks in.

// @ts-expect-error: resolved by wrangler's bundler at build time
import openNextWorker from "./.open-next/worker.js";

// Re-export the Durable Object classes the generated worker relies on
// (tag cache, queue, bucket cache purge) - wrangler.toml doesn't currently
// bind any of these, but re-exporting keeps this a drop-in replacement for
// the original entry file if that ever changes.
// @ts-expect-error: resolved by wrangler's bundler at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  [key: string]: unknown;
}

export default {
  // All normal HTTP traffic still goes straight through to the Next.js
  // worker OpenNext generated - unchanged behavior.
  fetch: openNextWorker.fetch,

  // Runs on the Cron Trigger schedule defined in wrangler.toml's
  // [triggers] block (currently every 3 days).
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(pingSupabase(env));
  },
} satisfies ExportedHandler<Env>;

async function pingSupabase(env: Env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[cron] Missing SUPABASE_URL or SUPABASE_ANON_KEY - skipping keep-alive ping.");
    return;
  }

  try {
    // Any cheap, real read works - this just needs to touch the database so
    // Supabase sees activity. `reviews` is a small existing table.
    const res = await fetch(`${supabaseUrl}/rest/v1/reviews?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    console.log(`[cron] Supabase keep-alive ping responded with ${res.status}`);
  } catch (err) {
    console.error("[cron] Supabase keep-alive ping failed:", err);
  }
}
