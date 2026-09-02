import { d1Query } from "@/lib/d1";
import { unstable_cache } from "next/cache";
import { getActiveCategories } from "@/lib/catalog";
import { categories as mockCategories, products as mockProducts } from "@/lib/data";
import ShopClient, { ShopCategoryVM, ShopProductVM } from "./ShopClient";

// Wrapped in unstable_cache: this query has no LIMIT by design (ShopClient
// filters/searches/sorts the full list entirely client-side), so without
// caching it re-scanned every active product (~441 rows, x2 correlated
// image subqueries each) on every single visit to /shop - the single
// biggest contributor to exhausting D1's free-tier rows-read quota. Now it
// runs at most once per 60s regardless of visitor count.
const fetchShopProducts = unstable_cache(
  async () => {
    try {
      return await d1Query<any>(
        "SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1 OFFSET 1) as hover_image FROM products p WHERE p.is_active=1"
      );
    } catch {
      return [];
    }
  },
  ["shop-products-active"],
  { revalidate: 60, tags: ["products"] }
);

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

export default async function ShopPage() {
  const [realCategories, realProducts] = await Promise.all([getActiveCategories(), fetchShopProducts()]);

  const categorySlugById = new Map(realCategories.map((c) => [c.id, c.slug]));

  const categories: ShopCategoryVM[] =
    realCategories.length > 0
      ? realCategories.map((c) => ({ slug: c.slug, name: { ar: c.name_ar, en: c.name_en } }))
      : mockCategories.map((c) => ({ slug: c.slug, name: c.name }));

  const colorOptionsByProduct = realProducts.length > 0 ? await fetchColorOptions(realProducts) : {};

  const products: ShopProductVM[] =
    realProducts.length > 0
      ? realProducts.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: { ar: p.name_ar, en: p.name_en },
          category: categorySlugById.get(p.category_id) || "",
          categoryId: p.category_id != null ? String(p.category_id) : undefined,
          price: p.price,
          oldPrice: p.old_price || undefined,
          image: p.image || undefined,
          hoverImage: p.hover_image || undefined,
          bestseller: !!p.is_bestseller,
          offer: !!p.is_offer,
          isMock: false,
          colorOptions: colorOptionsByProduct[String(p.id)],
          shortDesc: p.short_desc_ar || p.short_desc_en ? { ar: p.short_desc_ar || "", en: p.short_desc_en || "" } : undefined,
        }))
      : mockProducts.map((p) => ({
          id: p.id,
          slug: "",
          name: p.name,
          category: p.category,
          price: p.price,
          oldPrice: p.oldPrice,
          seed: p.seed,
          bestseller: p.bestseller,
          offer: p.offer,
          isMock: true,
        }));

  return <ShopClient categories={categories} products={products} />;
}
