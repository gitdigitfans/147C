import { d1Query } from "@/lib/d1";
import ArticleFormModal from "./ArticleFormModal";
import DeleteArticleButton from "./DeleteArticleButton";

export const dynamic = "force-dynamic";


export default async function AdminArticlesPage() {
  let articles: any[] = [];
  let errorMsg = "";
  try { articles = await d1Query("SELECT * FROM articles ORDER BY created_at DESC"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">المقالات</h1>
        <ArticleFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">العنوان</th><th className="text-start p-3">الكاتب</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {articles.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-charcoal/40">لا توجد مقالات</td></tr>}
            {articles.map((a: any) => (
              <tr key={a.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{a.title_ar}</td>
                <td className="p-3">{a.author || "-"}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${a.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{a.is_published ? "منشور" : "مسودة"}</span></td>
                <td className="p-3 flex gap-2"><ArticleFormModal initial={{ ...a, is_published: !!a.is_published }} /><DeleteArticleButton id={a.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
