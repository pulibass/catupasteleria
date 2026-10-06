"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, LockKeyhole, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false); const [sent, setSent] = useState(false);
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
  const requestReset = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) throw new Error("La recuperación de contraseña no está configurada.");
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/password` });
      // Only surface errors that do not depend on whether the account exists (rate limits, invalid address, network).
      if (resetError && (resetError.status === 429 || resetError.code === "email_address_invalid" || !resetError.status)) {
        throw new Error(authErrorMessage(resetError, "No pudimos enviar el correo. Volvé a intentar."));
      }
      setSent(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos enviar el correo. Volvé a intentar."); }
    finally { setLoading(false); }
  };
  const switchMode = (next: boolean) => { setForgot(next); setSent(false); setError(""); };
  return <main className="admin-shell grid min-h-screen place-items-center p-5"><section className="admin-card w-full max-w-md">
    <div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-accent p-3 text-primary"><LockKeyhole /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catú</p><h1 className="text-2xl font-black">{forgot ? "Recuperar contraseña" : "Editar carta"}</h1></div></div>
    {!forgot ? <form className="space-y-4" onSubmit={submit}>
      <label className="field-label">Correo autorizado<Input type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" /></label>
      <label className="field-label">Contraseña<Input type="password" required value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></label>
      {error && <div className="status-message status-error">{error}</div>}
      <Button className="w-full" type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Ingresar</Button>
      <button type="button" className="w-full text-center text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={() => switchMode(true)}>Olvidé mi contraseña</button>
    </form>
    : sent ? <div className="space-y-4">
      <div className="status-message status-ok flex items-start gap-2" role="status"><MailCheck className="mt-0.5 shrink-0" size={18} /><span>Si <strong>{email.trim()}</strong> corresponde a una cuenta autorizada, te enviamos un correo con un enlace para crear una nueva contraseña. Revisá también la carpeta de spam.</span></div>
      <Button className="w-full" variant="outline" onClick={() => switchMode(false)}>Volver a iniciar sesión</Button>
    </div>
    : <form className="space-y-4" onSubmit={requestReset}>
      <p className="text-sm text-muted-foreground">Ingresá tu correo y te enviaremos un enlace para elegir una nueva contraseña. Abrilo en este mismo navegador.</p>
      <label className="field-label">Correo autorizado<Input type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" /></label>
      {error && <div className="status-message status-error">{error}</div>}
      <Button className="w-full" type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <MailCheck />} {loading ? "Enviando…" : "Enviar enlace"}</Button>
      <button type="button" className="w-full text-center text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={() => switchMode(false)}>Volver a iniciar sesión</button>
    </form>}
    <Button className="mt-3 w-full" variant="ghost" asChild><Link href="/">Volver a la carta</Link></Button>
  </section></main>;
}
