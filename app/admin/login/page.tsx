"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const json = await response.json() as { error?: string };
      if (!response.ok) throw new Error(json.error ?? "No pudimos iniciar sesión.");
      window.location.href = "/admin";
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos iniciar sesión."); }
    finally { setLoading(false); }
  };
  return <main className="admin-shell grid min-h-screen place-items-center p-5"><section className="admin-card w-full max-w-md">
    <div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-accent p-3 text-primary"><LockKeyhole /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catú</p><h1 className="text-2xl font-black">Editar carta</h1></div></div>
    <form className="space-y-4" onSubmit={submit}>
      <label className="field-label">Correo autorizado<Input type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" /></label>
      <label className="field-label">Contraseña<Input type="password" required value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></label>
      {error && <div className="status-message status-error">{error}</div>}
      <Button className="w-full" type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Ingresar</Button>
    </form>
    <Button className="mt-3 w-full" variant="ghost" asChild><Link href="/">Volver a la carta</Link></Button>
  </section></main>;
}
