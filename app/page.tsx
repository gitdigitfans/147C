import type { Metadata } from "next";
import { d1Query } from "@/lib/d1";
import { unstable_cache } from "next/cache";
import { buildMetadata } from "@/lib/seo";
import { getActiveCategories, getCategoryCounts } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { products as mockProducts, heroSlides as mockHeroSlides, testimonials as mockTestimonials, categories as mockCategories, furnitureImg } from "@/lib/data";
import HomeClient, { type NormalizedProduct, type NormalizedHero, type NormalizedTestimonial, type NormalizedSecondaryBanner } from "./HomeClient";
import type { GallerySlideItem } from "@/components/Gallery3D";
import type { CategoryVM } from "@/components/CategoriesSlider";


export const metadata: Metadata = buildMetadata({
  title: "الفرعون للأثاث | أثاث منزلي وفندقي فاخر مصنوع في مصر",
  description:
    "تسوق أفضل تشكيلات غرف النوم والصالونات والسفرة من الفرعون للأثاث - تصميم وتصنيع أثاث فاخر بخامات عالية الجودة وضمان حقيقي، مع توصيل لجميع محافظات مصر.",
  path: "/",
});

function mockSlug(product: { id: number; category: string }) {
  return `${product.category}-${product.id}`;
}

function normalizeMockProduct(p: (typeof mockProducts)[number]): NormalizedProduct {
  return {
    id: p.id,
    slug: mockSlug(p),
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    image: furnitureImg(p.seed, 500, 400),
    bestseller: !!p.bestseller,
    offer: !!p.offer,
  };
}

function normalizeDbProduct(row: any, colorOptionsByProduct?: Record<string, { id: string; value: { ar: string; en: string }; image?: string }[]>): NormalizedProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: { ar: row.name_ar, en: row.name_en },
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    image: row.image || furnitureImg(row.slug || `product-${row.id}`, 500, 400),
    hoverImage: row.hover_image || undefined,
    bestseller: !!row.is_bestseller,
    offer: !!row.is_offer,
    colorOptions: colorOptionsByProduct?.[String(row.id)],
    shortDesc: row.short_desc_ar || row.short_desc_en ? { ar: row.short_desc_ar || "", en: row.short_desc_en || "" } : undefined,
    categoryId: row.category_id != null ? String(row.category_id) : undefined,
  };
}

// For variable products, fetch their first "color"-like attribute (matched by
// name containing لون / "color") and its values, to power the small
// color-swatch selector on listing cards. Uses only existing attribute tables.
async function fetchColorOptions(rows: any[]) {
  const variableIds = Array.from(new Set(rows.filter((r) => r.product_type === "variable").map((r) => r.id)));
  if (variableIds.length === 0) return {} as Record<string, { id: string; value: { ar: string; en: string }; image?: string }[]>;
  try {
    const placeholders = variableIds.map(() => "?").join(",");
    const attrRows = await d1Query<any>(
      `SELECT pa.id as attr_id, pa.product_id, pav.id as value_id, pav.value_ar, pav.value_en, pav.image_url, pav.sort_order
       FROM product_attributes pa
       JOIN product_attribute_values pav ON pav.attribute_id = pa.id
       WHERE pa.product_id IN (${placeholders})
         AND (LOWER(pa.name_ar) LIKE '%لون%' OR LOWER(pa.name_en) LIKE '%color%')
       ORDER BY pa.sort_order, pav.sort_order`,
      variableIds
    );
    const map: Record<string, { id: string; value: { ar: string; en: string }; image?: string }[]> = {};
    const seenAttrByProduct: Record<string, number> = {};
    for (const row of attrRows) {
      const pid = String(row.product_id);
      // only use the first color attribute encountered per product
      if (seenAttrByProduct[pid] !== undefined && seenAttrByProduct[pid] !== row.attr_id) continue;
      seenAttrByProduct[pid] = row.attr_id;
      if (!map[pid]) map[pid] = [];
      map[pid].push({
        id: String(row.value_id),
        value: { ar: row.value_ar || "", en: row.value_en || "" },
        image: row.image_url || undefined,
      });
    }
    return map;
  } catch {
    return {};
  }
}

function normalizeMockHero(h: (typeof mockHeroSlides)[number]): NormalizedHero {
  return {
    image: furnitureImg(h.seed, 1600, 900),
    title: h.title,
    subtitle: h.subtitle,
  };
}

