"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { furnitureImg } from "@/lib/data";

const GOLD = "#c9a15e";

type Step = 0 | 1 | 2 | 3 | 4;

export default function ShowroomPreloader({ onFinished }: { onFinished: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [reduced, setReduced] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setReduced(true);
      timeouts.current.push(setTimeout(() => onFinished(), 600));
      return () => timeouts.current.forEach(clearTimeout);
    }

    // Step A: gold line (0 -> 600ms)
    timeouts.current.push(setTimeout(() => setStep(1), 600));
    // Step B/C: wireframe room draws (structure, then furniture/details),
    // then crossfades to the real photo (600 -> 2600ms). Pushed back from
    // 2200ms to 2600ms so the extra sofa/rug/window elements (last one
    // starting at delay 1.1s + 0.5s duration = ~1.6s into this stage) have
    // a little breathing room to finish drawing before the crossfade.
    timeouts.current.push(setTimeout(() => setStep(3), 2600));
    // Step D: hold the revealed photo, then fade out the whole overlay
    // (2600 -> 3800ms hold, fade 3800 -> 4400ms) - same ~1200ms hold and
    // ~600ms fade durations as before, just shifted later by 400ms.
    timeouts.current.push(setTimeout(() => setStep(4), 3800));
    timeouts.current.push(setTimeout(() => onFinished(), 4400));

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduced) {
    return (
      <motion.div
        className="fixed inset-0 z-[9999] bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    );
  }

  const photoUrl = furnitureImg("preloader-room", 1600, 900);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      animate={{ opacity: step === 4 ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Step A: thin gold light line */}
      {step === 0 && (
        <motion.div
          className="h-[2px] w-2/3 max-w-md"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${GOLD} 50%, transparent 100%)`,
            boxShadow: `0 0 12px ${GOLD}, 0 0 24px ${GOLD}`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Step B / C: wireframe room, then crossfade to photo */}
      {(step === 1 || step === 2 || step === 3) && (
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence>
            {(step === 1 || step === 2) && (
              <motion.svg
                key="wireframe"
                viewBox="0 0 800 500"
                className="w-full max-w-3xl h-auto"
                style={{ filter: `drop-shadow(0 0 6px ${GOLD})` }}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Floor (perspective trapezoid) - drawn first */}
                <motion.path
                  d="M 100 420 L 700 420 L 560 300 L 240 300 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Back wall rectangle */}
                <motion.path
                  d="M 240 300 L 560 300 L 560 100 L 240 100 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Side wall converging lines (1-point perspective) */}
                <motion.path
                  d="M 100 420 L 240 300 M 100 60 L 240 100"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 700 420 L 560 300 M 700 60 L 560 100"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Ceiling outline connecting top corners */}
                <motion.path
                  d="M 100 60 L 700 60 L 560 100 L 240 100 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Furniture hint: console/fireplace rectangle */}
                <motion.path
                  d="M 330 300 L 330 250 L 470 250 L 470 300"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Furniture hint: pendant lamp (circle + line) */}
                <motion.path
                  d="M 400 60 L 400 130"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 400 130 m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Furniture detail: L-shaped sectional sofa on the left -
                    tall backrest arm + low chaise seat suggested with a
                    single connected outline */}
                <motion.path
                  d="M 130 405 L 130 345 L 260 345 L 260 325 L 325 325 L 325 405 L 260 405 L 260 370 L 130 370"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.75, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Furniture detail: rug outline beneath the seating area */}
                <motion.path
                  d="M 200 430 Q 200 402 232 402 L 470 402 Q 502 402 502 430 Q 502 458 470 458 L 232 458 Q 200 458 200 430 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.88, duration: 0.5, ease: "easeInOut" }}
                />
                {/* Furniture detail: floor-to-ceiling window / glass wall on the right */}
                <motion.path
                  d="M 470 282 L 470 118 L 552 118 L 552 282 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.0, duration: 0.5, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 511 118 L 511 282"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.05, duration: 0.4, ease: "easeInOut" }}
                />
                {/* Furniture detail: lounge chair facing the sectional, right side */}
                <motion.path
                  d="M 600 400 L 600 345 L 660 345 L 660 400 L 645 400 L 645 365 L 615 365 L 615 400 Z"
                  stroke={GOLD}
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.1, duration: 0.5, ease: "easeInOut" }}
                />
              </motion.svg>
            )}

            {step === 3 && (
              <motion.div
                key="photo"
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <motion.img
                  src={photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.08 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
