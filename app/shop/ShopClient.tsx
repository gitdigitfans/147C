"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { furnitureImg } from "@/lib/data";
import Reveal from "@/components/Reveal";
import ProductCard, { type ColorOption } from "@/components/ProductCard";

// Mock products don't have real slugs (those live in D1) - this derives a
// slug-like fallback so shop cards can still link to /shop/[slug].
function mockSlug(product: { id: number; category: string }) {
  return `${product.category}-${product.id}`;
}

type SortOption = "default" | "asc" | "desc";

export interface ShopCategoryVM {
  slug: string;
  name: { ar: string; en: string };
}

export interface ShopProductVM {
  id: number | string;
  slug: string;
  name: { ar: string; en: string };
  category: string;
  categoryId?: string;
  price: number;
  oldPrice?: number;
  image?: string;
  hoverImage?: string;
  seed?: string;
  bestseller?: boolean;
  offer?: boolean;
  isMock: boolean;
  colorOptions?: ColorOption[];
  shortDesc?: { ar: string; en: string };
}

function ShopProductCard({ product }: { product: ShopProductVM }) {
  const slug = product.isMock ? mockSlug({ id: Number(product.id), category: product.category }) : product.slug;
  const href = `/shop/${slug}`;
  const imgSrc = product.image || furnitureImg(product.seed || String(product.id), 500, 400);

  return (
    <ProductCard
      href={href}
      product={{
        id: product.id,
        slug,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: imgSrc,
        hoverImage: product.hoverImage,
        bestseller: product.bestseller,
        offer: product.offer,
        colorOptions: product.colorOptions,
        shortDesc: product.shortDesc,
        categoryId: product.categoryId,
      }}
    />
  );
}

