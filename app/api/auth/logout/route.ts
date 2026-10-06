import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return Response.redirect(new URL("/", request.url), 303);
}
