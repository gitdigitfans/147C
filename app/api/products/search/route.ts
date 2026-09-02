import { NextRequest, NextResponse } from "next/server";
import { d1Query } from "@/lib/d1";

// GET /api/products/search?q=...
// Powers the instant-results dropdown in the mobile bottom nav search box -
// a small, indexed-by-name lookup instead of shipping the entire catalog
// to filter client-side (which is what /shop's full page load already does).
export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ products: [] });

    const like = `%${q}%`;
    const rows = await d1Query<any>(
      `SELECT p.id, p.slug, p.name_ar, p.name_en, p.price,
        (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image
       FROM products p
       WHERE p.is_active=1 AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.sku LIKE ?)
       ORDER BY p.name_ar
       LIMIT 6`,
      [like, like, like]
    );

    const products = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: { ar: row.name_ar, en: row.name_en },
      price: row.price,
      image: row.image || undefined,
    }));

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
