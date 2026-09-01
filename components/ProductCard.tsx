"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { addToGuestWishlist, isInGuestWishlist, removeFromGuestWishlist } from "@/lib/guestWishlist";
import { onImgError } from "@/lib/imageFallback";
import { cldUrl } from "@/lib/cloudinaryUrl";

export interface ColorOption {
  id: string;
  value: { ar: string; en: string };
  image?: string;
}

export interface ProductCardVM {
  id: number | string;
  slug: string;
  name: { ar: string; en: string };
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage?: string;
  bestseller?: boolean;
  offer?: boolean;
  colorOptions?: ColorOption[];
  shortDesc?: { ar: string; en: string };
  categoryId?: string | number;
}

function WishlistButton({ productId }: { productId: number | string }) {
  const { t } = useLocale();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Guest (no account): fall back to the localStorage-based wishlist.
        if (!cancelled) {
          setWishlisted(isInGuestWishlist(String(productId)));
          setChecked(true);
        }
        return;
      }
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", String(productId))
        .maybeSingle();
      if (!cancelled) {
        setWishlisted(!!data);
        setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest (no account): toggle in localStorage instead of requiring login.
      // NOTE: if this guest later logs in, this list could be merged into
      // their Supabase `wishlists` table - not implemented, out of scope now.
      if (wishlisted) {
        setWishlisted(false);
        removeFromGuestWishlist(String(productId));
      } else {
        setWishlisted(true);
        addToGuestWishlist(String(productId));
      }
      window.dispatchEvent(new Event("guest-wishlist-changed"));
      return;
    }

    if (wishlisted) {
      setWishlisted(false);
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", String(productId));
    } else {
      setWishlisted(true);
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: String(productId) });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={wishlisted ? t("pdp_wishlist_remove") : t("pdp_wishlist_add")}
      className="absolute bottom-3 start-3 z-10 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white transition-colors"
    >
      <Heart size={16} className={wishlisted && checked ? "fill-red-500 text-red-500" : "text-charcoal"} />
    </button>
  );
}

export default function ProductCard({ product, href }: { product: ProductCardVM; href?: string }) {
  const { t, locale } = useLocale();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const displayImage = isHovering && product.hoverImage ? product.hoverImage : product.image;
  const link = href || `/shop/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white rounded-3xl overflow-hidden border border-gold/10 shadow-sm hover:shadow-2xl transition-shadow relative flex flex-col"
    >
      {product.bestseller && (
        <span className="absolute top-3 start-3 z-10 bg-goldDark text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
          {t("bestseller_badge")}
        </span>
      )}
      {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
        <span className="absolute top-3 end-3 z-10 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          -{Math.round(100 - (product.price / product.oldPrice) * 100)}%
        </span>
      )}

      <Link
        href={link}
        className="block relative aspect-[4/3] overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={cldUrl(product.image, 500)}
          alt={product.name[locale]}
          onError={onImgError}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.hoverImage && product.hoverImage !== product.image && (
          <img
            key="hover"
            src={cldUrl(product.hoverImage, 500)}
            alt={product.name[locale]}
            aria-hidden
            onError={onImgError}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <WishlistButton productId={product.id} />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={link}>
          <h3 className="font-cairo font-bold text-charcoal mb-2 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-goldDark transition-colors">
            {product.name[locale]}
          </h3>
        </Link>

        {product.price > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-goldDark">
              {product.price.toLocaleString()} {t("currency")}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-charcoal/40 line-through">
                {product.oldPrice.toLocaleString()} {t("currency")}
              </span>
            )}
          </div>
        )}

        {product.price > 0 && (
          <button
            onClick={() => {
              addItem({
                id: String(product.id),
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: displayImage,
                categoryId: product.categoryId != null ? String(product.categoryId) : undefined,
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="mt-auto w-full py-2.5 rounded-xl bg-gold-gradient text-charcoal font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check size={16} /> {t("added_to_cart")}
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  {t("add_to_cart")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.div>
  );
}
