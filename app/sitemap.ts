import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllProductSlugsForSitemap, getAllPublishedArticleSlugsForSitemap } from "@/lib/catalog";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/shop", priority: 0.8, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.8, changeFrequency: "weekly" },
  { path: "/offers", priority: 0.8, changeFrequency: "daily" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/consultation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/articles", priority: 0.8, changeFrequency: "weekly" },
  { path: "/exchange-policy", priority: 0.8, changeFrequency: "yearly" },
  { path: "/return-policy", priority: 0.8, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.8, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    getAllProductSlugsForSitemap(),
    getAllPublishedArticleSlugsForSitemap(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at || a.created_at || Date.now()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...articleEntries];
}
