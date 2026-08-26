"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { useLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import type { Service } from "@/lib/data";

export default function ServicesClient({
  services,
  pageTitle,
  pageSub,
}: {
  services: Service[];
  pageTitle: { ar: string; en: string };
  pageSub: { ar: string; en: string };
}) {
  const { t, locale } = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Reveal>
        <h1 className="font-playfair font-cairo text-4xl font-bold text-center mb-4 text-gold-gradient">
          {pageTitle[locale] || t("services_page_title")}
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-xl mx-auto">{pageSub[locale] || t("services_page_sub")}</p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {services.map((s, i) => {
          const Icon = (Icons as any)[s.icon] || Icons.Star;
          return (
            <Reveal key={`${s.icon}-${i}`} delay={(i % 4) * 0.08}>
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow h-full flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="font-cairo font-bold text-lg">{s.name[locale]}</h3>
                <p className="text-charcoal/60 text-sm leading-relaxed">{s.desc[locale]}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <section className="rounded-2xl bg-gold-gradient px-8 py-16 text-center">
          <h2 className="font-playfair font-cairo text-3xl font-bold text-charcoal mb-4">{t("contact_cta_title")}</h2>
          <p className="text-charcoal/80 mb-8">{t("contact_cta_sub")}</p>
          <Link href="/contact" className="px-8 py-3 rounded-full bg-charcoal text-ivory font-bold hover:scale-105 inline-block transition-transform">
            {t("contact_cta_btn")}
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
