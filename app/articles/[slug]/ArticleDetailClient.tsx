"use client";

import { useLocale } from "@/lib/i18n";
import { cldUrl } from "@/lib/cloudinaryUrl";
import { onImgError } from "@/lib/imageFallback";
import Reveal from "@/components/Reveal";

export interface ArticleDetailVM {
  id: string;
  title: { ar: string; en: string };
  contentHtml: { ar: string; en: string };
  coverImage?: string;
  author?: string;
  publishedAt?: string;
}

export default function ArticleDetailClient({ article }: { article: ArticleDetailVM }) {
  const { locale } = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-3xl md:text-4xl font-bold text-center mb-4 text-gold-gradient">
          {article.title[locale]}
        </h1>
        {(article.author || article.publishedAt) && (
          <p className="text-center text-charcoal/40 text-sm mb-10">
            {article.author}
            {article.author && article.publishedAt ? " · " : ""}
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US") : ""}
          </p>
        )}
      </Reveal>

      {article.coverImage && (
        <Reveal>
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-ivory">
            <img
              src={cldUrl(article.coverImage, 1200)}
              alt={article.title[locale]}
              onError={onImgError}
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <div className="pdp-description-html text-charcoal/70 leading-relaxed whitespace-pre-line">
          {article.contentHtml[locale]}
        </div>
      </Reveal>
    </div>
  );
}
