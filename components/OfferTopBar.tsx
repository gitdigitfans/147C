"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export interface TopbarOfferData {
  id: number | string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  discount_type: string;
  discount_value: number;
  category_id?: number | string | null;
  product_id?: number | string | null;
  category_slug?: string | null;
}

function discountText(offer: TopbarOfferData, locale: string) {
  if (offer.discount_type === "percentage") {
    return locale === "ar" ? `خصم ${offer.discount_value}%` : `${offer.discount_value}% OFF`;
  }
  if (offer.discount_type === "fixed") {
    return locale === "ar" ? `خصم ${offer.discount_value} جنيه` : `${offer.discount_value} EGP OFF`;
  }
  return locale === "ar" ? "شحن مجاني" : "Free Shipping";
}

export default function OfferTopBar({ offer }: { offer: TopbarOfferData | null }) {
  const { locale, t } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!offer) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(`pharaoh_topbar_dismissed_${offer.id}`)) {
      setDismissed(true);
    }
  }, [offer]);

  if (!offer || dismissed) return null;

  const currentOffer = offer;

  const title = locale === "ar" ? offer.title_ar : offer.title_en;
  const href = offer.category_slug ? `/shop?category=${offer.category_slug}` : "/shop";

  function handleDismiss() {
    sessionStorage.setItem(`pharaoh_topbar_dismissed_${currentOffer.id}`, "1");
    setDismissed(true);
  }

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="w-full bg-charcoal text-ivory text-sm py-2 px-4 flex items-center justify-center relative"
    >
      <Link
        href={href}
        className={`flex items-center gap-2 font-bold hover:text-gold transition-colors ${locale === "ar" ? "flex-row-reverse" : ""}`}
      >
        <span>
          {title} — {discountText(offer, locale)}
        </span>
        <span className="underline text-gold">{t("offer_shop_now")}</span>
      </Link>
      <button
        onClick={handleDismiss}
        aria-label="close"
        className="absolute end-3 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-ivory"
      >
        <X size={16} />
      </button>
    </div>
  );
}
