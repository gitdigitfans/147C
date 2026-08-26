"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePermission } from "./actions";

export default function PermissionsMatrix({ roles, permissions, rolePermissions, editable }: { roles: any[]; permissions: any[]; rolePermissions: any[]; editable: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function has(roleId: number, permId: number) {
    return rolePermissions.some((rp) => rp.role_id === roleId && rp.permission_id === permId);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gold/10 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="text-charcoal/50 text-xs border-b border-gold/10">
            <th className="text-start p-3">الصلاحية</th>
            {roles.map((r) => <th key={r.id} className="text-center p-3">{r.name_ar}</th>)}
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.id} className="border-b border-gold/5 last:border-0">
              <td className="p-3 font-bold">{perm.label_ar}</td>
              {roles.map((r) => (
                <td key={r.id} className="text-center p-3">
                  <input
                    type="checkbox"
                    disabled={!editable || pending}
                    defaultChecked={has(r.id, perm.id)}
                    onChange={(e) => startTransition(async () => { await togglePermission(r.id, perm.id, e.target.checked); router.refresh(); })}
                  />
                </td>
              ))}
            </tr>
          ))}
          {permissions.length === 0 && <tr><td colSpan={roles.length + 1} className="p-6 text-center text-charcoal/40">لا توجد صلاحيات معرّفة</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
