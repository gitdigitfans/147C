"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { cldUrl } from "@/lib/cloudinaryUrl";
import { onImgError } from "@/lib/imageFallback";

interface SearchResult {
  id: string | number;
  slug: string;
  name: { ar: string; en: string };
  price: number;
  image?: string;
}

export default function MobileBottomNav() {
  const { t, locale } = useLocale();
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
    if (!searchOpen) {
      setSearchQuery("");
      setResults([]);
    }
  }, [searchOpen]);

  // Debounced instant-results lookup as the user types, instead of only
  // resolving on submit - hits the small /api/products/search endpoint
  // (indexed name/sku LIKE query, LIMIT 6) rather than the full /shop
  // catalog fetch, so results come back fast.
  useEffect(() => {
    const q = searchQuery.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/shop");
    }
    setSearchOpen(false);
  }

  const accountHref = userEmail ? "/account" : "/login";

  const items = [
    { key: "bottomnav_home", href: "/", icon: Home },
    { key: "bottomnav_categories", href: "/categories", icon: LayoutGrid },
  ];

  const rightItems = [
    { key: "bottomnav_cart", href: "/cart", icon: ShoppingBag, badge: count },
    { key: "bottomnav_account", href: accountHref, icon: User },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  return (
    <>
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 z-40 sm:hidden px-3"
            style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 bg-white rounded-full border border-gold/40 shadow-lg px-2 py-2 ps-3"
            >
              <Search size={18} className="text-goldDark shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search_placeholder")}
                className="flex-1 bg-transparent outline-none text-sm text-charcoal"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-1.5 rounded-full bg-gradient-to-br from-gold to-goldDark text-white text-sm font-bold"
              >
                {t("bottomnav_search")}
              </button>
            </form>

            {searchQuery.trim() && (
              <div className="mt-2 bg-white rounded-2xl border border-gold/20 shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-xs text-charcoal/40">...</div>
                ) : results.length > 0 ? (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/shop/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 border-b border-gold/5 last:border-0 hover:bg-ivory/60"
                    >
                      <img
                        src={cldUrl(p.image, 100)}
                        alt=""
                        onError={onImgError}
                        className="w-11 h-11 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-charcoal truncate">{p.name[locale]}</p>
                        <p className="text-xs text-goldDark font-bold">{p.price?.toLocaleString()} {t("currency")}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-charcoal/40">{t("search_no_results")}</div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-ivory/95 backdrop-blur-md border-t border-gold/10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="relative flex items-center justify-between px-4 h-16">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 ${
                  active ? "text-goldDark" : "text-charcoal/50"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-cairo font-medium">{t(item.key)}</span>
              </Link>
            );
          })}

          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("bottomnav_search")}
              className="flex items-center justify-center w-14 h-14 -translate-y-2 rounded-full bg-gradient-to-br from-gold to-goldDark shadow-lg shadow-goldDark/40 text-white"
            >
              <Search size={24} />
            </button>
          </div>

          {rightItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 ${
                  active ? "text-goldDark" : "text-charcoal/50"
                }`}
              >
                <span className="relative">
                  <Icon size={22} />
                  {"badge" in item && item.badge! > 0 && (
                    <span className="absolute -top-1 -end-1 bg-gold text-charcoal text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-cairo font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
