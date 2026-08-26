import Link from "next/link";
import { createClient } from "@/lib/supabase/server";


export default async function AdminCustomersPage() {
  const supabase = createClient();
  const query = supabase
    .from("profiles")
    .select("id, full_name, phone, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const { data: customers } = await query;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">العملاء</h1>
      <form className="mb-4">
        <input name="q" defaultValue="" placeholder="بحث بالاسم أو الهاتف" className="px-3 py-2 rounded-lg border border-gold/30 text-sm w-72" />
      </form>
      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">الهاتف</th>
              <th className="text-start p-3">تاريخ التسجيل</th>
              <th className="text-start p-3">مسؤول؟</th>
              <th className="text-start p-3">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-charcoal/40">
                  لا يوجد عملاء
                </td>
              </tr>
            )}
            {(customers ?? []).map((c: any) => (
              <tr key={c.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{c.full_name || "-"}</td>
                <td className="p-3">{c.phone || "-"}</td>
                <td className="p-3">{new Date(c.created_at).toLocaleDateString("ar-EG")}</td>
                <td className="p-3">
                  {c.is_admin ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-goldDark font-bold">نعم</span>
                  ) : (
                    "لا"
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/admin/customers/${c.id}`} className="text-goldDark font-bold hover:underline">
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
