"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export interface PopupOfferData {
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
  banner_image?: string | null;
}

function discountText(offer: PopupOfferData, locale: string) {
  if (offer.discount_type === "percentage") {
    return locale === "ar" ? `خصم ${offer.discount_value}%` : `${offer.discount_value}% OFF`;
  }
  if (offer.discount_type === "fixed") {
    return locale === "ar" ? `خصم ${offer.discount_value} جنيه` : `${offer.discount_value} EGP OFF`;
  }
  return locale === "ar" ? "شحن مجاني" : "Free Shipping";
}

export default function OfferPopup({ offer }: { offer: PopupOfferData | null }) {
  const { locale, t } = useLocale();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!offer) return;
    if (typeof window !== "undefined" && !sessionStorage.getItem(`pharaoh_popup_shown_${offer.id}`)) {
      setShowModal(true);
    }
  }, [offer]);

  if (!offer) return null;

  const currentOffer = offer;

  const title = locale === "ar" ? offer.title_ar : offer.title_en;
  const description = locale === "ar" ? offer.description_ar : offer.description_en;
  const href = offer.category_slug ? `/shop?category=${offer.category_slug}` : "/shop";

  function handleClose() {
    sessionStorage.setItem(`pharaoh_popup_shown_${currentOffer.id}`, "1");
    setShowModal(false);
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          key="offer-popup-backdrop"
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            key="offer-popup-card"
            dir={locale === "ar" ? "rtl" : "ltr"}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="bg-ivory rounded-2xl max-w-sm w-full overflow-hidden relative shadow-2xl"
          >
            <button
              onClick={handleClose}
              aria-label="close"
              className="absolute top-3 end-3 z-10 bg-white/80 rounded-full p-1 text-charcoal hover:text-goldDark"
            >
              <X size={18} />
            </button>
            {offer.banner_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.banner_image} alt={title} className="w-full h-40 object-cover" />
            )}
            <div className="p-6 text-center">
              <h3 className="font-playfair font-cairo text-xl font-bold text-charcoal mb-2">{title}</h3>
              {description && <p className="text-sm text-charcoal/70 mb-3">{description}</p>}
              <p className="text-lg font-bold text-goldDark mb-4">{discountText(offer, locale)}</p>
              <Link
                href={href}
                onClick={handleClose}
                className="inline-block px-6 py-2.5 rounded-full bg-goldDark text-white font-bold hover:opacity-90 transition-opacity"
              >
                {t("offer_shop_now")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
