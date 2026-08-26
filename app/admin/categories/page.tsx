import { d1Query } from "@/lib/d1";
import CategoryRow from "./CategoryRow";
import CategoryFormModal from "./CategoryFormModal";

export const dynamic = "force-dynamic";


export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  let errorMsg = "";
  try {
    categories = await d1Query("SELECT * FROM categories ORDER BY sort_order");
  } catch (e: any) {
    errorMsg = e.message;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">التصنيفات</h1>
        <CategoryFormModal categories={categories} />
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">الصورة</th>
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">Slug</th>
              <th className="text-start p-3">الترتيب</th>
              <th className="text-start p-3">الحالة</th>
              <th className="text-start p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c: any) => (
              <CategoryRow key={c.id} category={c} allCategories={categories} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
