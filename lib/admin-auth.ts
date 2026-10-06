import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureOwner, getAdmin } from "@/lib/menu-store";

export async function getAuthenticatedAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = await getAdmin(user.id) ?? await ensureOwner(user.id, user.email);
  return admin ? { userId: user.id, email: user.email, role: admin.role } : null;
}

export async function requireAuthenticatedAdmin() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
