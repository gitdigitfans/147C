import type { Metadata } from "next";
import { categories as mockCategories } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { getActiveCategories, getCategoryCounts } from "@/lib/catalog";
import CategoriesClient, { CategoryVM } from "./CategoriesClient";

export const metadata: Metadata = buildMetadata({
  title: "الأقسام",
  description:
    "تصفح أقسام الفرعون للأثاث: غرف نوم، صالونات، غرف سفرة، انتريهات، غرف أطفال وأكثر - اختر القسم المناسب لاكتشاف تشكيلة كاملة من قطع الأثاث الفاخرة.",
  path: "/categories",
});


export default async function CategoriesPage() {
  const [realCategories, counts] = await Promise.all([getActiveCategories(), getCategoryCounts()]);
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
