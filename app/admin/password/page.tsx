"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";

export default function PasswordPage() {
  const [ready, setReady] = useState(false); const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);

  useEffect(() => {
    const start = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) { setReady(true); return; }
      const supabase = createClient();
      // The default Supabase invitation link returns the session in the URL fragment.
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token"); const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState(null, "", window.location.pathname);
      }
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null); setReady(true);
    };
    void start();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("Usá al menos 8 caracteres."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    window.location.href = "/admin";
  };

  return <main className="admin-shell grid min-h-screen place-items-center p-5"><section className="admin-card w-full max-w-md">
    <div className="mb-6 flex items-center gap-3"><span className="rounded-full bg-accent p-3 text-primary"><KeyRound /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-primary">Catú</p><h1 className="text-2xl font-black">Crear contraseña</h1></div></div>
    {!ready ? <div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Verificando invitación…</div>
      : !email ? <div className="status-message status-error">El enlace venció o ya fue usado. Pedile al propietario una nueva invitación.</div>
      : <form className="space-y-4" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">Cuenta: {email}</p>
        <label className="field-label">Nueva contraseña<Input type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" /></label>
        <label className="field-label">Repetir contraseña<Input type="password" required minLength={8} value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" /></label>
        {error && <div className="status-message status-error">{error}</div>}
        <Button className="w-full" type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <KeyRound />} Guardar y entrar</Button>
      </form>}
  </section></main>;
}
