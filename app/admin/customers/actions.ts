"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Only the super_admin role may grant/revoke admin access or reassign roles.
// This is enforced here (not just in the UI) so the action can't be called
// directly by a non-super-admin even if they bypass the client-side check.
async function assertSuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: me } = await supabase.from("profiles").select("roles(name)").eq("id", user.id).single();
  const roleName = (me as any)?.roles?.name;
  if (roleName !== "super_admin") throw new Error("Only the super admin can manage admin access and roles");

  return supabase;
}

export async function toggleIsAdmin(targetUserId: string, makeAdmin: boolean) {
  const supabase = await assertSuperAdmin();

  const update: Record<string, unknown> = { is_admin: makeAdmin };
  // Revoking admin also clears the assigned role so they fall back to a plain customer.
  if (!makeAdmin) update.role_id = null;

  const { error } = await supabase.from("profiles").update(update).eq("id", targetUserId);
  if (error) throw error;

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${targetUserId}`);
  revalidatePath("/admin/users");
}

export async function assignRole(userId: string, roleId: string | null) {
  const supabase = await assertSuperAdmin();

  const { error } = await supabase.from("profiles").update({ role_id: roleId }).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/users");
}
