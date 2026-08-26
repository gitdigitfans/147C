import { createClient } from "@/lib/supabase/server";
import RoleAssignSelect from "./RoleAssignSelect";
import PermissionsMatrix from "./PermissionsMatrix";


export default async function AdminUsersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("roles(name)").eq("id", user?.id).single();
  const isSuperAdmin = (me as any)?.roles?.name === "super_admin";

  const { data: admins } = await supabase.from("profiles").select("id, full_name, phone, role_id, roles(name_ar)").eq("is_admin", true);
  const { data: roles } = await supabase.from("roles").select("*").order("name_ar");
  const { data: permissions } = await supabase.from("permissions").select("*").order("label_ar");
  const { data: rolePermissions } = await supabase.from("role_permissions").select("*");

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mb-6">مستخدمو الإدارة</h1>
      <p className="text-sm text-charcoal/50 mb-4">
        لترقية عميل عادي إلى أدمن، اذهب لصفحة "العملاء" واختر العميل ثم فعّل صلاحية الأدمن من صفحته.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-charcoal/50 text-xs border-b border-gold/10">
              <th className="text-start p-3">الاسم</th>
              <th className="text-start p-3">الهاتف</th>
              <th className="text-start p-3">الدور</th>
            </tr>
          </thead>
          <tbody>
            {(admins ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-charcoal/40">
                  لا يوجد مسؤولون بعد
                </td>
              </tr>
            )}
            {(admins ?? []).map((a: any) => (
              <tr key={a.id} className="border-b border-gold/5 last:border-0">
                <td className="p-3 font-bold">{a.full_name || "-"}</td>
                <td className="p-3">{a.phone || "-"}</td>
                <td className="p-3">
                  {isSuperAdmin ? (
                    <RoleAssignSelect userId={a.id} currentRoleId={a.role_id} roles={roles ?? []} />
                  ) : (
                    a.roles?.name_ar || "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold text-charcoal mb-4">مصفوفة الصلاحيات</h2>
      {!isSuperAdmin && <p className="text-sm text-charcoal/50 mb-4">للعرض فقط - فقط المدير العام (super_admin) يمكنه التعديل.</p>}
      <PermissionsMatrix roles={roles ?? []} permissions={permissions ?? []} rolePermissions={rolePermissions ?? []} editable={isSuperAdmin} />
    </div>
  );
}
