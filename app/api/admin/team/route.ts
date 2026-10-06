import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAdmins } from "@/lib/menu-store";

type AdminClient = ReturnType<typeof createAdminClient>;

async function findUserIdByEmail(supabase: AdminClient, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const match = data.users.find(user => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

export async function POST(request: Request) {
  const current = await getAuthenticatedAdmin();
  if (!current) return Response.json({ error: "Sesión requerida" }, { status: 401 });
  if (current.role !== "owner") return Response.json({ error: "Solo el propietario puede sumar editores." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Ingresá un email válido." }, { status: 400 });
  const supabase = createAdminClient();
  const redirectTo = new URL("/admin/password", request.url).toString();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo });
  // An existing Supabase account keeps its password and only gains editor access.
  const userId = data?.user?.id ?? (error?.code === "email_exists" ? await findUserIdByEmail(supabase, email) : null);
  if (!userId) return Response.json({ error: error?.message ?? "No se pudo invitar al editor." }, { status: 400 });
  const { error: adminError } = await supabase.from("admins").upsert({ user_id: userId, email, role: "editor" }, { onConflict: "user_id", ignoreDuplicates: true });
  if (adminError) return Response.json({ error: adminError.message }, { status: 400 });
  return Response.json({ ok: true, admins: await listAdmins() });
}
