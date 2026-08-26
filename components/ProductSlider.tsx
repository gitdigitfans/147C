"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import ProductCard, { type ProductCardVM } from "@/components/ProductCard";

// Discrete, pausable auto-advancing product carousel. Unlike the Partners
// section's continuous CSS marquee, product cards are interactive (links,
// add-to-cart buttons), so this pages through the list one "screen" of
// cards at a time on a slower interval, pausing entirely on hover so users
// can actually click something without it sliding away mid-interaction.
export default function ProductSlider({ products }: { products: ProductCardVM[] }) {
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  const [visibleCount, setVisibleCount] = useState(4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function computeVisibleCount() {
      const w = window.innerWidth;
      if (w >= 1024) return 4;
      if (w >= 640) return 2;
      return 1;
    }
    setVisibleCount(computeVisibleCount());
    const onResize = () => setVisibleCount(computeVisibleCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const stepCount = Math.max(1, products.length);

  useEffect(() => {
    if (index > stepCount - 1) setIndex(0);
  }, [stepCount, index]);

  useEffect(() => {
    if (paused || stepCount <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % stepCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [paused, stepCount]);

  const goPrev = () => setIndex((i) => (i - 1 + stepCount) % stepCount);
  const goNext = () => setIndex((i) => (i + 1) % stepCount);

  const dir = isRtl ? 1 : -1;
  const itemWidthPct = 100 / visibleCount;

  if (products.length === 0) return null;

  // Loop the product list so a single-item step at the end wraps smoothly
  // without a visible jump back to the start.
  const looped = products.length > visibleCount ? [...products, ...products.slice(0, visibleCount)] : products;

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(${dir * index * itemWidthPct}%)`,
          }}
        >
          {looped.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="shrink-0"
              style={{ width: `calc(${itemWidthPct}% - ${((visibleCount - 1) * 24) / visibleCount}px)` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {stepCount > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute -start-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="prev"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute -end-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="next"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index % products.length ? "bg-gold" : "bg-charcoal/15"}`}
                aria-label={`product ${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
