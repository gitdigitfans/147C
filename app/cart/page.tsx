"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import Reveal from "@/components/Reveal";
import { cldUrl } from "@/lib/cloudinaryUrl";

interface AppliedOffer {
  applied: true;
  discountAmount: number;
  freeShipping?: boolean;
  title: string;
  offerId: string;
  eligibleItemIds: string[];
}

export default function CartPage() {
  const { t, locale } = useLocale();
  const { items, removeItem, updateQty, total } = useCart();
  const [offer, setOffer] = useState<AppliedOffer | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setOffer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/offers/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, categoryId: i.categoryId, price: i.price, qty: i.qty })),
            subtotal: total,
          }),
        });
        const data = await res.json();
        if (!cancelled) setOffer(data?.applied ? data : null);
      } catch {
        if (!cancelled) setOffer(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, total]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Reveal>
        <h1 className="font-playfair font-cairo text-3xl md:text-4xl font-bold text-center mb-12 text-gold-gradient">
          {t("cart_title")}
        </h1>
      </Reveal>

      {items.length === 0 ? (
        <Reveal>
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-charcoal/20 mb-4" />
            <p className="text-charcoal/60 mb-6">{t("cart_empty")}</p>
            <Link
              href="/shop"
              className="px-8 py-3 rounded-full bg-gold-gradient text-charcoal font-bold hover:scale-105 inline-block transition-transform"
            >
              {t("cart_empty_cta")}
            </Link>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="bg-white rounded-2xl shadow-md border border-gold/10 divide-y divide-gold/10 mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <img
                  src={cldUrl(item.image, 160)}
                  alt={item.name[locale]}
                  loading="lazy"
                  decoding="async"
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.slug}`} className="font-cairo font-bold text-charcoal hover:text-goldDark transition-colors truncate block">
                    {item.name[locale]}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-xs text-charcoal/50 mt-0.5">{item.variantLabel}</p>
                  )}
                  <p className="text-goldDark font-bold mt-1">
                    {item.price.toLocaleString()} {t("currency")}
                  </p>
                </div>
                <div className="flex items-center gap-2 border border-gold/30 rounded-full px-2 py-1">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gold/10 text-charcoal"
                    aria-label="decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gold/10 text-charcoal"
                    aria-label="increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="hidden sm:block font-bold text-charcoal w-24 text-end">
                  {(item.price * item.qty).toLocaleString()} {t("currency")}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-charcoal/40 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label={t("cart_remove")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {offer && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 flex items-center justify-between gap-2">
              {offer.freeShipping ? (
                <span>{locale === "ar" ? `شحن مجاني: ${offer.title}` : `Free shipping: ${offer.title}`}</span>
              ) : (
                <span>
                  {locale === "ar"
                    ? `خصم عرض: -${offer.discountAmount.toLocaleString()} ${t("currency")} — ${offer.title}`
                    : `Offer discount: -${offer.discountAmount.toLocaleString()} ${t("currency")} — ${offer.title}`}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-ivory rounded-2xl border border-gold/20 p-6">
            <Link href="/shop" className="text-goldDark font-bold hover:underline">
              {t("cart_continue_shopping")}
            </Link>
            <div className="flex items-center gap-6">
              <div className="text-lg">
                {offer && offer.discountAmount > 0 && (
                  <div className="text-sm text-charcoal/40 line-through mb-0.5">
                    {total.toLocaleString()} {t("currency")}
                  </div>
                )}
                <span className="text-charcoal/60">{t("cart_subtotal")}: </span>
                <span className="font-bold text-charcoal">
                  {(total - (offer?.discountAmount || 0)).toLocaleString()} {t("currency")}
                </span>
              </div>
              <Link
                href="/checkout"
                className="px-8 py-3 rounded-full bg-gold-gradient text-charcoal font-bold hover:scale-105 inline-block transition-transform"
              >
                {t("cart_checkout_btn")}
              </Link>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
