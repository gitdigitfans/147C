"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Globe, User, LogOut, Search, Heart } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { getGuestWishlist } from "@/lib/guestWishlist";

const navKeys: { key: string; href: string }[] = [
  { key: "nav_home", href: "/" },
  { key: "nav_shop", href: "/shop" },
  { key: "nav_categories", href: "/categories" },
  { key: "nav_about", href: "/about" },
  { key: "nav_gallery", href: "/gallery" },
  { key: "nav_offers", href: "/offers" },
  { key: "nav_services", href: "/services" },
  { key: "nav_articles", href: "/articles" },
  { key: "nav_consultation", href: "/consultation" },
  { key: "nav_contact", href: "/contact" },
];

export default function Header() {
  const { t, locale, setLocale } = useLocale();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock page scroll while the mobile menu is open - otherwise the page
  // behind it keeps scrolling and its content can visually show through any
  // gap/seam around the fixed drawer as you interact with it.
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

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
    if (!userEmail) {
      // Guest (no account): show the localStorage-based guest wishlist count.
      setWishlistCount(getGuestWishlist().length);

      function handleGuestWishlistChanged() {
        setWishlistCount(getGuestWishlist().length);
      }
      window.addEventListener("guest-wishlist-changed", handleGuestWishlistChanged);
      return () => window.removeEventListener("guest-wishlist-changed", handleGuestWishlistChanged);
    }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      try {
        const { count } = await supabase
          .from("wishlists")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid);
        setWishlistCount(count ?? 0);
      } catch {
        setWishlistCount(0);
      }
    });
  }, [userEmail]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-gold/30 shadow-sm">
      <div className="max-w-[90rem] mx-auto px-4 flex items-center justify-between h-20 gap-3">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="relative w-14 h-14 rounded-full shadow-lg group-hover:scale-105 transition-transform overflow-hidden bg-bronze-gradient">
            <img
              src="/logo.png"
              alt={t("brand")}
              className="w-full h-full object-cover"
            />
          </span>
          <span className="font-playfair font-cairo text-xl font-bold text-charcoal hidden xl:inline whitespace-nowrap">
            {t("brand")}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 2xl:gap-8 min-w-0">
          {navKeys.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className="text-charcoal font-cairo font-medium text-sm xl:text-base hover:text-goldDark transition-colors relative whitespace-nowrap after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-gold after:transition-all"
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 xl:gap-4 shrink-0">
          <div className="relative hidden sm:flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  onSubmit={handleSearchSubmit}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden absolute end-full me-2"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                    placeholder={t("search_placeholder")}
                    className="w-[200px] px-3 py-1.5 rounded-full border border-gold/40 text-sm bg-white outline-none"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("nav_search")}
              className="text-charcoal hover:text-goldDark transition-colors"
            >
              <Search size={22} />
            </button>
          </div>

          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gold text-goldDark hover:bg-gold hover:text-white transition-colors text-sm font-bold"
          >
            <Globe size={16} />
            {locale === "ar" ? "EN" : "AR"}
          </button>

          <Link href="/wishlist" className="relative" aria-label={t("nav_wishlist")}>
            <Heart className="text-charcoal" size={22} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -end-2 bg-goldDark text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative" aria-label="cart">
            <ShoppingBag className="text-charcoal" size={24} />
            <span className="absolute -top-2 -end-2 bg-goldDark text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          </Link>

          {userEmail ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gold-gradient text-white hover:opacity-90 transition-opacity"
                aria-label="account"
              >
                <User size={18} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 end-0 w-48 bg-ivory rounded-xl shadow-xl border border-gold/20 overflow-hidden z-50"
                  >
                    <div className="px-4 py-2 text-xs text-charcoal/50 truncate border-b border-gold/10">{userEmail}</div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal font-cairo hover:bg-gold/10"
                    >
                      <User size={16} /> {locale === "ar" ? "حسابي" : "My Account"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal font-cairo hover:bg-gold/10 text-start"
                    >
                      <LogOut size={16} /> {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-gradient text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <User size={16} />
              {locale === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
          )}

          <button
            className="lg:hidden text-charcoal"
            onClick={() => setOpen(true)}
            aria-label="menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
    </header>

      {/* Rendered as a sibling of <header>, not nested inside it - <header>
          has backdrop-blur-md, and CSS makes any element with a
          filter/backdrop-filter/transform the containing block for
          `position: fixed` descendants. Nesting this fixed full-screen menu
          inside that header made "fixed" resolve against the header's own
          (short) box instead of the viewport, clipping the menu to almost
          nothing visible. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 bottom-0 inset-x-0 z-50 shadow-2xl flex flex-col overflow-y-auto isolate"
              style={{ backgroundColor: "#f7f1e6" }}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              {/* Brand row */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gold/15">
                <button onClick={() => setOpen(false)} aria-label="close" className="text-charcoal">
                  <X size={24} />
                </button>
                <span className="flex items-center gap-2">
                  <span className="font-cairo font-bold text-lg">{t("brand")}</span>
                  <img src="/logo.png" alt={t("brand")} className="w-9 h-9 rounded-full object-cover" />
                </span>
              </div>

              {/* "القائمة" tab header, underlined - matches the reference layout */}
              <div className="px-5 pt-4">
                <span className="inline-block text-sm font-cairo font-bold text-charcoal pb-2 border-b-2 border-charcoal">
                  {locale === "ar" ? "القائمة" : "Menu"}
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setOpen(false);
                }}
                className="relative px-5 pt-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full px-4 py-2 rounded-full border border-gold/40 text-sm bg-white outline-none"
                />
                <button type="submit" aria-label={t("nav_search")} className="absolute top-1/2 -translate-y-1/2 end-8 text-goldDark">
                  <Search size={18} />
                </button>
              </form>

              {/* Full-width list, one item per row with dividers - matches the reference */}
              <nav className="flex flex-col mt-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`font-cairo font-bold text-base text-center py-4 border-b border-gold/15 ${
                    pathname === "/" ? "text-goldDark" : "text-charcoal"
                  }`}
                >
                  {t("nav_home")}
                </Link>
                {navKeys
                  .filter((n) => n.href !== "/")
                  .map((n) => (
                    <Link
                      key={n.key}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`font-cairo font-bold text-base text-center py-4 border-b border-gold/15 ${
                        pathname === n.href ? "text-goldDark" : "text-charcoal"
                      }`}
                    >
                      {t(n.key)}
                    </Link>
                  ))}
                <Link
                  href="/wishlist"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-center gap-2 font-cairo font-bold text-base text-center py-4 border-b border-gold/15 ${
                    pathname === "/wishlist" ? "text-goldDark" : "text-charcoal"
                  }`}
                >
                  <Heart size={16} /> {t("nav_wishlist")}
                </Link>

                {userEmail ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 font-cairo font-bold text-base text-center py-4 border-b border-gold/15 text-charcoal"
                    >
                      <User size={16} /> {locale === "ar" ? "حسابي" : "My Account"}
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-2 font-cairo font-bold text-base text-center py-4 border-b border-gold/15 text-charcoal"
                    >
                      <LogOut size={16} /> {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 font-cairo font-bold text-base text-center py-4 border-b border-gold/15 text-charcoal"
                  >
                    <User size={16} /> {locale === "ar" ? "تسجيل الدخول / التسجيل" : "Login / Register"}
                  </Link>
                )}
              </nav>

              <button
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="m-5 mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gold text-goldDark font-bold"
              >
                <Globe size={16} />
                {locale === "ar" ? "English" : "العربية"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
