import { d1Query } from "@/lib/d1";
import GalleryClient from "./GalleryClient";
import type { GallerySlideItem } from "@/components/Gallery3D";

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
