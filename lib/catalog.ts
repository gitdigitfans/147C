// Shared cached D1 reads used across multiple pages (root layout, homepage,
// shop listing, categories page, product detail). Centralized here instead
// of duplicated per-page so there's exactly one cache entry per query shape,
// and so admin actions only need to revalidateTag one set of tag names.
//
// unstable_cache wraps the D1 Worker-binding call (db.prepare().bind().all()),
// which is not a fetch() and so is never covered by Next's fetch cache no
// matter what route segment config a page sets - without this wrapper these
// queries re-run on every single request, which is what exhausted D1's
// free-tier 5M-rows-read/day quota.
import { unstable_cache } from "next/cache";
import { d1Query } from "@/lib/d1";

export const getSiteSettings = unstable_cache(
  async () => {
    try {
      const rows = await d1Query<{ key: string; value: string }>("SELECT key, value FROM site_settings", []);
      const map: Record<string, string> = {};
      for (const row of rows) map[row.key] = row.value;
      return map;
    } catch {
      return {} as Record<string, string>;
    }
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);

export const getActiveCategories = unstable_cache(
  async () => {
    try {
      return await d1Query<any>("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order", []);
    } catch {
      return [];
    }
  },
  ["active-categories"],
  { revalidate: 60, tags: ["categories"] }
);

export const getCategoryCounts = unstable_cache(
  async () => {
    try {
      return await d1Query<{ category_id: string; count: number }>(
        "SELECT category_id, COUNT(*) as count FROM products WHERE is_active=1 GROUP BY category_id",
        []
      );
    } catch {
      return [];
    }
  },
  ["category-counts"],
  { revalidate: 60, tags: ["products", "categories"] }
);

// Sitemap-only reads - a longer TTL is fine here since search-engine
// freshness doesn't need the same 60s bound as user-facing pages, still
// tagged so an admin save busts it rather than waiting out the full hour.
export const getAllProductSlugsForSitemap = unstable_cache(
  async () => {
    try {
      return await d1Query<{ slug: string; updated_at: string | null; created_at: string | null }>(
        "SELECT slug, updated_at, created_at FROM products WHERE is_active=1",
        []
      );
    } catch {
      return [];
    }
  },
  ["sitemap-product-slugs"],
  { revalidate: 3600, tags: ["products"] }
);

export const getAllPublishedArticleSlugsForSitemap = unstable_cache(
  async () => {
    try {
      return await d1Query<{ slug: string; updated_at: string | null; created_at: string | null }>(
        "SELECT slug, updated_at, created_at FROM articles WHERE is_published=1",
        []
      );
    } catch {
      return [];
    }
  },
  ["sitemap-article-slugs"],
  { revalidate: 3600, tags: ["articles"] }
);
