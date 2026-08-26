"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute } from "@/lib/d1";
import { revalidatePath } from "next/cache";

export interface ArticleFormData {
  id?: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  content_ar?: string;
  content_en?: string;
  cover_image?: string;
  author?: string;
  is_published: boolean;
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_description_ar?: string;
  seo_description_en?: string;
}

function revalidateAll() {
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}

export async function saveArticle(data: ArticleFormData) {
  const now = new Date().toISOString();
  if (!data.id) {
    const id = `art_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO articles (id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, cover_image, author, is_published, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.slug, data.title_ar, data.title_en, data.excerpt_ar || null, data.excerpt_en || null,
        data.content_ar || null, data.content_en || null, data.cover_image || null, data.author || null,
        data.is_published ? 1 : 0, data.seo_title_ar || null, data.seo_title_en || null,
        data.seo_description_ar || null, data.seo_description_en || null,
        data.is_published ? now : null, now, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE articles SET slug=?, title_ar=?, title_en=?, excerpt_ar=?, excerpt_en=?, content_ar=?, content_en=?, cover_image=?, author=?, is_published=?, seo_title_ar=?, seo_title_en=?, seo_description_ar=?, seo_description_en=?, updated_at=? WHERE id=?`,
      [
        data.slug, data.title_ar, data.title_en, data.excerpt_ar || null, data.excerpt_en || null,
        data.content_ar || null, data.content_en || null, data.cover_image || null, data.author || null,
        data.is_published ? 1 : 0, data.seo_title_ar || null, data.seo_title_en || null,
        data.seo_description_ar || null, data.seo_description_en || null,
        now, data.id,
      ]
    );
  }
  revalidateAll();
}

export async function deleteArticle(id: string) {
  await d1Execute(`DELETE FROM articles WHERE id = ?`, [id]);
  revalidateAll();
}
