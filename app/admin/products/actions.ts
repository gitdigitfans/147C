"use server";

import { randomUUID } from "crypto";
import { d1Query, d1Execute, d1Batch, D1BatchStatement } from "@/lib/d1";
import { revalidatePath, revalidateTag } from "next/cache";

export interface ProductImageInput {
  url: string;
  publicId?: string;
  altAr?: string;
  altEn?: string;
  isPrimary?: boolean;
}
export interface SpecInput {
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
}
export interface FaqInput {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface AttributeValueInput {
  id?: string;
  value_ar: string;
  value_en: string;
  image_url?: string;
  price_modifier: number;
}
export interface AttributeInput {
  id?: string;
  name_ar: string;
  name_en: string;
  values: AttributeValueInput[];
}

export interface ProductFormData {
  id?: string;
  sku: string;
  slug: string;
  name_ar: string;
  name_en: string;
  short_desc_ar?: string;
  short_desc_en?: string;
  description_ar?: string;
  description_en?: string;
  category_id: string;
  price: number;
  old_price?: number | null;
  cost_price?: number | null;
  stock_qty: number;
  video_url?: string;
  is_bestseller: boolean;
  is_offer: boolean;
  is_ready_to_pickup: boolean;
  is_active: boolean;
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_description_ar?: string;
  seo_description_en?: string;
  images: ProductImageInput[];
  specs: SpecInput[];
  faqs: FaqInput[];
  relatedIds: string[];
  similarIds: string[];
  alsoBoughtIds: string[];
  product_type: "simple" | "variable";
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  viewer_count_min?: number | null;
  viewer_count_max?: number | null;
  shipping_text?: string | null;
  attributes: AttributeInput[];
}

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  // revalidatePath alone does not bust unstable_cache entries - these tags
  // match the ones used in lib/catalog.ts, app/page.tsx, app/shop/page.tsx,
  // and app/shop/[slug]/page.tsx so a product save/delete is reflected on
  // the next request instead of waiting out the 60s cache TTL.
  revalidateTag("products");
  revalidateTag("categories");
}

export async function getCategoriesForSelect() {
  return d1Query("SELECT id, name_ar, name_en FROM categories ORDER BY sort_order");
}

