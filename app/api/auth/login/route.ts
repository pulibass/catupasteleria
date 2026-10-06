import { createClient } from "@/lib/supabase/server";
import { ensureOwner } from "@/lib/menu-store";

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ error: "Falta configurar Supabase." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: body.email?.trim() ?? "", password: body.password ?? "" });
  if (error || !data.user?.email) return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  const admin = await ensureOwner(data.user.id, data.user.email);
  if (!admin) {
    await supabase.auth.signOut();
    return Response.json({ error: "Tu cuenta no está autorizada para editar la carta." }, { status: 403 });
  }
  return Response.json({ ok: true });
}
