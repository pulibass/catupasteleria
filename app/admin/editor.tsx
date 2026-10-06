"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, FolderPlus, ImagePlus, Loader2, Plus, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MenuData } from "@/lib/menu-data";

type Session = { role: "owner" | "editor"; admins: { email: string; role: string }[] };
type ModelTool = { name: string; title?: string; description: string; inputSchema: object; annotations?: object; execute: (input: unknown) => unknown | Promise<unknown> };
declare global { interface Document { modelContext?: { registerTool: (tool: ModelTool, options?: { signal?: AbortSignal }) => void | Promise<void> } } }

export function AdminEditor({ signedInEmail }: { signedInEmail: string }) {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [teamEmail, setTeamEmail] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ categoryId: "cafeteria", name: "", description: "", price: "" });
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", note: "", tone: "pink" as "pink" | "green" });

  const load = useCallback(async () => {
    try {
      const [menuResponse, sessionResponse] = await Promise.all([fetch("/api/menu"), fetch("/api/admin/session")]);
      const menuJson = await menuResponse.json() as { menu: MenuData };
      const sessionJson = await sessionResponse.json() as Session & { error?: string };
      if (!sessionResponse.ok) throw new Error(sessionJson.error ?? "No pudimos abrir el panel.");
      setMenu(menuJson.menu); setSession(sessionJson);
    } catch (error) { setStatus({ type: "error", text: error instanceof Error ? error.message : "No pudimos cargar la carta." }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (nextMenu?: MenuData) => {
    const content = nextMenu ?? menu;
    if (!content) return;
    setSaving(true); setStatus(null);
    try {
      const response = await fetch("/api/menu", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
      const json = await response.json() as { error?: string };
      if (!response.ok) throw new Error(json.error ?? "No se pudieron guardar los cambios.");
      if (nextMenu) setMenu(nextMenu);
      setStatus({ type: "ok", text: "Cambios publicados en la carta." });
    } catch (error) { setStatus({ type: "error", text: error instanceof Error ? error.message : "No se pudieron guardar los cambios." }); }
    finally { setSaving(false); }
  }, [menu]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool || !menu) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool({
        name: "read_catu_menu", title: "Leer carta de Catú", description: "Devuelve la información y los precios visibles en la carta de Catú.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: () => menu,
      }, { signal: lifecycle.signal });
      await context.registerTool({
        name: "update_catu_prices", title: "Actualizar precios de Catú", description: "Actualiza varios precios de la carta usando el identificador de cada producto.",
        inputSchema: { type: "object", properties: { prices: { type: "object", additionalProperties: { type: "number", minimum: 0 } } }, required: ["prices"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const prices = (input as { prices?: Record<string, number> })?.prices;
          if (!prices || typeof prices !== "object") throw new Error("Se necesita un mapa de precios.");
          const next = structuredClone(menu);
          let changed = 0;
          for (const category of next.categories) for (const entry of category.items) if (typeof prices[entry.id] === "number") { entry.price = Math.round(prices[entry.id]); changed += 1; }
          if (!changed) throw new Error("Ningún producto coincidió con los identificadores enviados.");
          await save(next); return { updated: changed };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [menu, save]);

  const setBusiness = (field: keyof MenuData["business"], value: string) => setMenu(current => current ? { ...current, business: { ...current.business, [field]: value } } : current);
  const setItem = (categoryIndex: number, itemIndex: number, field: "name" | "description" | "price", value: string) => setMenu(current => {
    if (!current) return current;
    const next = structuredClone(current);
    const entry = next.categories[categoryIndex].items[itemIndex];
    if (field === "price") entry.price = Math.max(0, Number(value) || 0); else entry[field] = value;
    return next;
  });

  const uploadPhoto = async (file: File) => {
    const form = new FormData(); form.append("image", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const json = await response.json() as { url?: string; error?: string };
    if (!response.ok || !json.url) throw new Error(json.error ?? "No se pudo subir la imagen.");
    return json.url;
  };

  const setItemPhoto = async (categoryIndex: number, itemIndex: number, file?: File) => {
    if (!file || !menu) return;
    const entryId = menu.categories[categoryIndex].items[itemIndex].id;
    setUploadingId(entryId); setStatus(null);
    try {
      const imageUrl = await uploadPhoto(file);
      setMenu(current => {
        if (!current) return current;
        const next = structuredClone(current); const entry = next.categories[categoryIndex].items[itemIndex];
        entry.imageUrl = imageUrl; delete entry.imageKey; return next;
      });
      setStatus({ type: "ok", text: "Foto cargada. Guardá los cambios para publicarla en la carta." });
    } catch (error) { setStatus({ type: "error", text: error instanceof Error ? error.message : "No se pudo subir la foto." }); }
    finally { setUploadingId(null); }
  };

  const addProduct = async () => {
    if (!menu) return;
    if (!newProduct.name.trim() || !Number(newProduct.price)) { setStatus({ type: "error", text: "Completá el nombre y un precio mayor a cero." }); return; }
    setSaving(true); setStatus(null);
    try {
      const imageUrl = newPhoto ? await uploadPhoto(newPhoto) : undefined;
      const next = structuredClone(menu); const category = next.categories.find(entry => entry.id === newProduct.categoryId);
      if (!category) throw new Error("Elegí una categoría válida.");
      category.items.push({ id: `${newProduct.categoryId}-${crypto.randomUUID()}`, name: newProduct.name.trim(), description: newProduct.description.trim() || undefined, price: Math.round(Number(newProduct.price)), ...(imageUrl ? { imageUrl } : {}) });
      await save(next); setNewProduct(current => ({ ...current, name: "", description: "", price: "" })); setNewPhoto(null);
    } catch (error) { setStatus({ type: "error", text: error instanceof Error ? error.message : "No se pudo crear el producto." }); }
    finally { setSaving(false); }
  };

  const addCategory = async () => {
    if (!menu) return;
    const name = newCategory.name.trim();
    if (!name) { setStatus({ type: "error", text: "Escribí el nombre de la nueva categoría." }); return; }
    const baseId = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "categoria";
    const existingIds = new Set(menu.categories.map(category => category.id));
    let id = baseId;
    let suffix = 2;
    while (existingIds.has(id)) id = `${baseId}-${suffix++}`;
    const next = structuredClone(menu);
    next.categories.push({ id, name, tone: newCategory.tone, note: newCategory.note.trim() || undefined, items: [] });
    await save(next);
    setNewProduct(current => ({ ...current, categoryId: id }));
    setNewCategory({ name: "", note: "", tone: "pink" });
  };

  const addEditor = async () => {
    setStatus(null);
    try {
      const response = await fetch("/api/admin/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: teamEmail }) });
      const json = await response.json() as { error?: string; admins?: Session["admins"] };
      if (!response.ok) throw new Error(json.error ?? "No se pudo sumar el editor.");
      setSession(current => current ? { ...current, admins: json.admins ?? current.admins } : current); setTeamEmail("");
      setStatus({ type: "ok", text: "Invitación enviada. El empleado recibirá un correo para crear su contraseña." });
    } catch (error) { setStatus({ type: "error", text: error instanceof Error ? error.message : "No se pudo sumar el editor." }); }
  };

  if (loading) return <div className="admin-content flex items-center gap-3"><Loader2 className="animate-spin" /> Cargando carta…</div>;
  if (!menu || !session) return <div className="admin-content"><div className="status-message status-error">{status?.text ?? "No se pudo abrir el panel."}</div></div>;

  return <div className="admin-content">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm text-muted-foreground">Sesión: {signedInEmail}</p><p className="font-bold">Los cambios aparecen en la carta al guardar.</p></div>
      <Button onClick={() => void save()} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />} Guardar cambios</Button>
    </div>
    {status && <div className={`status-message mb-5 ${status.type === "ok" ? "status-ok" : "status-error"}`}>{status.type === "ok" && <Check className="mr-2 inline size-4" />}{status.text}</div>}
    <Tabs defaultValue="menu">
      <TabsList className="mb-5 h-auto flex-wrap"><TabsTrigger value="menu">Carta y precios</TabsTrigger><TabsTrigger value="new">Nuevo producto</TabsTrigger><TabsTrigger value="category">Nueva categoría</TabsTrigger><TabsTrigger value="business">Datos del local</TabsTrigger>{session.role === "owner" && <TabsTrigger value="team">Equipo</TabsTrigger>}</TabsList>
      <TabsContent value="menu" className="space-y-4">
        {menu.categories.map((category, categoryIndex) => <section key={category.id} className="editor-category">
          <h2 className="mb-2 text-xl font-black">{category.name}</h2>
          {category.items.map((entry, itemIndex) => <div key={entry.id} className="editor-item">
            <div className="space-y-2"><label className="field-label">Producto<Input value={entry.name} onChange={event => setItem(categoryIndex, itemIndex, "name", event.target.value)} /></label><label className="field-label">Descripción<Input value={entry.description ?? ""} placeholder="Opcional" onChange={event => setItem(categoryIndex, itemIndex, "description", event.target.value)} /></label></div>
            <div className="space-y-3"><label className="field-label">Precio en pesos<Input type="number" min="0" step="100" value={entry.price} onChange={event => setItem(categoryIndex, itemIndex, "price", event.target.value)} /></label><label className="photo-control"><ImagePlus size={16} />{uploadingId === entry.id ? "Subiendo…" : entry.imageKey || entry.imageUrl ? "Cambiar foto" : "Agregar foto"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingId === entry.id} onChange={event => void setItemPhoto(categoryIndex, itemIndex, event.target.files?.[0])} /></label></div>
          </div>)}
        </section>)}
      </TabsContent>
      <TabsContent value="new"><section className="admin-card">
        <div className="flex items-center gap-3"><span className="rounded-full bg-accent p-2 text-primary"><Plus /></span><div><h2 className="text-xl font-black">Agregar producto</h2><p className="text-sm text-muted-foreground">Elegí dónde aparece y publicalo con foto.</p></div></div>
        <div className="admin-grid mt-6">
          <label className="field-label">Categoría<Select value={newProduct.categoryId} onValueChange={value => setNewProduct(current => ({ ...current, categoryId: value }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{menu.categories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></label>
          <label className="field-label">Nombre<Input value={newProduct.name} onChange={event => setNewProduct(current => ({ ...current, name: event.target.value }))} placeholder="Ej. Jugo verde" /></label>
          <label className="field-label">Descripción<Input value={newProduct.description} onChange={event => setNewProduct(current => ({ ...current, description: event.target.value }))} placeholder="Ingredientes o detalle" /></label>
          <label className="field-label">Precio en pesos<Input type="number" min="0" step="100" value={newProduct.price} onChange={event => setNewProduct(current => ({ ...current, price: event.target.value }))} placeholder="6500" /></label>
          <label className="field-label">Foto del producto<Input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setNewPhoto(event.target.files?.[0] ?? null)} /></label>
        </div>
        <Button className="mt-6" onClick={() => void addProduct()} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Plus />} Agregar a la carta</Button>
      </section></TabsContent>
      <TabsContent value="category"><section className="admin-card">
        <div className="flex items-center gap-3"><span className="rounded-full bg-accent p-2 text-primary"><FolderPlus /></span><div><h2 className="text-xl font-black">Agregar categoría</h2><p className="text-sm text-muted-foreground">Creá una sección nueva para jugos, sándwiches o cualquier grupo de productos.</p></div></div>
        <div className="admin-grid mt-6">
          <label className="field-label">Nombre<Input value={newCategory.name} onChange={event => setNewCategory(current => ({ ...current, name: event.target.value }))} placeholder="Ej. Jugos naturales" /></label>
          <label className="field-label">Color<Select value={newCategory.tone} onValueChange={(value: "pink" | "green") => setNewCategory(current => ({ ...current, tone: value }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pink">Rosa Catú</SelectItem><SelectItem value="green">Verde Catú</SelectItem></SelectContent></Select></label>
          <label className="field-label md:col-span-2">Texto opcional<Input value={newCategory.note} onChange={event => setNewCategory(current => ({ ...current, note: event.target.value }))} placeholder="Ej. Preparados en el momento" /></label>
        </div>
        <Button className="mt-6" onClick={() => void addCategory()} disabled={saving || !newCategory.name.trim()}>{saving ? <Loader2 className="animate-spin" /> : <FolderPlus />} Crear categoría</Button>
      </section></TabsContent>
      <TabsContent value="business"><section className="admin-card"><div className="admin-grid">
        <label className="field-label">Nombre<Input value={menu.business.name} onChange={e => setBusiness("name", e.target.value)} /></label>
        <label className="field-label">Frase<Input value={menu.business.tagline} onChange={e => setBusiness("tagline", e.target.value)} /></label>
        <label className="field-label">Dirección<Input value={menu.business.address} onChange={e => setBusiness("address", e.target.value)} /></label>
        <label className="field-label">Horarios<Input value={menu.business.hours} onChange={e => setBusiness("hours", e.target.value)} /></label>
        <label className="field-label">Instagram<Input value={menu.business.instagram} onChange={e => setBusiness("instagram", e.target.value.replace(/^@/, ""))} /></label>
      </div></section></TabsContent>
      {session.role === "owner" && <TabsContent value="team"><section className="admin-card">
        <h2 className="text-xl font-black">Personas autorizadas</h2><p className="mt-1 text-sm text-muted-foreground">Cada empleado recibe una invitación de Supabase para crear su propia contraseña.</p>
        <div className="mt-5 flex gap-2"><Input type="email" placeholder="empleado@ejemplo.com" value={teamEmail} onChange={e => setTeamEmail(e.target.value)} /><Button onClick={() => void addEditor()} disabled={!teamEmail}><UserPlus /> Sumar</Button></div>
        <div className="mt-5 divide-y">{session.admins.map(admin => <div key={admin.email} className="flex items-center justify-between gap-3 py-3"><span className="font-semibold">{admin.email}</span><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{admin.role === "owner" ? "Propietario" : "Editor"}</span></div>)}</div>
      </section></TabsContent>}
    </Tabs>
  </div>;
}
