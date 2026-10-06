"use client";

import { useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MenuCategory, MenuItem } from "@/lib/menu-data";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const imageFor = (entry: MenuItem) => entry.imageUrl ?? (entry.imageKey?.startsWith("http") ? entry.imageKey : null);

export function MenuCatalog({ categories }: { categories: MenuCategory[] }) {
  const [selected, setSelected] = useState<MenuItem | null>(null);
  return <>
    <nav className="sticky top-0 z-20 overflow-x-auto border-b border-black/5 bg-[var(--cream)]/95 px-4 py-3 backdrop-blur sm:px-8" aria-label="Categorías">
      <div className="mx-auto flex max-w-6xl gap-2">{categories.map(category => <a key={category.id} href={`#${category.id}`} className="category-chip">{category.name}</a>)}</div>
    </nav>
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-16">
      <div className="menu-grid">
        {categories.map((category, index) => {
          const featured = category.items.find(entry => imageFor(entry));
          return <section id={category.id} key={category.id} className={`menu-card ${category.tone === "pink" ? "menu-card-pink" : "menu-card-green"}`}>
          <div className="section-heading"><span>{String(index + 1).padStart(2, "0")}</span><h2>{category.name}</h2><i aria-hidden>♡</i></div>
          {category.note && <p className="category-note">{category.note}</p>}
          <div className="mt-5 space-y-2">
            {category.items.map(entry => {
              const image = imageFor(entry);
              return <button type="button" key={entry.id} className="menu-item product-row" onClick={() => setSelected(entry)}>
                <div className="min-w-0 text-left"><h3>{entry.name}</h3>{entry.description && <p>{entry.description}</p>}</div>
                <span className="product-leader" aria-hidden />
                <span className="product-price">{image && <Camera size={14} aria-label="Tiene foto" />}{money.format(entry.price)}</span>
              </button>;
            })}
          </div>
          <div className="category-signoff"><span>♡</span> preparado con cariño</div>
          {featured && <button type="button" className="category-photo" onClick={() => setSelected(featured)} aria-label={`Ver foto de ${featured.name}`}><img src={imageFor(featured)!} alt="" /></button>}
        </section>})}
      </div>
    </section>
    <Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}>
      {selected && <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-xl">
        {imageFor(selected) ? <div className="product-photo"><img src={imageFor(selected)!} alt={selected.name} /></div> : <div className="product-photo product-photo-empty"><Sparkles size={38} /><span>Foto próximamente</span></div>}
        <DialogHeader className="px-6 pb-6 pt-2 text-left">
          <div className="flex items-start justify-between gap-4 pr-6"><DialogTitle className="font-display text-3xl">{selected.name}</DialogTitle><strong className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-lg">{money.format(selected.price)}</strong></div>
          <DialogDescription className="text-base leading-relaxed">{selected.description || "Una delicia preparada por Catú."}</DialogDescription>
        </DialogHeader>
      </DialogContent>}
    </Dialog>
  </>;
}
