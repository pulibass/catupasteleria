import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getR2 } from "@/db";
import { getAdmin } from "@/lib/menu-store";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Iniciá sesión para subir imágenes." }, { status: 401 });
  if (!await getAdmin(user.email)) return Response.json({ error: "Tu cuenta no está autorizada." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Elegí una imagen." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return Response.json({ error: "Usá una imagen JPG, PNG o WebP." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "La imagen no puede superar 8 MB." }, { status: 400 });
  const key = `product-${crypto.randomUUID()}.${extension}`;
  await getR2().put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  return Response.json({ key, url: `/api/images/${encodeURIComponent(key)}` });
}
