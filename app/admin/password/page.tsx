"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/browser";

export default function PasswordPage() {
  const [ready, setReady] = useState(false); const [email, setEmail] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false); const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    const start = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) { setReady(true); return; }
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const param = (name: string) => hash.get(name) ?? url.searchParams.get(name);
      if (param("type") === "recovery") setRecovery(true);
      const urlErrorCode = param("error_code") ?? param("error");

      // Creating the client starts its initialization, which exchanges a PKCE `?code=` for a session.
      const supabase = createClient();
      unsubscribe = supabase.auth.onAuthStateChange(event => { if (event === "PASSWORD_RECOVERY") setRecovery(true); }).data.subscription.unsubscribe;
      const { error: initError } = await supabase.auth.initialize();

      // Implicit-flow links (default invitation / recovery templates) return the session in the URL fragment,
      // which the PKCE browser client does not pick up by itself.
      const accessToken = hash.get("access_token"); const refreshToken = hash.get("refresh_token");
      let sessionError = accessToken ? null : url.searchParams.get("code") ? initError : null;
      if (accessToken && refreshToken) ({ error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
      if (url.search || url.hash) window.history.replaceState(null, "", window.location.pathname);

      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (!data.user) {
        if (urlErrorCode) setLinkError(authErrorMessage({ code: urlErrorCode }, "El enlace no es válido o ya fue usado. Pedí uno nuevo."));
        else if (sessionError) setLinkError(authErrorMessage(sessionError, "No pudimos validar el enlace. Pedí uno nuevo."));
        // A PKCE code without its verifier means the link was opened in a different browser.
        else if (url.searchParams.get("code")) setLinkError(authErrorMessage({ code: "flow_state_not_found" }, ""));
      }
      setReady(true);
    };
    void start();
    return () => unsubscribe();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("Usá al menos 8 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setSaving(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) { setError(authErrorMessage(updateError, "No pudimos guardar la contraseña. Volvé a intentar.")); setSaving(false); return; }
      window.location.href = "/admin";
    } catch { setError("No pudimos conectarnos. Revisá tu conexión y volvé a intentar."); setSaving(false); }
  };

  return <main className="admin-shell grid min-h-screen place-items-center p-5"><section className="admin-card w-full max-w-md">
    <div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-accent p-3 text-primary"><KeyRound /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catú</p><h1 className="text-2xl font-black">{recovery ? "Restablecer contraseña" : "Crear contraseña"}</h1></div></div>
    {!ready ? <div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Verificando enlace…</div>
      : !email ? <div className="space-y-4">
        <div className="status-message status-error">{linkError || "El enlace venció o ya fue usado. Pedí uno nuevo desde “Olvidé mi contraseña” o pedile al propietario una nueva invitación."}</div>
        <Button className="w-full" variant="ghost" asChild><Link href="/admin/login">Ir al inicio de sesión</Link></Button>
      </div>
      : <form className="space-y-4" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">Cuenta: {email}</p>
        <label className="field-label">Nueva contraseña<Input type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" /></label>
        <label className="field-label">Repetir contraseña<Input type="password" required minLength={8} value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" /></label>
        {error && <div className="status-message status-error">{error}</div>}
        <Button className="w-full" type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <KeyRound />} {saving ? "Guardando…" : "Guardar y entrar"}</Button>
      </form>}
  </section></main>;
}
