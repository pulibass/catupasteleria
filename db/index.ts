import { env } from "cloudflare:workers";

export function getD1() {
  if (!env.DB) throw new Error("La base de datos no está disponible.");
  return env.DB;
}

export function getR2() {
  if (!env.BUCKET) throw new Error("El almacenamiento de imágenes no está disponible.");
  return env.BUCKET;
}
