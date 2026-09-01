"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { onImgError } from "@/lib/imageFallback";
import { cldUrl } from "@/lib/cloudinaryUrl";

export interface GallerySlideItem {
  id: string;
  image: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  linkUrl?: string;
}

interface Gallery3DProps {
  slides: GallerySlideItem[];
}

export default function Gallery3D({ slides }: Gallery3DProps) {
  const { locale } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // The full "door hinge" 3D flip (rotateY up to 100deg with perspective)
  // can visually swing past the card's own box on some mobile browsers -
  // overflow-hidden on the wrapper clips it on modern engines, but a few
  // older mobile WebKit versions don't clip 3D-transformed content
  // reliably, which read as the whole page jumping/shifting left-right.
  // On small screens we sidestep the bug entirely by using a plain
  // fade+slide transition instead of the 3D flip - same content, no
  // rotateY, nothing that can ever extend past the card's own width.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const count = slides.length;

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % count);
    }, 5000);
  }, [count]);

  useEffect(() => {
    if (!paused) restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, restartTimer]);

  if (count === 0) return null;

  const goTo = (index: number, dir: 1 | -1) => {
    setDirection(dir);
    setActiveIndex(index);
    restartTimer();
  };

  const goNext = () => goTo((activeIndex + 1) % count, 1);
  const goPrev = () => goTo((activeIndex - 1 + count) % count, -1);

  const prevIndex = count > 1 ? (activeIndex - 1 + count) % count : null;
  const nextIndex = count > 1 ? (activeIndex + 1) % count : null;

  const active = slides[activeIndex];

  const CardImage = ({ slide }: { slide: GallerySlideItem }) => {
    const img = (
      <img
        src={cldUrl(slide.image, 800)}
        alt={slide.title[locale]}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover rounded-t-[2.5rem]"
      />
    );
    return slide.linkUrl ? <Link href={slide.linkUrl} className="block w-full h-full">{img}</Link> : img;
  };

  return (
    <div
      className="w-full flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative w-full max-w-3xl h-[380px] sm:h-[440px] flex items-center justify-center overflow-hidden"
        style={{ perspective: 1800, transformStyle: "preserve-3d" }}
      >
        {/* Prev peek card - nudges slightly on every transition so the
            whole composition feels alive, not just the center door. */}
        {prevIndex !== null && (
          <div className="hidden sm:block absolute left-0 md:left-4 w-[55%] max-w-[280px] h-[300px] opacity-60 z-10 pointer-events-none">
            <motion.div
              key={`prev-${active.id}`}
              className="w-full h-full rounded-t-[2.5rem] overflow-hidden"
              initial={{ rotateY: 26, scale: 0.74, x: -10 }}
              animate={{ rotateY: 15, scale: 0.8, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                transformOrigin: "right center",
                transformStyle: "preserve-3d",
                boxShadow: "0 8px 20px -8px rgba(0,0,0,0.25)",
              }}
            >
              <img src={cldUrl(slides[prevIndex].image, 500)} alt="" onError={onImgError} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-t-[2.5rem]" />
            </motion.div>
          </div>
        )}

        {/* Next peek card */}
        {nextIndex !== null && (
          <div className="hidden sm:block absolute right-0 md:right-4 w-[55%] max-w-[280px] h-[300px] opacity-60 z-10 pointer-events-none">
            <motion.div
              key={`next-${active.id}`}
              className="w-full h-full rounded-t-[2.5rem] overflow-hidden"
              initial={{ rotateY: -26, scale: 0.74, x: 10 }}
              animate={{ rotateY: -15, scale: 0.8, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
                boxShadow: "0 8px 20px -8px rgba(0,0,0,0.25)",
              }}
            >
              <img src={cldUrl(slides[nextIndex].image, 500)} alt="" onError={onImgError} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-t-[2.5rem]" />
            </motion.div>
          </div>
        )}

        {/* Center active card - genuine "door" hinge transition:
            the outgoing card swings away like a door being pushed open,
            pivoting on one vertical edge (transformOrigin at that edge,
            not the center) while its far edge sweeps back through 3D
            space; the incoming card is hinged on the opposite edge and
            swings closed into place, exactly mirroring a door closing.
            Direction-aware: moving "next" hinges left->right, "prev"
            mirrors it, so the door always swings the correct, intuitive
            way instead of appearing reversed. Slow, weighty expo-out
            easing (no fast/mechanical snap) plus a soft edge-blur and a
            faint rotateX tilt sell the sense of real hinged depth. */}
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={active.id}
            custom={direction}
            initial={
              isMobile
                ? { opacity: 0, y: 16 }
                : { rotateY: direction === 1 ? 100 : -100, rotateX: 2, opacity: 0, filter: "blur(8px)" }
            }
            animate={
              isMobile
                ? { opacity: 1, y: 0 }
                : { rotateY: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" }
            }
            exit={
              isMobile
                ? { opacity: 0, y: -16, transition: { duration: 0.4 } }
                : {
                    rotateY: direction === 1 ? -100 : 100,
                    rotateX: -2,
                    opacity: 0,
                    filter: "blur(8px)",
                    transition: { duration: 0.75, ease: [0.6, 0.04, 0.98, 0.34] },
                  }
            }
            transition={{ duration: isMobile ? 0.5 : 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={
              isMobile
                ? undefined
                : {
                    transformPerspective: 1400,
                    transformStyle: "preserve-3d",
                    transformOrigin: direction === 1 ? "right center" : "left center",
                  }
            }
            className="absolute z-20 w-[85%] sm:w-[60%] max-w-[340px] h-[340px] sm:h-[400px]"
          >
            {/* Nested wrapper carries its own idle bob animation, kept separate
                from the parent's rotateY flip transform so the two animation
                loops never fight over the same transform properties. */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-t-[2.5rem] overflow-hidden shadow-2xl relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="h-[70%]">
                <CardImage slide={active} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] rounded-2xl bg-charcoal px-5 py-4 shadow-lg text-center">
                <h3 className="font-playfair font-cairo text-lg sm:text-xl font-bold text-ivory mb-1">
                  {active.title[locale]}
                </h3>
                {(active.subtitle.ar || active.subtitle.en) && (
                  <p className="text-ivory/70 text-xs sm:text-sm">{active.subtitle[locale]}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow buttons */}
        {count > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="prev"
              className="absolute z-30 start-1 sm:start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={goNext}
              aria-label="next"
              className="absolute z-30 end-1 sm:end-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex gap-2 mt-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
              aria-label={`slide ${i}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeIndex ? "bg-gold" : "bg-charcoal/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
