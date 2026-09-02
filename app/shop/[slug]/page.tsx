import { notFound } from "next/navigation";
import { d1Query } from "@/lib/d1";
import { unstable_cache } from "next/cache";
import { getSiteSettings } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { products as mockProducts, categories as mockCategories, furnitureImg } from "@/lib/data";
import ProductDetailClient, { type ProductVM, type RelatedVM, type ReviewVM } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

function mockSlugFor(p: { id: number; category: string }) {
  return `${p.category}-${p.id}`;
}

function parseMockSlug(slug: string): { category: string; id: number } | null {
  const parts = slug.split("-");
  const id = Number(parts[parts.length - 1]);
  if (Number.isNaN(id)) return null;
  const category = parts.slice(0, -1).join("-");
  if (!mockCategories.some((c) => c.slug === category)) return null;
  return { category, id };
}

// Wrapped in unstable_cache: force-dynamic (below) only opts this route out
// of Next's static rendering, it does NOT make the underlying D1 binding
// calls cacheable on their own - unstable_cache is what actually stops
// every single product-page view from re-hitting D1 (product pages are
// typically the highest-traffic page type on an e-commerce site).
const fetchDbProduct = unstable_cache(
  async (slug: string) => {
    const rows = await d1Query<any>(
      `SELECT p.*, c.slug as category_slug, c.name_ar as category_name_ar, c.name_en as category_name_en
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1 LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  },
  ["product-by-slug"],
  { revalidate: 60, tags: ["products"] }
);

const RELATED_RAIL_LIMIT = 5;

// `excludeIds` additionally excludes products already shown in an earlier
// rail on the same page (e.g. "similar" fetched first, so "related" and
// "also_bought" skip whatever "similar" already used) - this only applies to
// the automatic same-category fallback; an admin's explicit manual picks for
// a given relation_type are always honored as-is, even if they overlap with
// another section's picks, since that's a deliberate choice.
const fetchRelatedRail = unstable_cache(
  async (productId: string, categoryId: string, relationType: string, excludeIds: string[] = []): Promise<any[]> => {
  try {
    const explicit = await d1Query<any>(
      `SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image
       FROM product_relations pr JOIN products p ON p.id = pr.related_product_id
       WHERE pr.product_id = ? AND pr.relation_type = ? AND p.is_active = 1 LIMIT ${RELATED_RAIL_LIMIT}`,
      [productId, relationType]
    );
    if (explicit.length > 0) return explicit;

    const exclude = [productId, ...excludeIds];
    const placeholders = exclude.map(() => "?").join(",");
    const fresh = await d1Query<any>(
      `SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image
       FROM products p WHERE p.category_id = ? AND p.id NOT IN (${placeholders}) AND p.is_active = 1 ORDER BY p.created_at DESC LIMIT ${RELATED_RAIL_LIMIT}`,
      [categoryId, ...exclude]
    );

    // Small catalogs may not have enough distinct products left after
    // excluding what earlier rails on this page already used - rather than
    // showing an empty (hidden) section, backfill the remaining slots from
    // the same category even if that means reusing a product another rail
    // also shows. Only the current product itself is always excluded.
    if (fresh.length < RELATED_RAIL_LIMIT) {
      const stillExclude = [productId, ...fresh.map((p: any) => p.id)];
      const backfillPlaceholders = stillExclude.map(() => "?").join(",");
      const backfill = await d1Query<any>(
        `SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image
         FROM products p WHERE p.category_id = ? AND p.id NOT IN (${backfillPlaceholders}) AND p.is_active = 1 ORDER BY p.created_at DESC LIMIT ${RELATED_RAIL_LIMIT - fresh.length}`,
        [categoryId, ...stillExclude]
      );
      return [...fresh, ...backfill];
    }

    return fresh;
  } catch {
    return [];
  }
  },
  ["related-rail"],
  { revalidate: 60, tags: ["products"] }
);

function normalizeRelatedRow(row: any): RelatedVM {
  return {
    id: row.id,
    slug: row.slug,
    name: { ar: row.name_ar, en: row.name_en },
    price: row.price,
    image: row.image || furnitureImg(row.slug || `p-${row.id}`, 400, 320),
  };
}

async function fetchReviews(productId: string): Promise<ReviewVM[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.guest_name || "عميل",
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

async function isWishlisted(productId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

// Combines the 5 D1-only reads that previously ran as separate round trips
// in the Promise.all below into one cached helper per product id - reviews
// and wishlist status stay out of this (Supabase, and wishlist is
// per-user so must never be cached).
const fetchProductChildRows = unstable_cache(
  async (productId: string, isVariable: boolean) => {
    const [images, specs, faqs, attributeRows, attributeValueRows] = await Promise.all([
      d1Query<any>("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order", [productId]).catch(() => []),
      d1Query<any>("SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort_order", [productId]).catch(() => []),
      d1Query<any>("SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort_order", [productId]).catch(() => []),
      isVariable
        ? d1Query<any>("SELECT * FROM product_attributes WHERE product_id = ? ORDER BY sort_order", [productId]).catch(() => [])
        : Promise.resolve([]),
      isVariable
        ? d1Query<any>(
            `SELECT v.* FROM product_attribute_values v JOIN product_attributes a ON a.id = v.attribute_id WHERE a.product_id = ? ORDER BY v.sort_order`,
            [productId]
          ).catch(() => [])
        : Promise.resolve([]),
    ]);
    return { images, specs, faqs, attributeRows, attributeValueRows };
  },
  ["product-child-rows"],
  { revalidate: 60, tags: ["products"] }
);

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const settingsMap = await getSiteSettings();
  const whatsappNumber = settingsMap.whatsapp || "+201000000000";

  let dbProduct: any = null;
  try {
    dbProduct = await fetchDbProduct(slug);
  } catch {
    dbProduct = null;
  }

  if (dbProduct) {
    // Fetched sequentially (not Promise.all) so each later rail can exclude
    // whatever product ids the earlier rails already used - otherwise, when
    // there's no explicit admin selection, all 3 rails fall back to the same
    // "same category" query and end up showing identical products.
    const similar = await fetchRelatedRail(dbProduct.id, dbProduct.category_id, "similar");
    const related = await fetchRelatedRail(dbProduct.id, dbProduct.category_id, "related", similar.map((p: any) => p.id));
    const alsoBought = await fetchRelatedRail(
      dbProduct.id,
      dbProduct.category_id,
      "also_bought",
      [...similar.map((p: any) => p.id), ...related.map((p: any) => p.id)]
    );

    const [{ images, specs, faqs, attributeRows, attributeValueRows }, reviews, wishlisted] = await Promise.all([
      fetchProductChildRows(dbProduct.id, dbProduct.product_type === "variable"),
      fetchReviews(dbProduct.id),
      isWishlisted(dbProduct.id),
    ]);

    const attributes = attributeRows.map((a: any) => ({
      id: a.id,
      name: { ar: a.name_ar, en: a.name_en },
      values: attributeValueRows
        .filter((v: any) => v.attribute_id === a.id)
        .map((v: any) => ({
          id: v.id,
          value: { ar: v.value_ar, en: v.value_en },
          image_url: v.image_url || undefined,
          price_modifier: v.price_modifier ?? 0,
        })),
    }));

    const dimensionSpecs: { key: { ar: string; en: string }; value: { ar: string; en: string } }[] = [];
    if (dbProduct.length_cm) {
      dimensionSpecs.push({
        key: { ar: "الطول", en: "Length" },
        value: { ar: `${dbProduct.length_cm} سم`, en: `${dbProduct.length_cm} cm` },
      });
    }
    if (dbProduct.width_cm) {
      dimensionSpecs.push({
        key: { ar: "العرض", en: "Width" },
        value: { ar: `${dbProduct.width_cm} سم`, en: `${dbProduct.width_cm} cm` },
      });
    }
    if (dbProduct.height_cm) {
      dimensionSpecs.push({
        key: { ar: "الارتفاع", en: "Height" },
        value: { ar: `${dbProduct.height_cm} سم`, en: `${dbProduct.height_cm} cm` },
      });
    }

    const SHIPPING_RE = /(?:🚚|شحن|توصيل|التوصيل|مدة الشحن|مده الشحن|يتم التوصيل)[^\n]*/gi;

    const extractShipping = (text: string): string => {
      if (!text) return "";
      const m = text.match(SHIPPING_RE);
      if (!m) return "";
      let result = m[0].replace(/^[^\u0600-\u06FF\w]*/, "").trim();
      if (/\u0639\u0645\u0644/.test(result) && !/\u064a\u0648\u0645/.test(result)) {
        result = result.replace(/\u0639\u0645\u0644/g, "\u064a\u0648\u0645 \u0639\u0645\u0644");
      }
      return result;
    };

    const stripShipping = (text: string): string => {
      if (!text) return "";
      return text.replace(SHIPPING_RE, "").replace(/\n{3,}/g, "\n\n").trim();
    };

    const shippingAr = dbProduct.shipping_text || extractShipping(dbProduct.description_ar || "") || extractShipping(dbProduct.short_desc_ar || "");
    const shippingEn = extractShipping(dbProduct.description_en || "") || extractShipping(dbProduct.short_desc_en || "");

    const cleanDescAr = stripShipping(dbProduct.description_ar || "");
    const cleanDescEn = stripShipping(dbProduct.description_en || "");
    const cleanShortDescAr = stripShipping(dbProduct.short_desc_ar || "");
    const cleanShortDescEn = stripShipping(dbProduct.short_desc_en || "");

    const product: ProductVM = {
      id: dbProduct.id,
      slug: dbProduct.slug,
      name: { ar: dbProduct.name_ar, en: dbProduct.name_en },
      description: { ar: cleanDescAr || cleanShortDescAr || "", en: cleanDescEn || cleanShortDescEn || "" },
      shortDescription:
        cleanShortDescAr || cleanShortDescEn
          ? { ar: cleanShortDescAr, en: cleanShortDescEn }
          : undefined,
      price: dbProduct.price,
      oldPrice: dbProduct.old_price ?? undefined,
      categoryName: { ar: dbProduct.category_name_ar || "", en: dbProduct.category_name_en || "" },
      categoryId: dbProduct.category_id != null ? String(dbProduct.category_id) : undefined,
      images:
        images.length > 0
          ? images.map((im: any) => im.url)
          : [furnitureImg(dbProduct.slug, 800, 600)],
      videoUrl: dbProduct.video_url || undefined,
      specs: [
        ...dimensionSpecs,
        ...specs.map((s: any) => ({ key: { ar: s.spec_key_ar, en: s.spec_key_en }, value: { ar: s.spec_value_ar, en: s.spec_value_en } })),
      ],
      faqs: faqs.map((f: any) => ({ question: { ar: f.question_ar, en: f.question_en }, answer: { ar: f.answer_ar, en: f.answer_en } })),
      inStock: dbProduct.stock_status !== "out_of_stock",
      isMock: false,
      viewerCountMin: dbProduct.viewer_count_min ?? undefined,
      viewerCountMax: dbProduct.viewer_count_max ?? undefined,
      shippingText: shippingAr || shippingEn ? { ar: shippingAr, en: shippingEn } : undefined,
      categorySlug: dbProduct.category_slug || undefined,
    };

    return (
      <ProductDetailClient
        product={product}
        similar={similar.map(normalizeRelatedRow)}
        related={related.map(normalizeRelatedRow)}
        alsoBought={alsoBought.map(normalizeRelatedRow)}
        reviews={reviews}
        initialWishlisted={wishlisted}
        whatsappNumber={whatsappNumber}
        attributes={attributes}
      />
    );
  }

  // Fallback: mock product (used by /shop listing cards when D1 has no matching row)
  const parsed = parseMockSlug(slug);
  if (!parsed) {
    notFound();
  }

  const mock = mockProducts.find((p) => p.id === parsed!.id && p.category === parsed!.category);
  if (!mock) {
    notFound();
  }

  const category = mockCategories.find((c) => c.slug === mock!.category);
  const sameCategoryMocks = mockProducts.filter((p) => p.category === mock!.category && p.id !== mock!.id);

  const product: ProductVM = {
    id: String(mock!.id),
    slug: mockSlugFor(mock!),
    name: mock!.name,
    description: {
      ar: "منتج فاخر من تشكيلة الفرعون للأثاث، مصنوع من أجود الخامات الطبيعية بتشطيب احترافي دقيق.",
      en: "A luxury piece from the Pharaoh Furniture collection, crafted from the finest natural materials with precise professional finishing.",
    },
    price: mock!.price,
    oldPrice: mock!.oldPrice,
    categoryName: category?.name || { ar: "", en: "" },
    images: [furnitureImg(mock!.seed, 800, 600), furnitureImg(mock!.seed + "-2", 800, 600), furnitureImg(mock!.seed + "-3", 800, 600)],
    videoUrl: undefined,
    specs: [
      { key: { ar: "الخامة", en: "Material" }, value: { ar: "خشب طبيعي", en: "Natural Wood" } },
      { key: { ar: "بلد الصنع", en: "Made In" }, value: { ar: "مصر", en: "Egypt" } },
      { key: { ar: "الضمان", en: "Warranty" }, value: { ar: "سنتان", en: "2 Years" } },
    ],
    faqs: [
      {
        question: { ar: "هل يمكن التخصيص حسب المقاس؟", en: "Can this be customized to size?" },
        answer: { ar: "نعم، يمكننا تصنيع المنتج حسب مقاسات مساحتك.", en: "Yes, we can manufacture the product to fit your space." },
      },
    ],
    inStock: true,
    isMock: true,
  };

  const relatedVM: RelatedVM[] = sameCategoryMocks.slice(0, 8).map((p) => ({
    id: String(p.id),
    slug: mockSlugFor(p),
    name: p.name,
    price: p.price,
    image: furnitureImg(p.seed, 400, 320),
  }));

  const reviews = await fetchReviews(String(mock!.id));
  const wishlisted = await isWishlisted(String(mock!.id));

  return (
    <ProductDetailClient
      product={product}
      similar={relatedVM}
      related={relatedVM}
      alsoBought={relatedVM}
      reviews={reviews}
      initialWishlisted={wishlisted}
      whatsappNumber={whatsappNumber}
    />
  );
}
