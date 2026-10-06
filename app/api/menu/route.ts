import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { isMenuData } from "@/lib/menu-data";
import { readMenu, saveMenu } from "@/lib/menu-store";

export async function GET() { return Response.json({ menu: await readMenu() }); }

export async function PUT(request: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) return Response.json({ error: "Iniciá sesión para editar." }, { status: 401 });
  const payload: unknown = await request.json();
  if (!isMenuData(payload)) return Response.json({ error: "Los datos de la carta no son válidos." }, { status: 400 });
  const updatedAt = await saveMenu(payload, user.userId);
  return Response.json({ ok: true, updatedAt });
}
