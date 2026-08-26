"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignRole } from "../customers/actions";

export default function RoleAssignSelect({
  userId,
  currentRoleId,
  roles,
}: {
  userId: string;
  currentRoleId: string | null;
  roles: any[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={currentRoleId ?? ""}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await assignRole(userId, e.target.value || null);
          router.refresh();
        })
      }
      className="px-2 py-1 rounded-lg border border-gold/30 text-xs"
    >
      <option value="">بدون دور</option>
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name_ar}
        </option>
      ))}
    </select>
  );
}
