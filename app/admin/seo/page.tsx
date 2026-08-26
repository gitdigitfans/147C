import { d1Query } from "@/lib/d1";
import SeoFormModal from "./SeoFormModal";
import DeleteSeoButton from "./DeleteSeoButton";

export const dynamic = "force-dynamic";


export default async function AdminSeoPage() {
  let entries: any[] = [];
  let errorMsg = "";
  try { entries = await d1Query("SELECT * FROM seo_settings ORDER BY scope"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">إعدادات SEO</h1>
        <SeoFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">النطاق</th><th className="text-start p-3">العنوان</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {entries.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-charcoal/40">لا توجد إعدادات SEO بعد</td></tr>}
            {entries.map((e: any) => (
              <tr key={e.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{e.scope}</td>
                <td className="p-3">{e.title_ar}</td>
                <td className="p-3 flex gap-2"><SeoFormModal initial={e} /><DeleteSeoButton id={e.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
