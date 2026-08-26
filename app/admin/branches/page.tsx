import { d1Query } from "@/lib/d1";
import BranchFormModal from "./BranchFormModal";
import DeleteBranchButton from "./DeleteBranchButton";

export const dynamic = "force-dynamic";


export default async function AdminBranchesPage() {
  let branches: any[] = [];
  let errorMsg = "";
  try { branches = await d1Query("SELECT * FROM branches ORDER BY sort_order"); } catch (e: any) { errorMsg = e.message; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal">الفروع</h1>
        <BranchFormModal />
      </div>
      {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">خطأ D1: {errorMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-charcoal/50 text-xs border-b border-gold/10"><th className="text-start p-3">الاسم</th><th className="text-start p-3">المحافظة</th><th className="text-start p-3">الهاتف</th><th className="text-start p-3">الحالة</th><th className="text-start p-3">إجراءات</th></tr></thead>
          <tbody>
            {branches.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-charcoal/40">لا توجد فروع بعد</td></tr>}
            {branches.map((b: any) => (
              <tr key={b.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{b.name_ar}</td>
                <td className="p-3">{b.governorate}</td>
                <td className="p-3">{b.phone}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${b.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{b.is_active ? "مفعل" : "معطل"}</span></td>
                <td className="p-3 flex gap-2"><BranchFormModal initial={{ ...b, is_active: !!b.is_active }} /><DeleteBranchButton id={b.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
