import { NextRequest, NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

// Mirrors the PRODUCT_SELECT pattern used on the homepage / shop page: pulls
// the primary + secondary image via correlated subqueries against
// product_images so batch-fetched products get the same hover-image behavior.
const PRODUCT_SELECT =
  "SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1 OFFSET 1) as hover_image FROM products p WHERE p.is_active=1";

// GET /api/products/batch?ids=1,2,3
// Used by the client-side guest wishlist (localStorage-based) to resolve
// stored product ids into full product details, since a server component
// cannot read localStorage.
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get("ids") || "";
    const ids = Array.from(
      new Set(
        idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      )
    );

    if (ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const placeholders = ids.map(() => "?").join(",");
    const rows = await d1Query<any>(`${PRODUCT_SELECT} AND p.id IN (${placeholders})`, ids);

    const products = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: { ar: row.name_ar, en: row.name_en },
      price: row.price,
      oldPrice: row.old_price ?? undefined,
      image: row.image || undefined,
      hoverImage: row.hover_image || undefined,
      bestseller: !!row.is_bestseller,
      offer: !!row.is_offer,
    }));

    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
