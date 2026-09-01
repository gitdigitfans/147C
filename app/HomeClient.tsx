"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { partners, furnitureImg } from "@/lib/data";
import Reveal from "@/components/Reveal";
import Gallery3D, { type GallerySlideItem } from "@/components/Gallery3D";
import ProductCard, { type ColorOption } from "@/components/ProductCard";
import ProductSlider from "@/components/ProductSlider";
import { cldUrl } from "@/lib/cloudinaryUrl";
import CategoriesSlider, { type CategoryVM } from "@/components/CategoriesSlider";
import QualitySection from "@/components/QualitySection";
import TrustBar from "@/components/TrustBar";
import { onImgError } from "@/lib/imageFallback";

export interface NormalizedProduct {
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
  categoryId?: string;
}

export interface NormalizedHero {
  image: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  linkUrl?: string;
  mediaType?: "image" | "video";
  videoUrl?: string;
}

export interface NormalizedSecondaryBanner {
  image: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  linkUrl: string;
}

export interface NormalizedTestimonial {
  name: { ar: string; en: string };
  text: { ar: string; en: string };
  rating: number;
  image: string;
  productName?: { ar: string; en: string };
}

interface HomeClientProps {
  latest: NormalizedProduct[];
  best: NormalizedProduct[];
  offers: NormalizedProduct[];
  heroSlides: NormalizedHero[];
  testimonials: NormalizedTestimonial[];
  aboutImage?: string;
  aboutTitle?: { ar: string; en: string };
  aboutText?: { ar: string; en: string };
  secondaryBanner?: NormalizedSecondaryBanner;
  gallerySlides: GallerySlideItem[];
  categories: CategoryVM[];
}

