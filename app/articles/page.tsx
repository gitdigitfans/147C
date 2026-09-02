import { d1Query } from "@/lib/d1";
import ArticlesClient, { ArticleListItem } from "./ArticlesClient";

export const dynamic = "force-dynamic";

async function fetchArticles(): Promise<ArticleListItem[]> {
  try {
    const rows = await d1Query<any>(
      "SELECT id, slug, title_ar, title_en, excerpt_ar, excerpt_en, cover_image, author, published_at FROM articles WHERE is_published=1 ORDER BY published_at DESC",
      []
    );
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: { ar: r.title_ar, en: r.title_en },
      excerpt: { ar: r.excerpt_ar || "", en: r.excerpt_en || "" },
      coverImage: r.cover_image || undefined,
      author: r.author || undefined,
      publishedAt: r.published_at || undefined,
    }));
  } catch {
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await fetchArticles();
  return <ArticlesClient articles={articles} />;
}
