import { d1Query } from "@/lib/d1";
import { categories as mockCategories } from "@/lib/data";
import CategoriesClient, { CategoryVM } from "./CategoriesClient";


export default async function CategoriesPage() {
  let realCategories: any[] = [];
  try {
    realCategories = await d1Query<any>("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order");
  } catch {
    realCategories = [];
  }

  let counts: any[] = [];
  try {
    counts = await d1Query<any>("SELECT category_id, COUNT(*) as count FROM products WHERE is_active=1 GROUP BY category_id");
  } catch {
    counts = [];
  }
  const countById = new Map(counts.map((c) => [c.category_id, c.count]));

  const categories: CategoryVM[] =
    realCategories.length > 0
      ? realCategories.map((c) => ({
          slug: c.slug,
          name: { ar: c.name_ar, en: c.name_en },
          seed: c.slug,
          image: c.image_url || undefined,
          iconKey: c.icon_key || undefined,
          iconUrl: c.icon_url || undefined,
          count: countById.get(c.id) || 0,
        }))
      : mockCategories.map((c) => ({ slug: c.slug, name: c.name, seed: c.seed, count: c.count }));

  return <CategoriesClient categories={categories} />;
}
