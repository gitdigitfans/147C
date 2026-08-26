import Link from "next/link";
import { d1Query } from "@/lib/d1";
import { Plus } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import RememberListUrl from "./RememberListUrl";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; page?: string };
}) {
  const q = searchParams?.q || "";
  const category = searchParams?.category || "";
  const page = Math.max(1, Number(searchParams?.page) || 1);

  let whereSql = ` WHERE 1=1`;
  const params: any[] = [];
  if (q) {
    whereSql += ` AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.sku LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    whereSql += ` AND p.category_id = ?`;
    params.push(category);
  }

  const listSql = `SELECT p.id, p.name_ar, p.name_en, p.sku, p.slug, p.price, p.stock_qty, p.is_active, c.name_ar as category_name
              FROM products p LEFT JOIN categories c ON c.id = p.category_id${whereSql}
              ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  const listParams = [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE];

  const countSql = `SELECT COUNT(*) as total FROM products p${whereSql}`;

  let products: any[] = [];
  let categories: any[] = [];
  let totalCount = 0;
  let errorMsg = "";
  try {
    products = await d1Query(listSql, listParams);
    categories = await d1Query("SELECT id, name_ar FROM categories ORDER BY sort_order");
    const countRows = await d1Query<any>(countSql, params);
    totalCount = countRows?.[0]?.total || 0;
  } catch (e: any) {
    errorMsg = e.message;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    sp.set("page", String(p));
    return `/admin/products?${sp.toString()}`;
  }

  return (
    <div>
      <RememberListUrl />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">المنتجات</h1>
        <Link href="/admin/products/new" className="px-4 py-2 rounded-lg bg-gold-gradient text-white font-bold flex items-center gap-2 text-sm">
          <Plus size={16} /> منتج جديد
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          خطأ في الاتصال بقاعدة بيانات المنتجات (D1): {errorMsg}
        </div>
      )}

      <form method="get" className="flex flex-wrap gap-3 mb-4">
        <input name="q" defaultValue={q} placeholder="بحث بالاسم أو SKU" className="px-3 py-2 rounded-lg border border-gold/30 text-sm" />
        <select name="category" className="px-3 py-2 rounded-lg border border-gold/30 text-sm">
          <option value="" selected={!category}>كل التصنيفات</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id} selected={c.id === category}>{c.name_ar}</option>
          ))}
        </select>
        <button className="px-4 py-2 rounded-lg bg-charcoal text-white text-sm">بحث</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">SKU</th>
              <th className="text-start p-3">التصنيف</th>
              <th className="text-start p-3">السعر</th>
              <th className="text-start p-3">المخزون</th>
              <th className="text-start p-3">الحالة</th>
              <th className="text-start p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-charcoal/40">لا توجد منتجات بعد. أضف منتجك الأول.</td></tr>
            )}
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{p.name_ar}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.category_name || "-"}</td>
                <td className="p-3">{p.price?.toLocaleString()} ج.م</td>
                <td className="p-3">{p.stock_qty}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.is_active ? "مفعل" : "معطل"}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-goldDark font-bold hover:underline">تعديل</Link>
                  <DeleteProductButton id={p.id} name={p.name_ar} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 text-sm">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`px-3 py-1.5 rounded-lg border border-gold/30 ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-gold/10"}`}
          >
            السابق
          </Link>
          <span className="text-charcoal/60">صفحة {page} من {totalPages}</span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`px-3 py-1.5 rounded-lg border border-gold/30 ${page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-gold/10"}`}
          >
            التالي
          </Link>
        </div>
      )}
    </div>
  );
}
