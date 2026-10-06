import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export async function POST(request: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) return Response.json({ error: "Iniciá sesión para subir imágenes." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Elegí una imagen." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return Response.json({ error: "Usá una imagen JPG, PNG o WebP." }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return Response.json({ error: "La imagen no puede superar 6 MB." }, { status: 400 });
  const path = `products/product-${crypto.randomUUID()}.${extension}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
