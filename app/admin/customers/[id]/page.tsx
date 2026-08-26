import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminToggleButton from "./AdminToggleButton";
import RoleAssignSelect from "../../users/RoleAssignSelect";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user: me },
  } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase.from("profiles").select("roles(name)").eq("id", me?.id).single();
  const isSuperAdmin = (myProfile as any)?.roles?.name === "super_admin";

  const { data: customer } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_admin, role_id, created_at, roles(name_ar)")
    .eq("id", params.id)
    .maybeSingle();

  if (!customer) {
    notFound();
  }

  const [{ data: orders }, { data: addresses }, { data: roles }] = await Promise.all([
    supabase.from("orders").select("*").eq("user_id", params.id).order("created_at", { ascending: false }),
    supabase.from("addresses").select("*").eq("user_id", params.id),
    supabase.from("roles").select("*").order("name_ar"),
  ]);

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-charcoal/50 hover:text-goldDark transition-colors mb-4 inline-block">
        &rarr; رجوع للعملاء
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-charcoal">{(customer as any).full_name || "-"}</h1>
            <p className="text-sm text-charcoal/50">{(customer as any).phone || "-"}</p>
            <p className="text-xs text-charcoal/40 mt-1">
              عضو منذ {new Date((customer as any).created_at).toLocaleDateString("ar-EG")}
            </p>
          </div>

          {isSuperAdmin ? (
            <div className="flex items-center gap-3">
              {(customer as any).is_admin && (
                <RoleAssignSelect userId={(customer as any).id} currentRoleId={(customer as any).role_id} roles={roles ?? []} />
              )}
              <AdminToggleButton userId={(customer as any).id} isAdmin={(customer as any).is_admin} />
            </div>
          ) : (
            <span className="text-sm text-charcoal/50">
              {(customer as any).is_admin ? `أدمن (${(customer as any).roles?.name_ar || "-"})` : "عميل عادي"}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto mb-6">
        <div className="p-4 font-bold text-charcoal">الطلبات</div>
        {(orders ?? []).length === 0 ? (
          <p className="px-4 pb-4 text-sm text-charcoal/40">لا توجد طلبات</p>
        ) : (
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-charcoal/50 text-xs border-t border-b border-gold/10">
                <th className="text-start p-3">رقم الطلب</th>
                <th className="text-start p-3">الإجمالي</th>
                <th className="text-start p-3">الحالة</th>
                <th className="text-start p-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o: any) => (
                <tr key={o.id} className="border-b border-gold/5 last:border-0">
                  <td className="p-3 font-bold">
                    <Link href={`/admin/orders/${o.id}`} className="text-goldDark hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-3">{o.total?.toLocaleString()} ج.م</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-goldDark font-bold">{o.status}</span>
                  </td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 p-4">
        <div className="font-bold text-charcoal mb-3">العناوين</div>
        {(addresses ?? []).length === 0 ? (
          <p className="text-sm text-charcoal/40">لا توجد عناوين محفوظة</p>
        ) : (
          <ul className="space-y-2 text-sm text-charcoal/70">
            {(addresses ?? []).map((a: any) => (
              <li key={a.id}>
                {a.governorate} - {a.city} - {a.street} {a.building}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
