import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { d1Query } from "@/lib/d1";
import { buildMetadata } from "@/lib/seo";
import { cldOgUrl } from "@/lib/cloudinaryUrl";
import ArticleDetailClient from "./ArticleDetailClient";

export const dynamic = "force-dynamic";

// Was a raw, uncached d1Query - wrapping it here so adding generateMetadata
// below (which needs the same row) doesn't double the D1 reads per article
// view, matching the pattern already used for products in
// app/shop/[slug]/page.tsx.
const fetchArticleBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await d1Query<any>("SELECT * FROM articles WHERE slug=? AND is_published=1 LIMIT 1", [slug]).catch(
      () => []
    );
    return rows[0] || null;
  },
  ["article-by-slug"],
  { revalidate: 60, tags: ["articles"] }
);

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const row = await fetchArticleBySlug(params.slug);
  if (!row) {
    return buildMetadata({
      title: "مقال غير موجود",
      description: "هذا المقال لم يعد متوفرًا. تصفح مقالاتنا الأخرى عن الأثاث والديكور.",
      path: `/articles/${params.slug}`,
    });
  }

  const rawDescription = row.seo_description_ar || row.excerpt_ar || "";
  const description =
    rawDescription.length > 157 ? `${rawDescription.slice(0, 157)}...` : rawDescription || row.title_ar;

  return buildMetadata({
    title: row.seo_title_ar || row.title_ar,
    description,
    path: `/articles/${params.slug}`,
    image: row.cover_image ? cldOgUrl(row.cover_image) : undefined,
    type: "article",
  });
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const row = await fetchArticleBySlug(params.slug);
  if (!row) notFound();

  const article = {
    id: row.id,
    title: { ar: row.title_ar, en: row.title_en },
    contentHtml: { ar: row.content_ar || "", en: row.content_en || "" },
    coverImage: row.cover_image || undefined,
    author: row.author || undefined,
    publishedAt: row.published_at || undefined,
  };

  return <ArticleDetailClient article={article} />;
}
