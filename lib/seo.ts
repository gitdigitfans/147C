import type { Metadata } from "next";

// The site has no locale-based URL routing (the AR/EN toggle in lib/i18n.tsx
// is client-side only, both languages serve from the same URL) - so every
// route has exactly one canonical URL regardless of the visitor's language
// choice, and there's nothing distinct to point an hreflang alternate at.
//
// No custom domain is configured in wrangler.toml (workers_dev = true, no
// routes/custom domain) - this IS the real production origin.
export const SITE_URL = "https://pharaoh-furniture.pharaoh-furniture.workers.dev";
export const SITE_NAME = "الفرعون للأثاث";
// No dedicated 1200x630 share image exists yet - using the brand logo
// (500x500) as the fallback. Square images render fine on Facebook/WhatsApp/
// Twitter (just not edge-to-edge like a landscape crop); swap this for a
// purpose-made 1200x630 asset in public/ later if a nicer share image is
// designed.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export interface BuildMetadataInput {
  /** Page-specific title, WITHOUT the site name suffix - this function appends it. */
  title: string;
  /** 140-160 chars recommended. */
  description: string;
  /** Path starting with "/", no trailing slash (e.g. "/shop/some-slug" or "/" for home). */
  path: string;
  /** Absolute image URL for Open Graph / Twitter Card. Falls back to DEFAULT_OG_IMAGE. */
  image?: string;
  /** Defaults to 1200x630; pass the real dimensions when using a non-standard image (e.g. the 500x500 logo fallback). */
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article" | "product";
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageWidth = 1200,
  imageHeight = 630,
  type = "website",
}: BuildMetadataInput): Metadata {
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const isDefaultImage = !image;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ar_EG",
      type: type === "product" ? "website" : type,
      images: [{ url: ogImage, width: isDefaultImage ? 500 : imageWidth, height: isDefaultImage ? 500 : imageHeight }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
