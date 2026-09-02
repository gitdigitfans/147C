import { notFound } from "next/navigation";
import { d1Query } from "@/lib/d1";
import ArticleDetailClient from "./ArticleDetailClient";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  let rows: any[] = [];
  try {
    rows = await d1Query<any>("SELECT * FROM articles WHERE slug=? AND is_published=1 LIMIT 1", [params.slug]);
  } catch {
    rows = [];
  }

  const row = rows[0];
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
