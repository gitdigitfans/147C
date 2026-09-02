"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useLocale } from "@/lib/i18n";

// Mirrors WhatsAppFloatButton's fixed-position pattern, but pinned to the
// physical right edge (start-* in RTL) instead of the left (end-*), per the
// site being Arabic/RTL by default.
export default function ConsultationFloatButton() {
  const { t } = useLocale();

  return (
    <motion.div
      className="fixed bottom-40 sm:bottom-6 start-6 z-30"
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Link
        href="/consultation"
        aria-label={t("nav_consultation")}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold to-goldDark shadow-lg text-white hover:scale-110 active:scale-95 transition-transform"
      >
        <MessageSquareText size={26} />
      </Link>
    </motion.div>
  );
}