function normalizeDbBanner(row: any): NormalizedHero {
  return {
    image: row.image_url,
    title: { ar: row.title_ar || "", en: row.title_en || "" },
    subtitle: { ar: row.subtitle_ar || "", en: row.subtitle_en || "" },
    linkUrl: row.link_url || undefined,
    mediaType: row.media_type || "image",
    videoUrl: row.video_url || undefined,
  };
}

function normalizeMockTestimonial(t: (typeof mockTestimonials)[number]): NormalizedTestimonial {
  return {
    name: t.name,
    text: t.text,
    rating: t.rating,
    image: furnitureImg(t.seed, 80, 80),
  };
}

function normalizeDbReview(row: any, productMap: Record<string, { name_ar: string; name_en: string }>): NormalizedTestimonial {
  const name = row.guest_name || "عميل";
  const product = row.product_id ? productMap[row.product_id] : undefined;
  return {
    name: { ar: name, en: name },
    text: { ar: row.body || "", en: row.body || "" },
    rating: row.rating || 5,
    image: furnitureImg(`review-${row.id}`, 80, 80),
    productName: product ? { ar: product.name_ar, en: product.name_en } : undefined,
  };
}

async function fetchTestimonialProductNames(rows: any[]) {
  const productIds = Array.from(new Set(rows.map((r) => r.product_id).filter(Boolean)));
  if (productIds.length === 0) return {} as Record<string, { name_ar: string; name_en: string }>;
  try {
    const placeholders = productIds.map(() => "?").join(",");
    const products = await d1Query<any>(`SELECT id, name_ar, name_en FROM products WHERE id IN (${placeholders})`, productIds);
    const map: Record<string, { name_ar: string; name_en: string }> = {};
    products.forEach((p: any) => {
      map[p.id] = { name_ar: p.name_ar, name_en: p.name_en };
    });
    return map;
  } catch {
    return {};
  }
}

const PRODUCT_SELECT =
  "SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1 OFFSET 1) as hover_image FROM products p WHERE p.is_active=1";

// Wrapped in unstable_cache: the D1 Worker binding bypasses Next's fetch
// cache entirely, so without this every homepage view re-ran this query
// (called 3x below) plus every other D1 read on this page, on every visit -
// see lib/catalog.ts for the same rationale applied to the shared helpers.
const fetchProducts = unstable_cache(
  async (extraWhere: string, params: any[] = [], limit = 8) => {
    try {
      return await d1Query<any>(`${PRODUCT_SELECT} ${extraWhere} ORDER BY p.created_at DESC LIMIT ${limit}`, params);
    } catch {
      return [];
    }
  },
  ["home-products"],
  { revalidate: 60, tags: ["products"] }
);

const fetchBanners = unstable_cache(
  async () => {
    try {
      return await d1Query<any>("SELECT * FROM banners WHERE position='home_hero' AND is_active=1 ORDER BY sort_order", []);
    } catch {
      return [];
    }
  },
  ["home-hero-banners"],
  { revalidate: 60, tags: ["banners"] }
);

const fetchSecondaryBanner = unstable_cache(
  async (): Promise<NormalizedSecondaryBanner | undefined> => {
    try {
      const rows = await d1Query<any>(
        "SELECT * FROM banners WHERE position='home_secondary' AND is_active=1 ORDER BY sort_order LIMIT 1",
        []
      );
      const row = rows[0];
      if (!row) return undefined;
      return {
        image: row.image_url,
        title: { ar: row.title_ar || "", en: row.title_en || "" },
        subtitle: { ar: row.subtitle_ar || "", en: row.subtitle_en || "" },
        linkUrl: row.link_url || "/shop",
      };
    } catch {
      return undefined;
    }
  },
  ["home-secondary-banner"],
  { revalidate: 60, tags: ["banners"] }
);

function normalizeDbGallerySlide(row: any): GallerySlideItem {
  return {
    id: row.id,
    image: row.image_url,
    title: { ar: row.title_ar || "", en: row.title_en || "" },
    subtitle: { ar: row.subtitle_ar || "", en: row.subtitle_en || "" },
    linkUrl: row.link_url || undefined,
  };
}

const fetchGallerySlides = unstable_cache(
  async () => {
    try {
      return await d1Query<any>("SELECT * FROM gallery_slides WHERE is_active=1 ORDER BY sort_order", []);
    } catch {
      return [];
    }
  },
  ["home-gallery-slides"],
  { revalidate: 60, tags: ["gallery"] }
);

