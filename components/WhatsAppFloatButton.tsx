"use client";

import { motion } from "framer-motion";

interface WhatsAppFloatButtonProps {
  phoneNumber: string;
}

// Small inline SVG WhatsApp glyph, matching the same pattern used for
// the custom PinterestIcon in components/Footer.tsx (lucide-react has
// no WhatsApp icon, so we ship our own).
function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#ffffff"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 0C5.44 0 .11 5.33.11 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.6 0 11.93-5.33 11.93-11.93 0-3.19-1.24-6.19-3.5-8.44A11.86 11.86 0 0 0 12.04 0zm0 21.8h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.72.98.99-3.63-.24-.37a9.83 9.83 0 0 1-1.5-5.27c0-5.44 4.43-9.87 9.88-9.87a9.8 9.8 0 0 1 6.98 2.9 9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.43 9.87-9.9 9.87zm5.42-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.37-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

// Same phone normalization logic as app/shop/[slug]/ProductDetailClient.tsx's
// whatsappHref builder: strip everything but digits, then if it looks like a
// local Egyptian mobile number (01xxxxxxxxx, no country code) prefix "20".
function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/[^\d]/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `20${digits.slice(1)}`;
  }
  return digits || "201000000000";
}

export default function WhatsAppFloatButton({ phoneNumber }: WhatsAppFloatButtonProps) {
  const normalized = normalizePhone(phoneNumber);
  const message = "مرحباً، أنا مهتم بمنتجات الفرعون للأثاث";
  const href = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-20 sm:bottom-6 end-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center"
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <WhatsAppIcon size={28} />
    </motion.a>
  );
}
