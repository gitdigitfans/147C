"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertSuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: me } = await supabase.from("profiles").select("roles(name)").eq("id", user.id).single();
  const roleName = (me as any)?.roles?.name;
  if (roleName !== "super_admin") throw new Error("Only the super admin can manage permissions");

  return supabase;
}

export async function togglePermission(roleId: string, permissionId: string, granted: boolean) {
  const supabase = await assertSuperAdmin();

  if (granted) {
    const { error } = await supabase
      .from("role_permissions")
      .upsert({ role_id: roleId, permission_id: permissionId }, { onConflict: "role_id,permission_id" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId);
    if (error) throw error;
  }

  revalidatePath("/admin/users");
}
