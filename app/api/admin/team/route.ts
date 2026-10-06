import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getD1 } from "@/db";
import { getAdmin, listAdmins } from "@/lib/menu-store";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sesión requerida" }, { status: 401 });
  const current = await getAdmin(user.email);
  if (current?.role !== "owner") return Response.json({ error: "Solo el propietario puede sumar editores." }, { status: 403 });
  const body = await request.json() as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Ingresá un email válido." }, { status: 400 });
  await getD1().prepare("INSERT OR IGNORE INTO admins (email, role, created_at) VALUES (?, 'editor', ?)").bind(email, new Date().toISOString()).run();
  return Response.json({ ok: true, admins: await listAdmins() });
}
