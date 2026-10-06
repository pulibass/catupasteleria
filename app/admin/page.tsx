import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { requireAuthenticatedAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { AdminEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAuthenticatedAdmin();
  return <main className="admin-shell">
    <header className="admin-topbar">
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catú</p><h1 className="text-xl font-black">Editar carta</h1></div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline"><Link href="/"><ArrowLeft /> Ver carta</Link></Button>
        <Button asChild variant="ghost"><a href="/api/auth/logout"><LogOut /> Salir</a></Button>
      </div>
    </header>
    <AdminEditor signedInEmail={user.email} />
  </main>;
}
