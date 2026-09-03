import type { Metadata } from "next";
import { d1Query } from "@/lib/d1";
import { buildMetadata } from "@/lib/seo";
import GalleryClient from "./GalleryClient";
import type { GallerySlideItem } from "@/components/Gallery3D";

export const metadata: Metadata = buildMetadata({
  title: "معرض الصور",
  description:
    "لمحة من أجمل تصاميم وتنفيذات الفرعون للأثاث - استعرض معرض الصور لتصاميم غرف النوم والصالونات والسفرة الفاخرة، واستلهم أفكارك قبل ما تختار قطعتك المفضلة.",
  path: "/gallery",
});

function normalizeDbGallerySlide(row: any): GallerySlideItem {
  return {
    id: row.id,
    image: row.image_url,
    title: { ar: row.title_ar || "", en: row.title_en || "" },
    subtitle: { ar: row.subtitle_ar || "", en: row.subtitle_en || "" },
    linkUrl: row.link_url || undefined,
  };
}

async function fetchGallerySlides() {
  try {
    return await d1Query<any>("SELECT * FROM gallery_slides WHERE is_active=1 ORDER BY sort_order", []);
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const rows = await fetchGallerySlides();
  const items: GallerySlideItem[] = rows.map(normalizeDbGallerySlide);

  return <GalleryClient items={items} />;
}