const fetchAboutSettings = unstable_cache(
  async () => {
    try {
      return await d1Query<any>("SELECT key, value FROM site_settings WHERE group_name = 'about'", []);
    } catch {
      return [];
    }
  },
  ["home-about-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);

async function fetchTestimonials() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("rating", { ascending: false })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [latestRows, bestRows, offerRows, bannerRows, reviewRows, aboutSettingsRows, secondaryBanner, gallerySlideRows, categoryRows, categoryCountRows] = await Promise.all([
    fetchProducts("", [], 8),
    fetchProducts("AND p.is_bestseller=1", [], 8),
    fetchProducts("AND p.is_offer=1", [], 8),
    fetchBanners(),
    fetchTestimonials(),
    fetchAboutSettings(),
    fetchSecondaryBanner(),
    fetchGallerySlides(),
    getActiveCategories(),
    getCategoryCounts(),
  ]);

  const colorOptionsByProduct = await fetchColorOptions([...latestRows, ...bestRows, ...offerRows]);

  const latest = latestRows.length > 0 ? latestRows.map((r) => normalizeDbProduct(r, colorOptionsByProduct)) : mockProducts.slice(0, 8).map(normalizeMockProduct);
  const best = bestRows.length > 0 ? bestRows.map((r) => normalizeDbProduct(r, colorOptionsByProduct)) : mockProducts.filter((p) => p.bestseller).map(normalizeMockProduct);
  const offers = offerRows.length > 0 ? offerRows.map((r) => normalizeDbProduct(r, colorOptionsByProduct)) : mockProducts.filter((p) => p.offer).map(normalizeMockProduct);
  const heroSlides = bannerRows.length > 0 ? bannerRows.map(normalizeDbBanner) : mockHeroSlides.map(normalizeMockHero);
  const testimonialProductMap = await fetchTestimonialProductNames(reviewRows);
  const testimonials =
    reviewRows.length > 0
      ? reviewRows.map((row: any) => normalizeDbReview(row, testimonialProductMap))
      : mockTestimonials.map(normalizeMockTestimonial);

  const aboutMap: Record<string, string> = {};
  aboutSettingsRows.forEach((r: any) => { aboutMap[r.key] = r.value; });
  const aboutImage = aboutMap["about_image"] || undefined;
  const aboutTitle = (aboutMap["about_title_ar"] || aboutMap["about_title_en"])
    ? { ar: aboutMap["about_title_ar"] || "", en: aboutMap["about_title_en"] || "" }
    : undefined;
  const aboutText = (aboutMap["about_text_ar"] || aboutMap["about_text_en"])
    ? { ar: aboutMap["about_text_ar"] || "", en: aboutMap["about_text_en"] || "" }
    : undefined;

  const gallerySlides: GallerySlideItem[] =
    gallerySlideRows.length > 0
      ? gallerySlideRows.map(normalizeDbGallerySlide)
      : [
          {
            id: "gal-fallback-1",
            image: furnitureImg("gallery-1", 700, 550),
            title: { ar: "غرفة نوم فاخرة", en: "Luxury Bedroom" },
            subtitle: { ar: "تصميم عصري وأناقة خالدة", en: "Modern design, timeless elegance" },
          },
          {
            id: "gal-fallback-2",
            image: furnitureImg("gallery-2", 700, 550),
            title: { ar: "صالون كلاسيك", en: "Classic Salon" },
            subtitle: { ar: "دفء وراحة في كل التفاصيل", en: "Warmth and comfort in every detail" },
          },
          {
            id: "gal-fallback-3",
            image: furnitureImg("gallery-3", 700, 550),
            title: { ar: "سفرة أنيقة", en: "Elegant Dining" },
            subtitle: { ar: "لحظات عائلية لا تُنسى", en: "Unforgettable family moments" },
          },
        ];

  const countByCategoryId = new Map(categoryCountRows.map((c: any) => [c.category_id, c.count]));
  const categories: CategoryVM[] =
    categoryRows.length > 0
      ? categoryRows.map((c: any) => ({
          slug: c.slug,
          name: { ar: c.name_ar, en: c.name_en },
          seed: c.slug,
          image: c.image_url || undefined,
          iconKey: c.icon_key || undefined,
          iconUrl: c.icon_url || undefined,
          count: countByCategoryId.get(c.id) || 0,
        }))
      : mockCategories.map((c) => ({ slug: c.slug, name: c.name, seed: c.seed, count: c.count }));

  return (
    <HomeClient
      latest={latest}
      best={best}
      offers={offers}
      heroSlides={heroSlides}
      testimonials={testimonials}
      aboutImage={aboutImage}
      aboutTitle={aboutTitle}
      aboutText={aboutText}
      secondaryBanner={secondaryBanner}
      gallerySlides={gallerySlides}
      categories={categories}
    />
  );
}