function CategoryFilterList({
  categories,
  activeCategory,
  setActiveCategory,
  counts,
  allLabel,
}: {
  categories: ShopCategoryVM[];
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  counts: Record<string, number>;
  allLabel: string;
}) {
  const { locale } = useLocale();
  return (
    <ul className="space-y-1.5">
      <li>
        <button
          onClick={() => setActiveCategory("all")}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border-s-[3px] ${
            activeCategory === "all"
              ? "bg-gold-gradient text-charcoal font-extrabold shadow-sm border-goldDark"
              : "text-charcoal/70 font-bold hover:bg-ivory border-transparent"
          }`}
        >
          <span>{allLabel}</span>
          <span
            className={`text-xs font-bold rounded-full px-2 py-0.5 ${
              activeCategory === "all" ? "bg-white/60 text-charcoal" : "bg-ivory text-charcoal/50"
            }`}
          >
            {counts.all ?? 0}
          </span>
        </button>
      </li>
      {categories.map((c) => (
        <li key={c.slug}>
          <button
            onClick={() => setActiveCategory(c.slug)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border-s-[3px] ${
              activeCategory === c.slug
                ? "bg-gold-gradient text-charcoal font-extrabold shadow-sm border-goldDark"
                : "text-charcoal/70 font-bold hover:bg-ivory border-transparent"
            }`}
          >
            <span>{c.name[locale]}</span>
            <span
              className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                activeCategory === c.slug ? "bg-white/60 text-charcoal" : "bg-ivory text-charcoal/50"
              }`}
            >
              {counts[c.slug] ?? 0}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SortSelect({ sort, setSort, label }: { sort: SortOption; setSort: (v: SortOption) => void; label: string }) {
  const { t } = useLocale();
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-charcoal/50 mb-2">{label}</label>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortOption)}
        className="w-full px-3 py-2 rounded-lg border border-gold/40 text-sm bg-white outline-none focus:border-goldDark"
      >
        <option value="default">{t("sort_default")}</option>
        <option value="asc">{t("sort_price_asc")}</option>
        <option value="desc">{t("sort_price_desc")}</option>
      </select>
    </div>
  );
}

function ShopContent({ categories, products }: { categories: ShopCategoryVM[]; products: ShopProductVM[] }) {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortOption>("default");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Next's App Router doesn't remount this client component on same-route
  // query-string-only navigations (e.g. searching again from the header
  // while already on /shop), so the `useState(initialSearch)` above only
  // captures the URL's value at first mount. Re-sync whenever the URL's
  // search/category params actually change so a new header search reliably
  // updates the visible results.
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) {
      c[p.category] = (c[p.category] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const activeCategoryLabel =
    activeCategory === "all" ? t("filter_all") : categories.find((c) => c.slug === activeCategory)?.name[locale] ?? t("filter_all");

  const filtered = useMemo(() => {
    let list = products.slice();
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    const normalizeAr = (s: string) =>
      s
        .toLowerCase()
        .replace(/[\u0622\u0623\u0625\u0649]/g, "\u0627")
        .replace(/[\u0649]/g, "\u064a")
        .replace(/\u0629/g, "\u0647")
        .replace(/\u0649/g, "\u064a");
    const q = normalizeAr(searchQuery.trim());
    if (q) {
      list = list.filter((p) => {
        const nameMatch =
          normalizeAr(p.name[locale] || "").includes(q) ||
          normalizeAr(p.name.ar || "").includes(q) ||
          normalizeAr(p.name.en || "").includes(q);
        const categoryMatch = normalizeAr(p.category || "").includes(q);
        const descMatch =
          p.shortDesc &&
          (normalizeAr(p.shortDesc.ar || "").includes(q) ||
            normalizeAr(p.shortDesc.en || "").includes(q));
        return nameMatch || categoryMatch || descMatch;
      });
    }
    if (sort === "asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, activeCategory, sort, searchQuery, locale]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-12 text-gold-gradient">
          {t("shop_title")}
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar filter - desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin bg-white rounded-2xl shadow-md border border-gold/10 p-5">
            <div className="mb-4 pb-4 border-b border-gold/10">
              <SortSelect sort={sort} setSort={setSort} label={t("sort_label")} />
            </div>
            <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2 text-base">
              <SlidersHorizontal size={18} className="text-goldDark" />
              {t("filter_all") === "الكل" ? "الأقسام" : "Categories"}
            </h2>
            <CategoryFilterList
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              counts={counts}
              allLabel={t("filter_all")}
            />
          </div>
        </aside>

        <div>
          {/* Mobile filter dropdown trigger + sort */}
          <Reveal>
            <div className="flex items-center justify-between gap-3 mb-8">
              <button
                onClick={() => setMobileFilterOpen((v) => !v)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/40 text-sm font-bold text-charcoal bg-white"
              >
                <SlidersHorizontal size={16} className="text-goldDark" />
                {activeCategoryLabel}
                <ChevronDown size={16} className={`transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
              </button>

              <div className="relative flex-1 max-w-xs ms-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full px-4 py-2 rounded-lg border border-gold/40 text-sm bg-white outline-none"
                  aria-label={t("search_label")}
                />
              </div>
            </div>

            <AnimatePresence>
              {mobileFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden overflow-hidden mb-6"
                >
                  <div className="bg-white rounded-2xl shadow-md border border-gold/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-charcoal">{t("filter_all")}</span>
                      <button onClick={() => setMobileFilterOpen(false)}>
                        <X size={16} className="text-charcoal/40" />
                      </button>
                    </div>
                    <div className="mb-4 pb-4 border-b border-gold/10">
                      <SortSelect sort={sort} setSort={setSort} label={t("sort_label")} />
                    </div>
                    <CategoryFilterList
                      categories={categories}
                      activeCategory={activeCategory}
                      setActiveCategory={(v) => {
                        setActiveCategory(v);
                        setMobileFilterOpen(false);
                      }}
                      counts={counts}
                      allLabel={t("filter_all")}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>

          {filtered.length === 0 ? (
            <p className="text-center text-charcoal/50 py-16">{t("search_no_results")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 8) * 0.05}>
                  <ShopProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopClient({ categories, products }: { categories: ShopCategoryVM[]; products: ShopProductVM[] }) {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center">...</div>}>
      <ShopContent categories={categories} products={products} />
    </Suspense>
  );
}
