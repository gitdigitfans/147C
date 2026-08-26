"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import type { GallerySlideItem } from "@/components/Gallery3D";

export default function GalleryClient({ items }: { items: GallerySlideItem[] }) {
  const { t, locale } = useLocale();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const count = items.length;

  const close = () => setActiveIndex(null);
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % count));
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + count) % count));

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {t("gallery_page_title")}
        </h1>
        <p className="text-center text-charcoal/60 max-w-xl mx-auto mb-12">{t("gallery_page_sub")}</p>
      </Reveal>

      {count === 0 ? (
        <p className="text-center text-charcoal/50 py-20">{t("gallery_empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 0.06}>
              <button
                onClick={() => setActiveIndex(i)}
                className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md block"
              >
                <img
                  src={item.image}
                  alt={item.title[locale]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-5 text-start">
                  <h3 className="font-playfair font-cairo font-bold text-lg text-ivory translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {item.title[locale]}
                  </h3>
                  {(item.subtitle.ar || item.subtitle.en) && (
                    <p className="text-ivory/80 text-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.subtitle[locale]}
                    </p>
                  )}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="close"
              className="absolute top-5 end-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            >
              <X size={22} />
            </button>

            {count > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="prev"
                className="absolute start-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              >
                <ChevronRight size={22} />
              </button>
            )}

            <motion.div
              key={active.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={active.image}
                alt={active.title[locale]}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
              />
              <div className="text-center mt-4">
                <h3 className="font-playfair font-cairo font-bold text-xl text-ivory">{active.title[locale]}</h3>
                {(active.subtitle.ar || active.subtitle.en) && (
                  <p className="text-ivory/70 text-sm mt-1">{active.subtitle[locale]}</p>
                )}
              </div>
            </motion.div>

            {count > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="next"
                className="absolute end-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              >
                <ChevronLeft size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
