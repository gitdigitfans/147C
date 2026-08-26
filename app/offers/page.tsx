import { d1Query } from "@/lib/d1";
import OffersClient, { OfferVM } from "./OffersClient";

interface OfferRow {
  id: number | string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  category_id: number | string | null;
  product_id: number | string | null;
  banner_image: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: number;
  show_in_topbar: number;
  show_as_popup: number;
  created_at: string;
  code: string | null;
  category_slug: string | null;
  category_name_ar: string | null;
  category_name_en: string | null;
}

interface OfferProductRow {
  offer_id: number | string;
  id: number | string;
  slug: string;
  name_ar: string;
  name_en: string;
}

async function getActiveOffers() {
  try {
    return await d1Query<OfferRow>(
      `SELECT o.*, c.slug as category_slug, c.name_ar as category_name_ar, c.name_en as category_name_en
       FROM offers o LEFT JOIN categories c ON c.id = o.category_id
       WHERE o.is_active = 1
       AND (o.starts_at IS NULL OR o.starts_at <= date('now'))
       AND (o.ends_at IS NULL OR o.ends_at >= date('now'))
       ORDER BY o.created_at DESC`,
      []
    );
  } catch {
    return [];
  }
}

async function getOfferProducts() {
  try {
    return await d1Query<OfferProductRow>(
      `SELECT op.offer_id, p.id, p.slug, p.name_ar, p.name_en
       FROM offer_products op
       JOIN products p ON p.id = op.product_id`,
      []
    );
  } catch {
    return [];
  }
}

export default async function OffersPage() {
  const [offers, offerProducts] = await Promise.all([getActiveOffers(), getOfferProducts()]);

  const productsByOffer = new Map<string, OfferProductRow[]>();
  for (const row of offerProducts) {
    const key = String(row.offer_id);
    if (!productsByOffer.has(key)) productsByOffer.set(key, []);
    productsByOffer.get(key)!.push(row);
  }

  const offerVMs: OfferVM[] = offers.map((o) => ({
    id: o.id,
    title_ar: o.title_ar,
    title_en: o.title_en,
    description_ar: o.description_ar,
    description_en: o.description_en,
    discount_type: o.discount_type,
    discount_value: o.discount_value,
    max_discount_amount: o.max_discount_amount,
    min_order_amount: o.min_order_amount,
    banner_image: o.banner_image,
    code: o.code,
    category_slug: o.category_slug,
    category_name_ar: o.category_name_ar,
    category_name_en: o.category_name_en,
    products: (productsByOffer.get(String(o.id)) || []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name_ar: p.name_ar,
      name_en: p.name_en,
    })),
  }));

  return <OffersClient offers={offerVMs} />;
}
