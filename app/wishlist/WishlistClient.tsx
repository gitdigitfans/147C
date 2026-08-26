"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { furnitureImg } from "@/lib/data";
import Reveal from "@/components/Reveal";
import ProductCard, { type ColorOption } from "@/components/ProductCard";
import { getGuestWishlist } from "@/lib/guestWishlist";

export interface WishlistProductVM {
  id: number | string;
  slug: string;
  name: { ar: string; en: string };
  price: number;
  oldPrice?: number;
  image?: string;
  hoverImage?: string;
  bestseller?: boolean;
  offer?: boolean;
  colorOptions?: ColorOption[];
}

export default function WishlistClient({ products, loggedIn }: { products: WishlistProductVM[]; loggedIn: boolean }) {
  const { t } = useLocale();
  const [guestProducts, setGuestProducts] = useState<WishlistProductVM[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(loggedIn); // logged-in users don't need the guest fetch

  useEffect(() => {
    if (loggedIn) return;
    let cancelled = false;
    (async () => {
      // Not logged in server-side: resolve the guest (localStorage) wishlist
      // via the client-side product batch API, since a server component
      // cannot read localStorage.
      // NOTE: if this guest later logs in, this list could be merged into
      // their Supabase `wishlists` table - not implemented, out of scope now.
      const ids = getGuestWishlist();
      if (ids.length === 0) {
        if (!cancelled) setGuestLoaded(true);
        return;
      }
      try {
        const res = await fetch(`/api/products/batch?ids=${encodeURIComponent(ids.join(","))}`);
        const json = await res.json();
        if (!cancelled) setGuestProducts(json.products || []);
      } catch {
        if (!cancelled) setGuestProducts([]);
      } finally {
        if (!cancelled) setGuestLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const allProducts = loggedIn ? products : guestProducts;
  const isEmpty = guestLoaded && allProducts.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-12 text-gold-gradient">
          {t("wishlist_title")}
        </h1>
      </Reveal>

      {isEmpty ? (
        <Reveal className="text-center py-16">
          <Heart size={48} className="mx-auto text-gold/60 mb-4" />
          <p className="text-charcoal/60 mb-6">{t("wishlist_empty")}</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 rounded-full border-2 border-gold text-goldDark font-bold hover:bg-gold hover:text-white transition-colors"
          >
            {t("wishlist_browse_cta")}
          </Link>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {allProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 8) * 0.05}>
              <ProductCard
                href={`/shop/${p.slug}`}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  oldPrice: p.oldPrice,
                  image: p.image || furnitureImg(String(p.id), 500, 400),
                  hoverImage: p.hoverImage,
                  bestseller: p.bestseller,
                  offer: p.offer,
                  colorOptions: p.colorOptions,
                }}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
