import Image from "next/image";
import { AtSign, Clock3, MapPin } from "lucide-react";
import { readMenu } from "@/lib/menu-store";
import { AuthRedirect } from "./auth-redirect";
import { MenuCatalog } from "./menu-catalog";
export const dynamic = "force-dynamic";

export default async function Home() {
  const menu = await readMenu();
  return (
    <main className="site-shell min-h-screen text-[var(--ink)]">
      <header className="relative overflow-hidden bg-[var(--pink)] px-5 pb-8 pt-5 text-white sm:px-10 sm:pb-12">
        <div className="stripe absolute inset-x-0 top-0 h-4 opacity-35" />
        <div className="mx-auto flex max-w-6xl items-start gap-4 pt-5">
          <div className="brand-mark"><strong>{menu.business.name}</strong><span>pastelería</span></div>
        </div>
        <div className="mx-auto mt-8 grid max-w-6xl items-end gap-8 md:grid-cols-[1fr_0.86fr]">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white/80">Cofico · Córdoba</p>
            <h1 className="font-display max-w-3xl text-5xl leading-[0.95] sm:text-7xl">{menu.business.tagline}</h1>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold">
              <span className="info-pill"><MapPin size={17} />{menu.business.address}</span>
              <span className="info-pill"><Clock3 size={17} />{menu.business.hours}</span>
            </div>
          </div>
          <div className="hero-photo"><Image src="/images/catu-1.webp" alt="Torta artesanal de Catú con frutos rojos" fill priority sizes="(max-width: 768px) 100vw, 45vw" /></div>
        </div>
      </header>
      <AuthRedirect />
      <MenuCatalog categories={menu.categories} />
      <footer className="bg-[var(--green)] px-5 py-10 text-[#283116] sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="brand-mark brand-footer"><strong>{menu.business.name}</strong><span>pastelería</span></div><p className="mt-4 max-w-md font-semibold">Hecho con cariño, para que siempre tengas algo dulce cerca.</p></div>
          <a className="instagram-link" href={`https://www.instagram.com/${menu.business.instagram.replace(/^@/, "")}/`} target="_blank" rel="noreferrer"><AtSign size={20} /> @{menu.business.instagram.replace(/^@/, "")}</a>
        </div>
      </footer>
    </main>
  );
}
