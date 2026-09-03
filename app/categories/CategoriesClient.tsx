"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { furnitureImg } from "@/lib/data";
import { getCategoryIcon } from "@/lib/categoryIcons";
import Reveal from "@/components/Reveal";
import { cldUrl } from "@/lib/cloudinaryUrl";

export interface CategoryVM {
  slug: string;
  name: { ar: string; en: string };
  seed: string;
  image?: string;
  iconKey?: string;
  iconUrl?: string;
  count: number;
}

export default function CategoriesClient({ categories }: { categories: CategoryVM[] }) {
  const { t, locale } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("categories_title")}
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {categories.map((c, i) => {
          const Icon = getCategoryIcon(c.iconKey);
          return (
          <Reveal key={c.slug} delay={(i % 6) * 0.06}>
            <Link href={`/shop?category=${c.slug}`}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="group"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={c.image ? cldUrl(c.image, 500) : furnitureImg(c.seed, 600, 450)}
                    alt={c.name[locale]}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-3 rounded-2xl border border-gold/50 pointer-events-none" />
                  <div
                    className="absolute top-0 end-0 w-6 h-6 bg-gold/70 pointer-events-none"
                    style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                  />
                  {/* icon only overlaid on the image - the name is shown once, below the card - icon only shows once the admin assigns one */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {c.iconUrl ? (
                      <img
                        src={cldUrl(c.iconUrl, 100)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 object-contain"
                      />
                    ) : (
                      Icon && <Icon size={56} strokeWidth={1.5} className="text-charcoal/70" />
                    )}
                  </div>
                </div>
                <div className="text-center pt-4">
                  <h3 className="font-playfair font-cairo font-bold text-xl text-charcoal">
                    {c.name[locale]}
                  </h3>
                  <div className="w-10 h-px bg-gold mx-auto my-2" />
                  <p className="text-charcoal/50 text-xs mb-2">
                    {c.count} {t("products_count")}
                  </p>
                  <span className="inline-flex items-center gap-1.5 tracking-wide text-xs font-bold text-goldDark uppercase">
                    {t("explore_cta")}
                    <ArrowRight size={14} className={locale === "ar" ? "rotate-180" : ""} />
                  </span>
                </div>
              </motion.div>
            </Link>
          </Reveal>
          );
        })}
      </div>
    </div>
  );
}
