"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { furnitureImg } from "@/lib/data";
import { getCategoryIcon } from "@/lib/categoryIcons";
import Reveal from "@/components/Reveal";

export interface CategoryVM {
  slug: string;
  name: { ar: string; en: string };
  seed: string;
  image?: string;
  iconKey?: string;
  iconUrl?: string;
  count: number;
}

// Static responsive grid for homepage categories - every category is always
// visible (no slider/pagination). 2 columns on mobile, up to 5 on
// desktop/laptop, with a smooth progression in between. Keeps the
// arched-doorway card visual style (gold inset border, folded-corner accent,
// serif title+underline, explore link).
export default function CategoriesSlider({ categories }: { categories: CategoryVM[] }) {
  const { t, locale } = useLocale();
  const isRtl = locale === "ar";

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {categories.map((c, i) => {
        const Icon = getCategoryIcon(c.iconKey);
        return (
        <Reveal key={c.slug} delay={(i % 10) * 0.05}>
          <Link href={`/shop?category=${c.slug}`}>
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.25 }} className="group">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md">
                <img
                  src={c.image || furnitureImg(c.seed, 600, 450)}
                  alt={c.name[locale]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* always-visible dual-tone (dark → warm copper) gradient so the icon+name stay legible over any photo */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(15,10,8,0.88) 0%, rgba(15,10,8,0.4) 55%, rgba(196,90,40,0.5) 100%)",
                  }}
                />
                <div className="absolute inset-3 rounded-xl border border-gold/50 pointer-events-none" />
                <div
                  className="absolute top-0 end-0 w-6 h-6 bg-gold/70 pointer-events-none"
                  style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                />
                {/* icon + name overlaid directly on the image - icon only shows once the admin assigns one */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-3 text-center pointer-events-none">
                  {c.iconUrl ? (
                    <img
                      src={c.iconUrl}
                      alt=""
                      className="w-14 h-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
                    />
                  ) : (
                    Icon && (
                      <Icon size={56} strokeWidth={1.5} className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]" />
                    )
                  )}
                  <h3 className="font-playfair font-cairo font-extrabold text-xl sm:text-2xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] leading-snug">
                    {c.name[locale]}
                  </h3>
                </div>
              </div>
              <div className="text-center pt-4">
                <h3 className="font-playfair font-cairo font-bold text-xl text-charcoal">{c.name[locale]}</h3>
                <div className="w-10 h-px bg-gold mx-auto my-2" />
                <p className="text-charcoal/50 text-xs mb-2">
                  {c.count} {t("products_count")}
                </p>
                <span className="inline-flex items-center gap-1.5 tracking-wide text-xs font-bold text-goldDark uppercase">
                  {t("explore_cta")}
                  <ArrowRight size={14} className={isRtl ? "rotate-180" : ""} />
                </span>
              </div>
            </motion.div>
          </Link>
        </Reveal>
        );
      })}
    </div>
  );
}
