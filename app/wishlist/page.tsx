import { d1Query } from "@/lib/d1";
import { createClient } from "@/lib/supabase/server";
import WishlistClient, { type WishlistProductVM } from "./WishlistClient";

// Mirrors the PRODUCT_SELECT pattern used on the homepage / shop page: pulls
// the primary + secondary image via correlated subqueries against
// product_images so wishlist cards get the same hover-image behavior.
const PRODUCT_SELECT =
  "SELECT p.*, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1) as image, (SELECT url FROM product_images WHERE product_id=p.id ORDER BY is_primary DESC, sort_order LIMIT 1 OFFSET 1) as hover_image FROM products p";

export default async function WishlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <WishlistClient products={[]} loggedIn={false} />;
  }

  let wishlistRows: { product_id: string }[] = [];
  try {
    const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
    wishlistRows = data || [];
  } catch {
    wishlistRows = [];
  }

  const productIds = Array.from(new Set(wishlistRows.map((r) => r.product_id).filter(Boolean)));

  let products: WishlistProductVM[] = [];
  if (productIds.length > 0) {
    try {
      const placeholders = productIds.map(() => "?").join(",");
      const rows = await d1Query<any>(`${PRODUCT_SELECT} WHERE p.id IN (${placeholders})`, productIds);
      products = rows.map((row) => ({
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
    } catch {
      products = [];
    }
  }

  return <WishlistClient products={products} loggedIn={true} />;
}
