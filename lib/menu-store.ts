import { getD1 } from "@/db";
import { defaultMenu, isMenuData, type MenuData } from "@/lib/menu-data";

export async function readMenu(): Promise<MenuData> {
  try {
    const row = await getD1().prepare("SELECT data FROM menu_content WHERE id = ?").bind(1).first<{ data: string }>();
    if (!row?.data) return defaultMenu;
    const parsed: unknown = JSON.parse(row.data);
    return isMenuData(parsed) ? parsed : defaultMenu;
  } catch { return defaultMenu; }
}

export async function saveMenu(menu: MenuData, email: string) {
  const now = new Date().toISOString();
  await getD1().prepare(`INSERT INTO menu_content (id, data, updated_at, updated_by) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, updated_by = excluded.updated_by`).bind(1, JSON.stringify(menu), now, email).run();
  return now;
}

export async function getAdmin(email: string) {
  return getD1().prepare("SELECT email, role FROM admins WHERE lower(email) = lower(?)").bind(email).first<{ email: string; role: "owner" | "editor" }>();
}

export async function ensureFirstOwner(email: string) {
  const db = getD1();
  const count = await db.prepare("SELECT COUNT(*) AS count FROM admins").first<{ count: number }>();
  if (Number(count?.count ?? 0) === 0) await db.prepare("INSERT OR IGNORE INTO admins (email, role, created_at) VALUES (?, 'owner', ?)").bind(email.toLowerCase(), new Date().toISOString()).run();
  return getAdmin(email);
}

export async function listAdmins() {
  const result = await getD1().prepare("SELECT email, role, created_at AS createdAt FROM admins ORDER BY role DESC, email").all<{ email: string; role: "owner" | "editor"; createdAt: string }>();
  return result.results;
}
