import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureFirstOwner, listAdmins } from "@/lib/menu-store";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sesión requerida" }, { status: 401 });
  const admin = await ensureFirstOwner(user.email);
  if (!admin) return Response.json({ error: "Tu cuenta no está autorizada para editar." }, { status: 403 });
  return Response.json({ user: { email: user.email, name: user.displayName }, role: admin.role, admins: admin.role === "owner" ? await listAdmins() : [] });
}
