"use client";

import Link from "next/link";
import { Newspaper } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { cldUrl } from "@/lib/cloudinaryUrl";
import { onImgError } from "@/lib/imageFallback";
import Reveal from "@/components/Reveal";

export interface ArticleListItem {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  coverImage?: string;
  author?: string;
  publishedAt?: string;
}

export default function ArticlesClient({ articles }: { articles: ArticleListItem[] }) {
  const { t, locale } = useLocale();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("nav_articles")}
        </h1>
      </Reveal>

      {articles.length === 0 ? (
        <Reveal>
          <div className="text-center py-20 text-charcoal/40">
            <Newspaper size={40} className="mx-auto mb-3" />
            <p>{locale === "ar" ? "لا توجد مقالات بعد" : "No articles yet"}</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={(i % 6) * 0.05}>
              <Link
                href={`/articles/${a.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-gold/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/10] overflow-hidden bg-ivory">
                  {a.coverImage && (
                    <img
                      src={cldUrl(a.coverImage, 500)}
                      alt={a.title[locale]}
                      onError={onImgError}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-cairo font-bold text-charcoal mb-2 leading-snug line-clamp-2 group-hover:text-goldDark transition-colors">
                    {a.title[locale]}
                  </h2>
                  {a.excerpt[locale] && (
                    <p className="text-sm text-charcoal/60 line-clamp-2">{a.excerpt[locale]}</p>
                  )}
                  {(a.author || a.publishedAt) && (
                    <p className="text-xs text-charcoal/40 mt-3">
                      {a.author}
                      {a.author && a.publishedAt ? " · " : ""}
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US") : ""}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
