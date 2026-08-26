import { d1Query } from "@/lib/d1";
import ProductForm from "../../ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  let categories: any[] = [];
  let allProducts: any[] = [];
  let productRows: any[] = [];
  let images: any[] = [];
  let specs: any[] = [];
  let faqs: any[] = [];
  let relations: any[] = [];
  let attributeRows: any[] = [];
  let attributeValueRows: any[] = [];

  try {
    categories = await d1Query("SELECT id, name_ar, name_en FROM categories ORDER BY sort_order");
    allProducts = await d1Query("SELECT id, name_ar FROM products ORDER BY name_ar");
    productRows = await d1Query("SELECT * FROM products WHERE id = ?", [id]);
    images = await d1Query("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order", [id]);
    specs = await d1Query("SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort_order", [id]);
    faqs = await d1Query("SELECT * FROM product_faqs WHERE product_id = ? ORDER BY sort_order", [id]);
    relations = await d1Query("SELECT * FROM product_relations WHERE product_id = ?", [id]);
    attributeRows = await d1Query("SELECT * FROM product_attributes WHERE product_id = ? ORDER BY sort_order", [id]);
    attributeValueRows = await d1Query(
      `SELECT v.* FROM product_attribute_values v JOIN product_attributes a ON a.id = v.attribute_id WHERE a.product_id = ? ORDER BY v.sort_order`,
      [id]
    );
  } catch {
    // ignore until D1 env vars configured
  }

  const product = productRows[0];
  if (!product) {
    notFound();
  }

  const initial = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name_ar: product.name_ar,
    name_en: product.name_en,
    short_desc_ar: product.short_desc_ar,
    short_desc_en: product.short_desc_en,
    description_ar: product.description_ar,
    description_en: product.description_en,
    category_id: product.category_id,
    price: product.price,
    old_price: product.old_price,
    cost_price: product.cost_price,
    stock_qty: product.stock_qty,
    video_url: product.video_url,
    is_bestseller: !!product.is_bestseller,
    is_offer: !!product.is_offer,
    is_ready_to_pickup: !!product.is_ready_to_pickup,
    is_active: !!product.is_active,
    seo_title_ar: product.seo_title_ar,
    seo_title_en: product.seo_title_en,
    seo_description_ar: product.seo_description_ar,
    seo_description_en: product.seo_description_en,
    images: images.map((im) => ({
      url: im.url,
      publicId: im.cloudinary_public_id,
      altAr: im.alt_ar,
      altEn: im.alt_en,
      isPrimary: !!im.is_primary,
    })),
    specs: specs.map((s) => ({
      keyAr: s.spec_key_ar,
      keyEn: s.spec_key_en,
      valueAr: s.spec_value_ar,
      valueEn: s.spec_value_en,
    })),
    faqs: faqs.map((f) => ({
      questionAr: f.question_ar,
      questionEn: f.question_en,
      answerAr: f.answer_ar,
      answerEn: f.answer_en,
    })),
    relatedIds: relations.filter((r) => r.relation_type === "related").map((r) => r.related_product_id),
    similarIds: relations.filter((r) => r.relation_type === "similar").map((r) => r.related_product_id),
    alsoBoughtIds: relations.filter((r) => r.relation_type === "also_bought").map((r) => r.related_product_id),
    product_type: product.product_type || "simple",
    length_cm: product.length_cm,
    width_cm: product.width_cm,
    height_cm: product.height_cm,
    viewer_count: product.viewer_count,
    shipping_text: product.shipping_text,
    attributes: attributeRows.map((a) => ({
      id: a.id,
      name_ar: a.name_ar,
      name_en: a.name_en,
      values: attributeValueRows
        .filter((v) => v.attribute_id === a.id)
        .map((v) => ({
          id: v.id,
          value_ar: v.value_ar,
          value_en: v.value_en,
          image_url: v.image_url,
          price_modifier: v.price_modifier ?? 0,
        })),
    })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">تعديل المنتج</h1>
      <ProductForm categories={categories} allProducts={allProducts} initial={initial} />
    </div>
  );
}
