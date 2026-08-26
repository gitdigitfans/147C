"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Award, Leaf, Sofa } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

// Trust/feature strip shown directly below the hero section on the
// homepage. Extracted out of QualitySection so it can be relocated to the
// top of the page. Each of the 4 boxes has an always-on, continuously
// "breathing" ambient gold glow (no hover-gating) matching the same
// BreathingGlow effect used in QualitySection.
//
// Below sm, this renders as a dedicated "Why Pharaoh?" luxury vertical
// showcase instead of a squeezed-down copy of the desktop strip: a small
// header, four material-themed cards (wood/fabric/leaf-nature/sofa) linked
// by a thin vertical gold thread, each with a continuously moving light
// chasing its rounded rectangular frame (.chase-border, see globals.css).
export default function TrustBar() {
  const { t } = useLocale();

  const featureBar = [
    { icon: ShieldCheck, title: t("quality_feature1_title"), sub: t("quality_feature1_sub") },
    { icon: Award, title: t("quality_feature2_title"), sub: t("quality_feature2_sub") },
    { icon: Leaf, title: t("quality_feature3_title"), sub: t("quality_feature3_sub") },
    { icon: Sofa, title: t("quality_feature4_title"), sub: t("quality_feature4_sub") },
  ];

  const mobileCards = [
    { icon: ShieldCheck, title: t("quality_feature1_title"), sub: t("quality_feature1_sub"), image: "/wood-texture.png" },
    { icon: Award, title: t("quality_feature2_title"), sub: t("quality_feature2_sub"), image: "/fabric-texture.png" },
    { icon: Leaf, title: t("quality_feature3_title"), sub: t("quality_feature3_sub") },
    { icon: Sofa, title: t("quality_feature4_title"), sub: t("quality_feature4_sub") },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
      {/* ---- Mobile-only luxury vertical showcase (< sm) ---- */}
      <div className="sm:hidden mt-12">
        <Reveal>
          <div className="flex flex-col items-center mb-5 pt-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-px bg-gold/70" />
              <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
              <span className="w-6 h-px bg-gold/70" />
            </div>
            <h2 className="font-playfair font-cairo text-xl font-extrabold text-gold-gradient text-center">
              {t("trustbar_why_label")}
            </h2>
            <p className="text-xs text-charcoal/50 mt-1">{t("trustbar_why_sub")}</p>
          </div>
        </Reveal>

        <div className="relative pe-5">
          {/* thin gold thread connecting the four cards, like a journey line */}
          <span className="absolute top-2 bottom-2 end-[26px] w-px bg-gradient-to-b from-gold/60 via-gold/30 to-gold/60" aria-hidden />

          <div className="flex flex-col gap-5">
            {mobileCards.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  {/* node on the connecting thread */}
                  <span className="absolute top-1/2 -translate-y-1/2 end-[22px] w-2.5 h-2.5 rounded-full bg-gold border-2 border-ivory shadow" aria-hidden />

                  <div className="relative rounded-[1.75rem]">
                    <div className="relative flex items-stretch gap-4 rounded-[1.75rem] bg-white/95 backdrop-blur-sm shadow-md p-3 pe-5 overflow-hidden">
                      {/* material swatch (photo texture where we have one, soft gradient + icon watermark otherwise) */}
                      <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gold/10">
                        {f.image ? (
                          <img src={f.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/15 to-goldDark/20">
                            <Icon size={26} className="text-goldDark/50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <div className="text-[15px] font-extrabold text-charcoal leading-snug truncate">{f.title}</div>
                          <div className="text-xs text-charcoal/50 leading-snug">{f.sub}</div>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-gold-gradient text-white flex items-center justify-center shrink-0 shadow">
                          <Icon size={16} />
                        </span>
                      </div>
                    </div>

                    {/* light traveling around the card's actual rectangular
                        path (straight edges + rounded corners) - an SVG
                        stroke-dash trace rather than a rotating radial glow,
                        so it hugs the frame instead of reading as a circle */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ zIndex: 1 }}
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id={`trustbar-trace-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c9a15e" stopOpacity="0" />
                          <stop offset="50%" stopColor="#f8e6b8" stopOpacity="1" />
                          <stop offset="100%" stopColor="#c9a15e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="28"
                        ry="28"
                        fill="none"
                        stroke={`url(#trustbar-trace-${i})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="14 100"
                        className="trace-dash"
                        style={{ animationDelay: `${i * 0.25}s` }}
                      />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Desktop/tablet strip (sm and up) - unchanged ---- */}
      <Reveal>
        <div className="hidden sm:grid rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg px-4 py-6 grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-gold/20 rtl:lg:divide-x-reverse overflow-visible">
          {featureBar.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="relative px-4 py-3 overflow-visible">
                <div className="relative flex items-center gap-3 rounded-xl px-2 py-1 overflow-visible">
                  {/* Always-on, continuously breathing ambient gold glow */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-1 -z-10 rounded-[inherit] blur-xl bg-gold/25"
                    animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  />
                  <span className="relative w-9 h-9 rounded-full bg-gold/10 text-goldDark flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="relative">
                    <div className="text-sm font-bold text-charcoal">{f.title}</div>
                    <div className="text-xs text-charcoal/50">{f.sub}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
