-- Catú Pastelería: carta, administradores e imágenes.
-- Las escrituras se hacen desde el servidor de Next.js con SUPABASE_SERVICE_ROLE_KEY,
-- que omite RLS. anon/authenticated solo pueden leer la carta pública.

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  role text not null check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- Solo puede existir un propietario.
create unique index if not exists admins_single_owner on public.admins (role) where role = 'owner';

alter table public.site_content enable row level security;
alter table public.admins enable row level security;

revoke all on table public.site_content from anon, authenticated;
revoke all on table public.admins from anon, authenticated;
grant select on table public.site_content to anon, authenticated;

drop policy if exists "Public can read menu" on public.site_content;
create policy "Public can read menu"
on public.site_content for select
to anon, authenticated
using (id = 'menu');

-- Bucket público para fotos de productos: JPG, PNG y WebP de hasta 6 MB.
-- Sin políticas de escritura en storage.objects: solo el servidor (service role) sube archivos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 6291456, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
