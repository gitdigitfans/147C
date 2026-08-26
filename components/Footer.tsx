"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { categories } from "@/lib/data";

// lucide-react dropped brand icons like Pinterest, so we ship a small
// matching-style (24x24 stroke-free) inline SVG for it.
function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.017 0C5.396 0 0 5.396 0 12.017c0 5.086 3.163 9.43 7.627 11.18-.105-.949-.2-2.406.042-3.443.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.03-.655 2.567-.994 3.992-.283 1.194.598 2.169 1.775 2.169 2.129 0 3.768-2.245 3.768-5.487 0-2.868-2.061-4.874-5.004-4.874-3.41 0-5.41 2.559-5.41 5.202 0 1.031.397 2.137.893 2.738a.36.36 0 0 1 .083.345c-.09.377-.293 1.194-.332 1.361-.052.218-.174.264-.4.16-1.492-.694-2.424-2.878-2.424-4.633 0-3.776 2.742-7.245 7.907-7.245 4.15 0 7.377 2.958 7.377 6.913 0 4.126-2.601 7.446-6.214 7.446-1.213 0-2.354-.63-2.744-1.375l-.746 2.845c-.27 1.038-1 2.34-1.489 3.135 1.121.347 2.31.534 3.545.534 6.621 0 12.017-5.396 12.017-12.017C24.034 5.396 18.638 0 12.017 0z" />
    </svg>
  );
}

const DEFAULT_SOCIAL_URLS = {
  facebook_url: "https://www.facebook.com/share/1CwRaimBaN/?mibextid=wwXIfr",
  instagram_url: "https://www.instagram.com/pharaohfurnituree?igsh=NHBreXFpd3ZtN2J6&utm_source=qr",
  tiktok_url: "https://www.tiktok.com/@pharaohfurnituree?_r=1&_t=ZS-98PZmqnXPi0",
  youtube_url: "https://www.youtube.com/@PharaohFurnitureAllam",
  pinterest_url: "https://pin.it/2Q6MXTbaS",
};

const navKeys: { key: string; href: string }[] = [
  { key: "nav_home", href: "/" },
  { key: "nav_shop", href: "/shop" },
  { key: "nav_categories", href: "/categories" },
  { key: "nav_about", href: "/about" },
  { key: "nav_services", href: "/services" },
  { key: "nav_contact", href: "/contact" },
];

export interface FooterSettings {
  site_name_ar?: string;
  site_name_en?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  pinterest_url?: string;
}

export interface FooterCategory {
  slug: string;
  name_ar: string;
  name_en: string;
}

interface FooterProps {
  settings?: FooterSettings;
  categories?: FooterCategory[];
}

export default function Footer({ settings, categories: dbCategories }: FooterProps) {
  const { t, locale } = useLocale();

  const socials = [
    { icon: Facebook, href: settings?.facebook_url || DEFAULT_SOCIAL_URLS.facebook_url, label: "Facebook" },
    { icon: Instagram, href: settings?.instagram_url || DEFAULT_SOCIAL_URLS.instagram_url, label: "Instagram" },
    { icon: Music2, href: settings?.tiktok_url || DEFAULT_SOCIAL_URLS.tiktok_url, label: "TikTok" },
    { icon: Youtube, href: settings?.youtube_url || DEFAULT_SOCIAL_URLS.youtube_url, label: "YouTube" },
    { icon: PinterestIcon, href: settings?.pinterest_url || DEFAULT_SOCIAL_URLS.pinterest_url, label: "Pinterest" },
  ];

  const brandName = (locale === "ar" ? settings?.site_name_ar : settings?.site_name_en) || t("brand");

  const allFooterCategories =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c) => ({ slug: c.slug, name: { ar: c.name_ar, en: c.name_en } }))
      : categories;
  const FOOTER_CATEGORIES_LIMIT = 6;
  const footerCategories = allFooterCategories.slice(0, FOOTER_CATEGORIES_LIMIT);
  const hasMoreCategories = allFooterCategories.length > FOOTER_CATEGORIES_LIMIT;

  return (
    <footer className="bg-charcoal text-ivory pt-16 pb-6 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt={brandName} className="w-12 h-12 rounded-full object-cover bg-bronze-gradient" />
            <h3 className="font-playfair font-cairo text-xl font-bold text-gold">{brandName}</h3>
          </div>
          <p className="text-sm text-ivory/70 leading-relaxed">{t("footer_about")}</p>
          <div className="flex gap-3 mt-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-cairo font-bold text-gold mb-4">{t("quick_links")}</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            {navKeys.map((n) => (
              <li key={n.key}>
                <Link href={n.href} className="hover:text-gold transition-colors">
                  {t(n.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-cairo font-bold text-gold mb-4">{t("our_categories")}</h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            {footerCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="hover:text-gold transition-colors">
                  {c.name[locale]}
                </Link>
              </li>
            ))}
            {hasMoreCategories && (
              <li>
                <Link href="/categories" className="hover:text-gold transition-colors font-bold text-gold/80">
                  {locale === "ar" ? "عرض كل التصنيفات" : "View all categories"}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-cairo font-bold text-gold mb-4">{t("newsletter_title")}</h4>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder={t("newsletter_placeholder")}
              className="px-4 py-2 rounded-md bg-white/10 text-ivory placeholder:text-ivory/40 outline-none focus:ring-2 focus:ring-gold text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-gold-gradient text-charcoal font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {t("newsletter_btn")}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-white/10 text-center text-xs text-ivory/50 space-y-1.5">
        <div>{t("copyright")}</div>
        <div>
          {locale === "ar" ? "تم التصميم بواسطة " : "Designed by "}
          <a
            href="https://digitfans.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-goldDark font-bold transition-colors"
          >
            Digit Fans
          </a>{" "}
          2026
        </div>
      </div>
    </footer>
  );
}
