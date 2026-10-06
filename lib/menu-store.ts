import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultMenu, isMenuData, type MenuData } from "@/lib/menu-data";

export type AdminRole = "owner" | "editor";
export type AdminRecord = { userId: string; email: string; role: AdminRole };

function configured() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }

export async function readMenu(): Promise<MenuData> {
  if (!configured()) return defaultMenu;
  try {
    const { data, error } = await createAdminClient().from("site_content").select("data").eq("id", "menu").maybeSingle();
    if (error || !isMenuData(data?.data)) return defaultMenu;
    return data.data;
  } catch { return defaultMenu; }
}

export async function saveMenu(menu: MenuData, userId: string) {
  const updatedAt = new Date().toISOString();
  const { error } = await createAdminClient().from("site_content").upsert({ id: "menu", data: menu, updated_at: updatedAt, updated_by: userId });
  if (error) throw new Error(error.message);
  return updatedAt;
}

export async function getAdmin(userId: string) {
  const { data } = await createAdminClient().from("admins").select("user_id,email,role").eq("user_id", userId).maybeSingle();
  return data ? { userId: data.user_id, email: data.email, role: data.role as AdminRole } : null;
}

export async function ensureOwner(userId: string, email: string) {
  const current = await getAdmin(userId);
  if (current) return current;
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || email.toLowerCase() !== ownerEmail) return null;
  const { count } = await createAdminClient().from("admins").select("user_id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return null;
  const { error } = await createAdminClient().from("admins").insert({ user_id: userId, email: email.toLowerCase(), role: "owner" });
  if (error) throw new Error(error.message);
  return getAdmin(userId);
}

export async function listAdmins() {
  const { data, error } = await createAdminClient().from("admins").select("user_id,email,role").order("role", { ascending: false }).order("email");
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({ userId: row.user_id, email: row.email, role: row.role as AdminRole }));
}
