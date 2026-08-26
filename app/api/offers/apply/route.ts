import { NextRequest, NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

interface ReqItem {
  id: string;
  categoryId?: string;
  price: number;
  qty: number;
}

interface OfferRow {
  id: string;
  title_ar: string;
  title_en: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  category_id: string | null;
  code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: number;
}

function computeEligible(offer: OfferRow, productIdSet: Set<string> | null, items: ReqItem[]) {
  if (productIdSet && productIdSet.size > 0) {
    return items.filter((i) => productIdSet.has(String(i.id)));
  }
  if (offer.category_id) {
    return items.filter((i) => i.categoryId != null && String(i.categoryId) === String(offer.category_id));
  }
  return items.slice();
}

function computeDiscount(offer: OfferRow, eligibleSubtotal: number) {
  if (offer.discount_type === "free_shipping") {
    return { freeShipping: true as const, discountAmount: 0 };
  }
  let discountAmount = 0;
  if (offer.discount_type === "percentage") {
    discountAmount = (eligibleSubtotal * Number(offer.discount_value)) / 100;
    if (offer.max_discount_amount != null) {
      discountAmount = Math.min(discountAmount, Number(offer.max_discount_amount));
    }
  } else {
    // fixed
    discountAmount = Number(offer.discount_value);
  }
  discountAmount = Math.min(discountAmount, eligibleSubtotal);
  discountAmount = Math.max(0, discountAmount);
  return { freeShipping: false as const, discountAmount };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: ReqItem[] = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal) || 0;
    const code: string | undefined = typeof body.code === "string" ? body.code.trim() : undefined;

    const now = new Date();

    const offers = await d1Query<OfferRow>(
      `SELECT * FROM offers WHERE is_active = 1
       AND (starts_at IS NULL OR starts_at <= ?)
       AND (ends_at IS NULL OR ends_at >= ?)`,
      [now.toISOString(), now.toISOString()]
    );

    if (offers.length === 0) {
      return NextResponse.json({ applied: false, message: code ? "invalid" : undefined });
    }

    const offerIds = offers.map((o) => o.id);
    let productLinks: { offer_id: string; product_id: string }[] = [];
    if (offerIds.length > 0) {
      const placeholders = offerIds.map(() => "?").join(",");
      productLinks = await d1Query<any>(
        `SELECT offer_id, product_id FROM offer_products WHERE offer_id IN (${placeholders})`,
        offerIds
      );
    }
    const productsByOffer = new Map<string, Set<string>>();
    for (const link of productLinks) {
      if (!productsByOffer.has(link.offer_id)) productsByOffer.set(link.offer_id, new Set());
      productsByOffer.get(link.offer_id)!.add(String(link.product_id));
    }

    function isEligibleOffer(offer: OfferRow) {
      // date bounds already filtered at query level
      if (offer.min_order_amount != null && subtotal < Number(offer.min_order_amount)) {
        return false;
      }
      const productIdSet = productsByOffer.get(offer.id) || null;
      const eligibleItems = computeEligible(offer, productIdSet, items);
      if (eligibleItems.length === 0) return false;
      return true;
    }

    function buildResult(offer: OfferRow) {
      const productIdSet = productsByOffer.get(offer.id) || null;
      const eligibleItems = computeEligible(offer, productIdSet, items);
      const eligibleSubtotal = eligibleItems.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);
      const { freeShipping, discountAmount } = computeDiscount(offer, eligibleSubtotal);
      return {
        applied: true,
        discountAmount,
        freeShipping: freeShipping || undefined,
        title: offer.title_ar || offer.title_en,
        offerId: offer.id,
        eligibleItemIds: eligibleItems.map((i) => i.id),
      };
    }

    if (code) {
      // Branch B: explicit code lookup.
      const match = offers.find((o) => (o.code || "").trim() === code);
      if (!match) {
        return NextResponse.json({ applied: false, message: "invalid" });
      }
      if (match.min_order_amount != null && subtotal < Number(match.min_order_amount)) {
        return NextResponse.json({ applied: false, message: "min_order" });
      }
      const productIdSet = productsByOffer.get(match.id) || null;
      const eligibleItems = computeEligible(match, productIdSet, items);
      if (eligibleItems.length === 0) {
        return NextResponse.json({ applied: false, message: "invalid" });
      }
      return NextResponse.json(buildResult(match));
    }

    // Branch A: automatic discount - only offers with no code set.
    const candidates = offers.filter((o) => !o.code || o.code.trim() === "").filter(isEligibleOffer);
    if (candidates.length === 0) {
      return NextResponse.json({ applied: false });
    }

    // Pick the one with the largest resulting discount amount. For
    // free_shipping offers there's no numeric amount to compare against a
    // percentage/fixed offer directly - treat free_shipping as a fallback
    // that only wins if nothing else offers a bigger numeric discount.
    let best: { offer: OfferRow; discountAmount: number; freeShipping: boolean } | null = null;
    for (const offer of candidates) {
      const productIdSet = productsByOffer.get(offer.id) || null;
      const eligibleItems = computeEligible(offer, productIdSet, items);
      const eligibleSubtotal = eligibleItems.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);
      const { freeShipping, discountAmount } = computeDiscount(offer, eligibleSubtotal);
      if (!best) {
        best = { offer, discountAmount, freeShipping };
        continue;
      }
      if (discountAmount > best.discountAmount) {
        best = { offer, discountAmount, freeShipping };
      }
    }

    if (!best) {
      return NextResponse.json({ applied: false });
    }

    return NextResponse.json(buildResult(best.offer));
  } catch (err: any) {
    return NextResponse.json({ applied: false, message: "invalid" }, { status: 500 });
  }
}
