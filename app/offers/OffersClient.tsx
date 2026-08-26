"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Ticket, Sparkles, Check } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export interface OfferProductVM {
  id: number | string;
  slug: string;
  name_ar: string;
  name_en: string;
}

export interface OfferVM {
  id: number | string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  banner_image: string | null;
  code: string | null;
  category_slug: string | null;
  category_name_ar: string | null;
  category_name_en: string | null;
  products: OfferProductVM[];
}

function discountText(offer: OfferVM, locale: string) {
  if (offer.discount_type === "percentage") {
    return locale === "ar" ? `خصم ${offer.discount_value}%` : `${offer.discount_value}% OFF`;
  }
  if (offer.discount_type === "fixed") {
    return locale === "ar" ? `خصم ${offer.discount_value} ج.م` : `${offer.discount_value} EGP OFF`;
  }
  return locale === "ar" ? "شحن مجاني" : "Free Shipping";
}

function offerHref(offer: OfferVM) {
  if (offer.category_slug) return `/shop?category=${offer.category_slug}`;
  if (offer.products.length === 1) return `/shop/${offer.products[0].slug}`;
  return "/shop";
}

function OfferCard({ offer, index }: { offer: OfferVM; index: number }) {
  const { locale, t } = useLocale();
  const [copied, setCopied] = useState(false);

  const title = locale === "ar" ? offer.title_ar : offer.title_en;
  const description = locale === "ar" ? offer.description_ar : offer.description_en;
  const categoryName = locale === "ar" ? offer.category_name_ar : offer.category_name_en;
  const href = offerHref(offer);

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!offer.code) return;
    navigator.clipboard?.writeText(offer.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <Reveal delay={index * 0.05} y={24}>
      <Link
        href={href}
        className="group block rounded-2xl overflow-hidden border border-gold/15 shadow-md hover:shadow-xl transition-shadow bg-white h-full flex flex-col"
      >
        {/* Banner */}
        <div className="relative h-44 w-full overflow-hidden">
          {offer.banner_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.banner_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gold-gradient flex items-center justify-center relative">
              <Sparkles className="text-white/30 absolute -top-2 -end-2" size={90} />
              <Tag className="text-white/90" size={48} />
            </div>
          )}
          <div className="absolute top-3 start-3 bg-charcoal text-ivory text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
            {discountText(offer, locale)}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-playfair font-cairo text-lg font-bold text-charcoal mb-1.5 group-hover:text-goldDark transition-colors">
            {title}
          </h3>
          {description && <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">{description}</p>}

          {offer.min_order_amount ? (
            <p className="text-xs text-charcoal/60 mb-2">
              {t("offers_min_order")} {offer.min_order_amount} {t("currency")}
            </p>
          ) : null}

          {categoryName && (
            <p className="text-xs text-goldDark font-bold mb-2">
              {locale === "ar" ? "تصنيف: " : "Category: "}
              {categoryName}
            </p>
          )}

          {!offer.category_slug && offer.products.length > 0 && (
            <p className="text-xs text-charcoal/60 mb-2 line-clamp-1">
              {t("offers_view_products")}:{" "}
              {offer.products
                .slice(0, 2)
                .map((p) => (locale === "ar" ? p.name_ar : p.name_en))
                .join(locale === "ar" ? "، " : ", ")}
            </p>
          )}

          <div className="mt-auto pt-3 border-t border-gold/10">
            {offer.code ? (
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-full border border-dashed border-goldDark text-goldDark hover:bg-gold/10 transition-colors"
              >
                {copied ? <Check size={14} /> : <Ticket size={14} />}
                {copied ? t("offers_code_copied") : `${t("offers_use_code")}: ${offer.code}`}
              </button>
            ) : (
              <span className="w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-full bg-gold/10 text-goldDark">
                <Sparkles size={14} />
                {t("offers_auto_apply")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function OffersClient({ offers }: { offers: OfferVM[] }) {
  const { t } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("offers_page_title")}
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-xl mx-auto">{t("offers_page_sub")}</p>
      </Reveal>

      {offers.length === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-5">
              <Tag className="text-goldDark" size={36} />
            </div>
            <h2 className="font-cairo text-xl font-bold text-charcoal mb-2">{t("offers_empty_title")}</h2>
            <p className="text-charcoal/60 max-w-md">{t("offers_empty_sub")}</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