// Animates a stat number (e.g. "5000+") counting up from 0 the first time
// it scrolls into view, keeping any non-numeric suffix (+, etc) static.
function CountUpStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1.4, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function HomeClient({ latest, best, offers, heroSlides, testimonials, aboutImage, aboutTitle, aboutText, secondaryBanner, gallerySlides, categories }: HomeClientProps) {
  const { t, locale } = useLocale();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[slide] || heroSlides[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {currentSlide.mediaType === "video" && currentSlide.videoUrl ? (
              <video
                src={currentSlide.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.img
                src={currentSlide.image}
                alt={currentSlide.title[locale]}
                onError={onImgError}
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 5, ease: "linear" }}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-charcoal/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-playfair font-cairo text-4xl md:text-6xl font-bold text-ivory mb-4"
              >
                {currentSlide.title[locale]}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-ivory/90 text-lg md:text-xl mb-8 max-w-xl"
              >
                {currentSlide.subtitle[locale]}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link
                  href={currentSlide.linkUrl || "/shop"}
                  className="px-8 py-3 rounded-full bg-gold-gradient text-charcoal font-bold hover:scale-105 inline-block transition-transform"
                >
                  {t("hero_cta")}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute start-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
          aria-label="prev"
        >
          <ChevronRight size={22} />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % heroSlides.length)}
          className="absolute end-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
          aria-label="next"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-3 h-3 rounded-full transition-colors ${i === slide ? "bg-gold" : "bg-white/50"}`}
              aria-label={`slide ${i}`}
            />
          ))}
        </div>
      </section>

      {/* Trust bar - moved here from bottom of QualitySection, directly below the hero */}
      <TrustBar />

      {/* Categories - auto-advancing slider */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-20">
          <Reveal>
            <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
              {t("our_categories")}
            </h2>
          </Reveal>
          <CategoriesSlider categories={categories} />
        </section>
      )}

      {/* Latest products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
            {t("latest_products")}
          </h2>
        </Reveal>
        <ProductSlider products={latest} />
        <Reveal className="text-center mt-10">
          <Link href="/shop" className="px-8 py-3 rounded-full border-2 border-gold text-goldDark font-bold hover:bg-gold hover:text-white transition-colors">
            {t("view_all")}
          </Link>
        </Reveal>
      </section>

      {/* About */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal y={0} x={-50}>
            <motion.img
              src={aboutImage || furnitureImg("about-workshop", 700, 550)}
              alt="about"
              onError={onImgError}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-xl w-full h-full object-cover"
            />
          </Reveal>
          <Reveal y={0} x={50} delay={0.15}>
            <h2 className="font-playfair font-cairo text-3xl font-bold mb-6 text-gold-gradient">
              {aboutTitle?.[locale] || t("about_us_title")}
            </h2>
            <p className="text-charcoal/70 leading-relaxed mb-8">{aboutText?.[locale] || t("about_text")}</p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { n: "10+", l: t("stat_years") },
                { n: "5000+", l: t("stat_clients") },
                { n: "3", l: t("stat_branches") },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-3xl font-playfair font-bold text-goldDark">
                    <CountUpStat value={s.n} />
                  </div>
                  <div className="text-sm text-charcoal/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Best products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
            {t("best_products")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {best.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Design gallery (3D fanned card gallery, editable from /admin/gallery) */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-3 text-gold-gradient">
            {t("gallery_section_title")}
          </h2>
          <p className="text-center text-charcoal/60 mb-12 max-w-xl mx-auto">{t("gallery_section_sub")}</p>
        </Reveal>
        <Gallery3D slides={gallerySlides} />
      </section>

      {/* Crafted with Excellence - quality/craftsmanship section */}
      <QualitySection />

      {/* Secondary banner (editable from /admin/banners, position=home_secondary) */}
      <Reveal>
        <section className="relative h-80 overflow-hidden mx-4 md:mx-auto max-w-7xl rounded-2xl">
          <motion.img
            src={secondaryBanner?.image || furnitureImg("bedroom-banner", 1400, 500)}
            alt="banner"
            onError={onImgError}
            initial={{ scale: 1 }}
            whileInView={{ scale: 1.06 }}
            viewport={{ once: true }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/50 flex flex-col items-center justify-center text-center px-4">
            <h3 className="font-playfair font-cairo text-3xl font-bold text-ivory mb-3">
              {secondaryBanner?.title[locale] || t("bedrooms_banner_title")}
            </h3>
            <p className="text-ivory/90 mb-6">{secondaryBanner?.subtitle[locale] || t("bedrooms_banner_sub")}</p>
            <Link
              href={secondaryBanner?.linkUrl || "/shop?category=bedrooms"}
              className="px-6 py-2.5 rounded-full bg-gold-gradient text-charcoal font-bold hover:scale-105 transition-transform"
            >
              {t("view_all")}
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Offers */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Reveal>
          <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
            {t("offers_title")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal>
            <h2 className="font-playfair font-cairo text-3xl font-bold text-center mb-12 text-gold-gradient">
              {t("testimonials_title")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Reveal key={`${testimonial.name[locale]}-${i}`} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 20px 30px -12px rgba(0,0,0,0.15)" }}
                  transition={{ duration: 0.3 }}
                  className="bg-ivory rounded-2xl p-6 shadow-md h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={cldUrl(testimonial.image, 80)}
                      alt={testimonial.name[locale]}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-cairo font-bold">{testimonial.name[locale]}</div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={idx < testimonial.rating ? "fill-gold text-gold" : "text-charcoal/20"}
                          />
                        ))}
                      </div>
                      {testimonial.productName && (
                        <div className="text-xs text-charcoal/40 mt-0.5">
                          {locale === "ar" ? "عن: " : "About: "}
                          {testimonial.productName[locale]}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-charcoal/70 text-sm leading-relaxed">{testimonial.text[locale]}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - continuous auto-scrolling marquee */}
      <section className="py-16 overflow-hidden">
        <Reveal>
          <h2 className="font-playfair font-cairo text-2xl font-bold text-center mb-10 text-gold-gradient">
            {t("partners_title")}
          </h2>
        </Reveal>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-4 w-max animate-marquee">
            {[...partners, ...partners, ...partners].map((p, i) => (
              <div
                key={`${p}-${i}`}
                className="px-8 py-5 bg-white rounded-xl shadow text-charcoal/60 font-bold border border-gold/20 whitespace-nowrap"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <Reveal>
        <section className="mx-4 md:mx-auto max-w-7xl mb-20 rounded-2xl bg-gold-gradient px-8 py-16 text-center">
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
