"use client";

import * as Icons from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { furnitureImg } from "@/lib/data";
import Reveal from "@/components/Reveal";
import type { Feature } from "@/lib/data";

interface Pair {
  ar: string;
  en: string;
}

export default function AboutClient({
  features,
  aboutImage,
  aboutTitle,
  aboutText,
  visionTitle,
  visionText,
  missionTitle,
  missionText,
  statYears,
  statClients,
  statBranches,
}: {
  features: Feature[];
  aboutImage?: string;
  aboutTitle: Pair;
  aboutText: Pair;
  visionTitle: Pair;
  visionText: Pair;
  missionTitle: Pair;
  missionText: Pair;
  statYears: string;
  statClients: string;
  statBranches: string;
}) {
  const { t, locale } = useLocale();
  const stats = [
    { n: statYears, l: t("stat_years") },
    { n: statClients, l: t("stat_clients") },
    { n: statBranches, l: t("stat_branches") },
  ];

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Reveal>
          <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-12 text-gold-gradient">
            {t("about_page_title")}
          </h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <Reveal y={40}>
            <img
              src={aboutImage || furnitureImg("about-workshop-page", 700, 550)}
              alt="about"
              className="rounded-2xl shadow-xl w-full h-full object-cover"
            />
          </Reveal>
          <Reveal y={40} delay={0.15}>
            <h2 className="font-playfair font-cairo text-2xl font-bold mb-4 text-goldDark">
              {aboutTitle[locale] || t("about_us_title")}
            </h2>
            <p className="text-charcoal/70 leading-relaxed text-lg">{aboutText[locale] || t("about_text")}</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Reveal y={30}>
            <div className="bg-white rounded-2xl p-8 shadow-md h-full">
              <h2 className="font-playfair font-cairo text-2xl font-bold mb-4 text-goldDark">{visionTitle[locale] || t("vision_title")}</h2>
              <p className="text-charcoal/70 leading-relaxed">{visionText[locale] || t("vision_text")}</p>
            </div>
          </Reveal>
          <Reveal y={30} delay={0.1}>
            <div className="bg-white rounded-2xl p-8 shadow-md h-full">
              <h2 className="font-playfair font-cairo text-2xl font-bold mb-4 text-goldDark">{missionTitle[locale] || t("mission_title")}</h2>
              <p className="text-charcoal/70 leading-relaxed">{missionText[locale] || t("mission_text")}</p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
            {t("features_title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-20">
          {features.map((f, i) => {
            const Icon = (Icons as any)[f.icon] || Icons.Star;
            return (
              <Reveal key={`${f.icon}-${i}`} delay={(i % 5) * 0.07}>
                <div className="bg-white rounded-2xl p-5 text-center shadow-md h-full flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gold-gradient-soft flex items-center justify-center">
                    <Icon className="text-goldDark" size={26} />
                  </div>
                  <p className="text-sm font-cairo font-bold text-charcoal">{f.name[locale]}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
            {t("stats_title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 0.1}>
              <div className="bg-gold-gradient rounded-2xl p-10 text-center">
                <div className="text-4xl font-playfair font-bold text-charcoal mb-2">{s.n}</div>
                <div className="text-charcoal/80 font-cairo font-bold">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
