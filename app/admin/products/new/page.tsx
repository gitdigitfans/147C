import { d1Query } from "@/lib/d1";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";


export default async function NewProductPage() {
  let categories: any[] = [];
  let allProducts: any[] = [];
  try {
    categories = await d1Query("SELECT id, name_ar, name_en FROM categories ORDER BY sort_order");
    allProducts = await d1Query("SELECT id, name_ar FROM products ORDER BY name_ar");
  } catch {
    // ignore until D1 env vars configured
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">منتج جديد</h1>
      <ProductForm categories={categories} allProducts={allProducts} />
    </div>
  );
}
