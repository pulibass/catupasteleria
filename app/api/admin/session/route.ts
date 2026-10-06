import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { listAdmins } from "@/lib/menu-store";

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) return Response.json({ error: "Sesión requerida" }, { status: 401 });
  return Response.json({ user: { email: user.email }, role: user.role, admins: user.role === "owner" ? await listAdmins() : [] });
}
