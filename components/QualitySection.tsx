"use client";

import { motion } from "framer-motion";
import { Trees, Gem, Waves, ShieldCheck, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

// Soft, blurred, continuously "breathing" ambient gold glow that hugs each
// card's edges (replaces the old moving ShineSweep bar). Sits behind the
// card's own opaque background via -z-10 so it reads as an ambient halo
// rather than a highlight sweeping across the content.
function BreathingGlow({ i, gold = false }: { i: number; gold?: boolean }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute -inset-1 -z-10 rounded-[inherit] blur-xl ${
        gold ? "bg-gold/40" : "bg-gold/30"
      }`}
      animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.02, 0.98] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
    />
  );
}

function DropCard({ i, children, className = "" }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function QualitySection() {
  const { t, locale } = useLocale();

  const checklist = [
    t("quality_card4_check1"),
    t("quality_card4_check2"),
    t("quality_card4_check3"),
    t("quality_card4_check4"),
  ];

  // Single data array in the exact reading order requested by the owner:
  // metals -> fabric -> wood -> marble. This order is rendered in plain
  // source order via .map(); the grid's `dir` (derived from the active
  // locale below) makes it read rightmost-first under RTL and
  // leftmost-first under LTR, so no per-locale reversal logic is needed.
  const cards = [
    {
      num: "01",
      icon: ShieldCheck,
      title: t("quality_card4_title"),
      desc: t("quality_card4_desc"),
      dark: true,
      checklist,
    },
    {
      num: "02",
      icon: Waves,
      title: t("quality_card3_title"),
      desc: t("quality_card3_desc"),
      image: "/fabric-texture.png",
    },
    {
      num: "03",
      icon: Trees,
      title: t("quality_card1_title"),
      desc: t("quality_card1_desc"),
      image: "/wood-texture.png",
    },
    {
      num: "04",
      icon: Gem,
      title: t("quality_card2_title"),
      desc: t("quality_card2_desc"),
      image: "/marble-texture.png",
    },
  ];

  return (
    <section
      className="relative py-20"
      style={{
        backgroundColor: "#f0e9dc",
        backgroundImage:
          "linear-gradient(135deg, #f5f0e6 0%, #ece4d3 50%, #f0e9dc 100%), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='qm'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.7  0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23qm)'/></svg>\")",
        backgroundBlendMode: "normal, overlay",
        backgroundSize: "auto, 220px 220px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-gold/70" />
              <span className="w-2 h-2 rotate-45 bg-gold" />
              <span className="w-8 h-px bg-gold/70" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-goldDark">
              {t("quality_label")}
            </span>
          </div>
          <h2 className="font-playfair font-cairo text-3xl md:text-4xl font-bold text-center mb-4 text-gold-gradient">
            {t("quality_heading")}
          </h2>
          <p className="text-center text-charcoal/60 max-w-2xl mx-auto mb-14">{t("quality_subtitle")}</p>
        </Reveal>

        {/* dir is locale-aware so this always reads in the same logical
            source order (metals -> fabric -> wood -> marble): rightmost-
            first under RTL (Arabic), leftmost-first under LTR (English).
            No per-locale array reversal is used - the CSS `dir` flow alone
            handles the mirroring. */}
        <div dir={locale === "ar" ? "rtl" : "ltr"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            if (c.dark) {
              return (
                <DropCard
                  key={c.num}
                  i={i}
                  className="rounded-2xl bg-charcoal border border-gold/40 shadow-md flex flex-col text-ivory"
                >
                  <BreathingGlow i={i} gold />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-full bg-gold/15 border border-gold flex items-center justify-center">
                        <Icon size={20} className="text-gold" />
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-bold">
                        {c.num}
                      </span>
                    </div>
                    <h3 className="font-cairo font-bold text-lg mb-2">{c.title}</h3>
                    <p className="text-ivory/60 text-sm leading-relaxed mb-2">{c.desc}</p>
                    <div className="w-full h-px bg-gold/20 mb-4 mt-2" />
                    <ul className="space-y-2 mb-2">
                      {c.checklist!.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-ivory/80">
                          <span className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-gold" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full bg-gold-gradient px-5 py-2 text-sm font-bold text-charcoal shadow-md transition-transform hover:scale-105"
                    >
                      {t("quality_discover_more")}
                      {locale === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </DropCard>
              );
            }
            return (
              <DropCard key={c.num} i={i} className="rounded-2xl bg-white shadow-md flex flex-col">
                <BreathingGlow i={i} />
                <div className="relative">
                  <span className="absolute top-3 start-3 z-10 px-3 py-1 rounded-full bg-charcoal text-ivory text-xs font-bold">
                    {c.num}
                  </span>
                  <div className="w-full h-44 overflow-hidden rounded-t-2xl">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="pt-8 pb-6 px-5 text-center flex-1 flex flex-col">
                  <h3 className="font-cairo font-bold text-lg text-charcoal mb-2">{c.title}</h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed flex-1">{c.desc}</p>
                </div>
              </DropCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
