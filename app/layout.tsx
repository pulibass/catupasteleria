import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catú Pastelería · Carta",
  description: "Carta digital de Catú Pastelería en Cofico, Córdoba.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