export async function saveProduct(data: ProductFormData) {
  const now = new Date().toISOString();
  let id = data.id;

  if (!id) {
    id = `prod_${randomUUID()}`;
    await d1Execute(
      `INSERT INTO products (id, sku, slug, name_ar, name_en, short_desc_ar, short_desc_en, description_ar, description_en, category_id, price, old_price, cost_price, stock_qty, video_url, is_bestseller, is_offer, is_ready_to_pickup, is_active, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, product_type, length_cm, width_cm, height_cm, viewer_count_min, viewer_count_max, shipping_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.sku?.trim() || null, data.slug, data.name_ar, data.name_en, data.short_desc_ar || null, data.short_desc_en || null,
        data.description_ar || null, data.description_en || null, data.category_id, data.price, data.old_price ?? null,
        data.cost_price ?? null, data.stock_qty ?? 0, data.video_url || null,
        data.is_bestseller ? 1 : 0, data.is_offer ? 1 : 0, data.is_ready_to_pickup ? 1 : 0, data.is_active ? 1 : 0,
        data.seo_title_ar || null, data.seo_title_en || null, data.seo_description_ar || null, data.seo_description_en || null,
        data.product_type || "simple", data.length_cm ?? null, data.width_cm ?? null, data.height_cm ?? null,
        data.viewer_count_min ?? null, data.viewer_count_max ?? null, data.shipping_text || null,
        now, now,
      ]
    );
  } else {
    await d1Execute(
      `UPDATE products SET sku=?, slug=?, name_ar=?, name_en=?, short_desc_ar=?, short_desc_en=?, description_ar=?, description_en=?, category_id=?, price=?, old_price=?, cost_price=?, stock_qty=?, video_url=?, is_bestseller=?, is_offer=?, is_ready_to_pickup=?, is_active=?, seo_title_ar=?, seo_title_en=?, seo_description_ar=?, seo_description_en=?, product_type=?, length_cm=?, width_cm=?, height_cm=?, viewer_count_min=?, viewer_count_max=?, shipping_text=?, updated_at=? WHERE id=?`,
      [
        data.sku?.trim() || null, data.slug, data.name_ar, data.name_en, data.short_desc_ar || null, data.short_desc_en || null,
        data.description_ar || null, data.description_en || null, data.category_id, data.price, data.old_price ?? null,
        data.cost_price ?? null, data.stock_qty ?? 0, data.video_url || null,
        data.is_bestseller ? 1 : 0, data.is_offer ? 1 : 0, data.is_ready_to_pickup ? 1 : 0, data.is_active ? 1 : 0,
        data.seo_title_ar || null, data.seo_title_en || null, data.seo_description_ar || null, data.seo_description_en || null,
        data.product_type || "simple", data.length_cm ?? null, data.width_cm ?? null, data.height_cm ?? null,
        data.viewer_count_min ?? null, data.viewer_count_max ?? null, data.shipping_text || null,
        now, id,
      ]
    );
  }

  // Replace child rows - batched into a single D1 round trip instead of one
  // await per statement, which could exceed the Worker's time budget and
  // crash the save for products with many images/specs/relations.
  const statements: D1BatchStatement[] = [
    { sql: `DELETE FROM product_images WHERE product_id = ?`, params: [id] },
    { sql: `DELETE FROM product_specs WHERE product_id = ?`, params: [id] },
    { sql: `DELETE FROM product_faqs WHERE product_id = ?`, params: [id] },
    { sql: `DELETE FROM product_relations WHERE product_id = ?`, params: [id] },
    {
      sql: `DELETE FROM product_attribute_values WHERE attribute_id IN (SELECT id FROM product_attributes WHERE product_id = ?)`,
      params: [id],
    },
    { sql: `DELETE FROM product_attributes WHERE product_id = ?`, params: [id] },
  ];

  for (let i = 0; i < data.images.length; i++) {
    const img = data.images[i];
    statements.push({
      sql: `INSERT INTO product_images (id, product_id, url, cloudinary_public_id, alt_ar, alt_en, sort_order, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [`pimg_${randomUUID()}`, id, img.url, img.publicId || null, img.altAr || null, img.altEn || null, i, img.isPrimary ? 1 : 0],
    });
  }
  for (let i = 0; i < data.specs.length; i++) {
    const s = data.specs[i];
    statements.push({
      sql: `INSERT INTO product_specs (id, product_id, spec_key_ar, spec_key_en, spec_value_ar, spec_value_en, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [`pspec_${randomUUID()}`, id, s.keyAr, s.keyEn, s.valueAr, s.valueEn, i],
    });
  }
  for (let i = 0; i < data.faqs.length; i++) {
    const f = data.faqs[i];
    statements.push({
      sql: `INSERT INTO product_faqs (id, product_id, question_ar, question_en, answer_ar, answer_en, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [`pfaq_${randomUUID()}`, id, f.questionAr, f.questionEn, f.answerAr, f.answerEn, i],
    });
  }
  for (const relId of data.relatedIds || []) {
    statements.push({
      sql: `INSERT INTO product_relations (id, product_id, related_product_id, relation_type) VALUES (?, ?, ?, ?)`,
      params: [`prel_${randomUUID()}`, id, relId, "related"],
    });
  }
  for (const relId of data.similarIds || []) {
    statements.push({
      sql: `INSERT INTO product_relations (id, product_id, related_product_id, relation_type) VALUES (?, ?, ?, ?)`,
      params: [`prel_${randomUUID()}`, id, relId, "similar"],
    });
  }
  for (const relId of data.alsoBoughtIds || []) {
    statements.push({
      sql: `INSERT INTO product_relations (id, product_id, related_product_id, relation_type) VALUES (?, ?, ?, ?)`,
      params: [`prel_${randomUUID()}`, id, relId, "also_bought"],
    });
  }

  for (let i = 0; i < (data.attributes || []).length; i++) {
    const attr = data.attributes[i];
    const attrId = `attr_${randomUUID()}`;
    statements.push({
      sql: `INSERT INTO product_attributes (id, product_id, name_ar, name_en, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      params: [attrId, id, attr.name_ar, attr.name_en, i, now],
    });
    for (let j = 0; j < (attr.values || []).length; j++) {
      const v = attr.values[j];
      statements.push({
        sql: `INSERT INTO product_attribute_values (id, attribute_id, value_ar, value_en, image_url, price_modifier, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [`val_${randomUUID()}`, attrId, v.value_ar, v.value_en, v.image_url || null, v.price_modifier ?? 0, j, now],
      });
    }
  }

  await d1Batch(statements);

  revalidateAll();
  revalidatePath(`/products/${data.slug}`);
  return { id };
}

export async function deleteProduct(id: string) {
  await d1Execute(`DELETE FROM product_images WHERE product_id = ?`, [id]);
  await d1Execute(`DELETE FROM product_specs WHERE product_id = ?`, [id]);
  await d1Execute(`DELETE FROM product_faqs WHERE product_id = ?`, [id]);
  await d1Execute(`DELETE FROM product_relations WHERE product_id = ? OR related_product_id = ?`, [id, id]);
  await d1Execute(`DELETE FROM product_attribute_values WHERE attribute_id IN (SELECT id FROM product_attributes WHERE product_id = ?)`, [id]);
  await d1Execute(`DELETE FROM product_attributes WHERE product_id = ?`, [id]);
  await d1Execute(`DELETE FROM products WHERE id = ?`, [id]);
  revalidateAll();
}
