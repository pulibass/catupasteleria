import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getAdmin } from "@/lib/menu-store";
import { isMenuData } from "@/lib/menu-data";
import { readMenu, saveMenu } from "@/lib/menu-store";

export async function GET() { return Response.json({ menu: await readMenu() }); }

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Iniciá sesión para editar." }, { status: 401 });
  const admin = await getAdmin(user.email);
  if (!admin) return Response.json({ error: "Tu cuenta no está autorizada." }, { status: 403 });
  const payload: unknown = await request.json();
  if (!isMenuData(payload)) return Response.json({ error: "Los datos de la carta no son válidos." }, { status: 400 });
  const updatedAt = await saveMenu(payload, user.email);
  return Response.json({ ok: true, updatedAt });
}
